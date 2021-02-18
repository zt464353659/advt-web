<template>
  <el-dialog
    :title="'设置毛利率'"
    :visible="open"
    :before-close="onClose"
    width="600px"
    v-loading="loading"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    v-dragMove
  >
    <el-form ref="form" label-width="120px" :model="form" :rules="rules" size="small">
      <el-form-item :label="item" :prop="item" v-for="(item, index) in data" :key="index">
        <el-input v-model="form[item]" style="width: 400px"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="onSubmit('form')">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
  import { updateCustomerPrice } from '@/api/mallmy'

  export default {
    data() {
      const checkGrossMargin = (rule, value, callback) => {
        const reg = /^\d\.([1-9]{1,2}|[0-9][1-9])$|^[1-9]\d{0,1}(\.\d{1,2}){0,1}$|^100(\.0{1,2}){0,1}$/
        if (!reg.test(value)) {
          callback(new Error('毛利率必须是0-100之间的数字'))
        } else {
          callback()
        }
      }
      return {
        istore_product_id: [],
        loading: true,
        checkGrossMargin: checkGrossMargin,
        form: {
          grossMargin: {}
        },
        rules: {}
      }
    },
    props:
      {
        data: {
          type: Array,
          required: false,
          default: () => {}
        },
        open: {
          type: Boolean,
          required: true
        }
      },
    watch: {
      open(val) {
        if (val) {
          this._.forEach(this.data, (v) => {
            this.rules[v] = [
              { required: true, message: '毛利率必须是0-100之间的数字', trigger: 'blur' },
              { validator: this.checkGrossMargin, trigger: 'blur' }
            ]
          })
        }
      }
    },
    methods: {
      onSubmit(formName) {
        this.$refs[formName].validate((valid) => {
          this.loading = true
          if (valid) {
            const istore_product_id = []
            this._.forEach(this.data, (v) => {
              istore_product_id.push(v)
            })
            const obj = {
              gross_margin: this.form,
              product_id: istore_product_id,
              custom_price_type: 2
            }
            updateCustomerPrice(obj).finally(() => {
              this.loading = false
              this.$refs['form'].resetFields()
              this.$emit('update:open', false)
              this.$emit('renderList')
            })
          } else {
            return false
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
