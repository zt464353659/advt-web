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
  import { updateCustomerPrice } from '@/api/priceminister'
  // import { customAlert } from '../common'
  import { resultAlert } from '@/utils/index'

  export default {
    data() {
      const checkPrice = (rule, value, callback) => {
        if (Number(value) === 0) {
          callback(new Error('指定价必须大于0'))
          return false
        }
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
          if (valid) {
            this.loading = true
            const product = []
            this._.forEach(this._.compact(this.data), v => {
              product.push({ id: v.product_id, istore_product_id: v.istore_product_id, account_id: v.account_id, custom_price: this.form.price })
            })
            const obj = {
              product,
              price_type: 1,
              action: 'add',
              rate: 0,
              not_show_message: true
            }
            updateCustomerPrice(obj).then((res) => {
              // customAlert(res,this.afterConfirm)
              resultAlert(res,this.afterConfirm)
            }).catch(err => {
              this.$messaage.error(err)
            }).finally(() => {
              this.loading = false
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
      },
      afterConfirm() {
        this.loading = false
        this.$refs['form'].resetFields()
        this.$emit('renderList')
      }
    }
  }
</script>
