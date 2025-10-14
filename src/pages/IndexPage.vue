<template>
  <q-page class="">
    <!-- Toolbar with clock, avatar, and drawer button -->
    <div class="row items-center" style="height:18vh">
        <div class="col-sm-4 col-12">
          <div class="row items-center full-height cursor-pointer" @click="toggleRightDrawer">
            <div class="col-4 text-center">
              <q-img src="icons/logo.png" class="logo-image q-ml-sm"/>
            </div>
            <div class="col-8 text-left q-px-md">
              <div class="text-h5 text-weight-bold">Central Musholla<br/>
                National Central University (NCU)<br/>
              </div>
              <div class="text-subtitle1">Zhongli District, Taoyuan City</div>
            </div>
          </div>
        </div>
       <div class="col-sm-8 col-12 full-height gt-xs" v-if="$q.platform.is.desktop">
         <div class="row items-center full-height">
           <div class="col text-left">
             <div class="dynamic-font-size" :style="'font-size:'+mainClockSize +'vh'">
               {{ currentTime }}
             </div>
           </div>
           <div class="col text-right gt-sm">
             <div class="text-black q-pr-md text-date">
               {{ currentDay }}
             </div>
             <div class="text-black q-pr-md text-date">
               {{ currentDate }}
             </div>
             <div class="text-black q-pr-md text-date">
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
        :main-clock-size="mainClockSize"
        :prayer-time-font-size="prayerTimeFontSize"
        :prayer-name-font-size="prayerNameFontSize"
        :iqamah-config="iqamahConfig"
        :messages="messages"
        :images="images"
        @update:offset="updateOffset"
        @update:hijri-offset="updateHijriOffset"
        @update:main-clock-size="(val) => mainClockSize = val"
        @update:prayer-time-font-size="(val) => prayerTimeFontSize = val"
        @update:prayer-name-font-size="(val) => prayerNameFontSize = val"
        @refresh-hijri-data="refreshHijriData"
        @update:iqamah-config="updateIqamahConfig"
        @update:messages="updateMessages"
        @update:images="updateImages"
        @update:enableScreenSaver="updateEnableScreenSaver"
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
              <div class="text-capitalize text-bold dynamic-font-size" :style="'font-size:' + prayerNameFontSize + 'vh'">
                {{ prayer.name }}
                <span v-if="prayer.isUpcoming" class="lt-sm text-h4 text-lowercase"><br/><span class="text-secondary text-weight-light">In {{upcomingHour}}h : {{upcomingMinute}}m</span></span>
              </div>
            </div>
            <div class="prayer-time">
              <div class="text-h3 lt-lg">{{ prayer.time }}</div>
              <div class="gt-md text-weight-regular dynamic-font-size" :style="'font-size:' + prayerTimeFontSize + 'vh'">{{ prayer.time }}</div>
            </div>
          </div>
        </div>
      </div>
       <div class="col-sm-8 col-xs-12 bg-grey-10 text-center flex flex-center gt-xs overflow-hidden" v-if="$q.platform.is.desktop">
         <div>
           <!-- Normal status: Show upcoming prayer and rotating images -->
           <div v-if="prayerStatus === 'normal'" :class="longBreak ? 'fixed-full bg-black' : ''" style="z-index: 99" @click="toggleRightDrawer">
              <div v-if="showUpcomingCountdown" class="text-center full-width full-height" :style="longBreak ? ('margin-top:' + ((upcomingMinute % 3) + 1) * 10 + 'vh') : ''">
                <div v-if="longBreak" class="text-white" :style="'font-size:' + mainClockSize + 'vh'">{{ currentTime}}</div>
                <div class="text-h1 text-white">{{upcomingPrayer}} {{ currentPrayerTime[upcomingPrayer] }}</div>
                <div>
                  <span class="text-white text-bold" :style="'font-size:' + mainClockSize + 'vh'" v-if="upcomingHour > 0">{{String(upcomingHour).padStart(2, '0')}}</span>
                  <span class="text-h2 text-white" v-if="upcomingHour > 0">h</span>
                  <span class="text-white text-bold" :style="'font-size:' + mainClockSize + 'vh'">{{String(upcomingMinute).padStart(2, '0')}}</span>
                  <span class="text-h2 text-white">m</span>
                </div>
              </div>
             <div v-if="currentImage && !showUpcomingCountdown" class="rotating-image overflow-hidden" :style="longBreak? 'height: 100vh;width: 100vw;' : 'height: 82vh;width: 67vw;'">
               <q-img
                 :src="currentImage"
                 :ratio="1"
                 class="rounded-borders full-height"
                 fit="contain"
               />
             </div>
           </div>
           
           <!-- Countdown status: Show countdown to Iqamah -->
           <div v-else-if="prayerStatus === 'countdown'">
             <div class="text-h3 text-white">{{currentPrayerInProgress}} Prayer - Iqamah in</div>
             <div :style="'font-size:'+mainClockSize+'vh'">
               <span class="dynamic-font-size text-white text-bolder">{{String(countdownMinutes).padStart(2, '0')}}</span>
               <span class="dynamic-font-size text-white">:</span>
               <span class="dynamic-font-size text-white text-bolder">{{String(countdownSeconds).padStart(2, '0')}}</span>
             </div>
           </div>
           
           <!-- In progress status: Show prayer in progress -->
           <div v-else-if="prayerStatus === 'in-progress'">
             <div class="text-h2 text-white q-mb-md">{{currentPrayerInProgress}} Prayer in Progress</div>
           </div>

           <div>
             <span v-if="prayerStatus !== 'normal'" class="text-h2 text-white text-weight-normal">{{ currentMessage }}</span>
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
    height: 82vh; /* Use height instead of min-height */
  }
  
  /* Ensure the column takes full height */
  .col-sm-4.full-height-viewport {
    height: 82vh;
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
    background-color: #15625a;
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

  .dynamic-font-size {
    line-height: 0;
  }

  .rotating-image {
    transition: opacity 0.5s ease-in-out;
  }

  .rotating-image img {
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .text-date {
    font-size: 4.1vh;
    line-height: 1.2em;
  }
</style>

<script>
import { defineComponent, ref, reactive, computed, onMounted, onUnmounted, watch, watchEffect } from 'vue'
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
    const mainClockSize = ref(localStorage.getItem('mainClockSize') || 15)
    const prayerTimeFontSize = ref(localStorage.getItem('prayerTimeFontSize') || 8)
    const prayerNameFontSize = ref(localStorage.getItem('prayerNameFontSize') || 5)
    const longBreak = ref(false)

  // When we've applied tomorrow's times to currentPrayerTime, mark this so we don't reapply every second
  const appliedTomorrow = ref(false)

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
  // Load saved screen saver setting (boolean)
  const storedScreenSaver = localStorage.getItem('enableScreenSaver')
  const enableScreenSaver = ref(storedScreenSaver ? JSON.parse(storedScreenSaver) : false)
    
    // Rotating content configuration
    const messages = ref(JSON.parse(localStorage.getItem('messages') || '[{"text":"Please keep your phone silent during prayer!","duration":10}]'))
    const images = ref(JSON.parse(localStorage.getItem('images') || '[{"url":"quotes.jpeg","duration":0.5}]'))
    const currentMessage = ref(messages.value[0]?.text || '')
    const currentImage = ref(images.value[0]?.url || '')
    const showUpcomingCountdown = ref(false)
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
      
      // Set up the display duration:
      // - 1 minute (60000ms) for countdown
      // - Configured duration for images
      const duration = showUpcomingCountdown.value 
        ? 30000  // 1 minute fixed for countdown
        : images.value[currentImageIndex].duration * 1000 * 60

      // Update current image (will be hidden during countdown)
      currentImage.value = images.value[currentImageIndex].url

      // Clear existing interval
      if (imageInterval) clearTimeout(imageInterval)

      // Set up next rotation
      imageInterval = setTimeout(() => {
        // Toggle between showing countdown and next image at each interval
        showUpcomingCountdown.value = !showUpcomingCountdown.value
        
        // Only advance the image index when we're about to show an image (not countdown)
        if (!showUpcomingCountdown.value) {
          currentImageIndex = (currentImageIndex + 1) % images.value.length
        }
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
      
      // If a prayer was found for today, we should clear any appliedTomorrow marker so it can be applied again later
      if (!checkTomorrow) {
        appliedTomorrow.value = false
      }

      // If no prayer was found for the rest of today, use tomorrow's timetable.
      // Apply tomorrow's times only once (guarded by appliedTomorrow).
      if (foundPrayer === false && checkTomorrow) {
        // Apply tomorrow times to currentPrayerTime only once
        if (!appliedTomorrow.value) {
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          const tMonth = tomorrow.getMonth()
          const tCluster = clusterSet(tomorrow.getDate())
          const tMonthData = prayerData[tMonth] || []
          const tDayData = tMonthData[tCluster] || {}

          // Copy tomorrow times into currentPrayerTime (names)
          for (var idx2 in names) {
            let nm = names[idx2]
            var timeString2 = tDayData[nm] || '00:00'
            var parts2 = timeString2.split(':')
            var minute2 = parseInt(parts2[1])
            var hour2 = parseInt(parts2[0])
            var minutes2 = hour2*60 + minute2 + parseInt(offset)
            hour2 = Math.floor(minutes2/60)
            minute2 = minutes2 - hour2*60
            if (hour2 >= 24) {
              hour2 -= 24
            }
            currentPrayerTime[nm] = String(hour2).padStart(2, '0') + ':' + String(minute2).padStart(2, '0')
          }

          // Calculate Sunrise for tomorrow's Fajr
          var fajrTime2 = currentPrayerTime['Fajr']
          var fajrParts2 = fajrTime2.split(':')
          var fajrHour2 = parseInt(fajrParts2[0])
          var fajrMinute2 = parseInt(fajrParts2[1])
          var sunriseMinutes2 = fajrHour2*60 + fajrMinute2 + 70
          var sunriseHour2 = Math.floor(sunriseMinutes2/60)
          var sunriseMinute2 = sunriseMinutes2 - sunriseHour2*60
          if (sunriseHour2 >= 24) {
            sunriseHour2 -= 24
          }
          currentPrayerTime['Sunrise'] = String(sunriseHour2).padStart(2, '0') + ':' + String(sunriseMinute2).padStart(2, '0')

          appliedTomorrow.value = true
        }

        // Use the already-applied currentPrayerTime (which now contains tomorrow's Fajr)
        let name = 'Fajr'
        var timeString = currentPrayerTime[name] || '00:00'
        var parts = timeString.split(':')
        var minute = parseInt(parts[1])
        var hour = parseInt(parts[0])
        var minutes = hour*60 + minute + parseInt(offset)
        hour = Math.floor(minutes/60)
        minute = minutes - hour*60

        extraMinutes.value = 24 * 60 - (currentHour.value*60 + currentMinute.value)
        upcomingPrayer.value = 'Fajr'
        upcomingMinutes.value = extraMinutes.value + (hour*60 + minute)
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

    const updateEnableScreenSaver = (newVal) => {
      // newVal is expected to be a boolean
      enableScreenSaver.value = !!newVal
      localStorage.setItem('enableScreenSaver', JSON.stringify(enableScreenSaver.value))
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
        'Muharram', 'Safar', 'Rabi 1', 'Rabi 2',
        'Jumada 1', 'Jumada 2', 'Rajab', 'Sha\'ban',
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

    // Set longBreak when there's a long gap to the upcoming prayer while in normal status
    watchEffect(() => {
      if (prayerStatus.value === 'normal') {
        // upcomingMinutes is already the total minutes until the upcoming prayer
        const minutesUntil = upcomingMinutes.value
        // If there are more than 15 minutes until the upcoming prayer, mark as long break
        longBreak.value = (minutesUntil > 15) && enableScreenSaver.value
      } else {
        longBreak.value = false
      }
    })

    
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
      enableScreenSaver,
      prayerTableData,
      mainClockSize,
      prayerTimeFontSize,
      prayerNameFontSize,
      showUpcomingCountdown,
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
      updateEnableScreenSaver,
      requestNotif,
      messages,
      currentMessage,
      updateMessages,
      updateImages, // Add updateImages to the returned object
      longBreak,
      openURL
    }
  }
})
</script>