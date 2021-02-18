<template>
  <el-dialog :title="'设置指定价'" v-dragMove :visible="open" :before-close="onClose" width="600px" :close-on-press-escape="false" :close-on-click-modal="false">
    <div class="loading-dialog" v-loading="addLoading" element-loading-text="处理中">
      <el-form ref="form" label-width="80px" :model="form" :rules="rules" size="small">
        <el-form-item label="指定价" prop="price">
          <el-input v-model="form.price" style="width: 400px"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="onClose">取 消</el-button>
        <el-button size="mini" type="primary" @click="onSubmit('form')">确 定</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { updateCustomPrice } from '@/api/mercadolibre.gs'
import { resultAlert } from '../common'

export default {
  data() {
    const checkPrice = (rule, value, callback) => {
      const reg = /^\d+(\.\d*)?$/
      if (!reg.test(value)) {
        callback(new Error('请输入正确格式的指定价'))
      } else {
        callback()
      }
    }
    return {
      addLoading: false,
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
    selectData: {
      type: Array,
      default: () => []
    },
    open: Boolean
  },
  methods: {
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.addLoading = true
          const product_id = []
          this.selectData.map(v =>
            v.child_product.map(v1 => {
              if (v1.isSelected) {
                product_id.push(v1.product_id)
              }
            }))
          const obj = {
            custom_price: Number(this.form.price).toFixed(2),
            product_id,
            custom_price_type: 1,
            not_show_message: true
          }
          updateCustomPrice(obj).then(res => {
            this.addLoading = false
            this.onClose()
            resultAlert(res)
            this.$emit('renderList')
          }).finally(() => {
            this.addLoading = false
            this.$refs['form'].resetFields()
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
<style lang="scss">
.loading-dialog {
  .dialog-footer {
    text-align: right;
    margin-bottom: -15px;
  }
}
</style>
