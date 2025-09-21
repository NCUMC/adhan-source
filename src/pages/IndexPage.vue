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
             <div class="text-xl-10 text-white q-pl-xl">
               {{ currentTime }}
             </div>
           </div>
           <div class="col text-right gt-sm">
             <div class="text-h5 text-white q-pr-xl">
               {{ currentDay }}
             </div>
             <div class="text-h5 text-white q-pr-xl">
               {{ currentDate }}
             </div>
             <div class="text-h5 text-white q-pr-xl">
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
      @update:offset="updateOffset"
      @update:hijri-offset="updateHijriOffset"
      @refresh-hijri-data="refreshHijriData"
      @update:iqamah-config="updateIqamahConfig"
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
              <div class="text-h1 gt-md text-weight-regular">{{ prayer.time }}</div>
            </div>
          </div>
        </div>
      </div>
       <div class="col-sm-8 col-xs-12 bg-grey-1 text-center flex flex-center gt-xs">
         <div>
           <!-- Normal status: Show upcoming prayer -->
           <div v-if="prayerStatus === 'normal'">
             <div class="text-h3">{{upcomingPrayer}} in</div>
             <div>
               <span class="text-h1 text-secondary text-bold" v-if="upcomingHour > 0">{{String(upcomingHour).padStart(2, '0')}}</span>
               <span class="text-h3" v-if="upcomingHour > 0">h</span>
               <span class="text-secondary text-bold text-xl-20">{{String(upcomingMinute).padStart(2, '0')}}</span>
               <span class="text-h3">m</span>
             </div>
           </div>
           
           <!-- Countdown status: Show countdown to Iqamah -->
           <div v-else-if="prayerStatus === 'countdown'">
             <div class="text-h3 text-secondary">{{currentPrayerInProgress}} - Iqamah in</div>
             <div>
               <span class="text-h1 text-secondary text-bold">{{String(countdownMinutes).padStart(2, '0')}}</span>
               <span class="text-h3">:</span>
               <span class="text-h1 text-secondary text-bold">{{String(countdownSeconds).padStart(2, '0')}}</span>
             </div>
           </div>
           
           <!-- In progress status: Show prayer in progress -->
           <div v-else-if="prayerStatus === 'in-progress'">
             <div class="text-h3 text-secondary">{{currentPrayerInProgress}} in Progress</div>
             <div class="text-h1 text-secondary text-bold">Please maintain silence</div>
           </div>
         </div>
       </div>
    </div>
    <div class="row items-center bg-orange-2 gt-xs" style="height: 50px;">
      <div class="col text-h5 text-center">Please keep your phone silent during prayer!</div>
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
    height: calc(100vh - 200px); /* Use height instead of min-height */
  }
  
  /* Ensure the column takes full height */
  .col-sm-4.full-height-viewport {
    height: calc(100vh - 200px);
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
</style>

<script>
import { defineComponent, ref } from 'vue'
import prayerData from 'assets/timetable.json'
import SettingsDrawer from 'components/SettingsDrawer.vue'
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
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
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
      
      // Check for prayer time and update countdown
      checkPrayerTime()
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
      // Only check if we're in normal status
      if (prayerStatus.value !== 'normal') return
      
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const currentTimeMinutes = currentHour * 60 + currentMinute

      // This will be called from the component's methods to access currentPrayerTime
      // For now, we'll add a method to trigger this check
    }

    // Start 10-minute countdown to Iqamah
    const startCountdownToIqamah = (prayerName) => {
      prayerStatus.value = 'countdown'
      countdownMinutes.value = 10
      countdownSeconds.value = 0
      currentPrayerInProgress.value = prayerName
    }

    // Start 15-minute prayer in progress
    const startPrayerInProgress = (prayerName) => {
      prayerStatus.value = 'in-progress'
      currentPrayerInProgress.value = prayerName
    }

    // Return to normal status
    const returnToNormal = () => {
      prayerStatus.value = 'normal'
      currentPrayerInProgress.value = ''
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

    return {
      rightDrawerOpen,
      currentTime,
      currentDay,
      currentDate,
      hijriDate,
      hijriOffset,
      prayerStatus,
      countdownMinutes,
      countdownSeconds,
      currentPrayerInProgress,
      updateTime,
      toggleRightDrawer,
      updateOffset,
      updateHijriOffset,
      refreshHijriData
    }
  },
  computed: {
    prayerTableData() {
      return this.prayerNames.map(name => ({
        name: name,
        time: this.currentPrayerTime[name] || '00:00',
        isUpcoming: this.upcomingPrayer === name
      }))
    }
  },
  data () {
    return {
      currentPrayerTime: {
        'Fajr': '00:00',
        'Sunrise': '00:00',
        'Dhuhr': '00:00',
        'Asr': '00:00',
        'Maghrib': '00:00',
        'Isha': '00:00'
      },
      prayerNames: ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
      prayerColumns: [
        { name: 'prayer', label: 'Prayer', field: 'name', align: 'left' },
        { name: 'time', label: 'Time', field: 'time', align: 'right' }
      ],
      currentHour: 0,
      currentMinute: 0,
      upcomingPrayer: null,
      upcomingMinutes: 0,
      upcomingMinute: 0,
      upcomingHour: 0,
      month: 0,
      date: 0,
      dateCluster: 1,
      extraMinutes: 0,
      notifEnabled: true,
      iqamahConfig: JSON.parse(localStorage.getItem('iqamahConfig') || '{"Fajr":10,"Dhuhr":10,"Asr":10,"Maghrib":10,"Isha":10}')
    }
  },
  mounted () {
    const dateObj = new Date()
    this.currentHour = dateObj.getHours()
    this.currentMinute = dateObj.getMinutes()
    this.month = dateObj.getMonth()
    this.date = dateObj.getDate()
    this.dateCluster = this.clusterSet(this.date)
    
    this.updateDailyTime()

    // Initialize and start the clock
    this.updateTime()
    this.clockInterval = setInterval(this.updateTime, 1000)
    
    // Start countdown timer
    this.countdownInterval = setInterval(() => {
      if (this.prayerStatus === 'countdown') {
        if (this.countdownSeconds > 0) {
          this.countdownSeconds--
        } else if (this.countdownMinutes > 0) {
          this.countdownMinutes--
          this.countdownSeconds = 59
        } else {
          // Countdown finished, start prayer in progress
          this.startPrayerInProgress(this.currentPrayerInProgress)
        }
      }
    }, 1000)

    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") this.notifEnabled = false
  },
  unmounted () {
    // Clean up the intervals when component is unmounted
    if (this.clockInterval) {
      clearInterval(this.clockInterval)
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
    }
  },
  methods: {
    clusterSet (dateNum) {
      if (dateNum < 11) return 0  // Changed from 1 to 0 for array indexing
      else if (dateNum < 21) return 1  // Changed from 2 to 1
      else return 2  // Changed from 3 to 2
    },
    updateDailyTime () {
      var offset = this.offset
      // Updated to work with new nested format
      var monthData = prayerData[this.month] || []
      var dayData = monthData[this.dateCluster] || {}
      var prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] // Exclude Sunrise from main loop
      var checkTomorrow = true
      var foundPrayer = false
      
      // Process regular prayer times
      for (var idx in prayerNames) {
        let name = prayerNames[idx]
        // Get time from the new format (direct prayer name)
        var timeString = dayData[name] || '00:00'
        var parts = timeString.split(':')
        var minute = parseInt(parts[1])
        var hour = parseInt(parts[0])
        var minutes = hour*60 + minute + parseInt(offset)
        hour = Math.floor(minutes/60)
        minute = minutes - hour*60
        
        if ((hour*60 + minute) > (this.currentHour*60 + this.currentMinute) && (foundPrayer === false)) {
          checkTomorrow = false
          foundPrayer = true
          this.upcomingPrayer = name
          this.upcomingMinutes = this.extraMinutes + (hour*60 + minute) - (this.currentHour*60 + this.currentMinute)
          this.upcomingHour = Math.floor(this.upcomingMinutes / 60)
          this.upcomingMinute = this.upcomingMinutes - this.upcomingHour * 60
        }
        this.currentPrayerTime[name] = String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0')
      }

      // Calculate Sunrise (70 minutes after Fajr)
      var fajrTime = this.currentPrayerTime['Fajr']
      var fajrParts = fajrTime.split(':')
      var fajrHour = parseInt(fajrParts[0])
      var fajrMinute = parseInt(fajrParts[1])
      var sunriseMinutes = fajrHour*60 + fajrMinute + 70
      var sunriseHour = Math.floor(sunriseMinutes/60)
      var sunriseMinute = sunriseMinutes - sunriseHour*60
      
      // Handle day overflow for sunrise
      if (sunriseHour >= 24) {
        sunriseHour -= 24
      }
      
      this.currentPrayerTime['Sunrise'] = String(sunriseHour).padStart(2, '0') + ':' + String(sunriseMinute).padStart(2, '0')

      // Check if sunrise is the upcoming prayer
      if ((sunriseHour*60 + sunriseMinute) > (this.currentHour*60 + this.currentMinute) && (foundPrayer === false)) {
        checkTomorrow = false
        foundPrayer = true
        this.upcomingPrayer = 'Sunrise'
        this.upcomingMinutes = this.extraMinutes + (sunriseHour*60 + sunriseMinute) - (this.currentHour*60 + this.currentMinute)
        this.upcomingHour = Math.floor(this.upcomingMinutes / 60)
        this.upcomingMinute = this.upcomingMinutes - this.upcomingHour * 60
      }

      // Check for prayer time after updating times
      this.checkPrayerTimeMatch()

      if (checkTomorrow) {
        this.todayIndex = this.todayIndex + 1
        this.extraMinutes = 24 * 60 - (this.currentHour*60 + this.currentMinute)
        this.currentHour = 0
        this.currentMinute = 0
        this.updateDailyTime(true)
      }
    },
    checkPrayerTimeMatch() {
      // Only check if we're in normal status
      if (this.prayerStatus !== 'normal') return
      
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const currentTimeMinutes = currentHour * 60 + currentMinute

      // Check each prayer time
      for (const [prayerName, timeString] of Object.entries(this.currentPrayerTime)) {
        if (timeString && timeString !== '00:00') {
          const [hours, minutes] = timeString.split(':').map(Number)
          const prayerTimeMinutes = hours * 60 + minutes
          
          // Check if we're at prayer time (within 1 minute)
          if (Math.abs(currentTimeMinutes - prayerTimeMinutes) <= 1) {
            this.startCountdownToIqamah(prayerName)
            return
          }
        }
      }
    },
    startCountdownToIqamah(prayerName) {
      if (prayerName === 'Sunrise') return;
      this.prayerStatus = 'countdown'
      this.countdownMinutes = this.iqamahConfig[prayerName] || 10
      this.countdownSeconds = 0
      this.currentPrayerInProgress = prayerName
    },
    startPrayerInProgress(prayerName) {
      this.prayerStatus = 'in-progress'
      this.currentPrayerInProgress = prayerName
      
      // Set timer to return to normal after 15 minutes
      setTimeout(() => {
        this.returnToNormal()
      }, 15 * 60 * 1000) // 15 minutes
    },
    returnToNormal() {
      this.prayerStatus = 'normal'
      this.currentPrayerInProgress = ''
    },
    updateIqamahConfig(newConfig) {
      this.iqamahConfig = { ...newConfig }
      localStorage.setItem('iqamahConfig', JSON.stringify(this.iqamahConfig))
    },
    requestNotif () {
       // Let's check if the browser supports notifications
      if (!("Notification" in window)) {
        alert("This browser does not support notification");
      }

      // Let's check whether notification permissions have already been granted
      else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification("Notification already granted");
      }

      // Otherwise, we need to ask the user for permission
      else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
          // If the user accepts, let's create a notification
          if (permission === "granted") {
            var notification = new Notification("Notification Activated!");
          }
        });
      }
    }
  },
  watch: {
    offset (newVal, oldVal) {
      if (newVal != oldVal) {
        localStorage.setItem('offset', newVal)
        this.updateDailyTime()
      }
    }
  }
})
</script>