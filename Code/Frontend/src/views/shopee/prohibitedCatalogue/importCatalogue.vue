<template>
  <el-dialog :title="'导入禁售目录'" v-dragMove :visible="open" :before-close="onClose" width="600px" :close-on-click-modal="false" :close-on-press-escape="false">
    <el-form ref="formData" :model="formData" label-width="100px" :rules="rules" size="mini">
      <el-form-item label="站点" prop="site_code">
        <el-select v-model="formData.site_code" size="mini" clearable placeholder="请选择站点">
          <el-option v-for="(item, index) of sites" :label="item" :value="item" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="文件" prop="file">
        <el-upload ref="upload" class="upload-demo" :multiple="false" :limit="1"
                   action="ccc"
                   accept=".xlsx"
                   :on-change="selectFile"
                   :before-remove="removeFile"
                   :auto-upload="false"
        >
          <el-button size="small" type="primary">点击上传</el-button>
          <div slot="tip" class="el-upload__tip text-red">上传的excel文档格式必须按照模板的格式，否则会导入失败</div>
        </el-upload>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="submitData">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import XLSX from 'xlsx'
  import { addProhibitedCatalogue } from '@/api/shopee'

  export default {
    name: 'ImportCatalogue',
    props: {
      open: {
        type: Boolean,
        require: true
      },
      sites: {
        type: Array,
        require: true,
        default: () => []
      }
    },
    data() {
      const checkSitecode = function(rule, value, callback) {
        if (!value) {
          callback(new Error('请选择站点'))
        } else {
          callback()
        }
      }
      const checkExcel = function(rule, value, callback) {
        if (!value) {
          callback(new Error('请选择要上传的文件'))
        } else {
          callback()
        }
      }
      return {
        formData: {
          site_code: undefined,
          file: '',
          data: []
        },
        rules: {
          site_code: [
            { required: true, validator: checkSitecode, trigger: 'change' }
          ],
          file: [
            { required: true, validator: checkExcel, trigger: 'change' }
          ]
        }
      }
    },
    methods: {
      onClose() {
        this.$refs['formData'].resetFields()
        // 清除选中文件
        this.$refs['upload'].clearFiles()
        this.$emit('update:open', false)
      },
      selectFile(file) {
        // 验证导入文件格式
        if (file.name.slice(0, -4) !== '.xls' && file.name.slice(-5) !== '.xlsx') {
          this.$message.error('文件格式不正确')
          this.$refs['upload'].clearFiles()
          return
        }
        const that = this
        this.formData.file = file
        // 读取文件
        const reader = new FileReader()
        reader.onload = function(evt) {
          const data = evt.target.result
          // 读buffer数据
          const workbook = XLSX.read(data, {
            type: 'buffer'
          })
          // excel转json
          that.formData.data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])
        }
        // buffer数据格式
        reader.readAsArrayBuffer(file.raw)
        // 清除表单验证
        this.$refs.formData.clearValidate()
      },
      // 删除文件
      removeFile() {
        this.formData.file = undefined
        this.formData.data = []
        // 清除表单验证
        this.$refs.formData.clearValidate()
      },
      // 检查表格是否没有空内容
      checkJsonData() {
        if (this.formData.data.length) {
          const attributeLength = this.formData.data.map(item => {
            let num = 0
            for (const key in item) {
              if (key) {
                num++
              }
            }
            return num
          })
          return attributeLength.every(item => item === 5)
        } else {
          // 导入的excel表格内容为空
          return false
        }
      },
      submitData() {
        this.$refs['formData'].validate(valid => {
          if (valid) {
            if (!this.checkJsonData()) {
              this.$message.error('导入的excel表格存在未输入内容，请修改！')
              return
            } else {
              // 上传数据
              const obj = this._.cloneDeep(this.formData)
              delete obj.file
              addProhibitedCatalogue(obj).then(res => {
                this.onClose()
                this.$emit('reload')
              })
            }
          }
        })
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .text-red {
    color: rgb(255, 77, 81);
  }
</style>
