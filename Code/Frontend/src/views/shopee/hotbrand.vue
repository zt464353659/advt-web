<!--
 * @Author: zhangzhengzhe
 * @Date: 2019-06-05 11:49:07
 * @LastEditors: zhangzhengzhe
 * @LastEditTime: 2019-06-05 13:15:48
 -->
<template>
  <component v-if="$route.name === 'shopee.hotbrand'" :is="current"></component>
  <router-view v-else></router-view>
</template>
<script>
  import hotbrandList from './hotbrand/list'

  export default {
    components: { hotbrandList },
    data() {
      return {
        current: 'hotbrandList'
      }
    },
    created() {
    }
  }
</script>
