<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="Site Code" prop="accountId">
          <el-select v-model="listQuery.accountId" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="item in options.esAdvtAccount" :key="item.id" :label="item.site_code" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Product ID" prop="advtProductIds">
          <el-input v-model="listQuery.advtProductIds" clearable placeholder="多个请用空格分隔" style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item label="平台商品号" prop="platform_sku">
          <el-input v-model="listQuery.platform_sku" clearable placeholder="平台商品号" style="width: 120px;"></el-input>
        </el-form-item>
        <el-form-item label="产品线" prop="productLine">
          <el-select v-model="listQuery.productLine" clearable placeholder="请选择" style="width: 120px;">
            <el-option v-for="item in options.esProductLine" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据是否编辑" prop="after_edit" v-if="listQuery.advtStatus === STATUS_CODE.TWO_TOUCH">
          <el-select v-model="listQuery.after_edit" clearable placeholder="请选择" style="width: 120px">
            <el-option label="编辑后数据" value="1"></el-option>
            <el-option label="原始数据" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="错误类型" prop="errorCode" v-if="listQuery.advtStatus === STATUS_CODE.PUBLISHED_err">
          <el-cascader
            v-model="listQuery.errorCode"
            :options="errCodeOptions"
            :props="errCodeProps"
            expandTrigger="hover"
            clearable
            :show-all-levels="false"
            @change="errorCodeChange"
          ></el-cascader>
        </el-form-item>
        <el-form-item v-if="options.esAdvtTypes" label="广告类型" prop="advtType">
          <el-checkbox-group v-model="listQuery.advtType">
            <el-checkbox-button v-for="advtType in options.esAdvtTypes" :label="advtType.key" :key="advtType.key">{{ advtType.label }}</el-checkbox-button>
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
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="刊登时间" prop="upload_time"
                      v-if="[STATUS_CODE.ON_SALE,STATUS_CODE.AUTO_OUT_SALE,STATUS_CODE.MANUAL_OUT_SALE,STATUS_CODE.STOCK_OUT].includes(listQuery.advtStatus)"
        >
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
          <el-select v-model="listQuery.price_type" clearable placeholder="请选择" style="width: 120px">
            <el-option v-for="(item,index) in priceTypeArr" :key="index"
                       :label="item.label" :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否指定库存" prop="is_custom_stock" v-if="[STATUS_CODE.ON_SALE,STATUS_CODE.STOCK_OUT].includes(listQuery.advtStatus)">
          <el-select v-model="listQuery.is_custom_stock" clearable placeholder="请选择" style="width:120px">
            <el-option label="是" value="1"></el-option>
            <el-option label="否" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="销量" prop="sales_count">
          <el-select v-model="listQuery.sales_count" placeholder="请选择" style="width: 180px" clearable>
            <el-option label="7天-由高到低" value="sales_volume_7-desc"></el-option>
            <el-option label="7天-由低到高" value="sales_volume_7-asc"></el-option>
            <el-option label="30天-由高到低" value="sales_volume_30-desc"></el-option>
            <el-option label="30天-由低到高" value="sales_volume_30-asc"></el-option>
            <el-option label="60天-由高到低" value="sales_volume_60-desc"></el-option>
            <el-option label="60天-由低到高" value="sales_volume_60-asc"></el-option>
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
      <el-row class="right-row">
        <el-button type="primary" size="mini" @click="openMoreTab" :disabled="multipleTable.length === 0">批量打开广告详情页</el-button>
        <el-dropdown
          v-if="[STATUS_CODE.ON_SALE,STATUS_CODE.STOCK_OUT].includes(listQuery.advtStatus)"
          size="mini"
          split-button
          trigger="click"
          type="success"
          v-permission="[permissions.setCustomStock, permissions.cancleCustomStock]"
          @command="handleCommandInventory"
        >
          指定库存
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="0" :disabled="multipleTable.length === 0" v-permission="permissions.setCustomStock">
              设置指定库存
            </el-dropdown-item>
            <el-dropdown-item command="1" :disabled="multipleTable.length === 0" v-permission="permissions.cancleCustomStock">
              取消指定库存
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown
          v-if="listQuery.advtStatus === STATUS_CODE.ON_SALE"
          size="mini"
          split-button
          trigger="click"
          type="success"
          v-permission="[permissions.cancleCustomPrice]"
          @command="handleCommandPrice"
        >
          指定价
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="0" :disabled="!multipleTable.length">设置指定价</el-dropdown-item>
            <el-dropdown-item command="1" :disabled="!multipleTable.length">取消指定价</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown
          v-if="listQuery.advtStatus === STATUS_CODE.ON_SALE"
          size="mini"
          split-button
          trigger="click"
          type="primary"
          v-permission="[permissions.cancleCustomPrice]"
          @command="handleCommandmargin"
        >
          指定毛利率
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="0" :disabled="!multipleTable.length">设置指定毛利率</el-dropdown-item>
            <el-dropdown-item command="1" :disabled="!multipleTable.length">取消指定毛利率</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button v-debounce v-if="listQuery.advtStatus === STATUS_CODE.ON_SALE" type="danger" size="mini" @click="deleteFileOrDirectory(multipleTable,'all')" :disabled="multipleTable.length === 0"
                   v-permission="permissions.salesOff"
        >
          批量下架
        </el-button>
        <el-button v-if="[160].includes(listQuery.advtStatus)"
                   v-permission="permissions.export"
                   type="success" size="mini"
                   @click="sendToDraft"
        >
          导出
        </el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table ref="listTable"
                :key="newDate"
                :data="listData"
                v-loading="listLoading"
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
              <el-table-column width="40" align="center" v-if="listQuery.advtStatus === STATUS_CODE.ON_SALE">
                <template slot-scope="scope">
                  <el-checkbox @input="smt(props.row)" v-model="scope.row.isSelect" />
                </template>
              </el-table-column>
              <el-table-column prop="istore_product_id" label="产品ID" min-width="70"></el-table-column>
              <el-table-column prop="name" label="产品名称" min-width="150" v-if="listQuery.advtStatus === 100"></el-table-column>
              <el-table-column prop="platform_sku" v-if="Number(props.row.type) === 2" label="平台商品号" min-width="100"></el-table-column>
              <el-table-column prop="advt_status_name" label="status" v-if="listQuery.advtStatus === 100"></el-table-column>
              <el-table-column prop="base_price" label="保本价" min-width="50"></el-table-column>
              <el-table-column prop="discount_price" label="iStore价格" min-width="70"></el-table-column>
              <el-table-column prop="gross_margin" label="iStore毛利率(%)" min-width="100"></el-table-column>
              <el-table-column prop="current_price" label="当前售价" min-width="70"></el-table-column>
              <el-table-column prop="current_gross_margin" label="当前毛利率(%)" min-width="90"></el-table-column>
              <el-table-column prop="price_type" label="价格类型" width="70" v-if="listQuery.advtStatus === 120&&Number(props.row.type) === 2">
                <template slot-scope="scope">
                  {{ getLabelByCode(scope.row.price_type) }}
                </template>
              </el-table-column>
              <el-table-column prop="custom_price" label="指定价" width="80" v-if="listQuery.advtStatus === 120&&Number(props.row.type) === 1">
                <template slot-scope="scope">
                  <div class="setSub" style="position:relative;" @mouseenter="showIcon('showPriceIcon',scope.row)" @mouseleave="hideIcon('showPriceIcon',scope.row)">
                    <span>{{ scope.row.custom_price }}</span>
                    <i v-show="scope.row.showPriceIcon"
                       class="el-icon-edit"
                       title="编辑"
                       style="color:#409EFF; font-size:20px;display:inline-block;position:absolute;right:0px;"
                       @click="setCustomPrice(scope.row)"
                    ></i>
                  </div>
                  <!--                  <div v-if="scope.row.custom_price_time">{{ `(${scope.row.custom_price_time})` }}</div>-->
                </template>
              </el-table-column>
              <el-table-column prop="custom_gross_margin" min-width="100" label="指定毛利率(%)" v-if="listQuery.advtStatus === STATUS_CODE.ON_SALE">
                <template slot-scope="scope">
                  <div class="setSub" style="position:relative;" @mouseenter="showIcon('showGrossMarginIcon',scope.row)" @mouseleave="hideIcon('showGrossMarginIcon',scope.row)">
                    <span>{{ scope.row.custom_gross_margin }}</span>
                    <i v-show="scope.row.showGrossMarginIcon && listQuery.advtStatus === STATUS_CODE.ON_SALE"
                       class="el-icon-edit"
                       title="编辑"
                       style="color:#409EFF; font-size:20px;display:inline-block;position:absolute;right:0px;"
                       @click="setCustomGrossMargin(scope.row)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="custom_quantity" label="指定库存" min-width="70" v-if="[STATUS_CODE.ON_SALE,STATUS_CODE.STOCK_OUT].includes(listQuery.advtStatus)">
                <template slot-scope="scope">
                  <div class="setSub" style="position:relative;" @mouseenter="showIcon('showStockIcon',scope.row)" @mouseleave="hideIcon('showStockIcon',scope.row)">
                    <span>{{ scope.row.custom_stock }}</span>
                    <i v-show="scope.row.showStockIcon"
                       class="el-icon-edit"
                       title="编辑"
                       style="color:#409EFF; font-size:20px;display:inline-block;position:absolute;right:0px;"
                       @click="setCustomQuantity(scope.row)"
                    ></i>
                  </div>
                  <!--                  <div v-if="scope.row.custom_stock_time">{{ `(${scope.row.custom_stock_time})` }}</div>-->
                </template>
              </el-table-column>
              <el-table-column prop="is_custom_quantity" label="是否指定库存" min-width="90" v-if="[STATUS_CODE.ON_SALE,STATUS_CODE.STOCK_OUT].includes(listQuery.advtStatus)">
                <template slot-scope="scope">
                  {{ scope.row.is_custom_stock === 1 ? '是' : '否' }}
                </template>
              </el-table-column>
              <el-table-column prop="err_message" label="错误原因" v-if="listQuery.advtStatus === 160">
                <template slot-scope="scope">
                  <span v-if="scope.row.err_message&&scope.row.err_message.length<20">{{ scope.row.err_message }}</span>
                  <el-popover
                    v-else
                    placement="right"
                    width="500"
                    trigger="hover"
                  >
                    <div style="line-height: 24px; font-size: 12px;max-height: 500px;word-wrap: break-word;overflow-y: auto;">{{ scope.row.err_message }}</div>
                    <span slot="reference" style="color: #E6A23C" class="in-two-line">{{ scope.row.err_message }}</span>
                  </el-popover>
                </template>
              </el-table-column>
              <el-table-column prop="quantity" align="center" label="库存" width="104"></el-table-column>
              <el-table-column label="7天销量" v-if="Number(props.row.type) === 2" prop="sold_quantity_7" width="70"></el-table-column>
              <el-table-column label="30天销量" v-if="Number(props.row.type) === 2" prop="sold_quantity_30" width="70"></el-table-column>
              <el-table-column label="60天销量" align="center" width="104" v-if="Number(props.row.type) === 2" prop="sold_quantity_60"></el-table-column>
              <el-table-column label="操作" width="104" align="center" fixed="right"
                               v-if="listQuery.advtStatus === STATUS_CODE.ON_SALE"
              >
                <template slot-scope="scope">
                  <el-button type="text" v-permission="permissions.salesOff"
                             v-debounce

                             :disabled="scope.row.pending_delete ===1"
                             size="mini"
                             @click="deleteFileOrDirectory(scope)"
                  >
                    下架
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="40" align="center"></el-table-column>
        <el-table-column prop="id" label="ID" width="65" sortable></el-table-column>
        <el-table-column prop="site_code" label="Site Code" width="120"></el-table-column>
        <el-table-column prop="istore_product_id" label="Product ID" min-width="80"></el-table-column>
        <el-table-column prop="platform_sku" label="平台商品号" min-width="120"></el-table-column>
        <el-table-column prop="product_image" label="产品图片" width="70" align="center">
          <template slot-scope="scope">
            <PictureView
              v-if="scope.row.pathArr.length > 0 && checkPickShow"
              :thumbnail="false"
              :pictureList="scope.row.pathArr"
              :width="50"
              :height="50"
              :defaultProps="defaultProps"
            >
            </PictureView>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="product_name" label="名称" min-width="260">
          <template slot-scope="scope">
            <a v-if="[130,120].includes(scope.row.status)"
               style="color: #409EFF;"
               :href="scope.row.platform_url"
               target="_blank"
            >
              {{ scope.row.product_name }}
            </a>
            <span v-else>{{ scope.row.product_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" min-width="70" align="center" label="类型">
          <template slot-scope="scope">
            <el-tag :type="scope.row.type === 1 ? 'success' : ''" size="small">{{ scope.row.type | getTypeLabel(options) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="产品线" prop="product_line_name" width="70"></el-table-column>
        <el-table-column label="7天销量" prop="sold_quantity_7" width="70"></el-table-column>
        <el-table-column label="30天销量" prop="sold_quantity_30" width="70"></el-table-column>
        <el-table-column label="60天销量" prop="sold_quantity_60" width="70"></el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="85" sort-by="create_time" sortable>
          <template slot-scope="scope" v-if="parseInt(scope.row.create_time) > 0">{{ scope.row.create_time }}</template>
        </el-table-column>
        <el-table-column v-if="[STATUS_CODE.ON_SALE,STATUS_CODE.AUTO_OUT_SALE,STATUS_CODE.MANUAL_OUT_SALE,STATUS_CODE.STOCK_OUT].includes(listQuery.advtStatus)"
                         prop="upload_time"
                         label="刊登时间"
                         width="85"
                         sort-by="upload_time"
                         sortable
                         align="center"
        >
          <template slot-scope="scope">
            {{ scope.row.upload_time === '1970-01-01 08:00:00' ? '-' : scope.row.upload_time }}
          </template>
        </el-table-column>
        <el-table-column prop="update_time" label="更新时间" width="85" sort-by="update_time" sortable>
          <template slot-scope="scope" v-if="parseInt(scope.row.update_time) > 0">{{ scope.row.update_time }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openLog(scope.row)" v-permission="permissions.log">日志</el-button>
            <el-button type="text" size="mini" v-debounce v-permission="permissions.edit"
                       @click="openTheNewTAB('cdiscount.advertising.detail', { id: scope.row.id, edit:1, status: scope.row.status })"
            >
              详情
            </el-button>
            <el-button type="text" v-permission="permissions.salesOff"
                       v-debounce
                       v-if="listQuery.advtStatus === STATUS_CODE.ON_SALE"
                       :disabled="scope.row.pending_delete ===1"
                       size="mini"
                       @click="deleteFileOrDirectory(scope,'parent')"
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
          :page-sizes="[ 10, 20, 50,100]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
    <!--设置指定价弹窗-->
    <set-custom-price v-bind.sync="custom_price" @reload="renderList"></set-custom-price>
    <!--设置指定库存弹窗-->
    <set-custom-quantity v-bind.sync="custom_quantity" @reload="renderList"></set-custom-quantity>
    <!--设置指定毛利率弹窗-->
    <set-gross-margin v-bind.sync="custom_gross_margin" @reload="renderList"></set-gross-margin>
    <!-- istore更新日志 -->
    <istore-log v-bind.sync="logOptions"></istore-log>
  </div>
</template>

<script>
import { toBoolean, filterQueryParams } from '@/utils/help'
import { resultAlert } from '@/utils/index'
import { fetchList, getSelectAll, soldOut, errorExport, updateState, setPrice, setStock, getErrorCode, cancleCustomPrice, cancleCustomStock } from '@/api/cdiscount'
import setCustomPrice from './list/setCustomPrice'
import setCustomQuantity from './list/setCustomQuantity'
import setGrossMargin from './list/setGrossMargin'
import istoreLog from './components/istoreLog'

export default {
  name: 'CdiscountAdvertising',
  components: { setCustomPrice, setCustomQuantity, setGrossMargin, istoreLog },
  data() {
    return {
      no_time: '1970-01-01 08:00:00',
      // 常量
      STATUS_CODE: {
        'DRAFT': 100, // 草稿状态
        'PUBLISHED': 110,//刊登中
        'ON_SALE': 120, // 已上架
        'STOCK_OUT': 130,//缺货
        'AUTO_OUT_SALE': 140, // 自动下架
        'MANUAL_OUT_SALE': 150, // 手动下架
        'PUBLISHED_err': 160 // 刊登失败
      },
      permissions: {
        // 设置指定库存
        setCustomStock: 'cdiscount.advt.custom-stock.set-custom-stock',
        // 设置指定价
        setCustomPrice: 'cdiscount.advt.custom-price.set-custom-price',
        // 取消指定库存
        cancleCustomStock: 'cdiscount.advt.custom-stock.cancel-custom-stock',
        // 取消指定价
        cancleCustomPrice: 'cdiscount.advt.custom-price.cancel-custom-price',
        // 设置价格
        setPrice: 'cdiscount.advt.advt.set-price',
        // 设置库存
        setStock: 'cdiscount.advt.advt.set-stock',
        // 编辑
        edit: 'cdiscount.advt.advt.edit',
        // 详情
        detail: 'cdiscount.advt.advt.detail',
        // 广告下架
        salesOff: 'cdiscount.advt.advt.sales-off',
        // 日志
        log: 'cdiscount.advt.advt.change-log',
        //导出
        export: 'cdiscount.advt.advt.error-export'
      },
      isDisable: false,
      newDate: new Date().getTime(),
      ids: [],
      getOnSaleStatus: 0,
      title: '类型 ',
      titleStatus: '状态 ',
      filter: 'filter',
      options: [],
      priceTypeArr: [
        { label: 'iStore价格', value: 10 },
        { label: '动态调整价', value: 20 },
        { label: '指定价', value: 30 },
        { label: '指定毛利率', value: 40 },
        { label: '跟卖价', value: 50 }
      ],
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
        advtStatus: 120,//状态码
        advtCreated: [],
        upload_time: [],
        update_time: [],
        platform_sku: undefined,
        after_edit: undefined,
        errorCode: undefined,//错误类型
        price_type: undefined,
        is_custom_stock: undefined,
        sales_count: undefined
      },
      pagination: null,
      defaultQuery: null,
      createUserList: [],
      dialogFormOption: {
        data: {},
        open: false
      },
      dialogAccreditOption: {
        data: {},
        open: false
      },
      statusTags: [],
      multipleTable: [],
      checkPickShow: true,
      checkNum: 0,
      filterList: [
        { text: '未设置价格/库存', value: 3 },
        { text: '价格/库存同步中', value: 5 },
        { text: '价格/库存同步失败', value: 6 }
      ],
      price: '',
      quantity: '',
      // 指定价弹窗
      custom_price: {
        open: false,
        rowData: {}
      },
      // 指定库存弹窗
      custom_quantity: {
        open: false,
        handleData: null
      },
      custom_gross_margin: {
        open: false,
        handleData: null
      },
      errCodeOptions: [
        { error_code: '1', error_type: 'EAN为空/重复' },
        { error_code: '2', error_type: '分类为空' },
        { error_code: '3', error_type: '长标题/短标题为空' },
        { error_code: '4', error_type: '标题不符合平台要求' },
        { error_code: '5', error_type: '禁售产品' },
        { error_code: '6', error_type: '未授权' },
        { error_code: '7', error_type: '该类目未对本店铺开放' },
        { error_code: '8', error_type: '该类目只支持传vary广告' },
        { error_code: '9', error_type: '广告不允许重新刊登' },
        { error_code: '10', error_type: '该类目不存在' },
        { error_code: '11', error_type: '库存为0' },
        { error_code: '12', error_type: '置N' },
        { error_code: '13', error_type: '侵权违规' },
        { error_code: '99', error_type: '其他' }
      ],//错误类型选择器
      errCodeProps: {
        value: 'error_code',
        label: 'error_type',
        children: 'children'
      },
      errorCodeArr: [],
      expand: true,
      defaultProps: {
        originalKey: 'original',
        thumbnailKey: 'thumbnail'
      },
      logOptions: {
        open: false,
        advtId: '',
        isVary: false
      }
    }
  },
  created() {
    this.searchInit()
    this.renderList()
    this.defaultQuery = this._.cloneDeep(this.listQuery)
  },
  computed: {},
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
    //列表价格类型展示
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
        window.open(`/cdiscount/advertising/detail/${v.id}/1/${v.status}`)
      })
    },
    // 获取搜索条件
    searchInit() {
      const selectAll = ['esAdvtTypes', 'esAdvtAccount', 'esProductLine']
      getSelectAll(selectAll).then(response => {
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
      this.pagination = undefined
      this.listData = []
      this.listQuery.advtProductIds = this._.trim(this.listQuery.advtProductIds)
      this.listQuery.advtSpuId = this._.trim(this.listQuery.advtSpuId)
      this.listQuery.platform_sku = this._.trim(this.listQuery.platform_sku)
      // 非二次处理的情况下去掉after_edit筛选项和错误类型
      // if (this.listQuery.advtStatus !== '103') {
      //   this.listQuery.after_edit = undefined
      //   this.listQuery.errorCode = undefined
      // }
      const queryParams = filterQueryParams(this.listQuery)
      delete queryParams.sales_count
      const sort = {}
      if (this.listQuery.sales_count) { //销量查询，参数组装
        const value = this.listQuery.sales_count.split('-')
        sort[value[0]] = value[1]
      }
      if (!this._.isEmpty(sort)) {
        queryParams.sort = sort
      }
      fetchList(queryParams).then(response => {
        this.listData = response.data.list
        this.pagination = response.data.pagination
        this.options.esAdvtStatus = response.data.statistics
        this._.forEach(this.listData, (v) => {
          // 复选框
          this._.forEach(v.child_product, (val) => {
            val.isSelect = false
            val.is_editPrice = v.statusCode
            val.showPriceIcon = false
            val.showGrossMarginIcon = false
            val.showStockIcon = false
            // 非指定价状态指定价显示为空
            if (val.is_custom_price === '0') {
              val.custom_price = ''
            }
          })
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
        const table = this._.cloneDeep(this.listData)
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
    handleSelectionRow(val, row) {
      const check = this._.some(row.child_product, (v) => {
        return v.isSelect
      })
      if (check) {
        this._.forEach(row.child_product, v => {
          v.isSelect = false
        })
      } else {
        this._.forEach(row.child_product, v => {
          v.isSelect = true
        })
      }
    },
    handleSelectionChange(val) {
      this._.forEach(this.listData, (v) => {
        this._.forEach(v.child_product, (v2) => {
          v2.isSelect = false
        })
      })
      this._.forEach(val, (v) => {
        this._.forEach(v.child_product, (v2) => {
          v2.isSelect = true
        })
      })
      this.multipleTable = val
    },
    selectionChange(val) {
      this.multipleTable = val
      this.checkNum++
    },
    smt(row) {
      const check = this._.some(row.child_product, (v) => {
        return v.isSelect
      })
      if (check) {
        this.$refs.listTable.toggleRowSelection(row, true)
      } else {
        this.$refs.listTable.toggleRowSelection(row, false)
      }
    },
    // 记录商品原价格 /库存
    getBasics(data, type) {
      if (type === 'price') {
        this.price = data.discount_price
      } else {
        this.quantity = data.quantity
      }
    },
    // 设置价格
    handlePrice(data) {
      const figure = /(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,3})?$)/ // 价格
      if (data.discount_price === this.price) {
        return false
      }
      if (data.discount_price === '') {
        data.discount_price = this.price
        this.$message.warning('售价不能为空')
        return false
      }
      if (!figure.test(data.discount_price)) {
        data.discount_price = this.price
        this.$message.warning('请输入正确的售价')
        return false
      }
      if (Number(data.base_price) - Number(data.discount_price) >= 0) {
        this.$message.warning('售价必须大于保本价，请重新输入')
        data.discount_price = this.price
        return false
      }
      const params = {
        price: data.discount_price,
        product_id: data.id
      }
      setPrice(params).then(res => {
        this.renderList()
        this.price = ''
      }).catch(() => {
        data.discount_price = this.price
        this.price = ''
      })
    },
    // 设置库存
    handleQuantity(data) {
      const integer = /^[0-9]\d*$/ // 库存
      if (data.quantity === this.quantity) {
        return false
      }
      if (data.quantity === '') {
        data.quantity = this.quantity
        this.$message.warning('库存不能为空')
        return false
      }
      if (!integer.test(data.quantity)) {
        data.quantity = this.quantity
        this.$message.warning('库存只能输入数字')
        return false
      }
      if (data.quantity < 0) {
        data.quantity = this.quantity
        this.$message.warning('库存不能小于0')
        return false
      }
      const params = {
        quantity: data.quantity,
        product_id: data.id
      }
      setStock(params).then(res => {
        this.renderList()
        this.price = ''
      }).catch(() => {
        data.quantity = this.quantity
        this.quantity = ''
      })
    },
    // 下架和批量下架
    deleteFileOrDirectory(scope, type) {
      const ids = []
      if (type === 'all') {
        this._.forEach(this.multipleTable, v => {
          this._.forEach(v.child_product, v2 => {
            if (v2.isSelect && v2.pending_delete === 0) {
              ids.push(v2.id)
            }
          })
        })
      } else if (type === 'parent') {
        this._.forEach(scope.row.child_product, v => {
          if (v.pending_delete === 0) {
            ids.push(v.id)
          }
        })
      } else {
        ids.push(scope.row.id)
      }
      if (ids.length) {
        this.$confirm('确定要下架此产品吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          closeOnClickModal: false,
          type: 'warning'
        }).then(() => {
          soldOut({ productIds: ids, not_show_message: true }).then(response => {
            //下架结果弹窗反馈
            this.renderList()
            if (response.data) {
              resultAlert(response)
            } else {
              this.$message.err(response.message)
            }
          })
        }).catch(() => {
          this.listLoading = false
        })
      } else {
        this.$message.error('子产品已在下架中')
      }
    },
    // 待确认--》草稿状态
    sendToDraft() {
      this.$confirm('确定导出表格吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
        closeOnPressEscape: false
      }).then(() => {
        const basePath = process.env.NODE_ENV === 'development' ? 'http://190.168.3.228:8000/' : process.env.VUE_APP_BASE_API
        window.open(`${basePath}cdiscount-new/no-auth/advt/export`)
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
      this.multipleTable = []
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
    // 清理缩略图缓存
    tableResortEvent() {
      this.checkPickShow = false
      this.$nextTick(() => {
        this.checkPickShow = true
      })
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
    // 打开设置指定价弹窗
    setCustomPrice(row) {
      this.custom_price = {
        open: true,
        rowData: row
      }
    },
    // 批量取消指定价、库存（设置）参数
    getParam() {
      const product_id = []
      this.multipleTable.map(item => {
        item.child_product.map(val => {
          if (val.isSelect) {
            product_id.push(val.id)
          }
        })
      })
      return product_id
    },
    // 取消提示框
    cancleTip(msg) {
      return this.$confirm(`您确定要取消${msg}吗`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
        closeOnPressEscape: false
      })
    },
    // 取消指定价
    cancleCustomPrice(msg, type) {
      this.cancleTip(msg).then(() => {
        const obj = {
          product_id: this.getParam(),
          custom_price_type: type,
          not_show_message: true
        }
        cancleCustomPrice(obj).then((res) => {
          if (res.data) {
            resultAlert(res)
          } else {
            this.$message.err(res.message)
          }
        }).finally(() => {
          this.renderList()
        })
      }).catch(() => {
      })
    },
    /* 指定库存 */
    handleCommandInventory(command) {
      // '0' => 设置指定库存 '1' => 取消指定库存
      if (command === '0') {
        this.setCustomQuantity(this.getParam())
      } else if (command === '1') {
        this.cancleCustomQuantity()
      }
    },
    // 指定价
    handleCommandPrice(command) {
      // '0' => 设置指定价 '1' => 取消指定价
      if (command === '0') {
        this.setCustomPrice(this.getParam())
      } else if (command === '1') {
        this.cancleCustomPrice('指定价', 1)
      }
    },
    //指定毛利率
    handleCommandmargin(command) {
      // '0' => 设置毛利率 '1' => 取消指定毛利率
      if (command === '0') {
        this.setCustomGrossMargin(this.getParam())
      } else if (command === '1') {
        this.cancleCustomPrice('毛利率', 2)
      }
    },
    // 打开指定库存弹窗
    setCustomQuantity(val) {
      // 值handleData若为输入框点击则为当前行数据（object），若为批量设置则为getParam处理过的选中的id数组
      this.custom_quantity = {
        open: true,
        handleData: val
      }
    },
    cancleCustomQuantity() {//设置库存
      this.cancleTip('指定库存').then(() => {
        const product_id = this.getParam()
        cancleCustomStock({ product_id, not_show_message: true }).then((res) => {
          if (res.data) {
            resultAlert(res)
          } else {
            this.$message.err(res.message)
          }
        }).finally(() => {
          this.renderList()
        })
      }).catch(() => {
      })
    },
    errorCodeChange(val) {
      this.listQuery.errorCode = val[val.length - 1]
    },
    // 打开指定库存弹窗
    setCustomGrossMargin(val) {
      // 值handleData若为输入框点击则为当前行数据（object），若为批量设置则为getParam处理过的选中的id数组
      this.custom_gross_margin = {
        open: true,
        handleData: val
      }
    },
    showIcon(type, row) {
      row[type] = true
    },
    hideIcon(type, row) {
      row[type] = false
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
      const types = options.esAdvtTypes
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


.setSub {
  .el-input.is-disabled .el-input__inner {
    color: #1f2d3d !important;
  }
}
</style>
<style rel="stylesheet/scss" lang="scss">
.setSub {
  .el-input.is-disabled .el-input__inner {
    color: #606266 !important;
  }

}

.el-table th > .cell > svg {
  color: #fff;
  transform: rotate(90deg);
  transition: linear .5s;
}
</style>
