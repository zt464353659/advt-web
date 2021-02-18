<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <!--        <el-form-item label="Site Code" prop="account_id">-->
        <!--          <el-select v-model="listQuery.account_id" clearable placeholder="请选择" style="width: 180px;">-->
        <!--            <el-option v-for="item in options.MercadoLibreAdvtAccount" :key="item.id" :label="item.site_code" :value="item.id"></el-option>-->
        <!--          </el-select>-->
        <!--        </el-form-item>-->
        <el-form-item label="Site Code" prop="account_id">
          <multiple-select-account ref="multipleSelectAccount" v-bind.sync="multipleSelectAccountOption" @select-account="selectAccount" @clean-select="cleanSelect"></multiple-select-account>
        </el-form-item>
        <el-form-item label="Product ID" prop="advt_product_ids">
          <el-input v-model="listQuery.advt_product_ids" clearable placeholder="多个请用空格分隔" style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item label="平台商品号" prop="advt_spu_id">
          <el-input v-model="listQuery.advt_spu_id" clearable placeholder="平台商品号" style="width: 120px;"></el-input>
        </el-form-item>
        <el-form-item label="产品线" prop="product_line_id">
          <el-select v-model="listQuery.product_line_id" clearable placeholder="请选择" style="width: 120px;">
            <el-option v-for="item in options.MercadoLibreProductLine" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="国家" prop="country_site_id">
          <el-select v-model="listQuery.country_site_id" clearable placeholder="请选择" style="width: 120px;">
            <el-option v-for="(item,index) in options.MercadoLibreGetCountry" :key="index" :label="item.site_id" :value="item.site_id"></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="指定价" prop="is_custom_price">
          <el-select v-model="listQuery.is_custom_price" clearable style="width: 100px;">
            <el-option v-for="item in options.customPrice" :label="item.label" :value="item.key" :key="item.key"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="价格类型" prop="price_type">
          <el-select v-model="listQuery.price_type" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="(item,index) in priceTypeArr" :key="index" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="前台编码" prop="platform_item_id">
          <el-input v-model="listQuery.platform_item_id" clearable placeholder="多个请用空格分隔" style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item label="广告类型" prop="advt_type">
          <el-checkbox-group v-model="listQuery.advt_type">
            <el-checkbox-button v-for="advtType in options.MercadoLibreAdvtTypes" :label="advtType.key" :key="advtType.key">{{ advtType.label }}</el-checkbox-button>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="是否指定库存" prop="is_custom_quantity">
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
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']"
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
        <el-form-item label="是否缺货" prop="sold_out">
          <el-select v-model="listQuery.sold_out" placeholder="请选择" style="width:120px;" clearable>
            <el-option label="是" value="1"></el-option>
            <el-option label="否" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">搜索</el-button>
          <el-button data-type="clear" @click="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 状态 -->
    <div v-if="esAdvtStatus.length" class="header-box" ref="headerBox02">
      <el-row class="left-row">
        <el-tag v-for="status in esAdvtStatus" :key="status.key" :type="statusSelected(status.key)" size="medium">
          <span @click="changeStatus(status.key)">{{ status.label }} ({{ status.total }})</span>
        </el-tag>
      </el-row>
      <el-row class="right-row">
        <el-button type="primary" size="mini" @click="openMoreTab" :disabled="multipleTable.length === 0" v-permission="permissions.advertising_ViewTheAD">批量打开广告详情页</el-button>
        <el-dropdown
          size="mini"
          trigger="click"
          split-button
          type="primary"
          @command="handleCommandUpdate"
          v-if="[130,140,160,170].includes(listQuery.advt_status)"
          v-permission="[permissions.advertising_sync_data,permissions.advertising_sync_stock,permissions.advertising_sync_price]"
        >
          <span style="margin: 0 3px;">同步功能</span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              :disabled="this.multipleTable.length === 0"
              v-permission="permissions.advertising_sync_price"
              command="price"
            >
              <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;同步价格&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            </el-dropdown-item>
            <el-dropdown-item
              :disabled="this.multipleTable.length === 0"
              v-permission="permissions.advertising_sync_stock"
              command="stock"
            >
              <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;同步库存&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            </el-dropdown-item>
            <el-dropdown-item
              :disabled="this.multipleTable.length === 0"
              v-permission="permissions.advertising_sync_data"
              command="data"
            >
              <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;同步状态&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown
          size="mini"
          trigger="click"
          split-button
          type="primary"
          @command="handleCommandPricing"
          v-if="[130,140].includes(listQuery.advt_status)"
          v-permission="[permissions.advertising_customSetPrice,permissions.advertising_customCancelStock]"
        >
          <span style="margin: 0 3px;">指定价</span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              :disabled="this.multipleTable.length === 0"
              v-permission="permissions.advertising_customSetPrice"
              command="setPrice"
            >
              <span>&nbsp;&nbsp;&nbsp;设置指定价&nbsp;&nbsp;&nbsp;</span>
            </el-dropdown-item>
            <el-dropdown-item
              :disabled="this.multipleTable.length === 0"
              v-permission="permissions.advertising_customCancelStock"
              command="canclePrice"
            >
              <span>&nbsp;&nbsp;&nbsp;取消指定价&nbsp;&nbsp;&nbsp;</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown v-if="[130,140].includes(listQuery.advt_status)"
                     size="mini" split-button
                     type="primary" trigger="click"
                     @command="customMargin"
                     v-permission="[permissions.advertising_customSetPrice,permissions.advertising_customCancelStock]"
        >
          指定毛利率
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              :disabled="this.multipleTable.length === 0"
              v-permission="permissions.advertising_customSetPrice"
              command="setGross"
            >
              <span>&nbsp;&nbsp;设置指定毛利率&nbsp;&nbsp;</span>
            </el-dropdown-item>
            <el-dropdown-item
              :disabled="this.multipleTable.length === 0"
              :command="{ fuc: 'cancleMargin',rowData: this.multipleTable }"
              v-permission="permissions.advertising_customCancelStock"
            >
              <span>&nbsp;&nbsp;取消指定毛利率&nbsp;&nbsp;</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown v-if="[130,140,100].includes(listQuery.advt_status)"
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
              <span>&nbsp;&nbsp;设置指定库存&nbsp;&nbsp;</span>
            </el-dropdown-item>
            <el-dropdown-item
              v-show="![100].includes(listQuery.advt_status)"
              :disabled="this.multipleTable.length === 0"
              :command="{ fuc: 'cancleStock', type: 'all' }"
              v-permission="permissions.advertising_cancelinventory"
            >
              <span>&nbsp;&nbsp;取消指定库存&nbsp;&nbsp;</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button
          v-if="listQuery.advt_status === STATUS.ACTIVE"
          type="danger"
          v-permission="permissions.advertising_delete"
          size="mini"
          @click="deleteFileOrDirectory(multipleTable,'all')"
          :disabled="this.multipleTable.length === 0"
        >
          批量下架
        </el-button>
        <el-button
          v-if="STATUS.CUSTOM_STOCK.includes(listQuery.advt_status)"
          type="primary"
          size="mini"
          :disabled="this.multipleTable.length === 0"
          v-permission="permissions.advertising_exportAdvtlist"
          @click="exportPublishExcel"
        >
          导出
        </el-button>
        <el-button
          v-show="[190].includes(listQuery.advt_status)"
          type="warning"
          size="mini"
          :disabled="this.multipleTable.length === 0"
          @click="VolumeActivation"
          v-permission="permissions.advertising_TheActivation"
        >
          批量激活
        </el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table
        :key="newDate"
        :data="listData"
        ref="table"
        v-loading.lock="listLoading"
        element-loading-text="努力加载中"
        border
        style="width: 100%"
        highlight-current-row
        @current-change="handleCurrentChange1"
        @select-all="handleSelectionChange"
        @select="handleSelectionRow"
        @selection-change="selectionChange"
        @sort-change="tableResortEvent"
        @header-click="handleExpand"
        :default-expand-all="expand"
      >
        <el-table-column type="expand" width="40" align="center">
          <template slot="header">
            <span style="display: inline-block;text-align: center;width: 100%;">
              <svg-icon icon-class="right"/>
            </span>
          </template>
          <template slot-scope="props">
            <el-table :data="props.row.child_product" border :key="newDate">
              <el-table-column width="25" v-if="listQuery.advt_status === STATUS.ACTIVE || listQuery.advt_status === STATUS.OUT_OF_STOCK" align="center">
                <template slot-scope="scope">
                  <el-checkbox @input="child_select(props.row)" v-model="scope.row.isSelected"/>
                </template>
              </el-table-column>
              <el-table-column prop="istore_product_id" label="产品ID" align="center" width="70"></el-table-column>
              <el-table-column label="Item ID" v-if="STATUS.SHOW_MARKETPLACE.includes(listQuery.advt_status)" min-width="115" align="center">
                <template slot-scope="scope">
                  <a style="color: #409EFF;" v-if="scope.row.permalink" :href="scope.row.permalink" target="_blank"><p class="margin-less">{{ scope.row.sku_id }}</p></a>
                  <p v-else>{{ scope.row.sku_id }}</p>
                </template>
              </el-table-column>
              <el-table-column prop="base_price" label="保本价" align="center"></el-table-column>
              <el-table-column prop="discount_price" label="iStore价格" align="center"></el-table-column>
              <el-table-column prop="gross_margin" label="iStore毛利率(%)" width="120" align="center"></el-table-column>
              <el-table-column prop="current_price" label="当前销售价" align="center"></el-table-column>
              <el-table-column prop="current_gross_margin" label="当前毛利率(%)" align="center" width="110"></el-table-column>
              <el-table-column prop="price_type " label="价格类型" align="center">
                <template slot-scope="scope">
                  {{ getLabelByCode(scope.row.price_type) }}
                </template>
              </el-table-column>
              <el-table-column prop="custom_price" label="指定价" min-width="60" v-if="STATUS.SHOW_ALL_INFO.includes(listQuery.advt_status)" align="center">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_price_icon',scope.row)" @mouseleave="hideEdit('show_price_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position: relative;">
                    <el-input
                      v-if="scope.row.show_price_edit"
                      class="price_input inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_price"
                      @blur="setPrice(scope.row)"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_price }}</span>
                    <i v-show="scope.row.show_price_icon && STATUS.CUSTOM_STOCK.includes(listQuery.advt_status)&&hasActiveInput"
                       class="el-icon-edit"
                       title="编辑"
                       @click="showEdit('show_price_edit',scope.row, scope.$index)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="custom_gross_margin" label="指定毛利率(%)" width="110" v-if="STATUS.SHOW_ALL_INFO.includes(listQuery.advt_status)" align="center">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_gross_icon',scope.row)" @mouseleave="hideEdit('show_gross_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position: relative;">
                    <el-input
                      v-if="scope.row.show_gross_edit"
                      class="gross_input inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_gross_margin"
                      @blur="setGross(scope.row)"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_gross_margin }}</span>
                    <i v-show="scope.row.show_gross_icon && STATUS.CUSTOM_STOCK.includes(listQuery.advt_status)&&hasActiveInput"
                       v-permission="permissions.advertising_customSetPrice"
                       class="el-icon-edit"
                       title="编辑"
                       @click="showEdit('show_gross_edit',scope.row, scope.$index)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="custom_quantity" label="指定库存" min-width="80" v-if="[...STATUS.SHOW_ALL_INFO,100].includes(listQuery.advt_status)" align="center">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_quantity_icon',scope.row)" @mouseleave="hideEdit('show_quantity_icon',scope.row)"
                       style="width:100%;height:32px;line-height:32px;position: relative;"
                  >
                    <el-input
                      v-if="scope.row.show_quantity_edit"
                      class="stock_input inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_quantity"
                      @blur="setStock('single',scope.row)"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_quantity }}</span>
                    <i v-show="scope.row.show_quantity_icon && [...STATUS.CUSTOM_STOCK,100].includes(listQuery.advt_status)&&hasActiveInput"
                       v-permission="permissions.advertising_setinventory"
                       class="el-icon-edit"
                       title="编辑"
                       @click="showEdit('show_quantity_edit',scope.row, scope.$index)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="is_custom_quantity" label="是否指定库存" v-if="[...STATUS.SHOW_ALL_INFO,100].includes(listQuery.advt_status)" align="center" min-width="100">
                <template slot-scope="scope">
                  {{ Number(scope.row.is_custom_quantity) === 1 ? '是' : '否' }}
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="库存" align="center" min-width="50"></el-table-column>
              <el-table-column label="7天销量" v-if="props.row.type === 2" prop="sold_quantity_7" min-width="65" align="center"/>
              <el-table-column label="30天销量" v-if="props.row.type === 2" prop="sold_quantity_30" min-width="70" align="center"/>
              <el-table-column label="60天销量" v-if="props.row.type === 2" prop="sold_quantity_60" min-width="70" align="center"/>
              <el-table-column prop="status" label="状态" min-width="100" align="center">
                <template slot-scope="scope">
                  {{ translateStatus(scope.row.status) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" v-if="STATUS.ACTIVE === listQuery.advt_status" width="104" align="center" fixed="right">
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    v-permission="permissions.advertising_delete"
                    :disabled="!STATUS.CUSTOM_STOCK.includes(scope.row.status)"
                    size="mini"
                    @click="deleteFileOrDirectory(scope.row,'child')"
                  >
                    下架
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          type="selection" width="40"
        >
        </el-table-column>
        <el-table-column prop="advt_id" label="ID" width="75" sortable :sort-method="(a,b) => a-b" align="center"></el-table-column>
        <el-table-column prop="site_code" label="Site Code" width="155" align="center">
          <template slot="header">
            <span style="display:inline-block;text-align: center;width: 100%;">Site Code</span>
          </template>
        </el-table-column>
        <el-table-column prop="istore_product_id" label="Product ID" width="85" align="center">
        </el-table-column>
        <el-table-column v-if="!STATUS.NOT_SHOW_SPU.includes(listQuery.advt_status)" prop="spu_id" label="平台商品号" width="110" align="center"></el-table-column>
        <el-table-column prop="quantity" label="库存" align="center" width="50"></el-table-column>
        <el-table-column prop="product_image" label="产品图片" width="65" align="center">
          <template slot-scope="scope">
            <picture-view
              v-if="scope.row.pathArr.length > 0 && checkPickShow"
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
        <el-table-column prop="product_name" align="center">
          <template slot="header">
            <span style="display: inline-block;text-align: center;width: 100%">名称</span>
          </template>
          <template slot-scope="scope">
            <a v-if="scope.row.permalink" style="color: #409EFF;" :href="scope.row.permalink"
               target="_blank"
            >
              {{ scope.row.product_name }}
            </a>
            <span v-else>{{ scope.row.product_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="产品线" prop="product_line_name" width="70" align="center"/>
        <el-table-column label="7天销量" prop="sold_quantity_7" width="65" align="center"/>
        <el-table-column label="30天销量" prop="sold_quantity_30" width="70" align="center"/>
        <el-table-column label="60天销量" prop="sold_quantity_60" width="70" align="center"/>
        <el-table-column
          prop="type"
          width="70"
          align="center"
        >
          <template slot="header">
            <span style="display: inline-block;text-align: center;width: 100%">类型</span>
          </template>
          <template slot-scope="scope">
            <el-tag :type="Number(scope.row.type) === 1 ? 'success' : ''" size="small">{{ scope.row.type | getTypeLabel(options) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="86" sort-by="create_time" sortable align="center"></el-table-column>
        <el-table-column prop="update_time" label="更新时间" width="86" sort-by="update_time" sortable align="center"></el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="scope">
            <div class="flex-arround">
              <el-button type="text" size="mini" @click="openLog(scope.row.advt_id)" v-permission="permissions.advertising_SeeTheLog">日志</el-button>
              <el-button type="text" size="mini" @click="openTheNewTAB('mercadolibre.advertising.detail', { id: scope.row.advt_id })" v-permission="permissions.advertising_ViewTheAD">详情</el-button>
              <el-button
                type="text"
                v-permission="permissions.advertising_delete"
                v-if="listQuery.advt_status === STATUS.ACTIVE"
                size="mini"
                @click="deleteFileOrDirectory(scope.row,'single')"
              >
                下架
              </el-button>
            </div>
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
    <!--设置指定价-->
    <set-custom-price v-bind.sync="setCustomPriceDialog" @renderList="renderList"></set-custom-price>
    <!--设置毛利率-->
    <set-custom-gross-margin v-bind.sync="setCustomGrossMarginDialog" @renderList="renderList"></set-custom-gross-margin>
    <!-- istore更新日志 -->
    <istore-log v-bind.sync="logOptions"></istore-log>
  </div>
</template>

<script>
import { toBoolean, filterQueryParams } from '@/utils/help'
import { fetchList, deletePlatformAdvt, getProductSite, rePutaway, getSelectAll, SynchronousPricesApi, SynchronousStocksApi, SynchronousDatasApi } from '@/api/mercadolibre.gs'
import { importPublishStatusData, setInventory, setInventory100, AllTheactivation, cancelInventory, getCategory, cancelCustomPrice, updateCustomPrice } from '@/api/mercadolibre.gs'
import { exportPublishedStatus } from '@/views/mercadolibre.gs/export'
import setCustomGrossMargin from './components/setCustomGrossMargin'
import setCustomPrice from './components/setCustomPrice'
import istoreLog from './components/istoreLog'
import multipleSelectAccount from '@/views/mercadolibre.gs/advertising/components/multipleSelectAccount'
import { resultAlert } from './common'

export default {
  name: 'MercadolibreAdvertising',
  components: { setCustomPrice, setCustomGrossMargin, istoreLog, multipleSelectAccount },
  data() {
    return {
      multipleSelectAccountOption: {
        accountArr: [],
        accountKey: 'id'
      },
      STATUS: {
        DRAFT: 100, // Draft
        PENDING_PROCESSING: 110, // Pending Processing
        READY_TO_PUBLISH: 120, // Ready To Publish
        ACTIVE: 130, // Published
        INACTIVE: 140, // Out Of Stock
        DELETED: 150, // Deleted
        TRANSLATION_COMPLETE: 160, // Translation Complete
        CLASSIFICATION_COMPLETE: 170, // Classification Complete
        LONG_TITLE: 510, // Long Title
        LONG_DESCRIPTION: 520, // Long Description
        NOT_SHOW_SPU: [100, 110, 150],  // 不显示平台商品号
        CUSTOM_STOCK: [130, 140],  // ACTIVE、Inactive 状态操作指定库存
        SHOW_ALL_INFO: [130, 140, 180, 190],
        SHOW_MARKETPLACE: [130, 140, 170, 180, 190]
      },
      permissions: {
        advertising_setinventory: 'mercadolibre.advt.custom-quantity.set', //设置库存
        advertising_cancelinventory: 'mercadolibre.advt.custom-quantity.cancel', //取消库存
        advertising_customSetPrice: 'mercadolibre.advt.custom-price.set', //设置指定价/毛利率
        advertising_customCancelStock: 'mercadolibre.advt.custom-price.cancel', //取消指定价/毛利率
        advertising_SeeTheLog: 'mercadolibre.advt.advt.change-log', //查看日志
        advertising_ViewTheAD: 'mercadolibre.advt.advt.info', //查看广告
        advertising_delete: 'mercadolibre.advt.delete-platform-advt.execute', //下架
        advertising_TheActivation: 'mercadolibre.advt.advt-re-upload.re-update', //激活
        advertising_export: 'mercadolibre.advt.advt.export-advt-list', //激活
        advertising_exportAdvtlist: 'mercadolibre.advt.advt.export-advt-list', //导出列表
        advertising_sync_price: 'mercadolibre.advt.advt.sync-price', // 同步价格
        advertising_sync_data: 'mercadolibre.advt.advt.sync-advt-data', // 同步数据
        advertising_sync_stock: 'mercadolibre.advt.advt.sync-stock' // 同步库存
      },
      newDate: new Date().getTime(),
      isDisable: false,
      userId: this.$store.getters.userInfo.id,
      options: [],
      listLoading: true,
      listTotal: null,
      listData: [],
      viewListing: [],
      listQuery: {
        page: 1,
        per_page: 20,
        account_id: [],
        advt_product_ids: undefined,
        advt_spu_id: undefined,
        product_line_id: undefined,
        advt_type: [],
        advt_status: 130,
        advt_created: [],
        country_site_id: undefined,
        platform_item_id: undefined,
        is_custom_price: undefined,
        is_custom_quantity: undefined,
        sales_count: undefined,//销量搜索
        price_type: '',
        sold_out: undefined
      },
      exportQuery: {},
      pagination: null,
      statusTags: [],
      multipleTable: [],
      currentRow: null,
      setCustomPriceDialog: {
        authorizedUserID: '',
        selectData: [],
        open: false
      },
      setCustomGrossMarginDialog: {
        authorizedUserID: '',
        selectData: [],
        open: false
      },
      cancleCustomPriceDialog: {
        authorizedUserID: '',
        selectData: [],
        open: false
      },
      checkPickShow: true,
      checkNum: 0,
      platformTypeOptions: [],
      platformTypeProps: {
        value: 'value',
        label: 'label',
        children: 'children'
      },
      platformCategory: [],
      nowPlatformType: [],
      loadcategory: false,
      // 海外站点操作权限的ID
      authorizedUserID: '122',
      expand: true,
      defaultProps: {
        originalKey: 'origin',
        thumbnailKey: 'thumb'
      },
      logOptions: {
        open: false,
        advtId: ''
      },
      priceTypeArr: [
        { label: 'iStore价格', value: 10 },
        // { label: '动态调整价', value: 20 },
        { label: '指定价', value: 30 },
        { label: '指定毛利率', value: 40 }
        // { label: '跟卖价', value: 50 }
      ],
      esAdvtStatus: [],
      hasActiveInput: true
    }
  },
  created() {
    this.searchInit()
    // this.getplatformTypeOptions('0')
    this.renderList()
  },
  methods: {
    // 同步价格
    SynchronousPrices() {
      this.listLoading = true
      const advt_id = this.multipleTable.map(v => v.advt_id)
      // 调用同步价格接口
      SynchronousPricesApi({ advt_id, not_show_message: true }).then(res => {
        this.listLoading = false
        resultAlert(res)
      }).catch(err => {
        this.listLoading = false
        this.$message.error(err)
      })
    },
    // 同步库存
    SynchronousStocks() {
      this.listLoading = true
      const advt_id = this.multipleTable.map(v => v.advt_id)
      // 调用同步价格接口
      SynchronousStocksApi({ advt_id, not_show_message: true }).then(res => {
        this.listLoading = false
        resultAlert(res)
      }).catch(err => {
        this.listLoading = false
        this.$message.error(err)
      })
    },
    // 同步数据
    SynchronousDatas() {
      this.listLoading = true
      const advt_id = this.multipleTable.map(v => v.advt_id)
      // 调用同步价格接口
      SynchronousDatasApi({ advt_id, not_show_message: true }).then(res => {
        this.listLoading = false
        resultAlert(res)
      }).catch(err => {
        this.listLoading = false
        this.$message.error(err)
      })
    },
    cleanSelect() {
      this.$refs['listQuery'].resetFields()
    },
    selectAccount(arr) {
      this.listQuery.account_id = arr
    },
    clearAccount() {
      this.$refs.multipleSelectAccount.handleCancelAllUser()
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
    //批量激活
    VolumeActivation() {
      let advt_id = this._.map(this.multipleTable, 'advt_id')
      AllTheactivation({ advt_id }).then(() => {
        this.renderList()
      })
    },
    // 同步功能
    handleCommandUpdate(command) {
      let fn,tip
      switch (command) {
        case 'price':
          fn = 'SynchronousPrices'
          tip = '获取最新价格更新广告系统价格并同步至平台。'
          break;
        case 'data':
          fn = 'SynchronousDatas'
          tip = '同步平台广告状态、详情链接、刊登时间、修复其它广告数据。'
          break;
        case 'stock':
          fn = 'SynchronousStocks'
          tip = '获取最新库存更新广告系统库存并同步至平台。'
          break;
        default:
          break;
      }
      this.$confirm(tip, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnPressEscape: false,
        closeOnClickModal: false,
        type: 'warning'
      }).then(() => {
        this[fn]()
      }).catch(() => {})
    },
    /* 指定价 */
    handleCommandPricing(command) {
      /*
       * setPrice 设置指定价
       canclePrice 取消指定价
       setGross 设置毛利率
       *
       * */
      if (command === 'setPrice') {
        this.setCustomPriceDialog = {
          selectData: this.multipleTable,
          open: true
        }
      } else if (command === 'canclePrice') {
        this.unpricing(1)
      }
    },
    //指定毛利率
    customMargin(command) {
      console.log('ok', command)
      if (command === 'setGross') {
        this.setCustomGrossMargin(this.getParam())
      } else {
        //取消指定毛利率
        this.unpricing(2)
      }
    },
    //打开指定毛利率弹窗
    setCustomGrossMargin(ids) {
      this.setCustomGrossMarginDialog = {
        selectData: this.multipleTable,
        open: true
      }
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
    // 取消指定价
    unpricing(type) {
      const advIds = []
      this.$confirm(type === 1 ? `您确定要取消指定价吗？` : `您确定要取消指定毛利率吗？`, '提示', {
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
          custom_price_type: type,
          not_show_message: true
        }
        cancelCustomPrice(obj).then((res) => {
          resultAlert(res)
          this.renderList()
        })
      }).catch(() => {
        this.listLoading = false
      })
    },
    //价格验证
    checkPrice(value) {
      const reg = /^\d+(\.\d*)?$/
      if (!reg.test(value)) {
        return false
      }
      return true
    },
    // 输入框设置指定价
    setPrice(data) {
      this.hasActiveInput = true
      data.show_price_edit = false
      // 验证输入值是否合法
      if (this.checkPrice(data.custom_price)) {
        const obj = {
          custom_price: data.custom_price,
          product_id: [data.product_id],
          custom_price_type: 1,
          not_show_message: true
        }
        updateCustomPrice(obj).then(res => {
          resultAlert(res)
          this.renderList()
        }).catch((e) => {
          this.$message.error(e)
          data.custom_price = data.virtualCustom_price
        })
      } else {
        this.$message.error('请输入正确格式的指定价')
        data.custom_price = data.virtualCustom_price
      }
    },
    // 毛利率验证
    checkGross(value) {
      const reg = /^((0\.\d{0,2})|1)$/
      if (!reg.test(value) || Number(value) === 0) {
        return false
      }
      return true
    },
    // 输入框设置毛利率
    setGross(data) {
      this.hasActiveInput = true
      data.show_gross_edit = false
      //  验证输入值是否合法
      if (this.checkGross(data.custom_gross_margin)) {
        const obj = {
          custom_price: data.custom_gross_margin,
          product_id: [data.product_id],
          custom_price_type: 2,
          not_show_message: true
        }
        updateCustomPrice(obj).then(res => {
          resultAlert(res)
          this.renderList()
        }).catch((e) => {
          this.$message.error(e)
          data.custom_gross_margin = data.virtualGross_margin
        })
      } else {
        this.$message.error('毛利率必须是0-1之间的数字(最多保留两位)')
        data.custom_gross_margin = data.virtualGross_margin
      }
    },
    openMoreTab() {
      const detailsId = this.multipleTable.map(v => v.advt_id)
      detailsId.map(v => {
        window.open(`/mercadolibre/advertising/detail/${ v }`)
      })
    },
    // 日志
    openLog(id) {
      this.logOptions = {
        open: true,
        advtId: id
      }
    },
    // 状态显示
    translateStatus(val) {
      return this.esAdvtStatus.filter(v => Number(val) === v.key)[0].label
    },
    // 获取平台类型级联选项
    getplatformTypeOptions(val) {
      getCategory({ 'parentCategoryId': val, not_show_message: true }).then(response => {
        response.data = JSON.parse(JSON.stringify(response.data).replace('&nbsp;', ' '))
        this.platformTypeOptions = response.data.map(v => {
          if (v.hasChildren) {
            return { 'value': v.value, 'label': v.label, 'children': [] }
          } else {
            return { 'value': v.value, 'label': v.label }
          }
        })
        this.platformCategory = response.data.map(v => v.value)
      })
    },
    // 级联选项切换父级目录
    handleItemChange(val) {
      if (val.length === 1) {
        const index = this.platformCategory.indexOf(val[0])
        getCategory({ 'parentCategoryId': val[0], not_show_message: true }).then(response => {
          response.data = JSON.parse(JSON.stringify(response.data).replace('&nbsp;', ' ').replace('&amp;', '&').replace('&#039;', ''))
          this.platformTypeOptions[index].children = response.data
        }).finally(() => {
        })
      }
    },
    // 获取搜索 site_code、country、产品线、广告类型 选项内容
    searchInit() {
      const optionsParams = ['MercadoLibreAdvtAccount', 'MercadoLibreAdvtTypes', 'MercadoLibreProductLine', 'MercadoLibreGetCountry']
      getSelectAll(optionsParams).then(response => {
        this.options = response.data
        this.options.customPrice = [{ key: '1', label: '是' }, { key: '0', label: '否' }]
        this.options.customQuantity = [{ key: '1', label: '是' }, { key: '0', label: '否' }]
        this.multipleSelectAccountOption.accountArr = response.data.MercadoLibreAdvtAccount
      })
    },
    getProductSites(product_id, account_id) {
      getProductSite({ product_id: product_id, account_id: account_id, not_show_message: true }).then(response => {
        this.viewListing = response.data
      })
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
    toBoolean(v) {
      return toBoolean(v)
    },
    renderList() {
      this.listData = []
      this.listLoading = true
      this.expand = true
      this.listQuery.advt_product_ids = this._.trim(this.listQuery.advt_product_ids)
      this.listQuery.advt_spu_id = this._.trim(this.listQuery.advt_spu_id)
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
        this.exportQuery.country_site_id = this.listQuery.country_site_id
        this.exportQuery.platform_item_id = this.listQuery.platform_item_id
        this.listData = response.data.list
        this.pagination = response.data.pagination
        this.esAdvtStatus = response.data.statistics
        this._.forEach(this.listData, (v) => {
          // 图片缩略图
          v.pathArr = []
          if (v.product_image) {
            v.pathArr.push({ origin: v.product_image, thumb: v.product_image_thumb })
          }
          this._.forEach(v.child_product, (val) => {
            val.isSelected = false
            val.show_quantity_icon = false
            val.show_quantity_edit = false
            val.show_price_icon = false
            val.show_price_edit = false
            val.show_gross_icon = false
            val.show_gross_edit = false
            val.virtualGross_margin = val.custom_gross_margin
            val.virtualCustom_price = val.custom_price
            val.virtualCustom_quantity = val.custom_quantity
            val.virtualCustom_msrp_price = val.custom_msrp_price
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
        this.multipleTable = []
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleFilter() {
      this.newDate = new Date().getTime()
      this.filter = 'filter'
      this.listQuery.page = 1
      this.listQuery.advt_product_ids = this._.trim(this.listQuery.advt_product_ids)
      this.listQuery.advt_spu_id = this._.trim(this.listQuery.advt_spu_id)
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
      this.$refs.listQuery.resetFields()
      this.newDate = new Date().getTime()
      this.nowPlatformType = []
      this.clearAccount()
      this.renderList()
    },
    changeStatus(key) {
      this.newDate = new Date().getTime()
      if (this.listQuery.advt_status !== key) {
        this.listQuery.advt_status = key
        this.listQuery.page = 1
        this.renderList()
      }
    },
    statusSelected(key) {
      return this.listQuery.advt_status === key ? 'warning' : ''
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
    /* 指定库存 */
    handleCommandInventory(command) {
      if (command === '0') {
        this.SetTheInventory()
      } else if (command === '1') {
        this.cancelTheInventory()
      }
    },
    // 批量设置指定库存
    SetInventory() {
      this.$prompt('请输入库存', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnPressEscape: false,
        closeOnClickModal: false
      }).then(({ value }) => {
        const reg = /^\d{1,3}$/
        if (!reg.test(value)) {
          this.$message.error('设置库存必须是0-999之间的的整数！')
          return
        }
        this.listLoading = false
        this.handleTheInventory('all', value)
      }).catch(() => {
        this.listLoading = false
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
          if (this.listQuery.advt_status === 100) {
            //100状态下的库存设置
            setInventory100({ product_id: ids, custom_quantity: row.custom_quantity, is_custom_quantity: 1, not_show_message: true }).then((res) => {
              resultAlert(res)
              this.renderList()
              row.is_custom_quantity = '1'
            }).catch(() => {
              row.custom_quantity = row.virtualCustom_quantity
            }).finally(() => {
              this.listLoading = false
            })
          } else {
            setInventory({ product_id: ids, custom_quantity: row.custom_quantity, is_custom_quantity: 1, not_show_message: true }).then((res) => {
              resultAlert(res)
              this.renderList()
              row.is_custom_quantity = '1'
            }).catch(() => {
              row.custom_quantity = row.virtualCustom_quantity
            }).finally(() => {
              this.listLoading = false
            })
          }

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
            if (this.listQuery.advt_status === 100) {
              setInventory100({ product_id: ids, custom_quantity: value, is_custom_quantity: 1, not_show_message: true }).then((res) => {
                resultAlert(res)
                this.renderList()
              })
            } else {
              setInventory({ product_id: ids, custom_quantity: value, is_custom_quantity: 1, not_show_message: true }).then((res) => {
                resultAlert(res)
                this.renderList()
              })
            }
          }
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
      cancelInventory({ product_id: ids, is_custom_quantity: 0, not_show_message: true }).then(res => {
        resultAlert(res)
        this.renderList()
      }).finally(() => {
        this.listLoading = false
      })
    },

    // 下架和批量下架
    deleteFileOrDirectory(row, type) {
      let params = []
      // 多选
      if (type === 'all') {
        this._.map(this.multipleTable, v => {
          params.push({ advt_id: v.advt_id, product_id: v.child_product.filter(v => v.isSelected && [130, 140].includes(v.status)).map(v => v.product_id) })
        })
      }
      // 主产品下架
      if (type === 'single') {
        params.push({ advt_id: row.advt_id, product_id: row.child_product.filter(v => [130, 140].includes(v.status)).map(v => v.product_id) })
      }
      // 子产品下架
      if (type === 'child') {
        params.push({ advt_id: row.advt_id, product_id: [row.product_id] })
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
          deletePlatformAdvt({ params }).then(res => {
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
    // 重新上架
    rePutaway(row, type) {
      // 防止误操作
      this.$confirm('是否将该商品重新上架?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用后端接口
        let obj
        if (type === 'main') {
          // 主产品重新上架
          obj = {
            user_id: this.$store.state.user.info.id,
            advt_id: row.row.advt_id,
            istore_product_id: row.row.istore_product_id,
            product_id: row.row.product_id,
            type: row.row.type
          }
        } else {
          obj = {
            // vari子产品重新上架
            user_id: this.$store.state.user.info.id,
            advt_id: row.row.advt_id,
            istore_product_id: row.row.istore_product_id,
            type: row.row.parent_type,
            child_product_id: row.row.advt_id
          }
        }
        rePutaway(obj).then(res => {
          this.renderList()
        }).catch(() => {
        })
      }).catch(() => {
      })
    },
    exportPublishExcel() {
      // 用户未选择导出数据提示
      if (this.multipleTable.length === 0) {
        this.$alert('请勾选导出数据', '提示', {
          confirmButtonText: '确定'
        })
        return
      }
      // 用户选择导出数据，调用接口导出数据
      if (this.multipleTable.length > 0) {
        const advt_ids = []
        this.multipleTable.map(val => {
          advt_ids.push(val.advt_id)
        })
        const loading = this.$loading({
          lock: true,
          text: '正在导出，请耐心等待',
          background: 'rgba(0, 0, 0, 0.5)'
        })
        this.exportQuery.not_show_message = true
        // this.exportQuery.advtStatus = this.listQuery.advt_status
        this.exportQuery.advt_id = advt_ids
        const priceType = {
          10: 'iStore价格',
          20: '动态调整价',
          30: '指定价',
          40: '指定毛利率',
          50: '跟卖价'
        }
        importPublishStatusData(this.exportQuery).then(response => {
          loading.close()
          if (response.data.length === 0) {
            this.$message({
              message: '数据异常请重新导出',
              type: 'warning'
            })
          } else {
            response.data.forEach(item => {
              item.price_type = priceType[item.price_type]
              if (item.istore_parent_product_id === 0) {
                item.istore_parent_product_id = ''
              }
            })
            exportPublishedStatus(response.data)
          }
        }).catch(() => {
          loading.close()
        })
      }
    },
    // 清理缩略图缓存
    tableResortEvent() {
      this.checkPickShow = false
      this.$nextTick(() => {
        this.checkPickShow = true
      })
    },
    // 禁用设置指定价/指定库存/取消指定价
    checkSet(val, type) {
      //  type 0 设置指定价 1 取消指定价 2 设置毛利率
      if (type === 1) {
        return val.every(item => Number(item.is_custom_price) === 0)
      }
    },
    handleExpand(column) {
      if (column.type === 'expand') {
        this.expand = !this.expand
        // 强制刷新DOM
        this.newDate = new Date().getTime()
      }
    },
    // 指定库存图标控制
    showEdit(type, row) {
      if (this.hasActiveInput) {
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
            let selector = `.${ focus_target } .el-input__inner`
            document.querySelector(selector).focus()
          })
          this.hasActiveInput = false
        }
      }
    },
    hideEdit(type, row) {
      row[type] = false
    }
  },
  watch: {
    nowPlatformType: {
      deep: true,
      handler() {
        this.listQuery.categoryId = this.nowPlatformType[this.nowPlatformType.length - 1]
      }
    },
    expand(val) {
      this.$nextTick(() => {
        if (val) {
          document.querySelector('.el-table th > .cell > span > svg').style.transform = 'rotate(90deg)'
        } else {
          document.querySelector('.el-table th > .cell > span > svg').style.transform = 'rotate(0deg)'
        }
      })
    }
  },
  filters: {
    getTypeLabel(val, options) {
      const types = options.MercadoLibreAdvtTypes
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

.popover-cc {
  font-size: 12px;

  p {
    line-height: 22px;
    text-align: justify;
  }
}

.content {
  display: flex;
  justify-content: space-between;

  a:hover {
    cursor: pointer;
  }
}

.price-tip {
  display: inline-block;
  text-align: left;
  width: 30%;
  color: #f56c6c;
  margin-bottom: 5px;
  border-radius: 10px;
}

.operation {
  display: flex;
  flex-direction: column;
  align-items: center;

  .operation-btn {
    width: 102px;
    height: 28px;
    line-height: 5px;
    font-size: 12px;
    margin-bottom: 5px;
  }
}

.margin-less {
  margin: 5px 0px;
}

.el-table th > .cell > span > svg {
  color: #fff;
  transform: rotate(90deg);
  transition: linear .5s;
}

.el-icon-edit {
  position: absolute;
  color: #409EFF;
  font-size: 20px;
  top: 8px;
  right: -5px;
}

.flex-arround {
  display: flex;
  justify-content: space-around;
}
</style>
<style rel="stylesheet/scss" lang="scss">
.el-table td .el-dropdown .el-button + .el-button {
  margin-left: 0px !important;
}
</style>

