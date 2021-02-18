<template>
  <component :is="current" :data="advtData" @listenForbid="forbid"></component>
</template>

<script>
import single from './detail/single'
import { fetchDetail } from '@/api/real'

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
    init(type) {
      const loading = this.$loading({
        lock: true,
        text: '努力加载中',
        background: 'rgba(0, 0, 0, 0.5)'
      })
      fetchDetail(this.$route.params.id).then(response => {
        this.advtData = response.data
        let editAttribute =[],readAttribute = []
        this.advtData.attribute.forEach(item => {
          if (parseInt(item.is_variation) === 0) {
            editAttribute.push(item)
          } else {
            readAttribute.push(item)
          }
        })
        this.advtData.editAttribute = editAttribute
        this.advtData.readAttribute = readAttribute
        if (type === 'init') { this.current = 'single' }
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
