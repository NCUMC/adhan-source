<template>
  <q-page class="">
    <div class="row q-mx-md q-py-md">
      <div class="col-md-4 col-sm-6 col-xs-12" v-for="(time, name) in currentPrayerTime" :key="name">
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
import { defineComponent } from 'vue'
import prayerData from 'assets/timetable.json'
export default defineComponent({
  name: 'IndexPage',
  props: ['offset'],
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
      locationList: [
        {label: 'Taipei', value: 0},
        {label: 'Taoyuan, Yanmai', value: 2},
        {label: 'Hsinchu, Taichung, Changhua', value: 3},
        {label: 'Chiayi, Tainan, Kaoshiung, Pingtung', value: 5},
      ],
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

    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") this.notifEnabled = false
  },
  methods: {
    clusterSet (dateNum) {
      if (dateNum < 11) return 1
      else if (dateNum < 21) return 2
      else return 3
    },
    updateDailyTime () {
      var offset = this.offset
      var prayerTime = Object.assign({} ,prayerData[this.month])
      var prayerNames = Object.assign({} ,this.prayerNames)
      var checkTomorrow = true
      var foundPrayer = false
      for (var idx in prayerNames) {
        let name = prayerNames[idx]
        var parts = prayerTime[name+this.dateCluster].split(':')
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