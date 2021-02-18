<template>
  <el-dialog
    title="产品计划导出"
    class="dialog-export-plan"
    :visible="open"
    :before-close="closeClearForm"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="600px"
    v-dragMove
  >
    <div v-loading="loading" element-loading-text="导出中···">
      <template>
        <el-form ref="formData" :model="formData" :rules="rules" label-width="100px" size="mini" @submit.native.prevent>
          <el-form-item label="类型" prop="type">
            <el-select v-model="formData.type" clearable placeholder="请选择账号" style="width:400px;">
              <el-option v-for="(item,ind) in options.schedule_type" :key="ind" :label="item.label" :value="item.key"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="日期" prop="date_range">
            <el-date-picker
              v-model="formData.date_range"
              type="datetimerange"
              range-separator="至"
              :picker-options="pickerOptions"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd HH:mm:ss"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="账号" prop="account_id">
            <el-select v-model="formData.account_id" clearable placeholder="请选择账号" style="width:400px;">
              <el-option
                v-for="item in options.account"
                :key="item.id"
                :label="item.account"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="操作人" prop="operator">
            <el-input v-model="formData.operator" clearable placeholder="请输入操作人" style="width:400px;"></el-input>
          </el-form-item>
          <el-form-item label="执行状态" prop="status">
            <el-select v-model="formData.status" clearable placeholder="请选择执行状态" style="width:400px;">
              <el-option v-for="(item,ind) in options.status_source" :key="ind" :label="item.label" :value="item.key"></el-option>
            </el-select>
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
  import store from '@/store'
  import { getSelectAll, exportPlanInfo, exportPlanOptions } from '@/api/rakuten'
  import { exportPlanList } from '../export'

  export default {
    data() {
      const checkDateRange = (rule, value, callback) => {
        if (value && value.length) {
          const start_time = new Date(value[0]).getTime()
          const end_time = new Date(value[1]).getTime()
          // 最多不能超过7天
          if (end_time - start_time > 604800000) {
            callback(new Error('开始日期与结束日期间隔不能超过7天'))
          }
          callback()
        } else {
          callback(new Error('请选择时间'))
        }
      }
      return {
        formData: {
          type: 0,
          date_range: [],
          account_id: 1,
          operator: '',
          status: 20,
        },
        options: [],
        rules: {
          account_id: [{ required: true, message: '请选择账号' }],
          type: [{ required: true, message: '请选择类型' }],
          date_range: [{ required: true, validator: checkDateRange, trigger: 'change' }]
        },
        pickerOptions: {
          disabledDate(val) {
            return val.getTime() > Date.now()
          }
        },
        loading: false
      }
    },
    props: {
      addData: {
        type: Object,
        required: true,
        default: () => {
        }
      },
      open: {
        type: Boolean,
        required: true,
        default: false
      }
    },
    created() {
      this.searchInit()
    },
    methods: {
      searchInit() {
        exportPlanOptions({ not_show_message: true }).then(res => {
          this.options = res.data
        })
      },
      addPlan(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.loading = true
            this.formData.operator = this.formData.operator.trim()
            exportPlanInfo(Object.assign(this.formData, { not_show_message: true })).then(res => {
              if (res.data.list && res.data.list.length) {
                exportPlanList(res.data.list)
              }
              this.loading = false
              this.closeClearForm()
            }).catch(e => {
              this.$message.error(e)
              this.loading = false
            })
          }
        })
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
<style rel="stylesheet/scss" lang="scss">
  .dialog-export-plan{
    .el-dialog__body{
      padding-bottom: 0!important;
    }
    .dialog-footer{
      text-align: right;
      margin-bottom: 10px;
    }
  }
</style>
