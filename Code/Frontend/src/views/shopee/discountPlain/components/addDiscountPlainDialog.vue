<template>
  <el-dialog :title="'添加折扣计划'"
             :visible="open"
             :before-close="onClose"
             width="980px"
             v-loading="loading"
             :close-on-press-escape="false"
             :close-on-click-modal="false"
             v-dragMove
  >
    <el-row class="add-iscount-Plain-dialog">
      <el-form ref="formData" label-width="150px" :model="formData" :rules="rules" size="mini">
        <el-col :span="10" class="left" style="min-height: 200px">
          <h3>广告信息</h3><br>
          <el-form-item label="计划任务" prop="operation_type">
            <el-select v-model="formData.operation_type" size="mini" filterable placeholder="请选择站点">
              <el-option label="更新售价（全部广告）" value="1"></el-option>
              <el-option label="更新系统折扣售价(仅系统折扣)" value="2"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="14" class="right">
          <h3>折扣活动信息</h3><br>
          <el-form-item label="Site Code" required>
            <el-row :gutter="20">
              <el-col :span="6" style="padding-left: 0">
                <el-form-item prop="pre_siteCode">
                  <el-select v-model="formData.pre_siteCode"
                             placeholder="请选择"
                             @change="onPre_siteCode"
                             style="width: 100px"
                  >
                    <el-option label="tw" value="tw"></el-option>
                    <el-option label="id" value="id"></el-option>
                    <el-option label="vn" value="vn"></el-option>
                    <el-option label="th" value="th"></el-option>
                    <el-option label="ph" value="ph"></el-option>
                    <el-option label="br" value="br"></el-option>
                    <el-option label="my" value="my"></el-option>
                    <el-option label="sg" value="sg"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="10">
                <el-form-item prop="account_id">
                  <multiple-select-account
                    ref="multipleSelectAccount"
                    v-bind.sync="multipleSelectAccountOption"
                    @select-account="selectAccount"
                    @clean-select="cleanSelect"
                    style="width: 220px"
                  ></multiple-select-account>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="折后毛利率" prop="discount_after_rate">
            <el-input size="mini" v-model="formData.discount_after_rate" style="width:100px;"></el-input>
            %<span style="color: red">请输入{{ this.formData.min_gross }}-55的整数</span>
          </el-form-item>
        </el-col>
      </el-form>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="onSubmit">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { addPlanAccount, apiAddDiscountPlain } from '@/api/shopee'
import multipleSelectAccount from './multipleSelectAccount'

export default {
  components: { multipleSelectAccount },
  props: {
    open: Boolean
  },
  data() {
    // 折扣毛利率
    const checkDiscountRate = (rule, value, callback) => {
      if (!value.trim()) {
        callback(new Error('请输入指定折后毛利率'))
      }
      const reg = /^[0-9]*$/g
      if (!reg.test(value.trim())) {
        callback(new Error('折后毛利率仅支持整数'))
      }
      if (Number(value) < this.formData.min_gross || Number(value) > 55) {
        callback(new Error(`折后毛利率仅支持${this.formData.min_gross}至55的整数。`))
      }
      callback()
    }
    return {
      formData: {
        min_gross: undefined,//最低毛利率
        pre_siteCode: '',//站点参数
        account_id: [],
        operation_type: '2',
        discount_after_rate: ''
      },
      multipleSelectAccountOption: {
        accountArr: [],
        accountKey: 'id'
      },
      loading: false,
      rules: {
        operation_type: [
          { required: true, message: '请选择计划任务', trigger: 'change' }
        ],
        discount_after_rate: [
          { required: true, validator: checkDiscountRate, trigger: 'blur' }
        ],
        account_id: [
          { required: true, message: '请先选择账号', trigger: ['change', 'blur'] }
        ]
      }
    }
  },
  computed: {},
  watch: {},
  methods: {
    onPre_siteCode(value) {
      this.$refs['formData'].clearValidate()
      if (['ph', 'my', 'sg', 'id', 'th'].includes(value)) {
        this.formData.min_gross = 15
      } else if (['br', 'tw'].includes(value)) {
        this.formData.min_gross = 20
      } else if (['vn'].includes(value)) {
        this.formData.min_gross = 18
      }
      addPlanAccount({ 'site': value }).then(response => {
        this.multipleSelectAccountOption.accountArr = response.data
      })
    },
    onSubmit() {
      this.$refs['formData'].validate((valid) => {
        if (valid) {
          this.loading = true
          apiAddDiscountPlain(this.formData).then(res => {
            this.$emit('emit-upload')
            this.onClose()
          }).finally(() => {
            this.loading = false
          })
        }
      })
    },
    onClose() {
      this.$refs['multipleSelectAccount'].handleCancelAllUser()
      this.$refs['formData'].resetFields()
      this.$emit('update:open', false)
    },
    // site code多选框
    selectAccount(arr) {
      this.formData.account_id = arr
    },
    cleanSelect() {
      this.formData.account_id = []
    }
  }
}
</script>
<style lang="scss" scoped>
.add-iscount-Plain-dialog {
  border: 1px solid #b0b0b0;

  h3 {
    text-align: center;
    margin: 0;
    padding: 10px 0;
    border-bottom: 1px solid #b0b0b0;
  }
}

.left {
  border-right: 1px solid #b0b0b0;
}
</style>
