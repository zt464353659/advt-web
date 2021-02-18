<template>
  <el-dialog :title="'广告促销导入'" :visible="open" :before-close="onClose" width="600px" v-dragMove>
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
  export default {
    data() {
      return {
        uploadAction: '',
        uploadHeaders: {
          Authorization: getToken()
        },
        uploadData: {
          platform: 'cdiscount',
          sale_id: ''
        },
        formData: {}
      }
    },
    props: {
      open: {
        type: Boolean,
        default: false
      },
      saleId: {
        type: String,
        required: true
      }
    },
    created() {
      const base_api = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_BASE_API : '/api/'
      this.uploadAction = base_api + 'cdiscount/advt/sale/upload'
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
        } else {
          this.onClose()
          this.$emit('renderList')
        }
      }
    },
    watch: {
      open(value) {
        if (value && this.saleId) {
          this.uploadData.sale_id = this.saleId
        }
      }
    }
  }
</script>
