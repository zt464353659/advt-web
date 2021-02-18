<template>
  <el-dialog
    title="产品添加"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="closeClearForm"
    width="740px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @open="getServerTime"
    v-drag-move
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" label-width="100px" size="small" @submit.native.prevent>
        <el-form-item label="Site Code" prop="account_id">
          <el-select v-model="formData.account_id" placeholder="请选择Site Code">
            <el-option v-for="(item,key) in options" :label="item.label" :value="item.value" :key="key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型">
            <el-option label="计划上传" value="0"></el-option>
            <el-option label="计划下架" value="1"></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="执行类型" prop="time" class="time_type">
          <el-input v-model="formData.time" placeholder="请输入内容" style="display:none"></el-input>
          <el-radio-group v-model="formData.time_type" @change="changeTimeType">
            <el-radio :label="0">立即执行</el-radio>
            <el-radio :label="1">选择日期时间</el-radio>
            <el-date-picker
              v-if="Number(formData.time_type) === 1 && serverTime"
              v-model="date"
              type="date"
              placeholder="选择日期"
              @change="selectDate"
              :picker-options="DateOptions"
            >
            </el-date-picker>
            <el-time-select
              v-if="Number(formData.time_type) === 1 && date"
              v-model="time"
              :picker-options="timeOptions"
              placeholder="选择时间"
              :clearable="false"
              @change="selectDateTime"
              popper-class="preview_time"
            >
            </el-time-select>
          </el-radio-group>
        </el-form-item> -->
        <el-form-item label="产品id" prop="productIds">
          <el-input
            type="textarea"
            style="width: 90%;"
            :autosize="{ minRows: 4, maxRows: 16}"
            placeholder="请输入内容，一行填写一个产品id"
            v-model="formData.productIds"
            @input="getIdsNumbers"
          >
          </el-input>
          <p>
            <svg-icon icon-class="bug" />
            一行填写一个产品id，最多可输入1000个ID（已输入 {{ numbers }} 个）
          </p>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClearForm">取 消</el-button>
      <el-button type="primary" v-debounce:formData="addPlan" data-type="form" :loading="buttonLoad">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import store from '@/store'
import { addPlan, fetchSiteCode, selectTime } from '@/api/kr11street'
import { fromatNum } from '@/utils/index'

