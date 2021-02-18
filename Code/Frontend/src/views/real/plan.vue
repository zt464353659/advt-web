<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-row class="left-row">
        <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
          <el-form-item label="Site Code" prop="account_id">
            <el-select v-model="listQuery.account_id" multiple clearable collapse-tags placeholder="选择账号" style="width: 220px">
              <el-option v-for="(item,index) in options.account"
                         :key="index"
                         :label="item.site_code"
                         :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="类型" prop="type">
            <el-select v-model="listQuery.type" clearable placeholder="选择类型">
              <el-option label="全部" value="all"></el-option>
              <el-option label="计划上传" value="0"></el-option>
              <el-option label="计划下架" value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="操作人" prop="name">
            <el-input v-model="listQuery.name" clearable placeholder="请输入操作人" style="width: 200px;"></el-input>
          </el-form-item>
          <el-form-item label="产品ID" prop="istore_product_id">
            <el-input v-model="listQuery.istore_product_id" clearable placeholder="多个请用空格分隔" style="width: 200px;"></el-input>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="listQuery.status" clearable placeholder="选择状态">
              <el-option label="未执行" value="10"></el-option>
              <el-option label="执行出错" value="20"></el-option>
              <el-option label="执行成功" value="30"></el-option>
              <el-option label="正在执行" value="40"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">搜索</el-button>
            <el-button @click="clearSearch('listQuery')">清空</el-button>
          </el-form-item>
        </el-form>
      </el-row>
      <el-row class="right-row">
        <el-button type="primary" size="mini" icon="el-icon-circle-plus-outline" @click="addPlan" v-permission="permissions.add">添加计划</el-button>
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
        <el-table-column prop="site_code" label="Site Code" width="120"></el-table-column>
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
        <!--<el-table-column class="type" prop="type"-->
        <!--:render-header="renderHeaderType"-->
        <!--column-key="type"-->
        <!--width="120"-->
        <!--:filters="[{ text: '计划上传', value: '0' }, { text: '计划下架', value: '1' }]"-->
        <!--:filter-method="filterType"-->
        <!--filter-placement="bottom-start">-->
        <el-table-column prop="data" label="类型" width="100" align="center">
          <template slot-scope="scope">
            <el-tag type="success" size="small" v-if="Number(scope.row.type) === 0">计划上传</el-tag>
            <el-tag type="warning" size="small" v-if="Number(scope.row.type) === 1">计划下架</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status"
                         :render-header="renderHeaderStatus"
                         column-key="status"
                         width="100"
                         align="center"
                         :filters="[{ text: '未执行', value: 10 }, { text: '执行出错', value: 20 }, { text: '执行成功', value: 30 }, { text: '正在执行', value: 40 }]"
                         :filter-method="filterStatus"
                         filter-placement="bottom-start"
        >
          <template slot-scope="scope">
            <el-tag type="info" size="small" v-if="Number(scope.row.status) === 10">未执行</el-tag>
            <el-tag type="danger" size="small" v-else-if="Number(scope.row.status) === 20">执行出错</el-tag>
            <el-tag type="success" size="small" v-else-if="Number(scope.row.status) === 30">执行成功</el-tag>
            <el-tag size="small" v-else-if="Number(scope.row.status) === 40">正在执行</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="操作人" width="100" align="center"></el-table-column>
        <el-table-column prop="create_time" label="操作时间" width="140" sort-by="create_time" sortable>
          <template slot-scope="scope" v-if="scope.row.create_time !== no_time">{{ scope.row.create_time }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button v-if="scope.row.status !== '10'" type="text" size="mini" @click="getPlanDetails(scope.row)" v-permission="permissions.info">详情</el-button>
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
          :page-sizes="[10, 20, 50,100]"
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
import { fetchPlanList, getSelectAll } from '@/api/real'
import addForm from './plan/addForm'
import detailsForm from './plan/detailsForm'
import { filterQueryParams } from '@/utils/help'

export default {
  name: 'UserManage',
  components: { addForm, detailsForm },
  data() {
    return {
      no_time: '1970-01-01 08:00:00',
      // 权限管理
      permissions: {
        info: 'real.advt.product-upload-plan.info', // 详情
        add: 'real.advt.product-upload-plan.create' // 添加计划
      },
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
        page: 1,
        per_page: 10,
        type: '',
        name: undefined,
        status: undefined,
        istore_product_id: undefined,//产品ID
        account_id: []//账号
      },
      options: [],
      pagination: null
    }
  },
  created() {
    this.searchItem()
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
    getList() {
      this.listLoading = true
      const queryParams = filterQueryParams(this.listQuery)
      if (!queryParams.type) {
        queryParams.type = 'all'
      }
      fetchPlanList(queryParams).then(response => {
        this.listData = response.data.list
        this.pagination = response.data.pagination
        document.querySelector('.el-table__body-wrapper').scrollTop = 0
      }).finally(_ => {
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
        open: true,
        data: {}
      }
    },
    getPlanDetails(data) {
      this.detailsPlanDialogOption = {
        open: true,
        data: data
      }
    },
    clearSearch(formName) {
      this.$refs[formName].resetFields()
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
          // document.querySelector(' .el-table th:nth-child(6)>.cell>span>svg').style.color = '#c0c4cc'
        } else {
          this.filterStatusIcon = 'filter-in'
          // document.querySelector(' .el-table th:nth-child(6)>.cell.highlight>span>svg').style.color = '#f00'
        }
      } else if (!status) {
        if (type.length === 0) {
          this.filterTypeIcon = 'filter'
          // document.querySelector(' .el-table th:nth-child(5)>.cell>span>svg').style.color = '#c0c4cc'
        } else {
          this.filterTypeIcon = 'filter-in'
          // document.querySelector(' .el-table th:nth-child(5)>.cell.highlight>span>svg').style.color = '#f00'
        }
      }
    },
    // 搜索中 sitecode,产品线,广告类型 optionArray获取
    searchItem() {
      getSelectAll().then(response => {
        this.options = response.data
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
.header-box {
  ::v-deep.el-tag {
    span {
      display: inline-block;
    }
  }
}

.el-popover {
  max-height: 400px !important;
  overflow-y: auto !important;
}
</style>
