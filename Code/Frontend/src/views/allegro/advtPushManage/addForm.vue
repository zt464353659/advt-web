<template>
  <el-dialog
    title="添加广告排名推广"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="onClose"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    width="740px"
  >
    <template>
      <el-form
        ref="formData"
        :model="formData"
        :rules="rules"
        label-width="100px"
        size="small"
        @submit.native.prevent
      >
        <el-form-item label="账号" prop="accountId">
          <el-select
            v-model="formData.accountId"
            placeholder="请选择账号"
            clearable
            filterable
          >
            <el-option
              v-for="i in options.allegroAdvtAccount"
              :key="i.id"
              :label="i.account"
              :value="i.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型" clearable multiple collapse-tags style="width: 300px">
            <el-option label="featured offers" value="emphasized"></el-option>
            <el-option label="Promo Package" value="emphasizedHighlightBoldPackage"></el-option>
            <el-option label="promotion on the category page" value="departmentPage"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="平台商品号" prop="productIds">
          <el-input
            type="textarea"
            style="width: 90%"
            :autosize="{ minRows: 4, maxRows: 8 }"
            placeholder="请输入内容，一行填写一个产品SPU ID"
            v-model="formData.productIds"
          >
          </el-input>
          <p style="color: red">
            <svg-icon icon-class="bug" />
            一行填写一个，最多可填写100个产品平台商品号
          </p>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" v-debounce @click="addPlan('formData')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { apiGetSelectAll, setAdvtPromotionPlanAdd } from '@/api/allegro'

export default {
  mixins: [],
  filters: {},
  components: {},
  props: {
    open: {
      type: Boolean,
      required: true,
      default: false
    },
  },
  data() {
    const accountid = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('账号不能为空'))
      }
      callback()
    }
    const type = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('类型不能为空'))
      }
      callback()
    }
    const productIds = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('平台商品号不能为空'))
      }
      const reg = /^[0-9]*$/
      this._(this._.compact(value.split('\n'))).forEach(function(val) {
        if (!reg.test(val)) {
          callback(new Error('产品id必须为数字值（不能包含特殊符号、空格标点符号及汉字）'))
        }
        if (val.length !== 10) {
          callback(new Error('产品id只能是10位'))
        }
      })
      const productIds = this.formData.productIds.split('\n')
      if (productIds.length > 100) {
        return callback(new Error('平台商品号最多不能超过100个'))
      }
      callback()
    }
    return {
      rules: {
        accountId: [
          { required: true, validator: accountid, trigger: 'change' }
        ],
        type: [
          { required: true, validator: type, trigger: 'change' }
        ],
        productIds: [
          { required: true, validator: productIds, trigger: 'change' }
        ]
      },
      formData: {
        accountId: undefined,
        type: ['emphasized'],
        productIds: undefined
      },
      options: []
    }
  },
  computed: {},
  watch: {},
  created() {
    this.getall()
  },
  mounted() {
  },
  destroyed() {
  },
  methods: {
    //提交
    addPlan(formData) {
      this.$refs[formData].validate((valid) => {
        if (valid) {
          const obj = {
            account_id: this.formData.accountId,
            options: this.formData.type,
            data: this.formData.productIds.split('\n').join(',')
          }
          console.log(obj)
          setAdvtPromotionPlanAdd(obj).then((res) => {
            this.onClose()
            this.$emit('reload')
          })
        }
      })
    },
    //关闭
    onClose() {
      this.$emit('update:open', false)
      this.$refs['formData'].resetFields()
    },
    //公共信息
    getall() {
      const optionsParams = ['allegroAdvtAccount', 'allegroAdvtTypes', 'allegroProductLine']
      apiGetSelectAll(optionsParams).then(res => {
        let { data } = res
        this.options = data
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped></style>
