<template>
  <el-dialog
    title="产品添加"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="740px"
    v-dragMove
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" label-width="100px" label-position="right" size="small" @submit.native.prevent>
        <el-form-item label="Site Code" prop="account_id">
          <!--<multiple-select-account ref="multipleSelectAccount" v-bind.sync="multipleSelectAccountOption" @select-account="selectAccount" @clean-select="cleanSelect"></multiple-select-account>-->
          <el-select v-model="formData.account_id" @change="getAccountName" collapse-tags clearable placeholder="请选择">
            <el-option v-for="item in accountOptions" :key="item.id" :label="item.site_code" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Product ID" prop="product_ids">
          <el-input
            type="textarea"
            style="width:300px;"
            @input="showLines"
            :autosize="{ minRows: 8, maxRows: 8}"
            placeholder="请输入内容，一行填写一个产品id"
            v-model="formData.product_ids"
          >
          </el-input>
          <p>
            <svg-icon icon-class="bug" />
            一行填写一个产品id,最多可输入1000个ID
            <span v-if="lines">(已输入 {{ this.lines }} 行)</span>
          </p>
        </el-form-item>
        <el-form-item label="更新类型" prop="type">
          <div>
            <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
            <!--            <span style="color: #F56C6C;font-size: 10px;">vary主ID只允许更新标题、描述、图片</span>-->
          </div>
          <div style="margin: 15px 0;"></div>
          <el-checkbox-group style="width: 300px;" v-model="formData.type" @change="handleCheckedCitiesChange">
            <el-checkbox v-for="city in cities" :label="city.key" :key="city.key">{{ city.label }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="text" style="width: 300px;" v-model="formData.remark"></el-input>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <div class="set-update">
        <div>
          <el-button type="primary" @click="setUpdate(1)">设置不更新</el-button>
          <p>（设置后以上选择类型将不再更新）</p>
        </div>
        <div>
          <el-button type="danger" @click="setUpdate(0)">取消不更新</el-button>
          <p>（取消后系统会自动更新）</p>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import store from '@/store'
import { addProductUpdate } from '@/api/mercadolibre.gs'
import { resultAlert } from './../advertising/common/index'
// import multipleSelectAccount from './component/multipleSelectAccount'

export default {
  // components: { multipleSelectAccount },
  data() {
    const checkProductId = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('产品id不能为空'))
      }
      if (value.split('\n').length > 1000) {
        return callback(new Error('最多输入1000个 Product ID'))
      }
      setTimeout(() => {
        const reg = /^[0-9]*$/
        this._(this._.compact(value.split('\n'))).forEach(function(val) {
          if (!reg.test(val)) {
            callback(new Error('产品id必须为数字值（不能包含特殊符号、空格标点符号及汉字）'))
          } else if (val.length !== 8) {
            callback(new Error('产品id只能是8位数字'))
          }
        })
        callback()
      }, 1000)
    }
    return {
      formData: {
        product_ids: undefined,
        account_id: undefined,
        type: [],
        remark: undefined
      },
      options: [],
      rules: {
        account_id: [
          { required: true, message: '请选择账号', trigger: 'change' }
        ],
        product_ids: [
          { required: true, validator: checkProductId, trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择类型' }
        ]
      },
      checkAll: false,
      cities: [],
      isIndeterminate: false,
      lines: 0
    }
  },
  props: {
    accountOptions: {
      type: [Array, Object],
      required: true,
      default: () => []
    },
    open: {
      type: Boolean,
      required: true,
      default: false
    },
    typeOptions: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  methods: {
    setUpdate(updateType) {
      this.$refs['formData'].validate(valid => {
        if (valid) {
          this.formData.product_id = this._.compact(this.formData.product_ids.split('\n'))
          const obj = this._.cloneDeep(this.formData)
          obj.operate = updateType
          obj.account_id = [obj.account_id]
          obj.not_show_message = true
          delete obj.product_ids
          addProductUpdate(obj).then((res) => {
            resultAlert(res)
            this.$emit('reload')
          }).catch(e => {
            this.$message.error(e)
          }).finally(() => {
            this.closeClearForm()
          })
        }
      })
    },
    selectAccount(arr) {
      this.formData.account = arr
    },
    clearAccount() {
      // this.$refs.multipleSelectAccount.handleCancelAllUser()
      this.$refs['formData'].clearValidate()
    },
    cleanSelect() {
      this.$refs['formData'].resetFields()
    },
    onCancel() {
      this.clearAccount()
      this.closeClearForm()
    },
    onClose() {
      this.clearAccount()
      this.closeClearForm()
    },
    closeClearForm() {
      this.lines = 0
      this.$refs['formData'].resetFields()
      this.formData.type = []
      this.checkAll = false
      this.isIndeterminate = false
      this.$emit('update:data', {})
      this.$emit('update:open', false)
    },
    handleCheckAllChange(val) {
      this.formData.type = val ? this.cities.map(val => val.key) : []
      this.isIndeterminate = false
    },
    handleCheckedCitiesChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.cities.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.cities.length
    },
    // 监听输入显示行数
    showLines(val) {
      this.lines = 0
      if (val) {
        this.lines = val.split('\n').length
      }
    },
    // 获取站点名称
    getAccountName(val) {
      if (val) {
        // this._.map(this.accountOptions, item => {
        //   if (val === item.id) {
        //     this.formData.account_name = item.site_code
        //   }
        // })
      }
    }
  },
  watch: {
    open(val) {
      this.cities = this._.cloneDeep(this.typeOptions)
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
  display: flex;
  justify-content: space-around;

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

