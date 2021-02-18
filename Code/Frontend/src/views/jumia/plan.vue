<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="类型" prop="type">
          <el-select v-model="listQuery.type" clearable placeholder="请选择类型">
            <el-option label="计划上传" value="0"></el-option>
            <el-option label="计划下架" value="1"></el-option>
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
      >
        <el-table-column prop="id" label="ID" width="80" sortable :sort-method="(a,b) => a-b" align="center"></el-table-column>
        <el-table-column prop="site_code" label="Site Code" width="120" align="center"></el-table-column>
        <el-table-column prop="data">
          <template slot="header" slot-scope="scope">
            <span v-if="scope" style="display:inline-block;text-align:center;width:100%;">产品 ids</span>
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
        <el-table-column prop="type" width="100" label="类型">
          <template slot-scope="scope">
            <el-tag type="success" size="small" v-if="Number(scope.row.type) === 0">计划上传</el-tag>
            <el-tag type="warning" size="small" v-else-if="Number(scope.row.type) === 1">计划下架</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" width="100" label="状态" >
          <template slot-scope="scope">
            <el-tag :type="showStatus(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="操作人" align="center" width="100"></el-table-column>
        <el-table-column prop="create_time" label="操作时间" align="center" width="150">
          <template slot-scope="scope">{{ scope.row.create_time }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="scope">
            <el-button v-if="scope.row.status !== '未执行'" type="text" size="mini" @click="getPlanDetails(scope.row)" v-permission="permissions.plan_PlanDetails">详情</el-button>
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
import { fetchPlanList, getSelectAll } from '@/api/jumia'
import addForm from './plan/addForm'
import detailsForm from './plan/detailsForm'
import { filterQueryParams } from '@/utils/help'

export default {
  name: 'UserManage',
  components: { addForm, detailsForm },
  data() {
    return {
      permissions: {
        plan_AddThePlan: 'jumia.platform.product-upload-plan.add',//添加计划按钮
        plan_PlanDetails: 'jumia.platform.product-upload-plan.info'//详情
      },//权限
      newDate: new Date().getTime(),
      maxHeight: document.documentElement.clientHeight - 200,
      addPlanDialogOption: {
        open: false,
        options: {}
      },
      detailsPlanDialogOption: {
        detailData: {},
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
        account_id: undefined
      },
      pagination: null,
      statusFilter: [{ text: '未执行', value: 10 }, { text: '执行出错', value: 20 }, { text: '执行成功', value: 30 }, { text: '正在执行', value: 40 }],
      options: {},
      /* 上传计划搜索条件列表 */
      selectOptions: ['JumiaAdvtAccount']
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
        options:this.options.JumiaAdvtAccount
      }
    },
    getPlanDetails(data) {
      this.detailsPlanDialogOption = {
        open: true,
        detailData: data
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
    searchInit() {
      getSelectAll({ keys: this.selectOptions }).then(response => {
        this.options = response.data
      })
    },
    showStatus(val) {
      let state = ''
      switch (val) {
        case '未执行':
          state = 'info'
          break
        case '正在执行':
          state = 'primary'
          break
        case '执行成功':
          state = 'success'
          break
        case '执行出错':
          state = 'danger'
          break
        default:
          state = ''
      }
      return state
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
