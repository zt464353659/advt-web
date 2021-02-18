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
      <el-form ref="formData" :model="formData" v-loading="listLoading" element-loading-text="添加中···" :rules="rules" label-width="120px" size="small" @submit.native.prevent>
        <el-form-item label="Site Code" prop="account_id">
          <el-select v-model="formData.account_id" clearable filterable multiple collapse-tags placeholder="请选择Site Code">
            <el-option v-for="(item,key) in options" :label="item.label" :value="item.value" :key="key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型" class="plan_type">
            <el-option label="计划上传" value="0"></el-option>
            <el-option label="计划下架" value="1"></el-option>
            <el-option label="定时上传" value="2"></el-option>
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
            <svg-icon icon-class="bug" />
            一行填写一个产品id，最多可输入1000个ID（已输入 {{ numbers }} 个）
          </p>
        </el-form-item>
        <el-form-item label="上传开始时间" prop="start_time" v-if="formData.type==='2'">
          <el-date-picker
            v-model="formData.start_time"
            type="datetime"
            value-format="timestamp"
            placeholder="请选择上传开始时间"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button :loading="isClicked" @click="closeClearForm">取 消</el-button>
      <el-button type="primary" :loading="isClicked" @click="addPlan" data-type="form">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import store from '@/store'
import { addPlan, fetchSiteCode, selectTime } from '@/api/coupang'

const formatDate = (date) => {
  let y = date.getFullYear()
  let m = date.getMonth() + 1
  m = m < 10 ? '0' + m : m
  let d = date.getDate()
  d = d < 10 ? ('0' + d) : d
  return y + m + d
}
export default {
  data() {
    const checkProductId = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('产品ID不能为空'))
      }
      const reg = /^[0-9]*$/
      const arr = this._.compact(value.replace(/ +/g, '').split('\n'))
      if (arr.length === 0) {
        return callback(new Error('产品ID不能全为空行'))
      } else if (arr.length > 1000) {
        return callback(new Error('产品ID不能超过1000个'))
      }
      this._(arr).forEach(function(val) {
        if (!reg.test(val)) {
          return callback(new Error('产品ID必须为数字值（不能包含特殊符号、标点符号、字母及汉字）'))
        } else if (val.length !== 8) {
          return callback(new Error('产品id只能是8位'))
        }
      })
      callback()
    }
    const val_start_time = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('上传开始时间不能为空'))
      }
      if (formatDate(new Date(Number(value))) <= formatDate(new Date())) {
        if (formatDate(new Date(Number(value))) < formatDate(new Date())) {
          return callback(new Error('执行任务时间不能小于当前日期'))
        }
        if (new Date(Number(value)).getHours() <= new Date().getHours()) {
          return callback(new Error('执行任务时间不能小于等于当前小时'))
        }
      }
      callback()
    }
    return {
      numbers: 0,
      listLoading: false,
      isClicked: false,
      options: [],
      formData: {
        account_id: [],
        type: '0',
        productIds: '',
        start_time: undefined
      },
      rules: {
        account_id: [
          { required: true, message: '请先选择site code', trigger: 'change' }
        ],
        productIds: [
          { required: true, validator: checkProductId, trigger: 'blur' }
        ],
        start_time: [
          { required: true, validator: val_start_time, trigger: 'change' }
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
    //添加计划行数计算
    getIdsNumbers() {
      this.numbers = this._.compact(this.formData.productIds.replace(/ +/g, '').split('\n')).length
    },
    // 添加计划
    addPlan() {
      this.$refs.formData.validate((valid) => {
        if (valid) {
          const params = {
            user_id: store.getters.userInfo.id,
            account_id: this.formData.account_id,
            type: this.formData.type,
            data: this._.compact(this.formData.productIds.replace(/ +/g, '').split('\n')).join(','),
            start_time: this.formData.start_time / 1000
          }
          this.listLoading = true
          this.isClicked = true
          addPlan(params).then(response => {
            this.closeClearForm()
            this.$emit('reload')
          }).finally(() => {
            this.listLoading = false
            this.isClicked = false
          })
        }
      })
    },
    // 关闭弹窗，表单重置
    closeClearForm() {
      this.formData.start_time = undefined
      this.numbers = 0
      this.listLoading = false
      this.isClicked = false
      this.$refs['formData'].resetFields()
      this.$emit('update:open', false)
    },
    // sitecode 获取
    siteCodeFetch() {
      fetchSiteCode().then(response => {
        this.options = response.data
      })
    }
  },
  computed: {}
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
