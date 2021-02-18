<template>
  <component v-if="$route.name === 'shopee.discountPlain'" :is="current"></component>
  <router-view v-else></router-view>
</template>
<script>
  import discountPlainList from './discountPlain/list'

  export default {
    components: { discountPlainList },
    data() {
      return {
        current: 'discountPlainList'
      }
    },
    created() {
    }
  }
</script>
