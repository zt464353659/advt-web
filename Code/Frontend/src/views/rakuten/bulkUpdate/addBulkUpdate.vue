<template>
  <el-dialog
    title="批量更新/批量取消更新"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="closeClearForm"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="740px"
    v-dragMove
  >
    <div v-loading="loading" element-loading-text="加载中">
      <template>
        <el-form ref="formData" :model="formData" :rules="rules" label-width="120px" size="small" @submit.native.prevent>
          <el-form-item label="账号" prop="account_id">
            <multiple-select-account ref="multipleSelectAccount" v-bind.sync="multipleSelectAccountOption" @select-account="selectAccount" @clean-select="cleanSelect"></multiple-select-account>
          </el-form-item>
          <el-form-item label="类型" prop="type">
            <el-radio-group v-model="formData.type" @change="typeChange">
              <el-radio label="1">批量更新</el-radio>
              <el-radio label="2">取消更新</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="更新字段类型" prop="update_type">
            <el-checkbox-group v-model="formData.update_type">
              <el-checkbox label="title">标题</el-checkbox>
              <el-checkbox label="price">价格</el-checkbox>
              <el-checkbox label="catch_copy_for_pc">PC宣传语</el-checkbox>
              <el-checkbox label="catch_copy_for_mobile">手机宣传语</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="请选择文件" prop="file">
            <el-upload
              action="ccc"
              :on-change="fileChange"
              :before-remove="removeFile"
              :auto-upload="false"
              :file-list="fileList"
              :limit="1"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-form-item>
        </el-form>
      </template>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeClearForm" size="mini">取 消</el-button>
        <el-button type="primary" @click="addPlan('formData')" size="mini">确 定</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>

import axios from 'axios'
import { getSelectAll } from '@/api/rakuten'
import multipleSelectAccount from '@/views/rakuten/bulkUpdate/multipleSelectAccount'
import Cookies from 'js-cookie'

export default {
  components: { multipleSelectAccount },
  data() {
    const checkUpdateType = (rule, value, callback) => {
      if (!value.length) {
        return callback(new Error('请选择更新字段类型'))
      }
      callback()
    }
    const checkAccountId = (rule, value, callback) => {
      if (!this.formData.account_id.length) {
        return callback(new Error('请选择账号'))
      }
      setTimeout(() => {
        callback()
      }, 500)
    }
    return {
      multipleSelectAccountOption: {
        accountArr: [],
        accountKey: 'id'
      },
      fileList: [],
      formData: {
        account_id: [],
        type: undefined,
        update_type: [],
        file: undefined
      },
      options: [],
      rules: {
        account_id: [
          { required: true, validator: checkAccountId, trigger: 'change' }
        ],
        type: [{ required: true, message: '请选择类型' }],
        file: [{ required: true, message: '请上传文件', trigger: ['change', 'blur'] }],
        update_type: [{ required: true, validator: checkUpdateType, trigger: 'change' }]
      },
      isIndeterminate: true,
      lines: 0,
      loading: false
    }
  },
  props: {
    open: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  created() {
    getSelectAll().then(response => {
      this.multipleSelectAccountOption.accountArr = response.data.account
    })
  },
  methods: {
    selectAccount(arr) {
      this.formData.account_id = arr
    },
    clearAccount() {
      this.$refs.multipleSelectAccount.handleCancelAllUser()
      this.$refs['formData'].clearValidate()
    },
    cleanSelect() {
      this.$refs['formData'].resetFields()
    },
    typeChange(val) {
      if (val === '1') {
        this.formData.update_type = ['title', 'price', 'catch_copy_for_pc', 'catch_copy_for_mobile']
      } else {
        this.formData.update_type = []
      }
    },
    async fileChange(file) {
      const that = this
      if (file.name.slice(-4) === 'xlsx' || file.name.slice(-3) === 'xls') {
        this.formData.file = file
      } else {
        this.fileList = []
        this.formData.file = undefined
      }
    },
    removeFile() {
      this.formData.file = undefined
    },
    /**
     * 上传地址
     */
    getUploadPath() {
      const API_ADDRESS = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_BASE_API : process.env.VUE_APP_BASE_API
      return API_ADDRESS + 'rakuten-new/schedule/update-schedule/import'
    },
    addPlan(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true
          const formData = new FormData()
          formData.append('file', this.formData.file.raw)
          // formData.append('account_id', this.formData.account_id)
          formData.append('type', this.formData.type)
          formData.append('comment', this.formData.update_type.join(','))
          this.formData.account_id.forEach(v => {
            formData.append('account_id[]', v)
          })
          const urlInfo = JSON.parse(Cookies.get('urlInfo'))

          axios({
            url: this.getUploadPath(),
            method: 'post',
            headers: {
              Authorization: `Bearer ${ urlInfo.token }`,
              systemCode: urlInfo.systemCode
            },
            data: formData
          }).then(res => {
            // 仅200状态为成功
            this.loading = false
            if (res.data.code === 200) {
              this.$message.success(res.data.message)
              this.closeClearForm()
              this.$emit('reload')
            } else {
              this.$message.error(res.data.message)
            }
          }).catch(err => {
            this.$message.error(err)
          })
        }
      })
    },
    closeClearForm() {
      this.$refs['formData'].resetFields()
      this.$refs['formData'].clearValidate()
      this.fileList = []
      this.clearAccount()
      this.$emit('update:data', {})
      this.$emit('update:open', false)
    }
  },
  watch :{
    open(val) {
      if (val) {
        this.$refs['formData'].clearValidate()
      }
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
<style rel="stylesheet/scss" lang="scss">
.dialog-add-upload-plan {
  .el-dialog__body {
    padding-bottom: 0 !important;
  }

  .dialog-footer {
    text-align: right;
    margin-bottom: 10px;
  }
}
</style>
