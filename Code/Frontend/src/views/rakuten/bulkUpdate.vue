<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="账号" prop="account_id">
          <multiple-select-account ref="multipleSelectAccount" v-bind.sync="multipleSelectAccountOption" @select-account="selectAccount" @clean-select="cleanSelect"></multiple-select-account>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="listQuery.type" clearable placeholder="请选择类型">
            <el-option label="取消更新" value="2"></el-option>
            <el-option label="批量更新" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status" width="100">
          <el-select v-model="listQuery.status" clearable placeholder="请选择执行状态">
            <el-option v-for="item of statusFilter" :label="item.text" :value="item.value" :key="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="操作人" prop="operate">
          <el-input size="mini" v-model="listQuery.operate" clearable placeholder="请填写操作人"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <!--<label class="title">计划列表</label>-->
      <el-row class="right-row">
        <el-button v-permission="permissions.upload_file" type="primary" size="mini" @click="addBulk">导入</el-button>
        <el-dropdown size="mini" split-button type="primary" @command="downloadTemplete">
          模板下载
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="update">批量更新模板</el-dropdown-item>
            <el-dropdown-item command="cancel">取消更新模板</el-dropdown-item>
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
        :max-height="maxHeight"
        style="width: 100%"
        @filter-change="handleFilterChange"
      >
        <el-table-column type="index" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="account" label="账号" width="120" align="center"></el-table-column>
        <el-table-column prop="data" label="产品 ID" min-width="200">
          <template slot-scope="scope">
            <div v-if="scope.row.data.length > 70">
              <el-popover placement="right" width="480" trigger="hover">
                <p style="line-height: 24px; font-size: 12px; word-wrap: break-word; max-height: 400px; overflow-y: auto;">{{ scope.row.data }}</p>
                <p slot="reference" class="in-a-line" style="width: 100%; color: #E6A23C; margin: 0;">{{ scope.row.data }}</p>
              </el-popover>
            </div>
            <div v-else>{{ scope.row.data }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100" align="center">
          <template slot-scope="scope">
            <el-tag type="warning" size="small" v-if="scope.row.type === 2">取消更新</el-tag>
            <el-tag type="success" size="small" v-else-if="scope.row.type === 1">批量更新</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="更新字段类型" width="350"></el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag type="info" size="small" v-if="Number(scope.row.status) === 10">未执行</el-tag>
            <el-tag type="primary" size="small" v-else-if="Number(scope.row.status) === 20">正在执行</el-tag>
            <el-tag type="success" size="small" v-else-if="Number(scope.row.status) === 30">执行成功</el-tag>
            <el-tag type="danger" size="small" v-else-if="Number(scope.row.status) === 40">执行出错</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="操作人" width="120" align="center"></el-table-column>
        <el-table-column prop="create_time" label="操作时间" width="180" sort-by="create_time" align="center">
          <template slot-scope="scope">{{ scope.row.create_time }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button v-if="Number(scope.row.status) !== 10" type="text" size="mini" @click="getPlanDetails(scope.row)" v-permission="permissions.plan_PlanDetails">详情</el-button>
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
    <!--计划执行详情弹窗dialog-->
    <details-form v-bind.sync="detailsPlanDialogOption"></details-form>
    <!--添加批量更新弹窗-->
    <add-bulk-update v-bind.sync="addBulkDialogOption" @reload="getList"></add-bulk-update>
  </div>
</template>

<script>
import { getMoreUpdateList, getSelectAll } from '@/api/rakuten'
import detailsForm from '@/views/rakuten/bulkUpdate/detailsForm'
import addBulkUpdate from '@/views/rakuten/bulkUpdate/addBulkUpdate'
import multipleSelectAccount from '@/views/rakuten/bulkUpdate/multipleSelectAccount'
import { filterQueryParams } from '@/utils/help'
import { downloadExcelTemplate } from '@/views/rakuten/export'

export default {
  name: 'UserManage',
  components: { detailsForm, addBulkUpdate, multipleSelectAccount },
  data() {
    return {
      multipleSelectAccountOption: {
        accountArr: [],
        accountKey: 'id'
      },
      permissions: {
        plan_AddThePlan: 'rakuten.schedule.product-schedule.add',// 添加计划按钮
        plan_PlanDetails: 'rakuten.schedule.product-schedule.info',// 详情
        plan_export: 'rakuten.schedule.product-schedule.export-list',// 导出
        upload_file: 'rakuten.schedule.update-schedule.import' // 批量更新
      },//权限
      newDate: new Date().getTime(),
      status: '状态 ',
      title: '类型 ',
      filterTypeIcon: 'filter',
      filterStatusIcon: 'filter',
      maxHeight: document.documentElement.clientHeight - 200,
      addPlanDialogOption: {
        addData: {},
        open: false
      },
      addBulkDialogOption: {
        addData: {},
        open: false
      },
      detailsPlanDialogOption: {
        rowData: {},
        open: false
      },
      listData: [],
      listLoading: true,
      listQuery: {
        type: '',
        page: 1,
        per_page: 10,
        operate: '',
        status: undefined,
        account_id: []
      },
      pagination: null,
      // typeFilter: [{ text: '计划上传', value: 0 }, { text: '计划下架', value: 1 }],
      statusFilter: [{ text: '未执行', value: 10 }, { text: '正在执行', value: 20 }, { text: '执行成功', value: 30 }, { text: '执行出错', value: 40 }],
      options: {}
    }
  },
  created() {
    this.getList()
    this.searchInit()
    this.maxHeight = this.maxHeight < 200 ? 200 : this.maxHeight
  },
  mounted() {
    this.resize()
  },
  methods: {
    cleanSelect() {
      this.$refs['listQuery'].resetFields()
    },
    selectAccount(arr) {
      this.listQuery.account_id = arr
    },
    clearAccount() {
      this.$refs.multipleSelectAccount.handleCancelAllUser()
    },
    downloadTemplete(val) {
      let arr = ['PRODUCT_ID']
      let title = 'Rakuten-取消更新'
      if (val === 'update') {
        arr = ['PRODUCT_ID', 'TITLE', 'CATCH_COPY_FOR_PC', 'CATCH_COPY_FOR_MOBILE', 'PRICE']
        title = 'Rakuten-批量更新'
      }
      downloadExcelTemplate(title, arr)
    },
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
      this.listQuery.operate = this.listQuery.operate.trim()
      const queryParams = filterQueryParams(this.listQuery)

      getMoreUpdateList(queryParams).then(response => {
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
    addBulk() {
      this.addBulkDialogOption = {
        open: true,
        addData: {}
      }
    },
    getPlanDetails(data) {
      this.detailsPlanDialogOption = {
        open: true,
        rowData: data
      }
    },
    clearSearch() {
      this.$refs.listQuery.resetFields()
      this.newDate = new Date().getTime()
      this.filterTypeIcon = 'filter'
      this.filterStatusIcon = 'filter'
      this.clearAccount()
      this.getList()
    },
    handleFilter() {
      this.listQuery.page = 1
      this.newDate = new Date().getTime()
      this.filterTypeIcon = 'filter'
      this.filterStatusIcon = 'filter'
      this.getList()
    },
    //  上架筛选
    filterType(value, row) {
      return row.type === value
    },
    // 状态筛选
    filterStatus(value, row) {
      return row.status === value
    },
    // 筛选类型图标
    renderHeaderType(h, { column, $index }) {
      return h('span', [
        h('span', this.title),
        h('svg-icon', { 'attrs': { 'icon-class': this.filterTypeIcon } })
      ])
    },
    // 筛选状态图标
    renderHeaderStatus(h, { column, $index }) {
      return h('span', [
        h('span', this.status),
        h('svg-icon', { 'attrs': { 'icon-class': this.filterStatusIcon } })
      ])
    },
    // 筛选图标处理
    handleFilterChange(filters) {
      const { type, status } = filters
      if (!type) {
        if (status.length === 0) {
          this.filterStatusIcon = 'filter'
          document.querySelector(' .el-table th:nth-child(5)>.cell>span>svg').style.color = '#c0c4cc'
        } else {
          this.filterStatusIcon = 'filter-in'
          document.querySelector(' .el-table th:nth-child(5)>.cell.highlight>span>svg').style.color = '#f00'
        }
      } else if (!status) {
        if (type.length === 0) {
          this.filterTypeIcon = 'filter'
          document.querySelector(' .el-table th:nth-child(4)>.cell>span>svg').style.color = '#c0c4cc'
        } else {
          this.filterTypeIcon = 'filter-in'
          document.querySelector(' .el-table th:nth-child(4)>.cell.highlight>span>svg').style.color = '#f00'
        }
      }
    },
    searchInit() {
      getSelectAll().then(response => {
        this.options = response.data
        this.multipleSelectAccountOption.accountArr = response.data.account
      })
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
