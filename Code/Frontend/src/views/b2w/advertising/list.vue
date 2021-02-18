<template>
  <div class="b2w-export-loading-area">
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="Site Code" prop="account_id">
          <multiple-select-account
            ref="multipleSelectAccount"
            :options="productLineOptions.b2wAdvtAccount"
            @select-account="selectAccount"
            @clean-select="cleanSelect"
            style="width: 240px"
          ></multiple-select-account>
        </el-form-item>
        <el-form-item label="Product ID" prop="spu_id">
          <el-input v-model="listQuery.spu_id" clearable placeholder="多个请用空格分隔" style="width: 150px;"></el-input>
        </el-form-item>
        <el-form-item label="广告类型" prop="type">
          <el-checkbox-group v-model="listQuery.type">
            <el-checkbox-button v-for="advtType in productLineOptions.b2wAdvtTypes" :label="advtType.key" :key="advtType.key">{{ advtType.label }}</el-checkbox-button>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="产品线" prop="product_line_id">
          <el-select v-model="listQuery.product_line_id" placeholder="请选择" clearable style="width: 180px">
            <el-option
              v-for="item in productLineOptions.b2wProductLine"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间" prop="create_time">
          <el-date-picker
            v-model="listQuery.create_time"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss" style="width: 300px"
          >
          </el-date-picker>
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
        <el-form-item v-if="listQuery.status === 110" label="状态" prop="active">
          <el-select v-model="listQuery.active" clearable placeholder="请选择" style="width: 120px;">
            <el-option label="禁用" value="disabled"></el-option>
            <el-option label="启用" value="enabled"></el-option>
          </el-select>
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
        <el-form-item v-if="[110, 120].includes(listQuery.status)" label="是否指定库存" prop="custom_stock_type">
          <el-select v-model="listQuery.custom_stock_type" clearable placeholder="请选择" style="width: 120px;">
            <el-option label="是" value="1"></el-option>
            <el-option label="否" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 状态 -->
    <div class="header-box">
      <el-row v-if="esAdvtStatus" class="left-row">
        <el-tag v-for="(status, i) in esAdvtStatus" :key="i" :type="statusSelected(status.key)" size="medium">
          <span @click="changeStatus(status.key)">{{ status.label }} ({{ status.total }})</span>
        </el-tag>
      </el-row>
      <!--online状态下-->
      <el-row class="right-row">
        <el-button type="info" size="mini"
                   @click="openMoreTab"
                   :disabled="setPriceArr.length === 0"
        >
          批量打开广告详情页
        </el-button>
        <el-button type="danger" size="mini"
                   v-permission="permissions.advertising_exportListData"
                   @click="exportListData"
                   v-if="[110].includes(listQuery.status)"
        >
          导出
        </el-button>
        <el-dropdown v-if="[110, 120].includes(listQuery.status)"
                     size="mini"
                     v-permission="permissions.advertising_setinventory"
                     split-button
                     type="success"
                     trigger="click"
                     @command="stock"
        >
          指定库存
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :disabled="this.setPriceArr.length === 0" :command="{ fuc: 'setStock', type: 'all' }">
              设置指定库存
            </el-dropdown-item>
            <el-dropdown-item :disabled="this.setPriceArr.length === 0" :command="{ fuc: 'cancleStock', type: 'all' }">
              取消指定库存
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown v-if="listQuery.status === 110"
                     size="mini" split-button
                     type="primary"
                     trigger="click"
                     @command="grossMargins"
                     v-permission="permissions.advertising_customSetPrice"
        >
          指定毛利率
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :disabled="multipleTable.length === 0" :command="{ fuc: 'setPress', value: multipleTable, type: 'all' }">
              设置指定毛利率
            </el-dropdown-item>
            <el-dropdown-item :disabled="multipleTable.length === 0" :command="{ fuc: 'unpricing', value: multipleTable, type: 'all' }">
              取消指定毛利率
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown v-if="listQuery.status === 110"
                     size="mini"
                     v-permission="permissions.advertising_customSetPrice"
                     split-button type="primary"
                     trigger="click"
                     @command="price"
        >
          指定价
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :disabled="this.setPriceArr.length === 0" :command="{ fuc: 'setPress', value: multipleTable, type: 'all' }">
              设置指定价
            </el-dropdown-item>
            <el-dropdown-item :disabled="this.multipleTable.length === 0" :command="{ fuc: 'unpricing', value: multipleTable, type: 'all' }">
              取消指定价
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown v-if="[110,401].includes(listQuery.status)" size="mini" v-permission="permissions.advertising_promotePrice" split-button type="warning" trigger="click"
                     @command="salePrice"
        >
          指定促销价
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :disabled="this.multipleTable.length === 0" :command="{ fuc: 'setSale', value: multipleTable, type: 'all' }">
              设置指定促销价
            </el-dropdown-item>
            <el-dropdown-item :disabled="this.multipleTable.length === 0" :command="{ fuc: 'cancelSale', value: multipleTable, type: 'all' }">
              取消指定促销价
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown v-if="[110,401].includes(listQuery.status)" size="mini" v-permission="permissions.advertising_promotePrice" split-button type="primary" trigger="click"
                     @command="saleGross"
        >
          指定促销毛利率
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :disabled="this.multipleTable.length === 0" :command="{ fuc: 'setSale', value: multipleTable, type: 'all' }">
              设置促销毛利率
            </el-dropdown-item>
            <el-dropdown-item :disabled="this.multipleTable.length === 0" :command="{ fuc: 'cancelSale', value: multipleTable, type: 'all' }">
              取消促销毛利率
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button v-if="listQuery.status === 110"
                   type="danger"
                   size="mini"
                   v-permission="permissions.advertising_delete"
                   @click="deleteFileOrDirectory(setPriceArr,'all')"
                   :disabled="setPriceArr.length === 0"
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
                :default-expand-all="expand"
                @header-click="handleExpand"
                v-loading.lock="listLoading"
                element-loading-text="努力加载中"
                border
                style="width: 100%"
                highlight-current-row
                @current-change="handleCurrentChange1"
                @select-all="handleSelectionChange"
                @select="handleSelectionRow"
                @selection-change="selectionChange"
                @filter-change="handleFilterChange"
      >
        <el-table-column type="expand" width="40">
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
              <el-table-column prop="istore_product_id" label="产品ID" sortable width="75"></el-table-column>
              <el-table-column prop="title" label="产品名称" min-width="200"></el-table-column>
              <el-table-column prop="base_price" label="保本价" width="60"></el-table-column>
              <el-table-column prop="discount_price" label="iStore价格" width="75" />
              <el-table-column prop="gross_margin" label="iStore毛利率(%)" width="110" />
              <el-table-column prop="current_price" label="当前售价" width="70" />
              <el-table-column prop="current_gross_margin" width="95" label="当前毛利率(%)" />
              <el-table-column prop="price_type" label="价格类型" width="70">
                <template slot-scope="scope">
                  {{ getLabelByCode(scope.row.price_type) }}
                </template>
              </el-table-column>
              <el-table-column prop="custom_price" label="指定价" width="60" v-if="listQuery.status === 110">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_price_icon',scope.row)" @mouseleave="hideEdit('show_price_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position:relative;">
                    <el-input
                      v-if="scope.row.show_price_edit"
                      class="price_input inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_price"
                      @blur="setPress(scope.row, 'single',1)"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_price }}</span>
                    <i v-show="scope.row.show_price_icon && listQuery.status !== 401"
                       class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:9px;right:-7px;"
                       @click="showEdit('show_price_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_price_edit',scope.row)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="custom_gross_margin" label="指定毛利率(%)" width="100" v-if="listQuery.status === 110">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_gross_icon',scope.row)" @mouseleave="hideEdit('show_gross_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position: relative;">
                    <el-input
                      v-if="scope.row.show_gross_edit"
                      class="gross_input inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_gross_margin"
                      @blur="setPress(scope.row, 'single',2)"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_gross_margin }}</span>
                    <i v-show="scope.row.show_gross_icon && listQuery.status !== 401"
                       class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:9px;right:-7px;"
                       @click="showEdit('show_gross_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_gross_edit',scope.row)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="custom_promote_price" label="指定促销价" width="75" v-if="[110,401].includes(listQuery.status)">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_sale_price_icon',scope.row)" @mouseleave="hideEdit('show_sale_price_icon',scope.row)"
                       style="width:100%;height:32px;line-height:32px;position:relative;"
                  >
                    <el-input
                      v-if="scope.row.show_sale_price_edit"
                      class="sale_price_input inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_promote_price"
                      @blur="setSale(scope.row, 'single',3)"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_promote_price }}</span>
                    <i v-show="scope.row.show_sale_price_icon"
                       class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:9px;right:-7px;"
                       @click="showEdit('show_sale_price_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_sale_price_edit',scope.row)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="custom_promote_gross_margin" label="指定促销毛利率(%)" width="125" v-if="[110,401].includes(listQuery.status)">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_sale_gross_icon',scope.row)" @mouseleave="hideEdit('show_sale_gross_icon',scope.row)"
                       style="width:100%;height:32px;line-height:32px;position: relative;"
                  >
                    <el-input
                      v-if="scope.row.show_sale_gross_edit"
                      class="sale_gross_input inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_promote_gross_margin"
                      @blur="setSale(scope.row, 'single',4)"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_promote_gross_margin }}</span>
                    <i v-show="scope.row.show_sale_gross_icon"
                       class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:9px;right:-7px;"
                       @click="showEdit('show_sale_gross_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_sale_gross_edit',scope.row)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="库存" width="60"></el-table-column>
              <el-table-column v-if="[110, 120,401].includes(listQuery.status)" prop="custom_stock" label="指定库存" width="65">
                <template slot-scope="scope">
                  <div
                    @mouseenter="showEdit('show_quantity_icon',scope.row)"
                    @mouseleave="hideEdit('show_quantity_icon',scope.row)"
                    style="width:100%;height:32px;line-height:32px;position:relative;"
                  >
                    <el-input
                      v-if="scope.row.show_quantity_edit"
                      class="stock_input inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_stock"
                      @blur="setStock('single',scope.row)"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_stock }}</span>
                    <!-- TODO:如果状态为high price则只能显示，不允许编辑指定库存 -->
                    <i
                      v-permission="permissions.advertising_setinventory"
                      v-show="scope.row.show_quantity_icon&&![401].includes(listQuery.status)"
                      class="el-icon-edit"
                      title="编辑"
                      style="color:#409EFF; font-size:20px;top:9px;right:-7px;"
                      @click="showEdit('show_quantity_edit',scope.row, scope.$index)"
                      @blur="hideEdit('show_quantity_edit',scope.row)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column v-if="[110, 120,401].includes(listQuery.status)" prop="custom_stock_type" label="是否指定库存" width="100">
                <template slot-scope="scope">
                  {{ Number(scope.row.custom_stock_type) === 1 ? '是' : '否' }}
                </template>
              </el-table-column>
              <el-table-column prop="advt_status" label="状态" width="99" align="center"></el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="40" align="center"></el-table-column>
        <el-table-column prop="id" label="ID" width="75" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column prop="account_name" label="Site Code" width="90"></el-table-column>
        <el-table-column prop="istore_product_id" label="Product ID" width="75">
          <template slot-scope="scope">
            <span>{{ scope.row.istore_product_id }}</span>
          </template>
        </el-table-column>
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
        <el-table-column prop="title" label="名称" min-width="260"></el-table-column>
        <el-table-column prop="type" label="类型" width="70" align="center">
          <template slot-scope="scope">
            <el-tag :type="Number(scope.row.type) === 1 ? 'success' : ''" size="small">{{ scope.row.type | getTypeLabel(productLineOptions.b2wAdvtTypes) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="产品线" prop="product_line_name" width="80"></el-table-column>
        <el-table-column label="7天销量" prop="sold_quantity_7" width="60"></el-table-column>
        <el-table-column label="30天销量" prop="sold_quantity_30" width="65"></el-table-column>
        <el-table-column label="60天销量" prop="sold_quantity_60" width="65"></el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="86" sortable :sort-method="(a,b) => a-b">
          <template slot-scope="scope">{{ scope.row.create_time }}</template>
        </el-table-column>
        <el-table-column prop="active" label="状态" width="50" v-if="listQuery.status === 110">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.active" size="mini">{{ scope.row.active === 'enabled' ? '启用' : '禁用' }}</el-tag>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="active" label="断开状态" width="75" v-if="listQuery.status === 110">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.sync_status === 'linked'" size="mini">已连接</el-tag>
            <el-tag v-else-if="scope.row.sync_status === 'declined'" size="mini">连接失败</el-tag>
            <el-tag v-else-if="scope.row.sync_status === 'unlinked'" size="mini">没有连接</el-tag>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="push_fail_msg" label="失败原因" v-if="listQuery.status === STATUS.UPLOAD_ERROR"></el-table-column>
        <el-table-column label="操作" width="115" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" v-permission="permissions.advertising_SeeTheLog" @click="openIstoreLogs(scope.row)">日志</el-button>
            <el-button type="text" size="mini" v-permission="permissions.advertising_ViewTheAD" @click="openTheNewTAB('b2w.advertising.detail', { id: scope.row.id })">详情</el-button>
            <el-button v-if="listQuery.status === 110" type="text" v-permission="permissions.advertising_delete" size="mini" @click="deleteFileOrDirectory(scope)">
              下架
            </el-button>
            <el-button v-if="listQuery.status === 110" type="text" v-permission="permissions.advertising_link" size="mini" @click="notLink(scope.row)" :disabled="scope.row.sync_status !== 'linked'">
              断开
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
    <!--导入组件-->
    <set-gross-margins v-bind.sync="setGrossMarginOption" @renderList="renderList"></set-gross-margins>
    <set-price v-bind.sync="setPriceOption" @renderList="renderList"></set-price>
    <sale-price v-bind.sync="salePriceOption" @renderList="renderList"></sale-price>
    <sale-gross v-bind.sync="saleGrossOption" @renderList="renderList"></sale-gross>
    <!-- istore更新日志 -->
    <istore-log v-bind.sync="logOptions"></istore-log>
  </div>
</template>
<script>
import { toBoolean, filterQueryParams } from '@/utils/help'
import {
  fetchList,
  deletePlatformAdvt,
  disConnect,
  setCustomStock,
  cancleCustomStock,
  cancelchangePrice,
  getSelectAll,
  changePrice,
  changeSalePrice,
  changeSaleGross
} from '@/api/b2w'
import { resultAlert } from './common'
import PictureView from 'vue-simple-picture-preview'
import setGrossMargins from './components/setGrossMargins'
import setPrice from './components/setPrice'
import saleGross from './components/saleGross'
import salePrice from './components/salePrice'
import istoreLog from './components/istoreLog'
import multipleSelectAccount from '../advertising/components/multipleSelectAccount.vue'
import axios from 'axios'
import qs from 'qs'
import Cookies from 'js-cookie'

export default {
  name: 'Advertising',
  components: { PictureView, setGrossMargins, setPrice, saleGross, salePrice, istoreLog, multipleSelectAccount },
  data() {
    return {
      priceTypeArr: [
        { label: '指定价', value: 30 },
        { label: '指定毛利率', value: 40 },
        { label: '指定促销价', value: 60 },
        { label: '指定促销毛利率', value: 70 },
        { label: 'iStore价格', value: 10 }
      ],
      STATUS: {
        UPLOAD_ERROR: 400
      },
      title: '类型 ',
      filter: 'filter',
      checked: true,
      newDate: new Date().getTime(),
      isDisable: false,
      options: [],
      esAdvtStatus: [],
      expand: true,
      listLoading: true,
      listTotal: null,
      listData: [],
      statusMap: {
        push_fail: 'push_fail',
        prohibited_words: 'prohibited_words'
      },
      permissions: {
        advertising_setinventory: 'b2w.advt-management.custom-quantity.set',//设置库存
        advertising_cancelinventory: 'b2w.advt-management.custom-quantity.cancel',//取消库存
        advertising_customSetPrice: 'b2w.advt-management.custom-price.set',//设置指定价/毛利率
        advertising_customCancelStock: 'b2w.advt-management.custom-price.cancel ',//取消指定价/毛利率
        advertising_SeeTheLog: 'b2w.advt-management.advt-management.daily-record',//查看日志
        advertising_ViewTheAD: 'b2w.advt-management.advt-management.advt-info',//查看广告詳情
        advertising_delete: 'b2w.advt-management.advt-management.delete-advt',//下架
        advertising_promotePrice: 'b2w.advt-management.custom-price.promote-set',//指定促銷價,指定促销毛利率
        advertising_promoteCancel: 'b2w.advt-management.custom-price.promote-cancel',//取消促銷價,指定促销毛利率
        advertising_link: 'b2w.advt-management.advt-management.sync-b2w-advt',//断开
        advertising_exportListData: 'b2w.advt-management.export.get-file'//导出
      },
      listQuery: {
        price_type: undefined,
        page: 1,
        per_page: 20,
        account_id: [],
        spu_id: undefined,
        type: [],
        status: 110,
        create_time: [],
        active: undefined,
        custom_price_type: undefined,
        custom_stock_type: undefined,
        custom_promote_price_type: undefined,
        product_line_id: undefined,
        sales_count: undefined
      },
      pagination: null,
      multipleTable: [],
      statusTags: [],
      currentRow: null,
      checkPickShow: true,
      checkNum: 0,
      productLineOptions: [],
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
      salePriceOption: {
        advtIds: [],
        open: false
      },
      saleGrossOption: {
        advtIds: [],
        open: false
      },
      logOptions: {
        open: false,
        advtId: '',
        isVary: false,
        operateTypeArr: []
      }
    }
  },
  created() {
    this.searchInit()
    this.renderList()
  },
  computed: {
    setPriceArr() {
      const arr = []
      this._.forEach(this.multipleTable, (v) => {
        arr.push(v)
      })
      return arr
    }
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
    searchInit() {
      const params = ['b2wProductLine', 'b2wChangeLogOptions','b2wAdvtAccount','b2wAdvtTypes']
      getSelectAll(params).then(res => {
        this.productLineOptions = res.data
      })
    },
    openMoreTab() {
      const detailsId = this.multipleTable.map(v => v.id)
      detailsId.map(v => {
        window.open(`/b2w/advertising/detail/${v}`)
      })
    },
    openIstoreLogs(row) {
      this.logOptions = {
        open: true,
        advtId: row.id,
        isVary: Number(row.type) === 2,
        operateTypeArr: this.productLineOptions.b2wChangeLogOptions
      }
    },
    selectionChange(val) {
      this.multipleTable = val
      this.checkNum++
    },
    /* 跳转新标签 */
    openTheNewTAB(name, params) {
      const { href } = this.$router.resolve({
        name: name,
        params: params
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
      this.listData = []
      this.listLoading = true
      this.listQuery.spu_id = this.listQuery.spu_id ? this._.trim(this.listQuery.spu_id) : undefined
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
        this.esAdvtStatus = response.data.statistics
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
            val.virtual_gross_margin = val.custom_gross_margin
            val.virtual_custom_price = val.custom_price
            val.virtual_custom_stock = val.custom_stock
            val.virtual_sale_price = val.custom_promote_price
            val.virtual_sale_gross = val.custom_promote_gross_margin
            val.show_quantity_edit = false
            val.show_quantity_icon = false
            val.show_price_icon = false
            val.show_price_edit = false
            val.show_gross_icon = false
            val.show_gross_edit = false
            val.show_sale_price_icon = false
            val.show_sale_price_edit = false
            val.show_sale_gross_icon = false
            val.show_sale_gross_edit = false
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
      this.$refs['multipleSelectAccount'].handleCancelAllUser()
      this.$refs.listQuery.resetFields()
      this.newDate = new Date().getTime()
      this.filter = 'filter'
      this.renderList()
    },
    changeStatus(key) {
      console.log('key', key)
      this.newDate = new Date().getTime()
      if (this.listQuery.status !== key) {
        this.listQuery.status = key
        this.listQuery.page = 1
        this.filter = 'filter'
        this.renderList()
      }
    },
    statusSelected(key) {
      return this.listQuery.status === key ? 'warning' : ''
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
    // 下架和批量下架
    deleteFileOrDirectory(row, type) {
      let obj = {}
      if (type === 'all') {
        obj = {
          advt_id: this._.map(this.setPriceArr, 'id'),
          account_id: this.setPriceArr[0].account_id,
          user_id: this.$store.state.user.info.id
        }
      } else {
        obj = {
          advt_id: [row.row.id],
          account_id: row.row.account_id,
          user_id: this.$store.state.user.info.id
        }
      }
      this.$confirm('是否要下架此产品', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        deletePlatformAdvt(obj).then(response => {
          this.renderList()
        })
      }).catch((err) => {
        this.$message.err(err)
      }).finally(() => {
        this.listLoading = false
      })
    },
    // 断开链接
    notLink(row) {
      const obj = {
        account_id: row.account_id,
        sku: row.istore_product_id
      }
      this.$confirm('确定断开链接吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = false
        disConnect(obj).then((res) => {
          if (res.code === 200) {
            this.$message({
              type: 'success',
              message: res.message
            })
          } else {
            this.$message({
              type: 'info',
              message: res.message
            })
          }
          this.renderList()
        })
      }).catch(() => {
        this.listLoading = false
      })
    },
    // 表格类型筛选
    filterType(value, row) {
      return row.type === value
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
    // site code多选框
    selectAccount(arr) {
      console.log(arr)
      this.listQuery.account_id = arr
    },
    cleanSelect() {
      this.listQuery.account_id = []
    },
    handleExpand(column) {
      if (column.type === 'expand') {
        this.expand = !this.expand
        // 强制刷新DOM
        this.newDate = new Date().getTime()
      }
    },
    // 指定促销价
    salePrice(command) {
      if (command.fuc === 'setSale') {
        this.setSale('指定促销价', 'all', 3)
      } else if (command.fuc === 'cancelSale') {
        this.cancelSale('指定促销价', 3)
      }
    },
    // 设置 促销价,指定促销毛利率
    setSale(data, type, id) {
      this.currentRow = data
      let ids = []
      this.isDisable = true
      if (type === 'all') {
        this._.forEach(this.setPriceArr, (v) => {
          this._.forEach(v.child_product, (val) => {
            if (val.isSelected === true) {
              ids.push(val.id)
            }
          })
        })
        if (id === 3) {
          this.salePriceOption = {
            open: true,
            data: ids,
            sale_Price: ''
          }
        } else if (id === 4) {
          this.saleGrossOption = {
            open: true,
            advtIds: ids,
            gross_margin: ''
          }
        }
      } else {
        //隐藏促销价,指定促销毛利率列表文本框
        data.show_sale_price_edit = false
        data.show_sale_gross_edit = false
        //校验
        const datavalue = id === 3 ? data.custom_promote_price : data.custom_promote_gross_margin
        if (datavalue && datavalue > 0) {
          // 单独设置指定促销价,促销毛利率
          this.listLoading = true
          const obj = {
            custom_price: id === 3 ? data.custom_promote_price : data.custom_promote_gross_margin,
            product_id: [data.id],
            custom_price_type: id,
            not_show_message: true
          }
          changeSalePrice(obj).then((res) => {
            resultAlert(res)
          }).catch((err) => {
            this.$message.error(err)
          }).finally(() => {
            this.listLoading = false
            this.renderList()
          })
        } else {
          if (id === 3) {
            data.custom_promote_price = data.virtual_sale_price
          } else {
            data.custom_promote_gross_margin = data.virtual_sale_gross
          }
          this.$message.error('输入值必须大于0的数字')
        }
      }
    },
    // 取消促销价，促销毛利率
    cancelSale(msg, id) {
      const advIds = []
      this.$confirm(`您确定要取消${msg}吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this._.forEach(this.setPriceArr, (v) => {
          this._.forEach(v.child_product, (val) => {
            if (val.isSelected === true) {
              advIds.push(val.id)
            }
          })
        })
        const obj = {
          product_id: advIds,
          custom_price_type: id,
          custom_price: 0,
          not_show_message: true
        }
        changeSaleGross(obj).then(res => {
          resultAlert(res)
        }).catch(err => {
          this.$message.error(err)
        }).finally(() => {
          this.renderList()
          this.listLoading = false
        })
      }).catch(() => {
      })
    },
    // 指定促销毛利率
    saleGross(command) {
      if (command.fuc === 'setSale') {
        this.setSale('指定促销毛利率', 'all', 4)
      } else if (command.fuc === 'cancelSale') {
        this.cancelSale('指定促销毛利率', 4)
      }
    },
    // 指定毛利率
    grossMargins(command) {
      if (command.fuc === 'setPress') {
        this.setPress('指定毛利率', 'all', 2)
      } else if (command.fuc === 'unpricing') {
        this.unpricing('指定毛利率', 2)
      }
    },
    // 检测毛利率
    checkGross(value) {
      const reg = /^\d\.([1-9]{1,2}|[0-9][1-9])$|^[1-9]\d{0,1}(\.\d{1,2}){0,1}$|^100(\.0{1,2}){0,1}$/
      if (!reg.test(Number(value))) {
        this.$message.error('毛利率必须是0-100之间的数字')
        return false
      }
      return true
    },
    // 指定价，毛利率
    price(command) {
      if (command.fuc === 'setPress') {
        this.setPress('指定价', 'all', 1)
      } else if (command.fuc === 'unpricing') {
        this.unpricing('指定价', 1)
      }
    },
    // 设置指定价,毛利率
    setPress(data, type, id) {
      this.currentRow = data
      let ids = []
      this.isDisable = true
      if (type === 'all') {
        this._.forEach(this.setPriceArr, (v) => {
          this._.forEach(v.child_product, (val) => {
            if (val.isSelected === true) {
              ids.push(val.id)
            }
          })
        })
        if (id === 1) {
          this.setPriceOption = {
            open: true,
            data: ids,
            custom_price: ''
          }
        } else if (id === 2) {
          this.setGrossMarginOption = {
            open: true,
            advtIds: ids,
            gross_margin: ''
          }
        }
      } else {

        //隐藏指定价，指定价列表文本框的显示
        data.show_price_edit = false
        data.show_gross_edit = false
        //校验
        const datavalue = id === 1 ? data.custom_price : data.custom_gross_margin
        if (datavalue && datavalue > 0) {
          this.listLoading = true
          // 单独设置指定价
          const obj = {
            custom_price: id === 1 ? data.custom_price : data.custom_gross_margin,
            product_id: [data.id],
            custom_price_type: id,
            not_show_message: true
          }
          changePrice(obj).then(res => {
            resultAlert(res)
          }).catch((err) => {
            this.$message.error(err)
          }).finally(() => {
            this.renderList()
            this.listLoading = false
          })
        } else {
          if (id === 1) {
            data.custom_price = data.virtual_custom_price
          } else {
            data.custom_gross_margin = data.virtual_gross_margin
          }
          this.$message.error('输入值必须大于0的数字')
        }
      }
    },
    // 取消指定价,毛利率
    unpricing(msg, id) {
      const advIds = []
      this.$confirm(`您确定要取消${msg}吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this._.forEach(this.setPriceArr, (v) => {
          this._.forEach(v.child_product, (val) => {
            if (val.isSelected === true) {
              advIds.push(val.id)
            }
          })
        })
        const obj = {
          product_id: advIds,
          custom_price_type: id,
          not_show_message: true
        }
        cancelchangePrice(obj).then(res => {
          resultAlert(res)
        }).catch(err => {
          this.$message.error(err)
        }).finally(() => {
          this.renderList()
          this.listLoading = false
        })
      })
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
        if (this.checkStock(row.custom_stock)) {
          this.listLoading = true
          ids.push(row.id)
          // 调用接口设置，设置成功 是否指定库存显示为 是
          setCustomStock({ product_id: ids, custom_stock: row.custom_stock, custom_stock_type: 1, not_show_message: true }).then((res) => {
            resultAlert(res)
          }).catch((err) => {
            this.$message.error(err)
          }).finally(() => {
            this.renderList()
            this.listLoading = false
          })
        } else {
          // 验证不通过，恢复初始值显示
          row.custom_stock = row.virtual_custom_stock
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
                  ids.push(k.id)
                }
              })
            })
            this.listLoading = true
            setCustomStock({ product_id: ids, custom_stock: value, custom_stock_type: 1, not_show_message: true }).then((res) => {
              resultAlert(res)
            }).catch((err) => {
              this.$message.error(err)
            }).finally(() => {
              this.renderList()
              this.listLoading = false
            })
          }
        })
      }
    },
    cancleStock() {
      const ids = []
      this.listLoading = true
      this.multipleTable.forEach(v => {
        v.child_product.forEach(k => {
          if (k.isSelected) {
            ids.push(k.id)
          }
        })
      })
      // 调用取消接口
      cancleCustomStock({ product_id: ids, not_show_message: true }).then((res) => {
        resultAlert(res)
      }).catch((err) => {
        this.$message.error(err)
      }).finally(() => {
        this.listLoading = false
        this.renderList()
      })
    },
    showEdit(type, row) {
      row[type] = true
      if (['show_quantity_edit', 'show_price_edit', 'show_gross_edit', 'show_sale_price_edit', 'show_sale_gross_edit'].includes(type)) {
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
          case 'show_sale_gross_edit':
            focus_target = 'sale_gross_input'
            break
          case 'show_sale_price_edit':
            focus_target = 'sale_price_input'
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
    //在线状态导出
    exportListData() {
      this.$confirm('确定导出？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnPressEscape: false,
        closeOnClickModal: false,
        type: 'warning'
      }).then(() => {
        this.exportrequ()
      }).catch(() => {

      })
    },
    //获取选择项
    getMultipleTableID() {
      const product_id = []
      this.multipleTable.map(item => {
        item.child_product.map(val => {
          if (val.isSelected) {
            //
            product_id.push(val.id)
          }
        })
      })
      return product_id
    },
    //请求参数
    params() {
      let params
      const product_id = this.getMultipleTableID()
      if (product_id.length) {
        params = {
          product_id,
          status: this.listQuery.status
        }
      } else {
        params = filterQueryParams(this.listQuery)
        delete params.page
        delete params.per_page
        delete params.sales_count
        params.spu_id = this.listQuery.spu_id ? this._.trim(this.listQuery.spu_id) : undefined
        console.log(this.listQuery.sales_count)
        if (this.listQuery.sales_count) {
          const value = this.listQuery.sales_count.split('-')
          const sort = {
            [value[0]]: value[1]
          }
          if (!this._.isEmpty(sort)) {
            params.sort = sort
          }
        }
      }
      return params
    },
    //请求方法
    exportrequ() {
      let time = 180
      const loading = this.$loading({
        lock: true,
        text: `数据加载中...剩余 ${time} 秒`,
        spinner: 'el-icon-loading',
        background: 'rgba(f, f, f, 0.5)',
        target: document.querySelector('.b2w-export-loading-area')
      })
      const timer = setInterval(() => {
        if (time === 0) {
          clearInterval(timer)
        } else {
          --time
          loading.text = `数据加载中...剩余 ${time} 秒`
        }
      }, 1000)

      const urlInfo = JSON.parse(Cookies.get('urlInfo'))
      axios({
        url: (process.env.NODE_ENV === 'production' ? process.env.VUE_APP_BASE_API : '/api/') + 'b2w-new/advt-management/export/get-file',
        method: 'post',
        headers: {
          Authorization: `Bearer ${urlInfo.token}`,
          systemCode: urlInfo.systemCode
        },
        data: qs.stringify(this.params()),
        responseType: 'blob'
      }).then((res) => {
        if (res.data.type.indexOf('json') === -1) {
          // TODO 这里本地环境和测试环境，headers头键名获取不到的Bug
          const file_name = res.headers['content-disposition'] ? res.headers['content-disposition'].split('=')[1] : res.headers['Content-Disposition'].split('=')[1]
          let url = window.URL.createObjectURL(new Blob([res.data]))
          let newA = `<a style="display: none" title="导出" href="${url}" download="${file_name}"></a>`
          document.body.insertAdjacentHTML('beforeend', newA)
          this.$message.success('导出成功')
          let a = document.querySelector('a[title=\'导出\']')
          a.click()
          window.URL.revokeObjectURL(a.href)
          document.body.removeChild(a)
        } else {
          // 接口返回json
          const _this = this
          const reader = new FileReader()
          reader.readAsText(res.data, 'utf-8')
          reader.onload = function() {
            _this.$message.error(JSON.parse(reader.result).message)
          }
        }
        loading.close()
      }).catch((err) => {
        this.$message.error(err.message)
        loading.close()
      })
    }

  },
  filters: {
    getTypeLabel(val, options) {
      const types = options
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
.b2w-export-loading-area {
  ::v-deep.el-loading-mask {
    .el-loading-spinner {
      top: 5%;
    }
  }
}

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
</style>
<style rel="stylesheet/scss" lang="scss">
</style>
