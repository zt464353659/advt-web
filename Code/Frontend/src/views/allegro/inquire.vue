<template>
  <component v-if="$route.name === 'allegro.inquire'" :is="current"></component>
  <router-view v-else></router-view>
</template>

<script>
  import inquireList from './inquire/list'

  export default {
    components: { inquireList },
    data() {
      return {
        current: 'inquireList'
      }
    }
  }
</script>
