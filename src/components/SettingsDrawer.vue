<template>
  <q-drawer v-model="isOpen" side="right" overlay class="bg-secondary text-white">
    <!-- drawer content -->
    <div class="q-mx-md q-mb-lg">
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
      <q-expansion-item
        v-model="expandedSections.location"
        class="text-white"
        header-class="text-h5"
        label="Location"
        default-opened
      >
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
      </q-expansion-item>
      <!-- Desktop Mode Only -->
      <div v-if="$q.platform.is.desktop">
        <q-expansion-item
          v-model="expandedSections.font_setting"
          class="text-white"
          header-class="text-h5"
          label="Font Size Setting"
          default-opened
        >
          <div class="q-mb-sm">
            <label>Main Clock Font Size (vh)</label>
            <q-input 
              dense 
              filled 
              bg-color="white" 
              v-model.number="localMainClockSize" 
              label-color="white" 
              type="number"
              hint="Main clock font size in vh"
            />
          </div>
          <div class="q-mb-sm">
            <label>Prayer Time Font Size (vh)</label>
            <q-input 
              dense 
              filled 
              bg-color="white" 
              v-model.number="localPrayerTimeFontSize" 
              label-color="white" 
              type="number"
              hint="Prayer time font size in vh"
            />
          </div>
          <div class="q-mb-sm">
            <label>Prayer Name Font Size (vh)</label>
            <q-input 
              dense 
              filled 
              bg-color="white" 
              v-model.number="localPrayerNameFontSize" 
              label-color="white" 
              type="number"
              hint="Prayer name font size in vh"
            />
          </div>
        </q-expansion-item>

        <q-expansion-item
          v-model="expandedSections.hijri"
          class="text-white"
          header-class="text-h5"
          label="Hijri Date"
          default-opened
        >
          <label>Date Adjustment (Days)</label>
          <q-input 
            dense 
            filled 
            bg-color="white" 
            v-model.number="localHijriOffset" 
            label-color="white" 
            type="number"
            hint="Adjust Hijri date (+/- days)"
            @update:model-value="updateHijriOffset"
          />
          <q-btn 
            @click="refreshHijriData" 
            color="white" 
            text-color="secondary"
            icon="refresh" 
            label="Refresh Date Data"
            class="full-width q-mt-sm"
          />
        </q-expansion-item>

        <q-expansion-item
          v-model="expandedSections.iqamah"
          class="text-white"
          header-class="text-h5"
          label="Iqamah Countdown (minutes)"
          default-opened
        >
          <div v-for="prayer in ['Fajr','Dhuhr','Asr','Maghrib','Isha']" :key="prayer" class="q-mb-sm">
            <label>{{prayer}}</label>
            <q-input
              dense filled bg-color="white" label-color="white"
              type="number" min="0" max="60"
              v-model.number="localIqamahConfig[prayer]"
              @update:model-value="updateIqamahConfig"
            />
          </div>
        </q-expansion-item>
          
        <q-expansion-item
          v-model="expandedSections.messages"
          class="text-white"
          header-class="text-h5"
          label="Reminder Messages (Minutes)"
          default-opened
        >
          <div v-for="(message, index) in localMessages" :key="index" class="q-mb-sm">
            <div class="row items-center q-gutter-sm">
              <q-input
                dense filled bg-color="white" label-color="white"
                class="col"
                v-model="message.text"
                @update:model-value="updateMessages"
              />
              <q-input
                dense filled bg-color="white" label-color="white"
                class="col-3"
                type="number"
                v-model.number="message.duration"
                @update:model-value="updateMessages"
              />
              <q-btn
                flat round dense
                icon="delete"
                color="white"
                @click="removeMessage(index)"
              />
            </div>
          </div>
          <q-btn
            flat
            icon="add"
            label="Add Message"
            class="full-width q-mt-sm"
            @click="addMessage"
          />
        </q-expansion-item>

        <q-expansion-item
          v-model="expandedSections.images"
          class="text-white"
          header-class="text-h5"
          label="Rotating Images (Minutes)"
          default-opened
        >
          <q-checkbox
            v-model.boolean="localEnableScreenSaver"
            @update:model-value="updateEnableScreenSaver"
            label="Enable Screen Saver"
          />
          <div v-for="(image, index) in localImages" :key="index" class="q-mb-sm">
            <div class="row items-center q-gutter-sm">
              <q-input
                dense filled bg-color="white" label-color="white"
                class="col"
                v-model="image.url"
                placeholder="Image URL or path"
                @update:model-value="updateImages"
              />
              <q-input
                dense filled bg-color="white" label-color="white"
                class="col-3"
                type="number"
                min="1"
                v-model.number="image.duration"
                @update:model-value="updateImages"
              />
              <q-btn
                flat round dense
                icon="delete"
                color="white"
                @click="removeImage(index)"
              />
            </div>
            <!-- Preview -->
            <q-img
              :src="image.url"
              :ratio="1"
              class="q-mt-xs"
              style="max-width: 200px"
              @error="handleImageError(index)"
            />
          </div>
          <q-btn
            flat
            icon="add"
            label="Add Image"
            class="full-width q-mt-sm"
            @click="addImage"
          />
        </q-expansion-item>
      </div>
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
      <div v-if="$q.platform.is.mobile">
        <div class="text-subtitle1 q-mt-md">Contact Us</div>
        <div @click="openURL('https://www.instagram.com/ncu.muslimclub')" class="cursor-pointer text-subtitle1"><q-icon name="fa-brands fa-instagram" class="q-mr-xs" color="white"/>@ncu.muslimclub</div>
        <div @click="openURL('mailto:ncumuslimclub@gmail.com')" class="cursor-pointer text-subtitle1"><q-icon name="mail" class="q-mr-xs" color="white"/>ncumuslimclub@gmail.com</div>
      </div>
    </div>
  </q-drawer>
