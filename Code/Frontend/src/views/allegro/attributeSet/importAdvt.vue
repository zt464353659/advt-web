<template>
  <el-dialog :title="'导入'" :visible="open" :before-close="onClose" width="600px">
    <el-upload ref="upload" class="upload-demo" :multiple="false" :limit="1"
               :action="uploadAction"
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
import store from '@/store'

export default {
  data() {
    return {
      uploadAction: (process.env.NODE_ENV === 'production' ? process.env.VUE_APP_BASE_API : '/api/') + 'allegro-new/advt/default-attribute/import',
      uploadHeaders: {
        Authorization: getToken(),
        systemCode: store.getters.systemCode
      },
      formData: {}
    }
  },
  props: {
    open: {
      type: Boolean,
      required: true
    }
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
      this.$emit('emit-render-list')
      this.onClose()
    }
  }
}
</script>
