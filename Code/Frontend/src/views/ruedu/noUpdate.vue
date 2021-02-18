<template>
  <component v-if="$route.name === 'ruedu.noUpdate'" :is="current"></component>
  <router-view v-else></router-view>
</template>

<script>
  import noUpdateList from './noUpdate/list'

  export default {
    components: { noUpdateList },
    data() {
      return {
        current: 'noUpdateList'
      }
    }
  }
</script>
