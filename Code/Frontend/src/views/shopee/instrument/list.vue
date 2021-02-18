<template>
  <div>
    <div class="tool-parent">
      <div class="tool-child" @click="transition">
        <svg-icon iconClass="folders"></svg-icon>
        <el-button type="text">数据格式转换</el-button>
      </div>
      <div class="tool-child" @click="handleOutLine" v-permission="permissions.instrument_offlineAdd">
        <svg-icon iconClass="out-line" @click="transition"></svg-icon>
        <el-button type="text" @click="transition">广告下架</el-button>
      </div>
      <div class="tool-child" @click="handleVouchers" v-permission="permissions.instrument_couponList">
        <svg-icon iconClass="discount" @click="transition"></svg-icon>
        <el-button type="text" @click="transition">购物优惠券</el-button>
      </div>
      <div class="tool-child" @click="ActivitiesSelect" v-permission="permissions.instrument_selectionList">
        <div class="svg-icon">
          <i class="el-icon-sold-out"></i>
        </div>
        <el-button type="text">活动选品</el-button>
      </div>
    </div>
    <!--转换弹窗-->
    <transition v-if="translateDialogShow" v-bind.sync="transitonData"></transition>
  </div>
</template>

<script>
import transition from './compoments/transition'

export default {
  components: { transition },
  data() {
    return {
      permissions: {
        instrument_offlineAdd: 'shopee.tools.offline.list',//异仓下架
        instrument_couponList: 'shopee.tools.coupon.list',//购物优惠券
        instrument_selectionList: 'shopee.export.selection.list'//活动选品
      },//权限
      transitonData: {
        data: {},
        open: false
      },
      translateDialogShow: true
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    transition() {
      this.translateDialogShow = true
      this.transitonData = {
        data: {},
        open: true
      }
    },
    handleVouchers() {
      this.translateDialogShow = false
      this.$nextTick(() => {
        this.$router.push('/shopee/instrument/vouchersDetail')
      })
    },
    handleOutLine() {
      this.translateDialogShow = false
      this.$nextTick(() => {
        this.$router.push('/shopee/instrument/outLineDetail')
      })
    },
    ActivitiesSelect(){
      this.$nextTick(() => {
        this.$router.push('/shopee/instrument/ActivitiesSelect')
      })
    }
  },
  filters: {},
  watch: {}
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.tool-parent {
  display: flex;

  .tool-child {
    margin: 15px;
    text-align: center;
    cursor: pointer;
  }
}

.svg-icon {
  font-size: 38px;
  margin: 20px 20px 0 20px;
  color: #0078d7;
  display: block;
}
</style>
