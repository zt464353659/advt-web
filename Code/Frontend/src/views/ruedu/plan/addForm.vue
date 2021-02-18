<template>
  <el-dialog
    title="产品添加"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="onClose"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    width="740px"
    v-dragMove
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" label-width="100px" size="small" @submit.native.prevent>
        <el-form-item label="账号" prop="account">
          <el-select v-model="formData.account" placeholder="请选择">
            <el-option
              v-for="item in mulOptions"
              :key="item.id"
              :label="item.account"
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
            一行填写一个产品id  最多不超过1000个
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
  import { addProductPlan, addPlanAccount, getSelectAll } from '@/api/ruedu'

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
          account: null,
          productIds: '',
          data: [],
          // type: null，
          type: ''
        },
        options: [],
        rules: {
          account: [
            { required: true, message: '请先选择平台及账号', trigger: 'change' }
          ],
          type: [
            { required: true, message: '请先选择类型', trigger: 'change' }
          ],
          productIds: [
            { required: true, validator: checkProductId, trigger: 'blur' }
          ]
        },
        mulOptions: []
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
      this.SearchInit()
    },
    methods: {
      // 初始化站点选项
      SearchInit() {
        getSelectAll('rueduAccounts').then(res => {
          this.mulOptions = res.data.rueduAccounts
        })
      },
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
            }).catch((err) => {
              console.log(err)
            })
          } else {
            return false
          }
          this.clearAccount()
        })
      },
      onCancel() {
        this.clearAccount()
        this.closeClearForm()
      },
      onClose() {
        this.clearAccount()
        this.closeClearForm()
      },
      closeClearForm() {
        this.$refs['formData'].resetFields()
        this.$emit('update:data', {})
        this.$emit('update:open', false)
      },
      clearAccount() {
        this.$refs['formData'].clearValidate()
      },
      cleanSelect() {
        this.$refs['formData'].resetFields()
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
