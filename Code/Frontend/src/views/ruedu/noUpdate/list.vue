<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="Site Code" prop="account_id">
          <el-select v-model="listQuery.account_id" clearable placeholder="选择类型">
            <el-option
              v-for="item in accountOptions"
              :key="item.id"
              :label="item.account"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <!--<label class="title">计划列表</label>-->
      <el-row class="right-row">
        <el-button type="primary" size="mini" @click="addTask" v-permission="permissions.plan_AddThePlan">添加任务</el-button>
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
        <el-table-column prop="id" label="ID" width="50" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column prop="site_code" label="Site Code" min-width="200"></el-table-column>
        <el-table-column prop="num" label="广告数" min-width="100"></el-table-column>
        <el-table-column prop="end_time" label="结束时间" min-width="100"></el-table-column>
        <el-table-column prop="username" label="操作人" min-width="100"></el-table-column>
        <el-table-column prop="create_time" label="操作时间" width="150"></el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="getPlanDetails(scope.row)" v-permission="permissions.plan_PlanDetails">广告</el-button>
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
    <add-form v-bind.sync="addTaskDialogOption" @reload="getList"></add-form>
    <!--计划执行详情弹窗dialog-->
    <details-form v-bind.sync="detailsPlanDialogOption"></details-form>
  </div>
</template>

<script>
  import { updateSettingList, getSelectAll } from '@/api/ruedu'
  import addForm from './components/addForm'
  import detailsForm from '../plan/detailsForm'
  import { filterQueryParams } from '@/utils/help'

  export default {
    name: 'Plan',
    components: { addForm, detailsForm },
    data() {
      return {
        permissions:{
          plan_AddThePlan:"rueducommerce.advt.setting.add-task",//添加任务
          plan_PlanDetails:"rueducommerce.advt.setting.info"//详情
        },//权限
        newDate: new Date().getTime(),
        status: '状态 ',
        title: '类型 ',
        filterTypeIcon: 'filter',
        filterStatusIcon: 'filter',
        maxHeight: document.documentElement.clientHeight - 200,
        addTaskDialogOption: {
          open: false
        },
        detailsPlanDialogOption: {
          data: {},
          open: false
        },
        listData: [],
        listLoading: true,
        listQuery: {
          page: 1,
          per_page: 10,
          account_id: ''
        },
        pagination: null,
        accountOptions: []
      }
    },
    created() {
      this.searchInit()
      this.getList()
      this.maxHeight = this.maxHeight < 200 ? 200 : this.maxHeight
    },
    mounted() {
      const that = this
      window.onresize = () => {
        return (() => {
          window.maxHeight = document.documentElement.clientHeight - 200
          that.maxHeight = window.maxHeight < 200 ? 200 : window.maxHeight
        })()
      }
    },
    methods: {
      searchInit() {
        const arr = ['rueduAccounts']
        getSelectAll(arr).then(res => {
          this.accountOptions = res.data.rueduAccounts
        })
      },
      getList() {
        this.listData = []
        this.listLoading = true
        const queryParams = filterQueryParams(this._.cloneDeep(this.listQuery))
        updateSettingList(queryParams).then(response => {
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
        this.addTaskDialogOption = {
          open: true
        }
      },
      getPlanDetails(data) {
        this.$router.push(`/ruedu/noUpdate/detail/${data.id}/${new Date(data.end_time).getTime()}`)
      },
      clearSearch() {
        this.$refs.listQuery.resetFields()
        this.newDate = new Date().getTime()
        this.filterTypeIcon = 'filter'
        this.filterStatusIcon = 'filter'
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
      }
    },
    watch: {
      maxHeight(val) {
        if (!this.timer) {
          this.maxHeight = val
          this.timer = true
          const that = this
          setTimeout(function () {
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
