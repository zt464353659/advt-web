<template>
  <div v-loading="loading" element-loading-text="拼命加载中" element-loading-background="rgba(0, 0, 0, 0.3)">
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="Site Code" prop="accountId">
          <el-select v-model="listQuery.accountId" clearable filterable multiple collapse-tags placeholder="请选择" class="sitecode" style="width: 220px;">
            <el-option v-for="(item, key) in options.krAdvtAccount" :key="key" :label="item.site_code" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Product ID" prop="advtProductIds">
          <el-input v-model="listQuery.advtProductIds" clearable placeholder="多个请用空格分隔" style="width: 200px;" @keyup.enter.native="handleFilter"></el-input>
        </el-form-item>
        <el-form-item label="平台商品号" prop="advtSpuId">
          <el-input v-model.trim="listQuery.advtSpuId" clearable placeholder="平台商品号" style="width: 120px;" @keyup.enter.native="handleFilter"></el-input>
        </el-form-item>
        <el-form-item label="노출상품ID(商品展示ID)" prop="subSpuId">
          <el-input v-model.trim="listQuery.subSpuId" clearable placeholder="商品展示ID" style="width: 120px;" @keyup.enter.native="handleFilter"></el-input>
        </el-form-item>
        <el-form-item label="옵션ID(选项ID)" prop="vendorId">
          <el-input v-model.trim="listQuery.vendorId" clearable placeholder="选项ID" style="width: 120px;" @keyup.enter.native="handleFilter"></el-input>
        </el-form-item>
        <el-form-item label="产品线" prop="productLine">
          <el-select v-model="listQuery.productLine" clearable placeholder="请选择" style="width: 120px;">
            <el-option v-for="(item, key) in options.krProductLine" :key="key" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="options.krAdvtTypes" label="广告类型" prop="advtType">
          <el-checkbox-group v-model="listQuery.advtType">
            <el-checkbox-button v-for="(advtType, key) in options.krAdvtTypes" :label="advtType.key" :key="key">{{ advtType.label }}</el-checkbox-button>
          </el-checkbox-group>
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
            <el-option
              v-for="item in priceTypeArr"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否19禁" prop="is_under_age">
          <el-select v-model="listQuery.is_under_age" clearable placeholder="请选择" style="width: 120px;">
            <el-option label="是" value="1"></el-option>
            <el-option label="否" value="0"></el-option>
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
    <div class="header-box" style="position: relative;">
      <el-row class="left-row" v-if="esAdvtStatus">
        <el-tag v-for="status in esAdvtStatus" :key="status.key" :type="statusSelected(status.key)" size="medium">
          <span @click="changeStatus(status.key)">{{ status.label }} ({{ status.total }})</span>
        </el-tag>
      </el-row>
      <el-row class="right-row">
        <el-button type="primary" size="mini" @click="openMoreTab" v-permission="permissions.info" :disabled="multipleTable.length === 0">批量打开广告详情页</el-button>
        <!--before draft send to draft-->
        <el-button v-show="listQuery.advtStatus === PRODUCT_STATUS_CODE.BEFORE_DRAPT_CODE"
                   type="success"
                   size="mini"
                   @click="advtOperate(multipleTable,'all', 'send')"
                   :disabled="this.multipleTable.length === 0"
                   v-permission="permissions.sendToDraft"
        >
          send to draft
        </el-button>
        <!--APPROVED 指定价-->
        <el-dropdown
          size="mini"
          split-button trigger="click"
          type="success" @command="handleCommand"
          v-show="listQuery.advtStatus === PRODUCT_STATUS_CODE.APPROVED"
          v-permission="[permissions.setPrice,permissions.cancelPrice]"
        >
          指定价
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :disabled="this.multipleTable.length === 0" command="tagPrice(0)" v-permission="permissions.setPrice">
              设置指定价
            </el-dropdown-item>
            <el-dropdown-item :disabled="this.multipleTable.length === 0" command="tagPrice(1)" v-permission="permissions.cancelPrice">
              取消指定价
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <!--APPROVED 库存-->
        <el-dropdown
          size="mini"
          split-button trigger="click"
          type="primary" @command="handleCommandCustom"
          v-show="listQuery.advtStatus === PRODUCT_STATUS_CODE.APPROVED"
          v-permission="[permissions.setCustomQuantity,permissions.cancelCustomQuantity]"
        >
          指定库存
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :disabled="this.multipleTable.length === 0" command="tagPrice(0)" v-permission="permissions.setCustomQuantity">
              设置指定库存
            </el-dropdown-item>
            <el-dropdown-item :disabled="this.multipleTable.length === 0" command="tagPrice(1)" v-permission="permissions.cancelCustomQuantity">
              取消指定库存
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <!--APPROVED 下架-->
        <el-button v-show="listQuery.advtStatus === PRODUCT_STATUS_CODE.APPROVED"
                   type="danger"
                   size="mini"
                   @click="advtOperate(multipleTable,'all', 'under')"
                   :disabled="this.multipleTable.length === 0"
                   v-debounce
                   v-permission="permissions.soldOut"
        >
          批量下架
        </el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box content-table">
      <el-table ref="listTable"
                :key="newDate"
                :data="listData"
                v-loading.lock="listLoading"
                element-loading-text="努力加载中"
                border
                style="width: 100%"
                :default-expand-all="expand"
                @selection-change="handleSelectionChange"
                @sort-change="tableResortEvent"
                @header-click="handleExpand"
      >
        <el-table-column type="expand" width="35">
          <template slot="header">
            <svg-icon icon-class="right" />
          </template>
          <template slot-scope="props">
            <el-table :data="props.row.child_product" border :key="newDate">
              <el-table-column prop="istore_product_id" label="产品ID">
                <template v-slot="scope">
                  <span>{{ scope.row.istore_product_id }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="istore_product_id" label="노출상품ID(商品展示ID)" min-width="150">
                <template>
                  <span>{{ props.row.sub_spu_id }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="vendor_id" label="옵션ID(选项ID)" min-width="100"></el-table-column>
              <el-table-column prop="name" label="产品名称" min-width="160">
                <template slot-scope="scope">
                  <span v-html="scope.row.name"></span>
                </template>
              </el-table-column>
              <el-table-column prop="base_price" label="保本价" min-width="50"></el-table-column>
              <el-table-column prop="discount_price" label="iStore价格" min-width="75"></el-table-column>
              <el-table-column prop="gross_margin" label="iStore毛利率(%)" min-width="110" />
              <el-table-column prop="current_price" label="当前销售价" min-width="75" />
              <el-table-column prop="current_gross_margin" label="当前毛利率(%)" min-width="95" />
              <el-table-column label="价格类型" min-width="70">
                <template slot-scope="scope">
                  {{ getLabelByCode(scope.row.price_type) }}
                </template>
              </el-table-column>
              <el-table-column prop="custom_price" label="指定价" min-width="60" v-if="listQuery.advtStatus === PRODUCT_STATUS_CODE.APPROVED">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_price_icon',scope.row)"
                       @mouseleave="hideEdit('show_price_icon',scope.row)"
                       style="width:100%;height:32px;line-height:32px;position: relative;"
                  >
                    <el-input
                      v-if="scope.row.show_price_edit"
                      class="price_input inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_price"
                      @focus="priceFocus(scope.row.custom_price)"
                      @blur="handleSpecified('sigle', scope.row)"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_price }}</span>
                    <i v-show="scope.row.show_price_icon && !hasActiveInput"
                       v-permission="permissions.setPrice"
                       class="el-icon-edit"
                       title="编辑"
                       @click="showEdit('show_price_edit',scope.row)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="custom_price" label="指定库存" min-width="65" v-if="listQuery.advtStatus === PRODUCT_STATUS_CODE.APPROVED">
                <template slot-scope="scope">
                  <div
                    @mouseenter="showEdit('show_quantity_icon',scope.row)"
                    @mouseleave="hideEdit('show_quantity_icon',scope.row)"
                    style="width:100%;height:32px;line-height:32px;position: relative;"
                  >
                    <el-input
                      v-if="scope.row.show_quantity_edit"
                      class="stock_input inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_quantity"
                      @blur="handleCustom('single',scope.row)"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_quantity }}</span>
                    <i v-show="scope.row.show_quantity_icon && !hasActiveInput"
                       v-permission="permissions.setCustomQuantity"
                       class="el-icon-edit"
                       title="编辑"
                       @click="showEdit('show_quantity_edit',scope.row)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="是否指定库存" v-if="listQuery.advtStatus === PRODUCT_STATUS_CODE.APPROVED" min-width="100">
                <template slot-scope="scope">
                  <span>{{ parseInt(scope.row.is_custom_quantity) === 1 ? '是' : '否' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="库存" align="center" width="104"></el-table-column>
              <el-table-column label="7天销量" v-if="Number(props.row.type) === 2" prop="sales_7_days" width="70"></el-table-column>
              <el-table-column label="30天销量" v-if="Number(props.row.type) === 2" prop="sales_30_days" width="70"></el-table-column>
              <el-table-column label="60天销量" align="center" v-if="Number(props.row.type) === 2" prop="sales_60_days" width="104"></el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column prop="id" label="ID" min-width="90" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column prop="site_code" label="Site Code" min-width="130"></el-table-column>
        <el-table-column prop="istore_product_id" label="Product ID" min-width="90"></el-table-column>
        <el-table-column v-if="listQuery.advtStatus !== PRODUCT_STATUS_CODE.UPLOAD_ERROR_CODE" prop="spu_id" label="平台商品号" min-width="110"></el-table-column>
        <el-table-column prop="product_image" label="产品图片" width="75" align="center">
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
            <div v-show="scope.$index !== isClickEdit" :class="{ product_name: isAdvtStatus && !isEdit }">
              <!--on sale 广告名称超链接-->
              <a v-if="listQuery.advtStatus === PRODUCT_STATUS_CODE.APPROVED"
                 style="color: #409EFF;"
                 :href="scope.row.coupang_url_id"
                 target="_blank"
                 v-html="scope.row.product_name.trim()"
              >
              </a>
              <!--其他状况下-->
              <span v-else v-html="scope.row.product_name.trim()"></span>
              <!--编辑-->
              <!-- <i class="el-icon-edit" title="编辑" style="color:#409EFF; font-size:20px;" @click="editProduct(scope.$index, scope.row.product_name.trim())" v-permission="permissions.edit"></i> -->
            </div>
            <el-input v-show="isEdit && scope.$index === isClickEdit"
                      size="small"
                      class="inline-edit-input draft-edit-disable"
                      v-model="scope.row.product_name"
                      :ref="'input'+ scope.$index"
                      @blur="saveProduct(scope.$index, scope.row)"
            >
            </el-input>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="Number(scope.row.type) === 1 ? 'success' : ''" size="small">{{ scope.row.type | getTypeLabel(options) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="产品线" prop="product_line_name" width="95"></el-table-column>
        <el-table-column label="7天销量" prop="sales_7_days" width="75"></el-table-column>
        <el-table-column label="30天销量" prop="sales_30_days" width="75"></el-table-column>
        <el-table-column label="60天销量" prop="sales_60_days" width="75"></el-table-column>
        <!--draft执行情况-->
        <el-table-column v-if="listQuery.advtStatus === PRODUCT_STATUS_CODE.UPLOAD_ERROR_CODE" prop="err_message" label="错误信息" min-width="100">
          <template slot-scope="scope">
            <span v-if="scope.row.err_message.length<20">{{ scope.row.err_message }}</span>
            <el-popover
              v-else
              placement="right"
              width="500"
              trigger="hover"
            >
              <span style="line-height: 24px; font-size: 12px; word-wrap: break-word;max-height: 500px;">{{ scope.row.err_message }}</span>
              <span slot="reference" style="color: #E6A23C" class="in-two-line">{{ scope.row.err_message }}</span>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="85" sort-by="create_time" sortable>
          <template slot-scope="scope" v-if="scope.row.create_time !== no_time">{{ scope.row.create_time }}</template>
        </el-table-column>
        <el-table-column v-if="listQuery.advtStatus !== PRODUCT_STATUS_CODE.DRAPT_CODE && listQuery.advtStatus !== PRODUCT_STATUS_CODE.UPLOAD_ERROR_CODE"
                         prop="upload_time" label="刊登时间" width="85"
                         sort-by="upload_time" sortable
        >
          <template slot-scope="scope" v-if="scope.row.upload_time !== no_time">{{ scope.row.upload_time }}</template>
        </el-table-column>
        <el-table-column prop="update_time" label="更新时间" width="85" sort-by="update_time" sortable>
          <template slot-scope="scope" v-if="scope.row.update_time !== no_time">{{ scope.row.update_time }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openLog(scope.row)" v-permission="permissions.log">日志</el-button>
            <el-button type="text" size="mini"
                       @click="openTheNewTAB('coupang.advertising.detail', { id: scope.row.id, showBtn: '10101', state: listQuery.advtStatus })"
                       v-permission="permissions.info"
            >
              详情
            </el-button>
            <el-button type="text" size="mini"
                       @click="openTheNewTAB('coupang.advertising.detail', { id: scope.row.id, showBtn: '10102', state: listQuery.advtStatus })"
                       v-if="listQuery.advtStatus === 1002"
                       v-permission="permissions.wordReview"
            >
              审核
            </el-button>
            <el-button type="text"
                       v-if="listQuery.advtStatus === PRODUCT_STATUS_CODE.APPROVED && Number(scope.row.is_delete) === 0"
                       size="mini"
                       @click="advtOperate(scope, 'single', 'under')" v-permission="permissions.soldOut"
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
          :page-sizes="[10,20,50,100]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
    <!-- istore更新日志 -->
    <istore-log v-bind.sync="logOptions"></istore-log>
  </div>
</template>

<script>
// toBoolean,
import PictureView from 'vue-simple-picture-preview'
import { filterQueryParams } from '@/utils/help'
import { resultAlert } from '@/utils/index'
import istoreLog from './components/istoreLog'
import { fetchList, getSelectAll, changeDraft, batchSoldOut, sendToDraft, appointPrice, cancelPrice, setTheInventory, cancelTheInventory } from '@/api/coupang'

const status_code = {
  'BEFORE_DRAPT_CODE': 90,
  'DRAPT_CODE': 100,
  'APPROVED': 130,
  'UPLOAD_ERROR_CODE': 1001
}
export default {
  name: 'CoupangAdvertising',
  components: { PictureView, istoreLog },
  data() {
    return {
      priceTypeArr: [
        { label: 'iStore价格', value: 10 },
        { label: '动态调整价', value: 20 },
        { label: '指定价', value: 30 },
        { label: '跟卖价', value: 50 }
      ],
      no_time: '1970-01-01 08:00:00',
      // 常量状态
      PRODUCT_STATUS_CODE: status_code,
      permission_setPrice: true,
      permissions: {
        info: 'coupang.advt.advt.info', // 详情
        edit: 'coupang.advt.advt.update',
        soldOut: 'coupang.advt.delete.delete',
        sendToDraft: 'coupang.advt.update-advt.update-state',
        setPrice: 'coupang.advt.update-advt.set-custom-price',
        cancelPrice: 'coupang.advt.update-advt.un-set-custom-price',
        setCustomQuantity: 'coupang.advt.update-advt.set-custom-quantity',
        cancelCustomQuantity: 'coupang.advt.update-advt.un-set-custom-quantity',
        wordReview: 'coupang.advt.advt.word-review',
        log: 'coupang.advt.advt.change-log'
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
      esAdvtStatus: {},
      listLoading: true,
      listData: [],
      listQuery: {
        page: 1,
        per_page: 10,
        accountId: [],
        price_type: undefined,
        advtProductIds: undefined,
        advtSpuId: undefined,
        productLine: undefined,
        advtType: [],
        advtStatus: status_code.APPROVED,
        create_time: [],
        upload_time: [],
        create_user_id: '',
        subSpuId: '',
        vendorId: '',
        sales_count: undefined,
        is_under_age: undefined//19禁
      },
      listReactQuery: {},
      pagination: null,
      multipleTable: [],
      checkPickShow: true,
      // 编辑标题
      isEdit: false,
      isClickEdit: -1,
      oldProductName: '',
      expand: true,
      defaultProps: {
        originalKey: 'original',
        thumbnailKey: 'thumbnail'
      },
      appoint: null,
      appointId: 0,
      logOptions: {
        open: false,
        advtId: '',
        isVary: false
      },
      hasActiveInput: false,
      oldCustomPrice: null
    }
  },
  created() {
    this.searchItem()
    this.renderList()
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
    // 指定库存图标控制
    showEdit(type, row, index) {
      if (!this.hasActiveInput) {
        row[type] = true
        if (['show_quantity_edit', 'show_price_edit'].includes(type)) {
          let focus_target = ''
          switch (type) {
            case 'show_quantity_edit':
              focus_target = 'stock_input'
              break
            case 'show_price_edit':
              focus_target = 'price_input'
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
        window.open(`/coupang/advertising/detail/${v.id}/10101/${v.status}`)
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
      this.expand = true
      this.listLoading = true
      // 接口参数处理
      const queryParams = filterQueryParams(this.listQuery)
      // 表格选择为空
      this.multipleTable = []
      this.listData = []
      this.listReactQuery = this._.clone(queryParams)
      delete this.listReactQuery.page
      delete this.listReactQuery.per_page
      delete queryParams.sales_count
      const sort = {}
      if (this.listQuery.sales_count) {
        const value = this.listQuery.sales_count.split('-')
        sort[value[0]] = value[1]
      }
      if (!this._.isEmpty(sort)) {
        queryParams.sort = sort
      }
      fetchList(queryParams).then(response => {
        this.listData = response.data.list
        this.pagination = response.data.pagination
        this.esAdvtStatus = response.data.statistics
        this._.forEach(this.listData, (v) => {
          // 判断时所需要的原始变量
          v.virtualGross_margin = v.gross_margin
          v.virtualCustom_price = v.custom_price
          //
          v.picture = {
            thumbnail: v.product_image,
            original: v.image_path
          }
          this._.forEach(v.child_product, (val) => {
            val.isSelected = false
            val.show_quantity_icon = false
            val.show_quantity_edit = false
            val.show_price_icon = false
            val.show_price_edit = false
            val.virtualCustom_price = val.custom_price
            val.virtualCustom_quantity = val.custom_quantity
          })
        })
        const cloneList = this._.cloneDeep(this.listData)
        this.listData = []
        this.listData = cloneList
        this.checkPickShow = false
        this.$nextTick(() => {
          this.checkPickShow = true
        })
        document.querySelector('.el-table__body-wrapper').scrollTop = 0
      }).finally(() => {
        this.listLoading = false
      })
    },

    handleExpand(column) {
      if (column.type === 'expand') {
        this.expand = !this.expand
        // 强制刷新DOM
        this.newDate = new Date().getTime()
      }
    },
    //s 详情
    openTheNewTAB(name, params, state) {
      const { href } = this.$router.resolve({
        name: name,
        params: params,
        state: state
      })
      window.open(href, '_blank')
    },

    // 广告名称编辑
    editProduct(index, name) {
      this.isClickEdit = index
      this.isEdit = true
      this.oldProductName = name
      this.$nextTick(() => {
        this.$refs['input' + index].focus()
      })
    },
    // 保存广告名称
    saveProduct(order, row) {
      row.product_name = row.product_name.trim()
      // 保存成功后，重置
      const editBtnShow = () => {
        this.isClickEdit = -1
        this.isEdit = false
      }
      // 保存不成功操作
      const noSaveAlert = (msg, index, oldName) => {
        this.$confirm(msg, '提示', {
          confirmButtonText: '重新编辑',
          cancelButtonText: '取消编辑',
          closeOnClickModal: false,
          closeOnPressEscape: false,
          type: 'warning'
        }).then(() => {
          this.$refs['input' + index].focus()
        }).catch(() => {
          this.listData[index].product_name = oldName
          editBtnShow()
        })
      }
      // 判断条件
      let message = ''
      if (row.product_name.length === 0) {
        message = '广告名称不能为空'
      } else if (row.product_name.length > 255) {
        message = '广告名称过长，请修改'
      } else if (row.product_name === this.oldProductName) {
        message = '广告名称没有发生更改'
      } else {
        this.listLoading = true
        changeDraft({ 'advt_id': this.listData[order].id, 'name': this.listData[order].product_name.trim() }).then(response => {
          // this.$message({ message: '广告名修改成功', type: 'success' })
          this.listData[order].product_name = response.data.name
          // this.renderList()
          editBtnShow()
        }).catch(res => {
          if (res.code === 30001) {
            this.$alert(res.message, '提示', {
              confirmButtonText: '确定',
              callback: action => {
                this.renderList()
                this.isClickEdit = -1
              }
            })
          } else {
            noSaveAlert(res.message, order, this.oldProductName)
          }
        }).finally(_ => {
          this.listLoading = false
        })
      }
      if (message) {
        noSaveAlert(message, order, this.oldProductName)
      }
    },
    // 下拉框回调
    handleCommand(command) {
      const sign = command.slice(0, command.indexOf('('))
      const index = command.slice(command.indexOf('(') + 1, command.indexOf(')'))
      index === '0' ? this.setBath(sign) : this.cancelAll(sign)
    },
    handleCommandCustom(command) {
      const sign = command.slice(0, command.indexOf('('))
      const index = command.slice(command.indexOf('(') + 1, command.indexOf(')'))
      index === '0' ? this.setCustom(sign) : this.cancelCustom(sign)
    },
    // 批量设置指定指定价（弹出框）
    setBath(sign) {
      const signName = '指定价/售价的比率'
      this.$prompt(`请输入${signName}`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        inputValidator: (value) => {
          if (Number(value) > 0 && (((value.indexOf('.') >= 0 && value.substr(value.indexOf('.') + 1).length < 3)) || value.indexOf('.') === -1)) {
            return true
          } else if (!value) {
            return '比率不能为空'
          } else {
            return `比率只可以为大于0的数字，且小数点后最多可输入2位`
          }
        }
      }).then(({ value }) => {
        this.handleSpecified('all', value, sign)
      }).catch(() => {
        this.listLoading = false
      })
    },
    // 批量设置指定库存（弹出框）
    setCustom(sign) {
      const signName = '指定库存'
      this.$prompt(`请输入${signName}`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        inputValidator: (value) => {
          if (Number(value) >= 0 && value.indexOf('.') === -1) {
            return true
          } else if (!value) {
            return '指定库存不能为空'
          } else {
            return `指定库存只可以为大于等于0的数字`
          }
        }
      }).then(({ value }) => {
        this.handleCustom('all', value, sign)
      }).catch(() => {
        this.listLoading = false
      })
    },
    onInput(row) {
      this.appoint = row.custom_price
      this.appointId = row.id
    },
    onInputCustom(row) {
      this.appoint = row.custom_quantity
      this.appointId = row.id
    },
    priceFocus(val) {
      this.oldCustomPrice = val
    },
    // 指定价处理
    handleSpecified(type, value) {
      const advIds = []
      let isAjax = true
      if (type === 'all') {
        this._.forEach(this.multipleTable, (v) => {
          this._.forEach(v.child_product, (o) => {
            advIds[o.id] = {
              'product_id': o.id,
              'custom_rate': value
            }
          })
        })
      } else {
        this.hasActiveInput = false
        value.show_price_edit = false
        if (Number(value.custom_price) === this.oldCustomPrice) {
          this.$message.error('输入价格不能等于当前指定价')
          this.hasActiveInput = false
          return
        }
        value.custom_price = Number(value.custom_price) + '.00'
        if (Number(value.custom_price) >= Number(value.base_price) && Number(value.custom_price) < 100000000 && value.custom_price % 10 === 0) {
          advIds[value.id] = {
            'product_id': value.id,
            'custom_price': value.custom_price
          }
        } else {
          isAjax = false
          let errorMsg = ''
          if (value.custom_price % 10 > 0) {
            errorMsg = '请输入10的整数倍'
          } else if (Number(value.custom_price) < Number(value.base_price)) {
            errorMsg = '指定价必须大于等于保本价'
          } else {
            errorMsg = '指定价必须小于100000000'
          }
          value.custom_price = this.appoint
          this.$message({
            message: errorMsg,
            type: 'warning'
          })
          value.custom_price = value.virtualCustom_price
        }
      }
      isAjax && appointPrice({ appoint: advIds, not_show_message: true }).then(res => {
        if (res.code === 200) {
          resultAlert(res)
        } else {
          this.$message({
            message: res.message,
            type: 'warning'
          })
        }
        this.renderList()
      })
      setTimeout(() => {
        this.appointId = 0
      }, 100)
    },
    // 指定库存处理
    handleCustom(type, value) {
      const appoint = []
      if (type === 'all') {
        this._.forEach(this.multipleTable, (v) => {
          this._.forEach(v.child_product, (o) => {
            appoint[o.id] = {
              'product_id': o.id,
              'custom_quantity': value
            }
          })
        })
      } else {
        this.hasActiveInput = false
        value.show_quantity_edit = false
        appoint[value.id] = {
          'product_id': value.id,
          'custom_quantity': value.custom_quantity
        }
        const reg = /^[0-9]*$/
        if (!reg.test(value.custom_quantity)) {
          this.$message.error('设置库存必须是0-999之间的整数')
          this.listLoading = false
          value.custom_quantity = value.virtualCustom_quantity
          value.show_quantity_icon = false
          value.show_quantity_edit = false
          this.hasActiveInput = false
          return false
        }
      }
      setTheInventory({ appoint: appoint, not_show_message: true }).then(res => {
        if (res.code === 200) {
          resultAlert(res)
        } else {
          this.$message({
            message: res.message,
            type: 'warning'
          })
        }
        this.renderList()
      })
      setTimeout(() => {
        this.appointId = 0
      }, 100)
    },
    // 取消指定价
    cancelAll() {
      const msg = '您确定要取消指定价吗？'
      const api = cancelPrice
      const advIds = []
      this.$confirm(msg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        this._.forEach(this.multipleTable, (v) => {
          this._.forEach(v.child_product, (o) => {
            advIds.push(o.id)
          })
        })
        api({ appoint: advIds, not_show_message: true }).then(res => {
          this.listLoading = false
          if (res.code === 200) {
            resultAlert(res, status => {
              if (status) {
                this.renderList()
              }
            })
          } else {
            this.$message({
              message: res.message,
              type: 'warning'
            })
          }
        })
      })
    },
    // 取消指定价
    cancelCustom() {
      const msg = '您确定要取消指定库存吗？'
      const advIds = []
      this.$confirm(msg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        this._.forEach(this.multipleTable, (v) => {
          this._.forEach(v.child_product, (o) => {
            advIds.push(o.id)
          })
        })
        cancelTheInventory({ appoint: advIds, not_show_message: true }).then(res => {
          this.listLoading = false
          if (res.code === 200) {
            resultAlert(res, status => {
              if (status) {
                this.renderList()
              }
            })
          } else {
            this.$message({
              message: res.message,
              type: 'warning'
            })
          }
        })
      })
    },
    /**
     * 广告相关功能
     * @param row 表格中的数据
     * @param type 批量 or 单条
     * @param sign 操作标识符 under--下架，send--send to draft
     */
    advtOperate(row, type, sign) {
      this.ids = type === 'all' ? this._.map(this.multipleTable, 'id') : [row.row.id]
      let params
      switch (sign) {
        case 'under':
          this.status = type === 'all' ? this._.map(this.multipleTable, 'is_delete') : [row.row.is_delete]
          params = { statusResult: this._.indexOf(this.status, 0), statusMessage: '该产品已经进入待下架状态，不可再次提交。', api: batchSoldOut, message: '是否要下架此产品' }
          break
        // case 'delete':
        //   params = { statusResult: 1, api: batchDelete, message: '确定要删除此产品吗' }
        //   break
        default:
          params = { statusResult: 1, api: sendToDraft, message: '确定导入draft列表吗' }
          break
      }
      if (params.statusResult > -1) {
        this.$confirm(params.message, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.listLoading = true
          let proudctParams = this.ids
          if (sign === 'send') {
            proudctParams = {
              advt_id: this.ids,
              state: 'draft',
              not_show_message: true
            }
          }
          params.api(proudctParams).then(response => {
            if (sign === 'send') {
              this.listLoading = false
              const list = []
              if (response.data.succeed.length > 0) {
                this._.forEach(response.data.succeed, (item) => {
                  list.push({ status: true, message: item })
                })
              }
              if (response.data.error.length > 0) {
                this._.forEach(response.data.error, (item) => {
                  list.push({ status: false, message: item })
                })
              }
              resultAlert(list, () => {
                this.renderList()
              })
            } else {
              this.listLoading = false
              this.renderList()
            }
          })
        }).catch(() => {
          this.listLoading = false
        })
      } else {
        this.$alert(params.statusMessage, '提示', {
          dangerouslyUseHTMLString: true
        })
      }
    },

    handleSelectionChange(val) {
      this.multipleTable = val
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
    },
    changeStatus(key, sign) {
      console.log('key', key)
      this.pagination = undefined
      this.newDate = new Date().getTime()
      if (this.listQuery.advtStatus !== key || sign === 'hand') {
        this.listQuery.advtStatus = key
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
    }
  },
  computed: {
    isAdvtStatus: function() {
      const eidt_code = {
        'BEFORE_DRAPT_CODE': 90,
        'DRAPT_CODE': 100
      }
      return Object.values(eidt_code).some(item => {
        return parseInt(this.listQuery.advtStatus) === item
      })
    }
  },
  filters: {
    getTypeLabel(val, options) {
      const types = options.krAdvtTypes
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
.sitecode {
  ::v-deep .el-tag {
    span {
      display: inline;
    }
  }
}

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
  position: absolute;
  color: #409EFF;
  font-size: 20px;
  top: 8px;
  right: -5px;
  cursor: pointer;
}
</style>
<style rel="stylesheet/scss" lang="scss">
.el-input.is-disabled.advtlist-disable .el-input__inner {
  color: #606266;
  cursor: not-allowed !important;
}

.content-table {
  /*deep*/
  .el-table th.gutter {
    display: table-cell !important;
  }
}
</style>

