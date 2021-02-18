<template>
  <el-dialog
    title="任务添加"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="onClose"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    width="500px"
    v-dragMove
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" label-width="100px" size="small" @submit.native.prevent>
        <el-form-item label="账号" prop="account">
          <multiple-select-account
            ref="multipleSelectAccount"
            v-bind.sync="multipleSelectAccountOption"
            @select-account="selectAccount"
            @clean-select="cleanSelect"
          ></multiple-select-account>
          <p v-if="formData.type==='0'">注意：该操作将下架所有异仓产品</p>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型">
            <el-option label="无销量下架" value="1"></el-option>
            <el-option label="无销量删除" value="2"></el-option>
            <el-option label="异仓下架" value="3"></el-option>
          </el-select>
          <p class="tip-color" v-if="formData.type === '2'">
            <i class="el-icon-warning"></i>
            一键删除未上架状态无销量的广告
          </p>
        </el-form-item>
        <el-form-item label="无销量时间" pror="sales_time" v-if="formData.type==='1'">
          <el-radio-group v-model="formData.sales_time" size="small">
            <el-radio-button label="3">3个月</el-radio-button>
            <el-radio-button label="6">6个月</el-radio-button>
          </el-radio-group>
          <p class="tip-color">
            <i class="el-icon-warning"></i>
            一键处理架上状态的无销量的广告
          </p>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onCancel" :loading="is_loading">取 消</el-button>
      <el-button type="primary"
                 @click="addOffLine('formData')"
                 :loading="is_loading"
      >
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import store from '@/store'
import { addToolOffLine, addPlanAccount } from '@/api/shopee'
import multipleSelectAccount from './components/multipleSelectAccount'

export default {
  components: { multipleSelectAccount },
  data() {
    return {
      formData: {
        account: [],
        type: undefined,
        sales_time: '3'
      },
      options: [],
      rules: {
        account: [
          { required: true, message: '请先选择账号', trigger: 'change' }
        ],
        type: [
          { required: true, message: '类型不能为空', trigger: 'change' }
        ]
      },
      isIndeterminate: true,
      multipleSelectAccountOption: {
        accountArr: [],
        accountKey: 'id'
      },
      is_loading: false
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
      addPlanAccount().then(response => {
        this.multipleSelectAccountOption.accountArr = response.data
      })
    },
    //请求提示/校验
    requestPrompt() {
      return new Promise((resolve, reject) => {
        if (this.formData.type === '1') {
          resolve()
        } else if (this.formData.type === '2') {
          this.$confirm('广告删除后不可恢复，是否创建删除无销量任务？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            closeOnClickModal: false,
            closeOnPressEscape: false,
            type: 'warning'
          }).then(() => {
            resolve()
          }).catch(() => {
            reject()
          })
        } else if (this.formData.type === '3') {
          resolve()
        }
      })
    },
    addOffLine(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.requestPrompt().then(() => {
            this.is_loading = true
            addToolOffLine(this.formData).then(() => {
              this.$emit('reload')
            }).finally(() => {
              this.is_loading = false
              this.onClose()
            })
          })
        }
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
    selectAccount(arr) {
      this.formData.account = arr
    },
    clearAccount() {
      this.$refs.multipleSelectAccount.handleCancelAllUser()
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
    font-size: 14px;
  }
}
</style>
