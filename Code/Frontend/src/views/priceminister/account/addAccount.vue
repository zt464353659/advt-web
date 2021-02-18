<template>
  <el-dialog
    :title="(title === 'edit' ? '编辑': '添加') + '账号信息'"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="closeClearForm"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" size="small" label-width="100px" @submit.native.prevent>
        <el-form-item label="channel" prop="channel">
          <el-input type="text" v-model="formData.channel" :disabled="title === 'edit'" @blur="formatDate('channel')"></el-input>
        </el-form-item>
        <el-form-item label="account" prop="account">
          <el-input v-model="formData.account" :disabled="title === 'edit'" @blur="formatDate('account')"></el-input>
        </el-form-item>
        <el-form-item label="key" prop="key">
          <el-input type="text" v-model="formData.key" :disabled="title === 'edit'" @blur="formatDate('key')"></el-input>
        </el-form-item>
        <el-form-item label="store_name" prop="store_name">
          <el-input type="text" v-model="formData.store_name" :disabled="title === 'edit'" @blur="formatDate('store_name')"></el-input>
        </el-form-item>
        <el-form-item label="sku_suffix" prop="sku_suffix">
          <el-input type="text" v-model="formData.sku_suffix" @blur="formatDate('sku_suffix')"></el-input>
        </el-form-item>
        <el-form-item label="request limit" prop="limit">
          <el-input type="text" v-model="formData.limit" style="display:none" @blur="formatDate('limit')"></el-input>
        </el-form-item>
        <div class="form_flex">
          <el-form-item label="add" prop="request_limit.add" ref="limitAdd">
            <el-input type="text" v-model="formData.request_limit.add" @blur="requestLimit"></el-input>
          </el-form-item>
          <el-form-item label="edit" label-width="80px" prop="request_limit.edit" ref="limitEdit">
            <el-input type="text" v-model="formData.request_limit.edit" @blur="requestLimit"></el-input>
          </el-form-item>
          <el-form-item label="delete" label-width="80px" prop="request_limit.delete" ref="limitDelete">
            <el-input type="text" v-model="formData.request_limit.delete" @blur="requestLimit"></el-input>
          </el-form-item>
        </div>

        <el-form-item label-width="138px" label="advt_number limit">
        </el-form-item>
        <div class="form_flex">
          <el-form-item label="add" prop="advt_number_limit.add">
            <el-input type="text" v-model="formData.advt_number_limit.add" @blur="formatDate('advt_number_limit', 'add')"></el-input>
          </el-form-item>
          <el-form-item label="edit" label-width="80px" prop="advt_number_limit.edit">
            <el-input type="text" v-model="formData.advt_number_limit.edit" @blur="formatDate('advt_number_limit', 'edit')"></el-input>
          </el-form-item>
          <el-form-item label="delete" label-width="80px" prop="advt_number_limit.delete">
            <el-input type="text" v-model="formData.advt_number_limit.delete" @blur="formatDate('advt_number_limit', 'delete')"></el-input>
          </el-form-item>
        </div>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClearForm">取 消</el-button>
      <el-button type="primary" @click="commitForm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
