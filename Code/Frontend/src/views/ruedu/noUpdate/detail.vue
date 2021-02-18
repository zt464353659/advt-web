<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="Product ID" prop="product_id">
          <el-input v-model="listQuery.product_id" size="mini" clearable placeholder="多个用空格分隔"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="listQuery.status" size="mini" clearable placeholder="请选择">
            <el-option value="1" label="价格不更新"></el-option>
            <el-option value="0" label="取消不更新"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <!--<label class="title">计划列表</label>-->
      <el-row class="right-row">
        <el-button type="danger" size="mini" :disabled="!multipleTable.length || invalid_time" @click="changeStatus('more')" v-permission="permissions.noUpdate">批量取消不更新</el-button>
        <el-button type="danger" size="mini" :disabled="invalid_time" @click="changeStatus('all')" v-permission="permissions.noUpdate">全部取消不更新</el-button>
        <el-button type="primary" size="mini" @click="addTask" :disabled="invalid_time" v-permission="permissions.add">添加广告</el-button>
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection"></el-table-column>
        <el-table-column prop="index" label="序号" width="80"></el-table-column>
        <el-table-column prop="site_code" label="Site Code"></el-table-column>
        <el-table-column prop="product_id" label="Product ID"></el-table-column>
        <el-table-column prop="status" label="状态">
          <template slot-scope="scope">
            <el-tag :type="Number(scope.row.status) === 1 ? 'success' : 'primary'">{{ Number(scope.row.status) === 1? '价格不更新' : '取消不更新' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="changeStatus('single',scope.row)" :disabled="invalid_time" v-permission="permissions.noUpdate">{{ Number(scope.row.status) === 1? '取消不更新' : '设置不更新' }}</el-button>
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
    <add-product v-bind.sync="addProductOption" @reload="getList"></add-product>
  </div>
</template>

<script>
  import { updateSettingDetail, getSelectAll, addUpdateProductUpdate } from '@/api/ruedu'
  import addProduct from './components/addProduct'
  import { filterQueryParams } from '@/utils/help'

  export default {
    name: 'Plan',
    components: { addProduct },
    data() {
      return {
        newDate: new Date().getTime(),
        end_time: this.$route.params.end_time,
        status: '状态 ',
        title: '类型 ',
        filterTypeIcon: 'filter',
        filterStatusIcon: 'filter',
        maxHeight: document.documentElement.clientHeight - 200,
        addProductOption: {
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
          product_id: '',
          status: ''
        },
        pagination: null,
        accountOptions: [],
        multipleTable: [],
        invalid_time: false,
        task_info: {},
        permissions: {
          noUpdate: 'rueducommerce.advt.setting.set-update',
          add: 'rueducommerce.advt.setting.add-product'
        }
      }
    },
    created() {
      this.searchInit()
      this.getList()
      this.maxHeight = this.maxHeight < 200 ? 200 : this.maxHeight
      this.invalid_time = !(Number(this.$route.params.end_time) > new Date().getTime())
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
      handleSelectionChange(val) {
        this.multipleTable = val
      },
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
        queryParams.id = this.$route.params.id
        this.multipleTable = []
        updateSettingDetail(queryParams).then(response => {
          this.listLoading = false
          const task_log = response.data.list.task_log
          const task = response.data.list.task
          this.task_info = task
          const that = this
          task_log.forEach((v,ind) => {
            v.site_code = task.site_code
            v.account_id = task.account_id
            v.index = (that.listQuery.page-1)*10 + (ind + 1)
          })
          this.listData = task_log
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
        this.addProductOption = {
          open: true,
          baseData: this.task_info
        }
      },
      changeStatus(type, data) {
        let obj = {}
        // 全部取消
        if (type === 'all') {
          obj = {
            is_all: 1,
            task_id: this.task_info.id,
            status: 0
          }
        }
        // 选中批量取消
        if (type === 'more') {
          obj = {
            log_ids: this.multipleTable.map(v => v.id),
            status: 0
          }
        }
        if (JSON.stringify(obj) !== '{}') {
          addUpdateProductUpdate(obj).then(() => {
            this.getList()
          })
        }
        // 单独设置、取消
        if (type === 'single') {
          const status = Number(data.status)
          const tip = status ? '确定要取消不更新吗？' : '确定要设置不更新吗？'
          this.$confirm(tip, '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              closeOnClickModal: false,
              closeOnPressEscape: false,
              type: 'warning'
            }).then(() => {
            obj = {
              log_ids: [data.id],
              status: status ? 0 : 1
            }
            addUpdateProductUpdate(obj).then(() => {
              this.getList()
            })
          }).catch(() => {
          })
        }
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
