<template>
  <div class="linio-export-loading-area">
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="Site Code" prop="account_id">
          <multiple-select-account ref="multipleSelectAccount" v-bind.sync="multipleSelectAccountOption" @select-account="selectAccount" @clean-select="cleanSelect"></multiple-select-account>
        </el-form-item>
        <el-form-item label="Product ID" prop="advt_product_ids">
          <el-input v-model="listQuery.advt_product_ids" clearable placeholder="多个请用空格分隔" style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item label="产品线"
                      prop="product_line_id"
        >
          <el-select v-model="listQuery.product_line_id" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="(item,ind) in options.LinioProductLine" :key="ind" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="广告类型" prop="advt_type">
          <el-checkbox-group v-model="listQuery.advt_type">
            <el-checkbox-button v-for="types in options.LinioAdvtTypes" :label="types.key" :key="types.key">{{ types.label }}</el-checkbox-button>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="价格类型"
                      prop="price_type"
                      v-show="listQuery.advt_status === 120 || listQuery.advt_status === 130"
        >
          <el-select v-model="listQuery.price_type" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="(item,index) in priceTypeArr" :key="index" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="listQuery.advt_status === 120 || listQuery.advt_status === 130" label="是否指定库存" prop="is_custom_quantity">
          <el-select v-model="listQuery.is_custom_quantity" clearable style="width: 100px;">
            <el-option v-for="item in options.customQuantity" :label="item.label" :value="item.key" :key="item.key">{{ item.label }}</el-option>
          </el-select>
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
        <el-form-item label="销量" prop="sales_count">
          <el-select v-model="listQuery.sales_count"
                     placeholder="请选择"
                     style="width: 180px"
                     clearable
          >
            <el-option label="7天-由高到低" value="sold_quantity_7-desc"></el-option>
            <el-option label="7天-由低到高" value="sold_quantity_7-asc"></el-option>
            <el-option label="30天-由高到低" value="sold_quantity_30-desc"></el-option>
            <el-option label="30天-由低到高" value="sold_quantity_30-asc"></el-option>
            <el-option label="60天-由高到低" value="sold_quantity_60-desc"></el-option>
            <el-option label="60天-由低到高" value="sold_quantity_60-asc"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Shop Sku" prop="shop_sku">
          <el-input v-model="listQuery.shop_sku" clearable placeholder="多个请用空格分隔" style="width: 200px;"></el-input>
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
        <el-button v-permission="permissions.advertising_export" v-if="listQuery.advt_status === 140" type="primary" size="mini" @click="exportListData">导出</el-button>
        <el-button type="primary" size="mini" @click="openMoreTab"
                   :disabled="multipleTable.length === 0"
                   v-permission="permissions.advertising_ViewTheAD"
        >
          批量打开广告详情页
        </el-button>
        <el-dropdown v-if="listQuery.advt_status === 120 || listQuery.advt_status === 130"
                     size="mini" split-button
                     type="success"
                     trigger="click"
                     @command="stock"
                     v-permission="[permissions.advertising_setinventory,permissions.advertising_cancelinventory]"
        >
          指定库存
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              :disabled="this.multipleTable.length === 0"
              :command="{ fuc: 'setStock', type: 'all' }"
              v-permission="permissions.advertising_setinventory"
            >
              设置指定库存
            </el-dropdown-item>
            <el-dropdown-item
              :disabled="this.multipleTable.length === 0"
              :command="{ fuc: 'cancleStock', type: 'all' }"
              v-permission="permissions.advertising_cancelinventory"
            >
              取消指定库存
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown v-if="listQuery.advt_status === 120 || listQuery.advt_status === 130"
                     size="mini" split-button
                     type="primary"
                     trigger="click"
                     @command="customMargin"
                     v-permission="[permissions.advertising_customSetPrice,permissions.advertising_customCancelStock]"
        >
          指定毛利率
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              :disabled="this.multipleTable.length === 0"
              :command="{ fuc: 'setMargin',rowData: multipleTable }"
              v-permission="permissions.advertising_customSetPrice"
            >
              设置指定毛利率
            </el-dropdown-item>
            <el-dropdown-item
              :disabled="this.multipleTable.length === 0"
              :command="{ fuc: 'cancleMargin',rowData: this.multipleTable }"
              v-permission="permissions.advertising_customCancelStock"
            >
              取消指定毛利率
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown v-if="listQuery.advt_status === 120 || listQuery.advt_status === 130"
                     size="mini" split-button
                     type="success"
                     trigger="click"
                     @command="customPrice"
                     v-permission="[permissions.advertising_customSetPrice,permissions.advertising_customCancelStock]"
        >
          指定价
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              :disabled="this.multipleTable.length === 0"
              :command="{ fuc: 'setPrice', rowData: this.multipleTable }"
              v-permission="permissions.advertising_customSetPrice"
            >
              设置指定价
            </el-dropdown-item>
            <el-dropdown-item
              :disabled="this.multipleTable.length === 0"
              :command="{ fuc: 'canclePrice',rowData: this.multipleTable }"
              v-permission="permissions.advertising_customCancelStock"
            >
              取消指定价
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button
          v-if="listQuery.advt_status === 120 || listQuery.advt_status === 130"
          type="danger"
          size="mini"
          @click="deleteFileOrDirectory(multipleTable,'all')"
          :disabled="this.multipleTable.length === 0"
          v-permission="permissions.advertising_delete"
        >
          批量下架
        </el-button>
        <el-button type="primary" v-permission="permissions.advertising_export" size="mini" v-if="listQuery.advt_status === 120" @click="exportListData">导出</el-button>
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
            <svg-icon icon-class="right"/>
          </template>
          <template slot-scope="props">
            <el-table :data="props.row.child_product" border :key="newDate">
              <el-table-column width="25" v-if="[120,130,140].includes(listQuery.advt_status)" align="center">
                <template slot-scope="scope">
                  <el-checkbox @input="child_select(props.row)" v-model="scope.row.isSelected"/>
                </template>
              </el-table-column>
              <!--产品ID、产品名称、价格、毛利率、保本价、库存-->
              <el-table-column prop="istore_product_id" label="产品ID" align="center" width="75"></el-table-column>
              <el-table-column prop="product_name" label="名称" align="center" min-width="130">
                <template slot-scope="scope">
                  <a v-if="scope.row.permalink" style="color: #409EFF;" :href="scope.row.permalink"
                     target="_blank"
                  >
                    {{ scope.row.product_name }}
                  </a>
                  <span v-else>{{ scope.row.product_name }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="shop_sku" label="Shop Sku" align="center" width="100" v-if="STATUS.SHOW_SHOP_SKU.includes(listQuery.advt_status)"></el-table-column>
              <el-table-column prop="msrp" label="吊牌价" align="center" width="60"></el-table-column>
              <el-table-column prop="base_price" label="保本价" align="center" width="60"></el-table-column>
              <el-table-column prop="discount_price" label="iStore价格" align="center" width="75"></el-table-column>
              <el-table-column prop="gross_margin" label="iStore毛利率(%)" align="center" width="110"></el-table-column>
              <el-table-column prop="current_price" label="当前销售价" align="center" width="85"></el-table-column>
              <el-table-column prop="current_gross_margin" label="当前毛利率(%)" align="center" width="100"></el-table-column>
              <el-table-column prop="price_type " label="价格类型" align="center" width="70">
                <template slot-scope="scope">
                  {{ getLabelByCode(scope.row.price_type) }}
                </template>
              </el-table-column>
              <el-table-column prop="custom_price" label="指定价" align="center" v-if="listQuery.advt_status === 120 || listQuery.advt_status === 130" width="60">
                <template slot-scope="scope">
                  <div class="setSub" style="line-height:35px;min-height:35px;position:relative;" @mouseenter="showIcon($event)" @mouseleave="hideIcon($event)">
                    <span>{{ scope.row.custom_price }}</span>
                    <i v-show="scope.row.showPriceIcon"
                       class="el-icon-edit"
                       title="编辑"
                       style="color:#409EFF; font-size:20px;position:absolute;right:-5px;top:5px;"
                       @click="setCustomPrice(scope.row)"
                       v-permission="permissions.advertising_customSetPrice"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="custom_gross_margin" label="指定毛利率" align="center" v-if="listQuery.advt_status === 120 || listQuery.advt_status === 130" width="80">
                <template slot-scope="scope">
                  <div class="setSub" style="line-height: 35px;min-height:35px;position:relative;" @mouseenter="showIcon($event)" @mouseleave="hideIcon($event)">
                    <span>{{ scope.row.custom_gross_margin }}</span>
                    <i v-show="scope.row.showGrossMarginIcon"
                       class="el-icon-edit"
                       title="编辑"
                       style="color:#409EFF; font-size:20px;position:absolute;right:-5px;top:5px;"
                       @click="setCustomGrossMargin(scope.row)"
                       v-permission="permissions.advertising_customSetPrice"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="库存" align="center" width="60"></el-table-column>
              <el-table-column prop="custom_quantity" label="指定库存" align="center" width="70" v-if="listQuery.advt_status === 120 || listQuery.advt_status === 130">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_quantity_icon',scope.row)" @mouseleave="hideEdit('show_quantity_icon',scope.row)" style="width:100%;height:32px;position: relative;">
                    <el-input
                      v-if="scope.row.show_quantity_edit"
                      class="stock_input inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_quantity"
                      @blur="setStock('single',scope.row)"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_quantity }}</span>
                    <i v-show="scope.row.show_quantity_icon && hasActiveInput"
                       v-permission="permissions.advertising_setinventory"
                       class="el-icon-edit"
                       title="编辑"
                       style="color:#409EFF; font-size:20px;top:2px;right: -5px;"
                       @click="showEdit('show_quantity_edit',scope.row, scope.$index)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="is_custom_quantity" align="center" label="是否指定库存" v-if="listQuery.advt_status === 120 || listQuery.advt_status === 130" width="90">
                <template slot-scope="scope">
                  {{ Number(scope.row.is_custom_quantity) === 1 ? '是' : '否' }}
                </template>
              </el-table-column>
              <el-table-column label="7天销量" v-if="props.row.type === 2" prop="sold_quantity_7" width="65"/>
              <el-table-column label="30天销量" v-if="props.row.type === 2" prop="sold_quantity_30" width="70"/>
              <el-table-column label="60天销量" v-if="props.row.type === 2" prop="sold_quantity_60" width="70"/>
              <el-table-column label="状态" min-width="74">
                <template slot-scope="scope">
                  {{ formatType(scope.row.status) }}
                </template>
              </el-table-column>
              <!--<el-table-column prop="status" label="状态" min-width="60" align="center">-->
              <!--<template slot-scope="scope">-->
              <!--{{ showStatus(scope.row.status) }}-->
              <!--</template>-->
              <!--</el-table-column>-->
              <el-table-column label="操作" align="center" v-if="listQuery.advt_status === 120 || listQuery.advt_status === 130" fixed="right">
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    size="mini"
                    :disabled="[190,200,210].includes(scope.row.status)"
                    @click="deleteFileOrDirectory(scope.row,'child')"
                    v-permission="permissions.advertising_delete"
                  >
                    下架
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <!-- ID、Site Code、Product ID、平台商品号、产品图片、名称、类型、Rejection Reason（仅Rejected状态显示该列）、创建时间/刊登时间、下架时间、操作（详情，点击进入广告详情页） -->
        <el-table-column type="selection" width="40" align="center"></el-table-column>
        <el-table-column prop="id" align="center" label="ID" width="75" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column prop="site_code" align="center" label="Site Code" width="100"></el-table-column>
        <el-table-column prop="istore_product_id" align="center" label="Product ID" width="80"></el-table-column>
        <!--<el-table-column v-if="listQuery.advt_status === 120 || listQuery.advt_status === 130" prop="spu_id" label="平台商品号" width="100"></el-table-column>-->
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
        <!--<el-table-column prop="quantity" label="Inventory" align="center" width="120"></el-table-column>-->
        <el-table-column prop="type" label="类型" align="center" width="70">
          <template slot-scope="scope">
            <el-tag :type="Number(scope.row.type) === 1 ? 'success' : ''" size="small">{{ Number(scope.row.type) === 1 ? 'Normal' : 'Variation' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="产品线" prop="product_line_name" width="80"/>
        <el-table-column label="7天销量" prop="sold_quantity_7" width="65"/>
        <el-table-column label="30天销量" prop="sold_quantity_30" width="70"/>
        <el-table-column label="60天销量" prop="sold_quantity_60" width="70"/>
        <!--<el-table-column v-if="Number(listQuery.advt_status) === STATUS.UPLOAD_ERROR" prop="site_code" align="center" label="Rejection Reason"></el-table-column>-->
        <el-table-column v-if="STATUS.PUBLISH_TIME.includes(listQuery.advt_status)" prop="publish_time" align="center" label="刊登时间" width="170" sort-by="publish_time" sortable></el-table-column>
        <el-table-column prop="create_time" align="center" label="创建时间" width="86" sort-by="create_time" sortable></el-table-column>
        <el-table-column prop="update_time" align="center" label="更新时间" width="86" sort-by="update_time" sortable></el-table-column>
        <el-table-column label="操作" width="90" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openLog(scope.row.id)" v-permission="permissions.advertising_SeeTheLog">日志</el-button>
            <el-button type="text" size="mini" @click="openTheNewTAB('linio.advertising.detail', { id: scope.row.id })" v-permission="permissions.advertising_ViewTheAD">详情</el-button>
            <el-button type="text"
                       v-if="listQuery.advt_status === 120 || listQuery.advt_status === 130"
                       size="mini"
                       :disabled="[190,200,210].includes(scope.row.status)"
                       @click="deleteFileOrDirectory(scope.row,'single')"
                       v-permission="permissions.advertising_delete"
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
    <!--  指定毛利率  -->
    <setCustomMargin v-bind.sync="setPriceOption" @reload="renderList"></setCustomMargin>
    <!--  指定价格  -->
    <setCustomPrice v-bind.sync="customprice" @reload="renderList"></setCustomPrice>
  </div>
</template>

<script>
import { toBoolean, filterQueryParams } from '@/utils/help'
import axios from 'axios'
import { resultAlert } from './common/index'
import { fetchList, cancleCustomPrice, getSelectAll, quantityCancel, quantitySet, quantityDelete, exportActive } from '@/api/linio'
import istoreLog from './components/istoreLog'
import setCustomMargin from './components/setCustomMargin'
import setCustomPrice from './components/setCustomPrice'
import qs from 'qs'
import Cookies from 'js-cookie'

import multipleSelectAccount from './components/multipleSelectAccount'

export default {
  components: { istoreLog, setCustomMargin, setCustomPrice, multipleSelectAccount },
  data() {
    return {
      copyListQuery: {},
      multipleSelectAccountOption: {
        accountArr: [],
        accountKey: 'id'
      },
      permissions: {
        advertising_setinventory: 'linio.advt.custom-quantity.set',//设置库存
        advertising_cancelinventory: 'linio.advt.custom-quantity.cancel',//取消库存
        advertising_customSetPrice: 'linio.advt.custom-price.set',//设置指定价/毛利率
        advertising_customCancelStock: 'linio.advt.custom-price.cancel',//取消指定价/毛利率
        advertising_SeeTheLog: 'linio.advt.advt.change-log',//查看日志
        advertising_ViewTheAD: 'linio.advt.advt.info',//查看广告详情
        advertising_delete: 'linio.advt.advt.delete',//下架
        advertising_export: 'linio.advt.export.get-file' //导出
      },
      STATUS: {
        DRAFT: 100,
        PUBLISH_TIME: [120, 130, 220],
        UPLOAD_ERROR: 140,
        SHOW_SHOP_SKU: [120, 130, 190, 200, 220]
      },
      isDisable: false,
      newDate: new Date().getTime(),
      ids: [],
      getOnSaleStatus: 0,
      title: '类型 ',
      filter: 'filter',
      options: [],
      priceTypeArr: [
        { label: 'iStore价格', value: 10 },
        { label: '指定价', value: 30 },
        { label: '指定毛利率', value: 40 }
      ],//价格类型
      listLoading: true,
      listTotal: null,
      listData: [],
      listQuery: {
        page: 1,
        per_page: 20,
        account_id: [], // Site Code
        advt_product_ids: '',// Product ID
        product_line_id: undefined,// 产品线
        advt_type: [], // 广告类型
        advt_status: 120,// 广告状态
        advt_created: [], // 创建时间
        advt_published: [], // 刊登时间
        spus: '', // 平台商品号
        is_custom_quantity: '', // 是否指定库存,
        sales_count: undefined,//销量搜索
        price_type: undefined,//价格类型
        shop_sku: ''
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
      },
      hasActiveInput: true,
      setPriceOption: {
        open: false,
        rowData: {}
      },
      customprice: {
        open: false,
        rowData: {}
      }
    }
  },
  created() {
    this.copyListQuery = this._.cloneDeep(this.listQuery)
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
    createExportParams() {
      const notAllowKey = ['page', 'per_page']
      const params = {}
      for (const key in this.listQuery) {
        if (!notAllowKey.includes(key)) {
          if (Array.isArray(this.listQuery[key])) {
            if (this.listQuery[key].length) {
              params[key] = this.listQuery[key]
            }
          } else {
            if (this.listQuery[key]) {
              params[key] = this.listQuery[key]
            }
          }
        }
      }
      if (this.listQuery.sales_count) { //销量查询，参数组装
        let sort = {}
        const value = this.listQuery.sales_count.split('-')
        sort[value[0]] = value[1]
        if (!this._.isEmpty(sort)) {
          params.sort = sort
        }
        delete params.sales_count
      }
      return params
    },
    // 批量导出数据
    exportListData() {
      this.$confirm('确定导出？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnPressEscape: false,
        closeOnClickModal: false,
        type: 'warning'
      }).then(() => {
        let params
        const product_id = this.getParam()
        if (product_id.length) {
          params = {
            product_id,
            advt_status: this.listQuery.advt_status
          }
        } else {
          params = this.createExportParams()
        }
        let time = 180

        const loading = this.$loading({
          lock: true,
          text: `数据加载中...剩余 ${ time } 秒`,
          spinner: 'el-icon-loading',
          background: 'rgba(f, f, f, 0.5)',
          target: document.querySelector('.linio-export-loading-area')
        })

        const timer = setInterval(() => {
          if (time === 0) {
            clearInterval(timer)
          } else {
            --time
            loading.text = `数据加载中...剩余 ${ time } 秒`
          }
        }, 1000)

        const urlInfo = JSON.parse(Cookies.get('urlInfo'))
        axios({
          url: this.getDownLoadPath(),
          method: 'post',
          headers: {
            Authorization: `Bearer ${ urlInfo.token }`,
            systemCode: urlInfo.systemCode
          },
          data: qs.stringify(params),
          responseType: 'blob'
        }).then(res => {
          if (res.data.type.indexOf('json') === -1) {
            const file_name = res.headers['content-disposition'].split('=')[1]
            let url = window.URL.createObjectURL(new Blob([res.data]))
            let a = document.createElement('a')
            a.style.display = 'none'
            a.href = url
            a.setAttribute('download', file_name)
            document.body.appendChild(a)
            this.$message.success('导出成功')
            a.click() //执行下载
            window.URL.revokeObjectURL(a.href)
            document.body.removeChild(a)
            loading.close()
          } else {
            // 接口返回json
            const _this = this
            const reader = new FileReader()
            reader.readAsText(res.data, 'utf-8')
            reader.onload = function() {
              _this.$message.error(JSON.parse(reader.result).message)
              loading.close()
            }
          }
        }).catch((err) => {
          this.$message.error(err.message)
          loading.close()
        })
      }).catch(() => {
      })
    },
    /**
     * 下载地址
     */
    getDownLoadPath() {
      const API_ADDRESS = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_BASE_API : process.env.VUE_APP_BASE_API
      return API_ADDRESS + 'linio-new/advt/export/get-file'
    },
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
    formatType(val) {
      return this.esAdvtStatus.filter(v => v.key === val)[0]['label']
    },
    // 指定库存图标控制
    showEdit(type, row) {
      if (this.hasActiveInput) {
        row[type] = true
        if (['show_quantity_edit'].includes(type)) {
          let focus_target = ''
          switch (type) {
            case 'show_quantity_edit':
              focus_target = 'stock_input'
              break
            default:
              focus_target = undefined
          }
          this.$nextTick(() => {
            let selector = `.${ focus_target } .el-input__inner`
            document.querySelector(selector).focus()
          })
          this.hasActiveInput = false
        }
      }
    },
    hideEdit(type, row) {
      row[type] = false
    },
    showIcon(event) {
      event.target.lastChild.style.display = 'block'
      // row[type] = true
    },
    hideIcon(event) {
      event.target.lastChild.style.display = 'none'
      // row[type] = false
    },
    //获取指定价/指定毛利率id
    getParam() {
      const product_id = []
      this.multipleTable.map(item => {
        item.child_product.map(val => {
          if (val.isSelected) {
            //
            product_id.push(val.product_id)
          }
        })
      })
      return product_id
    },
    //指定毛利率
    customMargin(command) {
      if (command.fuc === 'setMargin') {
        this.setCustomGrossMargin(this.getParam())
      } else {
        //取消指定毛利率
        this.cancleCustomPrice('指定毛利率', 2)
      }
    },
    //打开指定毛利率弹窗
    setCustomGrossMargin(ids) {
      this.setPriceOption = {
        open: true,
        rowData: ids
      }
    },
    //指定价格
    customPrice(command) {
      console.log(command)
      if (command.fuc === 'setPrice') {
        this.setCustomPrice(this.getParam())
      } else {
        //取消指定价格
        this.cancleCustomPrice('指定价', 1)
      }
    },
    // 打开设置指定价弹窗
    setCustomPrice(row) {
      this.customprice = {
        open: true,
        rowData: row
      }
    },
    // 取消提示框
    cancleTip(msg) {
      return this.$confirm(`您确定要取消${ msg }吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
        closeOnPressEscape: false
      })
    },
    //取消指定价格/毛利率
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

    // 指定库存验证
    checkStock(val) {
      const reg = /^\d{1,3}$/
      if (!reg.test(val)) {
        this.$message.error('设置库存必须是0-999之间的整数')
        this.listLoading = false
        return false
      }
      return true
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
    setStock(type, row) {
      // 要设置库存的child_product id
      const ids = []
      // input设置/批量设置
      if (type === 'single') {
        this.hasActiveInput = true
        row.show_quantity_edit = false
        if (this.checkStock(row.custom_quantity)) {
          this.listLoading = true
          ids.push(row.product_id)
          // 调用接口设置，设置成功 是否指定库存显示为 是
          quantitySet({ product_id: ids, custom_quantity: row.custom_quantity, is_custom_quantity: 1, not_show_message: true }).then((res) => {
            resultAlert(res)
            row.is_custom_quantity = '1'
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
            this.listLoading = true
            // 调用接口设置,设置成功刷新列表
            this.multipleTable.forEach(v => {
              v.child_product.forEach(k => {
                if (k.isSelected) {
                  ids.push(k.product_id)
                }
              })
            })
            quantitySet({ product_id: ids, custom_quantity: value, is_custom_quantity: 1, not_show_message: true }).then((res) => {
              resultAlert(res)
              this.renderList()
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
      quantityCancel({ product_id: ids, is_custom_quantity: 0, not_show_message: true }).then(res => {
        resultAlert(res)
        this.renderList()
      }).finally(() => {
        this.listLoading = false
      })
    },
    openMoreTab() {
      const detailsId = this.multipleTable.map(v => v.id)
      detailsId.map(v => {
        window.open(`/linio/advertising/detail/${ v }`)
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
      const optionsParams = ['LinioAdvtAccount', 'LinioAdvtTypes', 'LinioProductLine']
      getSelectAll({ keys: optionsParams }).then(response => {
        this.options = response.data
        this.multipleSelectAccountOption.accountArr = response.data.LinioAdvtAccount
        this.options.customQuantity = [{ key: '1', label: '是' }, { key: '0', label: '否' }]
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
      if (this.listQuery.advt_status !== 120 && this.listQuery.advt_status !== 130) {
        this.listQuery.is_custom_quantity = ''
      }
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
          this._.forEach(v.child_product, (val) => {
            val.isSelected = false
            val.show_quantity_icon = false
            val.show_quantity_edit = false
            val.virtualCustom_quantity = val.custom_quantity
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
    // 复选框
    child_select(row) {
      const check = this._.some(row.child_product, (v, i) => {
        return v.isSelected
      })
      if (check) {
        this.$refs.table.toggleRowSelection(row, true)
      } else {
        this.$refs.table.toggleRowSelection(row, false)
      }
    },
    selectionChange(val) {
      this.multipleTable = val
    },
    handleSelectionChange(val) {
      this._.forEach(this.listData, (v) => {
        this._.forEach(v.child_product, (v2) => {
          v2.isSelected = false
        })
      })
      this.multipleTable = val
      this._.forEach(val, (v) => {
        this._.forEach(v.child_product, (v2) => {
          v2.isSelected = true
        })
      })
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
      let params = []
      // 多选
      if (type === 'all') {
        this._.map(this.multipleTable, v => {
          params.push({ advt_id: v.id, product_id: v.child_product.filter(v => v.isSelected && [120, 130].includes(v.status)).map(v => v.istore_product_id) })
        })
      }
      // 主产品下架
      if (type === 'single') {
        params.push({ advt_id: row.id, product_id: row.child_product.filter(v => [120, 130].includes(v.status)).map(v => v.istore_product_id) })
      }
      // 子产品下架
      if (type === 'child') {
        params.push({ advt_id: row.id, product_id: [row.istore_product_id] })
      }
      this.$confirm('确定要下架此产品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnPressEscape: false,
        closeOnClickModal: false,
        type: 'warning'
      }).then(() => {
        params = params.filter(v => v.product_id.length)
        if (params.length) {
          this.listLoading = true
          quantityDelete({ params, not_show_message: true }).then(res => {
            resultAlert(res)
            this.renderList()
          }).catch((err) => {
            this.listLoading = false
          })
        } else {
          this.$alert('产品已加入下架队列，请勿重复提交！')
        }
      }).catch(() => {
      })
    },
    handleFilter() {
      this.newDate = new Date().getTime()
      this.filter = 'filter'
      this.copyListQuery = this._.cloneDeep(this.listQuery)
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
      this.copyListQuery = this._.cloneDeep(this.listQuery)
      this.clearAccount()
      this.renderList()
    },
    changeStatus(key) {
      this.newDate = new Date().getTime()
      if (this.listQuery.advt_status !== key) {
        this.listQuery.advt_status = key
        this.listQuery.page = 1
        this.filter = 'filter'
        this.copyListQuery = this._.cloneDeep(this.listQuery)
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

.el-icon-edit {
  position: absolute;
  color: #409EFF;
  font-size: 20px;

}
</style>
