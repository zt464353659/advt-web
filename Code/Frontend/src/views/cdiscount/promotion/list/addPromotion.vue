<template>
  <el-dialog
    title="添加促销活动"
    class="dialog-add-promotion"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="700px"
    v-drag-move
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" label-width="150px" size="small">
        <el-form-item label="活动名称" prop="sale_name">
          <el-input type="text" v-model="formData.sale_name" style="width: 180px;" size="mini" clearable placeholder="请输入活动名称"></el-input>
        </el-form-item>
        <el-form-item label="账号" prop="account_id">
          <el-select v-model="formData.account_id" size="mini" style="width: 180px;" filterable placeholder="请选择账号">
            <el-option
              v-for="item in selectAll"
              :key="item.id"
              :label="item.site_code"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="促销类型" prop="type">
          <el-select v-model="formData.type" style="width: 180px;" size="mini" filterable placeholder="请选择促销类型">
            <el-option label="限时促销" value="1"></el-option>
            <el-option label="促销季" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="活动截至日期" prop="activity_time">
          <el-date-picker type="datetime"
                          placeholder="选择截至日期"
                          value-format="timestamp"
                          format="yyyy-MM-dd HH:mm"
                          v-model="formData.activity_time"
                          :picker-options="pickerOptions"
          ></el-date-picker>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取 消</el-button>
      <el-button type="primary" v-debounce @click="onSubmit('formData')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { addPromo } from '@/api/cdiscount'
import { resultAlert } from '@/utils/index'
export default {
  data() {
    const checkTime = (rule, value, callback) => {
      let timestamp = Date.parse(new Date())
      if (!this.formData.activity_time) {
        callback(new Error('请选择结束时间'))
      } else if (value <= timestamp) {
        //选择时间不能<=当前时间
        callback(new Error('请选择大于当前时分'))
      } else {
        callback()
      }
    }
    return {
      pickerOptions: {
        disabledDate(time) {//限制活动时间不能选择当天以前
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      formData: {
        sale_name: '',
        account_id: '',
        type: '1',
        activity_time: ''
      },
      options: [],
      rules: {
        sale_name: [
          { required: true, message: '请填写活动名称', trigger: ['change', 'blur'] },
          { max: 100, message: '活动名称最多100个字符', trigger: ['change', 'blur'] }
        ],
        account_id: [
          { required: true, message: '请选择账号', trigger: ['change', 'blur'] }
        ],
        type: [
          { required: true, message: '请选择促销类型', trigger: ['change', 'blur'] }
        ],
        activity_time: [
          { required: true, validator: checkTime, trigger: ['change', 'blur'] }
        ]
      }
    }
  },
  props: {
    open: {
      type: Boolean,
      default: false
    },
    selectAll: {
      type: [Array, Object],
      default: (() => {

      })
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    timeJudge(time) {//验证活动结束时间，必须大于当前时分
      let timestamp = new Date().getTime()
      return time > timestamp
    },
    Validation() {
      if (this.formData.sale_name.length >= 100) {
        this.$message.error('活动名称最多100个字符')
        return false
      } else if (!this.formData.sale_name) {
        this.$message.error('请输入必填项')
        return false
      }
      if (!this.formData.account_id) {
        this.$message.error('请输入必填项')
        return false

      }
      if (!this.formData.type) {
        this.$message.error('请输入必填项')
        return false

      }
      if (!this.formData.activity_time) {
        this.$message.error('请输入必填项')
        return false

      }
      if (!this.timeJudge(this.formData.activity_time)) {
        //验证活动结束时间
        this.$message.error('结束时间必须大于当前时分')
        return false
      }
      return true
    },
    onSubmit() {
      if (this.Validation()) {
        this.loading = true
        const obj = {
          sale_name: this.formData.sale_name,
          account_id: this.formData.account_id,
          type: this.formData.type,
          end_time: this.formData.activity_time / 1000  //后端接收的时间最小为秒，所以除以1000
        }
        addPromo(obj).then(res => {
        }).catch(() => {
        }).finally(() => {
          this.onClose()
          this.$emit('reload')
          this.loading = false
        })
      }
    },
    onCancel() {
      this.closeClearForm()
    },
    onClose() {
      this.closeClearForm()
    },
    closeClearForm() {
      this.$refs['formData'].resetFields()
      this.$emit('update:open', false)
    }
  },
  filters: {},
  watch: {}
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
