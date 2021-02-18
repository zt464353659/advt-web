<template>
  <div v-loading="loading" element-loading-text="拼命加载中" element-loading-background="rgba(0, 0, 0, 0.3)">
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="账号" prop="account_id">
          <el-select v-model="listQuery.account_id" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="(item, key) in options.krAdvtAccount" :key="key" :label="item.site_code" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品 ID" prop="product_id">
          <el-input v-model="listQuery.product_id" clearable placeholder="多个请用空格分隔" style="width: 200px;" @keyup.enter.native="handleFilter"></el-input>
        </el-form-item>
        <el-form-item label="옵션ID(选项ID)" prop="vendor_item_id">
          <el-input v-model.trim="listQuery.vendor_item_id" clearable placeholder="选项ID" style="width: 120px;" @keyup.enter.native="handleFilter"></el-input>
        </el-form-item>
        <el-form-item label="处理日期" prop="operate_time">
          <el-date-picker
            v-model="listQuery.operate_time"
            type="datetimerange"
            style="width: 280px;"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            format="yyyy-MM-dd HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="添加类型" prop="type">
          <el-select v-model="listQuery.type" clearable placeholder="请选择" style="width: 150px;">
            <el-option label="自动" value="0"></el-option>
            <el-option label="手动" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <el-row class="right-row">
        <!-- 状态 -->
        <el-button type="primary"
                   size="mini"
                   v-permission="permissions.add"
                   @click="handleAddWarch"
        >
          手动添加监控
        </el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table ref="listTable"
                :key="newDate"
                :data="listData"
                v-loading.lock="listLoading"
                element-loading-text="努力加载中"
                border
                style="width: 100%"
      >
        <el-table-column prop="id" label="序号" min-width="50">
          <template v-slot="scope">
            {{ scope.$index + 1 + (listQuery.page - 1) * listQuery.per_page }}
          </template>
        </el-table-column>
        <el-table-column prop="account_name" label="账号" min-width="100"></el-table-column>
        <el-table-column prop="istore_product_id" label="产品ID" min-width="100"></el-table-column>
        <el-table-column prop="vendor_item_id" label="옵션ID(选项ID)" min-width="120"></el-table-column>
        <!--draft执行情况-->
        <el-table-column prop="sales" label="30天销量" width="90" sort-by="sales" sortable></el-table-column>
        <el-table-column prop="sell_with_min_price" label="跟卖最低价" min-width="70"></el-table-column>
        <el-table-column prop="sell_with_shop_name" label="跟卖店铺名称" min-width="200"></el-table-column>
        <el-table-column prop="discount_price" label="广告在售价" min-width="80"></el-table-column>
        <el-table-column prop="operate_time" label="最新处理日期" width="160">
          <template slot-scope="scope" v-if="scope.row.operate_time !== no_time">{{ scope.row.operate_time }}</template>
        </el-table-column>
        <el-table-column prop="type" label="添加类型" align="center" min-width="60">
          <template v-slot="scope">
            {{ Number(scope.row.type) === 0 ? '自动' : '手动' }}
          </template>
        </el-table-column>
        <el-table-column prop="create_user_name" label="创建人" min-width="70"></el-table-column>
        <el-table-column prop="status" label="状态" align="center" min-width="90">
          <template v-slot="scope">
            <el-tag v-if="Number(scope.row.status) === 0" type="info" size="small">等待处理</el-tag>
            <el-tag v-if="Number(scope.row.status) === 1" type="primary" size="small">处理中</el-tag>
            <el-tag v-if="Number(scope.row.status) === 2" type="success" size="small">处理完成</el-tag>
            <el-tag v-if="Number(scope.row.status) === 3" type="danger" size="small">处理失败</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="日志" min-width="220" align="center">
          <template slot-scope="scope">
            <!-- <el-button v-if="Number(scope.row.status) === 2" type="text" size="mini" @click="handleInfo(scope.row)" v-permission="permissions.add">
              详情
            </el-button> -->
            <span v-if="scope.row.message">{{ scope.row.message }}</span>
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
    <add-watch-dialog v-bind.sync="addWatchOption" @reload="renderList"></add-watch-dialog>
    <log-info-dialog v-bind.sync="logOption"></log-info-dialog>
  </div>
