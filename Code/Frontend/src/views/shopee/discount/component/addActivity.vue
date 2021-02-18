<template>
  <el-dialog
    title="添加活动"
    :visible="open"
    :before-close="onClose"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    width="740px"
    v-dragMove
  >
    <template>
      <el-form ref="formData" :rules="rules" :model="formData" label-width="100px" size="small" @submit.native.prevent>
        <el-form-item label="Site Code" prop="site_code">
          <el-select v-model="formData.site_code" size="mini" clearable filterable placeholder="请选择站点">
            <el-option
              v-for="item in options"
              :key="item.id"
              :label="item.site_code"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="活动名称" prop="activity_name">
          <el-input type="text" v-model="formData.activity_name" style="width: 193px;" size="mini" clearable placeholder="请输入活动名称"></el-input>
        </el-form-item>
        <el-form-item label="活动日期" prop="activity_date">
          <el-date-picker
            v-model="formData.activity_date"
            type="daterange"
            :pickerOptions="pickerOptions"
            value-format="yyyy-MM-dd"
            size="mini"
            class="data-picker"
            @change="selectDate"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="活动时间" prop="activity_time">
          <el-time-select
            placeholder="起始时间"
            v-model="formData.start_time"
            size="mini"
            @change="startTimeChange"
            value-format="HH-mm"
            :picker-options="start_options"
          >
          </el-time-select>
          <el-time-select
            placeholder="结束时间"
            v-model="formData.end_time"
            size="mini"
            value-format="HH-mm"
            :picker-options="end_options"
          >
          </el-time-select>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取 消</el-button>
      <el-button type="primary" @click="addActivity('formData')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { addDiscount } from '@/api/shopee'

  export default {
    name: 'AddActivity',
    data() {
      const checkTime = (rule, value, callback) => {
        if (!this.formData.start_time) {
          callback(new Error('请选择开始时间'))
        } else if (!this.formData.end_time) {
          callback(new Error('请选择结束时间'))
        } else {
          callback()
        }
      }
      return {
        formData: {
          site_code: '',
          activity_name: '',
          activity_date: '',
          start_time: '',
          end_time: '',
          confirmDate: ''
        },
        rules: {
          site_code: [
            { required: true, message: '请先选择账号', trigger: 'blur' }
          ],
          activity_name: [
            { required: true, message: '请填写活动名称', trigger: 'blur' },
            { max: 100, message: '活动名称最多100个字符', trigger: 'blur' }
          ],
          activity_date: [
            { required: true, message: '请选择日期', trigger: 'blur' }
          ],
          activity_time: [
            { required: true, validator: checkTime, trigger: 'blur' }
          ]
        },
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() + 24 * 60 * 60 * 1000 < Date.now()
          }
        },
        start_options: {
          start: '00:00',
          step: '00:30',
          end: '23:30'
        },
        end_options: {
          start: '00:00',
          step: '00:30',
          end: '23:30'
        }
      }
    },
    props: {
      options: {
        type: Array,
        required: true,
        default: () => []
      },
      open: {
        type: Boolean,
        default: false
      }
    },
    created() {
    },
    mounted() {
    },
    methods: {
      openDetail(params) {
        const { href } = this.$router.resolve({
          name: 'shopee.discount.detail',
          params: params || {}
        })
        window.open(href, '_blank')
      },
      onCancel() {
        this.closeClearForm()
      },
      onClose() {
        this.closeClearForm()
      },
      closeClearForm() {
        this.formData = {
          site_code: '',
          activity_name: '',
          activity_date: '',
          start_time: '',
          end_time: '',
          confirmDate: ''
        }
        this.$refs['formData'].resetFields()
        this.$emit('update:data', {})
        this.$emit('update:open', false)
      },
      addActivity(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            const obj = {
              name: this.formData.activity_name,
              account_id: this.formData.site_code,
              start_time: `${this.formData.activity_date[0]} ${this.formData.start_time}`,
              end_time: `${this.formData.activity_date[1]} ${this.formData.end_time}`
            }
            const loading = this.$loading({
              lock: true,
              text: '正在加载',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.2)'
            })
            addDiscount(obj).then((response) => {
              this.openDetail({ discount_id: response.data.discount_id, account_id: response.data.account_id })
              this.$emit('reload')
            }).finally(() => {
              this.onClose()
              loading.close()
            })
          }
        })
      },
      // 选择日期
      selectDate(date) {
        if (date) {
          this.formData.start_time = ''
          this.formData.end_time = ''
          this.confirmDate = date
          const year = new Date().getFullYear()
          let month = new Date().getMonth() + 1
          let now_date = new Date().getDate()
          let time_start = ''
          if (month < 10) {
            month = '0' + month
          }
          if (now_date < 10) {
            now_date = '0' + now_date
          }
          const today = `${year}-${month}-${now_date}`
          if (today === date[0]) {
            // 用户选择的时间是今天，设置可选时间范围为当前时间之后一小时整半点
            let hour = new Date().getHours() + 1
            let minute = new Date().getMinutes()
            if (hour < 10) {
              hour = '0' + hour
            }
            if (minute === 0 || minute > 0 && minute < 30) {
              minute = '30'
            } else {
              minute = '00'
              hour = Number(hour) + 1
              if (hour < 10) {
                hour = '0' + hour
              }
            }
            time_start = `${hour}:${minute}`
            this.start_options.start = time_start
          } else {
            this.start_options.start = '00:00'
            this.start_options.end = '23:30'
          }
        }
      },
      // 选择开始时间
      startTimeChange(start) {
        if (this.confirmDate) {
          if (this.confirmDate[0] === this.confirmDate[1]) {
            if (start) {
              const end_hour = Number(this.formData.start_time.slice(0, 2)) + 1
              const range = end_hour + this.formData.start_time.slice(-3)
              this.end_options.start = range
            }
          } else if (new Date(this.confirmDate[1]) - new Date(this.confirmDate[0]) === 86400000 && this.formData.start_time === '23:30') {
            this.end_options = {
              start: '00:30',
              step: '00:30',
              end: '23:30'
            }
          } else {
            this.end_options = {
              start: '00:00',
              step: '00:30',
              end: '23:30'
            }
          }
        }
      }
    },
    filters: {},
    watch: {}
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .data-picker {
    width: 445px;
  }
</style>
