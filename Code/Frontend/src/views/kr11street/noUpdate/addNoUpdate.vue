<template>
  <el-dialog
    title="添加/取消产品不更新"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="closeClearForm"
    width="740px"
    v-dragMove
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" label-width="100px" label-position="left" size="small" @submit.native.prevent>
        <el-form-item label="Product ID" prop="istore_product_id">
          <el-input
            type="textarea"
            style="width:550px;"
            @input="getIdsNumbers"
            :autosize="{ minRows: 8, maxRows: 8 }"
            placeholder="请输入内容，一行填写一个 Product ID"
            v-model="formData.istore_product_id"
          >
          </el-input>
          <p>
            <svg-icon icon-class="bug"/>
            一行填写一个Product ID,最多输入500行
            <span v-if="lines">(已输入 {{ this.lines }} 行)</span>
          </p>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <div class="set-update">
        <el-button type="primary" :loading="buttonLoad" @click="setNotUpdate">设置不更新</el-button>
        <el-button style="margin-left:364px;" :loading="cancelButtonLoad" type="danger" @click="cancleNotUpdate(0)">取消不更新</el-button>
      </div>
      <p style="color: #F56C6C;font-size: 12px;margin-top:30px;text-align: left;margin-left:104px;">注意: 设置不更新，是指该产品所有广告的标题、描述、图片均不从istore获取更新</p>
    </div>
  </el-dialog>
</template>

<script>
  import { setNoUpdate, cancleNoUpdate } from '@/api/kr11street'
  import { resultAlert } from '../advertising/common/11street.js'
  export default {
    data() {
      const checkProductId = (rule, value, callback) => {
        // 输入为空或全为换行
        if (!value.trim()) {
          return callback(new Error('Product ID 不能为空'))
        }
        if (value.split('\n').length > 500) {
          return callback(new Error('最多输入500个 Product ID'))
        }
        const reg = /^\d{8}$/
        this._(this._.compact(value.split('\n'))).forEach(function(val) {
          if (!reg.test(val.trim())) {
            callback(new Error('product ID 必须为8位数字值（不能包含特殊符号、标点符号及汉字）'))
          }
        })
        callback()
      }
      return {
        formData: {
          istore_product_id: ''
        },
        options: [],
        rules: {
          istore_product_id: [
            { required: true, validator: checkProductId, trigger: 'blur' }
          ]
        },
        checkAll: false,
        lines: 0,
        buttonLoad: false,
        cancelButtonLoad: false
      }
    },
    props: {
      open: {
        type: Boolean,
        required: true,
        default: false
      }
    },
    created() {
    },
    methods: {
      setNotUpdate() {
        this.$refs['formData'].validate(valid => {
          if (valid) {
            this.buttonLoad = true
            setNoUpdate({ istore_product_id: this.formatParams(), not_show_message: true }).then(res => {
              resultAlert(res)
              this.$emit('reload')
            }).finally(() => {
              this.buttonLoad = false
              this.closeClearForm()
            })
          }
        })
      },
      cancleNotUpdate() {
        this.$refs['formData'].validate(valid => {
          if (valid) {
            this.cancelButtonLoad = true
            cancleNoUpdate({ istore_product_id: this.formatParams(), not_show_message: true }).then(res => {
               resultAlert(res)
              this.$emit('reload')
            }).finally(() => {
              this.cancelButtonLoad = false
              this.closeClearForm()
            })
          }
        })
      },
      formatParams() {
        return  this._.compact(this.formData.istore_product_id.replace(/ +/g, '').split('\n'))
      },

      closeClearForm() {
        this.$refs['formData'].clearValidate()
        this.$refs['formData'].resetFields()
        this.$emit('update:open', false)
      },
      // 监听输入显示行数
      getIdsNumbers() {
        this.lines = this._.compact(this.formData.istore_product_id.replace(/ +/g, '').split('\n')).length
      },
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

  .set-update {
    padding-left: 100px;
    text-align: left;
    div {
      display: flex;
      flex-direction: column;
      align-items: center;
      p {
        color: #F56C6C;
        font-size: 10px;
      }
    }
  }
</style>
<style rel="stylesheet/scss" lang="scss">
</style>