export default {
  data() {
    const checkProductId = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('产品ID不能为空'))
      }
      const reg = /^[0-9]*$/
      const arr = this._.compact(value.replace(/ +/g, '').split('\n'))
      if (arr.length === 0) {
        callback(new Error('产品ID不能全为空行'))
      } else if (arr.length > 1000) {
        callback(new Error('产品ID不能超过1000个'))
      }
      this._(arr).forEach(function(val) {
        if (!reg.test(val)) {
          callback(new Error('产品id必须为数字值（不能包含特殊符号、标点符号、字母及汉字）'))
        } else if (val.length !== 8) {
          callback(new Error('产品id只能是8位'))
        }
      })
      callback()
    }
    const checkTime = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入执行时间'))
      } else if (this.formData.time_type === 1) {
        if (value.length < 19) {
          callback(new Error('请输入正确日期和时间'))
        }
        callback()
      }
      callback()
    }
    return {
      numbers: 0,
      options: [],
      formData: {
        account_id: '',
        type: '0',
        time_type: 0,
        time: '1',
        productIds: ''
      },
      buttonLoad: false,
      rules: {
        account_id: [
          { required: true, message: '请先选择site code', trigger: 'change' }
        ],
        productIds: [
          { required: true, validator: checkProductId, trigger: 'blur' }
        ],
        time: [
          { validator: checkTime, trigger: 'change' }
        ]
      },
      // 日期组件使用
      date: undefined,
      time: undefined,
      // 系统时间使用
      serverTime: undefined,
      serverDate: undefined,
      serverNextDate: undefined,
      // 保存失败
      form: false
    }
  },
  props: {
    open: {
      type: Boolean,
      default: false
    }
  },
  created() {
    this.siteCodeFetch()
  },
  methods: {
    getIdsNumbers() {
      this.numbers = this._.compact(this.formData.productIds.replace(/ +/g, '').split('\n')).length
    },
    // 添加计划
    addPlan() {
      this.$refs.formData.validate((valid) => {
        if (valid) {
          this.buttonLoad = true
          const params = {
            user_id: store.getters.userInfo.id,
            account_id: this.formData.account_id,
            type: this.formData.type,
            data: this._.compact(this.formData.productIds.replace(/ +/g, '').split('\n')).join(','),
            is_plan: '1'
          }
          if (Number(this.formData.time_type) === 1) {
            params.start_time = parseInt(new Date(this.formData.time).getTime() / 1000)
          }
          addPlan(params).then(response => {
            this.closeClearForm()
            this.form = false
            this.$emit('reload')
          }).catch(error => {
            this.$message.warning(error.message)
            this.form = true
            if (error.code === 50001) {
              this.getServerTime()
              this.time = ''
            }
          }).finally(()=>{
            this.buttonLoad = false
          })
        } else {
          sessionStorage.setItem('formData', JSON.stringify(this.formData))
          return false
        }
      })
    },
    // 表单重置
    closeClearForm() {
      this.$refs['formData'].resetFields()
      this.formData.time = 1
      this.formData.time_type = 0
      this.numbers = 0
      this.date = undefined
      this.time = undefined
      this.$emit('update:open', false)
    },
    // 计划执行类型选择
    changeTimeType() {
      this.formData.time = Number(this.formData.time_type) === 0 ? 1 : ''
      this.date = undefined
      this.time = undefined
    },
    // sitecode 获取
    siteCodeFetch() {
      fetchSiteCode().then(response => {
        this.options = response.data
      })
    },
    // 服务器时间获取
    getServerTime() {
      selectTime().then(response => {
        this.serverTime = response.data * 1000
        this.serverDate = new Date(this.serverTime).setHours(0, 0, 0, 0)
        this.serverNextDate = new Date(this.serverTime).setHours(24, 0, 0, 0)
        if (this.date) {
          if (this.serverNextDate - this.serverTime <= 15 * 60 * 1000) {
            this.date = ''
          }
          this.selectDate()
        }
      }).catch(_ => {
      })
    },
    selectDate() {
      if (this.date) {
        this.formData.time = this.date.getFullYear() + '-' +
          ((this.date.getMonth() + 1) > 9 ? (this.date.getMonth() + 1) : '0' + (this.date.getMonth() + 1)) + '-' +
          (this.date.getDate() > 9 ? this.date.getDate() : '0' + this.date.getDate())
      } else {
        this.formData.time = ''
      }
      this.time = ''
    },
    selectDateTime() {
      this.formData.time = this.formData.time.substr(0, 10) + ' ' + this.time + ':00'
    }
  },
  computed: {
    DateOptions() {
      const that = this
      return {
        disabledDate(time) {
          if (that.serverNextDate - that.serverTime <= 15 * 60 * 1000) {
            return time.getTime() < that.serverNextDate
          } else {
            return time.getTime() < that.serverDate
          }
        }
      }
    },
    timeOptions() {
      const dateTime = new Date(this.serverTime)
      const options = { step: '0:15', end: '23:45' }
      if (this.date && !this.time) {
        if (this.date.getTime() === this.serverDate && !(dateTime.getHours() === 23 && dateTime.getMinutes() >= 45)) {
          let time = fromatNum(dateTime.getHours())
          if (dateTime.getMinutes() > 0 && dateTime.getMinutes() < 15) {
            time += ':15'
          } else if (dateTime.getMinutes() < 30) {
            time += ':30'
          } else if (dateTime.getMinutes() < 45) {
            time += ':45'
          } else {
            time = fromatNum(dateTime.getHours() + 1) + ':00'
          }
          options.start = time
        } else {
          options.start = '00:00'
        }
      }
      return options
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

.time_type .el-date-editor.el-input {
  width: 140px;
  margin-right: 10px;
}

.time_type .el-form-item__error {
  left: 270px;
}
</style>
<style rel="stylesheet/scss" lang="scss">
.plan_date_picker {
  .el-button--text {
    display: none
  }
}
</style>
