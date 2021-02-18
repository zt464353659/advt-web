<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="Site Code" prop="account_id">
          <!--          <el-select v-model="listQuery.account_id" clearable placeholder="请选择" style="width: 150px;">-->
          <!--            <el-option v-for="item in options.DhgateAdvtAccount" :key="item.id" :label="item.account" :value="item.id"></el-option>-->
          <!--          </el-select>-->
          <multiple-select-account ref="multipleSelectAccount"
                                   v-bind.sync="multipleSelectAccountOption"
                                   @select-account="selectAccount"
                                   @clean-select="cleanSelect"
                                   style="width: 200px;"
          >
          </multiple-select-account>
        </el-form-item>
        <el-form-item label="Product ID" prop="advtProductIds">
          <el-input v-model="listQuery.advtProductIds" clearable placeholder="多个请用空格分隔" style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item label="平台商品号" prop="spus">
          <el-input v-model="listQuery.spus" clearable placeholder="多个请用空格分隔" style="width: 200px;"></el-input>
        </el-form-item>
        <!-- <el-form-item label="产品线" prop="product_line_id">
          <el-select v-model="listQuery.product_line_id" clearable placeholder="请选择" style="width: 120px;">
            <el-option v-for="item in options.DhgateProductLine" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="广告类型" prop="advtType">
          <el-checkbox-group v-model="listQuery.advtType">
            <el-checkbox-button v-for="types in options.DhgateAdvtTypes" :label="types.key" :key="types.key">{{ types.label }}</el-checkbox-button>
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
        <!--<el-form-item v-if="listQuery.advtStatus === 120" label="是否指定库存" prop="is_custom_quantity">-->
        <!--<el-select v-model="listQuery.is_custom_quantity" clearable placeholder="请选择" style="width: 120px;">-->
        <!--<el-option label="是" value="1"></el-option>-->
        <!--<el-option label="否" value="0"></el-option>-->
        <!--</el-select>-->
        <!--</el-form-item>-->
        <el-form-item label="产品线" prop="product_line_id">
          <el-select v-model="listQuery.product_line_id" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="item in options.DhgateProductLine" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="价格类型" prop="price_type">
          <el-select v-model="listQuery.price_type" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="(item,index) in priceTypeArr" :key="index" :label="item.label" :value="item.value"></el-option>
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
      <!--Active状态下-->
      <el-row class="right-row">
        <el-button type="primary" size="mini" @click="openMoreTab" :disabled="multipleTable.length === 0">批量打开广告详情页</el-button>
        <el-dropdown v-if="[130,120].includes(listQuery.advtStatus)" size="mini" split-button type="primary" trigger="click" @command="price"
                     v-permission="[permission.advertising_customSetPrice,permission.advertising_customCancelStock]"
        >
          指定价
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-permission="permission.advertising_customSetPrice" :disabled="this.multipleTable.length === 0" :command="{ fuc: 'setPress', value: multipleTable, type: 'all' }">
              设置指定价
            </el-dropdown-item>
            <el-dropdown-item v-permission="permission.advertising_customCancelStock" :disabled="this.multipleTable.length === 0" :command="{ fuc: 'unpricing', value: multipleTable }">
              取消指定价
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown v-if="[130,120].includes(listQuery.advtStatus)" size="mini" split-button type="success" trigger="click" @command="margin"
                     v-permission="[permission.advertising_customSetPrice,permission.advertising_customCancelStock]"
        >
          指定毛利率
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-permission="permission.advertising_customSetPrice" :disabled="this.multipleTable.length === 0" :command="{ fuc: 'setGrossMargins', value: multipleTable, type: 'all' }">
              设置指定毛利率
            </el-dropdown-item>
            <el-dropdown-item v-permission="permission.advertising_customCancelStock" :disabled="this.multipleTable.length === 0" :command="{ fuc: 'unpricing', value: multipleTable }">
              取消指定毛利率
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button v-if="[130,120].includes(listQuery.advtStatus)" type="danger" size="mini" @click="soldOut('more')" :disabled="!multipleTable.length"
                   v-permission="permission.advertising_delete"
        >
          批量下架
        </el-button>
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
                @select-all="handleSelectionChange"
                @select="handleSelectionRow"
                @selection-change="selectionChange"
                @sort-change="tableResortEvent"
                :default-expand-all="expand"
                @header-click="handleExpand"
      >
        <el-table-column type="expand" width="40">
          <template slot="header">
            <svg-icon icon-class="right" />
          </template>
          <template slot-scope="props">
            <el-table :data="props.row.child_product" border>
              <el-table-column width="25" v-if="[120,130].includes(listQuery.advtStatus)" align="center">
                <template slot-scope="scope">
                  <el-checkbox @input="smt(props.row)" v-model="scope.row.isSelected" />
                </template>
              </el-table-column>
              <!-- 产品ID、备货期、价格、毛利率、保本价、库存。 -->
              <el-table-column prop="istore_product_id" label="产品ID" align="center"></el-table-column>
              <el-table-column prop="base_price" label="保本价" align="center"></el-table-column>
              <el-table-column prop="discount_price" label="iStore价格" align="center" width="100"></el-table-column>
              <el-table-column prop="gross_margin" label="iStore毛利率(%)" align="center" width="150"></el-table-column>
              <el-table-column prop="current_price" label="当前销售价" align="center" width="100"></el-table-column>
              <el-table-column prop="current_gross_margin" label="当前毛利率(%)" align="center" width="150"></el-table-column>
              <el-table-column prop="price_type" label="价格类型" align="center" width="100">
                <template slot-scope="scope">
                  {{ getLabelByCode(scope.row.price_type) }}
                </template>
              </el-table-column>
              <el-table-column prop="custom_price" label="指定价" align="center" v-if="[120,130].includes(listQuery.advtStatus)">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_price_icon',scope.row)" @mouseleave="hideEdit('show_price_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position:relative;">
                    <el-input
                      v-if="scope.row.show_price_edit"
                      class="price_input inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_price"
                      @blur="setPress(scope.row, 'single')"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_price }}</span>
                    <i v-show="scope.row.show_price_icon"
                       v-permission="permission.advertising_customSetPrice"
                       class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:9px;right:-7px;"
                       @click="showEdit('show_price_edit',scope.row, scope.$index)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="gross_margin" label="指定毛利率(%)" align="center" v-if="[120,130].includes(listQuery.advtStatus)" width="120">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_gross_icon',scope.row)" @mouseleave="hideEdit('show_gross_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position: relative;">
                    <el-input
                      v-if="scope.row.show_gross_edit"
                      class="gross_input inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_gross_margin"
                      @blur="handleSetGrossMargins(scope.row, 'single')"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_gross_margin }}</span>
                    <i v-show="scope.row.show_gross_icon"
                       v-permission="permission.advertising_customSetPrice"
                       class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:9px;right:-7px;"
                       @click="showEdit('show_gross_edit',scope.row, scope.$index)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="库存" align="center" width="60"></el-table-column>
              <!--<el-table-column prop="custom_quantity" label="指定库存" v-if="listQuery.advtStatus === 120" width="100">-->
              <!--<template slot-scope="scope">-->
              <!--<div @mouseenter="showEdit('show_quantity_icon',scope.row)" @mouseleave="hideEdit('show_quantity_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position:relative;">-->
              <!--<el-input-->
              <!--v-if="scope.row.show_quantity_edit"-->
              <!--class="stock_input inline-edit-input"-->
              <!--size="small"-->
              <!--v-model="scope.row.custom_quantity"-->
              <!--@blur="setStock('single',scope.row)"-->
              <!--style="width:85%"-->
              <!--&gt;</el-input>-->
              <!--<span v-else>{{ scope.row.custom_quantity }}</span>-->
              <!--<i v-show="scope.row.show_quantity_icon"-->
              <!--v-permission="permissions.customSetStock"-->
              <!--class="el-icon-edit"-->
              <!--title="编辑"-->
              <!--style="color:#409EFF; font-size:20px;top:9px;right:-7px;"-->
              <!--@click="showEdit('show_quantity_edit',scope.row, scope.$index)"-->
              <!--&gt;</i>-->
              <!--</div>-->
              <!--</template>-->
              <!--</el-table-column>-->
              <!--<el-table-column prop="is_custom_quantity" label="是否指定库存" v-if="listQuery.advtStatus === 120" width="120">-->
              <!--<template slot-scope="scope">-->
              <!--{{ scope.row.is_custom_quantity === '1' ? '是' : '否' }}-->
              <!--</template>-->
              <!--</el-table-column>-->
              <el-table-column prop="leading_time" label="备货期(天)" align="center"></el-table-column>
              <el-table-column align="center" label="7天销量" v-if="props.row.type === 2" prop="sold_quantity_7" width="65" />
              <el-table-column align="center" label="30天销量" v-if="props.row.type === 2" prop="sold_quantity_30" width="70" />
              <el-table-column align="center" label="60天销量" v-if="props.row.type === 2" prop="sold_quantity_60" width="70" />
              <el-table-column align="center" prop="status" label="状态" width="104">
                <template slot-scope="scope">
                  <span style="word-break: keep-all;">{{ showStatus(scope.row.status) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" v-if="[120,130].includes(listQuery.advtStatus)" width="104">
                <template slot-scope="scope">
                  <el-button type="text" size="mini" :disabled="![120,130].includes(Number(scope.row.status))" @click="soldOut('child',scope.row)"
                             v-permission="permission.advertising_delete"
                  >
                    下架
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <!-- ID、Site Code、Product ID、平台商品号、产品图片、名称、类型、创建时间、操作（详情，点击进入广告详情页） -->
        <el-table-column type="selection" width="40" align="center"></el-table-column>
        <el-table-column prop="id" align="center" label="ID" width="75" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column prop="site_code" align="center" label="Site Code" width="95"></el-table-column>
        <el-table-column prop="istore_product_id" align="center" label="Product ID" width="80"></el-table-column>
        <el-table-column v-if="[120,130].includes(listQuery.advtStatus)" prop="spu_code" label="平台商品号" width="100"></el-table-column>
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
        <el-table-column prop="product_name" label="产品名称" min-width="260">
          <template slot-scope="scope">
            <a v-if="scope.row.permalink" style="color: #409EFF;" :href="scope.row.permalink"
               target="_blank"
            >
              {{ scope.row.product_name }}
            </a>
            <span v-else>{{ scope.row.product_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="Inventory" align="center" width="85"></el-table-column>
        <el-table-column prop="type" label="类型" align="center" width="70">
          <template slot-scope="scope">
            <el-tag :type="Number(scope.row.type) === 1 ? 'success' : ''" size="small">{{ Number(scope.row.type) === 1 ? 'Normal' : 'Variation' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="产品线" align="center" prop="product_line_name" width="80" />
        <el-table-column label="7天销量" align="center" prop="sold_quantity_7" width="65" />
        <el-table-column label="30天销量" align="center" prop="sold_quantity_30" width="70" />
        <el-table-column label="60天销量" align="center" prop="sold_quantity_60" width="70" />
        <el-table-column prop="create_time" align="center" label="创建时间" width="86" sort-by="create_time" sortable :sort-method="(a,b)=> {a-b}">
          <template slot-scope="scope">{{ scope.row.create_time }}</template>
        </el-table-column>
        <el-table-column
          v-if="listQuery.advtStatus === advtStatus.OnLine || listQuery.advtStatus === advtStatus.OffLine"
          prop="upload_time"
          align="center"
          label="上架时间"
          width="86"
          sort-by="upload_time"
          sortable
          :sort-method="(a,b) => {a-b}"
        >
          <template slot-scope="scope">{{ scope.row.upload_time }}</template>
        </el-table-column>
        <el-table-column prop="create_time" align="center" label="更新时间" width="86" sort-by="update_time" sortable :sort-method="(a,b) => {a-b}">
          <template slot-scope="scope">{{ scope.row.update_time }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openLog(scope.row.id)" v-permission="permission.advertising_SeeTheLog">日志</el-button>
            <el-button type="text" size="mini" @click="openTheNewTAB('dhgate.advertising.detail', { id: scope.row.id })" v-permission="permission.advertising_ViewTheAD">详情</el-button>
            <el-button v-if="[120,130].includes(listQuery.advtStatus)" :disabled="![120,130].includes(Number(scope.row.status))" type="text" size="mini" @click="soldOut('row',scope.row)"
                       v-permission="permission.advertising_delete"
            >
              下架
            </el-button>
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
    <!--  组件  -->
    <set-gross-margin v-bind.sync="setGrossMarginOption" @renderList="renderList"></set-gross-margin>
    <set-price v-bind.sync="setPriceOption" @renderList="renderList"></set-price>
    <istore-log v-bind.sync="logOptions"></istore-log>
  </div>
</template>

<script>
import { toBoolean, filterQueryParams } from '@/utils/help'
import { resultAlert } from './common'
import setGrossMargin from './components/setGrossMargins'
import multipleSelectAccount from './components/multipleSelectAccount'
import setPrice from './components/setPrice'
import istoreLog from './components/istoreLog'
import { fetchList, batchSoldOut, getSelectAll, updateCustomerPrice, setCustomStock, cancleStock, cancelCustomPrice } from '@/api/dhgate'

export default {
  components: { setPrice, setGrossMargin, istoreLog, multipleSelectAccount },
  data() {
    return {
      advtStatus: {
        OnLine: 120,
        OffLine: 130,
        Draft: 100
      },
      permission: {
        advertising_customSetPrice: 'dhgate.advt.custom-price.set',//设置指定价/毛利率
        advertising_customCancelStock: 'dhgate.advt.custom-price.cancel',//取消指定价/毛利率
        advertising_SeeTheLog: 'dhgate.advt.advt.change-log',//查看日志
        advertising_ViewTheAD: 'dhgate.advt.advt.info',//查看广告
        advertising_delete: 'dhgate.advt.advt.delete'//下架
      },
      isDisable: false,
      newDate: new Date().getTime(),
      ids: [],
      getOnSaleStatus: 0,
      title: '类型 ',
      filter: 'filter',
      multipleSelectAccountOption: {
        accountArr: [],
        accountKey: 'id'
      },
      options: [],
      priceTypeArr: [
        { label: 'iStore价格', value: 10 },
        // { label: '动态调整价', value: 20 },
        { label: '指定价', value: 30 },
        { label: '指定毛利率', value: 40 }
        // { label: '跟卖价', value: 50 }
      ],//价格类型
      /* 广告列表搜索条件列表 */
      selectOptions: ['DhgateAdvtAccount', 'DhgateAdvtTypes', 'DhgateProductLine'],
      listLoading: true,
      listTotal: null,
      listData: [],
      listQuery: {
        product_line_id: undefined,
        sales_count: undefined,
        page: 1,
        per_page: 20,
        account_id: undefined,
        advtProductIds: undefined,
        productLine: undefined,
        advtType: [],
        advtStatus: 120,
        advtCreated: [],
        spus: '',
        is_custom_quantity: undefined,
        price_type: undefined
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
      setGrossMarginOption: {
        advtIds: [],
        open: false
      },
      setPriceOption: {
        advtIds: [],
        open: false
      },
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
    //价格类型
    getLabelByCode(code) {
      let label = ''
      if (code) {
        this.priceTypeArr.forEach(e => {
          if (e.value === code) {
            label = e.label
          }
        })
        return label
      }
    },
    openMoreTab() {
      const detailsId = this.multipleTable.map(v => v.id)
      detailsId.map(v => {
        window.open(`/dhgate/advertising/detail/${v}`)
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
        this.multipleSelectAccountOption.accountArr = this._.values(response.data.DhgateAdvtAccount)
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
          v.child_product.forEach(k => {
            k.isSelected = false
            k.show_quantity_icon = false
            k.show_quantity_edit = false
            k.show_price_icon = false
            k.show_price_edit = false
            k.show_gross_icon = false
            k.show_gross_edit = false
            k.virtualGross_margin = k.custom_gross_margin
            k.virtualCustom_price = k.custom_price
            k.virtualCustom_quantity = k.custom_quantity
          })
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
    // 列表行
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
    // 列表全选
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
    selectionChange(val) {
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
      this.cleanSelect()
      this.renderList()
    },
    //Site Code选择器
    selectAccount(arr) {
      arr.length ? this.listQuery.account_id = arr : this.listQuery.account_id = undefined
    },
    cleanSelect() {
      this.listQuery.account_id = undefined
      this.$refs['multipleSelectAccount'].account = []
    },
    //
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
    showEdit(type, row, index) {
      row[type] = true
      if (['show_quantity_edit', 'show_price_edit', 'show_gross_edit'].includes(type)) {
        let focus_target = ''
        switch (type) {
          case 'show_quantity_edit':
            focus_target = 'stock_input'
            break
          case 'show_price_edit':
            focus_target = 'price_input'
            break
          case 'show_gross_edit':
            focus_target = 'gross_input'
            break
          default:
            focus_target = undefined
        }
        this.$nextTick(() => {
          let selector = `.${focus_target} .el-input__inner`
          document.querySelector(selector).focus()
        })
      }
    },
    hideEdit(type, row) {
      row[type] = false
    },
    // 指定价
    price(command) {
      if (command.fuc === 'setPress') {
        this.setPress(command.value, command.type)
      } else if (command.fuc === 'unpricing') {
        this.unpricing('指定价', 1)
      }
    },
    //指定毛利率
    margin(command) {
      if (command.fuc === 'setGrossMargins') {
        this.handleSetGrossMargins(command.value, 'all')
      } else if (command.fuc === 'unpricing') {
        this.unpricing('指毛利率', 2)
      }
    },
    checkPrice(inputPrice, data) {
      if (parseFloat(inputPrice) === parseFloat(data.virtualCustom_price)) {
        this.$message.error('指定价格不能等于当前指定价')
        return false
      }
      if (parseFloat(inputPrice) < data.base_price) {
        this.$message.error('指定价格不能低于保本价')
        return false
      }
      const reg = /^\d+(\.\d*)?$/
      if (!reg.test(inputPrice)) {
        this.$message.error('请输入正确格式的指定价')
        return false
      }
      return true
    },
    // 设置指定价
    setPress(data, type) {
      this.currentRow = data
      const ids = []
      const custom_price = ''
      this.isDisable = true
      if (type === 'all') {
        const status = []
        this._.forEach(this.multipleTable, (v) => {
          this._.forEach(v.child_product, (val) => {
            if (val.isSelected === true) {
              status.push(val.custom_price_type)
              ids.push(val.product_id)
            }
          })
        })
        this.setPriceOption = {
          open: true,
          data: ids,
          custom_price: ''
        }
      } else {
        // 单独设置指定价
        data.show_price_edit = false
        if (this.checkPrice(data.custom_price, data)) {
          const obj = {
            custom_price: Number(data.custom_price).toFixed(2),
            product_id: [data.product_id],
            custom_price_type: 1,
            not_show_message: true
          }
          updateCustomerPrice(obj).then(res => {
            resultAlert(res)
            this.renderList()
          }).catch(() => {
            data.custom_price = data.virtualCustom_price
          }).finally(() => {
            this.listLoading = false
          })
        } else {
          data.custom_price = data.virtualCustom_price
        }
      }
    },
    // 取消指定价
    unpricing(msg, type) {
      const advIds = []
      this.$confirm(`您确定要取消${msg}吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this._.forEach(this.multipleTable, (v) => {
          this._.forEach(v.child_product, (val) => {
            if (val.isSelected === true) {
              advIds.push(val.product_id)
            }
          })
        })
        const obj = {
          product_id: this._.compact(advIds),
          not_show_message: true,
          custom_price_type: type
        }
        cancelCustomPrice(obj).then((res) => {
          resultAlert(res)
          this.renderList()
        })
      }).catch(() => {
        this.listLoading = false
      })
    },
    // 毛利率检测
    checkGross(val, oldvalue) {
      if (parseFloat(val) === parseFloat(oldvalue)) {
        this.$message.error('指定毛利率不能等于当前指定毛利率')
        return false
      }
      if (parseFloat(val) <= 0) {
        this.$message.error('指定毛利率必须大于0')
        return false
      }
      const reg = /^\d\.([1-9]{1,2}|[0-9][1-9])$|^[1-9]\d{0,1}(\.\d{1,2}){0,1}$|^100(\.0{1,2}){0,1}$/
      if (!reg.test(val)) {
        this.$message.error('毛利率必须是0-100之间的数字(最多保留两位)')
        return
      }
      return true
    },
    // 设置毛利率
    handleSetGrossMargins(data, type) {
      this.currentRow = data
      const ids = []
      const gross_margin = ''
      if (type === 'all') {
        const status = []
        this._.forEach(this.multipleTable, (v) => {
          this._.forEach(v.child_product, (val) => {
            if (val.isSelected) {
              status.push(val.custom_price_type)
              ids.push(val.product_id)
            }
          })
        })
        this.setGrossMarginOption = {
          open: true,
          advtIds: ids,
          gross_margin: ''
        }
      } else {
        // 单独设置毛利率
        data.show_gross_edit = false
        if (this.checkGross(this.currentRow.custom_gross_margin, data.virtualGross_margin)) {
          // 验证通过调接口
          const obj = {
            custom_price: data.custom_gross_margin,
            product_id: [data.product_id],
            custom_price_type: 2,
            not_show_message: true
          }
          updateCustomerPrice(obj).then(res => {
            resultAlert(res)
            this.renderList()
          }).catch(() => {
            data.custom_gross_margin = data.virtualGross_margin
          }).finally(() => {
            this.loading = false
          })
        } else {
          data.custom_gross_margin = data.virtualGross_margin
        }
      }
    },
    // 指定库存
    stock(command) {
      if (command.fuc === 'setStock') {
        this.setStock('all')
        return
      }
      this.handleCancleStock()
    },
    // 验证库存
    checkStock(val) {
      if (/^\d+$/.test(val)) {
        return true
      }
      this.$message.error('只允许设置不小于0的整数')
      return false
    },
    setStock(type, row) {
      // 要设置库存的child_product id
      const ids = []
      // input设置/批量设置
      if (type === 'single') {
        row.show_quantity_edit = false
        if (this.checkStock(row.custom_quantity)) {
          // this.listLoading = true
          ids.push(row.product_id)
          // 调用接口设置，设置成功 是否指定库存显示为 是
          setCustomStock({ product_id: ids, custom_quantity: row.custom_quantity, not_show_message: true }).then((res) => {
            resultAlert(res)
            this.renderList()
          }).catch(() => {
            row.custom_quantity = row.virtualCustom_quantity
          }).finally(() => {
            this.listLoading = false
          })
        } else {
          // 验证不通过，恢复初始值显示
          row.custom_quantity = row.virtualCustom_quantity
        }
      } else {
        // 打开设置弹窗
        this.$prompt('请输入指定库存', '提示', {
          cancelButtonText: '取消',
          confirmButtonText: '确定'
        }).then(({ value }) => {
          if (this.checkStock(value)) {
            // 调用接口设置,设置成功刷新列表
            this.multipleTable.forEach(v => {
              v.child_product.forEach(k => {
                if (k.isSelected) {
                  ids.push(k.product_id)
                }
              })
            })
            this.listLoading = true
            setCustomStock({ product_id: ids, custom_quantity: value, not_show_message: true }).then((res) => {
              resultAlert(res)
              this.renderList()
            }).finally(() => {
              this.listLoading = false
            })
          }
        }).catch(() => {
        })
      }
    },
    // 取消指定库存
    handleCancleStock() {
      const ids = []
      this.listLoading = true
      this.multipleTable.forEach(v => {
        v.child_product.forEach(k => {
          if (k.isSelected) {
            ids.push(k.product_id)
          }
        })
      })
      // 调用取消接口
      cancleStock({ product_id: ids, not_show_message: true }).then((res) => {
        resultAlert(res)
        this.renderList()
      }).finally(() => {
        this.listLoading = false
      })
    },
    soldOut(type, row) {
      // 主列表下架 type = 'row' ，子列表下架 type = 'child', 批量下架 type = 'more'
      // status 固定传值
      const params = []
      if (type === 'row') {
        let product_id = []
        this._.forEach(row.child_product, v => {
          // 仅筛选在上架状态的子产品
          if ([120, 130].includes(Number(v.status))) {
            product_id.push(v.product_id)
          }
        })
        params.push({ advt_id: row.id, product_id })
      }
      if (type === 'child') {
        params.push({ advt_id: row.id, product_id: [row.product_id] })
      }
      if (type === 'more') {
        this._.forEach(this.multipleTable, v => {
          let product_id = []
          this._.forEach(v.child_product, k => {
            if (k.isSelected) {
              if ([120, 130].includes(Number(k.status))) {
                product_id.push(k.product_id)
              }
            }
          })
          params.push({ advt_id: v.id, product_id })
        })
      }
      if (!params.length) {
        this.$alert('该产品已经进入待下架状态，不能重复操作。', '提示', {
          dangerouslyUseHTMLString: true
        })
        return
      }
      this.$confirm('确定要下架吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        type: 'warning'
      }).then(() => {
        batchSoldOut({ params, not_show_message: true }).then((res) => {
          this.renderList()
          resultAlert(res)
        }).catch((err) => {
          this.$message.error(err)
        })
      })
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

.el-icon-edit {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  margin: auto;
}

.el-table th > .cell > svg {
  color: #fff;
  transform: rotate(90deg);
  transition: linear .5s;
  cursor: pointer;
}
</style>
