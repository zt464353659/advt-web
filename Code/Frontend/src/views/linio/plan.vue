<template>
  <div class="linio-export-loading-area">
    <!-- 搜索 -->
    <div class="header-box linio-plan">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="Site Code" prop="site_id">
          <multiple-select-account ref="multipleSelectAccount" v-bind.sync="multipleSelectAccountOption" @select-account="selectAccount" @clean-select="cleanSelect"></multiple-select-account>
        </el-form-item>
        <el-form-item label="Product ID" prop="istore_product_ids">
          <el-input size="mini" v-model="listQuery.istore_product_ids" clearable placeholder="多个请用空格分隔"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="listQuery.type" clearable placeholder="请选择" style="width:100px;">
            <el-option label="计划上传" value="0"></el-option>
            <el-option label="计划下架" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="任务状态" prop="task_status">
          <el-select v-model="listQuery.task_status" clearable placeholder="请选择" style="width:100px;">
            <el-option v-for="item of statusFilter" :label="item.text" :value="item.value" :key="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="执行状态" prop="execution_status">
          <el-select v-model="listQuery.execution_status" clearable placeholder="请选择" style="width:100px;">
            <el-option v-for="item of statusFilter" :label="item.text" :value="item.value" :key="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间" prop="operate_time">
          <el-date-picker
            v-model="listQuery.operate_time"
            type="daterange"
            style="width: 220px;"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="操作人" prop="operate">
          <el-input size="mini" v-model="listQuery.operate" clearable placeholder="请填写操作人" style="width:120px;"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">搜索</el-button>
          <el-button data-type="clear" @click="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <!--<label class="title">计划列表</label>-->
      <el-row class="right-row">
        <el-button type="primary" size="mini" icon="el-icon-circle-plus-outline" @click="addPlan" v-permission="permissions.plan_AddThePlan">添加计划</el-button>
        <el-button
          v-permission="permissions.plan_export"
          type="primary"
          size="mini"
          @click="exportPlanData"
        >
          导出
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
        @selection-change="selectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="40" align="center"></el-table-column>
        <el-table-column prop="id" label="ID" width="80" sortable :sort-method="(a,b) => a-b" align="center"></el-table-column>
        <el-table-column prop="site_code" label="Site Code" width="120" align="center"></el-table-column>
        <!--<el-table-column prop="site_name" align="center" label="站点" width="120"></el-table-column>-->
        <el-table-column prop="data">
          <template slot="header" slot-scope="scope">
            <span v-if="scope" style="display:inline-block;text-align:center;width:100%;">Product ID</span>
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
        <el-table-column prop="type" width="120" label="类型" align="center">
          <template slot-scope="scope">
            <el-tag type="success" size="small" v-if="Number(scope.row.type) === 0">计划上传</el-tag>
            <el-tag type="warning" size="small" v-else-if="Number(scope.row.type) === 1">计划下架</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" width="120" label="任务状态" align="center">
          <template slot-scope="scope">
            <el-tag :type="showStatus(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="操作人" align="center" width="120"></el-table-column>
        <el-table-column prop="create_time" label="操作时间" align="center" width="180" sort-by="create_time" sortable>
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
import { fetchPlanList, getSelectAll } from '@/api/linio'
import addForm from './plan/addForm'
import detailsForm from './plan/detailsForm'
import multipleSelectAccount from './advertising/components/multipleSelectAccount'
import { filterQueryParams } from '@/utils/help'
import Cookies from 'js-cookie'
import axios from 'axios'
import qs from 'qs'

