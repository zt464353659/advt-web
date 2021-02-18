<template>
  <el-dialog :title="'下架提示'" v-dragMove :visible="open" :before-close="onClose" width="600px" :close-on-press-escape="false" :close-on-click-modal="false">
    <p>包含{{ listData.length }}个有销量的广告，是否下架/删除广告？</p>
    <div class="content-box">
      <el-table :data="listData"
                ref="table"
                :key="newDate"
                border
                style="width: 100%"
      >
        <el-table-column prop="site_code" label="Site Code"></el-table-column>
        <el-table-column prop="istore_product_id" label="Product ID"></el-table-column>
        <el-table-column prop="sales" label="销量"></el-table-column>
      </el-table>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="onSubmit">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
  import { setInventory, shelves, deletePlatformAdvt } from '@/api/shopee'

  export default {
    data() {
      return {
        num: '2',
        listData: [],
        newDate: new Date().getTime()
      }
    },
    props: {
      open: Boolean,
      options: {
        type: Array,
        default: () => {}
      },
      stateOptions: {
        type: String,
        default: ''
      }
    },
    watch: {
      open(val) {
        if (val) {
          this.listData = this.options.filter(v => Number(v.sales) > 0)
        }
      }
    },
    methods: {
      onSubmit() {
        const params = this.options.filter(v => v.pending === 0)
        // 未上架状态走删除接口，其余状态走下架接口
        if (this.stateOptions === '1') {
          const obj = {
            id: this._.map(params, 'id'),
            type: 1
          }
          // 下架接口
          shelves(obj).then(() => {
            this.$emit('renderList')
          }).catch((err) => {
          }).finally(() => {
            this.onClose()
          })
        } else {
          deletePlatformAdvt(this._.map(params, 'id')).then(() => {
            this.$emit('renderList')
          }).catch((err) => {
          }).finally(() => {
            this.onClose()
          })
        }
      },
      onClose() {
        this.listData = []
        this.$emit('update:open', false)
      }
    }
  }
</script>
