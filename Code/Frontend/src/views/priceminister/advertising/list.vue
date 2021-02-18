<template>
  <div v-loading="loading" element-loading-text="拼命加载中" element-loading-background="rgba(0, 0, 0, 0.3)">
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="Site Code" prop="accountId">
          <el-select v-model="listQuery.accountId" clearable placeholder="请选择" style="width: 200px;">
            <el-option v-for="(item, key) in options.PmAdvtAccount" :key="key" :label="item.site_code" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Product ID" prop="advtProductIds">
          <el-input v-model="listQuery.advtProductIds" clearable placeholder="多个请用空格分隔" style="width: 200px;" @keyup.enter.native="handleFilter"></el-input>
        </el-form-item>
        <el-form-item label="平台商品号" prop="advtSpuId">
          <el-input v-model="listQuery.advtSpuId" clearable placeholder="平台商品号" style="width: 120px;" @keyup.enter.native="handleFilter"></el-input>
        </el-form-item>
        <el-form-item label="产品线" prop="productLine">
          <el-select v-model="listQuery.productLine" clearable placeholder="请选择" style="width: 120px;">
            <el-option v-for="(item, key) in options.PmProductLine" :key="key" :label="item.name" :value="item.id"></el-option>
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
        <!-- <el-form-item v-if="listQuery.advtStatus === 110" label="是否指定价" prop="price_type">
          <el-select v-model="listQuery.price_type" clearable placeholder="请选择" style="width: 120px;">
            <el-option label="是" value="1"></el-option>
            <el-option label="否" value="0"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="价格类型" prop="price_type">
          <el-select v-model="listQuery.price_type" clearable placeholder="请选择" style="width: 120px;">
            <el-option
              v-for="item in priceTypeArr"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="setPriceStatus.includes(listQuery.advtStatus)" label="是否指定库存" prop="is_custom_stock">
          <el-select v-model="listQuery.is_custom_stock" clearable placeholder="请选择" style="width: 120px;">
            <el-option label="是" value="1"></el-option>
            <el-option label="否" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="错误类型" v-if="PRODUCT_STATUS_CODE.UPLOAD_ERROR === listQuery.advtStatus" prop="error_type">
          <el-select v-model="listQuery.error_type" clearable placeholder="请选择" style="width: 200px;">
            <el-option v-for="(item, key) in errorType" :key="key" :label="item.name" :value="item.id"></el-option>
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
    <div v-if="options.esAdvtStatus" class="header-box" style="position: relative;">
      <el-row class="left-row">
        <el-tag v-for="status in options.esAdvtStatus" :key="status.key" :type="statusSelected(status.key)" size="medium">
          <span @click="changeStatus(status.key)">{{ status.label }} ({{ status.total }})</span>
        </el-tag>
      </el-row>
      <!-- 之n-->
      <!-- <el-row class="right-row" v-show="[PRODUCT_STATUS_CODE.NORMAL, PRODUCT_STATUS_CODE.MANUAL_CANCELLED, PRODUCT_STATUS_CODE.OUT_OF_STOCK].indexOf(listQuery.advtStatus) > -1"> -->
      <el-row class="right-row">
        <el-button type="primary" size="mini" @click="openMoreTab" :disabled="multipleTable.length === 0" v-permission="permissions.info">批量打开广告详情页</el-button>
        <el-dropdown v-if="setPriceStatus.includes(listQuery.advtStatus)" v-permission="permissions.customSetStock" size="mini" split-button type="success" trigger="click" @command="stock">
          指定库存
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :disabled="this.multipleTable.length === 0" :command="{ fuc: 'setStock', type: 'all' }">
              设置指定库存
            </el-dropdown-item>
            <el-dropdown-item :disabled="this.multipleTable.length === 0" :command="{ fuc: 'cancleStock', type: 'all' }">
              取消指定库存
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown v-if="listQuery.advtStatus === 110" v-permission="permissions.customSetPrice" size="mini" split-button type="primary" trigger="click" @command="grossMargins">
          指定毛利率
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :disabled="multipleTable.length === 0" :command="{ fuc: 'setGrossMargins', value: multipleTable, type: 'all' }">
              设置指定毛利率
            </el-dropdown-item>
            <el-dropdown-item :disabled="multipleTable.length === 0" :command="{ fuc: 'unpricing', value: multipleTable }">
              取消指定毛利率
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown v-if="listQuery.advtStatus === 110" v-permission="permissions.customSetPrice" size="mini" split-button type="primary" trigger="click" @command="price">
          指定价
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :disabled="multipleTable.length === 0" :command="{ fuc: 'setPress', value: multipleTable, type: 'all' }">
              设置指定价
            </el-dropdown-item>
            <el-dropdown-item :disabled="multipleTable.length === 0" :command="{ fuc: 'unpricing', value: multipleTable }">
              取消指定价
            </el-dropdown-item>
            <!-- <el-dropdown-item :disabled="multipleTable.length === 0" :command="{ fuc: 'setGrossMargins', value: multipleTable, type: 'all' }">
              设置毛利率
            </el-dropdown-item> -->
          </el-dropdown-menu>
        </el-dropdown>
        <el-button
          v-show="listQuery.advtStatus === PRODUCT_STATUS_CODE.NORMAL"
          type="danger"
          size="mini"
          @click="underFileOrDelete(multipleTable,'all', 'under')"
          :disabled="multipleTable.length === 0"
          v-permission="permissions.soldOut"
        >
          批量下架
        </el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table ref="listTable" :key="newDate" :data="listData"
                v-loading.lock="listLoading"
                element-loading-text="努力加载中"
                border
                style="width: 100%"
                :default-expand-all="expand"
                @select-all="handleSelectionChange"
                @select="handleSelectionRow"
                @selection-change="selectionChange"
                @sort-change="tableResortEvent"
                @header-click="handleExpand"
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
              <el-table-column prop="istore_product_id" label="产品ID" min-width="100"></el-table-column>
              <el-table-column prop="name" label="产品名称" min-width="260"></el-table-column>
              <el-table-column prop="base_price" label="保本价" />
              <el-table-column prop="discount_price" label="iStore价格" />
              <el-table-column prop="gross_margin" label="iStore毛利率(%)" width="130" />
              <el-table-column prop="current_price" label="当前售价" />
              <el-table-column prop="current_gross_margin" label="当前毛利率(%)" width="140" />
              <el-table-column prop="price_type" label="价格类型" min-width="82">
                <template slot-scope="scope">
                  {{ getLabelByCode(scope.row.price_type) }}
                </template>
              </el-table-column>
              <el-table-column prop="custom_price" label="指定价" v-if="listQuery.advtStatus === 110">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_price_icon',scope.row)" @mouseleave="hideEdit('show_price_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position:relative;">
                    <el-input
                      v-if="scope.row.show_price_edit"
                      :ref="'price_input'+ scope.$index"
                      class="price_input inline-edit-input"
                      size="small"
                      autofocus
                      v-model="scope.row.custom_price"
                      @blur="setPress(scope.row, 'single')"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_price }}</span>
                    <i v-show="scope.row.show_price_icon && !hasActiveInput"
                       v-permission="permissions.customSetPrice"
                       class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:9px;right:-7px;"
                       @click="showEdit('show_price_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_price_edit',scope.row)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="custom_gross_margin" label="指定毛利率(%)" width="140">
                <template slot-scope="scope">
                  <div
                    v-if="listQuery.advtStatus === 110"
                    @mouseenter="showEdit('show_gross_icon',scope.row)"
                    @mouseleave="hideEdit('show_gross_icon',scope.row)"
                    style="width:100%;height:32px;line-height:32px;position: relative;"
                  >
                    <el-input
                      v-if="scope.row.show_gross_edit"
                      :ref="'gross_input'+ scope.$index"
                      class="gross_input inline-edit-input"
                      autofocus
                      size="small"
                      v-model="scope.row.custom_gross_margin"
                      @blur="setGrossMargins(scope.row, 'single')"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_gross_margin }}</span>
                    <i v-show="scope.row.show_gross_icon && !hasActiveInput"
                       class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:9px;right:-7px;"
                       @click="showEdit('show_gross_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_gross_edit',scope.row)"
                    ></i>
                  </div>
                  <div v-else>{{ scope.row.custom_gross_margin }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="custom_stock" label="指定库存" min-width="60" v-if="setPriceStatus.includes(listQuery.advtStatus)">
                <template slot-scope="scope">
                  <!--<div @click="setStock('single',scope.row)">{{ scope.row.custom_stock }}</div>-->
                  <div @mouseenter="showEdit('show_quantity_icon',scope.row)" @mouseleave="hideEdit('show_quantity_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position:relative;">
                    <el-input
                      v-if="scope.row.show_quantity_edit"
                      :ref="'stock_input'+ scope.$index"
                      class="stock_input inline-edit-input"
                      autofocus
                      size="small"
                      v-model="scope.row.custom_stock"
                      @blur="setStock('single',scope.row)"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_stock }}</span>
                    <i
                      v-permission="permissions.customSetStock"
                      v-show="scope.row.show_quantity_icon && !hasActiveInput"
                      class="el-icon-edit" title="编辑"
                      style="color:#409EFF; font-size:20px;top:7px;right:-7px;"
                      @click="showEdit('show_quantity_edit',scope.row, scope.$index)"
                      @blur="hideEdit('show_quantity_edit',scope.row)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="库存" align="center" width="104"></el-table-column>
              <el-table-column prop="custom_stock_type" label="是否指定库存" align="center" width="104" v-if="setPriceStatus.includes(listQuery.advtStatus)">
                <template slot-scope="scope">
                  {{ scope.row.is_custom_stock === 1 ? '是' : '否' }}
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="43" align="center"></el-table-column>
        <el-table-column prop="id" label="ID" width="60" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column prop="site_code" label="Site Code" min-width="120"></el-table-column>
        <el-table-column prop="istore_product_id" label="Product ID" min-width="80"></el-table-column>
        <el-table-column prop="sku" label="Sku" min-width="100" />
        <el-table-column prop="spu_id" label="平台商品号" min-width="100"></el-table-column>
        <el-table-column prop="product_image" label="产品图片" width="70" align="center">
          <template slot-scope="scope">
            <picture-view
              v-if="scope.row.product_image && checkPickShow"
              :pictureList="[scope.row.picture]"
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
            <div v-if="!scope.row.canEditName" @mouseenter="setIcon(scope.row, true)" @mouseleave="setIcon(scope.row,false)" style="padding-right:25px;position:relative;">
              <i v-show="scope.row.showIcon && listQuery.advtStatus === PRODUCT_STATUS_CODE.NORMAL"
                 class="el-icon-edit"
                 title="编辑"
                 style="color:#409EFF; font-size:20px;display:inline-block;margin-left:350px;"
                 v-permission="permissions.edits"
                 @click="editName(scope.row)"
              ></i>
              <div>
                <a v-if="[110,130].includes(listQuery.advtStatus)" style="color: #409EFF;" :href="'https://fr.shopping.rakuten.com/offer/buy/' + scope.row.spu_id"
                   target="_blank"
                >
                  {{ scope.row.product_name.trim() }}
                </a>
                <span v-else>{{ scope.row.product_name.trim() }}</span>
              </div>
            </div>
            <div v-else>
              <el-input size="mini" class="custom-edit-input" v-model="scope.row.product_name" @blur="saveEditName(scope.row)"></el-input>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" width="70" label="类型" align="center">
          <template slot-scope="scope">
            <el-tag :type="Number(scope.row.type) === 1 ? 'success' : ''" size="small">{{ scope.row.type | getTypeLabel(options) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="产品线" prop="product_line_name" width="60"></el-table-column>
        <el-table-column label="7天销量" prop="sales_7_days" width="70"></el-table-column>
        <el-table-column label="30天销量" prop="sales_30_days" width="70"></el-table-column>
        <el-table-column label="60天销量" prop="sales_60_days" width="70"></el-table-column>
        <el-table-column
          prop="reason" label="错误原因"
          min-width="120"
          v-if="[PRODUCT_STATUS_CODE.UPLOAD_ERROR, PRODUCT_STATUS_CODE.CANCEL_ERROR].indexOf(listQuery.advtStatus) > -1 "
        >
          <template slot-scope="scope">
            <div v-if="scope.row.reason ? scope.row.reason.length > 90 : false">
              <el-popover placement="right" width="480" trigger="hover">
                <p style="line-height: 24px; font-size: 12px; word-wrap: break-word; max-height: 400px; overflow-y: auto;">{{ scope.row.reason }}</p>
                <p slot="reference" style="width: 100%; color: #E6A23C; margin: 0;" class="in-two-line">{{ scope.row.reason.slice(0, 45) }}...</p>
              </el-popover>
            </div>
            <div v-else>{{ scope.row.reason }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="85" sortable :sort-method="(a,b) => a-b">
          <template slot-scope="scope">{{ scope.row.create_time }}</template>
        </el-table-column>
        <el-table-column
          v-if="listQuery.advtStatus !== PRODUCT_STATUS_CODE.DRAPT_CODE && listQuery.advtStatus !== PRODUCT_STATUS_CODE.UPLOAD_ERROR && listQuery.advtStatus !== PRODUCT_STATUS_CODE.WAIT_SHELVE"
          prop="upload_time"
          label="刊登时间"
          width="85"
          sort-by="upload_time"
          sortable
        >
          <template slot-scope="scope" v-if="scope.row.upload_time !== no_time && scope.row.upload_time !== default_time">{{ scope.row.upload_time }}</template>
        </el-table-column>
        <el-table-column prop="update_time" label="更新时间" width="85" sortable :sort-method="(a,b) => a-b">
          <template slot-scope="scope" v-if="scope.row.update_time !== no_time">{{ scope.row.update_time }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openLog(scope.row)" v-permission="permissions.log">日志</el-button>
            <el-button
              type="text"
              v-if="listQuery.advtStatus !== PRODUCT_STATUS_CODE.PENDING"
              size="mini"
              @click="openTheNewTAB('priceminister.advertising.detail', { id: scope.row.id })"
              v-permission="permissions.info"
            >
              详情
            </el-button>
            <el-button
              type="text"
              v-if="listQuery.advtStatus === PRODUCT_STATUS_CODE.PENDING || listQuery.advtStatus === 180"
              @click="handleSendDraft(scope.row)"
              size="mini"
              v-permission="permissions.sendToDraft"
            >
              send to draft
            </el-button>
            <el-button
              type="text"
              v-if="listQuery.advtStatus === PRODUCT_STATUS_CODE.NORMAL"
              size="mini"
              @click="underFileOrDelete(scope, 'single', 'under')"
              v-permission="permissions.soldOut"
            >
              下架
            </el-button>
            <el-button
              type="text"
              v-if="listQuery.advtStatus === PRODUCT_STATUS_CODE.MANUAL_CANCELLED"
              size="mini"
              @click="upperShelfAdvt(scope.row)"
              v-permission="permissions.upperShelf"
              :disabled="parseInt(scope.row.is_upper_shelf) === 0"
            >
              上架
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
import { fetchList, getSelectAll, batchSoldOut, upperAdvt, apiUpdateAdvt, apiSendToDraft, updateCustomerPrice, setCustomStock } from '@/api/priceminister'
// import { customAlert } from './common/index'
import { resultAlert } from '@/utils/index'
import advertStatic from './common/static'
import setGrossMargins from './components/setGrossMargins'
import setPrice from './components/setPrice'
import istoreLog from './components/istoreLog'

export default {
  components: { setGrossMargins, setPrice, istoreLog },
  data() {
    return {
      priceTypeArr: [
        { label: 'iStore价格', value: 10 },
        { label: '动态调整价', value: 20 },
        { label: '指定价', value: 30 },
        { label: '指定毛利率', value: 40 },
        { label: '跟卖价', value: 50 }
      ],
      hasActiveInput: false,
      no_time: 0,
      default_time: '1970-01-01 08:00:00',
      // 线上状态 110 == Normal 10 == Out Of Stock
      setPriceStatus: [110, 130],
      // 常量

      PRODUCT_STATUS_CODE: advertStatic.PRODUCT_STATUS_CODE,
      product_disabled: false,
      permissions: advertStatic.permissions,
      // 页面loading
      loading: false,
      isDisable: false,
      newDate: new Date().getTime(),
      ids: [],
      getOnSaleStatus: 0,
      title: '类型 ',
      filter: 'filter',
      options: [],
      listLoading: true,
      listTotal: null,
      listData: [],
      listQuery: {
        page: 1,
        per_page: 10,
        accountId: undefined,
        advtProductIds: undefined,
        advtSpuId: undefined,
        productLine: undefined,
        advtType: [],
        // advtStatus: advertStatic.PRODUCT_STATUS_CODE.DRAPT_CODE,
        advtStatus: 110,
        advtCreated: [],
        upload_time: [],
        price_type: undefined,
        is_custom_stock: undefined,
        error_type: undefined,
        sales_count: undefined
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
      expand: true,
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
      errorType: [
        {
          id: '10',
          name: ' 广告库存为零'
        },
        {
          id: '20',
          name: '标题或描述为空'
        },
        {
          id: '30',
          name: '标题重复'
        },
        {
          id: '40',
          name: '缺少属性/属性值不正确'
        },
        {
          id: '50',
          name: '禁售产品'
        },
        {
          id: '60',
          name: '置N'
        },
        {
          id: '70',
          name: '侵权违规'
        }
      ],
      logOptions: {
        open: false,
        advtId: '',
        isVary: false
      }
    }
  },
  created() {
    this.draftEditAdvt()
    this.searchItem()
    this.renderList()
  },
  destroyed() {
    sessionStorage.removeItem('tagPrice')
    sessionStorage.removeItem('product_name')
    sessionStorage.removeItem('inventory')
  },
  methods: {
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
        window.open(`/priceminister/advertising/detail/${v.id}`)
      })
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
    htmlspecialchars(str) {
      str = str.replace(/&/g, '&amp;')
      str = str.replace(/</g, '&lt;')
      str = str.replace(/>/g, '&gt;')
      str = str.replace(/"/g, '&quot;')
      return str.length
    },
    cloneDeep(param, val) {
      const data = this._.cloneDeep(this[param])
      this[param] = val
      this[param] = data
    },
    handleSendDraft(row) {
      this.$confirm('确认操作吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        type: 'warning'
      }).then(() => {
        const obj = {
          id: row.id,
          product_id: row.product_main_id
        }
        apiSendToDraft(obj).then(res => {
          this.renderList()
        })
      }).catch(() => {
      })
    },
    // draft状态先编辑广告权限
    draftEditAdvt() {
      this._.forEach(this.userPerssions, (item) => {
        if (item.tag === 'krelevenstreet.advt.updatetitle') {
          if (item.enable) {
            this.product_disabled = false
          } else {
            this.product_disabled = true
          }
        }
      })
    },

    // 搜索中 sitecode,产品线,广告类型 optionArray获取
    searchItem() {
      getSelectAll().then(response => {
        this.options = this._.assign(this.options, response.data || {})
        // this.siteArray = response.data.krAdvtAccount
      })
    },
    setIcon(row, status) {
      this.$nextTick(() => {
        this.listData.forEach(v => {
          v.showIcon = false
        })
        row.showIcon = status
      })
    },
    editName(row) {
      row.canEditName = true
      row.product_name = row.virtualName
      setTimeout(() => {
        document.querySelector('.el-table tr td div.cell div.custom-edit-input input').focus()
      })
    },
    // 保存广告名称
    saveEditName(row) {
      if (!this.checkEditName(row)) {
        const obj = {
          id: row.id,
          title: row.product_name
        }
        apiUpdateAdvt(obj).then(res => {
          this.renderList()
        }).catch(() => {
          this.editName(row)
        })
      }
    },
    // 校验编辑广告名称
    checkEditName(row) {
      let msg
      if (!row.product_name.trim()) {
        // 非空验证
        msg = '标题不能为空'
      }
      if (row.product_name.trim() === row.virtualName.trim()) {
        // 输入标题未改变
        msg = '该广告标题没有发生更改'
      }
      if (this.htmlspecialchars(row.product_name) > 200) {
        msg = '最多可输入200个字符，请重新编辑'
      }
      if (msg) {
        this.$confirm(msg, '提示', {
          confirmButtonText: '重新编辑',
          cancelButtonText: '取消编辑',
          closeOnClickModal: false,
          closeOnPressEscape: false,
          type: 'warning'
        }).then(() => {
          this.editName(row)
        }).catch(() => {
          this.cancleEditName(row)
        })
      }
      return Boolean(msg)
    },
    // 取消编辑
    cancleEditName(row) {
      row.canEditName = false
      row.product_name = row.virtualName
    },
    // 表格数据获取及状态栏
    renderList() {
      this.listLoading = true
      this.expand = true
      // 接口参数处理
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
      // 表格选择为空
      this.multipleTable = []
      fetchList(queryParams).then(response => {
        this.listData = response.data.list
        this.pagination = response.data.pagination
        this.options.esAdvtStatus = response.data.statistics
        this.createUserList = response.data.createUser
        this._.forEach(this.listData, (v) => {
          v.showIcon = false
          v.canEditName = false
          v.virtualName = v.product_name
          // 判断时所需要的原始变量
          v.virtualCustom_gross_margin = v.custom_gross_margin
          v.virtualCustom_price = v.custom_price
          // v.virtualProduct_name = v.product_name
          v.picture = {
            thumbnail: v.thumb_image_path,
            original: v.product_image
            // original: v.product_image
          }
          this._.forEach(v.child_product, (val) => {
            val.isSelected = false
            val.virtual_gross_margin = val.custom_gross_margin
            val.virtual_custom_price = val.custom_price
            val.virtual_custom_stock = val.custom_stock
            val.show_quantity_edit = false
            val.show_quantity_icon = false
            val.show_price_icon = false
            val.show_price_edit = false
            val.show_gross_icon = false
            val.show_gross_edit = false
          })
        })
        this.cloneDeep('listData', [])
        this.checkPickShow = false
        this.$nextTick(() => {
          this.checkPickShow = true
        })
        document.querySelector('.el-table__body-wrapper').scrollTop = 0
      }).catch(err => {
        console.log(err)
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
      if (type === 'all') {
        this.ids = this._.map(this.multipleTable, 'id')
        this.status = this._.map(this.multipleTable, 'is_deleted')
      } else {
        this.ids = [row.row.id]
        this.status = [row.row.is_deleted]
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
      this.$confirm(message, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        api({ advt_id: this.ids, not_show_message: true }).then(response => {
          this.listLoading = false
          resultAlert(response, this.renderList)
          // this.multipleTable = []
        })
      }).catch(() => {
        this.listLoading = false
      })
    },

    // 上架
    upperShelfAdvt(row) {
      this.listLoading = true
      upperAdvt({ id: row.id }).then(res => {
        this.listLoading = false
        this.renderList()
      }).catch(() => {
        this.listLoading = false
      })
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
      if (this.listQuery.advtStatus !== key) {
        this.listQuery.advtStatus = key
        this.listQuery.error_type = undefined
        this.listQuery.page = 1
        this.filter = 'filter'
        this.renderList()
      }
    },
    statusSelected(key) {
      return this.listQuery.advtStatus === key ? 'warning' : ''
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
    // 指定毛利率
    grossMargins(command) {
      if (command.fuc === 'setGrossMargins') {
        this.setGrossMargins(command.value, command.type)
      } else if (command.fuc === 'unpricing') {
        this.unpricing('指定毛利率')
      } else {
        return
      }
    },
    // 指定价
    price(command) {
      if (command.fuc === 'setPress') {
        this.setPress(command.value, command.type)
      } else if (command.fuc === 'unpricing') {
        this.unpricing()
      } else {
        return
      }
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
              status.push(val.price_type)
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
        if (this.checkPrice(data.custom_price)) {
          const obj = {
            product: [{ id: data.product_id, istore_product_id: data.istore_product_id, account_id: data.account_id, custom_price: data.custom_price }],
            price_type: 1,
            action: 'add',
            rate: 0,
            not_show_message: true
          }
          updateCustomerPrice(obj).then((res) => {
            this.renderList()
            resultAlert(res)
          }).catch(err => {
            console.log('err', err)
            this.$message.error(err)
          })
        } else {
          console.log('data', data)
          data.custom_price = data.virtual_custom_price
          data.show_price_icon = false
          data.show_price_edit = false
        }
        this.hasActiveInput = false
      }
    },
    // 取消指定价
    unpricing(tip) {
      const advIds = []
      this.$confirm(tip ? `您确定要取消${tip}吗？` : '您确定要取消指定价吗？', '提示', {
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
          action: 'cancel',
          price_type: tip === '指定毛利率' ? 2 : 1,
          rate: 0,
          not_show_message: true
        }
        updateCustomerPrice(obj).then((res) => {
          resultAlert(res, this.renderList)
        }).catch(e => {
          this.$message.error(e)
        })
      }).catch((err) => {
        this.listLoading = false
      })
    },
    // 检测毛利率
    checkGross(value) {
      const reg = /^\d\.([1-9]{1,2}|[0-9][1-9])$|^[1-9]\d{0,1}(\.\d{1,2}){0,1}$|^100(\.0{1,2}){0,1}$/
      if (!reg.test(value)) {
        this.$message.error('毛利率必须是0-100之间的数字')
        return false
      }
      return true
    },
    // 检测指定价
    checkPrice(value) {
      if (Number(value) === 0) {
        this.$message.error('指定价必须大于0')
        return false
      }
      const reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,2}?$/
      if (!reg.test(value)) {
        this.$message.error('存在非法字符')
        return false
      }
      return true
    },
    unGrossMargins() {
      console.log('取消指定毛利率')
    },
    setGrossMargins(data, type) {
      this.currentRow = data
      const ids = []
      const gross_margin = ''
      if (type === 'all') {
        const status = []
        this._.forEach(this.multipleTable, (v) => {
          this._.forEach(v.child_product, (val) => {
            if (val.isSelected === true) {
              status.push(val.price_type)
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
        if (this.checkGross(data.custom_gross_margin)) {
          const obj = {
            product: [{ id: data.product_id, istore_product_id: data.istore_product_id, account_id: data.account_id, custom_price: 0 }],
            price_type: 2,
            action: 'add',
            rate: data.custom_gross_margin,
            not_show_message: true
          }
          updateCustomerPrice(obj).then((res) => {
            this.renderList()
            resultAlert(res)
          }).catch(err => {
            this.$message.error(err)
          })
        } else {
          console.log('data', data)
          data.custom_gross_margin = data.virtual_gross_margin
          data.show_gross_icon = false
          data.show_gross_edit = false
        }
        this.hasActiveInput = false
      }
    },
    // 指定库存
    stock(command) {
      if (command.fuc === 'setStock') {
        this.setStock('all')
        return
      }
      this.cancleStock()
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
        if (this.checkStock(row.custom_stock)) {
          // this.listLoading = true
          // 调用接口设置，设置成功 是否指定库存显示为 是
          setCustomStock({
            action: 'add',
            product: [{ id: row.product_id, istore_product_id: row.istore_product_id, account_id: row.account_id, custom_stock: row.custom_stock }],
            not_show_message: true
          }).then((res) => {
            resultAlert(res, this.renderList)
          }).catch((err) => {
            row.custom_stock = row.virtual_custom_stock
            this.$message.error(err)
          }).finally(() => {
            this.listLoading = false
          })
        } else {
          // 验证不通过，恢复初始值显示
          row.custom_stock = row.virtual_custom_stock
          row.show_quantity_icon = false
          row.show_quantity_edit = false
        }
        this.hasActiveInput = false
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
              resultAlert(res, this.renderList)
            }).catch(err => {
              this.$message.error(err)
            }).finally(() => {
              this.listLoading = false
            })
          }
        }).catch(() => {
        })
      }
    },
    cancleStock() {
      this.$confirm('您确定要取消指定库存吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
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
          resultAlert(res, this.renderList)
        }).catch(err => {
          this.$message.error(err)
        })
      })
    },
    showEdit(type, row, index) {
      if (!this.hasActiveInput) {
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
          this.hasActiveInput = true
        }
      }
    },
    hideEdit(type, row) {
      row[type] = false
    }
  },
  computed: {
    ...mapGetters({
      userPerssions: 'permissions'
    })
  },
  filters: {
    getTypeLabel(val, options) {
      const types = options.PmAdvtTypes
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
  cursor: pointer;
}

.el-table th > .cell > svg {
  color: #fff;
  transform: rotate(90deg);
  transition: linear .5s;
  cursor: pointer;
}

.in-a-line {
  white-space: normal;
}
</style>
<style rel="stylesheet/scss" lang="scss">
.el-input.is-disabled.draft-edit-disable .el-input__inner {
  color: #606266
}

.content-box {
  .el-loading-spinner {
    top: 12% !important;
  }
}
</style>
