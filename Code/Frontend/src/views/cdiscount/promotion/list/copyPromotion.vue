<template>
  <el-dialog
    title="copy促销活动"
    class="dialog-add-promotion"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="700px"
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" label-width="150px" size="small">
        <el-form-item label="活动名称" prop="sale_name">
          <el-input type="text" v-model="formData.sale_name" style="width: 180px;" size="mini" clearable placeholder="请输入活动名称"></el-input>
        </el-form-item>
        <el-form-item label="账号" prop="account_id">
          <el-select v-model="formData.account_id" size="mini" style="width: 180px;" filterable disabled placeholder="请选择站点">
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
          <el-select v-model="formData.type" style="width: 180px;" size="mini" filterable disabled placeholder="请选择站点">
            <el-option
              v-for="item in formData.typeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
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
            style="width: 173px;"
          >
          </el-time-select>
          <el-time-select
            placeholder="结束时间"
            v-model="formData.end_time"
            size="mini"
            value-format="HH-mm"
            :picker-options="end_options"
            style="width: 173px;"
          >
          </el-time-select>
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
  import { copyPromo } from '@/api/cdiscount'

  export default {
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
          sale_name: '',
          account_id: '',
          type: '',
          activity_date: [],
          activity_time: [],
          start_time: '',
          end_time: '',
          sale_id: '',
          typeList: [
            {
              value: '1',
              label: '限时促销'
            },
            {
              value: '2',
              label: '促销季'
            }
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
          end: '23:59'
        },
        end_options: {
          start: '00:00',
          step: '00:30',
          end: '23:59'
        },
        options: [],
        rules: {
          sale_name: [
            { required: true, message: '请填写活动名称', trigger: ['change', 'blur'] },
            { max: 100, message: '活动名称最多100个字符', trigger: ['change', 'blur'] }
          ],
          account_id: [
            { required: true, message: '请先选择账号', trigger: ['change', 'blur'] }
          ],
          type: [
            { required: true, message: '请选择类型', trigger: ['change', 'blur'] }
          ],
          activity_date: [
            { required: true, message: '请选择日期', trigger: ['change', 'blur'] }
          ],
          activity_time: [
            { required: true, validator: checkTime, trigger: ['blur'] }
          ]
        }
      }
    },
    props: {
      open: {
        type: Boolean,
        default: false
      },
      optionsData: {
        type: Object,
        default: (() => {
        })
      },
      selectAll: {
        type: Array,
        default: (() => {})
      }
    },
    created() {
    },
    methods: {
      //时间转时间戳
      onTime(time) {
        const t = time
        const T = new Date(t)
        return T
      },
      onSubmit() {
        this.$refs['formData'].validate((valid) => {
          if (valid) {
            this.loading = true
            if (this.selectAll) {
              this.selectAll.forEach(v => {
                if (v.site_code === this.formData.account_id) {
                  this.formData.account_id = v.id
                }
              })
            }
            if (this.formData.typeList) {
              this.formData.typeList.forEach(v => {
                if (v.label === this.formData.type) {
                  this.formData.type = v.value
                }
              })
            }
            const obj = {
              sale_id: this.formData.sale_id,
              sale_name: this.formData.sale_name,
              account_id: this.formData.account_id,
              type: this.formData.type,
              start_time: this.onTime(`${this.formData.activity_date[0]} ${this.formData.start_time}`).getTime() / 1000,
              end_time: this.onTime(`${this.formData.activity_date[1]} ${this.formData.end_time}`).getTime() / 1000
            }
            copyPromo(obj).then(() => {
              this.loading = false
              this.$emit('reload')
              this.onClose()
            }).catch(() => {
              this.loading = false
              this.onClose()
            }).finally(() => {
              this.loading = false
            })
          } else {
            this.$message.error('请输入必填项')
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
        this.formData = {
          sale_name: '',
          activity_date: [],
          activity_time: [],
          start_time: '',
          end_time: '',
          sale_id: '',
          typeList: [
            {
              value: '1',
              label: '限时促销'
            },
            {
              value: '2',
              label: '促销季'
            }
          ]
        }
        this.$refs['formData'].resetFields()
        this.$emit('update:open', false)
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
      },
      // 数据回填处理
      dataDispose(val) {
        this.formData.account_id = val.site_code
        if (val.type === '1') {
          this.formData.type = '限时促销'
        } else {
          this.formData.type = '促销季'
        }
        this.formData.sale_id = val.id
      }
    },
    filters: {},
    watch: {
      open(val) {
        if (val) {
          this.dataDispose(this.optionsData)
        }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
