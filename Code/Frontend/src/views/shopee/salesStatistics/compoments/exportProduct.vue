<template>
  <el-dialog
    title="导出产品日销售统计报表"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="clearAccount"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    width="600px"
    v-dragMove
  >
    <template>
      <el-form ref="formData" :model="formData" label-width="100px" size="small">
        <el-form-item label="日期" prop="time">
          <el-date-picker
            v-model="formData.time"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期" style="width: 80%"
            value-format="timestamp"
            :default-time="['00:00:00', '23:59:59']"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="clearAccount">取 消</el-button>
      <el-button type="primary" @click="search(data)">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { salesExcel } from '@/api/shopee'
  import { exportDaySales } from '@/views/shopee/export'

  export default {
    data() {
      return {
        formData: {}
      }
    },
    props: {
      open: Boolean,
      data: {
        type: Object,
        default: () => {}
      }
    },
    created() {
    },
    mounted() {
    },
    methods: {
      clearAccount() {
        this.closeClearForm()
      },
      closeClearForm() {
        this.$emit('update:open', false)
        this.formData = {
          time: null
        }
      },
      search(arr) {
        if (this.formData.time) {
          let obj = {}
          if (arr.length !== 0) {
            const productIdArr = []
            arr.forEach(v => {
              productIdArr.push(v.istore_product_id)
            })
            obj = {
              start_time: this.formData.time[0] / 1000,
              end_time: this.formData.time[1] / 1000,
              istore_product_id: this._.compact(this._.uniq(productIdArr)).join(' ')
            }
          } else {
            obj = {
              start_time: this.formData.time[0] / 1000,
              end_time: this.formData.time[1] / 1000
            }
          }
          salesExcel(obj).then((res) => {
            res.data.forEach(v => {
              v.census_time = new Date(v.census_time * 1000).toLocaleDateString()
            })
            exportDaySales(res.data)
          }).finally(() => {
            this.closeClearForm()
          })
        } else {
          this.$message({
            message: '请选择需要导出的日期',
            type: 'error'
          })
        }
      }
    },
    filters: {},
    watch: {}
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
