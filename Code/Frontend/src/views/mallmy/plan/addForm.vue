<template>
  <el-dialog
    title="产品添加"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="closeClearForm"
    width="740px"
    v-dragMove
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" label-width="100px" size="small" @submit.native.prevent>
        <el-form-item label="账号" prop="account_id">
          <el-select v-model="formData.account_id" placeholder="请选择账号">
            <el-option v-for="item in options" :key="item.value" :label="item.site_code" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型">
            <el-option label="计划上传" value="0"></el-option>
            <el-option label="计划下架" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品id" prop="productIds">
          <el-input
            type="textarea"
            style="width: 90%;"
            :autosize="{ minRows: 4, maxRows: 8}"
            placeholder="请输入内容，一行填写一个产品id"
            @input="showLines"
            v-model="formData.productIds"
          >
          </el-input>
          <p>
            <svg-icon icon-class="bug"/>
            一行填写一个产品id
            <span v-if="lines">(已输入 {{ this.lines }} 行)</span>
          </p>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClearForm">取 消</el-button>
      <el-button type="primary" @click="addPlan('formData')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import store from '@/store'
  import { addPlan, getSelectAll } from '@/api/mallmy'

  export default {
    data() {
      const checkProductId = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('产品id不能为空'))
        }
        setTimeout(() => {
          const reg = /^[0-9]*$/
          this._(this._.compact(value.split('\n'))).forEach(function(val) {
            if (!reg.test(val)) {
              callback(new Error('产品id必须为数字值（不能包含特殊符号、空格标点符号及汉字）'))
            } else if (val.length !== 8) {
              callback(new Error('产品id只能是8位'))
            }
          })
          callback()
        }, 1000)
      }
      return {
        formData: {
          productIds: '',
          platform_id: '1',
          account_id: undefined,
          data: [],
          type: '',
          user_name: this.$store.state.user.name
        },
        options: [],
        rules: {
          account_id: [
            { required: true, message: '请先选择账号', trigger: 'change' }
          ],
          productIds: [
            { validator: checkProductId, trigger: 'blur' }
          ]
        },
        isIndeterminate: true,
        lines: 0
      }
    },
    props: {
      addData: {
        type: Object,
        required: true,
        default: () => {}
      },
      open: {
        type: Boolean,
        required: true,
        default: false
      }
    },
    created() {
      const optionsParams = ['MallMyAdvtAccount']
      getSelectAll(optionsParams).then(response => {
        this.options = response.data.MallMyAdvtAccount
      })
    },
    methods: {
      addPlan(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.formData.user_id = store.getters.userInfo.id
            this.formData.data = this._.compact(this.formData.productIds.split('\n')).join(',')
            addPlan(this.formData).then(response => {
              this.closeClearForm()
              this.$emit('reload')
            })
          } else {
            return false
          }
        })
      },
      closeClearForm() {
        this.$refs['formData'].resetFields()
        this.$emit('update:addData', {})
        this.$emit('update:open', false)
      },
      // 监听输入显示行数
      showLines(val) {
        this.lines = 0
        if (val) {
          this.lines = val.split('\n').length
        }
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
