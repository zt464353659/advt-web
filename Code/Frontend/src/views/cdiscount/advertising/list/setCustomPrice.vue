<template>
  <el-dialog
    title="设置指定价"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="740px"
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" label-width="100px" size="small" @submit.native.prevent>
        <el-form-item label="指定价" prop="custom_price">
          <el-input
            type="text"
            clearable
            style="width: 90%;"
            placeholder="请输入指定价"
            v-model="formData.custom_price"
          >
          </el-input>
        </el-form-item>
        <!--        <el-form-item label="有效天数" prop="effective_days">-->
        <!--          <el-input-->
        <!--            type="text"-->
        <!--            clearable-->
        <!--            style="width: 90%;"-->
        <!--            placeholder="请输入有效天数"-->
        <!--            v-model="formData.effective_days"-->
        <!--          >-->
        <!--          </el-input>-->
        <!--        </el-form-item>-->
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取 消</el-button>
      <el-button type="primary" v-debounce @click="setPrice('formData')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { setCustomPrice } from '@/api/cdiscount'
import { resultAlert } from '@/utils/index'

export default {
  data() {
    const checkCustomPrice = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('指定价不能为空'))
      }
      setTimeout(() => {
        const priceReg = /(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,3})?$)/
        if (!priceReg.test(value)) {
          callback(new Error('请输入正确格式的指定价'))
        }
        if (parseFloat(value) <= this.rowData.base_price) {
          callback(new Error(`指定价必须大于保本价(保本价: ${this.rowData.base_price})`))
        }
        callback()
      }, 100)
    }
    const checkEffectiveDays = (rule, value, callback) => {
      const daysReg = /^[1-9]\d*$/
      if (!value) {
        callback()
      }
      if (!daysReg.test(value)) {
        callback(new Error('在线天数必须为大于0的整数'))
      }
      callback()
    }
    return {
      formData: {
        custom_price: ''
        //effective_days: ''
      },
      options: [],
      rules: {
        custom_price: [
          { required: true, validator: checkCustomPrice, trigger: 'blur' }
        ]
        // effective_days: [
        //   { required: false, validator: checkEffectiveDays, trigger: 'blur' }
        // ]
      }
    }
  },
  props: {
    rowData: {
      type: [Object, Array],
      required: true,
      default: () => {
      }
    },
    open: {
      type: Boolean,
      default: false
    }
  },
  created() {
  },
  methods: {
    setPrice(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const obj = {
            product_id: [],
            custom_price: [],
            custom_price_type: '1',
            not_show_message: true//去掉响应拦截器内的自动message提示
            //custom_days: []
          }

          if (Array.isArray(this.rowData)) {
            obj.product_id = this._.cloneDeep(this.rowData)
          } else {
            obj.product_id = [this.rowData.id]
          }
          obj.custom_price = this.formData.custom_price
          setCustomPrice(obj).then((res) => {
            //调用弹窗
            if (res.data) {
              resultAlert(res)
            } else {
              this.$message.err(res.message)
            }
          }).finally(() => {
            this.$emit('reload')
            this.closeClearForm()
          })
        }
      })
    },
    onCancel() {
      this.closeClearForm()
    },
    onClose() {
      this.closeClearForm()
    },
    closeClearForm() {
      this.$refs['formData'].resetFields()
      this.$emit('update:open', false)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