export default {
  name: 'UserManage',
  components: { addForm, detailsForm, multipleSelectAccount },
  data() {
    return {
      multipleSelectAccountOption: {
        accountArr: [],
        accountKey: 'id'
      },
      permissions: {
        plan_AddThePlan: 'linio.platform.product-upload-plan.add',//添加计划按钮
        plan_PlanDetails: 'linio.platform.product-upload-plan.info',//详情
        plan_export: 'linio.platform.product-upload-plan.export'
      },//权限
      newDate: new Date().getTime(),
      maxHeight: document.documentElement.clientHeight - 200,
      addPlanDialogOption: {
        open: false,
        options: []
      },
      detailsPlanDialogOption: {
        detailData: {},
        open: false
      },
      listData: [],
      listLoading: true,
      listQuery: {
        istore_product_ids: '',
        operate_time: [],
        type: '',
        page: 1,
        per_page: 10,
        operate: '',
        task_status: '',
        execution_status: '',
        site_id: []
      },
      pagination: null,
      statusFilter: [
        { text: '未执行', value: '10' },
        { text: '执行出错', value: '20' },
        { text: '执行成功', value: '30' },
        { text: '正在执行', value: '40' }
      ],
      options: {},
      /* 上传计划搜索条件列表 */
      selectOptions: ['LinioAdvtAccount'],
      multipleTable: []
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
    /**
     * 下载地址
     */
    getDownLoadPath() {
      const API_ADDRESS = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_BASE_API : process.env.VUE_APP_BASE_API
      return API_ADDRESS + 'linio-new/platform/product-upload-plan/export'
    },
    // linio导出
    exportPlanData() {
      let params = {}
      // 有勾选优先导出勾选数据
      if (this.multipleTable.length) {
        params = { ids: this.multipleTable.map(v => v.id).join(' ') }
      } else {
        const copyListQuery = this._.cloneDeep(this.listQuery)
        delete copyListQuery.page
        delete copyListQuery.per_page
        for (let key in copyListQuery) {
          if (Array.isArray(copyListQuery[key])) {
            if (copyListQuery[key].length) {
              params[key] = copyListQuery[key]
            }
          } else {
            if (copyListQuery[key] && String(copyListQuery[key]).trim()) {
              params[key] = copyListQuery[key]
            }
          }
        }
      }
      if (!this._.isEmpty(params)) {
        this.$confirm('确定导出？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          closeOnPressEscape: false,
          closeOnClickModal: false,
          type: 'warning'
        }).then(() => {
          if (!this.listQuery.type && !params.ids) {
            params.type = 'all'
          }
          let time = 180

          const loading = this.$loading({
            lock: true,
            text: `数据加载中...剩余 ${ time } 秒`,
            spinner: 'el-icon-loading',
            background: 'rgba(f, f, f, 0.5)',
            target: document.querySelector('.linio-export-loading-area')
          })

          const timer = setInterval(() => {
            if (time === 0) {
              clearInterval(timer)
            } else {
              --time
              loading.text = `数据加载中...剩余 ${ time } 秒`
            }
          }, 1000)
          const urlInfo = JSON.parse(Cookies.get('urlInfo'))
          axios({
            url: this.getDownLoadPath(),
            method: 'post',
            headers: {
              Authorization: `Bearer ${ urlInfo.token }`,
              systemCode: urlInfo.systemCode
            },
            data: qs.stringify(params),
            responseType: 'blob'
          }).then(res => {
            if (res.data.type.indexOf('json') === -1) {
              const file_name = res.headers['content-disposition'].split('=')[1]
              let url = window.URL.createObjectURL(new Blob([res.data]))
              let a = document.createElement('a')
              a.style.display = 'none'
              a.href = url
              a.setAttribute('download', file_name)
              document.body.appendChild(a)
              this.$message.success('导出成功')
              a.click() //执行下载
              window.URL.revokeObjectURL(a.href)
              document.body.removeChild(a)
              loading.close()
            } else {
              // 接口返回json
              const _this = this
              const reader = new FileReader()
              reader.readAsText(res.data, 'utf-8')
              reader.onload = function() {
                _this.$message.error(JSON.parse(reader.result).message)
                loading.close()
              }
            }
          }).catch((err) => {
            this.$message.error(err.message)
            loading.close()
          })
        }).catch(() => {
        })
      } else {
        this.$message.error('请输入查询条件，或勾选数据后再进行导出')
      }
    },
    selectionChange(val) {
      this.multipleTable = val
    },
    cleanSelect() {
      this.listQuery.site_id = []
    },
    selectAccount(arr) {
      this.listQuery.site_id = arr
    },
    clearAccount() {
      this.$refs.multipleSelectAccount.handleCancelAllUser()
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
      if (!queryParams.type) {
        queryParams.type = 'all'
      }
      fetchPlanList(queryParams).then(response => {
        this.listLoading = false
        this.listData = response.data.list
        this.pagination = response.data.pagination
        this.multipleTable = []
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
        options: this.options.LinioAdvtAccount
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
      this.clearAccount()
      this.getList()
    },
    handleFilter() {
      this.listQuery.page = 1
      this.newDate = new Date().getTime()
      this.getList()
    },
    searchInit() {
      getSelectAll({ keys: this.selectOptions }).then(res => {
        this.options = res.data
        this.multipleSelectAccountOption.accountArr = res.data.LinioAdvtAccount
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
<style rel="stylesheet/scss" lang="scss">
.linio-plan .el-range-separator {
  width: 10% !important;
}
</style>
