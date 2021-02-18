<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="Site Code" prop="account_id">
          <multiple-select-account
            ref="multipleSelectAccount"
            :options="options.JumiaAdvtAccount"
            @select-account="selectAccount"
            @clean-select="cleanSelect"
            style="width: 240px"
          ></multiple-select-account>
        </el-form-item>
        <el-form-item label="Product ID" prop="advt_product_ids">
          <el-input v-model="listQuery.advt_product_ids" clearable placeholder="多个请用空格分隔" style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item label="Shop Sku" prop="shop_sku">
          <el-input v-model="listQuery.shop_sku" clearable placeholder="多个Shop Sku用空格分隔" style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item label="产品线" prop="product_line">
          <el-select v-model="listQuery.product_line" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="(item,ind) in options.JumiaProductLine" :key="ind" :label="item.name" :value="item.id"></el-option>
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
        <el-form-item label="广告类型" prop="advt_type">
          <el-checkbox-group v-model="listQuery.advt_type">
            <el-checkbox-button v-for="types in options.JumiaAdvtTypes" :label="types.key" :key="types.key">{{ types.label }}</el-checkbox-button>
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
        <el-form-item v-if="listQuery.advt_status === 120" label="价格类型" prop="custom_price_type">
          <el-select v-model="listQuery.custom_price_type" clearable placeholder="请选择" style="width: 120px;">
            <el-option label="iStore价格" value="10"></el-option>
            <el-option label="动态调整价" value="20"></el-option>
            <el-option label="指定价" value="30"></el-option>
            <el-option label="指定毛利率" value="40"></el-option>
            <el-option label="跟卖价" value="50"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="listQuery.advt_status === 120" label="是否指定库存" prop="is_custom_quantity">
          <el-select v-model="listQuery.is_custom_quantity" clearable placeholder="请选择" style="width: 120px;">
            <el-option label="是" value="1"></el-option>
            <el-option label="否" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button data-type="search" type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 状态 -->
    <div class="header-box">
      <el-row v-if="esAdvtStatus.length" class="left-row">
        <el-tag v-for="status in esAdvtStatus" :key="status.key" :type="statusSelected(status.key)" size="medium">
          <span @click="changeStatus(status.key)">{{ status.label }} ({{ status.total }})</span>
        </el-tag>
      </el-row>
      <el-row class="right-row">
        <el-dropdown v-if="listQuery.advt_status === 120"
                     size="mini"
                     split-button
                     type="success"
                     trigger="click"
                     @command="stock"
                     v-permission="[permissions.advertising_setinventory,permissions.advertising_cancelinventory]"
        >
          指定库存
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-permission="permissions.advertising_setinventory" :disabled="this.multipleTable.length === 0" :command="{ fuc: 'setStock', type: 'all' }">
              设置指定库存
            </el-dropdown-item>
            <el-dropdown-item v-permission="permissions.advertising_cancelinventory" :disabled="this.multipleTable.length === 0" :command="{ fuc: 'cancleStock', type: 'all' }">
              取消指定库存
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown v-if="listQuery.advt_status === 120"
                     size="mini"
                     split-button
                     type="primary"
                     trigger="click"
                     @command="price"
                     v-permission="[permissions.advertising_customSetPrice,permissions.advertising_customCancelStock]"
        >
          指定价
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-permission="permissions.advertising_customSetPrice" :disabled="multipleTable.length === 0" :command="{ fuc: 'setPress', value: multipleTable, type: 'all' }">
              设置指定价
            </el-dropdown-item>
            <el-dropdown-item v-permission="permissions.advertising_customCancelStock" :disabled="multipleTable.length === 0" :command="{ fuc: 'unpricing', value: multipleTable }">
              取消指定价
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown v-if="listQuery.advt_status === 120"
                     size="mini"
                     split-button
                     type="warning"
                     trigger="click"
                     @command="grossMargins"
                     v-permission="[permissions.advertising_marginSet,permissions.advertising_marginCancel]"
        >
          指定毛利率
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-permission="permissions.advertising_marginSet" :disabled="multipleTable.length === 0" :command="{ fuc: 'setGrossMargins', value: multipleTable, type: 'all' }">
              设置指定毛利率
            </el-dropdown-item>
            <el-dropdown-item v-permission="permissions.advertising_marginCancel" :disabled="multipleTable.length === 0" :command="{ fuc: 'cancelGrossMargins', value: multipleTable, type: 'all' }">
              取消指定毛利率
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button type="primary"
                   size="mini"
                   @click="openMoreTab"
                   :disabled="multipleTable.length === 0"
                   v-permission="permissions.advertising_ViewTheAD"
        >
          批量打开广告详情页
        </el-button>
        <el-button v-if="listQuery.advt_status === 120"
                   type="danger"
                   size="mini"
                   @click="deleteFileOrDirectory(multipleTable,'all')"
                   :disabled="multipleTable.length === 0"
                   v-permission="permissions.advertising_delete"
        >
          批量下架
        </el-button>
        <el-button
          v-if="listQuery.advt_status === 120"
          type="primary"
          size="mini"
          @click="Activelistexport"
          v-permission="permissions.advertising_ActiveExport"
        >
          导出
        </el-button>
        <el-button
          v-if="listQuery.advt_status === 140"
          type="danger"
          size="mini"
          @click="listexport"
          v-permission="permissions.advertising_uploadError"
        >
          导出
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
                :default-expand-all="expand"
                @header-click="handleExpand"
                @select-all="handleSelectionChange"
                @select="handleSelectionRow"
                @selection-change="selectionChange"
                @sort-change="tableResortEvent"
                @filter-change="handleFilterChange"
      >
        <el-table-column type="expand">
          <template slot="header">
            <svg-icon icon-class="right" />
          </template>
          <template slot-scope="props">
            <el-table :data="props.row.child_product" border>
              <el-table-column width="40">
                <template slot-scope="scope">
                  <el-checkbox @input="smt(props.row)" v-model="scope.row.isSelected" />
                </template>
              </el-table-column>
              <el-table-column prop="istore_product_id" label="产品ID" width="80"></el-table-column>
              <el-table-column prop="product_name" label="产品名称" min-width="160"></el-table-column>
              <el-table-column prop="tag_price" label="吊牌价" width="60" />
              <el-table-column prop="shop_sku" v-if="[120,130,220,200,190].includes(listQuery.advt_status)" label="shop Sku" min-width="140" />
              <el-table-column prop="base_price" label="保本价" width="60"></el-table-column>
              <el-table-column prop="discount_price" label="iStore价格" min-width="80"></el-table-column>
              <el-table-column prop="gross_margin" label="iStore毛利率(%)"></el-table-column>
              <el-table-column prop="current_price" label="当前售价" width="70"></el-table-column>
              <el-table-column prop="current_gross_margin" label="当前毛利率(%)" min-width="100"></el-table-column>
              <el-table-column prop="custom_price_type" label="价格类型" min-width="70">
                <template slot-scope="scope">
                  <span v-if="scope.row.price_type === 50">跟卖价</span>
                  <span v-if="scope.row.price_type === 40">指定毛利率</span>
                  <span v-if="scope.row.price_type === 30">指定价</span>
                  <span v-if="scope.row.price_type === 20">动态调整价</span>
                  <span v-if="scope.row.price_type === 10">iStore价格</span>
                </template>
              </el-table-column>
              <el-table-column prop="custom_price" label="指定价" width="70" v-if="listQuery.advt_status === 120">
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
                       class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:9px;right:-7px;"
                       @click="showEdit('show_price_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_price_edit',scope.row)"
                       v-permission="permissions.advertising_customSetPrice"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="custom_gross_margin" label="指定毛利率(%)" width="100" v-if="listQuery.advt_status === 120">
                <template slot-scope="scope">
                  <div
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
                       v-permission="permissions.advertising_marginSet"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="custom_quantity" label="指定库存" width="70" v-if="listQuery.advt_status === 120">
                <template slot-scope="scope">
                  <!--<div @click="setStock('single',scope.row)">{{ scope.row.custom_quantity }}</div>-->
                  <div @mouseenter="showEdit('show_quantity_icon',scope.row)" @mouseleave="hideEdit('show_quantity_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position:relative;">
                    <el-input
                      v-if="scope.row.show_quantity_edit"
                      :ref="'stock_input'+ scope.$index"
                      class="stock_input inline-edit-input"
                      autofocus
                      size="small"
                      v-model="scope.row.custom_quantity"
                      @blur="setStock('single',scope.row)"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_quantity }}</span>
                    <i v-show="scope.row.show_quantity_icon && !hasActiveInput"
                       class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:7px;right:-7px;"
                       @click="showEdit('show_quantity_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_quantity_edit',scope.row)"
                       v-permission="permissions.advertising_setinventory"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="库存" width="60"></el-table-column>
              <el-table-column prop="custom_stock_type" label="是否指定库存" min-width="100" v-if="listQuery.advt_status === 120">
                <template slot-scope="scope">
                  {{ scope.row.is_custom_quantity === 1 ? '是' : '否' }}
                </template>
              </el-table-column>
              <el-table-column v-if="props.row.type===2" label="7天销量" prop="sold_quantity_7" width="70"></el-table-column>
              <el-table-column v-if="props.row.type===2" label="30天销量" prop="sold_quantity_30" width="70"></el-table-column>
              <el-table-column v-if="props.row.type===2" label="60天销量" prop="sold_quantity_60" width="70"></el-table-column>
              <el-table-column label="状态" width="104" align="center">
                <template slot-scope="scope">
                  {{ showStatus(scope.row.status) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="104" v-if="listQuery.advt_status === 120" align="center">
                <template slot-scope="scope">
                  <el-button type="text" size="mini"
                             @click="deleteFileOrDirectory(scope)"
                             :disabled="scope.row.status!==120"
                             v-permission="permissions.advertising_delete"
                  >
                    下架
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="40" align="center"></el-table-column>
        <el-table-column prop="id" align="center" label="ID" width="60" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column prop="site_code" label="Site Code" min-width="120"></el-table-column>
        <el-table-column prop="istore_product_id" label="Product ID" min-width="100"></el-table-column>
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
        <el-table-column prop="product_name" label="产品名称" min-width="260">
          <template slot-scope="scope">
            <a v-if="listQuery.advt_status === 120 && scope.row.platform_item_url" style="color: #409EFF;" :href="scope.row.platform_item_url"
               target="_blank"
            >
              {{ scope.row.product_name }}
            </a>
            <span v-else>{{ scope.row.product_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" align="center" width="75">
          <template slot-scope="scope">
            <el-tag :type="Number(scope.row.type) === 1 ? 'success' : ''" size="small">{{ Number(scope.row.type) === 1 ? 'Normal' : 'Variation' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="产品线" prop="product_line_name" width="75"></el-table-column>
        <el-table-column label="7天销量" prop="sold_quantity_7" width="70"></el-table-column>
        <el-table-column label="30天销量" prop="sold_quantity_30" width="70"></el-table-column>
        <el-table-column label="60天销量" prop="sold_quantity_60" width="70"></el-table-column>
        <el-table-column v-if="STATUS.PUBLISH_TIME.includes(listQuery.advt_status)" prop="publish_time" label="刊登时间" width="85" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column prop="create_time" label="创建时间" sort-by="create_time" width="85" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column prop="update_time" label="更新时间" sort-by="update_time" width="85" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openLog(scope.row.id)" v-permission="permissions.advertising_SeeTheLog">日志</el-button>
            <el-button type="text" size="mini" @click="openTheNewTAB('jumia.advertising.detail', { id: scope.row.id })" v-permission="permissions.advertising_ViewTheAD">详情</el-button>
            <el-button type="text" size="mini" v-if="listQuery.advt_status === 120"
                       @click="deleteFileOrDirectory(scope,'parent')"
                       v-permission="permissions.advertising_delete"
                       :disabled="scope.row.status!==120"
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
    <!-- 日志组件 -->
    <istore-log v-bind.sync="logOptions"></istore-log>
  </div>
</template>

<script>
import { toBoolean, filterQueryParams } from '@/utils/help'
import { fetchList, batchSoldOut, getSelectAll, setQuantity, cancelQuantity, setPrice, cancelPrice, setCustomGrossMargin, cancelCustomGrossMargin, uploadError, exportProduct } from '@/api/jumia'
import istoreLog from './components/istoreLog'
import multipleSelectAccount from './components/multipleSelectAccount'
import { resultAlert } from '@/utils/index'
import { exportLongTile, ActiveexportLongTile } from './common'

export default {
  components: { istoreLog, multipleSelectAccount },
  data() {
    return {
      permissions: {
        advertising_setinventory: 'jumia.advt.custom-quantity.set',//设置库存
        advertising_cancelinventory: 'jumia.advt.custom-quantity.cancel',//取消库存
        advertising_customSetPrice: 'jumia.advt.custom-price.set',//设置指定价/毛利率
        advertising_customCancelStock: 'jumia.advt.custom-price.cancel',//取消指定价/毛利率
        advertising_SeeTheLog: 'jumia.advt.advt.change-log',//查看日志
        advertising_ViewTheAD: 'jumia.advt.advt.info',//查看广告详情
        advertising_marginSet: 'jumia.advt.custom-gross-margin.set',//指定毛利率
        advertising_marginCancel: 'jumia.advt.custom-gross-margin.cancel',//取消指定毛利率
        advertising_delete: 'jumia.advt.manage.offline',//下架
        advertising_uploadError: 'jumia.advt.export.upload-error',//错误导出
        advertising_ActiveExport: 'jumia.advt.export.product'//在线导出
      },
      hasActiveInput: false,
      STATUS: {
        DRAFT: 100,
        PUBLISH_TIME: [120, 130, 220],
        UPLOAD_ERROR: 140
      },
      isDisable: false,
      newDate: new Date().getTime(),
      getOnSaleStatus: 0,
      title: '类型 ',
      filter: 'filter',
      options: [],
      /* 广告列表搜索条件列表 */
      selectOptions: ['JumiaAdvtAccount', 'JumiaAdvtTypes', 'JumiaProductLine', 'JumiaChangeLogOptions'],
      listLoading: true,
      listTotal: null,
      listData: [],
      listQuery: {
        page: 1,
        per_page: 20,
        account_id: [], // Site Code
        advt_product_ids: '',// Product ID
        product_line: undefined,// 产品线
        advt_type: [], // 广告类型
        advt_status: 120,// 广告状态
        advt_created: [], // 创建时间
        advt_published: [], // 刊登时间
        spus: '', // 平台商品号
        is_custom_quantity: '',
        custom_price_type: '',
        sales_count: undefined,//销量
        shop_sku: ''//shop sku
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
        advtId: '',
        operateTypeArr: []
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
    // site code多选框
    selectAccount(arr) {
      console.log(arr)
      this.listQuery.account_id = arr
    },
    cleanSelect() {
      this.listQuery.account_id = []
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
    },
    // 指定库存
    stock(command) {
      if (command.fuc === 'setStock') {
        this.setStock('all')
        return
      }
      this.cancleStock()
    },
    setStock(type, row) {
      // 要设置库存的child_product id
      const ids = []
      // input设置/批量设置
      if (type === 'single') {
        if (this.checkStock(row.custom_quantity)) {
          // this.listLoading = true
          // 调用接口设置，设置成功 是否指定库存显示为 是
          setQuantity({
            custom_quantity: row.custom_quantity,
            product_id: [row.product_id],
            not_show_message: true
          }).then((res) => {
            resultAlert(res)
          }).catch((err) => {
            row.custom_quantity = row.virtual_custom_quantity
            this.$message.error(err)
          }).finally(() => {
            this.listLoading = false
            this.renderList()
          })
        } else {
          // 验证不通过，恢复初始值显示
          row.custom_quantity = row.virtual_custom_quantity
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
              product.push(v.product_id)
            })
            setQuantity({ product_id: product, custom_quantity: value, not_show_message: true }).then((res) => {
              resultAlert(res)
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
        product.push(v.product_id)
      })
      // 调用取消接口
      cancelQuantity({ product_id: product, not_show_message: true }).then((res) => {
        resultAlert(res)
      }).catch(err => {
        this.$message.error(err)
      }).finally(() => {
        this.listLoading = false
        this.renderList()
      })
    },
    // 验证库存
    checkStock(val) {
      if (/^\d+$/.test(val)) {
        return true
      }
      this.$message.error('只允许设置不小于0的整数')
      return false
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
      const reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,2}?$/
      if (!reg.test(value)) {
        this.$message.error('存在非法字符')
        return false
      }
      return true
    },
    // 指定毛利率
    grossMargins(command) {
      if (command.fuc === 'setGrossMargins') {
        this.setGrossMargins(command.value, command.type)
      } else if (command.fuc === 'cancelGrossMargins') {
        this.cancelGrossMargins(command.value, command.type)
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
        this.$prompt('请输入指定价', '提示', {
          cancelButtonText: '取消',
          confirmButtonText: '确定'
        }).then(({ value }) => {
          this._.forEach(this.multipleTable, (v) => {
            this._.forEach(v.child_product, (val) => {
              if (val.isSelected === true) {
                ids.push(val.product_id)
              }
            })
          })
          if (this.checkPrice(value)) {
            const obj = {
              product_id: ids,
              custom_price: value,
              not_show_message: true
            }
            setPrice(obj).then((res) => {
              resultAlert(res)
            }).catch(err => {
              this.$message.error(err)
            }).finally(() => {
              this.listLoading = false
              this.renderList()
            })
          }
        })
      } else {
        if (this.checkPrice(data.custom_price)) {
          console.log('data.id', data.product_id)
          const obj = {
            product_id: data.product_id.toString().split(','),
            custom_price: data.custom_price,
            not_show_message: true
          }
          setPrice(obj).then((res) => {
            resultAlert(res)
          }).catch(err => {
            this.$message.error(err)
          }).finally(() => {
            this.listLoading = false
            this.renderList()
          })
        } else {
          data.custom_price = data.virtual_custom_price
          data.show_price_icon = false
          data.show_price_edit = false
        }
        this.hasActiveInput = false
      }
    },
    // 取消指定价
    unpricing() {
      const advIds = []
      this.$confirm('您确定要取消指定价吗？', '提示', {
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
        cancelPrice({ product_id: advIds, not_show_message: true }).then((res) => {
          resultAlert(res)
        }).catch(e => {
          this.$message.error(e)
        }).finally(() => {
          this.listLoading = false
          this.renderList()
        })
      }).catch((err) => {
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
    handleProductLineChange(val) {
      if (val) {
        this.listQuery.product_line = val[val.length - 1]
      }
    },
    openMoreTab() {
      const detailsId = this.multipleTable.map(v => v.id)
      detailsId.map(v => {
        window.open(`/jumia/advertising/detail/${v}`)
      })
    },
    // 日志
    openLog(id) {
      this.logOptions = {
        open: true,
        advtId: id,
        operateTypeArr: this.options.JumiaChangeLogOptions
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
    //列表搜索参数，错误导出，在线导出，按钮的参数
    queryparams() {
      this.listQuery.product_ids = this._.trim(this.listQuery.product_ids)
      this.listQuery.shop_sku = this._.trim(this.listQuery.shop_sku)
      const queryParams = filterQueryParams(this.listQuery)
      delete queryParams.sales_count
      if (this.listQuery.sales_count) { //销量查询，参数组装
        const sort = {}
        const value = this.listQuery.sales_count.split('-')
        sort[value[0]] = value[1]
        if (!this._.isEmpty(sort)) {
          queryParams.sort = sort
        }
      }
      return queryParams
    },
    renderList() {
      this.listData = []
      this.listLoading = true
      this.expand = true
      const queryParams = this.queryparams()
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
          this._.forEach(v.child_product, (val) => {
            val.isSelected = false
            val.virtual_gross_margin = val.custom_gross_margin
            val.virtual_custom_price = val.custom_price
            val.virtual_custom_quantity = val.custom_quantity
            val.show_quantity_edit = false
            val.show_quantity_icon = false
            val.show_price_icon = false
            val.show_price_edit = false
            val.show_gross_icon = false
            val.show_gross_edit = false
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
    // 设置毛利率
    setGrossMargins(data, type) {
      this.currentRow = data
      let ids = []
      let gross_margin = ''
      if (type === 'all') {
        const status = []
        this._.forEach(this.setPriceArr, (v) => {
          this._.forEach(v.child_product, (val) => {
            if (val.isSelected === true) {
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
        this.$prompt('请输入指定毛利率', '提示', {
          cancelButtonText: '取消',
          confirmButtonText: '确定'
        }).then(({ value }) => {
          this._.forEach(this.multipleTable, (v) => {
            this._.forEach(v.child_product, (val) => {
              if (val.isSelected === true) {
                ids.push(val.product_id)
              }
            })
          })
          if (this.checkGross(value)) {
            const obj = {
              product_id: ids,
              custom_gross_margin: value,
              not_show_message: true
            }
            setCustomGrossMargin(obj).then((res) => {
              resultAlert(res)
            }).catch(err => {
              this.$message.error(err)
            }).finally(() => {
              this.listLoading = false
              this.renderList()
            })
          }
        })
      } else {
        if (this.checkGross(data.custom_gross_margin)) {
          const obj = {
            product_id: data.product_id.toString().split(','),
            custom_gross_margin: data.custom_gross_margin,
            not_show_message: true
          }
          setCustomGrossMargin(obj).then((res) => {
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
    // 取消毛利率
    cancelGrossMargins() {
      const advIds = []
      this.$confirm('您确定要取消指毛利率吗？', '提示', {
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
          product_id: advIds,
          not_show_message: true
        }
        this.listLoading = true
        cancelCustomGrossMargin(obj).then(res => {
          resultAlert(res)
          this.renderList()
        }).catch(err => {
          this.listLoading = false
          this.$message.error(err)
        })
      }).catch(() => {
        this.listLoading = false
      })
    },
    // 下架和批量下架
    deleteFileOrDirectory(scope, type) {
      debugger
      const product_id = []
      if (type === 'all') {
        this._.forEach(this.multipleTable, v => {
          this._.forEach(v.child_product, v2 => {
            if (v2.isSelected && v2.status === 120) {
              product_id.push(v2.product_id)
            }
          })
        })
      } else if (type === 'parent') {
        this._.forEach(scope.row.child_product, v2 => {
          if (v2.status === 120) {
            product_id.push(v2.product_id)
          }
        })
      } else {
        product_id.push(scope.row.product_id)
      }
      if (product_id.length) {
        this.$confirm('确定要下架吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          batchSoldOut({ product_id }).then(res => {
            if (res.code === 200) {
              resultAlert(res)
              this.renderList()
            } else {
              this.$message({
                type: 'error',
                message: res.message
              })
            }
          })
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
      this.listQuery.account_id = []
      this.$refs['multipleSelectAccount'].handleCancelAllUser()
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
    //上传失败状态导出
    listexport() {
      this.$confirm(`确认导出？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        const queryParams = this.queryparams()
        uploadError(queryParams).then((res) => {
          if (res.data.length) {
            exportLongTile(res.data)
          } else {
            this.$message.error(res.message)
          }
        }).finally(() => {
          this.listLoading = false
        })
      })
    },
    //在线导出
    Activelistexport() {
      this.$confirm(`确认导出？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        const queryParams = this.queryparams()
        exportProduct(queryParams).then((res) => {
          if (res.data.length) {
            ActiveexportLongTile(res.data)
          } else {
            this.$message.error(res.message)
          }
        }).finally(() => {
          this.listLoading = false
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
  cursor: pointer;
}

.el-table th > .cell > svg {
  color: #fff;
  transform: rotate(90deg);
  transition: linear .5s;
}
</style>
