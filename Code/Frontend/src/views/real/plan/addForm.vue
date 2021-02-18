<template>
  <el-dialog
    title="产品添加"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="onClose"
    width="740px"
  >
    <template>
      <el-form ref="formData" v-loading="dialogLoading" element-loading-text="添加中···" :model="formData" :rules="rules" label-width="100px" size="small" @submit.native.prevent>
        <el-form-item label="Site Code" prop="account_id">
          <el-select v-model="formData.account_id" placeholder="请选择Site Code">
            <el-option v-for="(item,key) in options" :label="item.site_code" :value="item.id" :key="key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型" class="plan_type">
            <el-option label="计划上传" value="0"></el-option>
            <el-option label="计划下架" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品id" prop="productIds">
          <el-input
            type="textarea"
            style="width: 90%;"
            :autosize="{ minRows: 4, maxRows: 8 }"
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
      <el-button type="primary" :disabled="isClicked" @click="addPlan('formData')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import store from '@/store'
import { addPlan, getSelectAll } from '@/api/real'

export default {
  data() {
    const checkProductId = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('产品id不能为空'))
      }
      const reg = /^[0-9]*$/
      const arr = this._.compact(value.replace(/ +/g, '').split('\n'))
      if (arr.length === 0) {
        callback(new Error('产品id不能全为空行'))
      }
      this._(arr).forEach(function(val) {
        if (!reg.test(val)) {
          callback(new Error('产品id必须为数字值（不能包含特殊符号、标点符号、字母及汉字）'))
        } else if (val.length !== 8) {
          callback(new Error('产品id只能是8位'))
        }
      })
      callback()
    }
    return {
      options: [],
      dialogLoading: false,
      isClicked: false,
      formData: {
        account_id: '',
        type: '',
        productIds: ''
      },
      rules: {
        account_id: [
          { required: true, message: '请先选择site code', trigger: 'change' }
        ],
        productIds: [
          { validator: checkProductId, trigger: 'blur' }
        ]
      }
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
    // const optionsParams = ['esProductUploadPlanOptions']
    getSelectAll().then(response => {
      this.options = response.data.account
    })
  },
  methods: {
    addPlan(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const params = {
            user_id: store.getters.userInfo.id,
            account_id: this.formData.account_id,
            type: this.formData.type,
            data: this._.compact(this.formData.productIds.replace(/ +/g, '').split('\n')).join(',')
          }
          this.dialogLoading = true
          this.isClicked = true
          addPlan(params).then(response => {
            sessionStorage.setItem('formData', JSON.stringify(this.formData))
            this.$emit('reload')
            this.closeClearForm()
          }).catch(error => {
            this.dialogLoading = false
            this.isClicked = false
            console.log(error)
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
      this.formData = {
        account_id: '',
        type: '',
        productIds: ''
      }
      this.isClicked = false
      this.dialogLoading = false
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
  .plan_type >>> .el-input.is-disabled .el-input__inner{
    background: transparent;
  }
</style>
