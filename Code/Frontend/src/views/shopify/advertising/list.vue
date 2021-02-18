<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="Site Code" prop="accountId">
          <multiple-select-account ref="multipleSelectAccount"
                                   v-bind.sync="multipleSelectAccountOption"
                                   @select-account="selectAccount"
                                   @clean-select="cleanSelect"
                                   style="width: 220px"
          ></multiple-select-account>
        </el-form-item>
        <el-form-item label="Product ID" prop="advtProductIds">
          <el-input v-model="listQuery.advtProductIds" clearable placeholder="多个请用空格分隔" style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item label="平台商品号" prop="advtSpuId">
          <el-input v-model="listQuery.advtSpuId" clearable placeholder="多个请用空格分隔" style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item v-if="options.shopifyAdvtTypes" label="广告类型" prop="advtType">
          <el-checkbox-group v-model="listQuery.advtType">
            <el-checkbox-button v-for="advtType in options.shopifyAdvtTypes" :label="advtType.key" :key="advtType.key">{{ advtType.label }}</el-checkbox-button>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="产品线" prop="productLineId">
          <el-select v-model="listQuery.productLineId" size="mini" clearable placeholder="请选择">
            <el-option v-for="item in options.shopifyProductLine" :label="item.name" :value="item.id" :key="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间" prop="advtCreated">
          <el-date-picker
            v-model="listQuery.advtCreated"
            type="daterange"
            style="width: 220px;"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="销量" prop="sales_count">
          <el-select v-model="listQuery.sales_count" placeholder="请选择" style="width: 180px" clearable>
            <el-option label="7天-由高到低" value="sales_7_days-desc"></el-option>
            <el-option label="7天-由低到高" value="sales_7_days-asc"></el-option>
            <el-option label="30天-由高到低" value="sales_30_days-desc"></el-option>
            <el-option label="30天-由低到高" value="sales_30_days-asc"></el-option>
            <el-option label="60天-由高到低" value="sales_60_days-desc"></el-option>
            <el-option label="60天-由低到高" value="sales_60_days-asc"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 状态 -->
    <div v-if="options.esAdvtStatus" class="header-box">
      <el-row class="left-row">
        <el-tag v-for="status in options.esAdvtStatus" :key="status.key" :type="statusSelected(status.key)" size="medium">
          <span @click="changeStatus(status.key)">{{ status.label }} ({{ status.total }})</span>
        </el-tag>
      </el-row>
      <el-row v-if="[510, 520].indexOf(listQuery.advtStatus) > -1" class="right-row">
        <el-button type="success" size="mini" @click="importExcel">导入</el-button>
        <el-button type="primary" size="mini" @click="exportExcel">导出</el-button>
      </el-row>
      <el-row class="right-row">
        <el-button type="info"
                   size="mini"
                   @click="openMoreTab"
                   :disabled="multipleTable.length === 0"
                   v-permission="permissions.advertising_ViewTheAD"
        >
          批量打开广告详情页
        </el-button>
        <!--<el-button type="primary" size="mini" :disabled="setPriceArr.length === 0" @click="setPress(setPriceArr, 'all')">设置指定价</el-button>-->
        <!--<el-button type="primary" plain size="mini" :disabled="setPriceArr.length === 0" @click="unpricing(setPriceArr)">取消指定价</el-button>-->
        <!--<el-button type="warning" size="mini" :disabled="setPriceArr.length === 0" @click="setGrossMargins(setPriceArr,'all')">设置毛利率</el-button>-->
        <el-button v-if="listQuery.advtStatus === 110"
                   type="danger"
                   size="mini"
                   @click="deleteFileOrDirectory(setPriceArr,'all')"
                   :disabled="setPriceArr.length === 0"
                   v-permission="permissions.advertising_delete"
        >
          批量下架
        </el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table :data="listData"
                ref="table"
                :key="newDate"
                v-loading.fullscreen.lock="listLoading"
                element-loading-text="努力加载中"
                element-loading-background="rgba(0, 0, 0, 0.5)"
                border
                style="width: 100%"
                highlight-current-row
                @current-change="handleCurrentChange1"
                @select-all="handleSelectionChange"
                @select="handleSelectionRow"
                @selection-change="selectionChange"
                @sort-change="tableResortEvent"
                @filter-change="handleFilterChange"
                :default-expand-all="expand"
                @header-click="handleExpand"
      >
        <el-table-column type="expand">
          <template slot="header">
            <svg-icon icon-class="right" />
          </template>
          <template slot-scope="props">
            <el-table v-if="Number(props.row.type) === 2" :data="props.row.child_product" border>
              <el-table-column width="40">
                <template slot-scope="scope">
                  <el-checkbox @input="smt(props.row)" v-model="scope.row.isSelected" />
                </template>
              </el-table-column>
              <el-table-column prop="istore_product_id" label="产品ID" width="120"></el-table-column>
              <el-table-column prop="product_name" label="产品名称" min-width="200"></el-table-column>
              <!--<el-table-column prop="custom_price" label="指定价" v-if="listQuery.advtStatus === 110">
                <template slot-scope="scope">
                  <el-input size="small" class="inline-edit-input" v-model="scope.row.custom_price"
                            :disabled="scope.row.custom_price_type === '2' ? isDisable = true : isDisable = false"
                            @focus="setPress(scope.row, 'single')"
                  ></el-input>
                </template>
              </el-table-column>-->
              <el-table-column prop="base_price" label="保本价"></el-table-column>
              <el-table-column prop="discount_price" label="价格"></el-table-column>
              <el-table-column prop="gross_margin" label="毛利率" v-if="listQuery.advtStatus === 110">
                <template slot-scope="scope">
                  <el-input size="small" class="inline-edit-input" v-model="scope.row.gross_margin"
                            :disabled="Number(scope.row.custom_price_type) === 1"
                            @focus="setGrossMargins(scope.row, '2')"
                  ></el-input>
                </template>
              </el-table-column>
              <!--<el-table-column prop="is_custom_price" label="是否指定价" min-width="92" v-if="listQuery.advtStatus === 110">
                <template slot-scope="scope">
                  <template v-if="scope.row.is_custom_price === '1'">
                    是
                  </template>
                  <template v-else>
                    否
                  </template>
                </template>
              </el-table-column>-->
              <el-table-column prop="platform_stock" label="库存" min-width="60"></el-table-column>
              <el-table-column prop="seven_day_sales" label="7天销量"></el-table-column>
              <el-table-column prop="thirty_day_sales" label="30天销量"></el-table-column>
              <el-table-column prop="sixty_day_sales" label="60天销量" width="84"></el-table-column>
            </el-table>
            <el-table v-else :data="props.row.child_product" border>
              <el-table-column width="40">
                <template slot-scope="scope">
                  <el-checkbox @input="smt(props.row)" v-model="scope.row.isSelected" />
                </template>
              </el-table-column>
              <el-table-column prop="istore_product_id" label="产品ID" width="120"></el-table-column>
              <el-table-column prop="product_name" label="产品名称" min-width="200"></el-table-column>
              <!--<el-table-column prop="custom_price" label="指定价" v-if="listQuery.advtStatus === 110">
                <template slot-scope="scope">
                  <el-input size="small" class="inline-edit-input" v-model="scope.row.custom_price"
                            :disabled="scope.row.custom_price_type === '2' ? isDisable = true : isDisable = false"
                            @focus="setPress(scope.row, 'single')"
                  ></el-input>
                </template>
              </el-table-column>-->
              <el-table-column prop="base_price" label="保本价"></el-table-column>
              <el-table-column prop="platform_discount_price" label="价格"></el-table-column>
              <el-table-column prop="gross_margin" label="毛利率" v-if="listQuery.advtStatus === 110">
                <template slot-scope="scope">
                  <el-input size="small" class="inline-edit-input" v-model="scope.row.gross_margin"
                            :disabled="Number(scope.row.custom_price_type) === 1 ? isDisable = true : isDisable = false"
                            @focus="setGrossMargins(scope.row, '2')"
                  ></el-input>
                </template>
              </el-table-column>
              <!--<el-table-column prop="is_custom_price" label="是否指定价" min-width="92" v-if="listQuery.advtStatus === 110">
                <template slot-scope="scope">
                  <template v-if="scope.row.is_custom_price === '1'">
                    是
                  </template>
                  <template v-else>
                    否
                  </template>
                </template>
              </el-table-column>-->
              <el-table-column prop="quantity" label="库存" width="84"></el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="50" align="center"></el-table-column>
        <el-table-column prop="id" label="ID" width="50" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column prop="account_name" label="Site Code" width="80"></el-table-column>
        <el-table-column prop="istore_product_id" label="Product ID" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.istore_product_id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="spu_id" label="平台商品号" width="120"></el-table-column>
        <el-table-column prop="image_path" label="产品图片" width="70" align="center">
          <template slot-scope="scope">
            <picture-view v-if="scope.row.pathArr.length > 0 && checkPickShow"
                          :pictureList="scope.row.pathArr"
                          :width="50"
                          :height="50"
                          :thumbnail="false"
                          :defaultProps="defaultProps"
            >
            </picture-view>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="product_name" label="名称" min-width="260">
          <template slot-scope="scope">
            <a v-if="Number(scope.row.status) === 110"
               style="color: #409EFF;"
               :href="scope.row.shopify_url_id"
               target="_blank"
            >
              {{ scope.row.product_name }}
            </a>
            <span v-else>{{ scope.row.product_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="advt_type"
                         :render-header="renderHeader"
                         column-key="type"
                         width="80"
                         :filters="[{ text: 'Normal', value: 1 }, { text: 'Variation', value: 2 }]"
                         :filter-method="filterType"
                         filter-placement="bottom-start"
        >
          <template slot-scope="scope">
            <el-tag :type="Number(scope.row.type) === 1 ? 'success' : ''" size="small">{{ scope.row.type | getTypeLabel(options) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="listQuery.advtStatus === 'wait_shelve'" prop="onshelves_status" label="执行状态" min-width="85">
          <template slot-scope="scope">
            <template v-if="scope.row.onshelves_status === 1">
              <el-tooltip :content="scope.row.onshelves_message" placement="top" effect="light">
                <el-tag type="danger" size="small">执行出错</el-tag>
              </el-tooltip>
            </template>
            <template v-else>
              <el-tag type="warning" size="small">未执行</el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="product_line_name" label="产品线" width="80"></el-table-column>
        <el-table-column prop="seven_day_sales" label="7天销量" width="70"></el-table-column>
        <el-table-column prop="thirty_day_sales" label="30天销量" width="70"></el-table-column>
        <el-table-column prop="sixty_day_sales" label="60天销量" width="70"></el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="85" sort-by="create_time" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openTheNewTAB('shopify.advertising.detail', { id: scope.row.id })" v-permission="permissions.advertising_ViewTheAD">详情</el-button>
            <el-button type="text" v-if="listQuery.advtStatus === 110" size="mini" @click="deleteFileOrDirectory(scope)" v-permission="permissions.advertising_delete">下架</el-button>
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
    <!-- 导入组件 -->
    <import-advt v-bind.sync="importOption"></import-advt>
    <set-price v-bind.sync="setPriceOption" @renderList="renderList"></set-price>
    <set-gross-margins v-bind.sync="setGrossMarginOption" @renderList="renderList"></set-gross-margins>
  </div>
</template>
<script>
import { toBoolean, filterQueryParams } from '@/utils/help'
// import { exportLongTile, exportLongDescription } from '@/utils/export/shopee'
import { apiGetAllSelect, fetchExportData, unpricing, fetchList, deletePlatformAdvt } from '@/api/shopify'
import PictureView from 'vue-simple-picture-preview'
import importAdvt from './components/import'
import setPrice from './components/setPrice'
import setGrossMargins from './components/setGrossMargins'
import multipleSelectAccount from './components/multipleSelectAccount'

export default {
  name: 'Advertising',
  components: { PictureView, importAdvt, setPrice, setGrossMargins, multipleSelectAccount },
  data() {
    return {
      permissions: {
        advertising_SeeTheLog: 'shopify.advt.advt.change-log',//查看日志
        advertising_ViewTheAD: 'shopify.advt.advt.info',//查看广告详情
        advertising_delete: 'shopify.advt.delete-platform-advt.execute'//下架
      },
      title: '类型 ',
      filter: 'filter',
      checked: true,
      newDate: new Date().getTime(),
      isDisable: false,
      options: [],
      listLoading: true,
      listTotal: null,
      listData: [],
      listQuery: {
        page: 1,
        per_page: 20,
        accountId: [],
        advtProductIds: undefined,
        advtSpuId: undefined,
        productLineId: undefined,
        advtType: [],
        advtStatus: 110,
        advtCreated: [],
        sales_count: undefined
      },
      pagination: null,
      dialogFormOption: {
        data: {},
        open: false
      },
      dialogAccreditOption: {
        data: {},
        open: false
      },
      importOption: {
        advtStatus: 510,
        open: false
      },
      setPriceOption: {
        advtIds: [],
        open: false
      },
      setGrossMarginOption: {
        advtIds: [],
        open: false
      },
      multipleTable: [],
      statusTags: [],
      currentRow: null,
      checkPickShow: true,
      checkNum: 0,
      defaultProps: {
        originalKey: 'original',
        thumbnailKey: 'thumbnail'
      },
      multipleSelectAccountOption: {
        accountArr: [],
        accountKey: 'id'
      },
      expand: true
    }
  },
  created() {
    const keys = ['shopifyAdvtTypes', 'shopifyProductLine', 'shopifyAdvtAccount']
    apiGetAllSelect({ keys }).then(response => {
      this.options = response.data
      this.multipleSelectAccountOption.accountArr = response.data.shopifyAdvtAccount
    })
    this.renderList()
  },
  computed: {
    setPriceArr() {
      this.checkNumChange(this.checkNum)
      const arr = []
      this._.forEach(this.multipleTable, (v) => {
        arr.push(v)
      })
      return arr
    }
  },
  methods: {
    openMoreTab() {
      const detailsId = this.multipleTable.map(v => v.id)
      detailsId.map(v => {
        window.open(`/shopify/advertising/detail/${v}`)
      })
    },
    checkNumChange(num) {
    },
    selectionChange(val) {
      this.multipleTable = val
      this.checkNum++
    },
    /* 跳转新标签 */
    openTheNewTAB(name, params) {
      const { href } = this.$router.resolve({
        name: name,
        params: params || {}
      })
      window.open(href, '_blank')
    },
    smt(row) {
      const check = this._.some(row.child_product, (v, i) => {
        return v.isSelected
      })
      if (check) {
        this.$refs.table.toggleRowSelection(row, true)
      } else {
        this.$refs.table.toggleRowSelection(row, false)
      }
    },
    toBoolean(v) {
      return toBoolean(v)
    },
    renderList() {
      this.listLoading = true
      this.expand = true
      this.listQuery.advtProductIds = this._.trim(this.listQuery.advtProductIds)
      this.listQuery.advtSpuId = this._.trim(this.listQuery.advtSpuId)
      const queryParams = filterQueryParams(this.listQuery)
      delete queryParams.sales_count
      const sort = {}
      if (this.listQuery.sales_count) {
        const value = this.listQuery.sales_count.split('-')
        sort[value[0]] = value[1]
      }
      if (!this._.isEmpty(sort)) {
        queryParams.sort = sort
      }
      this.multipleTable = []
      fetchList(queryParams).then(response => {
        this.listData = response.data.list
        this.pagination = response.data.pagination
        this.options.esAdvtStatus = response.data.statistics
        this._.forEach(this.listData, (v) => {
          // 图片缩略图
          v.pathArr = []
          if (v.image_path) {
            v.pathArr.push({
              original: v.image_path,
              thumbnail: v.thumb_image_path
            })
          }
          this._.forEach(v.child_product, (val) => {
            val.isSelected = false
            val.virtualGross_margin = val.gross_margin
            val.virtualCustom_price = val.custom_price
            val.virtualCustom_quantity = val.custom_quantity
          })
        })
        this.checkPickShow = false
        this.$nextTick(() => {
          this.checkPickShow = true
        })
        const table = this._.cloneDeep(this.listData)
        this.listData = []
        this.listData = table
        document.querySelector('.el-table__body-wrapper').scrollTop = 0
        this.listLoading = false
        this.$refs['table'].doLayout()
      }).catch(() => {
        this.listLoading = false
      })
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
    handleCurrentChange1(val) {
      this.currentRow = val
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.renderList()
    },
    clearSearch() {
      this.$refs.multipleSelectAccount.handleCancelAllUser()
      this.$refs.listQuery.resetFields()
      this.newDate = new Date().getTime()
      this.filter = 'filter'
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
    handleSelectionChange(val) {
      this._.forEach(this.listData, (v) => {
        this._.forEach(v.child_product, (v2) => {
          v2.isSelected = false
        })
      })
      this._.forEach(val, (v) => {
        this._.forEach(v.child_product, (v2) => {
          v2.isSelected = true
        })
      })
      this.multipleTable = val
    },
    handleSelectionRow(val, row) {
      const check = this._.some(row.child_product, (v, i) => {
        return v.isSelected
      })
      if (check) {
        this._.forEach(row.child_product, v => {
          v.isSelected = false
        })
      } else {
        this._.forEach(row.child_product, v => {
          v.isSelected = true
        })
      }
    },
    // site code多选框
    selectAccount(arr) {
      this.listQuery.accountId = arr
    },
    cleanSelect() {
      this.$refs['listQuery'].resetFields()
    },
    // 设置指定价
    setPress(data, type) {
      this.currentRow = data
      let ids = []
      let custom_price = ''
      this.isDisable = true
      if (type === 'all') {
        let isZeroType = ''
        let isOneType = ''
        const status = []
        this._.forEach(this.setPriceArr, (v) => {
          this._.forEach(v.child_product, (val) => {
            if (val.isSelected === true) {
              status.push(val.custom_price_type)
              ids.push(val.id)
            }
            isZeroType = this._.indexOf(status, '0')
            isOneType = this._.indexOf(status, '1')
          })
        })
        if (isZeroType >= 0 || isOneType >= 0) {
          this.setPriceOption = {
            open: true,
            data: ids,
            customPrice: ''
          }
        } else {
          this.$alert('指定价暂不能设置', '提示', {
            confirmButtonText: '确定'
          })
          return false
        }
      } else {
        ids = [data.id]
        custom_price = data.custom_price
        this.setPriceOption = {
          open: true,
          data: ids,
          customPrice: custom_price
        }
      }
    },
    // 设置毛利率
    setGrossMargins(data, type) {
      this.currentRow = data
      let ids = []
      let gross_margin = ''
      if (type === 'all') {
        let isZeroType = ''
        let isTwoType = ''
        const status = []
        this._.forEach(this.setPriceArr, (v) => {
          this._.forEach(v.child_product, (val) => {
            if (val.isSelected === true) {
              status.push(val.custom_price_type)
              ids.push(val.id)
            }
            isZeroType = this._.indexOf(status, '0')
            isTwoType = this._.indexOf(status, '2')
          })
        })
        if (isZeroType >= 0 || isTwoType >= 0) {
          this.setGrossMarginOption = {
            open: true,
            advtIds: ids,
            gross_margin: ''
          }
        } else {
          this.$alert('毛利率暂不能设置', '提示', {
            confirmButtonText: '确定'
          })
          this.listLoading = false
          return false
        }
      } else {
        ids = [data.id]
        gross_margin = data.gross_margin
        this.setGrossMarginOption = {
          open: true,
          advtIds: ids,
          gross_margin: gross_margin
        }
      }
    },
    // 取消指定价
    unpricing() {
      const advIds = []
      this.listLoading = true
      this.$confirm('您确定要取消指定价吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this._.forEach(this.setPriceArr, (v) => {
          this._.forEach(v.child_product, (val) => {
            advIds.push(val.id)
          })
        })
        unpricing({ product_id: advIds }).finally(() => {
          this.renderList()
        })
      }).catch(() => {
        this.listLoading = false
      })
    },
    // 下架和批量下架
    deleteFileOrDirectory(row, type) {
      if (type === 'all') {
        this.ids = this._.map(this.setPriceArr, 'id')
      } else {
        this.ids = [row.row.id]
      }
      this.$confirm('是否要下架此产品', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        deletePlatformAdvt(this.ids).then(() => {
          this.renderList()
        })
      }).finally(() => {
        this.listLoading = false
      })
    },
    exportExcel() {
      if (this.listData.length === 0) {
        this.$message({
          message: '没有可导出的数据',
          type: 'warning'
        })
        return false
      }
      fetchExportData(this.listQuery.advtStatus).then(response => {
        if (response.data.length === 0) {
          this.$message({
            message: '数据异常请重新导出',
            type: 'warning'
          })
        } else {
          this.$message({
            message: '正在导出请耐心等待',
            type: 'info'
          })
          this.execExport(response.data)
        }
      })
    },
    execExport(exportData) {
      if (this.listQuery.advtStatus === 510) {
        // exportLongTile(exportData)
      }
      if (this.listQuery.advtStatus === 520) {
        // exportLongDescription(exportData)
      }
    },
    importExcel() {
      this.importOption = {
        open: true,
        advtStatus: this.listQuery.advtStatus
      }
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
    // 筛选图标处理
    handleFilterChange(type) {
      if (type.type.length === 0) {
        this.filter = 'filter'
        document.querySelector(' .el-table th>.cell>span>svg').style.color = '#c0c4cc'
      } else {
        this.filter = 'filter-in'
        document.querySelector(' .el-table th>.cell.highlight>span>svg').style.color = '#f00'
      }
    },
    handleExpand(column) {
      if (column.type === 'expand') {
        this.expand = !this.expand
        // 强制刷新DOM
        this.newDate = new Date().getTime()
      }
    }
  },
  watch: {
    expand: {
      immediate: true,
      handler(val) {
        this.$nextTick(() => {
          if (document.querySelector('.el-table th>.cell > svg')) {
            if (val) {
              document.querySelector('.el-table th>.cell > svg').style.transform = 'rotate(90deg)'
            } else {
              document.querySelector('.el-table th>.cell > svg').style.transform = 'rotate(0deg)'
            }
          }
        })
      }
    }
  },
  filters: {
    getTypeLabel(val, options) {
      const types = options.shopifyAdvtTypes
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
.advt-form-inline {
  .line {
    text-align: center;
  }
}

.popover-cc {
  font-size: 12px;

  p {
    line-height: 22px;
    text-align: justify;
  }
}
</style>
<style rel="stylesheet/scss" lang="scss">

.el-message,
.el-message--success {
  max-width: 700px !important;
  height: auto !important;
}

.el-message__content {
  display: inline-block !important;
  width: 90% !important;
  word-wrap: break-word !important;
}

.el-table th > .cell > svg {
  color: #fff;
  transform: rotate(90deg);
  transition: linear .5s;
  cursor: pointer;
}

</style>
