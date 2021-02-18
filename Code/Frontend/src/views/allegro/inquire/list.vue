<template>
  <div>
    <div class="content-box">
      <el-form label-position="right" label-width="100px">
        <el-form-item label="Site Code">
          <el-select v-model="site_code" size="mini" clearable filterable placeholder="请选择">
            <el-option
              v-for="i in options"
              :key="i.id"
              :label="i.account"
              :value="i.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="平台商品号">
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
            <b>平台商品号必须为10位数字；</b>
          </p>
          <p style="margin-left:100px;margin-top:5px;font-size:12px;color:#ff4d51;">
            <!--<b>仅my、th、id、sg站点支持LWE运输方式测算价格。</b>-->
          </p>
        </div>
        <el-button style="margin-left:100px;" type="primary" size="mini" @click="exportPriceCalculation">导出</el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
  import { fetchExportPriceCalculation } from '@/api/allegro'
  import { exportDaySales } from '@/views/allegro/export'
  import { apiGetSelectAll } from '@/api/allegro'

  export default {
    data() {
      return {
        productId: '',
        options: [],
        site_code: '',
        id: ''
      }
    },
    created() {
      apiGetSelectAll(['allegroAdvtAccount']).then(response => {
        this.options = response.data.allegroAdvtAccount
      })
    },
    mounted() {
    },
    methods: {
      // 验证用户输入的productID格式
      checkProductID(arr) {
        const reg = /^[1-9]\d{9}$/
        const checkArr = this._.compact(arr.map(v => v.trim()))
        return checkArr.every(val => reg.test(val.trim()))
      },
      // 导出excel表格
      exportPriceCalculation() {
        //  判断用户输入的数量
        const productIdArr = this.productId.split('\n')
        if (!this.site_code || !this.productId.trim()) {
          this.$message.error('Site Code或平台商品号不能为空')
          return
        }
        // if (productIdArr.length > 100) {
        //   this.$message.error('最多输入100个 productID')
        //   return
        // }
        if (!this.checkProductID(productIdArr)) {
          this.$message.error('平台商品号必须10位数字')
          return
        }
        const arr = this._.map(productIdArr, V => V.trim())
        const obj = {
          account_id: this.site_code,
          spu: this._.compact(this._.uniq(arr)).join(','),
          not_show_message: true
        }
        // 获取导出数据
        fetchExportPriceCalculation(obj).then((response) => {
          response.data.list.forEach((val, index) => {
            if (val.length === 0) {
              response.data.list.splice(index, 1)
            }
          })
          // 导出excel
          exportDaySales(response.data.list)
        })
      }
    },
    filters: {},
    watch: {}
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
