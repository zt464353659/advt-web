<template>
  <div>
    <div class="content-box" v-loading="exportLoading" element-loading-text="正在导出，请等待">
      <el-form label-position="right" label-width="100px" :model="formData" :rules="rules" ref="form">
        <el-form-item label="平台" prop="platform">
          <el-select v-model="formData.platform" size="mini" style="width:500px;" clearable filterable placeholder="请选择" @change="platformChange">
            <el-option
              v-for="(item,index) in platformOptions"
              :key="index"
              :label="item"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <!-- 账号选项根据平台选择拉取 -->
        <el-form-item label="Site Code" prop="site_code">
          <el-select v-model="formData.site_code" size="mini" style="width:500px;" clearable filterable placeholder="请选择">
            <el-option
              v-for="item in accountOptions"
              :key="item.id"
              :label="item.account"
              :value="item.account"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="导出字段">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
          <div>
            <span class="checkbox-label">固定字段:</span>
            <el-checkbox checked disabled>价格</el-checkbox>
            <el-checkbox checked disabled>保本价</el-checkbox>
          </div>
          <div style="margin: 10px 0;"></div>
          <div class="select-item">
            <span class="checkbox-label">可选字段:</span>
            <el-checkbox-group v-model="checkedCities" @change="handleCheckedCitiesChange">
              <el-checkbox v-for="(city,index) in cities" :label="city.value" :key="index">{{ city.label }}</el-checkbox>
            </el-checkbox-group>
          </div>
        </el-form-item>

        <el-form-item label="Product Id" prop="product_id">
          <el-input
            type="textarea"
            rows="24"
            size="mini"
            placeholder="每行一个id"
            v-model="formData.product_id"
            style="width: 500px"
          >
          </el-input>
        </el-form-item>
        <div>
          <p class="tip">
            <b>产品id必须为8位数字，最多输入500个产品id(仅支持输入单品、combo、vary子产品测算价格)</b>
          </p>
        </div>
        <el-button style="margin-left:480px;" type="primary" size="mini" @click="exportPriceCalculation">导出测算价格(Excel)</el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
  import { fetchPlatform, getPlatformAccount, fetchExportPriceCalc } from '@/api/tools'
  import { exportPriceCalc } from './calcPrice/export'

  export default {
    name: 'Calculation',
    data() {
      const checkProductId = (rule,value,callback) => {
        const reg = /^[1-9]\d{7}$/
        //  判断用户输入的数量
        if (value.split('\n').length > 500) {
          callback(new Error('最多输入500个ID'))
          return
        }
        // 每一项产品ID是否为8位数字
        if (value.split('\n').some(v => !reg.test(v))) {
          callback(new Error('产品ID只能为8位数字'))
          return
        }
        callback()
      }
      return {
        formData: {
          platform: '',
          site_code: '',
          product_id: ''
        },
        platformOptions: [],
        accountOptions: [],
        checkAll: false,
        checkedCities: [],
        cities: [
          { value: 'gross_margin', label: '毛利率' },
          { value: 'commission', label: '佣金率' },
          { value: 'shipping_costs', label: '运费' },
          { value: 'shipping_method', label: '运输方式' },
          { value: 'parcel_processing_fee', label: '打包费' }
        ],
        isIndeterminate: false,
        rules: {
          'platform': [{ required: true, message: '请选择平台', trigger: ['change'] }],
          'site_code': [{ required: true, message: '请选择账号', trigger: ['change'] }],
          'product_id': [{ required: true, validator: checkProductId, trigger: ['blur'] }],
        },
        exportLoading: false
      }
    },
    created() {
      this.selectInit()
    },
    mounted() {
    },
    methods: {
      // 全选
      handleCheckAllChange(val) {
        this.checkedCities = val ? this.cities.map(v => v.value) : []
        this.isIndeterminate = false
      },
      handleCheckedCitiesChange(value) {
        let checkedCount = value.length
        this.checkAll = checkedCount === this.cities.length
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.cities.length
      },
      // 切换平台，拉取对应平台下账号
      platformChange(val) {
        this.accountOptions = []
        this.formData.site_code = ''
        if (val) {
          getPlatformAccount(val).then(res => {
            this.accountOptions = res.data
          })
        }
      },
      selectInit() {
        // 拉取平台列表
        fetchPlatform().then(res => {
          this.platformOptions = res.data
        })
      },
      // 导出excel表格
      exportPriceCalculation() {
        this.$refs['form'].validate(valid => {
          if (valid) {
            const productIdArr = this.formData.product_id.split('\n')
            const arr = this._.map(productIdArr, V => V.trim())
            // 可选字段
            const select_item = this._.cloneDeep(this.checkedCities)
            // 当前平台
            const platform = this.formData.platform
            const obj = {
              platform,
              account: this.formData.site_code,
              fields: select_item.join(','),
              product_ids: this._.compact(this._.uniq(arr)).join(','),
              not_show_message: true
            }
            // 获取导出数据
            this.exportLoading = true
            fetchExportPriceCalc(obj).then((response) => {
              const result = response.data.filter(v => v.sheetData.length)
              // 导出excel
              exportPriceCalc(platform,['platform','site','istore_product_id','total_price', 'base_price'].concat(select_item),result)
            }).catch((err) => {
              this.$message.error(err)
            }).finally(() => {
              this.exportLoading = false
            })
          }
        })
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .select-item {
    display: flex;
  }

  .checkbox-label {
    color: #606266;
    margin-right: 10px;
  }
  .tip{
    margin-left:100px;
    margin-bottom:10px;
    font-size:12px;
    color:#909399;
  }
</style>
