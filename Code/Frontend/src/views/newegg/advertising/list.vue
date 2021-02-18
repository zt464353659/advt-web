<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <!--        <el-form-item label="Site Code" prop="account_id">-->
        <!--          <el-select v-model="listQuery.account_id" clearable placeholder="请选择" style="width: 150px;">-->
        <!--            <el-option v-for="item in options.NewEggAdvtAccount" :key="item.id" :label="item.account" :value="item.id"></el-option>-->
        <!--          </el-select>-->
        <!--        </el-form-item>-->
        <el-form-item label="Site Code" prop="account_id">
          <multiple-select-account ref="multipleSelectAccount" v-bind.sync="multipleSelectAccountOption" @select-account="selectAccount" @clean-select="cleanSelect"></multiple-select-account>
        </el-form-item>
        <el-form-item label="Product ID" prop="advt_product_ids">
          <el-input v-model="listQuery.advt_product_ids" clearable placeholder="多个请用空格分隔" style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item label="广告类型" prop="advt_type">
          <el-checkbox-group v-model="listQuery.advt_type">
            <el-checkbox-button v-for="types in options.NewEggAdvtTypes" :label="types.key" :key="types.key">{{ types.label }}</el-checkbox-button>
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
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item v-if="[120,130].includes(listQuery.advt_status)" label="是否指定库存" prop="is_custom_quantity">
          <el-select v-model="listQuery.is_custom_quantity" clearable placeholder="请选择" style="width: 120px;">
            <el-option label="是" value="1"></el-option>
            <el-option label="否" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品线" prop="product_line_id">
          <el-select v-model="listQuery.product_line_id"
                     clearable
                     placeholder="请选择"
                     style="width: 120px;"
          >
            <el-option v-for="item in options.NewEggProductLine"
                       :key="item.id"
                       :label="item.name"
                       :value="item.id"
            ></el-option>
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
    <div v-if="options.esAdvtStatus" class="header-box">
      <el-row class="left-row">
        <el-tag v-for="status in options.esAdvtStatus" :key="status.key" :type="statusSelected(status.key)" size="medium">
          <span @click="changeStatus(status.key)">{{ status.label }} ({{ status.total }})</span>
        </el-tag>
      </el-row>
      <el-row class="right-row">
        <el-button type="primary" size="mini" @click="openMoreTab" :disabled="multipleTable.length === 0" v-permission="permissions.advertising_ViewTheAD">批量打开广告详情页</el-button>
        <!--Active状态下-->
        <el-dropdown
          v-if="[120,130].includes(listQuery.advt_status)"
          size="mini"
          v-permission="[permissions.advertising_setinventory,permissions.advertising_cancelinventory]"
          split-button
          type="success"
          trigger="click"
          @command="stock"
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
        <!--Active状态下-->
        <el-dropdown
          v-if="[120,130].includes(listQuery.advt_status)"
          size="mini"
          v-permission="[permissions.advertising_customSetPrice,permissions.advertising_customCancelStock]"
          split-button
          type="primary"
          trigger="click"
          @command="price"
        >
          指定价
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-permission="permissions.advertising_customSetPrice" :disabled="this.multipleTable.length === 0" :command="{ fuc: 'setPress', value: multipleTable, type: 'all' }">
              设置指定价
            </el-dropdown-item>
            <el-dropdown-item v-permission="permissions.advertising_customCancelStock" :disabled="this.multipleTable.length === 0" :command="{ fuc: 'unpricing', value: multipleTable }">
              取消指定价
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown
          v-if="[120,130].includes(listQuery.advt_status)"
          size="mini"
          v-permission="[permissions.advertising_customSetPrice,permissions.advertising_customCancelStock]"
          split-button
          type="primary"
          trigger="click"
          @command="margin"
        >
          指定毛利率
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-permission="permissions.advertising_customSetPrice"
              :disabled="this.multipleTable.length === 0"
              :command="{ fuc: 'setGrossMargins', value: multipleTable, type: 'all' }"
            >
              设置指定毛利率
            </el-dropdown-item>
            <el-dropdown-item v-permission="permissions.advertising_customCancelStock" :disabled="this.multipleTable.length === 0" :command="{ fuc: 'unpricing', value: multipleTable }">
              取消指定毛利率
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
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
                @filter-change="handleFilterChange"
      >
        <el-table-column type="expand" width="40" align="center">
          <template slot="header">
            <svg-icon icon-class="right"/>
          </template>
          <template slot-scope="props">
            <el-table :data="props.row.child_product" border>
              <el-table-column v-if="[120,130].includes(listQuery.advt_status)" width="25" align="center">
                <template slot-scope="scope">
                  <el-checkbox @input="smt(props.row)" v-model="scope.row.isSelected"/>
                </template>
              </el-table-column>
              <el-table-column prop="istore_product_id" label="Product ID(Seller Part#)" align="center" width="160"></el-table-column>
              <el-table-column prop="product_name" label="Website Short Title" align="center" min-width="260"></el-table-column>
              <el-table-column prop="base_price" label="保本价" align="center" width="60"></el-table-column>
              <el-table-column prop="discount_price" label="iStore价格" align="center" width="75"></el-table-column>
              <el-table-column prop="gross_margin" label="iStore毛利率(%)" align="center" width="110"></el-table-column>
              <el-table-column prop="current_price" label="当前销售价" align="center" width="75"></el-table-column>
              <el-table-column prop="current_gross_margin" label="当前毛利率(%)" align="center" width="95"></el-table-column>
              <el-table-column prop="price_type" label="价格类型" align="center" width="75">
                <template slot-scope="scope">
                  {{ getLabelByCode(scope.row.price_type) }}
                </template>
              </el-table-column>
              <el-table-column prop="custom_price" label="指定价" align="center" v-if="[120,130].includes(listQuery.advt_status)" width="60">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_price_icon',scope.row)" @mouseleave="hideEdit('show_price_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position:relative;">
                    <el-input
                      v-if="scope.row.show_price_edit"
                      :ref="'price_input'+ scope.$index"
                      class="price_input inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_price"
                      @blur="setPress(scope.row, 'single')"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_price }}</span>
                    <i v-show="scope.row.show_price_icon&&noLiveInput"
                       v-permission="permissions.advertising_customSetPrice"
                       class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:9px;right:-7px;"
                       @click="showEdit('show_price_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_price_edit',scope.row)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="custom_gross_margin" label="指定毛利率(%)" align="center" v-if="[120,130].includes(listQuery.advt_status)" width="100">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_gross_icon',scope.row)" @mouseleave="hideEdit('show_gross_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position: relative;">
                    <el-input
                      v-if="scope.row.show_gross_edit"
                      :ref="'gross_input'+ scope.$index"
                      class="gross_input inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_gross_margin"
                      @blur="handleSetGrossMargins(scope.row, 'single')"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_gross_margin }}</span>
                    <i v-show="scope.row.show_gross_icon&&noLiveInput"
                       class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:9px;right:-7px;"
                       @click="showEdit('show_gross_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_gross_edit',scope.row)"
                       v-permission="permissions.advertising_customSetPrice"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="Inventory" width="70" align="center"></el-table-column>
              <el-table-column prop="custom_quantity" label="指定库存" align="center" width="65" v-if="[120,130].includes(listQuery.advt_status)">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_quantity_icon',scope.row)" @mouseleave="hideEdit('show_quantity_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position:relative;">
                    <el-input
                      v-if="scope.row.show_quantity_edit"
                      :ref="'stock_input'+ scope.$index"
                      class="stock_input inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_quantity"
                      @blur="setStock('single',scope.row)"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_quantity }}</span>
                    <i v-show="scope.row.show_quantity_icon&&noLiveInput"
                       v-permission="permissions.advertising_setinventory"
                       class="el-icon-edit"
                       title="编辑"
                       style="color:#409EFF; font-size:20px;top:9px;right:-7px;"
                       @click="showEdit('show_quantity_edit',scope.row, scope.$index)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="is_custom_quantity" width="90" align="center" label="是否指定库存" v-if="[120,130].includes(listQuery.advt_status)">
                <template slot-scope="scope">
                  {{ Number(scope.row.is_custom_quantity) === 1 ? '是' : '否' }}
                </template>
              </el-table-column>
              <el-table-column label="产品线" align="center" v-if="props.row.type === 2" prop="product_line_name" width="80"/>
              <el-table-column label="7天销量" align="center" v-if="props.row.type === 2" prop="sold_quantity_7" width="65"/>
              <el-table-column label="30天销量" align="center" v-if="props.row.type === 2" prop="sold_quantity_30" width="70"/>
              <el-table-column label="60天销量" align="center" v-if="props.row.type === 2" prop="sold_quantity_60" width="70"/>
              <el-table-column prop="status" label="Status" width="84" align="center">
                <template slot-scope="scope">
                  <span v-for="(item, index) in options.esAdvtStatus" :key="index">
                    <span style="word-break: keep-all;" v-if="Number(scope.row.status) === item.key">{{ item.label }}</span>
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="40" align="center"></el-table-column>
        <el-table-column prop="id" align="center" label="ID" width="75" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column prop="site_code" align="center" label="Site Code" width="145"></el-table-column>
        <el-table-column prop="istore_product_id" align="center" label="Product ID(Seller Part#)" width="155"></el-table-column>
        <el-table-column prop="product_image" label="产品图片" align="center" width="65">
          <template slot-scope="scope">
            <picture-view
              v-if="scope.row.pathArr && scope.row.pathArr.length > 0 && checkPickShow"
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
          <template slot="header" slot-scope="scope">
            <span v-if="scope" style="display:inline-block;text-align:center;width:100%;">产品名称</span>
          </template>
          <template slot-scope="scope">
            <a v-if="listQuery.advt_status === 120" style="color: #409EFF;" :href="scope.row.platform_item_url"
               target="_blank"
            >
              {{ scope.row.product_name }}
            </a>
            <span v-else>{{ scope.row.product_name }}</span>
          </template>
        </el-table-column>
        <!--<el-table-column prop="custom_price" v-if="listQuery.advt_status === 103" label="指定价" min-width="85">-->
        <!--<template slot-scope="scope">-->
        <!--<el-input size="small" class="inline-edit-input" v-model="scope.row.custom_price"-->
        <!--:disabled="scope.row.custom_price_type === '2'  ? this.isDisable=true : this.isDisable=false"-->
        <!--@blur="handleEditAssign(scope.row, 'single')"></el-input>-->
        <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column prop="discount_price" label="价格" width="100"></el-table-column>-->
        <!--<el-table-column prop="gross_margin" label="毛利率" min-width="85" v-if="listQuery.advt_status === 103">-->
        <!--<template slot-scope="scope">-->
        <!--<el-input size="small" class="inline-edit-input" v-model="scope.row.gross_margin"-->
        <!--:disabled="scope.row.custom_price_type === '1'  ? this.isDisable=true : this.isDisable=false"-->
        <!--@blur="handleEditGross(scope.row, '2')"></el-input>-->
        <!--</template>-->
        <!--</el-table-column>-->
        <!-- <el-table-column prop="discount_price" label="价格(USD)" width="100"></el-table-column> -->
        <el-table-column prop="quantity" label="Inventory" align="center" width="70"></el-table-column>
        <el-table-column prop="type" label="类型" align="center" width="70">
          <template slot-scope="scope">
            <el-tag :type="Number(scope.row.type) === 1 ? 'success' : ''" size="small">{{ Number(scope.row.type) === 1 ? 'Normal' : 'Variation' }}</el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="type"
                         align="center"
                         :render-header="renderHeader"
                         column-key="type"
                         width="120"
                         :filters="[{ text: 'Normal', value: '1' }, { text: 'Variation', value: '2' }]"
                         :filter-method="filterType"
                         filter-placement="bottom-start">
          <template slot-scope="scope">
            <el-tag :type="scope.row.type === '1' ? 'success' : ''" size="small">{{ scope.row.type | getTypeLabel(options) }}</el-tag>
          </template>
        </el-table-column> -->
        <el-table-column label="产品线" align="center" prop="product_line_name" width="80"/>
        <el-table-column label="7天销量" align="center" prop="sold_quantity_7" width="65"/>
        <el-table-column label="30天销量" align="center" prop="sold_quantity_30" width="70"/>
        <el-table-column label="60天销量" align="center" prop="sold_quantity_60" width="70"/>
        <el-table-column prop="create_time" align="center" label="创建时间" width="86" sort-by="create_time" sortable>
          <template slot-scope="scope">{{ scope.row.create_time }}</template>
        </el-table-column>
        <el-table-column prop="update_time" align="center" label="更新时间" width="86" sort-by="create_time" sortable>
          <template slot-scope="scope">{{ scope.row.update_time }}</template>
        </el-table-column>
        <!--<el-table-column prop="create_user" label="创建人" width="100"></el-table-column>-->
        <!--<el-table-column v-if="listQuery.advt_status === 'wait_shelve'" prop="onshelves_status" label="执行状态" min-width="88">-->
        <!--<template slot-scope="scope">-->
        <!--<template v-if="scope.row.onshelves_status === 1">-->
        <!--<el-tooltip :content="scope.row.onshelves_message" placement="top" effect="light">-->
        <!--<el-tag type="danger" size="small">执行出错</el-tag>-->
        <!--</el-tooltip>-->
        <!--</template>-->
        <!--<template v-else>-->
        <!--<el-tag type="warning" size="small">未执行</el-tag>-->
        <!--</template>-->
        <!--</template>-->
        <!--</el-table-column>-->
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button v-permission="permissions.advertising_SeeTheLog" type="text" size="mini" @click="openLog(scope.row.id)">日志</el-button>
            <el-button v-permission="permissions.advertising_ViewTheAD" type="text" size="mini" @click="openTheNewTAB('newegg.advertising.detail', { id: scope.row.id })">详情</el-button>
            <!--<el-button type="text" v-if="listQuery.advt_status === 103" size="mini" @click="deleteFileOrDirectory(scope)" v-permission="permissions.soldOut">下架</el-button>-->
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
          :page-sizes="[20, 50, 100, 150, 200]"
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
import setPrice from './components/setPrice'
import istoreLog from './components/istoreLog'
import multipleSelectAccount from '@/views/newegg/advertising/components/multipleSelectAccount'

