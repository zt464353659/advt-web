<template>
  <el-dialog
    title="设置指定毛利率"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="740px"
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" label-width="150px" size="small" @submit.native.prevent>
        <el-form-item label="指定毛利率(%)" prop="custom_gross_margin">
          <el-input
            type="text"
            clearable
            style="width: 90%;"
            placeholder="请输入指定毛利率"
            v-model="formData.custom_gross_margin"
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
    const checkCustomGrossMargin = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('指定毛利率不能为空'))
      }
      setTimeout(() => {
        const quantityReg = /(^[1-9]\d*$)/
        if (!quantityReg.test(value)) {
          callback(new Error('毛利率必须为大于0的整数'))
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
        custom_gross_margin: ''
        // effective_days: ''
      },
      options: [],
      rules: {
        custom_gross_margin: [
          { required: true, validator: checkCustomGrossMargin, trigger: 'blur' }
        ]
        // effective_days: [
        //   { required: false, validator: checkEffectiveDays, trigger: 'blur' }
        // ]
      }
    }
  },
  props: {
    handleData: {
      type: [Object, Array],
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
            custom_gross_margin: [],
            custom_price_type: '2',
            not_show_message: true//去掉响应拦截器内的自动message提示
          }
          if (Array.isArray(this.handleData)) {
            obj.product_id = this._.cloneDeep(this.handleData)
          } else {
            obj.product_id = [this.handleData.id]
          }

          obj.custom_gross_margin = this.formData.custom_gross_margin
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
