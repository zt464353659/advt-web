<template>
  <component v-if="$route.name === 'shopee.discount'" :is="current"></component>
  <router-view v-else></router-view>
</template>
<script>
  import discountList from './discount/list'

  export default {
    components: { discountList },
    data() {
      return {
        current: 'discountList'
      }
    },
    created() {
    }
  }
</script>
