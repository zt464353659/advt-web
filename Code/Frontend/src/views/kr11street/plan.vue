<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="类型" prop="type">
          <el-select v-model="listQuery.type" clearable placeholder="选择类型">
            <el-option label="全部" value="all"></el-option>
            <el-option label="计划上传" value="0"></el-option>
            <el-option label="计划下架" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="账号" prop="site_code">
          <el-select v-model="listQuery.account_id" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="(item, key) in options.krAdvtAccount" :key="key" :label="item.site_code" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品ID" prop="istore_product_id">
          <el-input type="text" v-model="listQuery.istore_product_id" size="" placeholder="请输入istore_product_id" clearable></el-input>
        </el-form-item>
        <el-form-item label="操作人" prop="name">
          <el-input type="text" v-model="listQuery.name" size="" placeholder="请输入操作人" clearable></el-input>
        </el-form-item>
        <el-form-item label="执行时间" prop="start_time">
          <el-date-picker
            v-model="listQuery.start_time"
            class="custom-css"
            type="daterange"
            style="width: 240px"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">搜索</el-button>
          <el-button data-type="clear" @click="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <!--<label class="title">计划列表</label>-->
      <el-row class="right-row">
        <el-button type="primary" size="mini" icon="el-icon-circle-plus-outline" @click="addPlan" v-permission="permissions.add">添加计划</el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table
        :key="newDate"
        :data="listData"
        :max-height="maxHeight"
        v-loading="listLoading"
        border
        style="width: 100%"
        @filter-change="handleFilterChange"
      >
        <el-table-column prop="id" label="ID" width="60" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column prop="site_code" label="Site Code" width="100"></el-table-column>
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
        <el-table-column class="type" label="类型" prop="type" align="center" width="120">
          <template slot-scope="scope">
            <el-tag type="success" size="small" v-if="Number(scope.row.type) === 0">计划上传</el-tag>
            <el-tag type="warning" size="small" v-else-if="Number(scope.row.type) === 1">计划下架</el-tag>
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
            <el-tag type="primary" size="small" v-else-if="Number(scope.row.status) === 40">正在执行</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="操作人" width="100"></el-table-column>
        <el-table-column prop="create_time" label="操作时间" width="150" sort-by="create_time" sortable :sort-method="(a,b) => a-b">
          <template slot-scope="scope" v-if="scope.row.create_time !== no_time">{{ scope.row.create_time }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button v-if="![10].includes(Number(scope.row.status))" type="text" size="mini" @click="getPlanDetails(scope.row)" v-permission="permissions.info" v-debounce>详情</el-button>
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
          :page-sizes="[10, 20, 50, 100]"
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
  import { fetchPlanList, getSelectAll } from '@/api/kr11street'
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
          info: 'kr11street.advt.product-upload-plan.info', // 详情
          add: 'kr11street.advt.product-upload-plan.add' // 添加计划
        },
        newDate: new Date().getTime(),
        status: '状态 ',
        title: '类型 ',
        filterTypeIcon: 'filter',
        filterStatusIcon: 'filter',
        maxHeight: document.documentElement.clientHeight - 200,
        addPlanDialogOption: {
          open: false
        },
        detailsPlanDialogOption: {
          rowData: {},
          open: false
        },
        listData: [],
        listLoading: true,
        listQuery: {
          page: 1,
          per_page: 10,
          type: 'all',
          name: undefined,
          account_id: undefined,
          istore_product_id: undefined,
          start_time: []
        },
        pagination: null,
        options: {
          krAdvtAccount: []
        },
      }
    },
    created() {
      getSelectAll().then(response => {
        this.options = response.data
      })
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
        if (this.listQuery.name) {
          this.listQuery.name = this.listQuery.name.trim()
        }
        if (this.listQuery.istore_product_id) {
          this.listQuery.istore_product_id = this.listQuery.istore_product_id.trim()
        }
        const queryParams = filterQueryParams(this.listQuery)
        // if (!queryParams.type) {
        //   queryParams.type = 'all'
        // }
        sessionStorage.setItem('type', queryParams.type)
        fetchPlanList(queryParams).then(response => {
          this.listLoading = false
          this.listData = response.data.list
          this.pagination = response.data.pagination
          document.querySelector('.el-table__body-wrapper').scrollTop = 0
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
          rowData: data
        }
      },
      clearSearch() {
        this.listQuery = {
          page: 1,
          per_page: 10,
          type: 'all',
          name: undefined,
          account_id: undefined,
          istore_product_id: undefined,
          start_time: []
        }
        this.$refs.listQuery.resetFields()
        this.newDate = new Date().getTime()
        this.filterTypeIcon = 'filter'
        this.filterStatusIcon = 'filter'
        this.listQuery.page = 1
        this.listQuery.per_page = 10
        this.getList()
      },
      handleFilter() {
        this.newDate = new Date().getTime()
        this.filterTypeIcon = 'filter'
        this.filterStatusIcon = 'filter'
        this.listQuery.page = 1
        this.listQuery.per_page = 10
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
          h('svg-icon', { 'attrs': { 'icon-class': this.filterTypeIcon }})
        ])
      },
      // 筛选状态图标
      renderHeaderStatus(h, { column, $index }) {
        return h('span', [
          h('span', this.status),
          h('svg-icon', { 'attrs': { 'icon-class': this.filterStatusIcon }})
        ])
      },
      // 筛选图标处理
      handleFilterChange(type) {
        if (type.status.length === 0) {
          this.filter = 'filter'
          document.querySelector(' .el-table th>.cell>span>svg').style.color = '#c0c4cc'
        } else {
          this.filter = 'filter-in'
          document.querySelector(' .el-table th>.cell.highlight>span>svg').style.color = '#f00'
        }
      }
      // handleFilterChange(filters) {
      //   const { type, status } = filters
      //   if (!type) {
      //     if (status.length === 0) {
      //       this.filterStatusIcon = 'filter'
      //       // document.querySelector(' .el-table th:nth-child(6)>.cell>span>svg').style.color = '#c0c4cc'
      //     } else {
      //       this.filterStatusIcon = 'filter-in'
      //       // document.querySelector(' .el-table th:nth-child(6)>.cell.highlight>span>svg').style.color = '#f00'
      //     }
      //   } else if (!status) {
      //     if (type.length === 0) {
      //       this.filterTypeIcon = 'filter'
      //       // document.querySelector(' .el-table th:nth-child(5)>.cell>span>svg').style.color = '#c0c4cc'
      //     } else {
      //       this.filterTypeIcon = 'filter-in'
      //       // document.querySelector(' .el-table th:nth-child(5)>.cell.highlight>span>svg').style.color = '#f00'
      //     }
      //   }
      // }
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
<style rel="stylesheet/scss" lang="scss">
  .custom-css {
    .el-range-separator {
      margin-right: 15px !important;
    }
  }
</style>
<style rel="stylesheet/scss" lang="scss" scoped>
  .el-popover {
    max-height: 400px !important;
    overflow-y: auto !important;
  }
</style>
