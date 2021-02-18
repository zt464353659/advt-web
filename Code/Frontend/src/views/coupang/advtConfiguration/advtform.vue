<template>
  <el-dialog
    title="修改自动上传广告配置"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="closeClearForm"
    width="740px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    v-drag-move
  >
    <template>
      <el-form ref="formData" :model="formData" v-loading="listLoading" element-loading-text="添加中···" :rules="rules" label-width="150px" size="small" @submit.native.prevent>
        <el-form-item label="自动上传广告状态" prop="status" required>
          <el-radio-group v-model="formData.status" size="mini">
            <el-radio-button label="1">启用</el-radio-button>
            <el-radio-button label="0">禁用</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="每日上传数量(<=)" prop="max_num">
          <el-input placeholder="请输入每日上传最大数量" v-model="formData.max_num" clearable style="width: 200px">
          </el-input>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button :loading="listLoading" @click="closeClearForm">取 消</el-button>
      <el-button type="primary" :loading="listLoading" @click="addPlan" data-type="form">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { filterQueryParams } from '@/utils/help'
import { accountUpdate } from '@/api/coupang'

export default {
  data() {
    const val_max_num = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('每日上传数量不能为空'))
      }
      const reg = /^[1-9]{1}[\d]*$/
      if (!reg.test(value)) {
        return callback(new Error('只能输入大于0的整数'))
      }
      if (Number(value) > 5000) {
        return callback(new Error('每日上传数量不能大于5000'))
      }
      callback()
    }
    return {
      listLoading: false,
      options: [],
      formData: {
        account_id: undefined,
        max_num: undefined,
        status: '0'
      },
      rules: {
        max_num: [
          { required: true, validator: val_max_num, trigger: 'blur' }
        ]
      }
    }
  },
  props: {
    open: {
      type: Boolean,
      default: false
    },
    rowData: {
      type: Object,
      default: () => {
      }
    }
  },
  created() {
  },
  methods: {
    // 添加计划
    addPlan() {
      this.$refs.formData.validate((valid) => {
        if (valid) {
          const queryParams = filterQueryParams(this.formData)
          queryParams.status = Number(this.formData.status)
          this.listLoading = true
          accountUpdate(queryParams).then(response => {
            this.closeClearForm()
            this.$emit('reload')
          }).finally(() => {
            this.listLoading = false
          })
        }
      })
    },
    // 关闭弹窗，表单重置
    closeClearForm() {
      this.$refs['formData'].clearValidate()
      this.listLoading = false
      this.$emit('update:open', false)
    }
  },
  computed: {},
  watch: {
    open(val) {
      if (val) {
        this.formData.account_id = this.rowData.account_id ? this.rowData.account_id : undefined
        this.formData.max_num = this.rowData.max_num ? this.rowData.max_num : undefined
        this.formData.status = this.rowData.status ? this.rowData.status.toString() : '0'
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>

