<template>
  <q-page class="">
    <!-- Toolbar with clock, avatar, and drawer button -->
    <div class="row items-center">
      <div class="col-sm-4 col-12 text-center">
        <q-avatar size="xl" class="cursor-pointer q-my-sm" @click="toggleRightDrawer">
          <q-img src="icons/icon-256x256.png"/>
        </q-avatar>
      </div>
       <div class="col-sm-8 col-12 bg-grey-10">
         <div class="row items-center q-py-md">
           <div class="col text-left">
             <div class="text-h1 text-white q-pl-xl">
               {{ currentTime }}
             </div>
           </div>
           <div class="col text-right">
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
      @update:offset="updateOffset"
      @update:hijri-offset="updateHijriOffset"
      @refresh-hijri-data="refreshHijriData"
    />

    <div class="row">
      <div class="col-sm-4 col-xs-12 bg-secondary">
        <div class="full-width" v-for="(time, name) in currentPrayerTime" :key="name">
          <q-card flat :class="'my-card text-center q-ma-sm radius-5 ' + (upcomingPrayer === name ? 'bg-white' : 'bg-secondary text-white')">
            <q-card-section class="q-py-sm ">
              <div class="text-h6 text-capitalize text-bold">
                {{name}}
                <span v-if="upcomingPrayer === name" class="text-h6 text-lowercase">| in {{upcomingHour}} hours {{upcomingMinute}} minutes</span>
              </div>
              <div class="text-h3">{{time}}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
       <div class="col-sm-8 col-xs-12 bg-grey-1 text-center flex flex-center">
         <div>
           <div class="text-h3">{{upcomingPrayer}} in</div>
           <div class="text-h1">{{String(upcomingHour).padStart(2, '0')}}:{{String(upcomingMinute).padStart(2, '0')}}</div>
         </div>
       </div>
    </div>
    <div class="row">
      <div class="col bg-orange-1 text-center q-py-md">Be Quiet</div>
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

    // Initialize Hijri offset
    loadHijriOffset()

    return {
      rightDrawerOpen,
      currentTime,
      currentDay,
      currentDate,
      hijriDate,
      hijriOffset,
      updateTime,
      toggleRightDrawer,
      updateOffset,
      updateHijriOffset,
      refreshHijriData
    }
  },
  data () {
    return {
      currentPrayerTime: {
        'Fajr': '00:00',
        'Dhuhr': '00:00',
        'Asr': '00:00',
        'Maghrib': '00:00',
        'Isha': '00:00'
      },
      prayerNames: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
      currentHour: 0,
      currentMinute: 0,
      upcomingPrayer: null,
      upcomingMinutes: 0,
      month: 0,
      date: 0,
      dateCluster: 1,
      extraMinutes: 0,
      notifEnabled: true
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

    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") this.notifEnabled = false
  },
  unmounted () {
    // Clean up the interval when component is unmounted
    if (this.clockInterval) {
      clearInterval(this.clockInterval)
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
      var prayerNames = Object.assign({} ,this.prayerNames)
      var checkTomorrow = true
      var foundPrayer = false
      
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

      if (checkTomorrow) {
        this.todayIndex = this.todayIndex + 1
        this.extraMinutes = 24 * 60 - (this.currentHour*60 + this.currentMinute)
        this.currentHour = 0
        this.currentMinute = 0
        this.updateDailyTime(true)
      }
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