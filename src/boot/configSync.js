/**
 * Google Sheets Config Sync Service
 * Fetches configuration from Google Sheets CSV exports
 */

/**
 * Parse CSV text into array of objects
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const data = []

  for (let i = 1; i < lines.length; i++) {
    const values = []
    let currentValue = ''
    let insideQuotes = false

    // Parse CSV properly handling quoted values with commas
    for (let char of lines[i]) {
      if (char === '"') {
        insideQuotes = !insideQuotes
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim().replace(/"/g, ''))
        currentValue = ''
      } else {
        currentValue += char
      }
    }
    values.push(currentValue.trim().replace(/"/g, ''))

    if (values.length === headers.length) {
      const obj = {}
      headers.forEach((header, index) => {
        obj[header] = values[index]
      })
      data.push(obj)
    }
  }

  return data
}



/**
 * Clean CORS proxy wrapper from URL if present
 */
function cleanUrl(url) {
  // Remove common CORS proxy wrappers
  if (url.includes('api.cors.lol')) {
    const match = url.match(/url=(.+)$/)
    if (match) {
      return decodeURIComponent(match[1])
    }
  }
  return url
}

/**
 * Fetch CSV from Google Sheets URL
 */
async function fetchCSV(url, retries = 3) {
  // Clean any CORS proxy wrapper
  const cleanedUrl = cleanUrl(url)
  console.log('Fetching CSV from:', cleanedUrl)

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(cleanedUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
          'Origin': window.location.origin
        },
        mode: 'cors',
        credentials: 'omit'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const csvText = await response.text()
      console.log('CSV fetched, length:', csvText.length, 'Preview:', csvText.substring(0, 200))
      const parsed = parseCSV(csvText)
      console.log('Parsed CSV rows:', parsed.length, 'Data:', parsed)
      return parsed
    } catch (error) {
      console.warn(`Fetch attempt ${attempt}/${retries} failed:`, error.message)

      if (attempt === retries) {
        console.error('All fetch attempts failed. Error:', error.message)
        throw new Error(`Failed to fetch after ${retries} attempts: ${error.message}`)
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 200 * attempt))
    }
  }
}

/**
 * Parse main config CSV and extract settings
 */
function parseMainConfig(data) {
  const config = {}

  data.forEach(row => {
    const setting = row.setting
    let value = row.value

    // Convert string values to appropriate types
    if (value === 'true') value = true
    else if (value === 'false') value = false
    else if (!isNaN(value) && value !== '') value = Number(value)

    config[setting] = value
  })

  console.log('Parsed main config:', config)
  return config
}

/**
 * Parse messages CSV
 */
function parseMessagesConfig(data) {
  return data.map(row => ({
    text: row.text || '',
    duration: Number(row.duration) || 10
  })).filter(msg => msg.text) // Filter out empty messages
}

/**
 * Parse images CSV
 */
function parseImagesConfig(data) {
  return data.map(row => ({
    url: row.url || '',
    duration: Number(row.duration) || 1
  })).filter(img => img.url) // Filter out empty urls
}

/**
 * Build Google Sheets CSV export URL from base spreadsheet URL
 */
