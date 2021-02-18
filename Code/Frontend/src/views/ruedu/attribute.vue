<template>
  <component v-if="$route.name === 'ruedu.attribute'" :is="current"></component>
  <router-view v-else></router-view>
</template>
<script>
  import attrList from './attribute/list'

  export default {
    components: { attrList },
    data() {
      return {
        current: 'attrList'
      }
    }
  }
</script>
