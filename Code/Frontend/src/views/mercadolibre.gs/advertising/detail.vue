<template>
  <component :is="current" :detailData="advtData"></component>
</template>

<script>
import single from './detail/single'
import variation from './detail/variation'
import { fetchDetail } from '@/api/mercadolibre.gs'

export default {
  components: { single, variation },
  data() {
    return {
      current: null,
      advtData: null
    }
  },
  created() {
    try {
      const loading = this.$loading({
        lock: true,
        text: '努力加载中',
        background: 'rgba(0, 0, 0, 0.5)'
      })
      fetchDetail(this.$route.params.id).then(response => {
        this.advtData = response.data
        switch (parseInt(this.advtData.type)) {
          case 1:
            this.current = 'single'
            break
          case 2:
            this.current = 'variation'
            break
          default:
            this.current = 'single'
        }
        setTimeout(() => {
          loading.close()
        }, 800)
      }).catch(() => {
        loading.close()
      })
    } catch (e) {
      console.log(e)
    }
  }
}
</script>
