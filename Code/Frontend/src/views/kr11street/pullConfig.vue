<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="平台商品号" prop="spu_id">
          <el-input size="mini" v-model="listQuery.spu_id" clearable placeholder="多个请用空格分隔"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <el-row class="right-row">
        <el-button type="primary" size="mini" icon="el-icon-circle-plus-outline" @click="handleAddPl" v-permission="permissions.add">添加平台商品号</el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <!---->
    <div class="content-box">
      <el-table
        :key="newDate"
        :data="listData"
        :max-height="maxHeight"
        v-loading="listLoading"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="70" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column prop="site_code" label="Site Code" width="100"></el-table-column>
        <el-table-column prop="data" label="平台商品号" min-width="200">
          <template slot-scope="scope">
            <div v-if="scope.row.data && scope.row.data.length > 90">
              <el-popover placement="right" width="480" trigger="hover">
                <p style="line-height: 24px; font-size: 12px; word-wrap: break-word; max-height: 400px; overflow-y: auto;">{{ scope.row.data }}</p>
                <p slot="reference" class="in-a-line" style="width: 100%; color: #E6A23C; margin: 0;">{{ scope.row.data }}</p>
              </el-popover>
            </div>
            <div v-else>{{ scope.row.data }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" align="center" width="90">
          <template slot-scope="scope">
            <el-tag type="info" size="small" v-if="Number(scope.row.status) === 0">未执行</el-tag>
            <el-tag type="success" size="small" v-else-if="Number(scope.row.status) === 1">执行成功</el-tag>
            <el-tag type="danger" size="small" v-else-if="Number(scope.row.status) === 2">执行出错</el-tag>
            <!-- <el-tag type="primary" size="small" v-else-if="Number(scope.row.status) === 30">执行中</el-tag> -->
          </template>
        </el-table-column>
        <el-table-column prop="name" label="操作人" width="100"></el-table-column>
        <el-table-column prop="start_time" label="执行时间" width="150" sort-by="start_time" sortable>
          <template slot-scope="scope" v-if="scope.row.start_time !== no_time">
            <span v-if="Number(scope.row.status)">{{ scope.row.start_time }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button v-if="Number(scope.row.status)" type="text" size="mini" @click="getPlanDetails(scope.row)" v-permission="permissions.info" v-debounce>详情</el-button>
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
    <add-spu v-bind.sync="addPlDialogOption" @reload="getList"></add-spu>
    <spu-detail v-bind.sync="detailDialogOption"></spu-detail>
  </div>
</template>

<script>
  import { apiPullAdvtList } from '@/api/kr11street'
  import { filterQueryParams } from '@/utils/help'
  import addSpu from './pullConfig/addSpu'
  import spuDetail from './pullConfig/spuDetail'
  export default {
    name: 'UserManage',
    components: { addSpu, spuDetail },
    data() {
      return {
        no_time: '1970-01-01 08:00:00',
        // 权限管理
        permissions: {
          info: 'kr11street.advt.platform-advt.get-task-log', // 详情
          add: 'kr11street.advt.platform-advt.add' // 添加计划
        },
        newDate: new Date().getTime(),
        maxHeight: document.documentElement.clientHeight - 200,
        addPlDialogOption: {
          open: false
        },
        detailDialogOption: {
          open: false,
          rowData: {}
        },
        listData: [],
        listLoading: true,
        listQuery: {
          page: 1,
          per_page: 10,
          spu_id: ''
        },
        pagination: null
      }
    },
    created() {
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
        this.listQuery.spu_id = this.listQuery.spu_id.trim()
        const queryParams = filterQueryParams(this.listQuery)
        apiPullAdvtList(queryParams).then(response => {
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
      handleAddPl() {
        this.addPlDialogOption = {
          open: true
        }
      },
      getPlanDetails(data) {
        this.detailDialogOption = {
          open: true,
          rowData: data
        }
      },
      clearSearch() {
        this.$refs.listQuery.resetFields()
        this.newDate = new Date().getTime()
        this.listQuery.page = 1
        this.listQuery.per_page = 10
        this.getList()
      },
      handleFilter() {
        this.newDate = new Date().getTime()
        this.listQuery.page = 1
        this.listQuery.per_page = 10
        this.getList()
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
