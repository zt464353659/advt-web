<template>
  <el-dialog
    title="添加广告"
    :visible="open"
    :before-close="onClose"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    width="640px"
    v-dragMove
  >
    <template>
      <el-form ref="formData" :rules="rules" :model="formData" label-width="100px" size="small" @submit.native.prevent>
        <el-form-item label="Product ID" prop="product_id" class="item">
          <el-input
            type="textarea"
            resize="none"
            v-model="formData.product_id"
            style="width: 450px;height:400px;"
            @input="showLines"
            :autosize="{ minRows: 20, maxRows: 20 }"
            placeholder="请输入内容，一行填写一个产品id" size="mini" clearable
          ></el-input>
          <p style="color:red;margin-top:-20px;">
            <svg-icon icon-class="bug" />
            一行填写一个产品id,最多可输入1000个ID
            <span v-if="lines">(已输入 {{ this.lines }} 行)</span>
          </p>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取 消</el-button>
      <el-button type="primary" v-debounce @click="addProduct('formData')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { filterQueryParams } from '@/utils/help'
import { resultAlert } from '@/utils/index'
import { fetchAddProduct } from '@/api/cdiscount'
import { Message } from 'element-ui'

export default {
  name: 'AddAdvt',
  data() {
    const validateProductId = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('产品id不能为空'))
      }
      const reg = /^[0-9]*$/
      const arr = this._.compact(value.replace(/ +/g, '').split('\n'))
      this._(arr).forEach(function(val) {
        if (!reg.test(val)) {
          callback(new Error('产品id必须为数字值（不能包含特殊符号、标点符号、字母及汉字）'))
        } else if (val.length !== 8 && val.length !== 16) {
          callback(new Error('请输入8位或者16位的productID'))
        }
      })
      if (arr.length > 1000) {
        return callback(new Error('最多输入1000个 Product ID'))
      }
    }
    return {
      formData: {
        product_id: undefined
      },
      rules: {
        product_id: { required: true, validator: validateProductId, trigger: 'blur' }
      },
      lines: 0
    }
  },
  props: {
    data: {
      type: Object,
      required: true,
      default: () => {
      }
    },
    open: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    // 监听输入显示行数
    showLines(val) {
      this.lines = 0
      if (val) {
        this.lines = val.split('\n').length
      }
    },
    onCancel() {
      this.closeClearForm()
    },
    onClose() {
      this.closeClearForm()
    },
    //id加工
    getproductid() {
      const newlit = []
      let splitlit = this.formData.product_id.split('\n')
      splitlit.map((value, index) => {
        if (value) {
          newlit.push(value.trim())
        }
      })
      let newarr = newlit.join(',')
      return newarr
    },
    //验证
    valuecheck(productid) {
      if (!productid) {
        //Message.error('产品id不能为空')
        return false
      }
      const arr = this._.compact(productid.replace(/ +/g, '').split('\n'))
      if (arr.length > 1000) {
        //Message.error('最多输入1000个 Product ID')
        return false
      }
      const reg = /^[0-9]*$/
      for (let i of arr) {
        if (!reg.test(i)) {
          // Message.error('产品id必须为数字值（不能包含特殊符号、标点符号、空格、字母及汉字）')
          return false
        }
        if (this._.toString(i).length !== 8 && this._.toString(i).length !== 16) {
          //Message.error('请输入8位或者16位的productID')
          return false
        }
      }


      return true
    },
    closeClearForm() {
      this.formData.product_id = undefined
      this.$refs.formData.resetFields()
      this.lines = 0
      this.$emit('update:data', {})
      this.$emit('update:open', false)
    },
    async addProduct() {
      if (this.valuecheck(this.formData.product_id)) {
        const obj = {
          sale_id: this.data.sale_id,
          //product_id: this._.compact(this.formData.product_id.split('\n')).join(','),
          product_id: this.getproductid(),
          not_show_message: true //屏蔽message
        }
        const params = filterQueryParams(obj)
        const loading = this.$loading({
          lock: true,
          text: '正在加载',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.2)'
        })
        fetchAddProduct(params).then((response) => {
          if (response.data) {
            resultAlert(response)
          } else {
            this.$message.err(response.message)
          }

        }).finally(() => {
          this.$emit('renderList')
          this.onClose()
          loading.close()
        })
      }

    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.data-picker {
  width: 445px;
}
</style>
<style rel="stylesheet/scss" lang="scss">
.item {
  .el-form-item__error {
    color: red !important;
    font-size: 14px;
  }
}
</style>