import { fetchList, batchSoldOut, getSelectAll, updateCustomerPrice, setCustomStock, cancleStock, cancelCustomPrice } from '@/api/newegg'

export default {
  components: { setPrice, setGrossMargin, istoreLog, multipleSelectAccount },
  data() {
    return {
      multipleSelectAccountOption: {
        accountArr: [],
        accountKey: 'id'
      },
      permissions: {
        advertising_setinventory: 'newegg.advt.custom-quantity.set',//设置库存
        advertising_cancelinventory: 'newegg.advt.custom-quantity.cancel',//取消库存
        advertising_customSetPrice: 'newegg.advt.custom-price.set',//设置指定价/毛利率
        advertising_customCancelStock: 'newegg.advt.custom-price.cancel',//取消指定价/毛利率
        advertising_SeeTheLog: 'newegg.advt.advt.change-log',//查看日志
        advertising_ViewTheAD: 'newegg.advt.advt.info',//查看广告
        advertising_delete: 'newegg.advt.delete-platform-advt.execute'//下架
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
        // { label: '动态调整价', value: 20 },
        { label: '指定价', value: 30 },
        { label: '指定毛利率', value: 40 }
        // { label: '跟卖价', value: 50 }
      ],//价格类型
      /* 广告列表搜索条件列表 */
      selectOptions: ['NewEggAdvtAccount', 'NewEggAdvtTypes', 'NewEggProductLine'],
      noLiveInput: true,//指定价指定毛利率，input锁定
      listLoading: true,
      listTotal: null,
      listData: [],
      listQuery: {
        page: 1,
        per_page: 20,
        account_id: [],
        advt_product_ids: undefined,
        advt_type: [],
        advt_status: 120,
        advt_created: [],
        is_custom_price: undefined,
        is_custom_quantity: undefined,
        product_line_id: undefined,//產品綫
        sales_count: undefined,//销量搜索
        price_type: undefined//价格类型
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
    openMoreTab() {
      const detailsId = this.multipleTable.map(v => v.id)
      detailsId.map(v => {
        window.open(`/newegg/advertising/detail/${ v }`)
      })
    },
    // 日志
    openLog(id) {
      this.logOptions = {
        open: true,
        advtId: id
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
            let selector = `.${ focus_target } .el-input__inner`
            document.querySelector(selector).focus()
          })
          this.noLiveInput = false
        }
      }
    },
    hideEdit(type, row) {
      row[type] = false
    },
    selectionChange(val) {
      this.multipleTable = val
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
    searchInit() {
      getSelectAll({ keys: this.selectOptions }).then(response => {
        this.options = response.data
        this.multipleSelectAccountOption.accountArr = response.data.NewEggAdvtAccount
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
      this.listData = []
      this.listLoading = true
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
        this.listData = response.data.list
        this.pagination = response.data.pagination
        this.options.esAdvtStatus = response.data.statistics
        this.createUserList = response.data.createUser
        this._.forEach(this.listData, (v) => {
          // 图片缩略图
          v.pathArr = []
          if (v.product_image) {
            v.pathArr.push({ thumbnail: v.product_image_thumb, original: v.product_image })
          }
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
    checkPrice(inputPrice) {
      const reg = /^\d+(\.\d*)?$/
      if (!reg.test(inputPrice)) {
        this.$message.error('请输入正确格式的指定价')
        return
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
        if (this.checkPrice(data.custom_price)) {
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
        this.noLiveInput = true
      }
    },
    // 取消指定价
    unpricing(msg, type) {
      const advIds = []
      this.$confirm(`您确定要取消${ msg }吗？`, '提示', {
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
    checkGross(val) {
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
        if (this.checkGross(this.currentRow.custom_gross_margin)) {
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
        this.noLiveInput = true
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
            this.noLiveInput = true

          })
        } else {
          // 验证不通过，恢复初始值显示
          row.custom_quantity = row.virtualCustom_quantity
        }
        this.listLoading = false
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
      this.clearAccount()
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
      const types = options.NewEggAdvtTypes
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
