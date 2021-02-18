<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <!--        <el-form-item label="Site Code" prop="accountId">-->
        <!--          <el-select v-model="listQuery.accountId" clearable placeholder="请选择" style="width: 150px;">-->
        <!--            <el-option v-for="item in options.DarazAdvtAccount" :key="item.id" :label="item.account" :value="item.id"></el-option>-->
        <!--          </el-select>-->
        <!--        </el-form-item>-->
        <el-form-item label="账号" prop="account_id">
          <multiple-select-account ref="multipleSelectAccount" v-bind.sync="multipleSelectAccountOption" @select-account="selectAccount" @clean-select="cleanSelect"></multiple-select-account>
        </el-form-item>
        <el-form-item label="站点" prop="site_id">
          <el-select v-model="listQuery.site_id" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="item in options.DarazSite" :key="item.id" :label="item.site_code" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Product ID" prop="advtProductIds">
          <el-input v-model="listQuery.advtProductIds" clearable placeholder="多个请用空格分隔" style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item label="平台商品号" prop="spus">
          <el-input v-model="listQuery.spus" clearable placeholder="多个请用空格分隔" style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item label="广告类型" prop="advtType">
          <el-checkbox-group v-model="listQuery.advtType">
            <el-checkbox-button v-for="types in options.DarazAdvtTypes" :label="types.key" :key="types.key">{{ types.label }}</el-checkbox-button>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="创建时间" prop="advtCreated">
          <el-date-picker
            v-model="listQuery.advtCreated"
            type="daterange"
            style="width: 220px;"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="产品线" prop="product_line_id">
          <el-select v-model="listQuery.product_line_id" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="item in options.DarazProductLine" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="销量" prop="sales_count">
          <el-select v-model="listQuery.sales_count" placeholder="请选择" style="width: 180px" clearable>
            <el-option label="7天-由高到低" value="sold_quantity_7-desc"></el-option>
            <el-option label="7天-由低到高" value="sold_quantity_7-asc"></el-option>
            <el-option label="30天-由高到低" value="sold_quantity_30-desc"></el-option>
            <el-option label="30天-由低到高" value="sold_quantity_30-asc"></el-option>
            <el-option label="60天-由高到低" value="sold_quantity_60-desc"></el-option>
            <el-option label="60天-由低到高" value="sold_quantity_60-asc"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button data-type="search" type="primary" @click="handleFilter">搜索</el-button>
          <el-button data-type="clear" @click="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 状态 -->
    <div v-if="esAdvtStatus.length" class="header-box">
      <el-row class="left-row">
        <el-tag v-for="status in esAdvtStatus" :key="status.key" :type="statusSelected(status.key)" size="medium">
          <span @click="changeStatus(status.key)">{{ status.label }} ({{ status.total }})</span>
        </el-tag>
      </el-row>
      <el-row class="right-row">
        <el-button type="primary" size="mini" @click="openMoreTab" :disabled="multipleTable.length === 0">批量打开广告详情页</el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table ref="table"
                :key="newDate"
                :data="listData"
                v-loading.lock="listLoading"
                element-loading-text="努力加载中"
                border
                style="width: 100%"
                @selection-change="handleSelectionChange"
                @sort-change="tableResortEvent"
                :default-expand-all="expand"
                @header-click="handleExpand"
      >
        <el-table-column type="expand">
          <template slot="header">
            <svg-icon icon-class="right"/>
          </template>
          <template slot-scope="props">
            <el-table :data="props.row.child_product" border>
              <!-- 产品ID、备货期、价格、毛利率、保本价、库存。 -->
              <el-table-column prop="istore_product_id" label="产品ID" align="center"></el-table-column>
              <el-table-column prop="product_name" label="名称" align="center" min-width="260">
                <template slot-scope="scope">
                  <a v-if="scope.row.permalink" style="color: #409EFF;" :href="scope.row.permalink"
                     target="_blank"
                  >
                    {{ scope.row.product_name }}
                  </a>
                  <span v-else>{{ scope.row.product_name }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="base_price" label="保本价" align="center"></el-table-column>
              <el-table-column prop="discount_price" label="价格" align="center"></el-table-column>
              <el-table-column prop="msrp" label="吊牌价" align="center"></el-table-column>
              <el-table-column prop="gross_margin" label="毛利率" align="center"></el-table-column>
              <!--<el-table-column prop="base_price" label="保本价" align="center"></el-table-column>-->
              <el-table-column prop="quantity" label="库存" align="center"></el-table-column>
              <el-table-column label="7天销量" v-if="props.row.type === 2" prop="sold_quantity_7" width="65"/>
              <el-table-column label="30天销量" v-if="props.row.type === 2" prop="sold_quantity_30" width="70"/>
              <el-table-column label="60天销量" v-if="props.row.type === 2" prop="sold_quantity_60" width="70"/>
              <!--<el-table-column prop="leading_time" label="备货期(天)" min-width="60" align="center"></el-table-column>-->
              <el-table-column v-if="listQuery.advtStatus === 120 || listQuery.advtStatus === 130" prop="sku_id" label="SKU ID"></el-table-column>
              <el-table-column prop="status" label="状态" width="104" align="center">
                <template slot-scope="scope">
                  {{ showStatus(scope.row.status) }}
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <!-- ID、Site Code、Product ID、平台商品号、产品图片、名称、类型、创建时间、操作（详情，点击进入广告详情页） -->
        <el-table-column type="selection" width="40" align="center"></el-table-column>
        <el-table-column prop="id" align="center" label="ID" width="65" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column prop="site_code" align="center" label="Site Code" width="80"></el-table-column>
        <el-table-column prop="site_name" align="center" label="站点" width="50"></el-table-column>
        <el-table-column prop="istore_product_id" align="center" label="Product ID" width="80"></el-table-column>
        <el-table-column v-if="listQuery.advtStatus === 120 || listQuery.advtStatus === 130" prop="spu_id" label="平台商品号" width="80"></el-table-column>
        <el-table-column prop="product_image" label="产品图片" align="center" width="65">
          <template slot-scope="scope">
            <picture-view
              v-if="scope.row.pathArr.length > 0 && checkPickShow"
              :pictureList="scope.row.pathArr"
              :thumbnail="false"
              :width="50"
              :height="50"
              :defaultProps="defaultProps"
            ></picture-view>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="product_name" label="产品名称" min-width="230">
          <template slot-scope="scope">
            <a v-if="scope.row.permalink" style="color: #409EFF;" :href="scope.row.permalink"
               target="_blank"
            >
              {{ scope.row.product_name }}
            </a>
            <span v-else>{{ scope.row.product_name }}</span>
          </template>
        </el-table-column>
        <!--<el-table-column prop="quantity" label="Inventory" align="center" width="120"></el-table-column>-->
        <el-table-column prop="type" label="类型" align="center" width="80">
          <template slot-scope="scope">
            <el-tag :type="Number(scope.row.type) === 1 ? 'success' : ''" size="small">{{ Number(scope.row.type) === 1 ? 'Normal' : 'Variation' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="产品线" prop="product_line_name" width="70"/>
        <el-table-column label="7天销量" prop="sold_quantity_7" width="60"/>
        <el-table-column label="30天销量" prop="sold_quantity_30" width="70"/>
        <el-table-column label="60天销量" prop="sold_quantity_60" width="70"/>
        <el-table-column prop="create_time" align="center" label="创建时间" width="86" sort-by="create_time" sortable>
          <!--<template slot-scope="scope" v-if="parseInt(scope.row.create_time) > 0">{{ parseInt(scope.row.create_time) | moment('YYYY-MM-DD HH:mm') }}</template>-->
          <template slot-scope="scope">{{ scope.row.create_time }}</template>
        </el-table-column>
        <el-table-column v-if="listQuery.advtStatus === 120 || listQuery.advtStatus === 130" prop="publish_time" align="center" label="上架时间" width="86" sort-by="upload_time" sortable>
          <template slot-scope="scope">{{ scope.row.publish_time }}</template>
        </el-table-column>
        <el-table-column prop="create_time" align="center" label="更新时间" width="86" sort-by="update_time" sortable>
          <template slot-scope="scope">{{ scope.row.update_time }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" v-permission="permissions.advertising_SeeTheLog" @click="openLog(scope.row.id)">日志</el-button>
            <el-button type="text" size="mini" v-permission="permissions.advertising_ViewTheAD" @click="openTheNewTAB('daraz.advertising.detail', { id: scope.row.id })">详情</el-button>
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
          :page-sizes="[20, 50, 100, 200]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
    <!-- 日志组件 -->
    <istore-log v-bind.sync="logOptions"></istore-log>
  </div>
</template>

<script>
import { toBoolean, filterQueryParams } from '@/utils/help'
import { fetchList, batchSoldOut, getSelectAll } from '@/api/daraz'
import istoreLog from './components/istoreLog'
import multipleSelectAccount from '@/views/daraz/advertising/components/multipleSelectAccount'

export default {
  components: { istoreLog, multipleSelectAccount },
  data() {
    return {
      multipleSelectAccountOption: {
        accountArr: [],
        accountKey: 'id'
      },
      permissions: {
        advertising_SeeTheLog: 'daraz.advt.advt.change-log',//查看日志
        advertising_ViewTheAD: 'daraz.advt.advt.info'//查看广告
      },//权限
      isDisable: false,
      newDate: new Date().getTime(),
      ids: [],
      getOnSaleStatus: 0,
      title: '类型 ',
      filter: 'filter',
      options: [],
      /* 广告列表搜索条件列表 */
      selectOptions: ['DarazAdvtAccount', 'DarazAdvtTypes', 'DarazSite', 'DarazProductLine'],
      listLoading: true,
      listTotal: null,
      listData: [],
      listQuery: {
        product_line_id: undefined,
        sales_count: undefined,
        page: 1,
        per_page: 20,
        accountId: [],
        advtProductIds: '',
        productLine: undefined,
        advtType: [],
        advtStatus: 120,
        advtCreated: [],
        spus: '',
        site_id: ''
      },
      pagination: null,
      createUserList: [],
      statusTags: [],
      multipleTable: [],
      checkPickShow: true,
      expand: true,
      defaultProps: {
        originalKey: 'original',
        thumbnailKey: 'thumbnail'
      },
      esAdvtStatus: [],
      logOptions: {
        open: false,
        advtId: ''
      }
    }
  },
  created() {
    this.searchInit()
    this.renderList()
  },
  watch: {
    expand(val) {
      this.$nextTick(() => {
        if (val) {
          document.querySelector('.el-table th>.cell > svg').style.transform = 'rotate(90deg)'
        } else {
          document.querySelector('.el-table th>.cell > svg').style.transform = 'rotate(0deg)'
        }
      })
    }
  },
  methods: {
    cleanSelect() {
      this.$refs['listQuery'].resetFields()
    },
    selectAccount(arr) {
      this.listQuery.account_id = arr
    },
    clearAccount() {
      this.$refs.multipleSelectAccount.handleCancelAllUser()
    },
    openMoreTab() {
      const detailsId = this.multipleTable.map(v => v.id)
      detailsId.map(v => {
        window.open(`/daraz/advertising/detail/${ v }`)
      })
    },
    // 日志
    openLog(id) {
      this.logOptions = {
        open: true,
        advtId: id
      }
    },
    // 广告状态
    showStatus(val) {
      let status = ''
      this._.map(this.esAdvtStatus, item => {
        if (Number(val) === item.key) {
          status = item.label
        }
      })
      return status
    },
    searchInit() {
      getSelectAll({ keys: this.selectOptions }).then(response => {
        this.options = response.data
        this.multipleSelectAccountOption.accountArr = response.data.DarazAdvtAccount
      })
    },
    /* 跳转新标签 */
    openTheNewTAB(name, params) {
      const { href } = this.$router.resolve({
        name: name,
        params: params || {}
      })
      window.open(href, '_blank')
    },
    toBoolean(v) {
      return toBoolean(v)
    },
    renderList() {
      this.listLoading = true
      this.listData = []
      this.expand = true
      this.listQuery.product_ids = this._.trim(this.listQuery.product_ids)
      const queryParams = filterQueryParams(this.listQuery)
      delete queryParams.sales_count
      if (this.listQuery.sales_count) { //销量查询，参数组装
        let sort = {}
        const value = this.listQuery.sales_count.split('-')
        sort[value[0]] = value[1]
        if (!this._.isEmpty(sort)) {
          queryParams.sort = sort
        }
      }
      fetchList(queryParams).then(response => {
        this.esAdvtStatus = response.data.statistics
        const listData = response.data.list
        this.pagination = response.data.pagination
        this.createUserList = response.data.createUser
        this._.forEach(listData, (v) => {
          // 图片缩略图
          v.pathArr = []
          if (v.product_image) {
            v.pathArr.push({ thumbnail: v.product_image_thumb, original: v.product_image })
          }
          v.virtualGross_margin = v.gross_margin
          v.virtualCustom_price = v.custom_price
        })
        this.checkPickShow = false
        this.$nextTick(() => {
          this.checkPickShow = true
        })
        const table = this._.cloneDeep(listData)
        this.listData = []
        this.listData = table
        document.querySelector('.el-table__body-wrapper').scrollTop = 0
        this.listLoading = false
        this.$refs['table'].doLayout()
        this.multipleTable = []
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleSelectionChange(val) {
      this.multipleTable = val
    },
    checkGrossProfitRate(val) {
      const reg = /^\d\.([1-9]{1,2}|[0-9][1-9])$|^[1-9]\d{0,1}(\.\d{1,2}){0,1}$|^100(\.0{1,2}){0,1}$/
      if (reg.test(Number(val)) === false) {
        this.$message({
          type: 'error',
          message: '毛利率必须是0-100之间的数字'
        })
        this.listLoading = false
        return false
      }
      return true
    },
    checkNumber(val) {
      if (!(/^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,2}?$/.test(Number(val)))) {
        this.$message({
          type: 'error',
          message: '输入的指定价最多保留两位小数'
        })
        this.listLoading = false
        return false
      }
      return true
    },
    // 批量设置指定价
    setPress() {
      const status = this._.map(this.multipleTable, 'custom_price_type')
      const is_zero_type = this._.indexOf(status, '0')
      const is_one_type = this._.indexOf(status, '1')
      if (is_zero_type >= 0 && is_one_type >= 0) {
        this.$alert('指定价暂不能设置', '提示', {
          confirmButtonText: '确定'
        })
        return false
      }
      this.$prompt('请输入指定价', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        this.handleEditAssign('all', value)
      }).catch(() => {
        this.renderList()
      })
    },
    // 单个设置指定价
    handleEditAssign(row, value) {
      this.listLoading = true
      let ids = []
      const prices = {}
      if (row === 'all') {
        if (this._.trim(value) === '') {
          this.listLoading = false
          return
        }
        if (this.checkNumber(value)) {
          this._.forEach(this.multipleTable, (v) => {
            ids.push(v.id)
            prices[v.id] = value
          })
        } else {
          return false
        }
      } else {
        if (Number(row.virtualCustom_price) === Number(row.custom_price)) {
          this.listLoading = false
          return
        }
        if (this._.trim(row.custom_price) === '') {
          this.listLoading = false
          row.custom_price = row.virtualCustom_price
          return
        }
        if (this.checkNumber(row.custom_price)) {
          ids = [row.id]
          prices[row.id] = row.custom_price
        } else {
          row.custom_price = row.virtualCustom_price
          return
        }
      }
    },
    // 批量设置毛利率
    setGrossMargins() {
      const status = this._.map(this.multipleTable, 'custom_price_type')
      const is_zero_type = this._.indexOf(status, '0')
      const is_two_type = this._.indexOf(status, '2')
      if (is_zero_type >= 0 || is_two_type >= 0) {
        this.$prompt('请输入毛利率', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(({ value }) => {
          this.handleEditGross('all', value)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
          this.renderList()
        })
      } else {
        this.$alert('毛利率暂不能设置', '提示', {
          confirmButtonText: '确定'
        })
        this.listLoading = false
        return false
      }
    },
    // 单个设置毛利率
    handleEditGross(row, value) {
      this.listLoading = true
      let ids = []
      const prices = {}
      if (row === 'all') {
        if (this._.trim(value) === '') {
          this.listLoading = false
          return
        }
        if (this.checkNumber(value)) {
          this._.forEach(this.multipleTable, (v) => {
            ids.push(v.id)
            prices[v.id] = value
          })
        } else {
          return
        }
      } else {
        if (Number(row.gross_margin) === Number(row.virtualGross_margin)) {
          this.listLoading = false
          return
        }
        if (this._.trim(row.gross_margin) === '') {
          row.gross_margin = row.virtualGross_margin
          this.listLoading = false
          return
        }
        if (this.checkGrossProfitRate(row.gross_margin)) {
          ids = [row.id]
          prices[row.id] = row.gross_margin
        } else {
          row.gross_margin = row.virtualGross_margin
          return
        }
      }
    },
    // 下架和批量下架
    deleteFileOrDirectory(row, type) {
      if (type === 'all') {
        this.ids = this._.map(this.multipleTable, 'id')
        this.status = this._.map(this.multipleTable, 'is_deleted')
      } else {
        this.ids = [row.row.id]
        this.status = [row.row.is_deleted]
      }
      const statusResult = this._.indexOf(this.status, 0)
      if (statusResult > -1) {
        this.$confirm('是否要下架此产品', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          batchSoldOut(this.ids).then(response => {
            if (response.code === 200) {
              this.$message({
                type: 'success',
                message: response.message
              })
              this.renderList()
            } else {
              this.$message({
                type: 'info',
                message: response.message
              })
            }
          })
        }).catch(() => {
          this.listLoading = false
        })
      } else {
        this.$alert('该产品已经进入待下架状态，不可再次提交。', '提示', {
          dangerouslyUseHTMLString: true
        })
      }
    },
    handleFilter() {
      this.newDate = new Date().getTime()
      this.filter = 'filter'
      this.listQuery.page = 1
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
      this.clearAccount()
      this.renderList()
    },
    changeStatus(key) {
      this.newDate = new Date().getTime()
      if (this.listQuery.advtStatus !== key) {
        this.listQuery.advtStatus = key
        this.listQuery.page = 1
        this.filter = 'filter'
        this.renderList()
      }
    },
    statusSelected(key) {
      return this.listQuery.advtStatus === key ? 'warning' : ''
    },
    // 表格类型筛选
    filterType(value, row) {
      return row.type === value
    },
    // 清理缩略图缓存
    tableResortEvent() {
      this.checkPickShow = false
      this.$nextTick(() => {
        this.checkPickShow = true
      })
    },
    // 筛选图标
    renderHeader(h, { column, $index }) {
      return h('span', [
        h('span', this.title),
        h('svg-icon', { 'attrs': { 'icon-class': this.filter } })
      ])
    },
    handleExpand(column) {
      if (column.type === 'expand') {
        this.expand = !this.expand
        // 强制刷新DOM
        this.newDate = new Date().getTime()
      }
    }
  },
  filters: {
    getTypeLabel(val, options) {
      const types = options.DhgateAdvtTypes
      let label = ''
      if (types) {
        types.forEach((v) => {
          if (v.key === parseInt(val)) {
            label = v.label
          }
        })
      }
      return label
    },
    formatChildProIds(ids) {
      let idsString = ''
      for (const value of ids) {
        idsString += value + '\n'
      }
      return idsString
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.advt-form-inline {
  .line {
    text-align: center;
  }
}

.el-table th > .cell > svg {
  color: #fff;
  transform: rotate(90deg);
  transition: linear .5s;
}
</style>
