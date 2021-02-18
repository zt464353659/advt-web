<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="Site Code" prop="accountId">
          <multiple-select-account ref="multipleSelectAccount" v-bind.sync="multipleSelectAccountOption" @select-account="selectAccount" @clean-select="cleanSelect"></multiple-select-account>
        </el-form-item>
        <el-form-item label="自动上传广告状态" prop="isAutoUpload">
          <el-select v-model="listQuery.isAutoUpload" clearable placeholder="请选择">
            <el-option label="禁用" value="0"></el-option>
            <el-option label="启用" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="库存类型" prop="customStockType">
          <el-select v-model="listQuery.customStockType" clearable placeholder="请选择">
            <el-option label="实际库存" value="0"></el-option>
            <el-option label="虚拟库存" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
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
        <el-table-column prop="site_code" label="Site Code" align="center"></el-table-column>
        <el-table-column label="自动上传广告" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.is_auto_upload">
              <el-tag type="danger" size="small" v-if="scope.row.is_auto_upload === '0'">禁用</el-tag>
              <el-tag type="success" size="small" v-else-if="scope.row.is_auto_upload === '1'">启用</el-tag>
            </div>
            <p v-else>/</p>
          </template>
        </el-table-column>
        <el-table-column label="自动更新预购天数" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.is_auto_dts">
              <el-tag type="danger" size="small" v-if="scope.row.is_auto_dts === '0'">禁用</el-tag>
              <el-tag type="success" size="small" v-else-if="scope.row.is_auto_dts === '1'">启用</el-tag>
            </div>
            <p v-else>/</p>
          </template>
        </el-table-column>
        <el-table-column label="无销量自动下架" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.is_auto_offline">
              <el-tag type="danger" size="small" v-if="scope.row.is_auto_offline === '0'">禁用</el-tag>
              <el-tag type="success" size="small" v-else-if="scope.row.is_auto_offline === '1'">启用</el-tag>
            </div>
            <p v-else>/</p>
          </template>
        </el-table-column>
        <el-table-column label="库存类型" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.is_custom_stock">
              <el-tag type="primail" size="small" v-if="scope.row.is_custom_stock === '0'">实际库存</el-tag>
              <el-tag type="warning" size="small" v-else-if="scope.row.is_custom_stock === '1'">虚拟库存</el-tag>
            </div>
            <p v-else>/</p>
          </template>
        </el-table-column>
        <el-table-column label="异仓验证" align="center">
          <template slot-scope="scope">
            <!-- 虚拟库存展示是否异仓 tag -->
            <div v-if="scope.row.is_foreign_warehouse && scope.row.is_custom_stock === '1'">
              <el-tag type="danger" size="small" v-if="scope.row.is_foreign_warehouse === '0'">否</el-tag>
              <el-tag type="success" size="small" v-else-if="scope.row.is_foreign_warehouse === '1'">是</el-tag>
            </div>
            <p v-else></p>
          </template>
        </el-table-column>
        <el-table-column prop="limit_num" label="每日推送数量" align="center"></el-table-column>
        <el-table-column prop="update_time" label="更新时间" align="center" sortable>
          <template slot-scope="scope" v-if="parseInt(scope.row.update_time) > 0">{{ parseInt(scope.row.update_time) | moment('YYYY-MM-DD HH:mm') }}</template>
        </el-table-column>
        <el-table-column prop="user_name" label="操作人员" align="center"></el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openautoupload(scope.row)" v-permission="permissions.automaticUpload_doAutoUpload">修改自动上传配置</el-button>
            <el-button type="text" size="mini" @click="handleSetShopCol(scope.row)" v-permission="permissions.automaticUpload_doAutoUpload">修改店铺配置</el-button>
            <el-button type="text" size="mini" @click="configuration(scope.row)" v-permission="permissions.automaticUpload_doCustomStock">库存配置</el-button>
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
    <!--库存配置dialog-->
    <inventory-configuration v-bind.sync="configurationDialogOption" @reload="renderInit"></inventory-configuration>
    <!-- 店铺配置dialog -->
    <shop-set-dialog v-bind.sync="shopSetDialogOption" @reload="renderInit"></shop-set-dialog>
    <!--  修改自动上传配置  -->
    <setAutoUploadConfig v-bind.sync="autoupload" @reload="renderInit"></setAutoUploadConfig>
  </div>
