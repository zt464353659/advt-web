<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="Site Code" prop="account_id">
          <el-select v-model="listQuery.account_id" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="item in options.LinioAdvtAccount" :key="item.id" :label="item.account" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <!--<el-form-item label="站点" prop="site_id">-->
        <!--<el-select v-model="listQuery.site_id" clearable placeholder="请选择" style="width: 150px;">-->
        <!--<el-option v-for="item in options.DarazSite" :key="item.id" :label="item.site_code" :value="item.id"></el-option>-->
        <!--</el-select>-->
        <!--</el-form-item>-->
        <el-form-item label="Product ID" prop="advt_product_ids">
          <el-input v-model="listQuery.advt_product_ids" clearable placeholder="多个请用空格分隔" style="width: 200px;"></el-input>
        </el-form-item>
        <!--<el-form-item label="平台商品号" prop="spus">-->
        <!--<el-input v-model="listQuery.spus" clearable placeholder="多个请用空格分隔" style="width: 200px;"></el-input>-->
        <!--</el-form-item>-->
        <el-form-item label="产品线" prop="product_line">
          <el-select v-model="listQuery.product_line" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="(item,ind) in options.LinioProductLine" :key="ind" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="广告类型" prop="advt_type">
          <el-checkbox-group v-model="listQuery.advt_type">
            <el-checkbox-button v-for="types in options.LinioAdvtTypes" :label="types.key" :key="types.key">{{ types.label }}</el-checkbox-button>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="创建时间" prop="advt_created">
          <el-date-picker
            v-model="listQuery.advt_created"
            type="daterange"
            style="width: 220px;"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="刊登时间" prop="advt_published">
          <el-date-picker
            v-model="listQuery.advt_published"
            type="daterange"
            style="width: 220px;"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button data-type="search" type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
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
              <!--产品ID、产品名称、价格、毛利率、保本价、库存-->
              <el-table-column prop="istore_product_id" label="产品ID" align="center"></el-table-column>
              <el-table-column prop="product_name" label="名称" align="center" width="400"></el-table-column>
              <el-table-column prop="base_price" label="保本价" align="center"></el-table-column>
              <el-table-column prop="discount_price" label="价格" align="center"></el-table-column>
              <el-table-column prop="gross_margin" label="毛利率" align="center"></el-table-column>
              <!--<el-table-column prop="base_price" label="保本价" align="center"></el-table-column>-->
              <el-table-column prop="quantity" label="库存" align="center"></el-table-column>
              <!--<el-table-column prop="status" label="状态" min-width="60" align="center">-->
              <!--<template slot-scope="scope">-->
              <!--{{ showStatus(scope.row.status) }}-->
              <!--</template>-->
              <!--</el-table-column>-->
            </el-table>
          </template>
        </el-table-column>
        <!-- ID、Site Code、Product ID、平台商品号、产品图片、名称、类型、Rejection Reason（仅Rejected状态显示该列）、创建时间/刊登时间、下架时间、操作（详情，点击进入广告详情页） -->
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" align="center" label="ID" width="80" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column prop="site_code" align="center" label="Site Code" width="120"></el-table-column>
        <el-table-column prop="istore_product_id" align="center" label="Product ID" width="120"></el-table-column>
        <!--<el-table-column v-if="listQuery.advt_status === 120 || listQuery.advt_status === 130" prop="spu_id" label="平台商品号" width="100"></el-table-column>-->
        <el-table-column prop="product_image" label="产品图片" align="center" width="80">
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
        <el-table-column prop="product_name" label="产品名称">
          <template slot-scope="scope">
            <a v-if="listQuery.advt_status === 120 && scope.row.platform_item_url" style="color: #409EFF;" :href="scope.row.platform_item_url"
               target="_blank"
            >
              {{ scope.row.product_name }}
            </a>
            <span v-else>{{ scope.row.product_name }}</span>
          </template>
        </el-table-column>
        <!--<el-table-column prop="quantity" label="Inventory" align="center" width="120"></el-table-column>-->
        <el-table-column prop="type" label="类型" align="center" width="120">
          <template slot-scope="scope">
            <el-tag :type="Number(scope.row.type) === 1 ? 'success' : ''" size="small">{{ Number(scope.row.type) === 1 ? 'Normal' : 'Variation' }}</el-tag>
          </template>
        </el-table-column>
        <!--<el-table-column v-if="Number(listQuery.advt_status) === STATUS.UPLOAD_ERROR" prop="site_code" align="center" label="Rejection Reason"></el-table-column>-->
        <el-table-column v-if="STATUS.PUBLISH_TIME.includes(listQuery.advt_status)" prop="publish_time" align="center" label="刊登时间" width="170" sort-by="publish_time" sortable></el-table-column>
        <el-table-column prop="create_time" align="center" label="创建时间" width="170" sort-by="create_time" sortable></el-table-column>
        <el-table-column prop="update_time" align="center" label="更新时间" width="170" sort-by="update_time" sortable></el-table-column>
        <el-table-column label="操作" width="90" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openLog(scope.row.id)">日志</el-button>
            <el-button type="text" size="mini" @click="openTheNewTAB('jdth.advertising.detail', { id: scope.row.id })">详情</el-button>
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
  import { fetchList, batchSoldOut, getSelectAll } from '@/api/jdth'
  import istoreLog from './components/istoreLog'

  export default {
    components: { istoreLog },
    data() {
      return {
        STATUS: {
          DRAFT: 100,
          PUBLISH_TIME: [120,130,220],
          UPLOAD_ERROR: 140
        },
        isDisable: false,
        newDate: new Date().getTime(),
        ids: [],
        getOnSaleStatus: 0,
        title: '类型 ',
        filter: 'filter',
        options: [],
        /* 广告列表搜索条件列表 */
        selectOptions: ['LinioAdvtAccount', 'LinioAdvtTypes', 'LinioProductLine'],
        listLoading: true,
        listTotal: null,
        listData: [],
        listQuery: {
          page: 1,
          per_page: 20,
          account_id: undefined, // Site Code
          advt_product_ids: '',// Product ID
          product_line: undefined,// 产品线
          advt_type: [], // 广告类型
          advt_status: 120,// 广告状态
          advt_created: [], // 创建时间
          advt_published: [], // 刊登时间
          spus: '', // 平台商品号
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
        logOptions:{
          open: false,
          advtId: ''
        },
        product_line: []
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
      handleProductLineChange(val) {
        if (val) {
          this.listQuery.product_line = val[val.length -1]
        }
      },
      openMoreTab() {
        const detailsId = this.multipleTable.map(v => v.id)
        detailsId.map(v => {
          window.open(`/jdth/advertising/detail/${v}`)
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
        this.expand = true
        this.listQuery.product_ids = this._.trim(this.listQuery.product_ids)
        const queryParams = filterQueryParams(this.listQuery)
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
        this.product_line = []
        this.newDate = new Date().getTime()
        this.filter = 'filter'
        this.renderList()
      },
      changeStatus(key) {
        this.newDate = new Date().getTime()
        if (this.listQuery.advt_status !== key) {
          this.listQuery.advt_status = key
          this.listQuery.page = 1
          this.filter = 'filter'
          this.renderList()
        }
      },
      statusSelected(key) {
        return this.listQuery.advt_status === key ? 'warning' : ''
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
