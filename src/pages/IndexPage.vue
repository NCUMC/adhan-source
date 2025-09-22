<template>
  <q-page class="">
    <!-- Toolbar with clock, avatar, and drawer button -->
    <div class="row items-center" style="height:150px">
        <div class="col-sm-4 col-12">
          <div class="row items-center full-height cursor-pointer" @click="toggleRightDrawer">
            <div class="col-4 text-center">
              <q-img src="icons/NCU_logo_crop.png" class="logo-image q-ml-sm"/>
            </div>
            <div class="col-8 text-left q-px-md">
              <div class="text-h5 text-weight-bold">Central Musholla<br/>
                National Central University (NCU)<br/>
              </div>
              <div class="text-subtitle1">Zhongli District, Taoyuan City</div>
            </div>
          </div>
        </div>
       <div class="col-sm-8 col-12 bg-grey-10 full-height gt-xs">
         <div class="row items-center full-height">
           <div class="col text-left">
             <div class="text-xl-10 text-white q-pl-sm">
               {{ currentTime }}
             </div>
           </div>
           <div class="col text-right gt-sm">
             <div class="text-h4 text-white q-pr-sm">
               {{ currentDay }}
             </div>
             <div class="text-h4 text-white q-pr-sm">
               {{ currentDate }}
             </div>
             <div class="text-h4 text-white q-pr-sm">
               {{ hijriDate }}
             </div>
           </div>
         </div>
       </div>
    </div>

    <!-- Settings Drawer Component -->
    <SettingsDrawer
      v-model="rightDrawerOpen"
      :offset="offset"
      :hijri-offset="hijriOffset"
      :iqamah-config="iqamahConfig"
      :messages="messages"
      :images="images"
      @update:offset="updateOffset"
      @update:hijri-offset="updateHijriOffset"
      @refresh-hijri-data="refreshHijriData"
      @update:iqamah-config="updateIqamahConfig"
      @update:messages="updateMessages"
      @update:images="updateImages"
    />

    <div class="row full-height-viewport">
      <div class="col-sm-4 col-xs-12 bg-secondary full-height-viewport">
        <div class="prayer-times-container">
          <div 
            v-for="(prayer, index) in prayerTableData" 
            :key="index"
            class="prayer-row"
            :class="prayer.isUpcoming ? 'upcoming-prayer' : ''"
          >
            <div class="prayer-name">
              <div class="text-h4 text-capitalize text-bold">
                {{ prayer.name }}
                <span v-if="prayer.isUpcoming" class="lt-sm text-h4 text-lowercase"><br/><span class="text-secondary text-weight-light">In {{upcomingHour}}h : {{upcomingMinute}}m</span></span>
              </div>
            </div>
            <div class="prayer-time">
              <div class="text-h3 lt-lg">{{ prayer.time }}</div>
              <div class="gt-md text-weight-regular" style="font-size: 8vh;">{{ prayer.time }}</div>
            </div>
          </div>
        </div>
      </div>
       <div class="col-sm-8 col-xs-12 bg-grey-1 text-center flex flex-center gt-xs overflow-hidden">
         <div>
           <!-- Normal status: Show upcoming prayer and rotating images -->
           <div v-if="prayerStatus === 'normal'">
             <!-- <div class="text-h1">{{upcomingPrayer}} in</div>
             <div>
               <span class="text-xl-20 text-secondary text-bold" v-if="upcomingHour > 0">{{String(upcomingHour).padStart(2, '0')}}</span>
               <span class="text-h2" v-if="upcomingHour > 0">h</span>
               <span class="text-secondary text-bold text-xl-20">{{String(upcomingMinute).padStart(2, '0')}}</span>
               <span class="text-h2">m</span>
             </div> -->
             <div v-if="currentImage" class="rotating-image">
               <q-img
                 :src="currentImage"
                 :ratio="16/9"
                 width="67vw"
                 class="rounded-borders"
               />
             </div>
           </div>
           
           <!-- Countdown status: Show countdown to Iqamah -->
           <div v-else-if="prayerStatus === 'countdown'">
             <div class="text-h1">{{currentPrayerInProgress}} - Iqamah in</div>
             <div>
               <span class="text-xl-20 text-secondary text-bolder">{{String(countdownMinutes).padStart(2, '0')}}</span>
               <span class="text-xl-20">:</span>
               <span class="text-xl-20 text-secondary text-bolder">{{String(countdownSeconds).padStart(2, '0')}}</span>
             </div>
           </div>
           
           <!-- In progress status: Show prayer in progress -->
           <div v-else-if="prayerStatus === 'in-progress'">
             <div class="text-h3 text-secondary">{{currentPrayerInProgress}} in Progress</div>
             <div class="text-h1 text-secondary text-bold">Please maintain silence</div>
           </div>

           <div>
             <span v-if="prayerStatus !== 'normal'" class="text-h3">{{ currentMessage }}</span>
           </div>
           <div class="fixed-bottom-right q-pa-sm bg-white rounded-borders">
             <span @click="openURL('https://www.instagram.com/ncu.muslimclub')" class="cursor-pointer text-subtitle1"><q-icon name="fa-brands fa-instagram" class="q-mr-xs" color="secondary"/>@ncu.muslimclub</span>
             <span @click="openURL('mailto:ncumuslimclub@gmail.com')" class="cursor-pointer q-ml-md text-subtitle1"><q-icon name="mail" class="q-mr-xs" color="secondary"/>ncumuslimclub@gmail.com</span>
           </div>
         </div>
       </div>
    </div>
    <!-- <q-page-sticky v-show="!notifEnabled" position="bottom-right" :offset="[18, 18]">
      <q-btn @click="requestNotif" fab icon="notifications" color="secondary" />
    </q-page-sticky> -->
  </q-page>
