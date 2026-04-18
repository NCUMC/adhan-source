<template>
  <q-layout view="hHh lpR fFf">



    <q-page-container>
      <router-view :offset="offset" @update:offset="updateOffset" />
    </q-page-container>

  </q-layout>
</template>

<script>
import { ref } from 'vue'
import { DEFAULT_LOCATION_VALUE } from 'src/utils/prayerTimes'

export default {
  setup () {
    const offset = ref(DEFAULT_LOCATION_VALUE)

    return {
      offset
    }
  },
  mounted () {
    var offset = this.offset
    try {
      offset = parseInt(localStorage.getItem('offset'))
      if (isNaN(offset)) {
        offset = DEFAULT_LOCATION_VALUE
      }
      localStorage.setItem('offset', offset)
      this.offset = offset
    } catch (err) {
      console.log(err)
      localStorage.setItem('offset', DEFAULT_LOCATION_VALUE)
      this.offset = DEFAULT_LOCATION_VALUE
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