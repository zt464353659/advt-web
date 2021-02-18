<template>
  <component v-if="$route.name === 'shopee.salesStatistics'" :is="current"></component>
  <router-view v-else></router-view>
</template>
<script>
  import salesStatistics from './salesStatistics/list'

  export default {
    components: { salesStatistics },
    data() {
      return {
        current: 'salesStatistics'
      }
    },
    created() {
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
