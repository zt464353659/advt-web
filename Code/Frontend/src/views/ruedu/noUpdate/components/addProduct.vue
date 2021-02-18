<template>
  <el-dialog
    title="产品添加"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="closeClearForm"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    width="740px"
    v-dragMove
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" label-width="100px" size="small" @submit.native.prevent>
        <el-form-item label="产品ID" prop="productIds">
          <el-input
            type="textarea"
            style="width: 90%;"
            :autosize="{ minRows: 8, maxRows: 8}"
            placeholder="请输入内容，一行填写一个产品ID"
            v-model="formData.productIds"
          >
          </el-input>
          <p>
            一行填写一个产品id  最多填写1000个
          </p>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClearForm">取 消</el-button>
      <el-button type="primary" @click="addPlan('formData')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { addUpdateProduct } from '@/api/ruedu'

  export default {
    data() {
      const checkProductId = (rule, value, callback) => {
        const productIds = this.formData.productIds.split('\n')
        if (productIds.length > 1000) {
          return callback(new Error('产品id最多不能超过1000个'))
        }
        if (!value) {
          return callback(new Error('产品id不能为空'))
        }
        setTimeout(() => {
          const reg = /^[0-9]*$/
          this._(this._.compact(value.split('\n'))).forEach(function(val) {
            if (!reg.test(val)) {
              callback(new Error('产品id必须为数字值（不能包含特殊符号、空格标点符号及汉字）'))
            } else if (val.length !== 8) {
              callback(new Error('产品id只能是8位'))
            }
          })
          callback()
        }, 0)
      }
      return {
        formData: {
          productIds: '',
          data: [],
        },
        options: [],
        rules: {
          productIds: [
            { required: true, validator: checkProductId, trigger: 'blur' }
          ]
        },
        mulOptions: []
      }
    },
    props: {
      open: {
        type: Boolean,
        default: false
      },
      baseData: {
        type: Object,
        default: () => {}
      }
    },
    methods: {
      addPlan(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            const obj = {
              account_id: this.baseData.account_id,
              task_id: this.baseData.id,
              product: this._.compact(this.formData.productIds.split('\n')),
              end_time: this.baseData.end_time

            }
            addUpdateProduct(obj).then(() => {
              this.closeClearForm()
              this.$emit('reload')
            })
          }
        })
      },
      closeClearForm() {
        this.$refs['formData'].clearValidate()
        this.$refs['formData'].resetFields()
        this.$emit('update:data', {})
        this.$emit('update:open', false)
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .el-form-item {
    p {
      margin: 0;
      color: #F56C6C;
      font-size: 12px;
    }
  }
</style>
