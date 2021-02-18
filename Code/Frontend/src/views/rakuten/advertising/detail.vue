<template>
  <component :is="current" :detailData="advtData"></component>
</template>

<script>
  import single from './detail/single'
  import variation from './detail/variation'
  import { fetchDetail } from '@/api/rakuten'

  export default {
    components: { single, variation },
    data() {
      return {
        current: null,
        advtData: null
      }
    },
    created() {
      const loading = this.$loading({
        lock: true,
        text: '努力加载中',
        background: 'rgba(0, 0, 0, 0.5)'
      })
      fetchDetail(this.$route.params.id).then(response => {
        this.advtData = response.data
        // 无缩略图链接时使用主图链接
        if (this.advtData.type === '1') {
          this._.forEach(this.advtData.product_info.images, V => {
            if (!V.product_image_thumb) {
              V.product_image_thumb = V.image_path
            }
          })
        } else if (this.advtData.type === '2') {
          this._.forEach(this.advtData.product_info.data.images, V => {
            if (!V.product_image_thumb) {
              V.product_image_thumb = V.image_path
            }
          })
        }
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
    }
  }
</script>