</template>

<style scoped>
  .radius-5 {
    border-radius: 15px;
  }
  
  .full-height-viewport {
    height: calc(100vh - 150px); /* Use height instead of min-height */
  }
  
  /* Ensure the column takes full height */
  .col-sm-4.full-height-viewport {
    height: calc(100vh - 150px);
  }
  
  .q-page {
    min-height: 100vh;
  }
  
  /* Custom prayer times layout */
  .prayer-times-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .prayer-row {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    color: white;
    transition: all 0.3s ease;
  }
  
  .prayer-row.upcoming-prayer {
    background-color: white;
    color: black;
  }
  
  .prayer-name {
    flex: 1;
    text-align: left;
  }
  
  .prayer-time {
    flex: 1;
    text-align: right;
  }
  
  /* Logo and header styling */
  .logo-image {
    max-width: 120px;
    max-height: 120px;
    object-fit: contain;
  }
  
  .full-height {
    height: 100%;
  }

  .text-xl-20 {
    font-size: 20em;
    line-height: 1em;
  }
  
  .text-xl-10 {
    font-size: 10em;
    line-height: 0;
  }

  .rotating-image {
    transition: opacity 0.5s ease-in-out;
  }

  .rotating-image img {
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
</style>

<script>
import { defineComponent, ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import prayerData from 'assets/timetable.json'
import SettingsDrawer from 'components/SettingsDrawer.vue'
import { openURL } from 'quasar'
export default defineComponent({
  name: 'IndexPage',
  components: {
    SettingsDrawer
  },
  props: ['offset'],
  setup(props, { emit }) {
    const rightDrawerOpen = ref(false)
    const currentTime = ref('')
    const currentDay = ref('')
    const currentDate = ref('')
    const hijriDate = ref('')
    const hijriOffset = ref(0)
    const prayerStatus = ref('normal') // 'normal', 'countdown', 'in-progress'
    const countdownMinutes = ref(0)
    const countdownSeconds = ref(0)
    const currentPrayerInProgress = ref('')

    // Data properties moved from data() to setup
    const currentPrayerTime = reactive({
      'Fajr': '00:00',
      'Sunrise': '00:00',
      'Dhuhr': '00:00',
      'Asr': '00:00',
      'Maghrib': '00:00',
      'Isha': '00:00'
    })
    const prayerNames = ref(['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'])
    const prayerColumns = ref([
      { name: 'prayer', label: 'Prayer', field: 'name', align: 'left' },
      { name: 'time', label: 'Time', field: 'time', align: 'right' }
    ])
    const currentHour = ref(0)
    const currentMinute = ref(0)
    const upcomingPrayer = ref(null)
    const upcomingMinutes = ref(0)
    const upcomingMinute = ref(0)
    const upcomingHour = ref(0)
    const month = ref(0)
    const date = ref(0)
    const dateCluster = ref(1)
    const extraMinutes = ref(0)
    const notifEnabled = ref(true)
    const iqamahConfig = ref(JSON.parse(localStorage.getItem('iqamahConfig') || '{"Fajr":10,"Dhuhr":10,"Asr":10,"Maghrib":10,"Isha":10}'))
    
    // Rotating content configuration
    const messages = ref(JSON.parse(localStorage.getItem('messages') || '[{"text":"Please keep your phone silent during prayer!","duration":10}]'))
    const images = ref(JSON.parse(localStorage.getItem('images') || '[{"url":"/icons/NCU_logo_crop.png","duration":10}]'))
    const currentMessage = ref(messages.value[0]?.text || '')
    const currentImage = ref(images.value[0]?.url || '')
    let messageInterval = null
    let imageInterval = null
    let currentMessageIndex = 0
    let currentImageIndex = 0

    const rotateMessage = () => {
      if (messages.value.length === 0) return
      
      currentMessage.value = messages.value[currentMessageIndex].text
      const duration = messages.value[currentMessageIndex].duration * 1000 * 60

      // Clear existing interval
      if (messageInterval) clearTimeout(messageInterval)

      // Set up next message
      messageInterval = setTimeout(() => {
        currentMessageIndex = (currentMessageIndex + 1) % messages.value.length
        rotateMessage()
      }, duration)
    }

    const rotateImage = () => {
      if (images.value.length === 0) return
      
      currentImage.value = images.value[currentImageIndex].url
      const duration = images.value[currentImageIndex].duration * 1000 * 60

      // Clear existing interval
      if (imageInterval) clearTimeout(imageInterval)

      // Set up next image
      imageInterval = setTimeout(() => {
        currentImageIndex = (currentImageIndex + 1) % images.value.length
        rotateImage()
      }, duration)
    }
    
    // Convert computed property to setup
    const prayerTableData = computed(() => {
      return prayerNames.value.map(name => ({
        name: name,
        time: currentPrayerTime[name] || '00:00',
        isUpcoming: upcomingPrayer.value === name
      }))
    })

    // Clock interval reference for cleanup
    let clockInterval = null
    let countdownInterval = null

    // Move mounted logic to onMounted
    onMounted(() => {
      const dateObj = new Date()
      currentHour.value = dateObj.getHours()
      currentMinute.value = dateObj.getMinutes()
      month.value = dateObj.getMonth()
      date.value = dateObj.getDate()
      dateCluster.value = clusterSet(date.value)
      
      // Start message and image rotation
      rotateMessage()
      rotateImage()

      // Initialize and start the clock
      updateTime()
      clockInterval = setInterval(updateTime, 1000)
      
      // We'll handle the countdown in updateTime function instead
      if ("Notification" in window && 
          Notification.permission !== "granted" && 
          Notification.permission !== "denied") {
        notifEnabled.value = false
      }
    })

    // Move unmounted logic to onUnmounted
    onUnmounted(() => {
      if (clockInterval) {
        clearInterval(clockInterval)
      }
      if (messageInterval) {
        clearTimeout(messageInterval)
      }
      if (imageInterval) {
        clearTimeout(imageInterval)
      }
    })

    // Move all methods to setup functions
    const clusterSet = (dateNum) => {
      if (dateNum < 11) return 0
      else if (dateNum < 21) return 1
      else return 2
    }

    const updateDailyTime = () => {
      var offset = props.offset
      var monthData = prayerData[month.value] || []
      var dayData = monthData[dateCluster.value] || {}
      var names = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
      var checkTomorrow = true
      var foundPrayer = false
      
      // Process regular prayer times
      for (var idx in names) {
        let name = names[idx]
        var timeString = dayData[name] || '00:00'
        var parts = timeString.split(':')
        var minute = parseInt(parts[1])
        var hour = parseInt(parts[0])
        var minutes = hour*60 + minute + parseInt(offset)
        hour = Math.floor(minutes/60)
        minute = minutes - hour*60
        
        if ((hour*60 + minute) > (currentHour.value*60 + currentMinute.value) && (foundPrayer === false)) {
          checkTomorrow = false
          foundPrayer = true
          upcomingPrayer.value = name
          upcomingMinutes.value = extraMinutes.value + (hour*60 + minute) - (currentHour.value*60 + currentMinute.value)
          upcomingHour.value = Math.floor(upcomingMinutes.value / 60)
          upcomingMinute.value = upcomingMinutes.value - upcomingHour.value * 60
        }
        currentPrayerTime[name] = String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0')
      }

      // Calculate Sunrise (70 minutes after Fajr)
      var fajrTime = currentPrayerTime['Fajr']
      var fajrParts = fajrTime.split(':')
      var fajrHour = parseInt(fajrParts[0])
      var fajrMinute = parseInt(fajrParts[1])
      var sunriseMinutes = fajrHour*60 + fajrMinute + 70
      var sunriseHour = Math.floor(sunriseMinutes/60)
      var sunriseMinute = sunriseMinutes - sunriseHour*60
      
      if (sunriseHour >= 24) {
        sunriseHour -= 24
      }
      
      currentPrayerTime['Sunrise'] = String(sunriseHour).padStart(2, '0') + ':' + String(sunriseMinute).padStart(2, '0')

      if ((sunriseHour*60 + sunriseMinute) > (currentHour.value*60 + currentMinute.value) && (foundPrayer === false)) {
        checkTomorrow = false
        foundPrayer = true
        upcomingPrayer.value = 'Sunrise'
        upcomingMinutes.value = extraMinutes.value + (sunriseHour*60 + sunriseMinute) - (currentHour.value*60 + currentMinute.value)
        upcomingHour.value = Math.floor(upcomingMinutes.value / 60)
        upcomingMinute.value = upcomingMinutes.value - upcomingHour.value * 60
      }
    }

    const checkPrayerTimeMatch = () => {
      if (prayerStatus.value !== 'normal') return
      
      const now = new Date()
      const curHour = now.getHours()
      const curMinute = now.getMinutes()
      const currentTimeMinutes = curHour * 60 + curMinute

      for (const [prayerName, timeString] of Object.entries(currentPrayerTime)) {
        if (timeString && timeString !== '00:00') {
          const [hours, minutes] = timeString.split(':').map(Number)
          const prayerTimeMinutes = hours * 60 + minutes
          
          if (Math.abs(currentTimeMinutes - prayerTimeMinutes) <= 1) {
            startCountdownToIqamah(prayerName)
            return
          }
        }
      }
    }

    const startCountdownToIqamah = (prayerName, timeout) => {
      if (prayerName === 'Sunrise') return
      
      console.log(`Setting up Iqamah countdown for ${prayerName}`)
      console.log('Current iqamahConfig:', iqamahConfig.value)
      
      prayerStatus.value = 'countdown'
      countdownMinutes.value = timeout || iqamahConfig.value[prayerName] || 10
      countdownSeconds.value = 0
      currentPrayerInProgress.value = prayerName
      
      console.log(`Countdown started: ${countdownMinutes.value}:${countdownSeconds.value}`)
    }

    const startPrayerInProgress = (prayerName) => {
      prayerStatus.value = 'in-progress'
      currentPrayerInProgress.value = prayerName
      
      setTimeout(() => {
        returnToNormal()
      }, 15 * 60 * 1000)
    }

    const returnToNormal = () => {
      prayerStatus.value = 'normal'
      currentPrayerInProgress.value = ''
    }

    const updateIqamahConfig = (newConfig) => {
      iqamahConfig.value = { ...newConfig }
      localStorage.setItem('iqamahConfig', JSON.stringify(iqamahConfig.value))
    }

    const updateMessages = (newMessages) => {
      messages.value = [...newMessages]
      localStorage.setItem('messages', JSON.stringify(messages.value))
      currentMessageIndex = 0 // Reset to first message
      rotateMessage() // Restart rotation
    }

    const updateImages = (newImages) => {
      images.value = [...newImages]
      localStorage.setItem('images', JSON.stringify(images.value))
      currentImageIndex = 0 // Reset to first image
      rotateImage() // Restart rotation
    }

    const requestNotif = () => {
      if (!("Notification" in window)) {
        alert("This browser does not support notification")
      }
      else if (Notification.permission === "granted") {
        var notification = new Notification("Notification already granted")
      }
      else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
          if (permission === "granted") {
            var notification = new Notification("Notification Activated!")
          }
        })
      }
    }

    // Move watch to setup
    watch(() => props.offset, (newVal, oldVal) => {
      if (newVal !== oldVal) {
        localStorage.setItem('offset', newVal)
        updateDailyTime()
      }
    })

    // Load Hijri offset from localStorage
    const loadHijriOffset = () => {
      try {
        const saved = localStorage.getItem('hijriOffset')
        hijriOffset.value = saved ? parseInt(saved) : 0
      } catch (err) {
        console.log('Error loading Hijri offset:', err)
        hijriOffset.value = 0
      }
    }

    // Calculate Hijri date
    const calculateHijriDate = (gregorianDate) => {
      // Simple approximation - in production, you'd want to use a proper Hijri calendar library
      // This is a basic calculation that can be adjusted with the offset
      const epoch = new Date(622, 6, 16) // July 16, 622 CE (1 Muharram, 1 AH)
      const diffTime = gregorianDate - epoch
      let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      // Apply offset to days (not years)
      diffDays += hijriOffset.value
      
      // Approximate Hijri year (354.37 days per year)
      const hijriYear = Math.floor(diffDays / 354.37) + 1
      
      // Calculate remaining days for month/day
      const remainingDays = diffDays - ((hijriYear - 1) * 354.37)
      let hijriMonth = Math.floor(remainingDays / 29.5) + 1
      let hijriDay = Math.floor(remainingDays % 29.5) + 1
      
      // Ensure month is within valid range (1-12)
      if (hijriMonth < 1) {
        hijriMonth = 12
      } else if (hijriMonth > 12) {
        hijriMonth = 1
      }
      
      // Ensure day is within valid range (1-30)
      if (hijriDay < 1) {
        hijriDay = 30
      } else if (hijriDay > 30) {
        hijriDay = 1
      }
      
      const monthNames = [
        'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
        'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
        'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
      ]
      
      return `${Math.floor(hijriDay)} ${monthNames[Math.floor(hijriMonth) - 1]} ${Math.floor(hijriYear)}H`
    }

    const updateTime = () => {
      const now = new Date()
      // Update the current hour and minute values first
      currentHour.value = now.getHours()
      currentMinute.value = now.getMinutes()
      
      // Format the time display
      const hours = String(currentHour.value).padStart(2, '0')
      const minutes = String(currentMinute.value).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      currentTime.value = `${hours}:${minutes}:${seconds}`
      
      // Format date as "Day, Month DD, YYYY"
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }
      currentDate.value = now.toLocaleDateString('en-US', options)
      currentDay.value = now.toLocaleDateString('en-US', {weekday: 'long'})
      
      // Calculate Hijri date
      hijriDate.value = calculateHijriDate(now)
      
      // Update daily prayer times first
      updateDailyTime()
      
      // Then check for prayer time match and update countdown
      if (prayerStatus.value === 'normal') {
        checkPrayerTime()
      }
      
      // Finally update any ongoing countdown
      updateCountdown()
    }

    const toggleRightDrawer = () => {
      rightDrawerOpen.value = !rightDrawerOpen.value
    }

    const updateOffset = (newOffset) => {
      emit('update:offset', newOffset)
    }

    const updateHijriOffset = (newOffset) => {
      hijriOffset.value = newOffset
      localStorage.setItem('hijriOffset', newOffset)
      updateTime() // Refresh the date display
    }

    const refreshHijriData = () => {
      // Clear any cached data and refresh
      localStorage.removeItem('hijriDateCache')
      localStorage.removeItem('hijriDateLastUpdate')
      updateTime() // Refresh the date display
    }

    // Check if current time matches any prayer time
    const checkPrayerTime = () => {
      if (prayerStatus.value !== 'normal') {
        console.log('Prayer status is not normal:', prayerStatus.value)
        return
      }
      
      const currentTimeMinutes = currentHour.value * 60 + currentMinute.value
      
      // Check each prayer time except Sunrise
      for (const name of prayerNames.value) {
        if (name === 'Sunrise') {
          continue
        }
        
        const timeString = currentPrayerTime[name]
        const iqamahThreshold = iqamahConfig.value[name]
        
        if (timeString && timeString !== '00:00') {
          const [hours, minutes] = timeString.split(':').map(Number)
          const prayerTimeMinutes = hours * 60 + minutes
          
          if (currentTimeMinutes >= prayerTimeMinutes && prayerTimeMinutes + iqamahThreshold - currentTimeMinutes >= 0) {
            startCountdownToIqamah(name, prayerTimeMinutes + iqamahThreshold - currentTimeMinutes)
            return
          }
        } else {
          console.log(`${name}: Invalid time format (${timeString})`)
        }
      }
    }

    // Update countdown
    const updateCountdown = () => {
      if (prayerStatus.value === 'countdown') {
        if (countdownSeconds.value > 0) {
          countdownSeconds.value--
        } else if (countdownMinutes.value > 0) {
          countdownMinutes.value--
          countdownSeconds.value = 59
        } else {
          // Countdown finished, start prayer in progress
          startPrayerInProgress(currentPrayerInProgress.value)
        }
      } else if (prayerStatus.value === 'in-progress') {
        // After 15 minutes, return to normal
        setTimeout(() => {
          returnToNormal()
        }, 15 * 60 * 1000) // 15 minutes
      }
    }

    // Initialize Hijri offset
    loadHijriOffset()

    
    // Return all the needed template refs and functions
    return {
      rightDrawerOpen,
      currentTime,
      currentDay,
      currentDate,
      hijriDate,
      hijriOffset,
      prayerStatus,
      currentImage,
      images,
      countdownMinutes,
      countdownSeconds,
      currentPrayerInProgress,
      currentPrayerTime,
      prayerNames,
      prayerColumns,
      currentHour,
      currentMinute,
      upcomingPrayer,
      upcomingMinutes,
      upcomingMinute,
      upcomingHour,
      month,
      date,
      dateCluster,
      extraMinutes,
      notifEnabled,
      iqamahConfig,
      prayerTableData,
      updateTime,
      toggleRightDrawer,
      updateOffset,
      updateHijriOffset,
      refreshHijriData,
      clusterSet,
      updateDailyTime,
      checkPrayerTimeMatch,
      startCountdownToIqamah,
      startPrayerInProgress,
      returnToNormal,
      updateIqamahConfig,
      requestNotif,
      messages,
      currentMessage,
      updateMessages,
      updateImages, // Add updateImages to the returned object
      openURL
    }
  }
})
</script>