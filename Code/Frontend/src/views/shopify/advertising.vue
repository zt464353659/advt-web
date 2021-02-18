<template>
  <component v-if="$route.name === 'shopify.advertising'" :is="current"></component>
  <router-view v-else></router-view>
</template>
<script>
  import advtList from './advertising/list'

  export default {
    components: { advtList },
    data() {
      return {
        current: 'advtList'
      }
    }
  }
</script>
