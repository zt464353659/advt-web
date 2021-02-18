<template>
  <el-dialog
    title="销售统计报表"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="clearAccount"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    width="600px"
    v-dragMove
  >
    <template>
      <el-form ref="formData" :model="formData" label-width="100px" size="small">
        <el-form-item label="日期" prop="time">
          <el-date-picker
            v-model="formData.time"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期" style="width: 80%"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="店铺">
          <multiple-select-account style="width: 80%" ref="shopOptions" v-bind.sync="shopOptions" @select-account="selectAccount" @clean-select="cleanSelectAccount"></multiple-select-account>
        </el-form-item>
        <el-form-item label="产品线">
          <multiple-select-account style="width: 80%" ref="productLineOptions" v-bind.sync="productLineOptions" @select-product-line="selectProductLine"
                                   @clean-select="cleanSelectProLine"
          ></multiple-select-account>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="clearAccount">取 消</el-button>
      <el-button type="primary" @click="search">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import multipleSelectAccount from './multipleSelectAccount'
  import { getSelectAll, addSalesReport } from '@/api/shopee'

  export default {
    components: { multipleSelectAccount },
    data() {
      return {
        formData: {
          time: null
        },
        shopOptions: {
          accountArr: [],
          accountKey: 'id'
        },
        productLineOptions: {
          accountArr: [],
          accountKey: 'id'
        }
      }
    },
    props: {
      open: Boolean,
      data: {
        type: Object,
        default: () => {}
      }
    },
    created() {
      const optionsParams = ['shopeeAdvtAccount', 'shopeeAdvtTypes', 'shopeeProductLine', 'shopeeAdvtShopAccount']
      getSelectAll(optionsParams).then(response => {
        this.itemForEach(response.data.shopeeAdvtAccount)
        this.itemForEach(response.data.shopeeProductLine)
        this.shopOptions.accountArr = response.data.shopeeAdvtAccount
        this.productLineOptions.accountArr = response.data.shopeeProductLine
      })
    },
    mounted() {
    },
    methods: {
      // 回填数据处理
      itemForEach(val) {
        val.forEach(value => {
          if (value.site_code) {
            value.account = value.site_code
          } else if (value.name) {
            value.account = value.name
          }
        })
      },
      search() {
        if (this.formData.time !== null && this.formData.time.length === 2) {
          this.addSalesReport()
        } else if (this.formData.account_id && this.formData.account_id.length > 0) {
          this.addSalesReport()
        } else if (this.formData.product_line && this.formData.product_line.length > 0) {
          this.addSalesReport()
        } else {
          this.$message.error('请至少选择一个查询条件')
        }
      },
      addSalesReport() {
        const obj = {
          begin_date: (() => {
            if (this.formData.time !== null) {
              return this.formData.time[0]
            } else {
              return null
            }
          })(),
          end_date: (() => {
            if (this.formData.time !== null) {
              return this.formData.time[1]
            } else {
              return null
            }
          })(),
          account_id: this._.compact(this.formData.account_id).join(','),
          product_line: this._.compact(this.formData.product_line).join(',')
        }
        addSalesReport(obj).finally(() => {
          this.loading = false
          this.$emit('renderList')
        })
        this.clearAccount()
      },
      closeClearForm() {
        this.$emit('update:open', false)
        this.formData = {
          time: null
        }
      },
      selectAccount(arr) {
        this.formData.account_id = arr
      },
      selectProductLine(arr) {
        this.formData.product_line = arr
      },
      clearAccount() {
        this.$refs.shopOptions.handleCancelAllUser()
        this.$refs.productLineOptions.handleCancelAllUser()
        this.closeClearForm()
      },
      cleanSelectAccount() {
        this.formData.account_id = []
      },
      cleanSelectProLine() {
        this.formData.product_line = []
      }
    },
    filters: {},
    watch: {}
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
