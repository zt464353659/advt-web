<template>
  <el-dialog
    title="添加选品任务"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="closeClearForm"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    width="600px"
    v-dragMove
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" label-width="100px" size="mini">
        <el-form-item label="site Code" prop="site_code">
          <multiple-select-account
            ref="multipleSelectAccount"
            v-bind.sync="multipleSelectAccountOption"
            @select-account="selectAccount"
            @clean-select="cleanSelect"
            style="width: 240px"
          ></multiple-select-account>
        </el-form-item>
        <el-form-item label="创建时间" prop="time">
          <el-date-picker
            v-model="formData.time"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            style="width: 80%"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="价格" required>
          <el-row>
            <el-col :span="9">
              <el-form-item prop="minPrice" style="margin-bottom: 0">
                <el-input v-model="formData.minPrice" placeholder="最低价格"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="1" style="text-align: center">
              -
            </el-col>
            <el-col :span="9">
              <el-form-item prop="maxPrice" style="margin-bottom: 0">
                <el-input v-model="formData.maxPrice" placeholder="最高价格"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="销量" required>
          <el-row>
            <el-col :span="9">
              <el-form-item prop="minSales" style="margin-bottom: 0">
                <el-input v-model="formData.minSales" placeholder="最低销量"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="1" style="text-align: center">
              -
            </el-col>
            <el-col :span="9" required>
              <el-form-item prop="maxSales" style="margin-bottom: 0">
                <el-input v-model="formData.maxSales" placeholder="最高销量"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="评分" required>
          <el-row>
            <el-col :span="9">
              <el-form-item prop="minScore" style="margin-bottom: 0">
                <el-input v-model="formData.minScore" placeholder="最低评分"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="1" style="text-align: center">
              -
            </el-col>
            <el-col :span="9">
              <el-form-item prop="maxScore" style="margin-bottom: 0">
                <el-input v-model="formData.maxScore" placeholder="最高评分"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="设置毛利率" prop="margin">
          <el-row>
            <el-col :span="6">
              <el-input v-model="formData.margin" placeholder="请输入毛利率"></el-input>
            </el-col>
            <el-col :span="1" style="text-align: center">
              %
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="product id">
          <el-row :gutter="0">
            <el-col :span="6" style="padding-left: 0">
              <el-form-item>
                <el-select v-model="formData.product_id_type"
                           placeholder="请选择"
                           @change="onPre_siteCode"
                           style="width: 100px"
                >
                  <el-option label="product id" value="1"></el-option>
                  <el-option label="item id" value="2"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item prop="product_id">
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 4, maxRows: 8}"
                  v-model="formData.product_id"
                  :placeholder="`每行一个${formData.product_id_type==='1'?'product_id':'item_id'}`"
                >
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClearForm" :loading="addloading">取 消</el-button>
      <el-button type="primary" @click="addForm"
                 :loading="addloading"
      >
        确定导出
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import multipleSelectAccount from './multipleSelectAccount'
import { selectionAdd } from '@/api/shopee'
import { filterQueryParams } from '@/utils/help'

