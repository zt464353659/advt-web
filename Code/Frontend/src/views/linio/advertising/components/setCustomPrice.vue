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
    return {
      formData: {
        custom_price: ''
      },
      rules: {
        custom_price: [
          { required: true, validator: checkCustomPrice, trigger: 'blur' }
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
            custom_price_type: '1',
            not_show_message: true//去掉响应拦截器内的自动message提示
          }
          if (Array.isArray(this.rowData)) {
            obj.product_id = this._.cloneDeep(this.rowData)
          } else {
            obj.product_id = [this.rowData.product_id]
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

<style rel="stylesheet/scss" lang="scss" scoped></style>
