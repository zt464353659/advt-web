<template>
  <component v-if="$route.name === 'shopee.instrument'" :is="current"></component>
  <router-view v-else></router-view>
</template>
<script>
  import instrumentList from './instrument/list'

  export default {
    components: { instrumentList },
    data() {
      return {
        current: 'instrumentList'
      }
    }
  }
</script>
