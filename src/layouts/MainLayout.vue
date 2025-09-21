<template>
  <q-layout view="hHh lpR fFf">



    <q-page-container>
      <router-view :offset="offset" @update:offset="updateOffset" />
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
    const offset = ref(2)

    return {
      offset
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
    }
  }
}
</script>