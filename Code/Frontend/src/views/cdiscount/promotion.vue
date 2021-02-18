<template>
  <component v-if="$route.name === 'cdiscount.promotion'" :is="current"></component>
  <router-view v-else></router-view>
</template>
<script>
  import promotionList from './promotion/list'

  export default {
    components: { promotionList },
    data() {
      return {
        current: 'promotionList'
      }
    }
  }
</script>
