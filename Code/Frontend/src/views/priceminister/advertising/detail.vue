<template>
  <component :is="current" :data="advtData" @listenForbid="forbid" @emit-reload="getDetail"></component>
</template>

<script>
  import single from './detail/single'
  import { fetchDetail } from '@/api/priceminister'

  export default {
    components: { single },
    data() {
      return {
        current: null,
        advtData: null
      }
    },
    created() {
      this.getDetail()
    },
    methods: {
      forbid(m, n) {
        this.advtData.is_under_age = m
        this.advtData.product_info.images = n
      },
      getDetail() {
        const loading = this.$loading({
          lock: true,
          text: '努力加载中',
          background: 'rgba(0, 0, 0, 0.5)'
        })
        fetchDetail(this.$route.params.id).then(response => {
          this.advtData = response.data
          this.advtData.clone_key_word = this.advtData.key_word.join('\n')
          this.current = 'single'
          setTimeout(() => {
            loading.close()
          }, 800)
        }).catch(() => {
          loading.close()
        })
      }
    }
  }
</script>
