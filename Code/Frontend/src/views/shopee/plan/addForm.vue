<template>
  <el-dialog
    title="产品添加"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="onClose"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    width="740px"
    v-dragMove
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" label-width="100px" size="small" @submit.native.prevent>
        <el-form-item label="账号" prop="account">
          <multiple-select-account
            ref="multipleSelectAccount"
            :options="options"
            @select-account="selectAccount"
            @clean-select="cleanSelect"
            @check-set-shipping="checkSetShipping"
            style="width: 240px"
          ></multiple-select-account>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型">
            <el-option label="计划上传" value="0"></el-option>
            <el-option label="计划删除" value="1"></el-option>
          </el-select>
        </el-form-item>
        <template v-if="formData.type === '0'">
          <el-form-item label="预购" prop="pre_order" style="margin-bottom: 0">
            <el-radio-group v-model="formData.pre_order" @change="radioChange">
              <el-radio label="0">否</el-radio>
              <el-radio label="1">是</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item prop="days_to_ship">
            <p v-if="formData.pre_order === '0'">我将在2天内发货(不包括公共假期和快递服务休息日)</p>
            <p v-if="formData.pre_order === '1'">
              我将在
              <el-input v-model="formData.days_to_ship" type="text" size="mini" style="width: 46px"></el-input>
              天内出货(可选择7至30天)
            </p>
          </el-form-item>
        </template>
        <el-form-item label="产品id" prop="data" v-if="['0','1'].includes(formData.type)">
          <el-input
            type="textarea"
            style="width: 90%;"
            :autosize="{ minRows: 4, maxRows: 8}"
            placeholder="请输入内容，一行填写一个产品id"
            v-model="formData.data"
          >
          </el-input>
          <p>
            <svg-icon icon-class="bug" />
            一行填写一个产品id 最多不超过100个
          </p>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="addPlan('formData')">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import store from '@/store'
import { addProductPlan, addPlanAccount } from '@/api/shopee'
import { filterQueryParams } from '@/utils/help.js'
import multipleSelectAccount from './components/multipleSelectAccount'

export default {
  components: { multipleSelectAccount },
  data() {
    const checkProductId = (rule, value, callback) => {
      const data = this.formData.data.split('\n')
      if (data.length > 100) {
        return callback(new Error('产品id最多不能超过100个'))
      }
      if (!value) {
        return callback(new Error('产品id不能为空'))
      }
      const reg = /^[0-9]*$/
      this._(this._.compact(value.split('\n'))).forEach(function(val) {
        if (!reg.test(val)) {
          return callback(new Error('产品id必须为数字值（不能包含特殊符号、空格标点符号及汉字）'))
        } else if (val.length !== 8) {
          return callback(new Error('产品id只能是8位'))
        }
      })
      callback()
    }
    const checkRainDays = (rule, value, callback) => {
      if (this.formData.pre_order === '0') {
        return callback()
      } else if (this.formData.pre_order === '1') {
        const reg = /^([7-9]|[1-2]\d|3[0])$/
        if (!reg.test(value)) {
          return callback(new Error('只能为7-30正整数'))
        } else {
          callback()
        }
      }
    }
    return {
      formData: {
        user_id: undefined,
        account: [],//账号
        type: '',//类型
        pre_order: '0',//预购
        days_to_ship: '7',//发货时间
        data: '',//产品id
        is_lwe: undefined//运输方式
      },
      options: [],
      rules: {
        account: [
          { required: true, message: '请先选择平台及账号', trigger: 'change' }
        ],
        type: [
          { required: true, message: '请先选择类型', trigger: 'change' }
        ],
        data: [
          { required: true, validator: checkProductId, trigger: 'blur' }
        ],
        days_to_ship: [
          { required: true, validator: checkRainDays, trigger: 'blur' }
        ]
      }


    }
  },
  props: {
    open: {
      type: Boolean,
      default: false
    }
  },
  created() {
    this.SearchInit()
  },
  methods: {
    // 初始化站点选项
    SearchInit() {
      addPlanAccount().then(response => {
        this.options = response.data
      })
    },
    //请求参数组装
    parametersSet() {
      const query = filterQueryParams(this.formData)
      query.user_id = store.getters.userInfo.userId
      if (this.formData.type === '0') {
        query.data = this._.compact(this.formData.data.split('\n')).join(',')
      } else if (this.formData.type === '1') {
        query.data = this._.compact(this.formData.data.split('\n')).join(',')
      }
      return query
    },
    //请求提示/校验
    requestPrompt() {
      return new Promise((resolve, reject) => {
        if (this.formData.type === '0') {
          resolve()
        } else if (this.formData.type === '1') {
          this.$confirm('任务中可能包含有销量广告，广告删除后不可恢复，是否创建计划下架任务？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            closeOnClickModal: false,
            closeOnPressEscape: false,
            type: 'warning'
          }).then(() => {
            resolve()
          }).catch(() => {
            reject()
          })
        }
      })
    },
    addPlan(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.requestPrompt().then(() => {
            addProductPlan(this.parametersSet()).then(() => {
              this.$emit('reload')
            }).finally(() => {
              this.onClose()
            })
          })
        }
      })
    },
    onClose() {
      this.$refs['multipleSelectAccount'].handleCancelAllUser()
      this.$refs['formData'].resetFields()
      this.$emit('update:open', false)
    },
    selectAccount(arr) {
      this.formData.account = arr
    },
    cleanSelect() {
      this.formData.account = []
    },
    // 根据站点判断是否可选择运输方式
    checkSetShipping() {
      let selectAccount = []
      // 马拉西亚（my）、泰国（th）、印度尼西亚（id）和新加坡（sg）站可以用LWE运输方式，其他站点不可使用LWE运输方式
      const allowSite = ['my', 'th', 'id', 'sg']
      if (this.formData.account.length) {
        this.formData.account.map(val => {
          this.options.map(item => {
            if (val === item.id) {
              selectAccount = this._.uniq(selectAccount.concat(item.account.slice(-2)))
            }
          })
        })
        if (this._.every(selectAccount, item => allowSite.includes(item))) {
        } else {
          this.formData.is_lwe = '0'
        }
      } else {
        this.formData.is_lwe = '0'
      }
    },
    // 预购选择改变
    radioChange() {
      if (this.formData.pre_order === '0') {
        this.$refs['formData'].clearValidate('days_to_ship')
        this.formData.days_to_ship = '2'
      } else if (this.formData.pre_order === '1') {
        this.$refs['formData'].clearValidate('days_to_ship')
        this.formData.days_to_ship = '7'
      }
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

.tip-color {
  color: #E6A23C;
  line-height: 30px;
  font-size: 14px;
  background-color: transparent !important;
}
</style>