</template>

<script>
import { automatic, storeDisabled, addPlanAccount } from '@/api/shopee'
import { filterQueryParams } from '@/utils/help'
import setAutoUploadConfig from './components/setAutoUploadConfig'
import multipleSelectAccount from './components/multipleSelectAccount'
import InventoryConfiguration from './components/InventoryConfiguration'
import shopSetDialog from './components/shopSetDialog'

export default {
  components: { multipleSelectAccount, InventoryConfiguration, shopSetDialog, setAutoUploadConfig },
  data() {
    return {
      permissions: {
        automaticUpload_doAutoUpload: 'shopee.account.automatic-upload.do-auto-upload',//修改店铺配置
        automaticUpload_doCustomStock: 'shopee.account.automatic-upload.do-custom-stock'//库存配置
      },//权限
      filter: 'filter',
      listQuery: {
        page: 1,
        per_page: 10,
        isAutoUpload: undefined,
        customStockType: undefined,
        accountId: []
      },
      options: [],
      listLoading: false,
      newDate: new Date().getTime(),
      listData: [],
      pagination: null,
      multipleSelectAccountOption: {
        accountArr: [],
        accountKey: 'id'
      },
      configurationDialogOption: {
        data: {},
        open: false
      },
      shopSetDialogOption: {
        data: {},
        open: false
      },
      autoupload: {
        open: false,
        newobj: {}
      }
    }
  },
  created() {
    this.selectInit()
    this.renderInit()
  },
  mounted() {
  },
  methods: {
    // 初始化列表
    renderInit() {
      this.listData = []
      this.listLoading = true
      const arr = this._.cloneDeep(this.listQuery.accountId)
      this.listQuery.accountId = this._.join(this.listQuery.accountId, ',')
      const queryParams = filterQueryParams(this.listQuery)
      automatic(queryParams).then((res) => {
        this.listLoading = false
        this.listData = res.data.list
        this.pagination = res.data.pagination
        document.querySelector('.el-table__body-wrapper').scrollTop = 0
      }).catch(() => {
        this.listLoading = false
      })
      this.listQuery.accountId = arr
    },
    // 初始化站点选项
    selectInit() {
      addPlanAccount().then(response => {
        this.multipleSelectAccountOption.accountArr = response.data
      })
    },
    // site code多选框
    selectAccount(arr) {
      this.listQuery.accountId = arr
    },
    cleanSelect() {
      this.$refs['listQuery'].resetFields()
    },
    handleFilter() {
      this.newDate = new Date().getTime()
      this.filter = 'filter'
      this.listQuery.page = 1
      this.renderInit()
    },
    clearSearch() {
      this.$refs.multipleSelectAccount.handleCancelAllUser()
      this.$refs.listQuery.resetFields()
      this.newDate = new Date().getTime()
      this.filter = 'filter'
      this.renderInit()
    },
    handleSizeChange(val) {
      this.listQuery.page = 1
      this.listQuery.per_page = val
      this.renderInit()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.renderInit()
    },
    // 禁用/启用操作
    disableOperation(row, type) {
      const message = type === '0' ? '禁用' : '启用'
      this.$confirm('是否' + message + '自动上传广告', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        type: 'warning'
      }).then(() => {
        const obj = {
          account_id: row.account_id,
          is_auto_upload: type
        }
        storeDisabled(obj).finally(() => {
          this.renderInit()
        })
      }).catch(() => {
      })
    },
    // 库存配置
    configuration(row) {
      this.configurationDialogOption = {
        open: true,
        data: this._.cloneDeep(row)
      }
    },
    // 修改店铺配置
    handleSetShopCol(row) {
      this.shopSetDialogOption = {
        open: true,
        data: this._.cloneDeep(row)
      }
    },
    //修改自动上传配置
    openautoupload(row) {
      this.autoupload = {
        open: true,
        newobj: this._.cloneDeep(row)
      }
    }
  },
  filters: {},
  watch: {}
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
