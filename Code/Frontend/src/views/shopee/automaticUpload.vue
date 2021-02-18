<template>
  <component v-if="$route.name === 'shopee.automaticUpload'" :is="current"></component>
  <router-view v-else></router-view>
</template>

<script>
  import automaticUpload from './automaticUpload/list'

  export default {
    components: { automaticUpload },
    data() {
      return {
        current: 'automaticUpload'
      }
    },
    created() {
    },
    mounted() {
    },
    methods: {},
    filters: {},
    watch: {}
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
