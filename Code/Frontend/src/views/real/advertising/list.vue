<template>
  <div v-loading="loading" element-loading-text="拼命加载中" element-loading-background="rgba(0, 0, 0, 0.3)">
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="Site Code" prop="account_id">
          <el-select v-model="listQuery.account_id" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="(item, key) in options.account" :key="key" :label="item.site_code" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Product ID" prop="product_id">
          <el-input v-model="listQuery.product_id" clearable placeholder="多个请用空格分隔" style="width: 200px;" @keyup.enter.native="handleFilter"></el-input>
        </el-form-item>
        <el-form-item label="平台商品号" prop="spu_id">
          <el-input v-model="listQuery.spu_id" clearable placeholder="平台商品号" style="width: 120px;" @keyup.enter.native="handleFilter"></el-input>
        </el-form-item>
        <el-form-item label="EAN" prop="ean">
          <el-input v-model="listQuery.ean" clearable placeholder="多个请用空格分隔" style="width: 150px;" @keyup.enter.native="handleFilter"></el-input>
        </el-form-item>
        <el-form-item label="产品线" prop="product_line">
          <el-select v-model="listQuery.product_line" clearable placeholder="请选择" style="width: 120px;">
            <el-option v-for="(item, key) in options.product_line" :key="key" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="错误类型" prop="error_type" v-if="listQuery.advt_status === PRODUCT_STATUS_CODE.FALSE">
          <el-select v-model="listQuery.error_type" clearable placeholder="请选择">
            <el-option label="MISSING_ATTRIBUTES" value="MISSING_ATTRIBUTES"></el-option>
            <el-option label="BLACKLISTED" value="BLACKLISTED"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间" prop="create_time">
          <el-date-picker
            v-model="listQuery.create_time"
            type="daterange"
            style="width: 220px;"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="刊登时间" prop="upload_time">
          <el-date-picker
            v-model="listQuery.upload_time"
            type="daterange"
            style="width: 220px;"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="价格类型" prop="price_type">
          <el-select v-model="listQuery.price_type" clearable placeholder="请选择" style="width: 120px;">
            <el-option v-for="(item,index) in priceTypeArr" :key="index"
                       :label="item.label" :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="listQuery.advt_status === PRODUCT_STATUS_CODE.ONLINE" label="是否指定库存" prop="is_custom_stock">
          <el-select v-model="listQuery.is_custom_stock" clearable placeholder="请选择" style="width: 120px;">
            <el-option label="否" value="0"></el-option>
            <el-option label="是" value="1"></el-option>
          </el-select>
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
    <div v-if="esAdvtStatus" class="header-box" style="position: relative;">
      <el-row class="left-row">
        <el-tag v-for="status in esAdvtStatus" :key="status.key" :type="statusSelected(status.key)" size="medium">
          <span @click="changeStatus(status.key)">{{ status.label }} ({{ status.total }})</span>
        </el-tag>
      </el-row>
      <!-- 之n-->
      <!-- <el-row class="right-row" v-show="listQuery.advt_status === PRODUCT_STATUS_CODE.ONLINE"> -->
      <el-row class="right-row">
        <el-button type="primary" size="mini" @click="openMoreTab" :disabled="multipleTable.length === 0">批量打开广告详情页</el-button>
        <el-dropdown size="mini" v-if="listQuery.advt_status === PRODUCT_STATUS_CODE.ONLINE" v-permission="permissions.customSetStock" split-button type="success" trigger="click" @command="stock">
          指定库存
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :disabled="multipleTable.length === 0" :command="{ fuc: 'setStock', type: 'all' }">
              设置指定库存
            </el-dropdown-item>
            <el-dropdown-item :disabled="multipleTable.length === 0" :command="{ fuc: 'cancleStock', type: 'all' }">
              取消指定库存
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown size="mini" v-if="listQuery.advt_status === PRODUCT_STATUS_CODE.ONLINE" split-button type="primary" trigger="click" @command="margin">
          指定毛利率
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :disabled="multipleTable.length === 0" :command="{ fuc: 'setGrossMargins', value: multipleTable, type: 'all' }">
              设置指定毛利率
            </el-dropdown-item>
            <el-dropdown-item :disabled="multipleTable.length === 0" :command="{ fuc: 'unpricing', value: multipleTable }">取消指定毛利率</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown size="mini" v-if="listQuery.advt_status === PRODUCT_STATUS_CODE.ONLINE" v-permission="permissions.customSetPrice" split-button type="success" trigger="click" @command="price">
          指定价
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :disabled="multipleTable.length === 0" :command="{ fuc: 'setPress', value: multipleTable, type: 'all' }">
              设置指定价
            </el-dropdown-item>
            <el-dropdown-item :disabled="multipleTable.length === 0" :command="{ fuc: 'unpricing', value: multipleTable }">
              取消指定价
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button v-show="listQuery.advt_status === PRODUCT_STATUS_CODE.ONLINE" type="danger" size="mini" :disabled="this.multipleTable.length === 0" v-permission="permissions.soldOut"
                   @click="underFileOrDelete(multipleTable,'all', 'under')"
        >
          批量下架
        </el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table
        ref="listTable"
        :key="newDate"
        :data="listData"
        v-loading.lock="listLoading"
        element-loading-text="努力加载中"
        border
        style="width: 100%"
        :default-expand-all="expand"
        @header-click="handleExpand"
        @select-all="handleSelectionChange"
        @select="handleSelectionRow"
        @selection-change="selectionChange"
        @sort-change="tableResortEvent"
      >
        <el-table-column type="expand" width="40">
          <template slot="header">
            <svg-icon icon-class="right" />
          </template>

          <template slot-scope="props">
            <el-table :data="props.row.child_product" border>
              <el-table-column width="40" align="center">
                <template slot-scope="scope">
                  <el-checkbox @input="smt(props.row)" v-model="scope.row.isSelected" />
                </template>
              </el-table-column>
              <el-table-column prop="istore_product_id" label="产品ID" width="80"></el-table-column>
              <el-table-column prop="product_name" label="产品名称" min-width="260"></el-table-column>
              <el-table-column prop="ean" label="EAN" width="110"></el-table-column>
              <el-table-column prop="base_price" label="保本价" width="66"></el-table-column>
              <el-table-column prop="discount_price" label="iStore价格" min-width="80"></el-table-column>
              <el-table-column prop="gross_margin" label="iStore毛利率(%)" min-width="110"></el-table-column>
              <el-table-column prop="current_price" label="当前销售价" min-width="80"></el-table-column>
              <el-table-column prop="current_gross_margin" label="当前毛利率(%)" min-width="110"></el-table-column>
              <el-table-column prop="price_type" label="价格类型" min-width="70">
                <template slot-scope="scope">
                  {{ getLabelByCode(scope.row.price_type) }}
                </template>
              </el-table-column>
              <el-table-column prop="custom_price" label="指定价" min-width="80" v-if="listQuery.advt_status === PRODUCT_STATUS_CODE.ONLINE">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_price_icon',scope.row)" @mouseleave="hideEdit('show_price_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position:relative;">
                    <el-input
                      v-if="scope.row.show_price_edit"
                      :ref="'price_input'+ scope.$index"
                      class="price_input inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_price"
                      @blur="setPress(scope.row, 'single')"
                      autofocus
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_price }}</span>
                    <i v-show="scope.row.show_price_icon && noLiveInput"
                       v-permission="permissions.customSetPrice"
                       class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:9px;right:-7px;cursor: pointer;"
                       @click="showEdit('show_price_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_price_edit',scope.row)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="custom_gross_margin" label="指定毛利率(%)" min-width="110" v-if="listQuery.advt_status === PRODUCT_STATUS_CODE.ONLINE">
                <template slot-scope="scope">
                  <div v-if="listQuery.advt_status === PRODUCT_STATUS_CODE.ONLINE" @mouseenter="showEdit('show_gross_icon',scope.row)" @mouseleave="hideEdit('show_gross_icon',scope.row)"
                       style="width:100%;height:32px;line-height:32px;position: relative;"
                  >
                    <el-input
                      v-if="scope.row.show_gross_edit"
                      :ref="'gross_input'+ scope.$index"
                      class="gross_input inline-edit-input"
                      size="small"
                      autofocus
                      v-model="scope.row.custom_gross_margin"
                      @blur="setGrossMargins(scope.row, 'single')"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_gross_margin }}</span>
                    <i v-show="scope.row.show_gross_icon && noLiveInput"
                       class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:9px;right:-7px;cursor: pointer;"
                       @click="showEdit('show_gross_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_gross_edit',scope.row)"
                    ></i>
                  </div>
                  <div v-else>{{ scope.row.custom_gross_margin }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="库存" align="center" width="104"></el-table-column>
              <el-table-column prop="custom_stock" label="指定库存" min-width="80" v-if="listQuery.advt_status === PRODUCT_STATUS_CODE.ONLINE">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_quantity_icon',scope.row)" @mouseleave="hideEdit('show_quantity_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position:relative;">
                    <el-input
                      v-if="scope.row.show_quantity_edit"
                      :ref="'stock_input'+ scope.$index"
                      class="stock_input inline-edit-input"
                      size="small"
                      autofocus
                      v-model="scope.row.custom_stock"
                      @blur="setStock('single',scope.row)"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_stock }}</span>
                    <i v-permission="permissions.customSetStock" v-show="scope.row.show_quantity_icon && noLiveInput" class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:7px;right:-7px;cursor: pointer;" @click="showEdit('show_quantity_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_quantity_edit',scope.row)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="is_custom_stock" label="是否指定库存" align="center" width="104" v-if="listQuery.advt_status === PRODUCT_STATUS_CODE.ONLINE">
                <template slot-scope="scope">
                  {{ Number(scope.row.is_custom_stock) === 1 ? '是' : '否' }}
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>

        <!-- <el-table-column v-if="listQuery.advt_status === PRODUCT_STATUS_CODE.ONLINE" type="selection" width="55"></el-table-column> -->
        <el-table-column type="selection" width="40" align="center"></el-table-column>
        <el-table-column prop="id" label="ID" width="80" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column prop="site_code" label="Site Code" width="80"></el-table-column>
        <el-table-column prop="istore_product_id" label="Product ID" width="100"></el-table-column>
        <el-table-column prop="spu_id" label="平台商品号" width="104"></el-table-column>
        <el-table-column prop="product_image" label="产品图片" width="70" align="center">
          <template slot-scope="scope">
            <PictureView
              v-if="scope.row.image_path && checkPickShow"
              :pictureList="[scope.row.picture]"
              :width="50"
              :height="50"
              :thumbnail="false"
              :defaultProps="defaultProps"
            >
            </PictureView>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="product_name" label="名称" min-width="260">
          <template slot-scope="scope">
            <a v-if="listQuery.advt_status === PRODUCT_STATUS_CODE.ONLINE"
               style="color: #409EFF;" :href="'https://www.real.de/product/' + scope.row.item_id + '/?id_unit=' + scope.row.spu_id"
               target="_blank"
            >
              {{ scope.row.product_name.trim() }}
            </a>
            <span v-else>{{ scope.row.product_name.trim() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="74" align="center">
          <template slot-scope="scope">
            <el-tag :type="Number(scope.row.type) === 1 ? 'success' : ''" size="small">{{ scope.row.type | getTypeLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="产品线" prop="product_line_name" width="90"></el-table-column>
        <el-table-column label="7天销量" prop="sales_7_days" width="68" align="center"></el-table-column>
        <el-table-column label="30天销量" prop="sales_30_days" width="68" align="center"></el-table-column>
        <el-table-column label="60天销量" prop="sales_60_days" width="68" align="center"></el-table-column>
        <el-table-column v-if="listQuery.advt_status === PRODUCT_STATUS_CODE.FALSE" label="错误原因" min-width="160">
          <template slot-scope="scope">
            <el-popover
              placement="right"
              width="800"
              trigger="hover"
            >
              <pre style="line-height: 24px; font-size: 12px; word-wrap: break-word; max-height: 500px; overflow-y: auto;">{{ scope.row.message }}</pre>
              <span slot="reference" style="color: #E6A23C">{{ scope.row.error_reason }}</span>
            </el-popover>
          </template>
        </el-table-column>
        <!--FALSE-->
        <el-table-column prop="create_time" label="创建时间" width="85" sort-by="create_time" sortable :sort-method="(a,b) => a-b">
          <template slot-scope="scope" v-if="scope.row.create_time !== no_time">{{ scope.row.create_time }}</template>
        </el-table-column>
        <el-table-column
          v-if="listQuery.advt_status === PRODUCT_STATUS_CODE.ONLINE || listQuery.advt_status === PRODUCT_STATUS_CODE.DELETE"
          prop="upload_time"
          label="刊登时间"
          width="85"
          sort-by="upload_time"
          sortable :sort-method="(a,b) => a-b"
        >
          <template slot-scope="scope" v-if="scope.row.upload_time !== no_time">{{ scope.row.upload_time }}</template>
        </el-table-column>
        <el-table-column prop="update_time" label="更新时间" width="85" sort-by="update_time" sortable :sort-method="(a,b) => a-b">
          <template slot-scope="scope" v-if="scope.row.update_time !== no_time">{{ scope.row.update_time }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openLog(scope.row)">日志</el-button>
            <el-button type="text" size="mini" @click="openTheNewTAB('real.advertising.detail', { id: scope.row.id })" v-permission="permissions.info">详情</el-button>
            <el-button
              type="text"
              v-if="listQuery.advt_status === PRODUCT_STATUS_CODE.ONLINE"
              size="mini"
              :disabled="Number(scope.row.is_allow_delete)===0"
              @click="underFileOrDelete(scope, 'single', 'under')"
              v-permission="permissions.soldOut"
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
          :page-sizes="[10, 20, 50,100]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
    <!--导入组件-->
    <set-gross-margins v-bind.sync="setGrossMarginOption" @renderList="renderList"></set-gross-margins>
    <set-price v-bind.sync="setPriceOption" @renderList="renderList"></set-price>
    <!-- istore更新日志 -->
    <istore-log v-bind.sync="logOptions"></istore-log>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { filterQueryParams } from '@/utils/help'
import { fetchList, getSelectAll, batchSoldOut, updateCustomerPrice, setCustomStock } from '@/api/real'
import { status_code, permissions } from './common/static'
import { resultAlert, customAlert } from './common/index'
import setGrossMargins from './components/setGrossMargins'
import setPrice from './components/setPrice'
import istoreLog from './components/istoreLog'

export default {
  name: 'PriceministertAdvertising',
  components: { setGrossMargins, setPrice, istoreLog },
  data() {
    return {
      no_time: '1970-01-01 08:00:00',
      // 常量
      PRODUCT_STATUS_CODE: status_code,
      product_disabled: false,
      permissions: permissions,
      // 页面loading
      loading: false,
      isDisable: false,
      newDate: new Date().getTime(),
      getOnSaleStatus: 0,
      title: '类型 ',
      filter: 'filter',
      options: [],
      priceTypeArr: [
        { label: 'iStore价格', value: 10 },
        { label: '动态调整价', value: 20 },
        { label: '指定价', value: 30 },
        { label: '指定毛利率', value: 40 },
        { label: '跟卖价', value: 50 }
      ],
      esAdvtStatus: {},
      listLoading: true,
      listTotal: null,
      listData: [],
      listQuery: {
        page: 1,
        per_page: 10,
        advt_status: status_code.ONLINE,
        account_id: undefined,
        product_id: undefined,
        spu_id: undefined,
        product_line: undefined,
        error_type: undefined,
        create_time: [],
        upload_time: [],
        price_type: undefined,
        is_custom_stock: undefined,
        sales_count: undefined,
        ean: undefined
      },
      pagination: null,
      createUserList: [],
      // statusTags: [],
      multipleTable: [],
      checkPickShow: true,
      // 批量添加normal广告
      addPlanDialogOption: {
        data: {},
        open: false
      },
      // table 下拉框是否全部展开
      expand: true,
      // 图片配置
      defaultProps: {
        originalKey: 'original',
        thumbnailKey: 'thumbnail'
      },
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
        advtId: '',
        isVary: false
      },
      noLiveInput: true
    }
  },
  created() {
    this.searchItem()
    this.renderList()
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
    // 日志
    openLog(row) {
      this.logOptions = {
        open: true,
        advtId: row.id,
        isVary: Number(row.type) === 2

      }
    },
    /**
     * @description: 批量打开详情
     */
    openMoreTab() {
      const detailsId = this.multipleTable.map(v => {
        return { id: v.id, status: v.status }
      })
      detailsId.map(v => {
        window.open(`/real/advertising/detail/${v.id}`)
      })
    },
    // 搜索中 sitecode,产品线,广告类型 optionArray获取
    searchItem() {
      getSelectAll().then(response => {
        this.options = response.data
      })
    },
    // 表格数据获取及状态栏
    renderList() {
      this.listLoading = true
      this.expand = true
      // 接口参数处理
      this.listQuery.product_id = this._.trim(this.listQuery.product_id)
      this.listQuery.spu_id = this._.trim(this.listQuery.spu_id)
      this.listQuery.ean = this._.trim(this.listQuery.ean)
      if (this.listQuery.advt_status !== this.PRODUCT_STATUS_CODE.FALSE) {
        this.listQuery.error_type = undefined
      }
      const queryParams = filterQueryParams(this.listQuery)
      delete queryParams.sales_count
      if (this.listQuery.sales_count) {
        const sort = {}
        const value = this.listQuery.sales_count.split('-')
        sort[value[0]] = value[1]
        if (!this._.isEmpty(sort)) {
          queryParams.sort = sort
        }
      }
      // 表格选择为空
      this.multipleTable = []
      this.listData = []
      fetchList(queryParams).then(response => {
        const listData = response.data.list
        this.pagination = response.data.pagination
        this.esAdvtStatus = response.data.statistics
        this._.forEach(listData, (v) => {
          // 判断时所需要的原始变量
          v.virtualGross_margin = v.gross_margin
          // v.virtualCustom_price = v.custom_price
          v.picture = {
            thumbnail: v.thumb_image_path,
            original: v.image_path
          }
          v.child_product = [Object.assign(v.child_product, {
            isSelected: false,
            virtual_gross_margin: v.custom_gross_margin,
            virtual_custom_price: v.custom_price,
            virtual_custom_stock: v.custom_stock,
            show_quantity_edit: false,
            show_quantity_icon: false,
            show_price_icon: false,
            show_price_edit: false,
            show_gross_icon: false,
            show_gross_edit: false,
            account_id: v.account_id
          })]
        })
        this.listData = listData
        this.checkPickShow = false
        this.$nextTick(() => {
          this.checkPickShow = true
        })
        document.querySelector('.el-table__body-wrapper').scrollTop = 0
      }).finally(() => {
        this.listLoading = false
      })
    },
    // 详情
    openTheNewTAB(name, params) {
      const { href } = this.$router.resolve({
        name: name,
        params: params || {}
      })
      window.open(href, '_blank')
    },
    // 删除下架功能（单个or批量）
    underFileOrDelete(row, type, sign) {
      let ids = []
      if (type === 'all') {
        this._.map(this.multipleTable, (item) => {
          if (item.is_allow_delete === 1) {
            ids.push(item.id)
          }
        })
      } else {
        ids = [row.row.id]
      }
      let api, message
      if (sign === 'under') {
        // statusResult = this._.indexOf(this.status, 0)
        api = batchSoldOut
        message = '是否要下架此产品'
      }
      // else {
      //   statusResult = 1
      //   api = batchDelete
      //   message = '确定要删除此产品吗'
      // }
      if (ids.length) {
        this.$confirm(message, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          api({ id: ids, not_show_message: true }).then(response => {
            this.listLoading = false
            resultAlert(response, this.renderList)
            // this.multipleTable = []
          })
        }).catch(() => {
          this.listLoading = false
        })
      } else {
        this.$alert('广告已经进入待下架状态，不可再次提交。', '提示', {
          dangerouslyUseHTMLString: true
        })
      }
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
    selectionChange(val) {
      this.multipleTable = val
      this.checkNum++
    },
    smt(row) {
      const check = this._.some(row.child_product, (v, i) => {
        return v.isSelected
      })
      if (check) {
        this.$refs.listTable.toggleRowSelection(row, true)
      } else {
        this.$refs.listTable.toggleRowSelection(row, false)
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
      this.renderList()
    },
    changeStatus(key) {
      this.newDate = new Date().getTime()
      if (this.listQuery.advt_status !== key) {
        this.listQuery.advt_status = key
        this.listQuery.page = 1
        this.pagination = undefined
        this.filter = 'filter'
        this.renderList()
      }
    },
    statusSelected(key) {
      return this.listQuery.advt_status === key ? 'warning' : ''
    },
    // 清理缩略图缓存
    tableResortEvent() {
      this.checkPickShow = false
      this.$nextTick(() => {
        this.checkPickShow = true
      })
    },
    handleExpand(column) {
      if (column.type === 'expand') {
        this.expand = !this.expand
        // 强制刷新DOM
        this.newDate = new Date().getTime()
      }
    },
    // 指定价
    price(command) {
      if (command.fuc === 'setPress') {
        this.setPress(command.value, command.type)
      } else if (command.fuc === 'unpricing') {
        this.unpricing('指定价', 1, 30)
      }
    },
    //指定毛利率
    margin(command) {
      if (command.fuc === 'setGrossMargins') {
        this.setGrossMargins(command.value, command.type)
      } else if (command.fuc === 'unpricing') {
        this.unpricing('指定毛利率', 2, 40)
      }
    },
    // 设置指定价
    setPress(data, type) {
      this.currentRow = data
      let ids = []
      let custom_price = ''
      this.isDisable = true
      if (type === 'all') {
        const status = []
        this._.forEach(this.multipleTable, (v) => {
          this._.forEach(v.child_product, (val) => {
            if (val.isSelected === true) {
              status.push(val.is_custom_price)
              ids.push(val)
            }
          })
        })
        this.setPriceOption = {
          open: true,
          data: ids,
          custom_price: ''
        }
      } else {
        if (this.checkPrice(data.custom_price, data.virtual_custom_price)) {
          const obj = {
            product: [{ id: data.product_id, istore_product_id: data.istore_product_id, account_id: data.account_id, custom_price: data.custom_price }],
            price_type: 30,
            action: 'add',
            rate: 0,
            not_show_message: true
          }
          updateCustomerPrice(obj).then((res) => {
            customAlert(res)
          }).catch(err => {
            data.custom_price = data.virtual_custom_price
            this.$message.error(err)
          }).finally(() => {
            this.renderList()
          })
        } else {
          data.custom_price = data.virtual_custom_price
          data.show_price_edit = false
          data.show_price_icon = false
        }
        this.noLiveInput = true
      }
    },
    // 取消指定价
    unpricing(msg, type, price_type) {
      const advIds = []
      this.$confirm(`您确定要取消${msg}吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this._.forEach(this.multipleTable, (v) => {
          this._.forEach(v.child_product, (val) => {
            if (val.isSelected === true) {
              advIds.push(val)
            }
          })
        })
        const product = []
        this._.forEach(this._.compact(advIds), v => {
          product.push({ id: v.product_id, istore_product_id: v.istore_product_id, account_id: v.account_id, custom_price: 0 })
        })
        const obj = {
          product,
          custom_type: type,//1为取消指定价，2为取消指定毛利率
          action: 'cancel',
          price_type: price_type,
          rate: 0,
          not_show_message: true
        }
        updateCustomerPrice(obj).then((res) => {
          if (res.data) {
            customAlert(res)
          } else {
            this.$message.error(res.message)
          }
        }).finally(() => {
          this.renderList()
        })
      })
    },
    // 检测毛利率
    checkGross(value, oldvalue) {
      if (value === oldvalue) {
        this.$message.error('指定毛利率未更改')
        return false
      }
      const reg = /^\d\.([1-9]{1,2}|[0-9][1-9])$|^[1-9]\d{0,1}(\.\d{1,2}){0,1}$|^100(\.0{1,2}){0,1}$/
      if (!reg.test(value)) {
        this.$message.error('毛利率必须是0-100之间的数字')
        return false
      }
      return true
    },
    // 检测指定价
    checkPrice(value, oldvalue) {
      if (value === oldvalue) {
        this.$message.error('指定价未更改')
        return false
      }
      const reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,2}?$/
      if (!reg.test(value)) {
        this.$message.error('存在非法字符')
        return false
      }
      return true
    },
    // 设置毛利率
    setGrossMargins(data, type) {
      console.log(data)
      this.currentRow = data
      let ids = []
      let gross_margin = ''
      if (type === 'all') {
        const status = []
        this._.forEach(this.multipleTable, (v) => {
          this._.forEach(v.child_product, (val) => {
            if (val.isSelected === true) {
              status.push(val.is_custom_price)
              ids.push(val)
            }
          })
        })
        this.setGrossMarginOption = {
          open: true,
          advtIds: ids,
          gross_margin: ''
        }
      } else {
        if (this.checkGross(data.custom_gross_margin, data.virtual_gross_margin)) {
          const obj = {
            product: [{ id: data.product_id, istore_product_id: data.istore_product_id, account_id: data.account_id, custom_price: 0 }],
            price_type: 40,
            action: 'add',
            rate: data.custom_gross_margin,
            not_show_message: true
          }
          updateCustomerPrice(obj).then((res) => {
            customAlert(res)
          }).catch(err => {
            this.$message.error(err)
          }).finally(() => {
            this.renderList()
          })
        } else {
          data.custom_gross_margin = data.virtual_gross_margin
          data.show_gross_edit = false
          data.show_gross_icon = false
        }
        this.noLiveInput = true
      }
    },
    // 指定库存
    stock(command) {
      if (command.fuc === 'setStock') {
        this.setStock('all')
      } else {
        this.cancleStock()
      }
    },
    // 验证库存
    checkStock(val, oldvalue) {
      if (val === oldvalue) {
        this.$message.error('指定库存未作更改')
        return false
      }
      if (!/^\d+$/.test(val)) {
        this.$message.error('只允许设置整数')
        return false
      }
      return true
    },
    setStock(type, row) {
      // 要设置库存的child_product id
      const ids = []
      // input设置/批量设置
      if (type === 'single') {
        if (this.checkStock(row.custom_stock, row.virtual_custom_stock)) {
          // this.listLoading = true
          // 调用接口设置，设置成功 是否指定库存显示为 是
          setCustomStock({
            action: 'add',
            product: [{ id: row.product_id, istore_product_id: row.istore_product_id, account_id: row.account_id, custom_stock: row.custom_stock }],
            not_show_message: true
          }).then((res) => {
            customAlert(res)
          }).catch((err) => {
            row.custom_stock = row.virtual_custom_stock
            this.$message.error(err)
          }).finally(() => {
            this.listLoading = false
            this.renderList()
          })
        } else {
          // 验证不通过，恢复初始值显示
          row.custom_stock = row.virtual_custom_stock
          row.show_quantity_edit = false
          row.show_quantity_icon = false
        }
        this.noLiveInput = true
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
                  ids.push(k)
                }
              })
            })
            this.listLoading = true
            const product = []
            this._.forEach(this._.compact(ids), v => {
              product.push({ id: v.product_id, istore_product_id: v.istore_product_id, account_id: v.account_id, custom_stock: value })
            })
            setCustomStock({ product, action: 'add', not_show_message: true }).then((res) => {
              customAlert(res)
            }).catch(err => {
              this.$message.error(err)
            }).finally(() => {
              this.listLoading = false
              this.renderList()
            })
          }
        }).catch(() => {
        })
      }
    },
    cancleStock() {
      this.$confirm('您确定要取消指定库存吗？', '提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        const ids = []
        this.listLoading = true
        this.multipleTable.forEach(v => {
          v.child_product.forEach(k => {
            if (k.isSelected) {
              ids.push(k)
            }
          })
        })
        const product = []
        this._.forEach(this._.compact(ids), v => {
          product.push({ id: v.product_id, istore_product_id: v.istore_product_id, account_id: v.account_id, custom_stock: 0 })
        })
        // 调用取消接口
        setCustomStock({ product, action: 'cancel', not_show_message: true }).then((res) => {
          customAlert(res)
        }).catch(err => {
          this.$message.error(err)
        }).finally(() => {
          this.renderList()
        })
      })
    },
    showEdit(type, row) {
      if (this.noLiveInput) {
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
          this.noLiveInput = false
        }

      }
    },
    hideEdit(type, row) {
      row[type] = false
    }
  }
  ,
  computed: {
    ...
      mapGetters({
        userPerssions: 'permissions'
      })
  }
  ,
  filters: {
    getTypeLabel(val) {
      const types = [{ key: 1, label: 'Normal' }, { key: 2, label: 'Variation' }]
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
    ,
    formatChildProIds(ids) {
      let idsString = ''
      for (const value of ids) {
        idsString += value + '\n'
      }
      return idsString
    }
  }
  ,
  watch: {
    // table展开icon监听
    expand(val) {
      this.$nextTick(() => {
        if (val) {
          document.querySelector('.el-table th>.cell > svg').style.transform = 'rotate(90deg)'
        } else {
          document.querySelector('.el-table th>.cell > svg').style.transform = 'rotate(0deg)'
        }
      })
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
<style rel="stylesheet/scss" lang="scss">
.el-input.is-disabled.draft-edit-disable .el-input__inner {
  color: #606266
}
</style>
