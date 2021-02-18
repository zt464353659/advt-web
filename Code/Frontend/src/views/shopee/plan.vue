<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="Site Code" prop="accounts">
          <multiple-select-account
            ref="multipleSelectAccount"
            :options="options"
            @select-account="selectAccount"
            @clean-select="cleanSelect"
            style="width: 240px"
          ></multiple-select-account>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="listQuery.type" clearable placeholder="选择类型">
            <el-option label="全部" value="all"></el-option>
            <el-option label="计划上传" value="0"></el-option>
            <el-option label="计划删除" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="操作人" prop="operator">
          <el-input v-model="listQuery.operator" size="mini" placeholder="请输入操作人"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <!--<label class="title">计划列表</label>-->
      <el-row class="right-row">
        <el-button type="primary"
                   size="mini"
                   icon="el-icon-circle-plus-outline"
                   @click="addPlan"
                   v-permission="permissions.plan_AddThePlan"
        >
          添加计划
        </el-button>
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
        <el-table-column prop="id" label="ID" width="80" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column prop="site_code" label="Site Code" width="220"></el-table-column>
        <el-table-column prop="data" label="产品ids" min-width="200">
          <template slot-scope="scope">
            <div v-if="scope.row.data.length > 90">
              <el-popover placement="right" width="480" trigger="hover">
                <p style="line-height: 24px; font-size: 12px; word-wrap: break-word; max-height: 400px; overflow-y: auto;">{{ scope.row.data }}</p>
                <p slot="reference" class="in-a-line" style="width: 100%; color: #E6A23C; margin: 0;">{{ scope.row.data }}</p>
              </el-popover>
            </div>
            <div v-else>{{ scope.row.data }}</div>
          </template>
        </el-table-column>
        <el-table-column class="type" prop="type"
                         :render-header="renderHeaderType"
                         column-key="type"
                         width="120"
                         :filters="[{ text: '计划上传', value: '0' }, { text: '计划下架', value: '1' }, { text: '计划下架无销量', value: '2' },{ text: '计划删除无销量', value: '3' }]"
                         :filter-method="filterType"
                         filter-placement="bottom-start"
        >
          <template slot-scope="scope">
            <el-tag type="success" size="small" v-if="scope.row.type === '0'">计划上传</el-tag>
            <el-tag type="warning" size="small" v-else-if="scope.row.type === '1'">计划下架</el-tag>
            <el-tag type="danger" size="small" v-else-if="scope.row.type === '2'">计划下架无销量</el-tag>
            <el-tag type="danger" size="small" v-else-if="scope.row.type === '3'">计划删除无销量</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status"
                         :render-header="renderHeaderStatus"
                         column-key="status"
                         width="120"
                         :filters="[{ text: '未执行', value: '10' }, { text: '执行出错', value: '20' }, { text: '执行成功', value: '30' }, { text: '正在执行', value: '15' }]"
                         :filter-method="filterStatus"
                         filter-placement="bottom-start"
        >
          <template slot-scope="scope">
            <el-tag type="info" size="small" v-if="scope.row.status === '10'">未执行</el-tag>
            <el-tag type="danger" size="small" v-else-if="scope.row.status === '20'">执行出错</el-tag>
            <el-tag type="primary" size="small" v-if="scope.row.status === '15'">正在执行</el-tag>
            <el-tag type="success" size="small" v-else-if="scope.row.status === '30'">执行成功</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="操作人" width="120"></el-table-column>
        <el-table-column prop="create_time" label="操作时间" width="180" sort-by="create_time" sortable>
          <template slot-scope="scope">{{ scope.row.create_time }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button v-if="scope.row.status !== '10'" type="text" size="mini" @click="getPlanDetails(scope.row)" v-permission="permissions.plan_PlanDetails">详情</el-button>
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
    <add-form v-bind.sync="addPlanDialogOption" @reload="getList"></add-form>
    <!--计划执行详情弹窗dialog-->
    <details-form v-bind.sync="detailsPlanDialogOption"></details-form>
  </div>
</template>

<script>
import { getPlan, userSelect } from '@/api/shopee'
import addForm from './plan/addForm'
import detailsForm from './plan/detailsForm'
import multipleSelectAccount from './plan/components/multipleSelectAccount'

export default {
  name: 'Plan',
  components: { addForm, detailsForm, multipleSelectAccount },
  data() {
    return {
      permissions: {
        plan_AddThePlan: 'shopee.advt.product-upload-plan.add',//添加计划按钮
        plan_PlanDetails: 'shopee.advt.product-upload-plan.list'//详情
      },//权限
      options: [],
      newDate: new Date().getTime(),
      status: '状态 ',
      title: '类型 ',
      filterTypeIcon: 'filter',
      filterStatusIcon: 'filter',
      maxHeight: document.documentElement.clientHeight - 200,
      addPlanDialogOption: {
        data: {},
        open: false
      },
      detailsPlanDialogOption: {
        data: {},
        open: false
      },
      listData: [],
      listLoading: true,
      listQuery: {
        type: '',
        operator: '',
        page: 1,
        per_page: 10,
        accounts: []
      },
      pagination: null
    }
  },
  created() {
    this.SearchInit()
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
    // 初始化站点选项
    SearchInit() {
      const optionsParams = ['shopeeAdvtAccount']
      userSelect(optionsParams).then(response => {
        this.options = response.data.shopeeAdvtAccount
      })
    },
    // site code多选框
    selectAccount(arr) {
      this.listQuery.accounts = arr
    },
    cleanSelect() {
      this.listQuery.accounts = []
    },
    getList() {
      this.listData = []
      this.listLoading = true
      this.listQuery.operator = this.listQuery.operator.trim()
      const queryParams = this._.cloneDeep(this.listQuery)
      if (!queryParams.type) {
        queryParams.type = 'all'
      }
      getPlan(queryParams).then(response => {
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
    addPlan() {
      this.addPlanDialogOption = {
        open: true
      }
    },
    getPlanDetails(data) {
      this.detailsPlanDialogOption = {
        open: true,
        data: data
      }
    },
    clearSearch() {
      this.$refs['multipleSelectAccount'].handleCancelAllUser()
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