</template>

<script>
import { defineComponent, computed, ref, watch } from 'vue'
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
    },
    hijriOffset: {
        type: Number,
        default: 0
    },
    mainClockSize: {
        type: Number,
        default: 15
    },
    prayerTimeFontSize: {
        type: Number,
        default: 8
    },
    prayerNameFontSize: {
        type: Number,
        default: 5
    },
    iqamahConfig: {
        type: Object,
        default: () => ({ Fajr: 10, Dhuhr: 10, Asr: 10, Maghrib: 10, Isha: 10 })
    },
    messages: {
        type: Array,
        default: () => [{ text: 'Please keep your phone silent during prayer!', duration: 1 }]
    },
    images: {
        type: Array,
        default: () => [{ url: 'quotes.jpeg', duration: 0.5 }]
    },
    enableScreenSaver: {
        type: Boolean,
        default: false
    }
  },
  emits: [
    'update:modelValue',
    'update:offset',
    'update:hijri-offset',
    'update:main-clock-size',
    'update:prayer-time-font-size',
    'update:prayer-name-font-size',
    'refresh-hijri-data',
    'update:iqamah-config',
    'update:messages',
    'update:images',
    'update:enableScreenSaver'
  ],
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

    const localHijriOffset = computed({
      get() {
        return props.hijriOffset
      },
      set(value) {
        emit('update:hijri-offset', value)
      }
    })

    const localMainClockSize = computed({
      get() {
        return props.mainClockSize
      },
      set(value) {
        localStorage.setItem('mainClockSize', value)
        emit('update:main-clock-size', value)
      }
    })
    
    const localPrayerTimeFontSize = computed({
      get() {
        return props.prayerTimeFontSize
      },
      set(value) {
        localStorage.setItem('prayerTimeFontSize', value)
        emit('update:prayer-time-font-size', value)
      }
    })
    
    const localPrayerNameFontSize = computed({
      get() {
        return props.prayerNameFontSize
      },
      set(value) {
        localStorage.setItem('prayerNameFontSize', value)
        emit('update:prayer-name-font-size', value)
      }
    })

    // Track expanded state of sections
    const expandedSections = ref({
      location: false,
      hijri: false,
      iqamah: false,
      messages: false,
      images: false,
      font_setting: false,
    })

    const closeDrawer = () => {
      // Collapse all sections when drawer closes
      expandedSections.value.location = false
      expandedSections.value.hijri = false
      expandedSections.value.iqamah = false
      expandedSections.value.messages = false
      expandedSections.value.images = false
      expandedSections.value.font_setting = false
      emit('update:modelValue', false)
    }

    const updateOffset = (newOffset) => {
      emit('update:offset', newOffset)
    }

    const updateHijriOffset = (newOffset) => {
      emit('update:hijri-offset', newOffset)
    }

    const refreshHijriData = () => {
      // Clear cached data and trigger refresh
      localStorage.removeItem('hijriDateCache')
      localStorage.removeItem('hijriDateLastUpdate')
      // Emit event to parent to refresh
      emit('refresh-hijri-data')
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
      let totalMinutes = hours * 60 + minutes + 70
      
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

    // Screen saver setting (boolean)
    const localEnableScreenSaver = ref(!!props.enableScreenSaver)

    watch(
      () => props.enableScreenSaver,
      (val) => {
        localEnableScreenSaver.value = !!val
      }
    )

    function updateEnableScreenSaver() {
      // Persist and emit boolean value
      localStorage.setItem('enableScreenSaver', JSON.stringify(localEnableScreenSaver.value))
      emit('update:enableScreenSaver', localEnableScreenSaver.value)
    }

    // Iqamah Config
    const localIqamahConfig = ref({ ...props.iqamahConfig })

    watch(
      () => props.iqamahConfig,
      (val) => {
        localIqamahConfig.value = { ...val }
      }
    )

    function updateIqamahConfig() {
      // Emit a copy to avoid mutation issues
      emit('update:iqamah-config', { ...localIqamahConfig.value })
    }

    // Watch drawer state to reset expanded sections when opened
    watch(() => isOpen.value, (newValue) => {
      if (newValue) {
        // When drawer opens, set all sections to expanded
        expandedSections.value.location = false
        expandedSections.value.hijri = false
        expandedSections.value.iqamah = false
        expandedSections.value.messages = false
        expandedSections.value.images = false
        expandedSections.value.font_setting = false
      }
    })

    // Message configuration
    const localMessages = ref([...props.messages])

    const addMessage = () => {
      localMessages.value.push({ text: '', duration: 10 })
      updateMessages()
    }

    const removeMessage = (index) => {
      localMessages.value.splice(index, 1)
      if (localMessages.value.length === 0) {
        localMessages.value.push({ text: 'Please keep your phone silent during prayer!', duration: 10 })
      }
      updateMessages()
    }

    const updateMessages = () => {
      emit('update:messages', [...localMessages.value])
    }

    watch(() => props.messages, (newVal) => {
      localMessages.value = [...newVal]
    })

    // Image configuration
    const localImages = ref([...props.images])
    
    const addImage = () => {
      localImages.value.push({ url: '', duration: 1 })
      updateImages()
    }
    
    const removeImage = (index) => {
      localImages.value.splice(index, 1)
      if (localImages.value.length === 0) {
        localImages.value.push({ url: 'quotes.jpeg', duration: 0.5 })
      }
      updateImages()
    }
    
    const handleImageError = (index) => {
      // You can show a notification or handle invalid image URLs here
      console.error(`Failed to load image at index ${index}:`, localImages.value[index].url)
    }
    
    const updateImages = () => {
      emit('update:images', [...localImages.value])
    }
    
    watch(() => props.images, (newVal) => {
      localImages.value = [...newVal]
    })

    return {
      locationList,
      isOpen,
      localOffset,
      localHijriOffset,
      localIqamahConfig,
      localEnableScreenSaver,
      localMessages,
      localImages,
      expandedSections,
      localPrayerNameFontSize,
      localPrayerTimeFontSize,
      localMainClockSize,
      closeDrawer,
      updateOffset,
      updateHijriOffset,
      refreshHijriData,
      exportDailyCSV,
      updateIqamahConfig,
      updateEnableScreenSaver,
      addMessage,
      removeMessage,
      updateMessages,
      addImage,
      removeImage,
      handleImageError,
      updateImages,
    }
  }
})
</script>
