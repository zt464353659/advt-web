<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="Site Code" prop="site_code">
          <el-select v-model="listQuery.site_code" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="item in options" :key="item.id" :label="item.site_code" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Product ID" prop="product_id">
          <el-input size="mini" v-model="listQuery.product_id" clearable placeholder="多个请用逗号分隔"></el-input>
        </el-form-item>
        <el-form-item label="不更新类型" prop="no_update_type">
          <el-select v-model="listQuery.no_update_type" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="item of updateOptions" :label="item.label" :value="item.key" :key="item.key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="广告类型" prop="advt_type">
          <el-checkbox-group v-model="listQuery.advt_type">
            <el-checkbox-button v-for="advtType in advtTypeOptions" :label="advtType.key" :key="advtType.key">{{ advtType.label }}</el-checkbox-button>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <!--<label class="title">计划列表</label>-->
      <el-row class="right-row">
        <el-button type="danger" size="mini" :disabled="!selectData.length" @click="cancleNoUpdate" v-permission="permissions.cancle">批量取消不更新</el-button>
        <el-button type="primary" size="mini" @click="addNoUpdate" v-permission="permissions.add">添加指定产品</el-button>
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
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="account">
          <template slot="header">
            <span style="display: inline-block;width: 100%;text-align: center;">Site Code</span>
          </template>
        </el-table-column>
        <el-table-column prop="istore_product_id" label="Product ID" align="center"></el-table-column>
        <el-table-column prop="product_type" label="类型" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.advt_type === '1' ? 'success' : ''" size="small">{{ scope.row.advt_type === '1' ? 'Normal' : 'Variation' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="product_type" width="400">
          <template slot="header">
            <span style="display: inline-block;width:100%;text-align: center;">不更新类型</span>
          </template>
          <template slot-scope="scope">
            <span v-for="(item, index) of scope.row.type" style="margin-right:8px;" :key="index">{{ item | getTypeLabel(updateOptions) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="操作人" align="center"></el-table-column>
        <el-table-column prop="create_time" label="操作时间" align="center">
          <template slot-scope="scope" v-if="parseInt(scope.row.update_time) > 0">{{ parseInt(scope.row.update_time) | moment('YYYY-MM-DD HH:mm') }}</template>
        </el-table-column>
        <el-table-column prop="remark">
          <template slot="header">
            <span style="display: inline-block;width:100%;text-align: center;">备注</span>
          </template>
          <template slot-scope="scope">
            <span>{{ scope.row.remark }}</span>
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
    <!--添加指定不更新产品-->
    <add-form v-bind.sync="addNoUpdateProduct" @reload="getList"></add-form>
  </div>
</template>

<script>
  import { getSelectAll, productUpdateList, cancleProductNoUpdate } from '@/api/mallmy'
  import addForm from './noUpdate/addNoUpdate'
  import { filterQueryParams } from '@/utils/help'

  export default {
    name: 'UserManage',
    components: { addForm },
    data() {
      return {
        permissions: {
          cancle: 'mallmy.product-filter.product-filter.cancel-filter',
          add: 'mallmy.product-filter.product-filter.product-filter-update'
        },
        newDate: new Date().getTime(),
        status: '状态 ',
        title: '类型 ',
        filterTypeIcon: 'filter',
        filterStatusIcon: 'filter',
        maxHeight: document.documentElement.clientHeight - 200,
        addNoUpdateProduct: {
          accountOptions: [],
          open: false
        },
        listData: [],
        updateOptions: [
          { key: 1, label: '价格' },
          { key: 2, label: '库存' },
          { key: 3, label: '标题' },
          { key: 4, label: '描述' },
          { key: 5, label: '图片' },
          { key: 6, label: '重量' },
          { key: 7, label: '线上运输方式' }],
        options: [],
        advtTypeOptions: [],
        listLoading: false,
        listQuery: {
          site_code: '',
          product_id: '',
          no_update_type: '',
          advt_type: [],
          page: 1,
          per_page: 10
        },
        pagination: null,
        selectData: []
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
        const optionsParams = ['MallMyAdvtAccount', 'MallMyAdvtTypes']
        getSelectAll(optionsParams).then(response => {
          this.options = response.data.MallMyAdvtAccount
          this.advtTypeOptions = response.data.MallMyAdvtTypes
        })
      },
      getList() {
        this.listData = []
        this.listLoading = true
        const queryParams = filterQueryParams(this.listQuery)
        productUpdateList(queryParams).then(response => {
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
      addNoUpdate() {
        this.addNoUpdateProduct = {
          open: true,
          accountOptions: this.options
        }
      },
      getPlanDetails(data) {
        this.detailsPlanDialogOption = {
          open: true,
          data: data
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
      },
      // 表格多选
      handleSelectionChange(val) {
        this.selectData = val
      },
      // 批量取消不更新
      cancleNoUpdate() {
        let filter_ids = []
        this._.map(this.selectData, item => {
          filter_ids = filter_ids.concat(item.filter_ids)
        })
        const data = {
          filter_ids,
          user_id: parseInt(this.$store.state.user.info.id),
          user_name: this.$store.state.user.info.name,
          status: 0
        }
        this.$confirm('确定要取消不更新吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          closeOnClickModal: false,
          closeOnPressEscape: false,
          type: 'warning'
        }).then(() => {
          // 调用接口
          cancleProductNoUpdate(data).then(() => {
            this.getList()
          })
        }).catch(() => {
        })
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
    },
    filters: {
      getTypeLabel(val, updateOptions) {
        const types = updateOptions
        let label = ''
        if (types) {
          types.forEach((v) => {
            if (v.key === parseInt(val)) {
              label = v.label
            }
          })
        }
        return label
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
