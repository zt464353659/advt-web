<template>
  <el-dialog
    title="添加不更新任务"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="closeClearForm"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    width="500px"
    v-dragMove
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" label-width="100px" size="small" @submit.native.prevent>
        <el-form-item label="Site Code" prop="account">
          <el-select v-model="formData.account_id" placeholder="请选择">
            <el-option
              v-for="item in mulOptions"
              :key="item.id"
              :label="item.account"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设置类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio :label="1">价格</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="结束时间" prop="end_time">
          <el-date-picker
            v-model="formData.end_time"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClearForm">取 消</el-button>
      <el-button type="primary" @click="addTask('formData')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import store from '@/store'
  import { getSelectAll, addUpdateTask } from '@/api/ruedu'

  export default {
    data() {
      const checkEndTime = (rule, value, callback) => {
        const now = new Date().getTime()
        const selectTime = new Date(this.formData.end_time).getTime()
        if (!value) {
          return callback(new Error('请选择结束时间'))
        }
        if (selectTime < now) {
          return callback(new Error('结束时间不能小于当前时间'))
        }
        callback()
      }
      return {
        formData: {
          account_id: 1,
          end_time: '',
          type: 1
        },
        options: [],
        rules: {
          account_id: [
            { required: true, message: '请选择账号', trigger: 'change' }
          ],
          type: [
            { required: true, message: '请选择类型', trigger: 'change' }
          ],
          end_time: [
            { required: true, validator: checkEndTime, trigger: 'blur' }
          ]
        },
        mulOptions: []
      }
    },
    props: {
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
      addTask(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            const obj = {
              account_id: this.formData.account_id,
              type: this.formData.type,
              end_time: this.formData.end_time
            }
            addUpdateTask(obj).then(() => {
              this.closeClearForm()
              this.$emit('reload')
            })
          }
        })
      },
      closeClearForm() {
        this.$refs['formData'].resetFields()
        this.$refs['formData'].clearValidate()
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
