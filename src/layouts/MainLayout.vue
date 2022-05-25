<template>
  <q-layout view="hHh lpR fFf">

    <q-header class="bg-white text-dark">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar size="sm" class="q-ml-md">
            <q-img src="icons/icon-256x256.png"/>
          </q-avatar>
          Adhan
        </q-toolbar-title>

        <q-btn dense flat round icon="menu" @click="toggleRightDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="rightDrawerOpen" side="right" overlay class="bg-secondary text-white">
      <!-- drawer content -->
      <div class="q-mx-md">
        <div class="text-subtitle2 q-mt-md">Simple Prayer Time</div>
        <div>Based on Chinese Muslim Association (CMA) Calculation<br><a class="text-white" href="https://thpc.taiwantrade.com/Taiwan_mosque#a2">Source</a></div>
        <div class="text-h5 q-mt-md">
          Settings
        </div>
        <label>Location</label>
        <q-select dense filled bg-color="white" emit-value map-options v-model="offset" label-color="white" :options="locationList"></q-select>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view :offset="offset" />
    </q-page-container>

  </q-layout>
</template>

<script>
import { ref } from 'vue'

export default {
  data () {
    return {
      locationList: [
        {label: 'Taipei', value: 0},
        {label: 'Taoyuan, Yanmai', value: 2},
        {label: 'Hsinchu, Taichung, Changhua', value: 3},
        {label: 'Chiayi, Tainan, Kaoshiung, Pingtung', value: 5},
      ]
    }
  },
  setup () {
    const rightDrawerOpen = ref(false)
    const offset = ref(2)

    return {
      rightDrawerOpen,
      offset,
      toggleRightDrawer () {
        rightDrawerOpen.value = !rightDrawerOpen.value
      }
    }
  },
  mounted () {
    var offset = this.offset
    try {
      offset = parseInt(localStorage.getItem('offset'))
      if (isNaN(offset)) {
        offset = 2
      }
      localStorage.setItem('offset', offset)
      this.offset = offset
    } catch (err) {
      console.log(err)
      localStorage.setItem('offset', 2)
      this.offset = 2
    }
  },
  methods: {
    updateOffset (offset) {
      localStorage.setItem('offset', offset)
      this.offset = offset
    },
  }
}
</script>