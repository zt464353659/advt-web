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
      <el-form ref="formData" :model="formData" :rules="rules" label-width="120px" size="small" @submit.native.prevent>
        <el-form-item label="指定毛利率(%)" prop="custom_gross_margin">
          <el-input
            type="text"
            clearable
            style="width: 70%;"
            placeholder="请输入指定毛利率"
            v-model="formData.custom_gross_margin"
          >
          </el-input>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取 消</el-button>
      <el-button type="primary" v-debounce @click="setPrice('formData')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { resultAlert } from '../common/index'
import { setCustomPrice } from '@/api/linio'

export default {
  mixins: [],
  filters: {},
  components: {},
  props: {
    open: {
      type: Boolean,
      default: false
    },
    rowData: {
      type: [Object, Array],
      require: true,
      default: () => {
      }
    }
  },
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
    return {
      formData: {
        custom_gross_margin: ''
      },
      rules: {
        custom_gross_margin: [
          { required: true, validator: checkCustomGrossMargin, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {},
  watch: {},
  created() {
  },
  mounted() {
  },
  destroyed() {
  },
  methods: {
    setPrice(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const obj = {
            product_id: [],
            custom_price: [],
            custom_price_type: '2',
            not_show_message: true//去掉响应拦截器内的自动message提示
          }
          if (Array.isArray(this.rowData)) {
            obj.product_id = this._.cloneDeep(this.rowData)
          } else {
            obj.product_id = [this.rowData.product_id]
          }
          obj.custom_price = this.formData.custom_gross_margin
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

<style rel="stylesheet/scss" lang="scss" scoped></style>
