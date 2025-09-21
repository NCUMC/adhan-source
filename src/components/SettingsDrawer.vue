<template>
  <q-drawer v-model="isOpen" side="right" overlay class="bg-secondary text-white">
    <!-- drawer content -->
    <div class="q-mx-md">
      <div class="row items-center justify-between q-mt-md">
        <div class="text-subtitle2">Simple Prayer Time</div>
        <q-btn 
          flat 
          round 
          icon="close" 
          color="white" 
          @click="closeDrawer"
          class="q-ml-auto"
        />
      </div>
      <div>Based on Chinese Muslim Association (CMA) Calculation<br><a class="text-white" href="https://thpc.taiwantrade.com/Taiwan_mosque#a2">Source</a></div>
      
      <div class="text-h5 q-mt-md">
        Settings
      </div>
      <label>Location</label>
      <q-select 
        dense 
        filled 
        bg-color="white" 
        emit-value 
        map-options 
        v-model="localOffset" 
        label-color="white" 
        :options="locationList"
        @update:model-value="updateOffset"
      />
      
      <div class="text-h5 q-mt-lg">
        Export
      </div>
      <q-btn 
        @click="exportDailyCSV" 
        color="white" 
        text-color="secondary"
        icon="download" 
        label="Export Daily Timetable CSV"
        class="full-width q-mt-sm"
      />
    </div>
  </q-drawer>
</template>

<script>
import { defineComponent, computed } from 'vue'
import prayerData from 'assets/timetable.json'

export default defineComponent({
  name: 'SettingsDrawer',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    offset: {
      type: Number,
      default: 2
    }
  },
  emits: ['update:modelValue', 'update:offset'],
  setup(props, { emit }) {
    const locationList = [
      {label: 'Taipei', value: 0},
      {label: 'Taoyuan, Yanmai', value: 2},
      {label: 'Hsinchu, Taichung, Changhua', value: 3},
      {label: 'Chiayi, Tainan, Kaoshiung, Pingtung', value: 5},
    ]

    const isOpen = computed({
      get() {
        return props.modelValue
      },
      set(value) {
        emit('update:modelValue', value)
      }
    })

    const localOffset = computed({
      get() {
        return props.offset
      },
      set(value) {
        emit('update:offset', value)
      }
    })

    const closeDrawer = () => {
      emit('update:modelValue', false)
    }

    const updateOffset = (newOffset) => {
      emit('update:offset', newOffset)
    }

    // Helper method to calculate cluster for date
    const clusterSet = (dateNum) => {
      if (dateNum < 11) return 0
      else if (dateNum < 21) return 1
      else return 2
    }

    // Helper method to calculate sunrise time (65 minutes after Fajr)
    const calculateSunrise = (fajrTime) => {
      const [hours, minutes] = fajrTime.split(':').map(Number)
      let totalMinutes = hours * 60 + minutes + 65
      
      // Handle day overflow
      if (totalMinutes >= 24 * 60) {
        totalMinutes -= 24 * 60
      }
      
      const newHours = Math.floor(totalMinutes / 60)
      const newMinutes = totalMinutes % 60
      
      return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
    }

    // Helper method to apply offset to time
    const applyOffset = (timeString, offset) => {
      const [hours, minutes] = timeString.split(':').map(Number)
      let totalMinutes = hours * 60 + minutes + parseInt(offset)
      
      // Handle day overflow
      if (totalMinutes >= 24 * 60) {
        totalMinutes -= 24 * 60
      }
      // Handle negative time (previous day)
      if (totalMinutes < 0) {
        totalMinutes += 24 * 60
      }
      
      const newHours = Math.floor(totalMinutes / 60)
      const newMinutes = totalMinutes % 60
      
      return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
    }

    // Helper method to check if year is leap year
    const isLeapYear = (year) => {
      return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
    }

    // Helper method to get days in month
    const getDaysInMonth = (month, year) => {
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      if (month === 1 && isLeapYear(year)) { // February (index 1) in leap year
        return 29
      }
      return daysInMonth[month]
    }

    // Helper method to get prayer times for a specific date
    const getPrayerTimesForDate = (date, offset) => {
      const month = date.getMonth()
      const day = date.getDate()
      const cluster = clusterSet(day)
      
      const monthData = prayerData[month] || []
      const dayData = monthData[cluster] || {}
      
      const times = {}
      const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
      prayerNames.forEach(name => {
        const baseTime = dayData[name] || '00:00'
        times[name] = applyOffset(baseTime, offset)
      })
      
      return times
    }

    // Helper method to format date as YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // Main export method
    const exportDailyCSV = () => {
      const currentYear = new Date().getFullYear()
      const csvData = []
      
      // Add header
      csvData.push('DATE,FAJR,SUNRISE,DHUHR,ASR,MAGHRIB,ISHA')
      
      // Generate data for each day of the year
      for (let month = 0; month < 12; month++) {
        const daysInMonth = getDaysInMonth(month, currentYear)
        
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(currentYear, month, day)
          const prayerTimes = getPrayerTimesForDate(date, props.offset)
          
          // Calculate sunrise (65 minutes after Fajr)
          const sunrise = calculateSunrise(prayerTimes.Fajr)
          
          // Format the CSV row
          const row = [
            formatDate(date),
            prayerTimes.Fajr,
            sunrise,
            prayerTimes.Dhuhr,
            prayerTimes.Asr,
            prayerTimes.Maghrib,
            prayerTimes.Isha
          ].join(',')
          
          csvData.push(row)
        }
      }
      
      // Create and download the CSV file
      const csvContent = csvData.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `daily_prayer_timetable_${currentYear}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }

    return {
      locationList,
      isOpen,
      localOffset,
      closeDrawer,
      updateOffset,
      exportDailyCSV
    }
  }
})
</script>