</template>

<script>
import { filterQueryParams } from '@/utils/help'
import { apiGetSellList, getSelectAll } from '@/api/coupang'
import addWatchDialog from './watchFollow/addWatchDialog'
import logInfoDialog from './watchFollow/logInfoDialog'

export default {
  name: 'CoupangWatchFollow',
  components: { addWatchDialog, logInfoDialog },
  data() {
    return {
      no_time: '1970-01-01 08:00:00',
      permissions: {
        add: 'coupang.advt.sell-with.add-sell',
        viewLog: 'coupang.advt.sell-with.get-sell-log'
      },
      // 页面loading
      loading: false,

      isDisable: false,
      newDate: new Date().getTime(),

      title: '类型 ',
      filter: 'filter',
      options: {
        krAdvtAccount: []
      },

      listLoading: true,
      listData: [],
      listQuery: {
        page: 1,
        per_page: 10,
        account_id: undefined,
        product_id: undefined,
        type: undefined,
        operate_time: [],
        vendor_item_id: undefined
      },
      pagination: null,
      multipleTable: [],
      checkPickShow: true,
      // 编辑标题
      isEdit: false,
      isClickEdit: -1,
      oldProductName: '',
      addWatchOption: {
        open: false,
        data: {}
      },
      logOption: {
        open: false,
        rowData: {}
      },
      appoint: null,
      appointId: 0
    }
  },
  created() {
    this.searchItem()
    this.renderList()
  },
  methods: {
    // 搜索中 sitecode,产品线,广告类型 optionArray获取
    searchItem() {
      getSelectAll().then(response => {
        this.options = this._.assign(this.options, response.data)
      })
    },
    // 表格数据获取及状态栏
    renderList() {
      this._.forEach(this.listQuery, (v, i) => {
        if (typeof this.listQuery[i] === 'string') {
          this.listQuery[i] = this.listQuery[i].trim()
        }
      })
      this.listLoading = true
      // 接口参数处理
      const queryParams = filterQueryParams(this.listQuery)
      // 表格选择为空
      this.multipleTable = []
      this.listData = []
      apiGetSellList(queryParams).then(response => {
        this.listData = response.data.list
        this.pagination = response.data.pagination
        this.options.esAdvtStatus = response.data.statistics
        this.checkPickShow = false
        this.$nextTick(() => {
          this.checkPickShow = true
        })
        document.querySelector('.el-table__body-wrapper').scrollTop = 0
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleAddWarch() {
      this.addWatchOption = {
        open: true,
        data: {}
      }
    },
    handleInfo(row) {
      this.logOption = {
        open: true,
        rowData: row
      }
    },
    handleFilter() {
      this.newDate = new Date().getTime()
      this.filter = 'filter'
      this.listQuery.page = 1
      this.listQuery.per_page = 10
      this.renderList()
    },
    handleSizeChange(val) {
      this.listQuery.page = 1
      this.listQuery.per_page = val
      this.renderList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.renderList()
    },
    clearSearch() {
      this.$refs.listQuery.resetFields()
      this.newDate = new Date().getTime()
      this.filter = 'filter'
      this.listQuery.page = 1
      this.listQuery.per_page = 10
      this.renderList()
    }
  },
  computed: {},
  filters: {},
  watch: {}
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.advt-form-inline {
  .line {
    text-align: center;
  }
}

.product_name {
  position: relative;
  padding-right: 20px;

  &:hover {
    .el-icon-edit {
      display: block;
    }
  }

  .el-icon-edit {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    margin: auto;
  }
}

.el-icon-edit {
  display: none;
}
</style>
<style rel="stylesheet/scss" lang="scss">
.el-input.is-disabled.advtlist-disable .el-input__inner {
  color: #606266;
  cursor: not-allowed !important;
}
</style>

