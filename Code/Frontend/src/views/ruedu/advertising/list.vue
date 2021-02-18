<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="Site Code" prop="accountId">
          <el-select v-model="listQuery.accountId" placeholder="请选择" style="width: 160px">
            <el-option
              v-for="item in mulOptions.rueduAccounts"
              :key="item.id"
              :label="item.account"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Product ID" prop="istore_product_id">
          <el-input v-model="listQuery.istore_product_id" clearable placeholder="多个请用空格分隔" style="width: 190px;"></el-input>
        </el-form-item>
        <el-form-item label="Group Code" prop="parent_sku" :rules="{ pattern: /^\d{8}$/, message: '只能输入一个8位Group Code ID', trigger: 'blur' }">
          <el-input v-model="listQuery.parent_sku" clearable placeholder="请输入一个Group Code ID" style="width: 190px;"></el-input>
        </el-form-item>
        <el-form-item label="平台商品号" prop="offer_id">
          <el-input v-model="listQuery.offer_id" clearable placeholder="多个请用空格分隔" style="width: 190px;"></el-input>
        </el-form-item>
        <el-form-item label="产品线" prop="productLine">
          <el-select v-model="listQuery.productLine" placeholder="请选择" style="width: 190px">
            <el-option
              v-for="item in mulOptions.productLine"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="广告类型" prop="product_type">
          <el-checkbox-group v-model="listQuery.product_type">
            <el-checkbox-button v-for="advtType in rueduAdvtTypes" :label="advtType.key" :key="advtType.key">{{ advtType.label }}</el-checkbox-button>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="创建时间" prop="advtCreated">
          <el-date-picker
            v-model="listQuery.advtCreated"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss" style="width: 260px"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item v-if="listQuery.advtStatus === 40" label="是否指定价" prop="is_custom_price">
          <el-select v-model="listQuery.is_custom_price" clearable placeholder="请选择" style="width: 120px;">
            <el-option label="是" value="1"></el-option>
            <el-option label="否" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="setPriceStatus.includes(listQuery.advtStatus)" label="是否指定库存" prop="is_custom_stock">
          <el-select v-model="listQuery.is_custom_stock" clearable placeholder="请选择" style="width: 120px;">
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
    <div class="header-box">
      <el-row class="left-row">
        <el-tag v-for="(status, i) in esAdvtStatus" :key="i" :type="statusSelected(status.key)" size="medium">
          <span @click="changeStatus(status.key)">{{ status.label }} ({{ status.total }})</span>
        </el-tag>
      </el-row>
      <!--activing状态下-->
      <el-row class="right-row">
        <el-button type="info" size="mini" @click="openMoreTab" :disabled="multipleTable.length === 0" v-permission="permissions.advertising_ViewTheAD">批量打开广告详情页</el-button>
        <el-dropdown size="mini"
                     v-if="setPriceStatus.includes(listQuery.advtStatus)"
                     v-permission="permissions.advertising_setinventory"
                     split-button
                     type="success"
                     trigger="click"
                     @command="stock"
        >
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
        <el-dropdown v-if="listQuery.advtStatus === 40"
                     size="mini"
                     v-permission="permissions.advertising_customSetPrice"
                     split-button type="primary"
                     trigger="click"
                     @command="price"
        >
          指定价
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :disabled="this.multipleTable.length === 0" :command="{ fuc: 'setPress', value: multipleTable, type: 'all' }">
              设置指定价
            </el-dropdown-item>
            <el-dropdown-item :disabled="this.multipleTable.length === 0" :command="{ fuc: 'unpricing', value: multipleTable }">
              取消指定价
            </el-dropdown-item>
            <el-dropdown-item :disabled="this.multipleTable.length === 0" :command="{ fuc: 'setGrossMargins', value: multipleTable, type: 'all' }">
              设置毛利率
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
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
        <el-table-column type="expand">
          <template slot="header">
            <svg-icon icon-class="right" />
          </template>
          <template slot-scope="props">
            <el-table v-if="Number(props.row.product_type) === 2" :data="props.row.child" border>
              <el-table-column width="40" align="center">
                <template slot-scope="scope">
                  <el-checkbox @input="smt(props.row)" v-model="scope.row.isSelected" />
                  <span></span>
                </template>
              </el-table-column>
              <el-table-column prop="istore_product_id" label="产品ID" min-width="100" sortable></el-table-column>
              <el-table-column prop="product_name" label="产品名称" min-width="260"></el-table-column>
              <el-table-column v-if="listQuery.advtStatus === 40" prop="custom_price" label="指定价" min-width="80">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_price_icon',scope.row)" @mouseleave="hideEdit('show_price_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position:relative;">
                    <el-input
                      v-if="scope.row.show_price_edit"
                      :ref="'price_input'+ scope.$index"
                      class="input-stock inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_price"
                      @blur="setPress(scope.row, 'single')"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_price }}</span>
                    <i v-show="scope.row.show_price_icon"
                       v-permission="permissions.advertising_customSetPrice"
                       class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:9px;right:-7px;"
                       @click="showEdit('show_price_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_price_edit',scope.row)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="total_price" label="价格"></el-table-column>
              <el-table-column v-if="listQuery.advtStatus === 40" prop="is_custom_price" label="是否指定价" min-width="82">
                <template slot-scope="scope">
                  {{ Number(scope.row.is_custom_price) !== 0 ? '是' : '否' }}
                </template>
              </el-table-column>
              <el-table-column prop="gross_margin" label="毛利率(%)">
                <template slot-scope="scope">
                  <div
                    v-if="listQuery.advtStatus === 40"
                    @mouseenter="showEdit('show_gross_icon',scope.row)"
                    @mouseleave="hideEdit('show_gross_icon',scope.row)"
                    style="width:100%;height:32px;line-height:32px;position: relative;"
                  >
                    <el-input
                      v-if="scope.row.show_gross_edit"
                      :ref="'gross_input'+ scope.$index"
                      class="input-stock inline-edit-input"
                      size="small"
                      v-model="scope.row.gross_margin"
                      @blur="setGrossMargins(scope.row, 'single')"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.gross_margin }}</span>
                    <i v-show="scope.row.show_gross_icon"
                       class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:9px;right:-7px;"
                       @click="showEdit('show_gross_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_gross_edit',scope.row)"
                       v-permission="permissions.advertising_customSetPrice"
                    ></i>
                  </div>
                  <div v-else>{{ scope.row.gross_margin }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="base_price" label="保本价"></el-table-column>
              <el-table-column prop="custom_stock" label="指定库存" min-width="60" v-if="setPriceStatus.includes(listQuery.advtStatus)">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_quantity_icon',scope.row)" @mouseleave="hideEdit('show_quantity_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position:relative;">
                    <el-input
                      v-if="scope.row.show_quantity_edit"
                      :ref="'stock_input'+ scope.$index"
                      class="input-stock inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_stock"
                      @blur="setStock('single',scope.row)"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_stock }}</span>
                    <i v-show="scope.row.show_quantity_icon"
                       class="el-icon-edit"
                       title="编辑"
                       style="color:#409EFF; font-size:20px;top:7px;right:-7px;"
                       @click="showEdit('show_quantity_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_quantity_edit',scope.row)"
                       v-permission="permissions.advertising_setinventory"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="库存" min-width="60"></el-table-column>
              <el-table-column prop="is_custom_stock" label="是否指定库存" width="100" v-if="setPriceStatus.includes(listQuery.advtStatus)">
                <template slot-scope="scope">
                  {{ Number(scope.row.is_custom_stock) === 1 ? '是' : '否' }}
                </template>
              </el-table-column>
              <el-table-column prop="seven_day_sales" label="7天销量"></el-table-column>
              <el-table-column prop="thirty_day_sales" label="30天销量"></el-table-column>
              <el-table-column prop="sixty_day_sales" label="60天销量" width="74"></el-table-column>
            </el-table>
            <el-table v-else :data="props.row.child" border>
              <el-table-column width="40">
                <template slot-scope="scope">
                  <el-checkbox @input="smt(props.row)" v-model="scope.row.isSelected" />
                  <span></span>
                </template>
              </el-table-column>
              <el-table-column prop="istore_product_id" label="产品ID" min-width="100" sortable></el-table-column>
              <el-table-column prop="product_name" label="产品名称" min-width="260"></el-table-column>
              <el-table-column v-if="listQuery.advtStatus === 40" prop="custom_price" label="指定价" min-width="80">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_price_icon',scope.row)" @mouseleave="hideEdit('show_price_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position:relative;">
                    <el-input
                      v-if="scope.row.show_price_edit"
                      :ref="'price_input'+ scope.$index"
                      class="input-stock inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_price"
                      @blur="setPress(scope.row, 'single')"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_price }}</span>
                    <i v-show="scope.row.show_price_icon"
                       v-permission="permissions.advertising_customSetPrice"
                       class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:9px;right:-7px;"
                       @click="showEdit('show_price_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_price_edit',scope.row)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="total_price" label="价格"></el-table-column>
              <el-table-column v-if="listQuery.advtStatus === 40" prop="is_custom_price" label="是否指定价" min-width="82">
                <template slot-scope="scope">
                  {{ Number(scope.row.is_custom_price) !== 0 ? '是' : '否' }}
                </template>
              </el-table-column>
              <el-table-column prop="gross_margin" label="毛利率(%)">
                <template slot-scope="scope">
                  <div
                    v-if="listQuery.advtStatus === 40"
                    @mouseenter="showEdit('show_gross_icon',scope.row)"
                    @mouseleave="hideEdit('show_gross_icon',scope.row)"
                    style="width:100%;height:32px;line-height:32px;position: relative;"
                  >
                    <el-input
                      v-if="scope.row.show_gross_edit"
                      :ref="'gross_input'+ scope.$index"
                      class="input-stock inline-edit-input"
                      size="small"
                      v-model="scope.row.gross_margin"
                      @blur="setGrossMargins(scope.row, 'single')"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.gross_margin }}</span>
                    <i v-show="scope.row.show_gross_icon"
                       class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:9px;right:-7px;"
                       @click="showEdit('show_gross_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_gross_edit',scope.row)"
                       v-permission="permissions.advertising_customSetPrice"
                    ></i>
                  </div>
                  <div v-else>{{ scope.row.gross_margin }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="base_price" label="保本价"></el-table-column>
              <el-table-column prop="custom_stock" label="指定库存" min-width="60" v-if="setPriceStatus.includes(listQuery.advtStatus)">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_quantity_icon',scope.row)" @mouseleave="hideEdit('show_quantity_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position:relative;">
                    <el-input
                      v-if="scope.row.show_quantity_edit"
                      :ref="'stock_input'+ scope.$index"
                      class="input-stock inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_stock"
                      @blur="setStock('single',scope.row)"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_stock }}</span>
                    <i v-show="scope.row.show_quantity_icon"
                       class="el-icon-edit"
                       title="编辑"
                       style="color:#409EFF; font-size:20px;top:7px;right:-7px;"
                       @click="showEdit('show_quantity_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_quantity_edit',scope.row)"
                       v-permission="permissions.advertising_setinventory"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="is_custom_stock" label="是否指定库存" min-width="100" v-if="setPriceStatus.includes(listQuery.advtStatus)">
                <template slot-scope="scope">
                  {{ Number(scope.row.is_custom_stock) === 1 ? '是' : '否' }}
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="库存" width="74"></el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="50" align="center"></el-table-column>
        <el-table-column prop="id" label="ID" width="60" sortable :sort-method="(a,b) => a-b">
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="site_code" label="Site Code" width="120"></el-table-column>
        <el-table-column prop="istore_product_id" label="Product ID" width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.istore_product_id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="parent_sku" label="Group Code" width="90">
          <template slot-scope="scope">
            <span v-if="Number(scope.row.parent_sku) !== 0">{{ scope.row.parent_sku }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="offer_id" label="平台商品号" width="90"></el-table-column>
        <el-table-column prop="product_big_image" label="产品图片" width="70" align="center">
          <template slot-scope="scope">
            <picture-view v-if="scope.row.pathArr && scope.row.pathArr.length > 0 && checkPickShow"
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
        <el-table-column prop="product_name" label="名称" min-width="260">
          <template slot-scope="scope">
            <a v-if="Number(listQuery.advtStatus) === 40 && scope.row.istore_product_id"
               :href="`https://www.rueducommerce.fr/marchand/magideal?sort=ventes&text_filter=${scope.row.istore_product_id}`"
               target="_blank"
               style="color: rgb(64, 158, 255);"
            >
              {{ scope.row.product_name }}
            </a>
            <span v-else>{{ scope.row.product_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="product_type" label="类型" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.product_type === 1 ? 'success' : ''" size="small">{{ scope.row.product_type | getTypeLabel(rueduAdvtTypes) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="product_line_id" label="产品线" width="70">
          <template slot-scope="scope">
            {{ productLineData[scope.row.product_line_id] || '' }}
          </template>
        </el-table-column>
        <el-table-column prop="seven_day_sales" label="7天销量" width="70"></el-table-column>
        <el-table-column prop="thirty_day_sales" label="30天销量" width="70"></el-table-column>
        <el-table-column prop="sixty_day_sales" label="60天销量" width="70"></el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="85" sort-by="create_time" sortable :sort-method="(a,b) => a-b">
          <template slot-scope="scope">{{ scope.row.create_time }}</template>
        </el-table-column>
        <el-table-column label="操作" width="90" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openLog(scope.row)" v-permission="permissions.advertising_SeeTheLog">日志</el-button>
            <el-button type="text"
                       size="mini"
                       v-permission="permissions.advertising_ViewTheAD"
                       @click="openTheNewTAB('ruedu.advertising.detail', { id: scope.row.id, status: scope.row.status })"
            >
              详情
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
    <!-- istore更新日志 -->
    <istore-log v-bind.sync="logOptions"></istore-log>
  </div>
</template>
<script>
import { toBoolean, filterQueryParams } from '@/utils/help'
import { fetchList, getSelectAll, updateCustomerPrice, setCustomStock } from '@/api/ruedu'
import PictureView from 'vue-simple-picture-preview'
import setGrossMargins from './components/setGrossMargins'
import setPrice from './components/setPrice'
import istoreLog from './components/istoreLog'
import { alertMessage } from './common'

export default {
  name: 'Advertising',
  components: { PictureView, setGrossMargins, setPrice, istoreLog },
  data() {
    return {
      // 30 == syncing 40 == activing
      setPriceStatus: [30, 40],
      title: '类型 ',
      filter: 'filter',
      checked: true,
      newDate: new Date().getTime(),
      isDisable: false,
      options: [],
      esAdvtStatus: [],
      rueduAdvtTypes: [
        { key: 1, label: 'Normal' },
        { key: 2, label: 'Variation' }
      ],
      expand: true,
      listLoading: true,
      listTotal: null,
      listData: [],
      statusMap: {
        push_fail: 'push_fail',
        prohibited_words: 'prohibited_words'
      },
      permissions: {
        advertising_setinventory: 'rueducommerce.advt.custom.custom-stock',//设置库存
        advertising_customSetPrice: 'rueducommerce.advt.custom.custom-price',//设置指定价/毛利率
        advertising_SeeTheLog: 'rueducommerce.advt.logs.change-log',//查看日志
        advertising_ViewTheAD: 'rueducommerce.advt.advt.info'//查看广告详情

      },
      listQuery: {
        page: 1,
        per_page: 20,
        accountId: undefined,
        istore_product_id: undefined,
        parent_sku: undefined,
        offer_id: undefined,
        productLine: undefined,
        product_type: [],
        advtStatus: 40,
        advtCreated: [],
        active: undefined,
        is_custom_price: undefined,
        is_custom_stock: undefined,
        sales_count: undefined
      },
      pagination: null,
      multipleTable: [],
      statusTags: [],
      currentRow: null,
      checkPickShow: true,
      checkNum: 0,
      mulOptions: [],
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
      productLineData: {},
      logOptions: {
        open: false,
        advtId: '',
        isVary: false,
        operateTypeArr: []
      }
    }
  },
  created() {
    const arr = ['rueduAccounts', 'productLine', 'rueduChangeLogOptions']
    getSelectAll(arr).then(res => {
      this.mulOptions = res.data
    })
    this.renderList()
  },
  methods: {
    // 日志
    openLog(row) {
      this.logOptions = {
        open: true,
        advtId: row.id,
        isVary: Number(row.type) === 2,
        operateTypeArr: this.mulOptions.rueduChangeLogOptions
      }
    },
    openMoreTab() {
      const detailsId = this.multipleTable.map(v => {
        return { id: v.id, status: v.status }
      })
      detailsId.map(v => {
        window.open(`/ruedu/advertising/detail/${v.id}/${v.status}`)
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
        params: params
      })
      window.open(href, '_blank')
    },
    smt(row) {
      const check = this._.some(row.child, (v, i) => {
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
      this.listQuery.istore_product_id = this._.trim(this.listQuery.istore_product_id)
      this.listQuery.offer_id = this._.trim(this.listQuery.offer_id)
      this.listQuery.parent_sku = this._.trim(this.listQuery.parent_sku)
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
      fetchList(Object.assign(queryParams, { not_show_message: true })).then(response => {
        this.productLineData = response.data.item_line
        this.listData = response.data.list
        this.pagination = response.data.pagination
        this.esAdvtStatus = response.data.statistics
        this._.forEach(this.listData, (v) => {
          // 图片缩略图
          v.pathArr = []
          if (v.product_big_image) {
            v.pathArr.push({
              original: v.product_big_image,
              thumbnail: v.product_image
            })
          }
          // 子产品回填
          v.child = [{
            ...v,
            isSelected: false,
            show_quantity_edit: false,
            show_quantity_icon: false,
            show_price_icon: false,
            show_price_edit: false,
            show_gross_icon: false,
            show_gross_edit: false,
            virtual_gross_margin: v.gross_margin,
            virtual_custom_price: v.custom_price,
            virtual_custom_stock: v.custom_stock
          }]
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
      this.$refs.listQuery.resetFields()
      this.newDate = new Date().getTime()
      this.filter = 'filter'
      this.renderList()
    },
    changeStatus(key) {
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
    handleSelectionChange(val) {
      this._.forEach(this.listData, (v) => {
        this._.forEach(v.child, (v2) => {
          v2.isSelected = false
        })
      })
      this._.forEach(val, (v) => {
        this._.forEach(v.child, (v2) => {
          v2.isSelected = true
        })
      })
      this.multipleTable = val
    },
    handleSelectionRow(val, row) {
      const check = this._.some(row.child, (v, i) => {
        return v.isSelected
      })
      if (check) {
        this._.forEach(row.child, v => {
          v.isSelected = false
        })
      } else {
        this._.forEach(row.child, v => {
          v.isSelected = true
        })
      }
    },
    // 断开链接
    // notLink(row) {
    //   const obj = {
    //     account_id: row.account_id,
    //     sku: row.istore_product_id
    //   }
    //   this.$confirm('确定断开链接吗？', '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).then(() => {
    //     this.listLoading = false
    //     disConnect(obj).then((res) => {
    //       if (res.code === 200) {
    //         this.$message({
    //           type: 'success',
    //           message: res.message
    //         })
    //       } else {
    //         this.$message({
    //           type: 'info',
    //           message: res.message
    //         })
    //       }
    //       this.renderList()
    //     })
    //   }).catch(() => {
    //     this.listLoading = false
    //   })
    // },
    // 表格类型筛选
    filterType(value, row) {
      return row.product_type === value
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
      if (type.product_type.length === 0) {
        this.filter = 'filter'
        document.querySelector(' .el-table th>.cell>span>svg').style.color = '#c0c4cc'
      } else {
        this.filter = 'filter-in'
        document.querySelector(' .el-table th>.cell.highlight>span>svg').style.color = '#f00'
      }
    },
    // site code多选框
    selectAccount(arr) {
      this.listQuery.accountId = arr
    },
    cleanSelect() {
      this.$refs['listQuery'].resetFields()
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
        this.unpricing()
      } else if (command.fuc === 'setGrossMargins') {
        this.setGrossMargins(command.value, command.type)
      } else {
        return
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
          this._.forEach(v.child, (val) => {
            if (val.isSelected === true) {
              status.push(val.is_custom_price)
              ids.push(val.id)
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
            product_ids: data.id,
            custom_price: data.custom_price,
            is_custom_price: 1,
            not_show_message: true
          }
          updateCustomerPrice(obj).then((res) => {
            this.renderList()
            alertMessage(res)
          }).catch(err => {
            this.$messaage.error(err)
          })
        } else {
          data.custom_price = data.virtual_custom_price
        }
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
          this._.forEach(v.child, (val) => {
            if (val.isSelected === true) {
              advIds.push(val.id)
            }
          })
        })
        const obj = {
          product_ids: this._.compact(advIds).join(','),
          is_custom_price: 0,
          custom_price: 0
        }
        this.listLoading = true
        updateCustomerPrice(obj).then(res => {
          this.renderList()
        }).catch(err => {
          this.listLoading = false
          this.$message.error(err)
        })
      }).catch(() => {
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
      const reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,2}?$/
      if (!reg.test(value)) {
        this.$message.error('存在非法字符')
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
        this._.forEach(this.multipleTable, (v) => {
          this._.forEach(v.child, (val) => {
            if (val.isSelected === true) {
              status.push(val.is_custom_price)
              ids.push(val.id)
            }
          })
        })
        this.setGrossMarginOption = {
          open: true,
          advtIds: ids,
          gross_margin: ''
        }
      } else {
        if (this.checkGross(data.gross_margin)) {
          const obj = {
            custom_price: data.gross_margin,
            product_ids: data.id,
            is_custom_price: 2,
            not_show_message: true
          }
          updateCustomerPrice(obj).then((res) => {
            this.renderList()
            alertMessage(res)
          }).catch(err => {
            this.$message.error(err)
          })
        } else {
          data.gross_margin = data.virtual_gross_margin
        }
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
      // 要设置库存的child id
      const ids = []
      // input设置/批量设置
      if (type === 'single') {
        if (this.checkStock(row.custom_stock)) {
          // this.listLoading = true
          ids.push(row.id)
          // 调用接口设置，设置成功 是否指定库存显示为 是
          this.listLoading = true
          setCustomStock({ product_ids: ids.join(','), custom_stock: row.custom_stock, is_custom_stock: 1 }).then(() => {
            this.renderList()
          }).catch((err) => {
            row.custom_stock = row.virtual_custom_stock
            this.$message.error(err)
          }).finally(() => {
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
              v.child.forEach(k => {
                if (k.isSelected) {
                  ids.push(k.id)
                }
              })
            })
            this.listLoading = true
            setCustomStock({ product_ids: ids.join(','), custom_stock: value, is_custom_stock: 1 }).then(() => {
              this.renderList()
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
      const ids = []
      this.listLoading = true
      this.multipleTable.forEach(v => {
        v.child.forEach(k => {
          if (k.isSelected) {
            ids.push(k.id)
          }
        })
      })
      this.listLoading = true
      // 调用取消接口
      setCustomStock({ product_ids: ids.join(','), is_custom_stock: 0, custom_stock: 0 }).then((res) => {
        this.renderList()
      }).catch(err => {
        this.$message.error(err)
      }).finally(() => {
        this.listLoading = false
      })
    },
    showEdit(type, row, index) {
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
          this.$refs[focus_target + index].$el.firstElementChild.focus()
        })
      }
    },
    hideEdit(type, row) {
      row[type] = false
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

.product-name {
  word-break: keep-all;
}
</style>
