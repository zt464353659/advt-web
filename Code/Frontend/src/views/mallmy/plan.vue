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
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <!--<label class="title">计划列表</label>-->
      <el-row class="right-row">
        <el-button type="primary" size="mini" icon="el-icon-circle-plus-outline" @click="addPlan">添加计划</el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table :key="newDate" :data="listData" v-loading="listLoading" border :max-height="maxHeight" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" sortable :sort-method="(a,b) => a-b" align="center"></el-table-column>
        <el-table-column prop="site_code" width="220">
          <template slot="header">
            <span style="display: inline-block;width: 100%;text-align: center;">Site Code</span>
          </template>
        </el-table-column>
        <el-table-column prop="data" label="产品ids" min-width="200">
          <template slot="header">
            <span style="display: inline-block;width: 100%;text-align: center;">产品ids</span>
          </template>
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
        <el-table-column prop="type" label="类型" width="120" align="center">
          <template slot-scope="scope">
            <el-tag type="success" size="small" v-if="scope.row.type === '0'">计划上传</el-tag>
            <el-tag type="warning" size="small" v-else-if="scope.row.type === '1'">计划下架</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag type="info" size="small" v-if="scope.row.status === '10'">未执行</el-tag>
            <el-tag type="danger" size="small" v-else-if="scope.row.status === '20'">执行出错</el-tag>
            <el-tag type="success" size="small" v-else-if="scope.row.status === '30'">执行成功</el-tag>
            <el-tag type="primary" size="small" v-if="scope.row.status === '40'">正在执行</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="操作人" width="120" align="center"></el-table-column>
        <el-table-column prop="create_time" label="操作时间" width="180" sort-by="create_time" sortable align="center">
          <template slot-scope="scope" v-if="parseInt(scope.row.create_time) > 0">{{ parseInt(scope.row.create_time) | moment('YYYY-MM-DD HH:mm') }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button v-if="scope.row.status !== '10'" type="text" size="mini" @click="getPlanDetails(scope.row)">详情</el-button>
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
    import { fetchPlanList } from '@/api/mallmy'
    import addForm from './plan/addForm'
    import detailsForm from './plan/detailsForm'
    import { filterQueryParams } from '@/utils/help'

    export default {
      name: 'UserManage',
      components: { addForm, detailsForm },
      data() {
        return {
          newDate: new Date().getTime(),
          maxHeight: document.documentElement.clientHeight - 200,
          addPlanDialogOption: {
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
            per_page: 10
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
          this.listData = []
          this.listLoading = true
          const queryParams = filterQueryParams(this.listQuery)
          if (!queryParams.type) {
            queryParams.type = 'all'
          }
          fetchPlanList(queryParams).then(response => {
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
          this.getList()
        },
        handleFilter() {
          this.listQuery.page = 1
          this.newDate = new Date().getTime()
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
