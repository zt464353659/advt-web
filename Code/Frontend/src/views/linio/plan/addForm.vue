<template>
  <el-dialog
    title="产品添加"
    class="dialog-add-upload-plan"
    :visible="open"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="onClose"
    width="740px"
    v-drag-move
  >
    <div v-loading="loading" element-loading-text="加载中">
      <template>
        <el-form ref="formData" :model="formData" :rules="rules" label-width="100px" size="small" @submit.native.prevent>
          <el-form-item label="Site Code" prop="account_id">
            <multiple-select-account ref="multipleSelectAccount" v-bind.sync="multipleSelectAccountOption" @select-account="selectAccount" @clean-select="cleanSelect"></multiple-select-account>
          </el-form-item>
          <el-form-item label="类型" prop="type">
            <el-select v-model="formData.type" clearable placeholder="请选择类型" style="width:220px;">
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
              一行填写一个产品id，最多可输入1000个ID
            </p>
          </el-form-item>
        </el-form>
      </template>
      <div slot="footer" class="dialog-footer">
        <el-button @click="onCancel" size="mini">取 消</el-button>
        <el-button type="primary" @click="addPlan('formData')" size="mini">确 定</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import store from '@/store'
import { addPlan, getSelectAll } from '@/api/linio'
import multipleSelectAccount from '@/views/linio/advertising/components/multipleSelectAccount'

export default {
  components: { multipleSelectAccount },
  data() {
    const checkAccountId = (rule, value, callback) => {
      if (!this.formData.account_id.length) {
        return callback(new Error('账号不能为空'))
      }
      setTimeout(() => {
        callback()
      }, 500)
    }
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
    return {
      multipleSelectAccountOption: {
        accountArr: [],
        accountKey: 'id'
      },
      loading: false,
      formData: {
        productIds: '',
        account_id: [],
        platform_id: 1,
        data: [],
        type: '',
        user_name: this.$store.state.user.name
      },
      siteOptions: [],
      rules: {
        account_id: [
          { required: true, validator: checkAccountId, trigger: 'change' }
        ],
        type: [{ required: true, message: '类型不能为空', trigger: 'blur' }],
        productIds: [
          // { required: true, message: '请输入产品id', trigger: 'blur' },
          { required: true, validator: checkProductId, trigger: 'blur' }
        ]
      },
      isIndeterminate: true,
      /* 获取所有筛选条件 */
      selectOptions: ['LinioAdvtAccount']
    }
  },
  props: {
    open: {
      type: Boolean,
      default: false,
      required: true
    },
    options: {
      type: Array,
      default: () => [],
      required: true
    }
  },
  created() {
    this.searchInit()
  },
  methods: {
    searchInit() {
      const optionsParams = ['LinioAdvtAccount']
      getSelectAll({ keys: optionsParams }).then(response => {
        this.multipleSelectAccountOption.accountArr = response.data.LinioAdvtAccount
      })
    },
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
          this._.forEach(this.options, v => {
            if (v.id === this.formData.account_id) {
              obj.site_id = v.site_id
            }
          })
          delete obj.productIds
          this.loading = true
          addPlan(obj).then(() => {
            this.loading = false
            this.closeClearForm()
            this.$emit('reload')
          }).catch(e => {
            this.loading = false
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
      this.clearAccount()
      this.$emit('update:open', false)
    },
    siteChange(val) {
      this._.map(this.siteOptions, item => {
        if (item.id === val) {
          this.formData.site_name = item.site_name
        }
      })
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
<style rel="stylesheet/scss" lang="scss">
.dialog-add-upload-plan {
  .el-dialog__body {
    padding-bottom: 0 !important;
  }

  .dialog-footer {
    margin-bottom: 15px;
    text-align: right;
  }
}
</style>
