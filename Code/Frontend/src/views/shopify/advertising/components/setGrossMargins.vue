<template>
  <el-dialog :title="'设置毛利率'" :visible="open" :before-close="onClose" width="600px" v-loading="loading">
    <el-form ref="form" label-width="80px" :model="form" :rules="rules" size="small">
      <el-form-item label="毛利率" prop="gross_margin">
        <el-input v-model="form.gross_margin" style="width: 400px"></el-input>
      </el-form-item>
      <el-form-item label="时间" prop="begin_time">
        <div class="block">
          <el-date-picker
            v-model="form.begin_time"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="timestamp"
            :picker-options="pickerOptions1"
          >
          </el-date-picker>
        </div>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="onSubmit('form')">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
  import { updateCustomerPrice } from '@/api/shopify'
  export default {
    data() {
      const checkPrice = (rule, value, callback) => {
        const reg = /^\d\.([1-9]{1,2}|[0-9][1-9])$|^[1-9]\d{0,1}(\.\d{1,2}){0,1}$|^100(\.0{1,2}){0,1}$/
        if (!reg.test(value)) {
          callback(new Error('毛利率必须是0-100之间的数字'))
        } else {
          callback()
        }
      }
      const checkTime = (rule, value, callback) => {
        if (value[0] < this.defaultTime) {
          callback(new Error('开始时间不能小于当前时间'))
        } else {
          callback()
        }
      }
      return {
        loading: true,
        // 设置时间
        pickerOptions1: {
          disabledDate(time) {
            return time.getTime() < (Date.now() - 60 * 60 * 24 * 1000)
          }
        },
        defaultTime: Date.now(),
        form: {
          gross_margin: null,
          begin_time: ''
        },
        rules: {
          gross_margin: [
            { required: true, message: '您输入的毛利率必须是0-100之间的数字且不大于两位小数', trigger: 'blur' },
            { validator: checkPrice, trigger: 'blur' }
          ],
          begin_time: [
            { required: true, message: '请选择日期', trigger: 'blur' },
            { validator: checkTime, trigger: 'blur' }
          ]
        }
      }
    },
    props: {
      advtIds: {
        type: Array,
        default: () => {},
        required: false
      },
      grossMargin: {
        type: [String, Number],
        default: ''
      },
      open: {
        type: Boolean,
        required: true
      }
    },
    watch: {
      open(val) {
        if (val) {
          this.form.gross_margin = this.grossMargin
        }
      }
    },
    methods: {
      onSubmit(formName) {
        this.$refs[formName].validate((valid) => {
          this.loading = true
          if (valid) {
            const ids = []
            const prices = []
            const start_time = []
            const end_time = []
            this._.forEach(this.advtIds, (v) => {
              ids.push(v)
              prices[v] = this.form.gross_margin
              start_time[v] = this.form.begin_time[0] / 1000
              end_time[v] = this.form.begin_time[1] / 1000
            })
            const obj = {
              start_time: start_time,
              end_time: end_time,
              gross_margin: prices,
              product_id: ids,
              custom_price_type: 2
            }
            updateCustomerPrice(obj).finally(() => {
              this.loading = false
              this.$refs['form'].resetFields()
              this.$emit('update:open', false)
              this.$emit('renderList')
            })
          } else {
            return false
          }
        })
      },
      onClose() {
        this.$emit('update:open', false)
        this.$refs['form'].resetFields()
      }
    }
  }
</script>
