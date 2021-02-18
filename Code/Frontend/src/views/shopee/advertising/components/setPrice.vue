<template>
  <el-dialog :title="'设置指定价'" v-dragMove :visible="open" :before-close="onClose" width="600px" v-loading="loading" :close-on-press-escape="false" :close-on-click-modal="false">
    <el-form ref="form" label-width="80px" :model="form" :rules="rules" size="small">
      <el-form-item label="指定价" prop="price">
        <el-input v-model="form.price" style="width: 400px"></el-input>
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
  import { updateCustomerPrice } from '@/api/shopee'

  export default {
    data() {
      const checkPrice = (rule, value, callback) => {
        const reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,2}?$/
        if (!reg.test(value)) {
          callback(new Error('存在非法字符'))
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
        pickerOptions1: {
          disabledDate(time) {
            return time.getTime() < (Date.now() - 60 * 60 * 24 * 1000)
          }
        },
        defaultTime: Date.now(),
        form: {
          price: null,
          begin_time: ''
        },
        rules: {
          price: [
            { required: true, message: '输入的指定价最多保留两位小数', trigger: 'blur' },
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
      data: {
        type: Array,
        default: () => []
      },
      customPrice: {
        type: String,
        default: ''
      },
      open: Boolean
    },
    watch: {
      open(val) {
        if (val) {
          this.form.price = this.custom_price
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
            this._.forEach(this.data, (v) => {
              ids.push(v)
              prices[v] = this.form.price
              start_time[v] = this.form.begin_time[0] / 1000
              end_time[v] = this.form.begin_time[1] / 1000
            })
            const obj = {
              start_time: start_time,
              end_time: end_time,
              custom_price: prices,
              product_id: ids,
              custom_price_type: 1
            }
            updateCustomerPrice(obj).finally(() => {
              this.loading = false
              this.$refs['form'].resetFields()
              // this.$emit('update:open', false)
              this.$emit('renderList')
            })
            this.$emit('update:open', false)
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
