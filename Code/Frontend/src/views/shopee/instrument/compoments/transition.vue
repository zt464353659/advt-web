<template>
  <el-dialog :title="'数据格式转换'" :visible="open" :before-close="onClose" width="600px" v-dragMove>
    <el-upload ref="upload" class="upload-demo" :multiple="false" :limit="1"
               :action="uploadAction"
               :headers="uploadHeaders"
               :on-change="file"
               :file-list="fileList"
               :auto-upload="false"
    >
      <el-button size="small" type="primary">开始转换</el-button>
      <div slot="tip" class="el-upload__tip">只能上传excel文件，且不超过20MB</div>
    </el-upload>
  </el-dialog>
</template>

<script>
  import { getToken } from '@/utils/auth'
  import { exportJsonData } from '../../export'
  import XLSX from 'xlsx'

  export default {
    data() {
      return {
        uploadAction: '',
        fileList: [],
        uploadHeaders: {
          Authorization: getToken()
        },
        formData: {
          workbook: undefined,
          jsonDate: undefined
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
    },
    mounted() {
    },
    methods: {
      file(excelData) {
        this.$confirm('确定转换文件吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          closeOnClickModal: false,
          closeOnPressEscape: false,
          type: 'warning'
        }).then(() => {
          // 数据格式判断
          const typeName = excelData.name.substring(excelData.name.lastIndexOf('.') + 1)
          if (!(typeName === 'xlsx' || typeName === 'xls')) {
            this.$message({
              message: '上传格式不正确',
              type: 'warning'
            })
            this.onClose()
            return false
          }
          const reader = new FileReader()
          reader.onload = (evt) => {
            const data = evt.target.result
            const workbook = XLSX.read(data, {
              type: 'buffer'
            })
            this.formData.workbook = workbook
            this.formData.jsonDate = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])
          }
          reader.onloadend = () => {
            exportJsonData(this.formData.workbook, this.formData.jsonDate)
          }
          reader.readAsArrayBuffer(excelData.raw)
          this.onClose()
        }).catch(() => {
          this.onClose()
        })
      },
      onClose() {
        this.$emit('update:open', false)
        this.fileList = []
      }
    },
    filters: {},
    watch: {}
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .el-upload__tip {
    margin-top: 20px;
  }
</style>
