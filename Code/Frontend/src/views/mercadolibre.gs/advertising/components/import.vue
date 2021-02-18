<!--<template>-->
<!--<el-dialog :title="'导入'" :visible="open" :before-close="onClose" width="600px">-->
<!--<el-upload ref="upload" class="upload-demo" :multiple="false" :limit="1"-->
<!--:data="uploadData"-->
<!--:headers="uploadHeaders"-->
<!--:before-upload="beforeUpload"-->
<!--:on-success="uploadSuccess"-->
<!--&gt;-->
<!--<el-button size="small" type="primary">点击上传</el-button>-->
<!--<div slot="tip" class="el-upload__tip">只能上传excel文件，且不超过20MB</div>-->
<!--</el-upload>-->
<!--</el-dialog>-->
<!--</template>-->

<!--<script>-->
<!--// import { getUploadPath } from '@/utils/help'-->
<!--import { getToken } from '@/utils/auth'-->
<!--import { exportLongTile, exportLongDescription } from '@/views/mercadolibre/export'-->
<!--import { importExcelData } from '@/api/mercadolibre.gs'-->

<!--export default {-->
<!--data() {-->
<!--return {-->
<!--// uploadAction: getUploadPath(),-->
<!--uploadHeaders: {-->
<!--Authorization: getToken()-->
<!--},-->
<!--uploadData: {-->
<!--platform: 'mercadolibre'-->
<!--},-->
<!--formData: {}-->
<!--}-->
<!--},-->
<!--props: {-->
<!--open: {-->
<!--type: Boolean,-->
<!--required: true-->
<!--},-->
<!--advtStatus: {-->
<!--type: Number,-->
<!--required: true-->
<!--}-->
<!--},-->
<!--methods: {-->
<!--onClose() {-->
<!--this.$refs.upload.clearFiles()-->
<!--this.$emit('refeshList')-->
<!--this.$emit('update:open', false)-->
<!--},-->
<!--beforeUpload(file) {-->
<!--const typeName = file.name.substring(file.name.lastIndexOf('.') + 1)-->
<!--if (!(typeName === 'xlsx' || typeName === 'xls')) {-->
<!--this.$message({-->
<!--message: '上传格式不正确',-->
<!--type: 'warning'-->
<!--})-->
<!--return false-->
<!--}-->
<!--},-->
<!--uploadSuccess(response, file, fileList) {-->
<!--this.$message({-->
<!--message: response.message,-->
<!--type: response.code === 200 ? 'success' : 'warning'-->
<!--})-->
<!--if (response.code !== 200) {-->
<!--return false-->
<!--}-->
<!--// 上传成功 确认导入-->
<!--this.confirmImport(response.data)-->
<!--},-->
<!--confirmImport(data) {-->
<!--this.$confirm('确认要导入已上传的文件么？', '提示', {-->
<!--confirmButtonText: '确定',-->
<!--cancelButtonText: '取消',-->
<!--type: 'warning'-->
<!--}).then(() => {-->
<!--importExcelData({-->
<!--filePath: data.filePath,-->
<!--status: this.advtStatus-->
<!--}).then(response => {-->
<!--let message = ''-->
<!--if (response.data.success > 0) {-->
<!--message += '<p>导入成功：' + response.data.success + '条记录</p>'-->
<!--}-->
<!--if (response.data.error > 0) {-->
<!--message += '<p>导入失败：' + response.data.error + '条记录</p>'-->
<!--message += '<p>Excel已下载，请重新编辑！</p>'-->
<!--if (this.advtStatus === 510) {-->
<!--exportLongTile(response.data.errorList)-->
<!--}-->
<!--if (this.advtStatus === 520) {-->
<!--exportLongDescription(response.data.errorList)-->
<!--}-->
<!--}-->
<!--if (response.data.success === 0 && response.data.error === 0) {-->
<!--message += '<p>导入的数据有问题，请重新导入！</p>'-->
<!--}-->
<!--this.$alert(message, '提示', {-->
<!--confirmButtonText: '确定',-->
<!--type: 'warning',-->
<!--dangerouslyUseHTMLString: true,-->
<!--callback: action => {-->
<!--this.onClose()-->
<!--}-->
<!--})-->
<!--})-->
<!--}).catch(() => {-->
<!--this.onClose()-->
<!--})-->
<!--}-->
<!--}-->
<!--}-->
<!--</script>-->
