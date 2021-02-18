<template>
  <el-dialog
    title="产品添加"
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
        <el-form-item label="Site Code" prop="account_id">
          <el-select v-model="formData.account_id" @change="getAccountName" clearable placeholder="请选择" style="width:500px;">
            <el-option v-for="item in accountOptions" :key="item.id" :label="item.site_code" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Product ID" prop="productIds">
          <el-input
            type="textarea"
            style="width:500px;"
            @input="showLines"
            :autosize="{ minRows: 8, maxRows: 8}"
            placeholder="请输入内容，一行填写一个产品id"
            v-model="formData.productIds"
          >
          </el-input>
          <p>
            <svg-icon icon-class="bug"/>
            一行填写一个产品id,最多可输入500个ID
            <span v-if="lines">(已输入 {{ this.lines }} 行)</span>
          </p>
        </el-form-item>
        <el-form-item label="更新类型" prop="type">
          <div>
            <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
            <!--<span style="color: #F56C6C;font-size: 10px;">vary子ID只允许更新价格和库存</span>-->
          </div>
          <div style="margin: 15px 0;"></div>
          <el-checkbox-group style="width: 300px;" v-model="formData.type" @change="handleCheckedCitiesChange">
            <el-checkbox v-for="city in cities" :label="city.key" :key="city.key">{{ city.label }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" size="mini" style="width: 500px;"></el-input>
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
  import { addProductUpdate } from '@/api/tiki'
  import { resultAlert } from './../advertising/common'

  export default {
    // components: { multipleSelectAccount },
    data() {
      const checkProductId = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('产品id不能为空'))
        }
        if (value.split('\n').length > 500) {
          return callback(new Error('最多输入500个 Product ID'))
        }
        setTimeout(() => {
          const reg = /^[0-9]*$/
          this._(this._.compact(value.split('\n'))).forEach(function (val) {
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
          remark: '',
          productIds: '',
          account_id: undefined,
          account_name: '',
          product_id: '',
          type: [],
          user_name: this.$store.state.user.name,
          user_id: store.getters.userInfo.id
        },
        options: [],
        rules: {
          account_id: [
            { required: true, message: '请选择账号', trigger: 'change' }
          ],
          productIds: [
            // { required: true, message: '请输入产品id', trigger: 'blur' },
            { required: true, validator: checkProductId, trigger: 'blur' }
          ],
          type: [
            { required: true, message: '请选择类型' }
          ]
        },
        checkAll: false,
        cities: [
          { key: 'price', label: '价格' },
          { key: 'stock', label: '库存' },
        ],
        isIndeterminate: false,
        lines: 0
      }
    },
    props: {
      accountOptions: {
        type: Object,
        required: true,
        default: () => []
      },
      open: {
        type: Boolean,
        required: true,
        default: false
      }
    },
    created() {
    },
    methods: {
      setUpdate(updateType) {
        this.$refs['formData'].validate(valid => {
          if (valid) {
            this.formData.user_id = store.getters.userInfo.id
            this.formData.product_id = this._.compact(this.formData.productIds.split('\n'))
            const obj = this._.cloneDeep(this.formData)
            obj.operate = updateType
            obj.account_id = [obj.account_id]
            obj.not_show_message = true
            delete obj.productIds
            addProductUpdate(obj).then((res) => {
              resultAlert(res)
              this.closeClearForm()
              this.$emit('reload')
            }).catch((err) => {
              this.$message.error(err)
              this.closeClearForm()
            })
          }
        })
      },
      selectAccount(arr) {
        this.formData.account = arr
      },
      cleanSelect() {
        this.$refs['formData'].resetFields()
      },
      closeClearForm() {
        this.$refs['formData'].clearValidate()
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
          this._.map(this.accountOptions, item => {
            if (val === item.id) {
              this.formData.account_name = item.site_code
            }
          })
        }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .el-form-item {
    p {
      margin: 0;
      color: #909399;
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
