<template>
  <q-page class="">
    <!-- Toolbar with clock, avatar, and drawer button -->
    <div class="row items-center q-pa-md bg-white">
      <div class="col">
        <div class="text-h1 text-black q-my-md q-px-none">
          {{ currentTime }}
        </div>
      </div>
      <div class="col-auto">
        <q-avatar size="sm" class="q-ml-md cursor-pointer" @click="toggleRightDrawer">
          <q-img src="icons/icon-256x256.png"/>
        </q-avatar>
        <q-btn dense flat round icon="menu" @click="toggleRightDrawer" class="q-ml-sm" />
      </div>
    </div>

    <!-- Settings Drawer Component -->
    <SettingsDrawer 
      v-model="rightDrawerOpen" 
      :offset="offset" 
      @update:offset="updateOffset"
    />

    <div class="row">
      <div class="col-md-8 col-sm-6 col-xs-12">
        <div class="full-width" v-for="(time, name) in currentPrayerTime" :key="name">
          <q-card bordered flat :class="'my-card text-center q-ma-sm radius-5 ' + (upcomingPrayer === name ? 'bg-secondary text-white' : '')">
            <q-card-section class="q-py-sm ">
              <div class="text-subtitle1 text-capitalize text-bold">
                {{name}}
                <span v-if="upcomingPrayer === name" class="text-subtitle1 text-lowercase">| in {{upcomingHour}} hours {{upcomingMinute}} minutes</span>
              </div>
              <div class="text-h4">{{time}}</div>
            </q-card-section>
          </q-card>
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

    const updateTime = () => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      currentTime.value = `${hours}:${minutes}:${seconds}`
    }

    const toggleRightDrawer = () => {
      rightDrawerOpen.value = !rightDrawerOpen.value
    }

    const updateOffset = (newOffset) => {
      emit('update:offset', newOffset)
    }

    return {
      rightDrawerOpen,
      currentTime,
      updateTime,
      toggleRightDrawer,
      updateOffset
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