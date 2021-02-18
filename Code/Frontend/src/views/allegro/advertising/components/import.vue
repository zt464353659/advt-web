<template>
  <el-dialog :title="'导入'" :visible="open" :before-close="onClose" width="600px">
    <el-upload ref="upload" class="upload-demo" :multiple="false" :limit="1"
               :action="uploadAction"
               :data="uploadData"
               :headers="uploadHeaders"
               :before-upload="beforeUpload"
               :on-success="uploadSuccess"
    >
      <el-button size="small" type="primary">点击上传</el-button>
      <div slot="tip" class="el-upload__tip">只能上传excel文件，且不超过20MB</div>
    </el-upload>
  </el-dialog>
</template>

<script>
  import { getToken } from '@/utils/auth'
  // import { exportLongTile, exportLongDescription } from '@/views/allegro/export'
  import { importExcelData, importFormatData } from '@/api/allegro'

  export default {
    data() {
      return {
        uploadAction: '',
        uploadHeaders: {
          Authorization: getToken()
        },
        uploadData: {
          platform: 'allrgro'
        },
        formData: {}
      }
    },
    props: {
      open: {
        type: Boolean,
        required: true
      },
      advtStatus: {
        type: Boolean,
        required: true
      }
    },
    created() {
      const base_api = process.env.NODE_ENV === 'production' ? localStorage.getItem('BASE_API') : process.env.UPLOAD_PROXY
      this.uploadAction = base_api + 'allrgro/advt/upload/file'
    },
    methods: {
      onClose() {
        this.$refs.upload.clearFiles()
        this.$emit('update:open', false)
      },
      beforeUpload(file) {
        const typeName = file.name.substring(file.name.lastIndexOf('.') + 1)
        if (!(typeName === 'xlsx' || typeName === 'xls')) {
          this.$message({
            message: '上传格式不正确',
            type: 'warning'
          })
          return false
        }
      },
      uploadSuccess(response, file, fileList) {
        this.$message({
          message: response.message,
          type: response.code === 200 ? 'success' : 'warning'
        })
        if (response.code !== 200) {
          return false
        }
        // 上传成功 确认导入
        this.confirmImport(response.data)
      },
      checkLongOrFormat(data) {
        const loading = this.$loading(this.loadingInfo)
        // 通过_id判断是创建还是编辑
        return new Promise((reslove, reject) => {
          // 判断是否为预览
          if ([510, 520].includes(this.advtStatus)) {
            // importExcelData
            importExcelData({
              filePath: data.filePath,
              status: this.advtStatus
            }).then(res => {
              loading.close()
              reslove(res)
            }).catch(() => loading.close())
          } else {
            importFormatData({
              filePath: data.filePath,
              status: this.advtStatus
            }).then(res => {
              loading.close()
              reslove(res)
            }).catch(() => loading.close())
          }
        })
      },
      confirmImport(data) {
        this.$confirm('确认要导入已上传的文件么？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.checkLongOrFormat(data).then(response => {
            if ([510, 520].includes(this.advtStatus)) {
              let message = ''
              if (response.data.success > 0) {
                message += '<p>导入成功：' + response.data.success + '条记录</p>'
              }
              if (response.data.error > 0) {
                message += '<p>导入失败：' + response.data.error + '条记录</p>'
                message += '<p>Excel已下载，请重新编辑！</p>'
                if (this.advtStatus === 510) {
                // exportLongTile(response.data.errorList)
                }
                if (this.advtStatus === 520) {
                // exportLongDescription(response.data.errorList)
                }
              }
              if (response.data.success === 0 && response.data.error === 0) {
                message += '<p>导入的数据有问题，请重新导入！</p>'
              }
              this.$alert(message, '提示', {
                confirmButtonText: '确定',
                type: 'warning',
                dangerouslyUseHTMLString: true,
                callback: action => {
                  this.onClose()
                }
              })
            } else {
              this.$message({
                message: response.message,
                type: response.code === 200 ? 'success' : 'warning'
              })
              this.onClose()
            }
          })
        }).catch(() => {
          this.onClose()
        })
      }
    }
  }
</script>