function buildSheetUrl(baseUrl, gid) {
  // Extract spreadsheet ID from URL
  const match = baseUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (!match) {
    throw new Error('Invalid Google Sheets URL')
  }

  const spreadsheetId = match[1]
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`
}

/**
 * Main sync function
 * Fetches all configs from Google Sheets and returns parsed data
 * Validates all data before returning
 */
export async function syncConfig(sheetsUrl) {
  if (!sheetsUrl) {
    throw new Error('Google Sheets URL is required')
  }

  try {
    // Fetch main config data
    const mainConfigData = await fetchCSV(sheetsUrl)
    
    // Validate fetched data is not empty
    if (!mainConfigData || mainConfigData.length === 0) {
      throw new Error('Config sheet is empty - no data found')
    }

    const mainConfig = parseMainConfig(mainConfigData)

    // Validate main config has required fields
    if (!mainConfig || typeof mainConfig !== 'object' || Object.keys(mainConfig).length === 0) {
      throw new Error('Invalid config format - config is empty or malformed')
    }

    console.log('Main config loaded with', Object.keys(mainConfig).length, 'settings')

    // Get GIDs for slides and messages from main config
    const slideGid = mainConfig.slide_gid || mainConfig.slides_gid
    const msgGid = mainConfig.msg_gid || mainConfig.messages_gid

    let messagesConfig = null
    let imagesConfig = null

    // Fetch messages config if GID is provided
    if (msgGid !== undefined && msgGid !== '') {
      try {
        const msgUrl = buildSheetUrl(sheetsUrl, msgGid)
        const msgData = await fetchCSV(msgUrl)
        const parsed = parseMessagesConfig(msgData)

        // Validate we got valid message data
        if (parsed && parsed.length > 0) {
          messagesConfig = parsed
          console.log('✓ Messages config loaded:', parsed.length, 'messages')
        } else {
          console.warn('⚠️ Messages sheet is empty')
        }
      } catch (error) {
        console.warn('⚠️ Failed to fetch messages config:', error.message)
      }
    }

    // Fetch images config if GID is provided
    if (slideGid !== undefined && slideGid !== '') {
      try {
        const imgUrl = buildSheetUrl(sheetsUrl, slideGid)
        const imgData = await fetchCSV(imgUrl)
        const parsed = parseImagesConfig(imgData)

        // Validate we got valid image data
        if (parsed && parsed.length > 0) {
          imagesConfig = parsed
          console.log('✓ Images config loaded:', parsed.length, 'images')
        } else {
          console.warn('⚠️ Images sheet is empty')
        }
      } catch (error) {
        console.warn('⚠️ Failed to fetch images config:', error.message)
      }
    }

    const result = {
      mainConfig,
      messagesConfig,
      imagesConfig,
      timestamp: new Date().toISOString()
    }

    console.log('✅ Sync data validation passed', result)
    return result
  } catch (error) {
    console.error('Sync failed:', error)
    throw error
  }
}

/**
 * Apply synced config to localStorage and return settings object
 * Returns null if nothing changed or data is invalid
 */
export function applyConfig(syncedData) {
  // Validate syncedData structure
  if (!syncedData || typeof syncedData !== 'object') {
    throw new Error('Invalid sync data: data is empty or malformed')
  }

  const { mainConfig, messagesConfig, imagesConfig } = syncedData

  // Validate main config exists and is not empty
  if (!mainConfig || typeof mainConfig !== 'object' || Object.keys(mainConfig).length === 0) {
    throw new Error('Invalid sync data: main config is empty or malformed')
  }

  console.log('Validating sync data...', { mainConfig, messagesConfig, imagesConfig })

  const applied = {
    location: null,
    mainClockSize: null,
    prayerTimeFontSize: null,
    prayerNameFontSize: null,
    hijriOffset: null,
    enableScreenSaver: null,
    iqamahConfig: null,
    messages: null,
    images: null
  }

  console.log('Applying config from:', { mainConfig, messagesConfig, imagesConfig })

  let hasChanges = false

  // Apply main config settings
  if (mainConfig.location !== undefined) {
    const currentOffset = localStorage.getItem('offset')
    if (String(currentOffset) !== String(mainConfig.location)) {
      console.log('Setting location/offset changed from', currentOffset, 'to', mainConfig.location)
      localStorage.setItem('offset', mainConfig.location)
      applied.location = mainConfig.location
      hasChanges = true
    }
  }

  if (mainConfig.mainClockSize !== undefined) {
    const current = localStorage.getItem('mainClockSize')
    if (String(current) !== String(mainConfig.mainClockSize)) {
      console.log('mainClockSize changed from', current, 'to', mainConfig.mainClockSize)
      localStorage.setItem('mainClockSize', mainConfig.mainClockSize)
      applied.mainClockSize = mainConfig.mainClockSize
      hasChanges = true
    }
  }

  if (mainConfig.prayerTimeFontSize !== undefined) {
    const current = localStorage.getItem('prayerTimeFontSize')
    if (String(current) !== String(mainConfig.prayerTimeFontSize)) {
      console.log('prayerTimeFontSize changed from', current, 'to', mainConfig.prayerTimeFontSize)
      localStorage.setItem('prayerTimeFontSize', mainConfig.prayerTimeFontSize)
      applied.prayerTimeFontSize = mainConfig.prayerTimeFontSize
      hasChanges = true
    }
  }

  if (mainConfig.prayerNameFontSize !== undefined) {
    const current = localStorage.getItem('prayerNameFontSize')
    if (String(current) !== String(mainConfig.prayerNameFontSize)) {
      console.log('prayerNameFontSize changed from', current, 'to', mainConfig.prayerNameFontSize)
      localStorage.setItem('prayerNameFontSize', mainConfig.prayerNameFontSize)
      applied.prayerNameFontSize = mainConfig.prayerNameFontSize
      hasChanges = true
    }
  }

  if (mainConfig.hijriOffset !== undefined) {
    const current = localStorage.getItem('hijriOffset')
    if (String(current) !== String(mainConfig.hijriOffset)) {
      console.log('hijriOffset changed from', current, 'to', mainConfig.hijriOffset)
      localStorage.setItem('hijriOffset', mainConfig.hijriOffset)
      applied.hijriOffset = mainConfig.hijriOffset
      hasChanges = true
    }
  }

  if (mainConfig.enableScreenSaver !== undefined) {
    const current = JSON.parse(localStorage.getItem('enableScreenSaver') || 'false')
    if (current !== mainConfig.enableScreenSaver) {
      console.log('enableScreenSaver changed from', current, 'to', mainConfig.enableScreenSaver)
      localStorage.setItem('enableScreenSaver', JSON.stringify(mainConfig.enableScreenSaver))
      applied.enableScreenSaver = mainConfig.enableScreenSaver
      hasChanges = true
    }
  }

  // Apply iqamah config
  const iqamahConfig = {}
  if (mainConfig.fajrIqamah !== undefined) iqamahConfig.Fajr = mainConfig.fajrIqamah
  if (mainConfig.dhuhrIqamah !== undefined) iqamahConfig.Dhuhr = mainConfig.dhuhrIqamah
  if (mainConfig.asrIqamah !== undefined) iqamahConfig.Asr = mainConfig.asrIqamah
  if (mainConfig.maghribIqamah !== undefined) iqamahConfig.Maghrib = mainConfig.maghribIqamah
  if (mainConfig.ishaIqamah !== undefined) iqamahConfig.Isha = mainConfig.ishaIqamah

  if (Object.keys(iqamahConfig).length > 0) {
    const existingIqamah = JSON.parse(localStorage.getItem('iqamahConfig') || '{}')
    const mergedIqamah = { ...existingIqamah, ...iqamahConfig }
    const existingStr = JSON.stringify(existingIqamah)
    const newStr = JSON.stringify(mergedIqamah)

    if (existingStr !== newStr) {
      console.log('iqamahConfig changed from', existingIqamah, 'to', mergedIqamah)
      localStorage.setItem('iqamahConfig', JSON.stringify(mergedIqamah))
      applied.iqamahConfig = mergedIqamah
      hasChanges = true
    }
  }

  // Apply messages config
  if (messagesConfig && messagesConfig.length > 0) {
    const current = JSON.parse(localStorage.getItem('messages') || '[]')
    const currentStr = JSON.stringify(current)
    const newStr = JSON.stringify(messagesConfig)

    if (currentStr !== newStr) {
      console.log('messages changed. Old:', current, 'New:', messagesConfig)
      localStorage.setItem('messages', JSON.stringify(messagesConfig))
      applied.messages = messagesConfig
      hasChanges = true
    }
  }

  // Apply images config
  if (imagesConfig && imagesConfig.length > 0) {
    const current = JSON.parse(localStorage.getItem('images') || '[]')
    const currentStr = JSON.stringify(current)
    const newStr = JSON.stringify(imagesConfig)

    if (currentStr !== newStr) {
      console.log('images changed. Old:', current, 'New:', imagesConfig)
      localStorage.setItem('images', JSON.stringify(imagesConfig))
      applied.images = imagesConfig
      hasChanges = true
    }
  }

  // Save sync timestamp
  localStorage.setItem('lastSyncTime', new Date().toLocaleString())
  localStorage.setItem('lastSyncData', JSON.stringify(syncedData))

  console.log('Changes detected:', hasChanges, 'Applied:', applied)

  return { applied, hasChanges }
}
