<template>
  <el-dialog
    title="产品添加"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="closeClearForm"
    width="740px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    v-drag-move
  >
    <template>
      <el-form ref="formData" v-loading="dialogLoading" element-loading-text="添加中···" :model="formData" :rules="rules" label-width="100px" size="small" @submit.native.prevent>
        <el-form-item label="Site Code" prop="account_id">
          <el-select v-model="formData.account_id" placeholder="请选择Site Code">
            <el-option v-for="(item,key) in options" :label="item.label" :value="item.value" :key="key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="平台商品号" prop="productIds">
          <el-input
            type="textarea"
            style="width: 90%;"
            :autosize="{ minRows: 4, maxRows: 8 }"
            placeholder="请输入内容，一行填写一个平台商品号"
            v-model="formData.productIds"
          >
          </el-input>
          <p>
            <svg-icon icon-class="bug" />
            一行填写一个平台商品号
          </p>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClearForm">取 消</el-button>
      <el-button type="primary" :disabled="isClicked" v-debounce:formData="addPlan" data-type="form">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import store from '@/store'
import { addPullConfig, fetchSiteCode } from '@/api/coupang'

export default {
  data() {
    const checkProductId = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('平台商品号不能为空'))
      }
      const reg = /^[0-9]*$/
      const arr = this._.compact(value.replace(/ +/g, '').split('\n'))
      if (arr.length === 0) {
        callback(new Error('平台商品号不能全为空行'))
      }
      if (arr.length > 1000) {
        callback(new Error('最多输入1000个平台商品号'))
      }
      this._(arr).forEach(function(val) {
        if (!reg.test(val)) {
          callback(new Error('平台商品号必须为数字值（不能包含特殊符号、标点符号、字母及汉字）'))
        } else if (val.length !== 11) {
          callback(new Error('平台商品号只能是11位'))
        }
      })
      callback()
    }
    return {
      dialogLoading: false,
      isClicked: false,
      options: [],
      formData: {
        account_id: '',
        productIds: ''
      },
      rules: {
        account_id: [
          { required: true, message: '请先选择site code', trigger: 'change' }
        ],
        productIds: [
          { required: true, validator: checkProductId, trigger: 'blur' }
        ]
      }
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
    // 添加计划
    addPlan() {
      this.$refs.formData.validate((valid) => {
        if (valid) {
          const product_ids = this._.compact(this._.uniq(this.formData.productIds.split('\n'))).join(',')
          const params = {
            product_ids,
            account_id: this.formData.account_id
          }
          this.dialogLoading = true
          this.isClicked = true
          addPullConfig(params).then(() => {
            this.closeClearForm()
            this.$emit('reload')
          }).finally(() => {
            this.dialogLoading = false
            this.isClicked = false
          })
        }
      })
    },
    // 关闭弹窗，表单重置
    closeClearForm() {
      this.$refs['formData'].resetFields()
      this.$emit('update:open', false)
    },
    // sitecode 获取
    siteCodeFetch() {
      fetchSiteCode().then(response => {
        this.options = response.data
      })
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

.plan_type .el-input.is-disabled .el-input__inner {
  background: transparent;
}
</style>
<style rel="stylesheet/scss" lang="scss">
.plan_date_picker {
  .el-button--text {
    display: none
  }
}
</style>
