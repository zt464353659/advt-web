<template>
  <div>
    <div class="content-box">
      <el-form label-position="right" label-width="100px">
        <el-form-item label="Site Code">
          <el-select v-model="site_code" size="mini" clearable filterable placeholder="请选择" @change="lweChecked">
            <el-option
              v-for="item in options"
              :key="item.id"
              :label="item.site_code"
              :value="item.site_code"
            >
            </el-option>
          </el-select>
          <!--价格测算-->
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="type">
            <el-radio :label="1">单品</el-radio>
            <el-radio :label="2">vary</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="指定毛利率" prop="gross_margin">
          <el-input type="text" size="mini" style="width: 70px" v-model="gross_margin"></el-input>
          %
          <span>(仅支持输入10-100，不指定毛利率默认使用istore配置的毛利率)</span>
        </el-form-item>
        <!--<el-form-item label="运输方式" prop="is_lwe">-->
        <!--<el-checkbox v-model="is_lwe" :disabled="!checked">LWE</el-checkbox>-->
        <!--</el-form-item>-->
        <el-form-item label="Product Id">
          <el-input
            type="textarea"
            rows="24"
            size="mini"
            placeholder="每行一个id"
            v-model="productId"
            style="width: 193px"
          >
          </el-input>
        </el-form-item>
        <div>
          <p style="margin-left:100px;margin-bottom:5px;font-size:12px;color:#ff4d51">
            <b>产品id必须为8位数字，最多输入100个产品id；</b>
          </p>
          <p style="margin-left:100px;margin-top:5px;font-size:12px;color:#ff4d51;">
            <!--<b>仅my、th、id、sg站点支持LWE运输方式测算价格。</b>-->
          </p>
        </div>
        <el-button style="margin-left:100px;" type="primary" size="mini" @click="exportPriceCalculation">导出测算价格(Excel)</el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
  import { fetchExportPriceCalculation } from '@/api/shopee'
  import { exportPriceCalculation } from '@/views/shopee/export'
  import { userSelect } from '@/api/shopee'

  export default {
    name: 'Calculation',
    data() {
      return {
        gross_margin: '',
        is_lwe: false,
        checked: false,
        type: 1,
        productId: '',
        options: [],
        site_code: '',
        id: ''
      }
    },
    created() {
      this.selectInit()
    },
    mounted() {
    },
    methods: {
      // LWE选中判断
      lweChecked(val) {
        if (val) {
          this._.forEach(this.options, item => {
            if (item.site_code === val) {
              this.checked = item.is_lwe
              this.id = item.id
              if (item.is_lwe === false) {
                this.is_lwe = false
              }
            }
          })
        } else {
          this.is_lwe = false
          this.checked = false
        }
      },
      selectInit() {
        const optionsParams = ['shopeeAdvtAccount']
        userSelect(optionsParams).then(response => {
          this.options = response.data.shopeeAdvtAccount
        })
      },
      // 验证用户输入的productID格式
      checkProductID(arr) {
        const reg = /^[1-9]\d{7}$/
        return arr.every(val => reg.test(val.trim()))
      },
      // 验证毛利率输入格式
      checkGross(arr) {
        const reg = /^([1-9]\d{1})(\.\d{1,2})?$|^100$/
        return reg.test(arr)
      },
      // 导出excel表格
      exportPriceCalculation() {
        //  判断用户输入的数量
        const productIdArr = this.productId.split('\n')
        //  判断毛利率
        const grossArr = this.gross_margin
        if (!this.site_code || !this.productId.trim()) {
          this.$message.error('店铺或产品ID不能为空')
          return
        }
        if (productIdArr.length > 100) {
          this.$message.error('最多输入100个 productID')
          return
        }
        if (!this.checkProductID(productIdArr)) {
          this.$message.error('product id必须是8位数字')
          return
        }
        if (grossArr) {
          if (!this.checkGross(grossArr)) {
            this.$message.error('毛利率仅支持输入10-100，小数点后最多2位')
            return
          }
        }
        const arr = this._.map(productIdArr, V => V.trim())
        const obj = {
          account_id: this.id,
          type: this.type,
          // is_lwe: (() => {
          //   if (this.is_lwe === true) {
          //     return 1
          //   } else {
          //     return 0
          //   }
          // })(),
          gross_margin: this.gross_margin,
          data: this._.compact(this._.uniq(arr)).join(','),
          not_show_message: true
        }
        // 获取导出数据
        fetchExportPriceCalculation(obj).then((response) => {
          response.data.forEach((val, index) => {
            if (val.sheetData.length === 0) {
              response.data.splice(index, 1)
            } else {
              val.sheetData.forEach(item => {
                if (item.is_clear_stocks === 0) {
                  item.is_clear_stocks = '否'
                } else if (item.is_clear_stocks === 1) {
                  item.is_clear_stocks = '是'
                }
              })
            }
          })
          // 导出excel
          exportPriceCalculation(response.data)
        }).catch((err) => {
          this.$message.error(err)
        })
      }
    },
    filters: {},
    watch: {}
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped></style>