// import store from '@/store'
  import { fetchAddAccount, fetchEditAccount } from '@/api/priceminister'

  const initForm = {
    channel: '',
    account: '',
    key: '',
    store_name: '',
    limit: -1,
    sku_suffix: '',
    request_limit: {
      add: '',
      edit: '',
      delete: ''
    },
    advt_number_limit: {
      add: '',
      edit: '',
      delete: ''
    }
  }

  export default {
    data() {
      return {
        formData: this._.cloneDeep(initForm)
      }
    },
    props: {
      rowData: {
        type: Object,
        default: () => {}
      },
      open: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: ''
      }
    },
    methods: {
      // 去空格
      formatDate(sign1, sign2) {
        if (sign2) {
          this.formData[sign1][sign2] = this._.trim(this.formData[sign1][sign2])
        } else {
          this.formData[sign1] = this._.trim(this.formData[sign1])
        }
      },
      // 确定
      commitForm() {
        this.$refs.formData.validate((valid) => {
          if (valid) {
            if (this._.isEqual(this.rowData, this.formData)) {
              this.closeClearForm()
              this.$emit('reload')
            } else {
              let api = fetchAddAccount
              if (this.title === 'edit') {
                api = fetchEditAccount
              }
              api(this.formData).then(res => {
                this.closeClearForm()
                this.$emit('reload')
              }).catch(err => {
                console.log(err)
              })
            }
          } else {
            return false
          }
        })
      },
      // 弹出关闭重置
      closeClearForm() {
        this.formData = this._.cloneDeep(initForm)
        this.$refs['formData'].resetFields()
        this.$emit('update:data', {})
        this.$emit('update:open', false)
        this.$emit('update:title', undefined)
      },
      requestLimit() {
        this.formData.request_limit.add = this._.trim(this.formData.request_limit.add)
        this.formData.request_limit.edit = this._.trim(this.formData.request_limit.edit)
        this.formData.request_limit.delete = this._.trim(this.formData.request_limit.delete)
        if (this.formData.request_limit.add && this.formData.request_limit.edit && this.formData.request_limit.delete && Number(this.formData.request_limit.add) >= 0 && Number(this.formData.request_limit.edit) >= 0 && Number(this.formData.request_limit.delete) >= 0) {
          this.formData.limit = Number(this.formData.request_limit.add) + Number(this.formData.request_limit.edit) + Number(this.formData.request_limit.delete)
        } else {
          this.formData.limit = -1
        }
      }
    },
    computed: {
      rules() {
        const validateAdv = (rule, value, callback) => {
          value = this._.trim(value)
          if (value === '') {
            return callback(new Error('不能为空'))
          }
          if (!/^[1-9]\d*$/.test(value)) {
            return callback(new Error('必须为正整数'))
          } else if (value > 30000) {
            return callback(new Error('不能大于30000'))
          }
          callback()
        }
        const validateEmpty = (rule, value, callback) => {
          value = this._.trim(value)
          if (value === '') {
            return callback(new Error('不能为空'))
          }
          callback()
        }
        const validateRequest = (rule, value, callback) => {
          value = this._.trim(value)
          if (value === '') {
            return callback(new Error('不能为空'))
          }
          if (value !== '0') {
            if (!/^[1-9]\d*$/.test(value)) {
              return callback(new Error('必须为自然数'))
            }
          }
          callback()
        }
        const validatelimit = (rule, value, callback) => {
          if (!isNaN(value)) {
            if (value > -1 && /^[1-9]\d*$/.test(value)) {
              if (value !== 10) {
                callback(new Error('request limit.add + request limit.edit + request limit.delete = 10'))
                this.$nextTick(() => {
                  this.$refs.limitAdd.$el.classList.add('is-error')
                  this.$refs.limitAdd.$el.classList.remove('is-success')
                  this.$refs.limitEdit.$el.classList.add('is-error')
                  this.$refs.limitEdit.$el.classList.remove('is-success')
                  this.$refs.limitDelete.$el.classList.add('is-error')
                  this.$refs.limitDelete.$el.classList.remove('is-success')
                })
              } else {
                this.$nextTick(() => {
                  this.$refs.limitAdd.$el.classList.remove('is-error')
                  this.$refs.limitEdit.$el.classList.remove('is-error')
                  this.$refs.limitDelete.$el.classList.remove('is-error')
                  this.$refs.limitAdd.$el.classList.add('is-success')
                  this.$refs.limitEdit.$el.classList.add('is-success')
                  this.$refs.limitDelete.$el.classList.add('is-success')
                })
              }
            } else {
              if (this.formData.request_limit.add) {
                this.$refs.limitAdd.$el.classList.remove('is-error')
                this.$refs.limitEdit.$el.classList.add('is-success')
              }
              if (this.formData.request_limit.edit) {
                this.$refs.limitEdit.$el.classList.remove('is-error')
                this.$refs.limitEdit.$el.classList.add('is-success')
              }
              if (this.formData.request_limit.delete) {
                this.$refs.limitDelete.$el.classList.remove('is-error')
                this.$refs.limitDelete.$el.classList.add('is-success')
              }
            }
          }
          callback()
        }
        let rule = {
          'limit': { validator: validatelimit, trigger: 'change' },
          'sku_suffix': { validator: validateEmpty, message: '不能为空' },
          'request_limit.add': { validator: validateRequest, trigger: 'blur' },
          'request_limit.edit': { validator: validateRequest, trigger: 'blur' },
          'request_limit.delete': { validator: validateRequest, trigger: 'blur' },
          'advt_number_limit.add': { validator: validateAdv, trigger: 'blur' },
          'advt_number_limit.edit': { validator: validateAdv, trigger: 'blur' },
          'advt_number_limit.delete': { validator: validateAdv, trigger: 'blur' }
        }
        if (this.title === 'add') {
          const validateString = (rule, value, callback) => {
            value = this._.trim(value)
            if (value === '') {
              return callback(new Error('不能为空'))
            }
            if (value.length > 200) {
              return callback(new Error('不能超过200个字符'))
            }
            callback()
          }
          const addRule = {
            'channel': { validator: validateString, trigger: 'blur' },
            'account': [
              { type: 'email', message: '必为邮箱格式', trigger: 'blur' },
              { validator: validateString, trigger: 'blur' }
            ],
            'key': { validator: validateString, trigger: 'blur' },
            'store_name': { validator: validateString, trigger: 'blur' }
          }
          rule = this._.assign(rule, addRule)
        }

        return rule
      }
    },
    watch: {
      title(newData) {
        if (this.title === 'edit') {
          this.formData = this._.cloneDeep(this.rowData)
        } else {
          this.formData = this._.assign(initForm)
        }
        this.$nextTick(() => {
          this.$refs['formData'].clearValidate()
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

  .plan_type .el-input.is-disabled .el-input__inner {
    background: transparent;
  }

  .form_flex {
    display: flex
  }
</style>
