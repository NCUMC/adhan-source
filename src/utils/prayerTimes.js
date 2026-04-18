import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan'

export const REFERENCE_TIME_ZONE = 'Asia/Taipei'
export const DEFAULT_LOCATION_VALUE = 2

export const LOCATION_OPTIONS = [
  { label: 'Taipei', value: 0, latitude: 25.033, longitude: 121.5654 },
  { label: 'Zhongli, Taoyuan', value: 2, latitude: 24.9651, longitude: 121.2242 },
  { label: 'Taichung (Central Taiwan)', value: 3, latitude: 24.1477, longitude: 120.6736 },
  { label: 'Kaohsiung (Southern Taiwan)', value: 5, latitude: 22.6273, longitude: 120.3014 }
]

const PRAYER_FIELDS = {
  Fajr: 'fajr',
  Sunrise: 'sunrise',
  Dhuhr: 'dhuhr',
  Asr: 'asr',
  Maghrib: 'maghrib',
  Isha: 'isha'
}

const NUMERIC_REFERENCE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: REFERENCE_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  weekday: 'long',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
})

const DISPLAY_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: REFERENCE_TIME_ZONE,
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

const DISPLAY_TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: REFERENCE_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
})

const pad = (value) => String(value).padStart(2, '0')

const parseFormatterParts = (formatter, date) => {
  return formatter.formatToParts(date).reduce((parts, part) => {
    if (part.type !== 'literal') {
      parts[part.type] = part.value
    }

    return parts
  }, {})
}

export const getLocationConfig = (locationValue = DEFAULT_LOCATION_VALUE) => {
  return LOCATION_OPTIONS.find((option) => option.value === Number(locationValue)) || LOCATION_OPTIONS[1]
}

export const getReferenceClockState = (date = new Date()) => {
  const parts = parseFormatterParts(NUMERIC_REFERENCE_FORMATTER, date)
  const year = Number(parts.year)
  const month = Number(parts.month)
  const day = Number(parts.day)
  const hour = Number(parts.hour)
  const minute = Number(parts.minute)
  const second = Number(parts.second)

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    weekday: parts.weekday,
    time: `${pad(hour)}:${pad(minute)}:${pad(second)}`,
    date: DISPLAY_DATE_FORMATTER.format(date),
    referenceDate: new Date(year, month - 1, day, hour, minute, second)
  }
}

export const shiftTimeString = (timeString, offsetMinutes) => {
  if (!timeString || timeString === '00:00') {
    return '00:00'
  }

  const [hours, minutes] = timeString.split(':').map(Number)
  let totalMinutes = hours * 60 + minutes + offsetMinutes

  if (totalMinutes >= 24 * 60) {
    totalMinutes -= 24 * 60
  }

  if (totalMinutes < 0) {
    totalMinutes += 24 * 60
  }

  return `${pad(Math.floor(totalMinutes / 60))}:${pad(totalMinutes % 60)}`
}

const formatPrayerTime = (value) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return '00:00'
  }

  const parts = parseFormatterParts(DISPLAY_TIME_FORMATTER, value)
  return `${parts.hour}:${parts.minute}`
}

export const calculatePrayerTimes = (date = new Date(), locationValue = DEFAULT_LOCATION_VALUE) => {
  const { year, month, day } = getReferenceClockState(date)
  const location = getLocationConfig(locationValue)
  const coordinates = new Coordinates(location.latitude, location.longitude)
  const params = CalculationMethod.MuslimWorldLeague()
  const prayerTimes = new PrayerTimes(coordinates, new Date(year, month - 1, day), params)

  return Object.entries(PRAYER_FIELDS).reduce((times, [label, field]) => {
    const baseTime = formatPrayerTime(prayerTimes[field])
    const offsetMinutes = label === 'Maghrib' ? 3 : 0

    times[label] = shiftTimeString(baseTime, offsetMinutes)
    return times
  }, {})
}
