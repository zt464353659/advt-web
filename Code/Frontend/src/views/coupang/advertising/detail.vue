<template>
  <component :is="current" :detailData="advtData" :showBtn="showBtn" :listQueryAdvtStatus="listQueryAdvtStatus" @listenForbid="forbid" @reload="reload"></component>
</template>

<script>
import single from './detail/single'
import variation from './detail/variation'
import { fetchDetail } from '@/api/coupang'

export default {
  components: { single, variation },
  data() {
    return {
      current: null,
      advtData: null
    }
  },
  created() {
    this.init('init')
    console.log('route', this.$route)
  },
  computed: {
    showBtn() {
      return this.$route.params.showBtn
    },
    listQueryAdvtStatus(){
      //把variation广告详情传递过来的状态码传入
      console.log(this.$route.params.state)
      return  this.$route.params.state
    }
  },
  methods: {
    reload() {
      this.init('init')
    },
    init(inittype) {
      const loading = this.$loading({
        lock: true,
        text: '努力加载中',
        background: 'rgba(0, 0, 0, 0.5)'
      })
      if (inittype === 'name') {
        this.advtData.name = ''
      }
      fetchDetail(this.$route.params.id).then(response => {
        const newres = this._.cloneDeep(response)
        switch (Number(newres.data.type)) {
          case 2:
            if (inittype === 'init') {
              this.current = 'variation'
            }
            //提前把数组keyword转换为字符串
            newres.data.product_info.data.keyword = this._.cloneDeep(newres.data.product_info.data.keyword).join('\n').toString()
            this._.forEach(newres.data.product_info.list, (list, index) => {
              // vary图片
              // if (index == 1) {
              //   console.log(index)
              //   list.description = '这是啥'
              //   console.log(list.description, '调试')
              // }else if(index == 2){
              //   list.description = '这是第二个'
              // }
              //提前把数组keyword转换为字符串
              list.keyword = this._.cloneDeep(list.keyword).join('\n').toString()
              this._.forEach(list.attrbutes, item => {
                item.inputValue = item.value
                if (!item.optionValue) {
                  item.optionValue = item.option[0]
                }
                if (item.optionStatus && item.optionValue && item.value) {
                  item.inputValue = item.value.slice(0, item.value.indexOf(item.optionValue))
                }
              })
            })
            break
          default:
            if (inittype === 'init') {
              this.current = 'single'
            }
            //提前把数组keyword转换为字符串
            newres.data.product_info.keyword = this._.cloneDeep(newres.data.product_info.keyword).join('\n').toString()
            this._.forEach(newres.data.product_info.attrbutes, item => {
              item.inputValue = item.value
              if (!item.optionValue) {
                item.optionValue = item.option[0]
              }
              if (item.optionStatus && item.optionValue && item.value) {
                item.inputValue = item.value.slice(0, item.value.indexOf(item.optionValue))
              }
            })
        }
        this.advtData = newres.data
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
