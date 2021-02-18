<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="账号" prop="account_id">
          <el-select v-model="listQuery.account_id" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="item in options.MercadoLibreAdvtAccount" :key="item.id" :label="item.site_code" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="listQuery.type" clearable placeholder="选择类型">
            <el-option label="设置指定价" value="1"></el-option>
            <el-option label="取消指定价" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <el-row class="right-row">
        <el-button type="primary" size="mini" @click="addTask" v-permission="permissions.customPrice_customSetPrice">指定价</el-button>
        <el-dropdown
          size="mini"
          split-button
          trigger="click"
          type="primary"
          @command="handleTemplateDownload"
        >
          模板下载
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="setCustomPrice">下载设置指定价模板</el-dropdown-item>
            <el-dropdown-item command="cancelCustomPrice">下载取消指定价模板</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table
        :key="newDate"
        :data="listData"
        v-loading="listLoading"
        border
        empty-text="暂无纪录"
        :max-height="maxHeight"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" align="center"></el-table-column>
        <el-table-column prop="account_name" align="center">
          <template slot="header">
            <span style="display: inline-block;width: 100%;text-align: center;">账号</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" align="center">
          <template slot-scope="scope">
            <el-tag :type="Number(scope.row.type) === 1 ? 'success':'warning'" size="small">
              {{ Number(scope.row.type) === 1 ? '设置指定价' : '取消指定价' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          column-key="status"
          align="center"
        >
          <template slot="header">
            <span style="width: 100%;display: inline-block;text-align: center;">状态</span>
          </template>
          <template slot-scope="scope">
            <el-tag type="info" size="small" v-if="Number(scope.row.status) === 10">未执行</el-tag>
            <el-tag type="danger" size="small" v-else-if="Number(scope.row.status) === 20">执行出错</el-tag>
            <el-tag type="success" size="small" v-else-if="Number(scope.row.status) === 30">执行成功</el-tag>
            <el-tag type="primary" size="small" v-else-if="Number(scope.row.status) === 40">执行中</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="操作人" align="center"></el-table-column>
        <el-table-column prop="create_time" label="操作时间" sort-by="create_time" align="center"></el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button v-if="Number(scope.row.status) !== 10"
                       type="text"
                       size="mini"
                       @click="handleCustomPriceDetails(scope.row)"
                       v-permission="permissions.customPrice_customPricedetail"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper" small
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="listQuery.page"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
    <!--添加计划弹窗dialog-->
    <set-custom-price v-bind.sync="addTaskDialog" @reload="getList"></set-custom-price>
    <!--计划执行详情弹窗dialog-->
    <custom-price-detail v-bind.sync="getCustomPriceDetails"></custom-price-detail>
  </div>
</template>

<script>
import { getCustomPriceList, getSelectAll } from '@/api/mercadolibre.gs'
import setCustomPrice from './customPrice/setCustomPrice'
import customPriceDetail from './customPrice/customPriceDetail'
import { filterQueryParams } from '@/utils/help'
import { downloadCustomPriceTemplate } from './export'

export default {
  name: 'UserManage',
  components: { setCustomPrice, customPriceDetail },
  data() {
    return {
      permissions: {
        customPrice_customSetPrice: 'mercadolibre.advt.batch-custom-price.add',//批量添加指定价
        customPrice_customPricedetail: 'mercadolibre.advt.batch-custom-price.detail'//批量更新指定价详情
      },//权限
      options: {},
      newDate: new Date().getTime(),
      maxHeight: document.documentElement.clientHeight - 200,
      addTaskDialog: {
        open: false,
        options: {}
      },
      getCustomPriceDetails: {
        rowData: {},
        open: false
      },
      listData: [],
      listLoading: true,
      listQuery: {
        type: '',
        page: 1,
        per_page: 10,
        account_id: ''
      },
      pagination: null,
      downloadTemplate: {
        setCustomPrice: ['istore_product_id', 'custom_price'],
        cancelCustomPrice: ['istore_product_id']
      }
    }
  },
  created() {
    this.searchInit()
    this.getList()
    this.maxHeight = this.maxHeight < 200 ? 200 : this.maxHeight
  },
  mounted() {
    this.resize()
  },
  methods: {
    resize() {
      const that = this
      window.onresize = () => {
        return (() => {
          window.maxHeight = document.documentElement.clientHeight - 200
          that.maxHeight = window.maxHeight < 200 ? 200 : window.maxHeight
        })()
      }
    },
    getList() {
      this.listData = []
      this.listLoading = true
      const queryParams = filterQueryParams(this.listQuery)
      getCustomPriceList(queryParams).then(response => {
        this.listLoading = false
        this.listData = response.data.list
        this.pagination = response.data.pagination
        document.querySelector('.el-table__body-wrapper').scrollTop = 0
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleSizeChange(val) {
      this.listQuery.page = 1
      this.listQuery.per_page = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    addTask() {
      this.addTaskDialog = {
        open: true,
        options: this.options
      }
    },
    handleCustomPriceDetails(data) {
      this.getCustomPriceDetails = {
        open: true,
        rowData: data
      }
    },
    clearSearch() {
      this.$refs.listQuery.resetFields()
      this.newDate = new Date().getTime()
      this.getList()
    },
    handleFilter() {
      this.listQuery.page = 1
      this.newDate = new Date().getTime()
      this.getList()
    },
    // 获取搜索 account、site_code
    searchInit() {
      const optionsParams = ['MercadoLibreAdvtAccount', 'MercadoLibreGetCountry']
      getSelectAll(optionsParams).then(response => {
        this.options = response.data
      })
    },
    handleTemplateDownload(command) {
      downloadCustomPriceTemplate(command, this.downloadTemplate[command])
    }
  },
  watch: {
    maxHeight(val) {
      if (!this.timer) {
        this.maxHeight = val
        this.timer = true
        const that = this
        setTimeout(function() {
          that.timer = false
        }, 400)
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.el-popover {
  max-height: 400px !important;
  overflow-y: auto !important;
}

</style>
