<template>
  <component :is="current" :detailData="advtData" @listenForbid="forbid"></component>
</template>

<script>
  import single from './detail/single'
  import { fetchDetail } from '@/api/kr11street'

  export default {
    components: { single },
    data() {
      return {
        current: null,
        advtData: null
      }
    },
    created() {
      this.init('init')
    },
    methods: {
      init(inittype) {
        const loading = this.$loading({
          lock: true,
          text: '努力加载中',
          background: 'rgba(0, 0, 0, 0.5)'
        })
        if (inittype === 'name') { this.advtData.name = '' }
        fetchDetail(this.$route.params.id).then(response => {
          this.advtData = response.data
          this.current = 'single'
          setTimeout(() => {
            loading.close()
          }, 800)
        }).catch(() => {
          loading.close()
        })
      },
      forbid(m, n) {
        this.advtData.is_under_age = m
        this.advtData.product_info.images = n
      }
    }
  }
</script>
