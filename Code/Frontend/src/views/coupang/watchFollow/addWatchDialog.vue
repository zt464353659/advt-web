<template>
  <el-dialog
    title="手动添加监控"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="closeClearForm"
    width="740px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    v-drag-move
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" label-width="150px" size="small" @submit.native.prevent>
        <el-form-item label="账号" prop="account_id">
          <el-select v-model="formData.account_id" clearable placeholder="请选择账号">
            <el-option v-for="(item,key) in options" :label="item.label" :value="item.value" :key="key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="옵션ID(选项ID)" prop="vendor_item_id">
          <el-input
            type="textarea"
            style="width: 90%;"
            :autosize="{ minRows: 4, maxRows: 8}"
            placeholder="请输入内容，一行填写一个ID"
            v-model="formData.vendor_item_id"
          >
          </el-input>
          <p>
            <svg-icon icon-class="bug"/>
            一行填写一个选项ID，最多可输入500行
          </p>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClearForm">取 消</el-button>
      <el-button type="primary" v-debounce:formData="addPlan" data-type="form">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { fetchSiteCode, apiAddWatch } from '@/api/coupang'
  export default {
    data() {
      const checkId = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('选项ID不能为空'))
        }
        const reg = /^[0-9]*$/
        const arr = this._.compact(value.replace(/ +/g, '').split('\n'))
        if (arr.length === 0) {
          callback(new Error('选项ID不能全为空行'))
        }
        if (arr.length > 500) {
          callback(new Error('选项ID最多可输入500行'))
        }
        this._(arr).forEach(function(val) {
          if (!reg.test(val)) {
            callback(new Error('选项ID必须为纯数字'))
          }
        })
        callback()
      }
      return {
        options: [],
        formData: {
          account_id: '',
          vendor_item_id: ''
        },
        rules: {
          account_id: [
            { required: true, message: '请先选择账号', trigger: 'change' }
          ],
          vendor_item_id: [
            { required: true, validator: checkId, trigger: 'blur' }
          ]
        },
        loadingInfo: () => {
          return {
            lock: true,
            text: '努力加载中',
            background: 'rgba(0, 0, 0, 0.8)'
          }
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
            const params = {
              account_id: this.formData.account_id,
              vendor_item_id: this._.compact(this.formData.vendor_item_id.replace(/ +/g, '').split('\n').map(v => v.trim())).join(' '),
              not_show_message: true
            }
            const loading = this.$loading(this.loadingInfo)
            let msg = ''
            apiAddWatch(params).then(res => {
              if (res.code === 200) {
                this._.forEach(res.data, v => {
                  if (v.state === 0) {
                    msg += '<p style="color: red;">选项ID "<b>' + v.vendor_item_id + '</b>"：' + v.message + '</p>'
                  } else {
                    msg += '<p style="color: green">选项ID "<b>' + v.vendor_item_id + '</b>"：' + v.message + '</p>'
                  }
                })
                this.$alert(msg, '添加结果', {
                  dangerouslyUseHTMLString: true
                })
                this.$emit('reload')
                this.closeClearForm()
              } else {
                this.$alert('添加失败', '添加结果')
              }
              loading.close()
            }).catch(error => {
              loading.close()
              this.$message.warning(error.message)
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
    },
    computed: {
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
  .plan_type .el-input.is-disabled .el-input__inner{
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
