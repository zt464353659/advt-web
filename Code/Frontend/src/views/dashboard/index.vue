<template>
  <div
    class="dashboard-container"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-background="rgba(0, 0, 0, 0.3)"
  >
    <el-form
      :inline="true"
      :model="formData"
      class="platform-form-inline"
      :class="{'fixed-form':fixedHeader}"
      size="mini"
    >
      <el-form-item label="当前平台：">
        <el-select
          v-model="formData.platform"
          @change="changePlatform"
        >
          <el-option
            v-for="(item, index) in platformData"
            :label="item.label"
            :value="item.value"
            :key="index"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div v-if="is_show">
      <panel-group :panel-data="panelData" />
      <el-row :gutter="12">
        <el-col
          :xs="24"
          :sm="24"
          :md="24"
          :lg="12"
        >
          <div class="box">
            <div class="header-box">
              <label class="title">
                <svg-icon icon-class="tree" />
                新建广告数总数：{{ totalNumberNewAdvt }}</label>
            </div>
            <div class="content-box">
              <line-chart :chart-data="numberNewAdvtChartData" />
            </div>
          </div>
        </el-col>
        <el-col
          :xs="24"
          :sm="24"
          :md="24"
          :lg="12"
        >
          <div class="box">
            <div class="header-box">
              <label class="title">
                <svg-icon icon-class="tree" />
                发布成功广告数总数：{{ totalNumberSuccessReleaseAdvt }}</label>
            </div>
            <div class="content-box">
              <line-chart :chart-data="numberSuccessReleaseAdvtChartData" />
            </div>
          </div>
        </el-col>
        <el-col
          :xs="24"
          :sm="24"
          :md="24"
          :lg="12"
        >
          <div class="box">
            <div class="header-box">
              <label class="title">
                <svg-icon icon-class="tree" />
                库存更新数总数：{{ totalNumberInventoryUpdate }}</label>
            </div>
            <div class="content-box">
              <stack-bar-chart :chart-data="numberInventoryUpdateChartData" />
            </div>
          </div>
        </el-col>
        <el-col
          :xs="24"
          :sm="24"
          :md="24"
          :lg="12"
        >
          <div class="box">
            <div class="header-box">
              <label class="title">
                <svg-icon icon-class="tree" />
                价格更新数总数：{{ totalNumberPriceUpdate }}</label>
            </div>
            <div class="content-box">
              <stack-bar-chart :chart-data="numberPriceUpdateChartData" />
            </div>
          </div>
        </el-col>
        <!--<el-col :xs="24" :sm="24" :md="16" :lg="18">
          <listing-table></listing-table>
        </el-col>
        <el-col :xs="24" :sm="24" :md="8" :lg="6">
          <box-card></box-card>
        </el-col>-->
      </el-row>
    </div>
    <div
      v-else
      class="message-box"
    >
      暂无平台数据，先去看看其他数据。
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import PanelGroup from './components/PanelGroup'
  import LineChart from './components/LineChart'
  import StackBarChart from './components/StackBarChart'
  // import ListingTable from './components/ListingTable'
  // import BoxCard from './components/BoxCard'
  import { getChartsData } from '@/api/dashboard'

  export default {
    name: 'Dashboard',
    components: {
      PanelGroup,
      LineChart,
      StackBarChart
    // ListingTable,
    // BoxCard
    },
    data() {
      return {
        loading: false,
        is_show: false,
        formData: {
          platform: ''
        },
        platformData: [],
        // panel统计数（包括创建成功总数、发布成功总数、今日创建成功总数、今日发布成功总数）
        panelData: {},
        // 新建广告数 图表数据 + 总数
        numberNewAdvtChartData: {},
        totalNumberNewAdvt: 0,
        // 发布成功广告数 图表数据 + 总数
        numberSuccessReleaseAdvtChartData: {},
        totalNumberSuccessReleaseAdvt: 0,
        // 库存更新数 图表数据 + 总数
        numberInventoryUpdateChartData: {},
        totalNumberInventoryUpdate: 0,
        // 价格更新数 图表数据 + 总数
        numberPriceUpdateChartData: {},
        totalNumberPriceUpdate: 0
      }
    },
    computed: {
      ...mapGetters([
        'userInfo',
        'permissions',
        'platforms',
        'fixedHeader',
        'permission_routers'
      ])
    },
    created() {
      // this.$store.dispatch('addPlatform', 'kr11street').then(() => {
      // }).catch(() => {})
      this.getCurrentPlatform()
      this.getChartsData()
    },
    methods: {
      getCurrentPlatform() {
        // this._.forEach(this.permissions, (val) => {
        //   if (val.enable && val.pid === '0') {
        //     if (this._.indexOf(this.platforms, val.platform) > -1) {
        //       this.formData.platform = val.platform
        //       this.platformData.push({
        //         label: val.name,
        //         value: val.platform
        //       })
        //     }
        //   }
        // })
        // this.platformData = this.platformData.reverse()
        this._.forEach(this.permission_routers, (val, index) => {
          if (val.meta && val.meta.title && this.platforms.includes(val.path.substr(1))) {
            if (this.platformData.length === 0) {
              this.formData.platform = val.meta.title
            }
            this.platformData.push({
              label: val.meta.title,
              value: val.meta.title
            })
          }
        })
      },
      changePlatform() {
        this.getChartsData()
      },
      getChartsData() {
        // const optionsParams = { platform: this.formData.platform }
        const platform = this.formData.platform
        if (!platform) {
          this.is_show = false
          return
        }
        this.is_show = true
        this.loading = true
        getChartsData(platform).then(response => {
          this.panelData = response.data.panelData
          this.numberNewAdvtChartData = response.data.numberNewAdvtChartData
          this.totalNumberNewAdvt = response.data.totalNumberNewAdvt
          this.numberSuccessReleaseAdvtChartData = response.data.numberSuccessReleaseAdvtChartData
          this.totalNumberSuccessReleaseAdvt = response.data.totalNumberSuccessReleaseAdvt
          this.numberInventoryUpdateChartData = response.data.numberInventoryUpdateChartData
          this.totalNumberInventoryUpdate = response.data.totalNumberInventoryUpdate
          this.numberPriceUpdateChartData = response.data.numberPriceUpdateChartData
          this.totalNumberPriceUpdate = response.data.totalNumberPriceUpdate
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .dashboard-container {
    .message-box {
      text-align: center;
      margin: 30px 0;
    }

    position: relative;
    background-color: #F2F6FC;

    .platform-form-inline {
      z-index: 10;
      position: absolute;
      top: -39px;
      /*left: 50px;*/
      margin-left: 34px;
      background-color: white;

      &.fixed-form {
        position: fixed;
        top: 11px;
      }

      .el-form-item--mini.el-form-item,
      .el-form-item--small.el-form-item {
        margin-bottom: 0;
      }

      .el-form-item__label {
        color: #97a8be;
      }
    }

    .box {
      padding: 6px 12px;
      background-color: #fff;
      margin-bottom: 12px;

      .header-box {
        min-height: 39px;

        .title {
          line-height: 49px;
          padding-bottom: 0;
          color: #E6A23C;
          font-size: 14px;
          font-weight: 600;

          .svg-icon {
            margin-right: 4px;
          }
        }
      }

      .content-box {
        padding: 0;
      }

    }
  }
</style>
