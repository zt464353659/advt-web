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
    <div class="loading-dialog" v-loading="addLoading" element-loading-text="处理中">
      <el-form ref="formData" :model="formData" :rules="rules" label-width="100px" size="small" @submit.native.prevent>
        <el-form-item label="账号" prop="account_id">
          <multiple-select-account ref="multipleSelectAccount" v-bind.sync="multipleSelectAccountOption" @select-account="selectAccount" @clean-select="cleanSelect"></multiple-select-account>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" @change="clearValidator" clearable placeholder="请选择类型" style="width:200px;">
            <el-option label="计划上传" value="0"></el-option>
            <el-option label="计划下架" value="1"></el-option>
            <el-option label="激活广告" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文件" prop="file" v-if="Number(formData.type) === 2" ref="fileForm">
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
          <el-button size="small" type="text" @click="downloadExcelTemplate">下载模板</el-button>
          <p>上传的excel文档中只包含产品ID即可</p>
        </el-form-item>
        <el-form-item label="产品id" prop="productIds" ref="idForm" v-else>
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
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="onCancel">取 消</el-button>
        <el-button size="mini" type="primary" @click="addPlan('formData')">确 定</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import XLSX from 'xlsx'
import store from '@/store'
import { addPlan, getSelectAll, addActiveAdvt } from '@/api/newegg'
import { downloadTemplate } from '../export'
import multipleSelectAccount from '@/views/newegg/advertising/components/multipleSelectAccount'

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
    const checkFile = (rule, value, callback) => {
      if (!this.formData.file) {
        return callback(new Error('请选择excel文件'))
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
      addLoading: false,
      formData: {
        productIds: '',
        account_id: [],
        platform_id: 1,
        data: [],
        type: '',
        user_name: this.$store.state.user.name,
        file: undefined
      },
      fileList: [],
      options: [],
      rules: {
        account_id: [
          { required: true, validator: checkAccountId, trigger: 'change' }
        ],
        type: [
          { required: true, message: '类型不能为空', trigger: 'change' }
        ],
        productIds: [
          { required: true, validator: checkProductId, trigger: 'blur' }
        ],
        file: [
          { required: true, validator: checkFile, trigger: 'blur' }
        ]
      },
      isIndeterminate: true,
      /* 获取所有帅选条件 */
      selectOptions: ['NewEggAdvtAccount', 'NewEggAdvtTypes', 'NewEggProductLine']
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
      this.multipleSelectAccountOption.accountArr = response.data.NewEggAdvtAccount
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
    clearValidator(val) {
      if (this.$refs['idForm']) {
        this.$refs['idForm'].clearValidate()
      }
      if (this.$refs['fileForm']) {
        this.$refs['fileForm'].clearValidate()
      }
    },
    // 下载激活广告模板
    downloadExcelTemplate() {
      downloadTemplate('activate_ads', ['SellerPartNumber'])
    },
    async fileChange(file) {
      const that = this
      if (file.name.slice(-4) === 'xlsx') {
        // 读取文件
        const reader = new FileReader()
        reader.onload = function(evt) {
          const data = evt.target.result
          // 读buffer数据
          const workbook = XLSX.read(data, {
            type: 'buffer'
          })
          // excel转json
          that.formData.file = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { raw: false })
        }
        // buffer数据格式
        reader.readAsArrayBuffer(file.raw)
      } else {
        this.fileList = []
        this.formData.file = undefined
      }
    },
    removeFile() {
      this.formData.file = undefined
    },
    addPlan(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (Number(this.formData.type) === 2) {
            // 激活广告
            // excel数据处理
            const obj = {
              user_id: store.getters.userInfo.id,
              user_name: this.$store.state.user.name,
              data: this.formData.file,
              platform_id: 1,
              account_id: this.formData.account_id
            }
            this.addLoading = true
            addActiveAdvt(obj).then(() => {
              this.addLoading = false
              this.closeClearForm()
              this.$emit('reload')
            }).catch(() => {
              this.addLoading = false
            })
          } else {
            // 上架、下架
            this.formData.user_id = store.getters.userInfo.id
            this.formData.data = this._.compact(this._.uniq(this.formData.productIds.split('\n'))).join(',')
            const obj = this._.cloneDeep(this.formData)
            delete obj.productIds
            delete obj.file
            this.addLoading = true
            addPlan(obj).then(response => {
              this.addLoading = false
              this.closeClearForm()
              this.$emit('reload')
            }).catch(() => {
              this.addLoading = false
            })
          }
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

.loading-dialog {
  .dialog-footer {
    text-align: right;
    margin-bottom: -15px;
  }
}
</style>
