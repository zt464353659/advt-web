<template>
  <el-dialog
    :title="`属性配置 ID:${rowData.id}`"
    v-dragMove :visible="open"
    :before-close="onClose"
    width="600px"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
  >
    <div class="loading-dialog" v-loading="loading" element-loading-text="处理中">
      <template>
        <el-form ref="form" label-width="150px" :model="form" :rules="rules" size="small">
          <el-form-item label="Attribute Name">
            <div>{{ rowData.attribute_name }}</div>
          </el-form-item>
          <el-form-item label="Value Type">
            <div>{{ rowData.value_type }}</div>
          </el-form-item>
          <el-form-item label="Options" prop="value_option" v-if="rowData.value_type !== 'number_unit' && rowData.values">
            <el-select v-model="form.value_option" @change="handleOptionValueChange" clearable style="width: 400px">
              <el-option v-for="(item,ind) in rowData.values" :label="item.name" :value="item.name" :key="ind"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Default Value" prop="default_value">
            <el-input :disabled="rowData.value_type === 'boolean'" v-model="form.default_value" clearable style="width: 400px"></el-input>
          </el-form-item>
          <el-form-item label="Unit" v-if="rowData.value_type === 'number_unit'" prop="unit">
            <el-select v-model="form.unit" clearable style="width: 400px">
              <el-option v-for="(item,ind) in rowData.values" :label="item.name" :value="item.name" :key="ind"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </template>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="onClose">取 消</el-button>
        <el-button size="mini" type="primary" @click="onSubmit('form')">确 定</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { updateAttributeConfig } from '@/api/mercadolibre.gs'

export default {
  data() {
    const checkValue = (rule, value, callback) => {
      // 数字类型
      if (['number', 'number_unit'].includes(this.rowData.value_type)) {
        // 非0正整数
        const reg = /^[1-9]+\d*$/
        if (!reg.test(value)) {
          callback(new Error('默认值必须为正整数'))
        }
        callback()
      } else {
        if (!value.trim()) {
          callback(new Error('默认值不能为空'))
        }
        callback()
      }
    }
    return {
      loading: false,
      form: {
        value_option: undefined,
        default_value: undefined,
        unit: undefined
      },
      rules: {
        default_value: [
          { required: true, validator: checkValue, trigger: 'blur' }
        ],
        unit: [
          { required: true, message: '请选择单位', trigger: ['blur', 'change'] }
        ]
      }
    }
  },
  props: {
    rowData: {
      type: Object,
      default: () => {
      }
    },
    open: Boolean
  },
  watch: {
    open(val) {
      if (val) {
        if (this.rowData.value_type === 'number_unit') {
          this.form.default_value = this.rowData.attribute_value.split(' ')[0]
          this.form.unit = this.rowData.attribute_value.split(' ')[1]
        } else {
          this.form.default_value = this.rowData.attribute_value
        }
      }
    }
  },
  methods: {
    handleOptionValueChange(val) {
      this.form.default_value = val
    },
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true
          const obj = {
            id: this.rowData.id,
            value_type: this.rowData.value_type,
            value: this.rowData.value_type === 'number_unit' ? `${this.form.default_value} ${this.form.unit}` : this.form.default_value
          }
          updateAttributeConfig(obj).then((res) => {
            this.afterConfirm()
          }).catch(err => {
            this.loading = false
          })
        }
      })
    },
    onClose() {
      this.$emit('update:open', false)
      this.$refs['form'].resetFields()
    },
    afterConfirm() {
      this.loading = false
      this.$refs['form'].resetFields()
      this.$emit('update:open', false)
      this.$emit('reload')
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>

.loading-dialog {
  .dialog-footer {
    text-align: right;
    margin-bottom: -15px;
  }
}
</style>

