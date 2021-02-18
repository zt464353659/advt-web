<template>
  <el-dialog :title="'设置指定价'" v-dragMove :visible="open" :before-close="onClose" width="600px" v-loading="loading" :close-on-press-escape="false" :close-on-click-modal="false">
    <el-form ref="form" label-width="80px" :model="form" :rules="rules" size="small">
      <el-form-item label="指定价" prop="price">
        <el-input v-model="form.price" style="width: 400px"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="onSubmit('form')">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
  import { updateCustomerPrice } from '@/api/tiki'
  import { resultAlert } from '../common/index'

  export default {
    data() {
      const checkPrice = (rule, value, callback) => {
        const reg = /^[1-9]\d*0{3}$/
        if (!reg.test(Number(value))) {
          callback(new Error('指定价必须为整数且后三位为零'))
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
          price: null
        },
        rules: {
          price: [
            { required: true, validator: checkPrice, trigger: 'blur' }
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
          if (valid) {
            this.loading = true
            const obj = {
              custom_price: Number(this.form.price),
              product_id: this._.compact(this.data),
              custom_price_type: 1,
              not_show_message: true
            }
            updateCustomerPrice(obj).then(res => {
              resultAlert(res)
            }).finally(() => {
              this.loading = false
              this.$refs['form'].resetFields()
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
