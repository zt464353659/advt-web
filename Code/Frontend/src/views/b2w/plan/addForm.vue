<template>
  <el-dialog
    title="产品添加"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="onCancel"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    width="740px"
    v-dragMove
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" label-width="100px" size="small" @submit.native.prevent>
        <el-form-item label="账号" prop="account">
          <multiple-select-account
            ref="multipleSelectAccount"
            :options="options"
            @select-account="selectAccount"
            @clean-select="cleanSelect"
            style="width: 240px"
          ></multiple-select-account>
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
            <svg-icon icon-class="bug" />
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
import { addProductPlan } from '@/api/b2w'
import multipleSelectAccount from './components/multipleSelectAccount'

export default {
  components: {
    multipleSelectAccount
  },
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
        account: [],
        productIds: '',
        data: [],
        type: null
      },
      rules: {
        account: [
          { required: true, message: '请先选择平台及账号', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请先选择类型', trigger: 'change' }
        ],
        productIds: [
          { required: true, validator: checkProductId, trigger: 'blur' }
        ]
      },
    }
  },
  props: {
    options: {
      type: Array,
      required: true,
      default: ()=>{}
    },
    open: {
      type: Boolean,
      default: false
    }
  },
  created() {

  },
  methods: {
    addPlan(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const obj = {
            user_id: store.getters.userInfo.id,
            account_id: this.formData.account,
            data: this._.compact(this.formData.productIds.split('\n')).join(','),
            type: this.formData.type,
            user_name: this.$store.state.user.name
          }
          addProductPlan(obj).then(() => {
            this.closeClearForm()
            this.$emit('reload')
            this.$emit('update:open', false)
          }).catch((err) => {
            console.log(err)
          })
        }
      })
    },
    onCancel() {
      this.closeClearForm()
    },
    closeClearForm() {
      this.$refs['multipleSelectAccount'].handleCancelAllUser()
      this.$refs['formData'].resetFields()
      this.$emit('update:open', false)
    },
    // site code多选框
    selectAccount(arr) {
      console.log(arr)
      this.formData.account = arr
    },
    cleanSelect() {
      this.formData.account = []
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
