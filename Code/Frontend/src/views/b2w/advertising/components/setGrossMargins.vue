<template>
  <el-dialog :title="'设置毛利率'" v-dragMove :visible="open" :before-close="onClose" width="600px" v-loading="loading" :close-on-press-escape="false" :close-on-click-modal="false">
    <el-form ref="form" label-width="80px" :model="form" :rules="rules" size="small">
      <el-form-item label="毛利率" prop="gross_margin">
        <el-input v-model="form.gross_margin" style="width: 400px"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="onSubmit('form')">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
  import { changePrice } from '@/api/b2w'
  import { resultAlert } from '../common'

  export default {
    data() {
      const checkPrice = (rule, value, callback) => {
        const reg = /^\d\.([1-9]{1,2}|[0-9][1-9])$|^[1-9]\d{0,1}(\.\d{1,2}){0,1}$|^100(\.0{1,2}){0,1}$/
        if (!reg.test(value)) {
          callback(new Error('毛利率必须是0-100之间的数字'))
        } else {
          callback()
        }
      }
      const checkTime = (rule, value, callback) => {
        if (value[0] < this.defaultTime) {
          callback(new Error('开始时间不能小于当前时间'))
        } else {
          callback()
        }
      }
      return {
        loading: true,
        // 设置时间
        pickerOptions1: {
          disabledDate(time) {
            return time.getTime() < (Date.now() - 60 * 60 * 24 * 1000)
          }
        },
        defaultTime: Date.now(),
        form: {
          gross_margin: null,
          begin_time: ''
        },
        rules: {
          gross_margin: [
            { required: true, message: '毛利率必须是0-100之间的数字且最多保留两位小数', trigger: 'blur' },
            { validator: checkPrice, trigger: 'blur' }
          ],
          begin_time: [
            { required: true, message: '请选择日期', trigger: 'blur' },
            { validator: checkTime, trigger: 'blur' }
          ]
        }
      }
    },
    props: {
      advtIds: {
        type: Array,
        required: false,
        default: () => []
      },
      grossMargin: {
        type: [String, Number],
        default: ''
      },
      open: {
        type: Boolean,
        required: true
      }
    },
    watch: {
      open(val) {
        if (val) {
          this.form.gross_margin = this.gross_margin
        }
      }
    },
    methods: {
      onSubmit(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.loading = true
            const obj = {
              custom_price: this.form.gross_margin,
              product_id: this.advtIds,
              custom_price_type:2,
              not_show_message: true
            }
            changePrice(obj).then(res => {
              this.$emit('renderList')
              resultAlert(res)
            }).catch(err => {
              this.$message.error(err)
            }).finally(() => {
              this.loading = false
              this.$refs['form'].resetFields()
            })
            this.$emit('update:open', false)
          }
        })
      },
      onClose() {
        this.$emit('update:open', false)
        this.$refs['form'].resetFields()
      }
    }
  }
</script>
