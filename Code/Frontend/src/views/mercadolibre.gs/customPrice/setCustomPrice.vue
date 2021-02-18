<template>
  <el-dialog
    title="设置指定价"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="closeClearForm"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="740px"
    v-dragMove
  >
    <div class="loading-dialog" v-loading="addLoading" element-loading-text="处理中">
      <template>
        <el-form ref="formData" :model="formData" :rules="rules" label-width="100px" size="small">
          <el-form-item label="账号" prop="account_id">
            <el-select v-model="formData.account_id" clearable placeholder="请选择账号">
              <el-option v-for="item in options.MercadoLibreAdvtAccount" :key="item.id" :label="item.site_code" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Product ID" prop="file">
            <el-upload
              action="ccc"
              :on-change="fileChange"
              :before-remove="removeFile"
              :auto-upload="false"
              :file-list="fileList"
              :limit="1"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-form-item>
          <el-form-item label="指定价" prop="type">
            <el-radio-group v-model="formData.type">
              <el-radio label="1">设置指定价</el-radio>
              <el-radio label="2">取消指定价</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </template>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="closeClearForm">取 消</el-button>
        <el-button size="mini" type="primary" @click="addTask('formData')">确 定</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
  import XLSX from 'xlsx'
  import { addPlan, getSelectAll, setCustomPrice } from '@/api/mercadolibre.gs'

  export default {
    data() {
      const checkFile = (rule, value, callback) => {
        if (!this.formData.file) {
          return callback(new Error('请选择excel文件'))
        }
        // file.size 单位kb
        // if (this.formData.file) {
        //   return callback(new Error('文件不能超过5MB'))
        // }
        setTimeout(() => {
          callback()
        }, 500)
      }
      return {
        formData: {
          account_id: undefined,
          site_id: undefined,
          file: undefined,
          type: '1'
        },
        fileList: [],
        showTip: false,
        rules: {
          account_id: [
            { required: true, message: '请选择账号', trigger: 'change' }
          ],
          type: [
            { required: true, message: '请选择操作类型', trigger: 'blur' }
          ],
          file: [
            { validator: checkFile, trigger: 'blur' }
          ]
        },
        siteCodeArr: [],
        allSiteCodeArr: [],
        addLoading: false
      }
    },
    props: {
      options: {
        type: Object,
        required: true,
        default: () => {
        }
      },
      open: {
        type: Boolean,
        requried: true,
        default: false
      }
    },
    methods: {
      addTask(formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            this.addLoading = true
            setCustomPrice({ account_id: this.formData.account_id, type: this.formData.type, file: JSON.stringify(this.formData.file) }).then(() => {
              this.addLoading = false
              this.$emit('reload')
            }).finally(() => {
              this.addLoading = false
              this.closeClearForm()
            })
          }
        })
      },
      closeClearForm() {
        this.$refs['formData'].resetFields()
        this.$emit('update:open', false)
        this.fileList = []
      },
      async fileChange(file) {
        const that = this
        if (file.name.slice(-4) === 'xlsx') {
          // 读取文件
          const reader = new FileReader()
          reader.onload = function (evt) {
            const data = evt.target.result
            // 读buffer数据
            const workbook = XLSX.read(data, {
              type: 'buffer'
            })
            // excel转json
            that.formData.file = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]],{ raw: false })
          }
          // buffer数据格式
          reader.readAsArrayBuffer(file.raw)
          this.showTip = false
        } else {
          this.fileList = []
          this.formData.file = undefined
          this.showTip = true
        }
      },
      removeFile() {
        this.formData.file = undefined
      }
    }
  }
</script>
<style lang="scss">
  .loading-dialog{
    .dialog-footer{
      text-align: right;
      margin-bottom: -15px;
    }
  }
</style>

