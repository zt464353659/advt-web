<template>
  <el-dialog
    title="添加数据"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="onClose"
    width="740px"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    v-drag-move
  >
    <template>
      <el-form v-loading="dialogLoading" element-loading-text="添加中···" ref="formData" :model="formData" :rules="rules" label-width="100px" size="small" @submit.native.prevent>
        <el-form-item label="Site Code" prop="site_code">
          <el-select v-model="formData.site_code" placeholder="请选择Site Code">
            <el-option v-for="(item,key) in options" :label="item.site_code" :value="item.site_code" :key="key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="抓取范围" prop="start_page">
          <div id="special-area" style="display: flex;">
            <div>从</div>
            <el-input style="width:40px;padding:0;margin: 0 5px;" v-model="formData.start_page"></el-input>
            <div>页到</div>
            <el-input style="width: 40px;padding:0;margin: 0 5px;" v-model="formData.end_page"></el-input>
            <div>页</div>
          </div>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" :disabled="isClicked" @click="handleAddOnline">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import store from '@/store'
  import { addPlan, getSelectAll, createOnlineError } from '@/api/real'

  export default {
    data() {
      const checkRange = (rule, value, callback) => {
        if (!this.formData.start_page || !this.formData.end_page) {
          return callback(new Error('请输入要抓取的起始页和结束页'))
        }
        const reg = /^[1-9]\d*$/
        if (!reg.test(this.formData.start_page) || !reg.test(this.formData.end_page)) {
          return callback(new Error('请输入正确的数字'))
        }
        if (Number(this.formData.start_page) > Number(this.formData.end_page)) {
          return callback(new Error('起始页必须小于等于结束页'))
        }
        callback()
      }
      return {
        dialogLoading: false,
        options: [],
        formData: {
          account_id: '',
          site_code: '',
          start_page: '',
          end_page: ''
        },
        rules: {
          account_id: [
            { required: true, message: '请先选择site code', trigger: 'change' }
          ],
          start_page: [
            { validator: checkRange, trigger: 'blur', required: true }
          ]
        },
        isClicked: false
      }
    },
    props: {
      open: {
        type: Boolean,
        default: false
      }
    },
    created() {
      getSelectAll().then(response => {
        this.options = response.data.account
      })
    },
    methods: {
      handleAddOnline() {
        this.$refs['formData'].validate((valid) => {
          if (valid) {
            this.dialogLoading = true
            const params = this._.cloneDeep(this.formData)
            this._.forEach(this.options, item => {
              console.log(item.site_code === params.site_code, params, item)
              if (item.site_code === params.site_code) {
                params.account_id = item.id
              }
            })
            this.isClicked = true
            createOnlineError(params).then(() => {
              this.$emit('reload')
            }).finally(() => {
              this.isClicked = false
              this.dialogLoading = false
              this.closeClearForm()
            })
          }
        })
      },
      onClose() {
        this.closeClearForm()
      },
      closeClearForm() {
        this.isClicked = false
        this.dialogLoading = false
        this.formData.end_page = ''
        this.$refs['formData'].resetFields()
        this.$emit('update:open', false)
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .get-platform-data {
    text-align: right;
    span {
      margin-left: 32px;
      float: left;
      color: #67C23A;
      font-size: 12px;
    }
  }
</style>
<style rel="stylesheet/scss" lang="scss">
  #special-area .el-input .el-input__inner {
    padding: 5px;
  }
</style>
