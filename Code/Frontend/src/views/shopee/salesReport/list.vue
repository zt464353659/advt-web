<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="操作人" prop="user_name">
          <el-input v-model="listQuery.user_name" clearable placeholder="请输入关键字" style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item label="创建时间" prop="advtCreated">
          <el-date-picker
            v-model="listQuery.advtCreated"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="timestamp"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <el-row class="right-row">
        <el-button size="mini" type="primary" @click="searchReport">销售统计报表</el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table
        :key="newDate"
        :data="listData"
        v-loading="listLoading"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="100" align="center"></el-table-column>
        <el-table-column prop="user_name" label="操作人" align="center"></el-table-column>
        <el-table-column prop="create_time" label="操作时间" align="center" sortable>
          <template slot-scope="scope" v-if="parseInt(scope.row.create_time) > 0">{{ parseInt(scope.row.create_time) | moment('YYYY-MM-DD HH:mm') }}</template>
        </el-table-column>
        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.status">
              <el-tag type="primary" size="small" v-if="scope.row.status === 10">正在执行</el-tag>
              <el-tag type="danger" size="small" v-else-if="scope.row.status === 20">执行出错</el-tag>
              <el-tag type="success" size="small" v-else-if="scope.row.status === 30">执行成功</el-tag>
            </div>
            <p v-else>/</p>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="text" v-if="scope.row.status !== 10" size="mini" @click.stop="downloadThisData(scope.row)">下载</el-button>
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
          :page-sizes="[10, 20, 50, 100, 200]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
    <!--销售统计报表弹窗-->
    <statistical-report v-bind.sync="statisticalReportOptions" @renderList="renderList"></statistical-report>
  </div>
</template>

<script>
  import { getSalesReport } from '@/api/shopee'
  import statisticalReport from './compoment/statisticalReport'
  import { filterQueryParams } from '@/utils/help'

  export default {
    components: { statisticalReport },
    data() {
      return {
        filter: 'filter',
        uploadAction: '',
        listQuery: {
          page: 1,
          per_page: 10,
          user_name: '',
          advtCreated: []
        },
        listData: [],
        listLoading: false,
        newDate: new Date().getTime(),
        pagination: null,
        statisticalReportOptions: {
          open: false,
          data: {}
        }
      }
    },
    created() {
      this.renderList()
    },
    mounted() {
    },
    methods: {
      renderList() {
        this.listData = []
        this.listLoading = true
        this.listQuery.user_name = this._.trim(this.listQuery.user_name)
        const query = filterQueryParams(this.listQuery)
        if (query.advtCreated) {
          const query = {
            page: this.listQuery.page,
            per_page: this.listQuery.per_page,
            user_name: this.listQuery.user_name,
            start_time: this.listQuery.advtCreated[0],
            end_time: this.listQuery.advtCreated[1]
          }
          getSalesReport(query).then(res => {
            // status == 30 成功 20 失败 10 执行中
            this.listLoading = false
            this.listData = res.data.list
            this.pagination = res.data.pagination
          }).catch(err => {
            console.log(err)
            this.listLoading = false
          })
        } else {
          getSalesReport(query).then(res => {
            // status == 30 成功 20 失败 10 执行中
            this.listLoading = false
            this.listData = res.data.list
            this.pagination = res.data.pagination
          }).catch(err => {
            console.log(err)
            this.listLoading = false
          })
        }
      },
      handleFilter() {
        this.newDate = new Date().getTime()
        this.filter = 'filter'
        this.listQuery.page = 1
        this.renderList()
      },
      clearSearch() {
        this.$refs.listQuery.resetFields()
        this.newDate = new Date().getTime()
        this.filter = 'filter'
        this.renderList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.renderList()
      },
      handleSizeChange(val) {
        this.listQuery.page = 1
        this.listQuery.per_page = val
        this.renderList()
      },
      /* 下载当前数据，并导出Excel */
      downloadThisData(params) {
        const base_api = process.env.NODE_ENV === 'production' ? localStorage.getItem('BASE_API') : process.env.UPLOAD_PROXY
        this.uploadAction = base_api + 'shopee/' + params.path
        const link = document.createElement('a')
        link.href = this.uploadAction
        link.click()
      },
      searchReport() {
        this.statisticalReportOptions = {
          open: true,
          data: {}
        }
      }
    },
    filters: {},
    watch: {}
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
