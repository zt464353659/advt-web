<template>
  <el-dialog
    title="添加平台商品号"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="closeClearForm"
    width="740px"
    v-dragMove
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" label-width="100px" label-position="right" size="small" @submit.native.prevent>
        <el-form-item label="Site Code" prop="account_id">
          <el-select v-model="formData.account_id" placeholder="请选择Site Code">
            <el-option v-for="(item,key) in options" :label="item.label" :value="item.value" :key="key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="平台商品号" prop="istore_product_id">
          <el-input
            type="textarea"
            style="width:550px;"
            @input="showLines"
            :autosize="{ minRows: 8, maxRows: 8}"
            placeholder="请输入内容，一行填写一个平台商品号"
            v-model="formData.istore_product_id"
          >
          </el-input>
          <p>
            <svg-icon icon-class="bug"/>
            一行填写一个平台商品号,最多输入1000行
            <span v-if="lines">(已输入 {{ this.lines }} 行)</span>
          </p>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClearForm">取 消</el-button>
      <el-button type="primary" v-debounce:formData="handleConfirm" data-type="form">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { fetchSiteCode, apiAddPullAdvt } from '@/api/kr11street'
  export default {
    data() {
      const checkProductId = (rule, value, callback) => {
        // 输入为空或全为换行
        if (!value.trim()) {
          return callback(new Error('平台商品号不能为空'))
        }
        if (value.split('\n').length > 1000) {
          return callback(new Error('最多输入1000个平台商品号'))
        }
        const reg = /^\d+$/
        this._(this._.compact(value.split('\n'))).forEach(function(val) {
          if (!reg.test(val.trim())) {
            callback(new Error('平台商品号 必须为数字值（不能包含特殊符号、标点符号及汉字）'))
          }
        })
        callback()
      }
      return {
        formData: {
          account_id: '',
          istore_product_id: ''
        },
        options: [],
        rules: {
          account_id: [
            { required: true, trigger: 'change', message: '请选择 Site Code' }
          ],
          istore_product_id: [
            { required: true, validator: checkProductId, trigger: 'blur' }
          ]
        },
        checkAll: false,
        lines: 0,
        loadingInfo: () => {
          return {
            lock: true,
            text: '努力加载中',
            background: 'rgba(0, 0, 0, 0.5)'
          }
        }
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
      this.siteCodeFetch()
    },
    methods: {
      // sitecode 获取
      siteCodeFetch() {
        fetchSiteCode().then(response => {
          this.options = response.data
        })
      },
      formatParams() {
        let istore_product_id = this.formData.istore_product_id.split('\n').map(v => v.trim())
        istore_product_id = this._.compact(this._.uniq(istore_product_id))
        return istore_product_id.join(',')
      },
      closeClearForm() {
        this.$refs['formData'].clearValidate()
        this.$refs['formData'].resetFields()
        this.$emit('update:open', false)
      },
      // 监听输入显示行数
      showLines(val) {
        this.lines = 0
        if (val) {
          this.lines = val.split('\n').length
        }
      },
      handleConfirm() {
        this.$refs.formData.validate((valid) => {
          if (valid) {
            const loading = this.$loading(this.loadingInfo())
            apiAddPullAdvt({ spu_id: this.formatParams(), account_id: this.formData.account_id }).then(response => {
              this.$emit('reload')
              this.closeClearForm()
              loading.close()
            }).catch(() => {
              loading.close()
            })
          } else {
            sessionStorage.setItem('formData', JSON.stringify(this.formData))
            return false
          }
        })
      }
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