export default {
  components: {
    multipleSelectAccount
  },
  data() {
    const product_id = (rule, value, callback) => {
      const _that = this
      if (!value) {
        callback()
      }
      const reg = /^[0-9]*$/
      this._(this._.compact(value.split('\n'))).forEach(function(val, index) {
        if (!reg.test(val)) {
          callback(new Error('产品id必须为数字值（不能包含特殊符号、空格标点符号及汉字）'))
        } else if (val.length !== (_that.formData.product_id_type === '1' ? 8 : 10)) {
          callback(new Error(`产品id只能是${_that.formData.product_id_type === '1' ? 8 : 10}位`))
        } else if (index > 99) {
          callback(new Error('最多支持100个'))
        }
      })
      callback()
    }
    const minPrice = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('价格不能为空'))
      }
      const reg = /^([0-9]|[1-9]\d+)(\.\d{1,2})?$/
      if (!reg.test(value)) {
        return callback(new Error('价格必须为数字或保留两位小数'))
      }
      callback()
    }
    const maxPrice = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('价格不能为空'))
      }
      const reg = /^([0-9]|[1-9]\d+)(\.\d{1,2})?$/
      if (!reg.test(value)) {
        return callback(new Error('价格必须为数字或保留两位小数'))
      }
      if (Number(this.formData.minPrice) > Number(value)) {
        return callback(new Error('价格左边不能比右边大'))
      }
      callback()
    }
    const minSales = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('销量不能为空'))
      }
      const reg = /^[1-9]\d*$/
      if (!reg.test(value)) {
        return callback(new Error('销量必须为大于0的整数'))
      }
      callback()
    }
    const maxSales = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('销量不能为空'))
      }
      const reg = /^[1-9]\d*$/
      if (!reg.test(value)) {
        return callback(new Error('销量必须为大于0的整数'))
      }
      if (Number(this.formData.minSales) > Number(value)) {
        return callback(new Error('销量左边不能比右边大'))
      }
      callback()
    }
    const minScore = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('评分不能为空'))
      }
      const reg = /^([0-9]|[1-9]\d+)(\.\d{1,2})?$/
      if (!reg.test(value)) {
        return callback(new Error('评分必须为正数或保留两为小数'))
      }
      if (Number(value) > 5) {
        return callback(new Error('评分值不能大于5'))
      }
      callback()
    }
    const maxScore = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('评分不能为空'))
      }
      const reg = /^([0-9]|[1-9]\d+)(\.\d{1,2})?$/
      if (!reg.test(value)) {
        return callback(new Error('评分必须为正数或保留两为小数'))
      }
      if (Number(value) > 5) {
        return callback(new Error('评分值不能大于5'))
      }
      if (Number(this.formData.minScore) > Number(value)) {
        return callback(new Error('评分值左边不能比右边大'))
      }
      callback()
    }
    const margin = (rule, value, callback) => {
      const reg = /^([0-9]|[1-9]\d+)(\.\d{1,2})?$/
      if (!reg.test(value)) {
        return callback(new Error('毛利率必须为正数或保留两位小数'))
      }
      if (Number(value) > 100) {
        return callback(new Error('毛利率不能大于100'))
      }
      callback()
    }
    return {
      formData: {
        site_code: [],
        time: [],
        product_id: '',
        minPrice: undefined,
        maxPrice: undefined,
        minSales: undefined,
        maxSales: undefined,
        minScore: undefined,
        maxScore: undefined,
        margin: undefined,
        product_id_type: '1'
      },
      multipleSelectAccountOption: {
        accountArr: [],
        accountKey: 'id'
      },
      rules: {
        site_code: [
          { required: true, message: 'site Code不能为空', trigger: 'blur' }
        ],
        time: [
          { required: true, message: '创建时间不能为空', trigger: 'blur' }
        ],
        product_id: [
          { required: false, validator: product_id, trigger: 'blur' }
        ],
        minPrice: [
          { required: false, validator: minPrice, trigger: 'blur' }
        ],
        maxPrice: [
          { required: false, validator: maxPrice, trigger: 'blur' }
        ],
        minSales: [
          { required: false, validator: minSales, trigger: 'blur' }
        ],
        maxSales: [
          { required: false, validator: maxSales, trigger: 'blur' }
        ],
        minScore: [
          { required: false, validator: minScore, trigger: 'blur' }
        ],
        maxScore: [
          { required: false, validator: maxScore, trigger: 'blur' }
        ],
        margin: [
          { required: true, validator: margin, trigger: 'blur' }
        ]
      },
      addloading: false//提交按钮loading
    }
  },
  props: {
    open: {
      required: true,
      type: Boolean,
      default: false
    },
    multipleSelect: {
      required: true,
      type: Array,
      default: () => {
      }
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    onPre_siteCode(value) {

    },
    addForm() {
      this.$refs['formData'].validate((valid) => {
        if (valid) {
          const query = filterQueryParams(this.formData)
          query.product_id = this.formData.product_id ? this._.compact(this.formData.product_id.split('\n')) : undefined
          this.addloading = true
          selectionAdd(query).then(() => {
            this.closeClearForm()
            this.$emit('renderList')
          }).finally(() => {
            this.addloading = false
          })
        }
      })
    },
    // site code多选框
    selectAccount(arr) {
      this.formData.site_code = arr
    },
    cleanSelect() {
      this.formData.site_code = []
    },

    closeClearForm() {
      this.$emit('update:open', false)
      this.$refs['formData'].resetFields()
      this.formData.time = []
      this.formData.site_code = []
      this.$refs['multipleSelectAccount'].handleCancelAllUser()
    }
  },
  filters: {},
  watch: {
    multipleSelect(value) {
      if (value) {
        this.multipleSelectAccountOption.accountArr = value
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
