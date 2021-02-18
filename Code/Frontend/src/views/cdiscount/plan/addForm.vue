<template>
  <el-dialog
    title="产品添加"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="740px"
    v-drag-move
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" label-width="100px" size="small" @submit.native.prevent>
        <el-form-item label="账号" prop="account_id">
          <el-select v-model="formData.account_id" placeholder="请选择类型">
            <el-option v-for="item in options" :key="item.id" :label="item.site_code" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型" class="plan_type">
            <el-option label="计划上传" value="0"></el-option>
            <el-option label="计划下架" value="1"></el-option>
          </el-select>
        </el-form-item>
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
            <svg-icon icon-class="bug"/>
            一行填写一个产品id，最多可输入1000个ID（已输入 {{ numbers }} 个）
          </p>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取 消</el-button>
      <el-button type="primary" v-debounce @click="addPlan('formData')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import store from '@/store'
import { resultAlert } from '@/utils/index'
import { addProductPlan, getSelectAll } from '@/api/cdiscount'

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
    return {
      numbers: 0,
      formData: {
        platform_id: '1',
        productIds: '',
        account_id: '',
        data: [],
        type: '0'
      },
      options: [],
      rules: {
        account_id: [
          { required: true, message: '请先选择平台及账号', trigger: 'change' }
        ],
        productIds: [
          // { required: true, message: '请输入产品id', trigger: 'blur' },
          { validator: checkProductId, trigger: 'blur' }
        ]
      },
      isIndeterminate: true,
      props: {
        value: 'code',
        label: 'label',
        children: 'children'
      }
    }
  },
  props: {
    data: {
      type: Object,
      required: true
    },
    open: {
      type: Boolean,
      default: false
    }
  },
  created() {
    const optionsParams = ['esAdvtAccount']
    getSelectAll(optionsParams).then(response => {
      this.options = response.data.esAdvtAccount
    })
  },
  methods: {
    getIdsNumbers() {
      this.numbers = this._.compact(this.formData.productIds.replace(/ +/g, '').split('\n')).length
    },
    addPlan(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.formData.user_id = store.getters.userInfo.id
          let newdata = this.formData.productIds.split('\n').map(value => {
            return value.trim()
          })
          this.formData.data = this._.compact(newdata).join(',')
          this.formData.not_show_message = true//屏蔽message
          addProductPlan(this.formData).then(response => {
            this.closeClearForm()
            if (response.data) {
              resultAlert(response)
            } else {
              this.$message.err(response.message)
            }
          }).finally(() => {

            this.$emit('reload')
          })
        } else {
          return false
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
      this.$refs['formData'].resetFields()
      this.$emit('update:data', {})
      this.$emit('update:open', false)
      this.numbers = 0
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
