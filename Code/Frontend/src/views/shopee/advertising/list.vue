<template>
  <div v-loading.fullscreen.lock="delListLoading" class="shopee-message">
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="Site Code" prop="accountId">
          <multiple-select-account
            ref="multipleSelectAccount"
            v-bind.sync="multipleSelectAccountOption"
            @select-account="selectAccount"
            @clean-select="cleanSelect"
            style="width: 200px"
          ></multiple-select-account>
        </el-form-item>
        <el-form-item label="产品来源" prop="sourceType">
          <multiple-select-account
            ref="multipleSelectSourceType"
            v-bind.sync="multipleSelectSourceTypeOption"
            @select-account="selectSourceType"
            @clean-select="cleanSelect"
            style="width: 200px"
          ></multiple-select-account>
        </el-form-item>
        <el-form-item label="Product ID" prop="advtProductIds">
          <el-input v-model="listQuery.advtProductIds" clearable placeholder="多个请用空格分隔" style="width: 150px;"></el-input>
        </el-form-item>
        <el-form-item label="平台商品号" prop="advtSpuId">
          <el-input v-model="listQuery.advtSpuId" clearable placeholder="请用空格分隔" style="width: 150px;"></el-input>
        </el-form-item>
        <el-form-item label="产品线" prop="productLine">
          <el-select v-model="listQuery.productLine" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="item in options.shopeeProductLine" :key="item.id" :label="item.name" :value="item.id"></el-option>
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
        <el-form-item label="推送失败原因" prop="errReason" v-if="Number(listQuery.advtStatus) === 170">
          <el-select v-model="listQuery.errReason" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="item in errReasonOption" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关键字" prop="keyword">
          <el-input v-model="listQuery.keyword" clearable placeholder="请输入关键字" style="width: 150px;"></el-input>
        </el-form-item>
        <el-form-item v-if="options.shopeeAdvtTypes" label="广告类型" prop="advtType">
          <el-checkbox-group v-model="listQuery.advtType">
            <el-checkbox-button v-for="advtType in options.shopeeAdvtTypes" :label="advtType.key" :key="advtType.key">{{ advtType.label }}</el-checkbox-button>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="创建时间" prop="advtCreated">
          <el-date-picker
            v-model="listQuery.advtCreated"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="timestamp" style="width: 300px"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item v-if="listQuery.advtStatus === 110" label="平台销量" prop="saleSt">
          <el-input v-model="listQuery.saleSt" clearable placeholder="最低销量" style="width: 120px;"></el-input>
        </el-form-item>
        <el-form-item v-if="listQuery.advtStatus === 110" prop="saleEd">
          -
          <el-input v-model="listQuery.saleEd" clearable placeholder="最高销量" style="width: 120px;"></el-input>
        </el-form-item>
        <el-form-item label="浏览量" prop="viewSt">
          <el-input v-model="listQuery.viewSt" clearable placeholder="最低浏览量" style="width: 120px;"></el-input>
        </el-form-item>
        <el-form-item prop="viewEd">
          -
          <el-input v-model="listQuery.viewEd" clearable placeholder="最高浏览量" style="width: 120px;"></el-input>
        </el-form-item>
        <el-form-item label="点赞量" prop="likeSt">
          <el-input v-model="listQuery.likeSt" clearable placeholder="最低点赞数" style="width: 120px;"></el-input>
        </el-form-item>
        <el-form-item prop="likeEd">
          -
          <el-input v-model="listQuery.likeEd" clearable placeholder="最高点赞数" style="width: 120px;"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 状态 -->
    <div class="header-box">
      <el-row class="left-row" v-if="options.esAdvtStatus">
        <el-tag v-for="(status, i) in options.esAdvtStatus" :key="i" :type="statusSelected(status.key)" size="medium">
          <span @click="changeStatus(status.key)">{{ status.label }} ({{ status.total }})</span>
        </el-tag>
      </el-row>
      <!--      -->
      <el-row class="right-row">
        <el-button type="warning"
                   size="mini"
                   v-permission="permissions.advertising_soldout"
                   @click="pushBatch(setPriceArr,'all')"
                   :disabled="setPriceArr.length === 0"
                   v-if="[170].includes(listQuery.advtStatus)"
        >
          批量推送
        </el-button>
        <el-button type="primary"
                   size="mini"
                   v-permission="permissions.advertising_itemOnline"
                   @click="shelvesFileOrDirectory(setPriceArr,'all')"
                   :disabled="setPriceArr.length === 0"
                   v-if="[140].includes(listQuery.advtStatus)"
        >
          批量上架
        </el-button>
        <el-button type="danger"
                   size="mini"
                   v-permission="permissions.advertising_delete"
                   @click="deleteFileOrDirectory(setPriceArr,'all')"
                   :disabled="setPriceArr.length === 0"
                   v-if="[140].includes(listQuery.advtStatus)"
        >
          批量删除
        </el-button>
        <el-button type="danger"
                   size="mini"
                   v-permission="permissions.advertising_itemOnline"
                   @click="soltOutFileOrDirectory(setPriceArr,'all')"
                   :disabled="setPriceArr.length === 0"
                   v-if="[110,150,120].includes(listQuery.advtStatus)"
        >
          批量下架
        </el-button>
        <el-button type="info"
                   size="mini"
                   v-permission="permissions.advertising_ViewTheAD"
                   @click="openMoreTab"
                   :disabled="setPriceArr.length === 0"
        >
          批量打开广告详情页
        </el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table :data="listData"
                ref="table"
                :key="newDate"
                :default-expand-all="expand"
                @header-click="handleExpand"
                v-loading.lock="listLoading"
                element-loading-text="努力加载中"
                border
                style="width: 100%"
                :row-key="getRowKey"
                highlight-current-row
                @current-change="handleCurrentChange1"
                @select-all="handleSelectionChange"
                @select="handleSelectionRow"
                @selection-change="selectionChange"
                @sort-change="tableResortEvent"
                @filter-change="handleFilterChange"
      >
        <el-table-column width="40" type="expand">
          <template slot="header">
            <svg-icon icon-class="right" />
          </template>
          <template slot-scope="props">
            <el-table :data="props.row.child_product" border>
              <el-table-column width="40">
                <template slot-scope="scope">
                  <el-checkbox @input="smt(props.row)" v-model="scope.row.isSelected" :disabled="scope.row.queued_to_push === 1 || scope.row.pending !== 0" />
                </template>
              </el-table-column>
              <el-table-column prop="istore_product_id" label="产品ID" sortable :sort-method="(a,b) => a-b">
                <template v-slot="scope">
                  <a href="javascript:;" style="color:rgb(64, 158, 255)">{{ scope.row.istore_product_id }}</a>
                </template>
              </el-table-column>
              <el-table-column prop="product_name" label="产品名称" min-width="260"></el-table-column>
              <!-- <el-table-column prop="custom_price" label="指定价" v-if="listQuery.advtStatus === 110">
                <template slot-scope="scope">
                  <el-input size="small" class="inline-edit-input" v-model="scope.row.custom_price"
                            :disabled="scope.row.custom_price_type === 2 ? isDisable = true : isDisable = false"
                            @focus="setPress(scope.row, 'single')"
                  ></el-input>
                </template>
              </el-table-column> -->
              <el-table-column prop="total_price" label="价格" width="60"></el-table-column>
              <el-table-column prop="gross_margin" label="毛利率" width="60" v-if="listQuery.advtStatus === 110">
                <template slot-scope="scope">
                  <el-input size="small" class="inline-edit-input" v-model="scope.row.gross_margin"
                            :disabled="scope.row.custom_price_type === 1 ? isDisable = true : isDisable = false"
                            @focus="setGrossMargins(scope.row, '2')"
                  ></el-input>
                </template>
              </el-table-column>
              <!-- <el-table-column prop="is_custom_price" label="是否指定价" min-width="82" v-if="listQuery.advtStatus === 110">
                <template slot-scope="scope">
                  {{ scope.row.is_custom_price === 1 ? '是' : '否' }}
                </template>
              </el-table-column> -->
              <el-table-column prop="discount_price" label="折后价" width="60" v-if="listQuery.advtStatus === 110"></el-table-column>
              <!-- <el-table-column prop="discount_gross_margin" label="折后毛利率" min-width="82" v-if="listQuery.advtStatus === 110"></el-table-column> -->
              <el-table-column prop="base_price" label="保本价" width="60" v-if="listQuery.advtStatus === 110"></el-table-column>
              <!-- <el-table-column prop="discount_rate" label="折扣率" v-if="listQuery.advtStatus === 110"></el-table-column> -->
              <el-table-column prop="custom_stock" label="库存" width="60"></el-table-column>
              <el-table-column v-if="props.row.advt_type===2" label="7天销量" width="60" align="center" prop="sold_quantity_7"></el-table-column>
              <el-table-column v-if="props.row.advt_type===2" label="30天销量" width="65" align="center" prop="sold_quantity_30"></el-table-column>
              <el-table-column v-if="props.row.advt_type===2" label="60天销量" width="65" align="center" prop="sold_quantity_60"></el-table-column>
              <el-table-column prop="is_clear_stocks" label="是否清货" width="65">
                <template slot-scope="scope">
                  {{ scope.row.is_clear_stocks === 0 ? '否' : '是' }}
                </template>
              </el-table-column>
              <el-table-column prop="source_type" label="产品来源" width="99" align="center">
                <template slot-scope="scope">
                  <span v-if="scope.row.source_type === 1">采购员开发</span>
                  <span v-else-if="scope.row.source_type === 2">供应商自荐</span>
                  <span v-else-if="scope.row.source_type === 3">鹰眼系统</span>
                  <span v-else-if="scope.row.source_type === 4">销售推荐</span>
                  <span v-else-if="scope.row.source_type === 5">采集系统</span>
                  <span v-else-if="scope.row.source_type === 6">品牌产品</span>
                  <span v-else>--</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="99" align="center" v-if="[170].includes(listQuery.advtStatus) && props.row.type === 2">
                <template slot-scope="scope">
                  <el-button type="text" size="mini" @click="deletePushFailed(scope, 'sigle')" :disabled="props.row.queued_to_push === 1 || props.row.pending !== 0">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column
          type="selection"
          align="center"
          width="40"
          :selectable="selectable"
          :reserve-selection="true"
        >
        </el-table-column>
        <el-table-column prop="advt_id" label="ID" width="75" sortable :sort-method="(a,b) => a-b">
          <template slot-scope="scope">
            <!--<span v-if="scope.row.last_sync_time !== '0'" style="color: red">{{ scope.row.advt_id }}</span>-->
            <span>{{ scope.row.advt_id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="site_code" label="Site Code" min-width="100"></el-table-column>
        <el-table-column prop="istore_product_id" label="Product ID" width="80">
          <template slot-scope="scope">
            <span class="data-wrap" :data-site_code="scope.row.site_tag">{{ scope.row.istore_product_id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="spu_id" label="平台商品号" width="90"></el-table-column>
        <el-table-column prop="image_path" label="产品图片" width="70" align="center">
          <template slot-scope="scope">
            <picture-view v-if="scope.row.pathArr.length > 0 && checkPickShow" :pictureList="scope.row.pathArr" :width="50" :height="50" :thumbnail="false" :defaultProps="defaultProps">
            </picture-view>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="名称" min-width="260">
          <template slot-scope="scope">
            <div>
              <div v-if="!scope.row.canEditTitle" @mouseenter="showIcon(scope.row)" @mouseleave="hideIcon(scope.row)" style="padding-right:25px;position:relative;">
                <a v-if="scope.row.status === 110" v-html="scope.row.title" style="color: #409EFF;word-break: keep-all"
                   :href="scope.row.shopee_url_id" target="_blank"
                ></a>
                <span style="word-break: keep-all;" v-else v-html="scope.row.title"></span>
                <i v-show="scope.row.showIcon && scope.row.status === 110" class="el-icon-edit" title="编辑"
                   style="color:#409EFF; font-size:20px;display:inline-block;margin-left:350px;"
                   @click="editTitle(scope.row)"
                   v-permission="permissions.advertising_editTitle"
                ></i>
              </div>
              <div v-else>
                <el-input size="mini" class="custom-edit-input" v-model="scope.row.title" @blur="saveEditTitle(scope.row)"></el-input>
              </div>
              <div v-if="scope.row.status === 110" style="text-align: right; margin-top:5px;">
                <!--编辑-->
                <!--<el-button type="primary" size="mini" @click="editTitle(scope.row)">{{ scope.row.editTitleButton }}</el-button>-->
                <!--<el-button type="info" size="mini" v-if="scope.row.canEditTitle" @click="cancleEditTitle(scope.row)">取消</el-button>-->
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="advt_type"
                         align="center"
                         :render-header="renderHeader"
                         column-key="type"
                         width="70"
                         :filters="[{ text: 'Normal', value: '1' }, { text: 'Variation', value: '2' }]"
                         :filter-method="filterType"
                         filter-placement="bottom-start"
        >
          <template slot-scope="scope">
            <el-tag type="success" size="small" v-if="scope.row.advt_type === 1">Normal</el-tag>
            <el-tag type="primary" size="small" v-else-if="scope.row.advt_type === 2">Variation</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="7天销量" align="center" prop="sold_quantity_7" width="60"></el-table-column>
        <el-table-column label="30天销量" align="center" prop="sold_quantity_30" width="65"></el-table-column>
        <el-table-column label="60天销量" align="center" prop="sold_quantity_60" width="65"></el-table-column>
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
        <el-table-column prop="create_time" label="创建时间" width="86">
          <template slot-scope="scope" v-if="parseInt(scope.row.create_time) > 0">{{ parseInt(scope.row.create_time) | moment('YYYY-MM-DD HH:mm') }}</template>
        </el-table-column>
        <el-table-column prop="update_time" v-if="['shelved','plt_shelved'].includes(listQuery.advtStatus)" label="删除时间" width="86" sortable="custom">
          <template slot-scope="scope">{{ parseInt(scope.row.update_time) | moment('YYYY-MM-DD HH:mm') }}</template>
        </el-table-column>
        <el-table-column width="75" v-if="[110,150,'shelved','plt_shelved'].includes(listQuery.advtStatus)" prop="views" label="浏览量"
                         sortable="custom"
        ></el-table-column>
        <el-table-column width="75" v-if="[110,150,'shelved','plt_shelved'].includes(listQuery.advtStatus)"
                         prop="likes" 
                         label="点赞量"
                         sortable="custom"
        >
        </el-table-column>
        <el-table-column v-if="listQuery.advtStatus !== 100 && listQuery.advtStatus !== 170" prop="sales" label="平台销量" width="85" sortable="custom"></el-table-column>
        <el-table-column v-if="listQuery.advtStatus === 170" prop="push_fail_msg" label="失败原因"></el-table-column>
        <el-table-column label="操作" width="115" align="center" fixed="right">
          <template slot-scope="scope">
            <!-- 暂时注释操作 -->
            <el-button type="text" size="mini"
                       v-permission="permissions.advertising_ViewTheAD"
                       @click="openTheNewTAB('shopee.advertising.detail', { id: scope.row.id, status: listQuery.advtStatus })"
            >
              详情
            </el-button>
            <el-button type="text"
                       v-if="[140].includes(listQuery.advtStatus)"
                       v-permission="permissions.advertising_itemOnline" size="mini"
                       @click="shelvesFileOrDirectory(scope)"
                       :disabled="scope.row.pending !== 0"
            >
              上架
            </el-button>
            <el-button type="text" v-if="[140].includes(listQuery.advtStatus)"
                       v-permission="permissions.advertising_delete"
                       size="mini"
                       @click="deleteFileOrDirectory(scope)"
                       :disabled="scope.row.pending !== 0"
            >
              删除
            </el-button>
            <el-button type="text"
                       v-if="[110, 150, 120, 'prohibited_words'].includes(listQuery.advtStatus)"
                       size="mini" @click="soltOutFileOrDirectory(scope)"
                       :disabled="scope.row.pending !== 0"
                       v-permission="permissions.advertising_itemOnline"
            >
              下架
            </el-button>
            <el-button type="text" v-if="[170].includes(listQuery.advtStatus)"
                       v-permission="permissions.advertising_soldout"
                       size="mini"
                       @click="pushBatch(scope)"
                       :disabled="scope.row.queued_to_push === 1 || scope.row.pending !== 0"
            >
              推送
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
    <!-- 导入组件 -->
    <import-advt v-bind.sync="importOption"></import-advt>
    <set-price v-bind.sync="setPriceOption" @renderList="renderList"></set-price>
    <set-gross-margins v-bind.sync="setGrossMarginOption" @renderList="renderList"></set-gross-margins>
    <!-- <set-inventory v-bind.sync="setInventoryOption" v-on:renderList="renderList"></set-inventory> -->
    <set-store-inventory v-bind.sync="setStoreInventoryOption" @renderList="renderList"></set-store-inventory>
    <un-store-inventory v-bind.sync="unStoreInventoryOption" @renderList="renderList"></un-store-inventory>
    <copy-advt v-bind.sync="copyAdvtOption" @renderList="renderList"></copy-advt>
    <sold-out v-bind.sync="soldOutOptions" @renderList="renderList"></sold-out>
  </div>
</template>
<script>
import { toBoolean, filterQueryParams } from '@/utils/help'
import { exportLongTile, exportLongDescription, exportFormat } from '@/views/shopee/export'
import { fetchList, apiReviewAdvt, editProductName, prohibitedJudgment } from '@/api/shopee'
import { getSelectAll, unInventory, delPushFailed, rePush, shelves, deletePlatformAdvt } from '@/api/shopee'
import { fetchExportData, unpricing, fetchExportformatData, userSelect } from '@/api/shopee'
import importAdvt from './components/import'
import setPrice from './components/setPrice'
import setGrossMargins from './components/setGrossMargins'
// import setInventory from './components/setInventory'
import setStoreInventory from './components/setStoreInventory'
import unStoreInventory from './components/unStoreInventory'
import multipleSelectAccount from './components/multipleSelectAccount'
import copyAdvt from './components/copyAdvt'
import soldOut from './components/soldOutDialog'

export default {
  name: 'Advertising',
  components: { importAdvt, setPrice, setGrossMargins, setStoreInventory, unStoreInventory, multipleSelectAccount, copyAdvt, soldOut },
  data() {
    return {
      title: '类型 ',
      filter: 'filter',
      checked: true,
      newDate: new Date().getTime(),
      isDisable: false,
      options: {},
      expand: false,
      listLoading: true,
      delListLoading: false,
      listTotal: null,
      listData: [],
      statusMap: {
        push_fail: 170,
        prohibited_words: 'prohibited_words'
      },
      permissions: {
        advertising_soldout: 'shopee.advt.advt.repush',//批量推送
        advertising_ViewTheAD: 'shopee.advt.advt.info',//查看广告详情
        advertising_itemOnline: 'shopee.advt.advt.unlist-item-online',//下架/上架//这是一个接口
        advertising_delete: 'shopee.advt.delete-platform-advt.execute',//删除
        advertising_editTitle: 'shopee.advt.alters.edit-title'//删除
      },
      listQuery: {
        page: 1,
        per_page: 20,
        accountId: [],
        sourceType: undefined,
        advtProductIds: undefined,
        advtSpuId: undefined,
        productLine: undefined,
        advtType: [],
        advtStatus: 110,
        advtCreated: [],
        product_name: undefined,
        stockSt: undefined,
        stockEd: undefined,
        discountPriceSt: '',
        discountPriceEd: '',
        saleSt: undefined,
        saleEd: undefined,
        viewSt: undefined,
        viewEd: undefined,
        likeSt: undefined,
        likeEd: undefined,
        is_clear_stocks: undefined,
        not_show_message: true,
        keyword: '',
        errReason: '',
        sales_count: undefined//销量
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
      // setInventoryOption: {
      //   advtIds: [],
      //   open: false,
      //   inventory: ''
      // },
      setStoreInventoryOption: {
        options: [],
        open: false
      },
      unStoreInventoryOption: {
        advtIds: [],
        open: false
      },
      multipleTable: [],
      statusTags: [],
      currentRow: null,
      checkPickShow: true,
      checkNum: 0,
      sorting: {},
      multipleSelectAccountOption: {
        accountArr: [],
        accountKey: 'id'
      },
      multipleSelectSourceTypeOption: {
        accountArr: [],
        accountKey: 'id'
      },
      copyAdvtOption: {
        siteCode: [],
        data: [],
        open: false
      },
      defaultProps: {
        originalKey: 'original',
        thumbnailKey: 'thumbnail'
      },
      soldOutOptions: {
        open: false,
        options: [],
        stateOptions: ''
      },
      errReasonOption: [
        { value: 1, label: '图片下载失败' },
        { value: 2, label: '属性错误' },
        { value: 3, label: '分类目录错误' },
        { value: 4, label: '重量错误' },
        { value: 5, label: '区分项错误' },
        { value: 6, label: '标题错误' },
        { value: 7, label: '描述错误' },
        { value: 8, label: '其它错误' }
      ]
    }
  },
  created() {
    const optionsParams = ['shopeeAdvtAccount', 'shopeeAdvtTypes', 'shopeeProductLine', 'shopeeAdvtShopAccount']
    getSelectAll(optionsParams).then(response => {
      this.options = this._.assign(this.options, response.data)
      this._.forEach(this.options.shopeeAdvtShopAccount, (v, i) => {
        v.value = i
        this._.forEach(v.children, v1 => {
          v1.label = v1.site_code
          v1.value = v1.id
        })
      })
      this.$forceUpdate()
    })
    this.renderList()
    this.SearchInit()
  },
  computed: {
    setPriceArr() {
      this.checkNumChange(this.checkNum)
      const arr = []
      this._.forEach(this.multipleTable, (v) => {
        arr.push(v)
      })
      return arr
    },
    // 推送失败选中子产品
    setPriceArrChild() {
      // this.checkNumChange(this.checkNum)
      const arr = []
      this._.forEach(this.multipleTable, (v) => {
        this._.forEach(v.child_product, k => {
          if (k.isSelected) {
            arr.push(k)
          }
        })
      })
      return arr
    }
  },
  methods: {
    openMoreTab() {
      const detailsId = this.multipleTable.map(v => {
        return { id: v.id, status: v.status }
      })
      detailsId.map(v => {
        window.open(`/shopee/advertising/detail/${v.id}/${v.status}`)
      })
    },
    getRowKey(row) {
      return row.id
    },
    // 删除禁止选中
    selectable(row, index) {
      if (row.queued_to_push === 1 || row.pending !== 0) {
        return false
      } else {
        return true
      }
    },
    showIcon(val) {
      const _this = this
      if (!this.canEditTitle) {
        this.$nextTick(() => {
          this.listData.forEach(V => {
            _this.$set(val, 'showIcon', false)
          })
          this.$set(val, 'showIcon', true)
        })
      }
    },
    hideIcon(val) {
      this.$set(val, 'showIcon', false)
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
    renderList(val) {
      this.listData = []
      this.listLoading = true
      this.listQuery.advtProductIds = this._.trim(this.listQuery.advtProductIds)
      this.listQuery.advtSpuId = this._.trim(this.listQuery.advtSpuId)
      this.listQuery.saleSt = this._.trim(this.listQuery.saleSt)
      this.listQuery.saleEd = this._.trim(this.listQuery.saleEd)
      const queryParams = filterQueryParams(this.listQuery)
      if (this.listQuery.sales_count) { //销量查询，参数组装
        let sort = {}
        const value = this.listQuery.sales_count.split('-')
        sort[value[0]] = value[1]
        if (!this._.isEmpty(sort)) {
          delete queryParams.sales_count
          queryParams.sort = sort
        }
      }
      if (this.listQuery.sourceType && this.listQuery.sourceType.length !== 0) {
        queryParams.sourceType = this.listQuery.sourceType.join(',')
      }
      if (this.listQuery.advtStatus === 'shelved' || this.listQuery.advtStatus === 'plt_shelved') {
        queryParams.sort_delete = 'desc'
      }
      if (this.listQuery.advtStatus !== 110) {
        queryParams.saleSt = undefined
        queryParams.saleEd = undefined
      }
      if (val) {
        if (val.prop === 'views') {
          if (val.order === 'descending') {
            queryParams.sort_views = 'desc'
          } else {
            queryParams.sort_views = 'asc'
          }
        } else if (val.prop === 'likes') {
          if (val.order === 'descending') {
            queryParams.sort_likes = 'desc'
          } else {
            queryParams.sort_likes = 'asc'
          }
        } else if (val.prop === 'update_time') {
          if (val.order === 'descending') {
            queryParams.sort_delete = 'desc'
          } else {
            queryParams.sort_delete = 'asc'
          }
        } else if (val.prop === 'sales') {
          if (val.order === 'descending') {
            queryParams.sort_sales = 'desc'
          } else {
            queryParams.sort_sales = 'asc'
          }
        }
      }
      this.multipleTable = []
      fetchList(queryParams).then(response => {
        this._.forEach(response.data.list, V => {
          V.editTitleButton = '重命名'
          V.showIcon = false
          V.canEditTitle = false
          V.virtualName = V.title
        })
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
    // 搜索
    handleFilter() {
      if (this.listQuery.discountPriceSt !== '' || this.listQuery.discountPriceEd !== '') {
        if (this.listQuery.accountId.length !== 0) {
          this.newDate = new Date().getTime()
          this.filter = 'filter'
          this.listQuery.page = 1
          this.renderList(this.sorting)
        } else {
          this.$message.error('请选择一个店铺')
        }
        return
      }
      if ((this.listQuery.advtProductIds && this.listQuery.advtProductIds.trim()) || (this.listQuery.advtSpuId && this.listQuery.advtSpuId.trim())) {
        const aa = this.listQuery.advtProductIds.trim().replace(/\s+/g, ',')
        const bb = this.listQuery.advtSpuId.trim().replace(/\s+/g, ',')
        const productIdArr = aa.split(',')
        const advtSpuIdArr = bb.split(',')
        if (productIdArr.length > 10 || advtSpuIdArr.length > 10) {
          this.$message.error('最多输入10个 Product ID 或平台商品号')
          return
        }
      }
      this.newDate = new Date().getTime()
      this.filter = 'filter'
      this.listQuery.page = 1
      this.renderList(this.sorting)
    },
    handleSizeChange(val) {
      this.listQuery.page = 1
      this.listQuery.per_page = val
      this.renderList(this.sorting)
    },
    handleCurrentChange1(val) {
      this.currentRow = val
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.renderList(this.sorting)
    },
    clearSearch() {
      this.$refs.multipleSelectAccount.handleCancelAllUser()
      this.$refs.multipleSelectSourceType.handleCancelAllUser()
      this.listQuery = {
        page: 1,
        per_page: 20,
        accountId: [],
        sourceType: undefined,
        advtProductIds: undefined,
        advtSpuId: undefined,
        productLine: undefined,
        advtType: [],
        advtStatus: 110,
        advtCreated: [],
        product_name: undefined,
        stockSt: undefined,
        stockEd: undefined,
        discountPriceSt: '',
        discountPriceEd: '',
        saleSt: undefined,
        saleEd: undefined,
        viewSt: undefined,
        viewEd: undefined,
        likeSt: undefined,
        likeEd: undefined,
        is_clear_stocks: undefined,
        not_show_message: true,
        keyword: '',
        errReason: ''
      }
      this.newDate = new Date().getTime()
      this.filter = 'filter'
      this.renderList(this.sorting)
    },
    changeStatus(key) {
      this.newDate = new Date().getTime()
      if (this.listQuery.advtStatus !== key) {
        this.listQuery.advtStatus = key
        this.listQuery.page = 1
        this.filter = 'filter'
        this.renderList(this.sorting)
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
              ids.push(val.product_id)
            }
            isZeroType = this._.indexOf(status, '0')
            isOneType = this._.indexOf(status, '1')
          })
        })
        if (isZeroType >= 0 || isOneType >= 0) {
          this.setPriceOption = {
            open: true,
            data: ids,
            custom_price: ''
          }
        } else {
          this.$alert('指定价暂不能设置', '提示', {
            confirmButtonText: '确定'
          })
          return false
        }
      } else {
        ids = [data.product_id]
        custom_price = data.custom_price
        this.setPriceOption = {
          open: true,
          data: ids,
          custom_price: custom_price
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
              ids.push(val.product_id)
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
        ids = [data.product_id]
        gross_margin = data.gross_margin
        this.setGrossMarginOption = {
          open: true,
          advtIds: ids,
          gross_margin: gross_margin
        }
      }
    },
    // 指定库存
    inventory(command) {
      // if (command.fuc === 'setInventory') {
      //   this.setInventory(command.value, command.type)
      // }
      if (command.fuc === 'unInventory') {
        this.unInventory()
      } else if (command.fuc === 'setStoreInventory') {
        this.setStoreInventory()
      } else if (command.fuc === 'unStoreInventory') {
        this.unStoreInventory()
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
      } else if (command.fuc === 'setGrossMargins') {
        this.setGrossMargins(command.value, command.type)
      } else {
        return
      }
    },
    // 设置指定库存
    // setInventory(data, type) {
    //   this.currentRow = data
    //   let ids = []
    //   let inventory = ''
    //   if (type === 'all') {
    //     this._.forEach(this.setPriceArr, v => {
    //       this._.forEach(v.child_product, val => {
    //         if (val.isSelected === true) {
    //           ids.push(val.id)
    //         }
    //       })
    //     })
    //     this.setInventoryOption = {
    //       open: true,
    //       advtIds: ids,
    //       inventory: ''
    //     }
    //   } else {
    //     ids = [data.id]
    //     inventory = data.inventory
    //     this.setInventoryOption = {
    //       open: true,
    //       advtIds: ids,
    //       inventory: inventory
    //     }
    //   }
    // },
    // 设置店铺指定库存
    setStoreInventory() {
      this.setStoreInventoryOption = {
        open: true,
        options: this.options.shopeeAdvtAccount
      }
    },
    // 取消指定库存
    unInventory() {
      const ids = []
      this.$confirm('您确定要取消指定库存吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this._.forEach(this.setPriceArr, (v) => {
          this._.forEach(v.child_product, (val) => {
            ids.push(val.product_id)
          })
        })
        const obj = {
          product_id: ids,
          user_id: this.$store.state.user.info.id
        }
        unInventory(obj).finally(() => {
          this.renderList(this.sorting)
        })
      }).catch(() => {
        this.listLoading = false
      })
    },
    // 取消店铺指定库存
    unStoreInventory() {
      this.unStoreInventoryOption = {
        open: true,
        options: this.options.shopeeAdvtAccount
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
        this._.forEach(this.setPriceArr, (v) => {
          this._.forEach(v.child_product, (val) => {
            advIds.push(val.product_id)
          })
        })
        unpricing({ product_id: advIds }).finally(() => {
          this.renderList(this.sorting)
        })
      }).catch(() => {
        this.listLoading = false
      })
    },
    // 下架和批量下架
    soltOutFileOrDirectory(row, type) {
      // 当前产品有 pending 属性 为 0 的可以执行下架操作，否则提示用户不能执行操作,不进行后续操作

      // 下架或批量下架中存在有销量的产品时，走弹窗删除，弹窗显示有销量的数据

      // 选中要下架的产品中是否有有销量的产品 有==提示用户 无==执行下架操作

      let canDelete = true
      let hasSales = false
      let selectData = []
      if (type === 'all') {
        selectData = this.multipleTable
      } else {
        selectData = [row.row]
      }
      canDelete = this._.some(selectData, val => val.pending === 0)
      hasSales = this._.some(selectData, val => Number(val.sales) > 0)
      if (!canDelete) {
        this.$alert('该产品已经进入待删除状态，不可再次提交。', '提示', {
          dangerouslyUseHTMLString: true
        })
        return
      }
      if (hasSales) {
        this.soldOutOptions = {
          open: true,
          options: selectData,
          stateOptions: '1'
        }
      } else {
        const params = selectData.filter(v => v.pending === 0)
        this.$confirm('确定要下架吗？', '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            closeOnClickModal: false,
            closeOnPressEscape: false
          }).then(() => {
          const obj = {
            id: this._.map(params, 'id'),
            type: 1
          }
          shelves(obj).then(() => {
            this.renderList()
          })
        })
      }
    },
    // 删除和批量删除
    deleteFileOrDirectory(row, type) {
      // 当前产品有 pending 属性 为 0 的可以执行删除操作，否则提示用户不能执行操作,不进行后续操作
      let canDelete = true
      let hasSales = false
      let selectData = []
      if (type === 'all') {
        selectData = this.multipleTable
      } else {
        selectData = [row.row]
      }
      canDelete = this._.some(selectData, val => val.pending === 0)
      hasSales = this._.some(selectData, val => Number(val.sales) > 0)
      if (!canDelete) {
        this.$alert('当前产品状态不允许操作。', '提示', {
          dangerouslyUseHTMLString: true
        })
        return
      }
      if (hasSales) {
        this.soldOutOptions = {
          open: true,
          options: selectData,
          stateOptions: '2'
        }
      } else {
        const params = selectData.filter(v => v.pending === 0)
        this.$confirm('确定要删除吗？', '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            closeOnClickModal: false,
            closeOnPressEscape: false
          }).then(() => {
          deletePlatformAdvt(this._.map(params, 'id')).then(() => {
            this.renderList()
          })
        })
      }
    },
    // 已售完删除、批量删除
    deleteOutOfPrint(row, type) {
      if (type === 'all') {
        this.ids = this._.map(this.setPriceArr, 'id')
        this.status = this._.map(this.setPriceArr, 'pending')
      } else {
        this.ids = [row.row.id]
        this.status = [row.row.pending]
      }
      const statusResult = this.status.every((item) => {
        return item === '40'
      })
      if (!statusResult) {
        this.$confirm('是否要删除此产品', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.listLoading = false
          this.listData = []
          this.delListLoading = true
          deletePlatformAdvt(this.ids).then(() => {
            this.renderList(this.sorting)
          }).finally(() => {
            this.delListLoading = false
          })
        }).catch(() => {
          this.listLoading = false
        })
      } else {
        this.$alert('该产品已经进入待删除状态，不可再次提交。', '提示', {
          dangerouslyUseHTMLString: true
        })
      }
    },
    // copy广告
    copyAdvertising() {
      this.copyAdvtOption = {
        siteCode: this.multipleSelectAccountOption.accountArr,
        data: this.setPriceArr,
        open: true
      }
    },
    // 上架和批量上架
    shelvesFileOrDirectory(row, type) {
      if (type === 'all') {
        this.ids = this._.map(this.setPriceArr, 'id')
        this.status = this._.map(this.setPriceArr, 'pending')
      } else {
        this.ids = [row.row.id]
        this.status = [row.row.pending]
      }
      const statusResult = this.status.every((item) => {
        return item === '40'
      })
      const unlistStatus = this.status.every((item) => {
        return item === '20'
      })
      if (statusResult) {
        this.$alert('该产品已经进入待删除状态，不可再次提交。', '提示', {
          dangerouslyUseHTMLString: true
        })
      } else {
        if (!unlistStatus) {
          this.$confirm('是否要上架此产品', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.listLoading = false
            const obj = {
              id: this.ids,
              type: 0
            }
            shelves(obj).then(response => {
              // if (response.code === 200) {
              //   this.$message({
              //     type: 'success',
              //     message: response.message
              //   })
              // } else {
              //   this.$message({
              //     type: 'info',
              //     message: response.message
              //   })
              // }
              this.renderList(this.sorting)
            })
          }).catch(() => {
            this.listLoading = false
          })
        } else {
          this.$alert('该产品已经进入待上架状态，不可再次提交。', '提示', {
            dangerouslyUseHTMLString: true
          })
        }
      }
    },
    // 审核和批量审核
    handleReviewAdvt(row, type) {
      if (type === 'all') {
        this.ids = this._.map(this.setPriceArr, 'id')
        this.status = this._.map(this.setPriceArr, 'pending')
      } else {
        this.ids = [row.row.id]
        this.status = [row.row.pending]
      }
      const statusResult = this.status.every((item) => {
        return item === '40'
      })
      if (!statusResult) {
        this.$confirm('是否确认审核', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          apiReviewAdvt({ id: this.ids }).then(response => {
            // if (response.code === 200) {
            //   this.$message({
            //     type: 'success',
            //     message: response.message
            //   })
            // } else {
            //   this.$message({
            //     type: 'info',
            //     message: response.message
            //   })
            // }
            this.renderList(this.sorting)
          }).catch(() => {
            this.listLoading = false
          })
        })
      } else {
        this.$alert('该产品已经进入待删除状态，不可审核。', '提示', {
          dangerouslyUseHTMLString: true
        })
      }
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
        exportLongTile(exportData)
      }
      if (this.listQuery.advtStatus === 520) {
        exportLongDescription(exportData)
      }
      if (this.listQuery.advtStatus === 170) {
        exportFormat(exportData)
      }
    },
    exportFormatExcel(val) {
      const ids = this._.map(this.multipleTable, v => {
        return v.id
      })
      const obj = {
        id: ids
      }
      let flag = true
      for (let i = 0; i < val.length; i++) {
        if (val[i].site_code !== val[0].site_code) {
          this.$message.error('Site code必须为同一店铺下')
          flag = false
          break
        }
      }
      if (flag) {
        fetchExportformatData(obj).then(response => {
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
      }
    },
    importExcel() {
      this.importOption = {
        open: true,
        advtStatus: this.listQuery.advtStatus
      }
    },
    importFormatExcel() {
      this.importOption = {
        open: true,
        advtStatus: this.listQuery.advtStatus
      }
    },
    // 表格类型筛选
    filterType(value, row) {
      return row.advt_type === value
    },
    // 清理缩略图缓存
    tableResortEvent(param) {
      this.checkPickShow = false
      this.$nextTick(() => {
        this.checkPickShow = true
      })
      this.sorting = param
      this.renderList(this.sorting)
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
    // 编辑标题
    editTitle(row) {
      if (row.is_prohibit_words === '1') {
        this.$message({
          message: '请在违禁词待审核下审核广告后再进行编辑',
          type: 'warning'
        })
      } else {
        row.canEditTitle = true
        row.showIcon = false
        setTimeout(() => {
          document.querySelector('.el-table tr td div.cell div.custom-edit-input input').focus()
        })
      }
    },
    // 保存标题
    saveEditTitle(row) {
      let msg
      if (!row.title.trim()) {
        // 非空验证
        msg = '广告标题不能为空'
      } else if (row.title === row.virtualName) {
        // 输入标题未改变
        msg = '广告标题未发生改变'
      }
      if (msg) {
        this.$confirm(msg, '提示', {
          confirmButtonText: '重新编辑',
          cancelButtonText: '取消编辑',
          closeOnClickModal: false,
          closeOnPressEscape: false,
          type: 'warning'
        }).then(() => {
          this.editTitle(row)
        }).catch(() => {
          this.cancleEditTitle(row)
        })
      } else {
        // 保存新的标题,保存成功刷新列表，保存异常标题显示为之前标题
        const obj = {
          account_id: row.account_id,
          product_str: row.title,
          not_show_message: true
        }
        // 违禁词判断
        prohibitedJudgment(obj).then(res => {
          if (res.res_code === 200) {
            editProductName({ id: row.id, product_name: row.title }).then(() => {
              this.renderList(this.sorting)
            }).catch(() => {
              row.title = row.virtualName
            })
          } else if (res.res_code === 300002) {
            this.$confirm('标题/描述包含可保存违禁词，是否保存？').then(() => {
              editProductName({ id: row.id, product_name: row.title }).then(() => {
                this.renderList(this.sorting)
              }).catch(() => {
                row.title = row.virtualName
              })
            }).catch(() => {
              this.cancleEditTitle(row)
            })
          } else if (res.res_code === 30001) {
            this.$message({
              message: res.message,
              type: 'warning'
            })
            this.cancleEditTitle(row)
          }
        }).catch(() => {
        })
      }
    },
    // 取消编辑
    cancleEditTitle(row) {
      row.canEditTitle = false
      row.title = row.virtualName
    },
    // site code多选框
    selectAccount(arr) {
      this.listQuery.accountId = arr
    },
    selectSourceType(arr) {
      this.listQuery.sourceType = arr
    },
    cleanSelect() {
      this.$refs['listQuery'].resetFields()
    },
    // 初始化站点选项
    SearchInit() {
      const optionsParams = ['shopeeAdvtAccount']
      userSelect(optionsParams).then(response => {
        this.multipleSelectAccountOption.accountArr = response.data.shopeeAdvtAccount
      })
      const sourceTypeOptions = [{ id: '1', account: '采购员开发' }, { id: '2', account: '供应商自荐' }, { id: '3', account: '鹰眼系统' }, { id: '4', account: '销售推荐' }, { id: '5', account: '采集系统' }, {
        id: '6',
        account: '品牌产品'
      }]
      this.multipleSelectSourceTypeOption.accountArr = sourceTypeOptions
    },
    handleExpand(column) {
      if (column.type === 'expand') {
        this.expand = !this.expand
        // 强制刷新DOM
        this.newDate = new Date().getTime()
      }
    },
    // 推送失败删除
    deletePushFailed(row, type) {
      if (type === 'all') {
        this.ids = this._.map(this.setPriceArrChild, 'product_id')
      } else if (type === 'sigle') {
        this.ids = [row.row.product_id]
      } else {
        this.ids = this._.map(row.row.child_product, 'product_id')
      }
      this.$confirm('是否要删除此产品', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = false
        delPushFailed({ product_ids: this.ids }).then(response => {
          // if (response.code === 200) {
          //   this.$message({
          //     type: 'success',
          //     message: response.message
          //   })
          // } else {
          //   this.$message({
          //     type: 'info',
          //     message: response.message
          //   })
          // }
          this.renderList(this.sorting)
        })
      }).catch(() => {
        this.listLoading = false
      })
    },
    // 重新推送失败广告
    pushBatch(row, type) {
      if (type === 'all') {
        this.ids = this._.map(this.setPriceArr, 'id')
      } else {
        this.ids = [row.row.id]
      }
      this.$confirm('是否要推送此产品', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = false
        rePush({ advt_ids: this.ids }).then(response => {
          // if (response.code === 200) {
          //   this.$message({
          //     type: 'success',
          //     message: response.message
          //   })
          // } else {
          //   this.$message({
          //     type: 'info',
          //     message: response.message
          //   })
          // }
          this.renderList(this.sorting)
        })
      }).catch(() => {
        this.listLoading = false
      })
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
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>

.popover-cc {
  font-size: 12px;

  p {
    line-height: 22px;
    text-align: justify;
  }
}

.el-dropdown-item {
  span {
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

.el-table th > .cell > svg {
  color: #fff;
  transform: rotate(90deg);
  transition: linear .5s;
  cursor: pointer;
}

div.right-row {
  margin-right: 5px;
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

</style>
