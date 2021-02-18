<template>
  <component v-if="$route.name === 'shopee.salesReport'" :is="current"></component>
  <router-view v-else></router-view>
</template>
<script>
  import salesReport from './salesReport/list'

  export default {
    components: { salesReport },
    data() {
      return {
        current: 'salesReport'
      }
    },
    created() {
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
