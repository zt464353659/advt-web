<template>
  <el-dialog
    title="产品添加"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="onClose"
    width="740px"
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" label-width="100px" size="small" @submit.native.prevent>
        <el-form-item label="账号" prop="platform">
          <el-select v-model="formData.platform" placeholder="请选择账号">
            <el-option
              v-for="item in options"
              :key="item.id"
              :label="item.site_code"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型">
            <el-option label="计划上传" value="0"></el-option>
            <el-option label="计划下架" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品id" prop="productIds">
          <el-input
            type="textarea"
            style="width: 90%;"
            :autosize="{ minRows: 4, maxRows: 8}"
            placeholder="请输入内容，一行填写一个产品id"
            v-model="formData.productIds"
          >
          </el-input>
          <p>
            <svg-icon icon-class="bug"/>
            一行填写一个产品id
          </p>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取 消</el-button>
      <el-button type="primary" @click="addPlan('formData')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import store from '@/store'
  import { createPlan, getSelectAll } from '@/api/shopify'

  export default {
    data() {
      const checkProductId = (rule, value, callback) => {
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
        }, 1000)
      }
      return {
        formData: {
          platform: [],
          productIds: '',
          platform_id: '1',
          account_id: '1',
          data: [],
          type: ''
        },
        options: [],
        rules: {
          platform: [
            { required: true, message: '请先选择平台及账号', trigger: 'change' }
          ],
          productIds: [
            // { required: true, message: '请输入产品id', trigger: 'blur' },
            { validator: checkProductId, trigger: 'blur' }
          ]
        },
        isIndeterminate: true
      }
    },
    props: {
      data: {
        type: Object,
        required: true
      },
      open: {
        type: Boolean,
        default: false
      }
    },
    created() {
      const optionsParams = ['shopifyAdvtAccount']
      getSelectAll(optionsParams).then(response => {
        this.options = response.data.shopifyAdvtAccount
      })
    },
    methods: {
      addPlan(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            // this.formData.user_id = store.getters.userInfo.id
            // if (this.formData.platform.length > 0) {
            //   this.formData.platform_id = this.formData.platform[0]
            //   this.formData.account_id = this.formData.platform[1]
            // }
            // this.formData.data = this._.compact(this.formData.productIds.split('\n')).join(',')
            const obj = {
              user_id: store.getters.userInfo.id,
              type: this.formData.type,
              data: this._.compact(this.formData.productIds.split('\n')).join(','),
              account_id: this.formData.platform,
              platform_id: '9'
            }
            createPlan(obj).then(() => {
              this.closeClearForm()
              this.$emit('reload')
            })
          } else {
            return false
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
