<template>
  <el-dialog
    title="产品添加"
    class="dialog-add-upload-plan"
    :visible="open"
    :close-on-click-modal="false"
    :before-close="onClose"
    width="740px"
    v-drag-move
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" label-width="100px" size="small" @submit.native.prevent>
        <el-form-item label="账号" prop="account_id">
          <multiple-select-account ref="multipleSelectAccount" v-bind.sync="multipleSelectAccountOption" @select-account="selectAccount" @clean-select="cleanSelect"></multiple-select-account>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" clearable placeholder="请选择类型" style="width:200px;">
            <el-option label="计划上传" value="0"></el-option>
            <el-option label="计划下架" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品id" prop="productIds">
          <el-input
            type="textarea"
            clearable
            resize="none"
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
  import { addPlan, getSelectAll } from '@/api/tiki'
  import multipleSelectAccount from '@/views/tiki/advertising/components/multipleSelectAccount'

  export default {
    components: { multipleSelectAccount },
    data() {
      const checkProductId = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('产品id不能为空'))
        }
        if (this._.compact(value.split('\n')).length > 1000) {
          return callback(new Error('超出最多可输入ID数量，最多可输入1000个ID'))
        }
        setTimeout(() => {
          const reg = /^[0-9]*$/
          this._(this._.compact(value.split('\n'))).forEach(function(val) {
            if (!reg.test(val) || val.length !== 8) {
              callback(new Error('产品id必须为8位数字（不能包含特殊符号、空格标点符号及汉字）'))
            }
          })
          callback()
        }, 100)
      }
      const checkAccountId = (rule, value, callback) => {
        if (!this.formData.account_id.length) {
          return callback(new Error('账号不能为空'))
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
        formData: {
          productIds: '',
          account_id: [],
          platform_id: 1,
          data: [],
          type: '0',
          user_name: this.$store.state.user.name
        },
        options: [],
        rules: {
          account_id: [
            { required: true, validator: checkAccountId, trigger: 'change' }
          ],
          productIds: [
            // { required: true, message: '请输入产品id', trigger: 'blur' },
            { required: true, validator: checkProductId, trigger: 'blur' }
          ]
        },
        isIndeterminate: true,
        /* 获取所有筛选条件 */
        selectOptions: ['TikiAdvtAccount']
      }
    },
    props: {
      open: {
        type: Boolean,
        default: false,
        required: true
      }
    },
    created() {
      getSelectAll({ keys: this.selectOptions }).then(response => {
        this.multipleSelectAccountOption.accountArr = response.data.TikiAdvtAccount
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
      addPlan(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.formData.user_id = store.getters.userInfo.id
            this.formData.data = this._.compact(this._.uniq(this.formData.productIds.split('\n'))).join(',')
            const obj = this._.cloneDeep(this.formData)
            delete obj.productIds
            addPlan(obj).then(response => {
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
        this.$refs['formData'].clearValidate()
        this.clearAccount()
        this.$emit('update:open', false)
      }
    },
    watch: {
      open(val) {
        if (val) {
          if (this.$refs['formData']) {
            this.$refs['formData'].clearValidate()
          }
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
