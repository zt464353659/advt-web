<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="Site Code" prop="accountId">
          <multiple-select-account
            ref="multipleSelectAccount"
            :options="options.allegroAdvtAccount"
            @select-account="selectAccount"
            @clean-select="cleanSelect"
            style="width: 240px"
          ></multiple-select-account>
        </el-form-item>
        <el-form-item label="Product ID" prop="advtProductIds">
          <el-input v-model="listQuery.advtProductIds" clearable placeholder="多个请用空格分隔" style="width: 150px;"></el-input>
        </el-form-item>
        <el-form-item label="平台商品号" prop="spu_id">
          <el-input v-model="listQuery.spu_id" clearable placeholder="多个请用空格分隔" style="width: 150px;"></el-input>
        </el-form-item>
        <el-form-item v-if="options.allegroAdvtTypes" label="广告类型" prop="advtType">
          <el-checkbox-group v-model="listQuery.advtType">
            <el-checkbox-button v-for="advtType in options.allegroAdvtTypes" :label="advtType.key" :key="advtType.key">{{ advtType.label }}</el-checkbox-button>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="产品线" prop="productLine">
          <el-select v-model="listQuery.productLine" size="mini" placeholder="请选择" clearable filterable>
            <el-option
              v-for="i in options.allegroProductLine"
              :key="i.id"
              :label="i.name"
              :value="i.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间" prop="advtCreated">
          <el-date-picker
            v-model="listQuery.advtCreated"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss" style="width: 300px"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item v-if="listQuery.advtStatus === 110" label="价格类型" prop="price_type">
          <el-select v-model="listQuery.price_type" clearable placeholder="请选择" style="width: 120px;">
            <el-option label="iStore价格" value="10"></el-option>
            <el-option label="动态调整价" value="20"></el-option>
            <el-option label="指定价" value="30"></el-option>
            <el-option label="指定毛利率" value="40"></el-option>
            <el-option label="跟卖价" value="50"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="setPriceStatus.includes(listQuery.advtStatus)" label="是否指定库存" prop="custom_stock_type">
          <el-select v-model="listQuery.custom_stock_type" clearable placeholder="请选择" style="width: 120px;">
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
    <div v-if="options.esAdvtStatus" class="header-box">
      <el-row class="left-row">
        <el-tag v-for="(status, i) in options.esAdvtStatus" :key="i" :type="statusSelected(status.key)" size="medium">
          <span @click="changeStatus(status.key)">{{ status.label }} ({{ status.total }})</span>
        </el-tag>
      </el-row>
      <el-row class="right-row">
        <el-button type="info" size="mini" @click="openMoreTab" :disabled="multipleTable.length === 0" v-permission="permissions.advertising_ViewTheAD">批量打开广告详情页</el-button>
        <el-dropdown size="mini" v-if="setPriceStatus.includes(listQuery.advtStatus)" v-permission="permissions.advertising_setinventory" split-button type="success" trigger="click" @command="stock">
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
        <el-dropdown v-if="listQuery.advtStatus === 110" size="mini" v-permission="[permissions.advertising_customSetPrice,permissions.advertising_customCancelStock]" split-button type="primary"
                     trigger="click" @command="price"
        >
          指定价
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-permission="permissions.advertising_customSetPrice" :disabled="this.setPriceArr.length === 0" :command="{ fuc: 'setPress', value: setPriceArr, type: 'all' }">
              设置指定价
            </el-dropdown-item>
            <el-dropdown-item v-permission="permissions.advertising_customCancelStock" :disabled="this.setPriceArr.length === 0" :command="{ fuc: 'unpricing', value: setPriceArr }">
              取消指定价
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown v-if="listQuery.advtStatus === 110" size="mini" v-permission="[permissions.advertising_customGrossmArgin,permissions.advertising_cancelCustomGrossMargin]" split-button
                     type="primary" trigger="click" @command="grossMargins"
        >
          指定毛利率
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-permission="permissions.advertising_customGrossmArgin" :disabled="this.setPriceArr.length === 0" :command="{ fuc: 'setGrossMargins', value: setPriceArr, type: 'all' }">
              设置指定毛利率
            </el-dropdown-item>
            <el-dropdown-item v-permission="permissions.advertising_cancelCustomGrossMargin" :disabled="setPriceArr.length === 0" :command="{ fuc: 'cancelGrossMargins', value: setPriceArr }">
              取消指定毛利率
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button v-if="statusMap.showEndBtn.includes(listQuery.advtStatus)"
                   type="danger"
                   size="mini"
                   v-permission="permissions.advertising_delete"
                   @click="handleEnd(parentSelectedChild)"
                   :disabled="setPriceArr.length === 0"
        >
          批量END
        </el-button>
        <el-button v-if="[130,230].includes(listQuery.advtStatus)"
                   type="danger"
                   size="mini"
                   v-permission="permissions.advertising_relisting"
                   @click="relist('all',multipleTable)"
                   :disabled="multipleTable.length === 0"
        >
          批量relist
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
                @sort-change="tableResortEvent"
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
                  <el-checkbox @input="selectChange(props.row)" v-model="scope.row.isSelected" />
                </template>
              </el-table-column>
              <el-table-column prop="istore_product_id" label="产品ID" width="75" sortable></el-table-column>
              <el-table-column prop="spu_id" label="平台商品号" width="90"></el-table-column>
              <el-table-column prop="base_price" label="保本价" width="60"></el-table-column>
              <el-table-column prop="discount_price" label="iStore价格" align="center" width="90"></el-table-column>
              <el-table-column prop="gross_margin" label="iStore毛利率(%)" width="110">
                <template slot-scope="scope">
                  <div v-if="setPriceStatus.includes(listQuery.advtStatus)" @click="setGrossMargins(scope.row, '2')">{{ scope.row.gross_margin }}</div>
                  <div v-else>{{ scope.row.gross_margin }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="current_price" label="当前售价" align="center" width="65"></el-table-column>
              <el-table-column prop="current_gross_margin" label="当前毛利率(%)" align="center" width="110"></el-table-column>
              <el-table-column prop="custom_price_type" label="价格类型" width="70" v-if="listQuery.advtStatus === 110">
                <template slot-scope="scope">
                  <span v-if="scope.row.price_type === 50">跟卖价</span>
                  <span v-if="scope.row.price_type === 40">指定毛利率</span>
                  <span v-if="scope.row.price_type === 30">指定价</span>
                  <span v-if="scope.row.price_type === 20">动态调整价</span>
                  <span v-if="scope.row.price_type === 10">iStore价格</span>
                </template>
              </el-table-column>
              <el-table-column prop="custom_price" label="指定价" width="60" v-if="listQuery.advtStatus === 110">
                <template slot-scope="scope">
                  <!-- <div @click="setPress(scope.row, 'single')">{{ scope.row.custom_price }}</div> -->
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
                       v-permission="permissions.advertising_customSetPrice"
                       class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:9px;right:-7px;"
                       @click="showEdit('show_price_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_price_edit',scope.row)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="custom_gross_margin" label="指定毛利率(%)" width="110" align="center">
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
              <el-table-column prop="custom_stock" label="指定库存" width="65" v-if="setPriceStatus.includes(listQuery.advtStatus)" min-width="60">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_quantity_icon',scope.row)" @mouseleave="hideEdit('show_quantity_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position:relative;">
                    <el-input
                      v-if="scope.row.show_quantity_edit"
                      :ref="'input'+ scope.$index"
                      class="input-stock inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_stock"
                      @blur="setStock('single',scope.row)"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_stock }}</span>
                    <i
                      v-permission="permissions.advertising_setinventory"
                      v-show="scope.row.show_quantity_icon"
                      class="el-icon-edit" title="编辑"
                      style="color:#409EFF; font-size:20px;top:13px;"
                      @click="showEdit('show_quantity_edit',scope.row, scope.$index)"
                      @blur="hideEdit('show_quantity_edit',scope.row)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="库存" width="60"></el-table-column>
              <el-table-column prop="custom_stock_type" label="是否指定库存" v-if="setPriceStatus.includes(listQuery.advtStatus)" width="90">
                <template slot-scope="scope">
                  {{ Number(scope.row.custom_stock_type) === 1 ? '是' : '否' }}
                </template>
              </el-table-column>
              <el-table-column prop="sales_7_days" width="60" label="7天销量" v-if="Number(props.row.type) === 2"></el-table-column>
              <el-table-column prop="sales_30_days" width="65" label="30天销量" v-if="Number(props.row.type) === 2"></el-table-column>
              <el-table-column prop="sales_60_days" width="65" label="60天销量" v-if="Number(props.row.type) === 2"></el-table-column>
              <el-table-column prop="status_label" label="状态" min-width="60"></el-table-column>
              <el-table-column label="操作" width="99" align="center" fixed="right">
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    size="mini"
                    v-permission="permissions.advertising_delete"
                    @click="handleEnd([scope.row.id], 'isChild')"
                    v-if="statusMap.showEndBtn.includes(listQuery.advtStatus) && statusMap.showEndBtnChild.includes(scope.row.status_label)"
                  >
                    END
                  </el-button>
                  <el-button
                    type="text"
                    size="mini"
                    v-permission="permissions.advertising_relisting"
                    @click="relist('sub',scope.row)"
                    v-if="[130,230].includes(listQuery.advtStatus)"
                  >
                    relist
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column v-if="statusMap.showFailed.includes(listQuery.advtStatus)" prop="push_fail_msg" label="失败原因" min-width="100"></el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="40" align="center"></el-table-column>
        <el-table-column prop="id" label="ID" width="75" sortable :sort-method="(a,b) => a-b">
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="site_code" label="Site Code" width="75"></el-table-column>
        <el-table-column prop="istore_product_id" label="Product ID" width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.istore_product_id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="product_image" label="产品图片" width="70" align="center">
          <template slot-scope="scope">
            <picture-view v-if="scope.row.pathArr.length > 0 && checkPickShow" :pictureList="scope.row.pathArr" :width="50" :height="50" :thumbnail="false" :defaultProps="defaultProps"></picture-view>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="260">
          <template v-slot="scope">
            <a v-if="statusMap.showTitleLink.includes(listQuery.advtStatus)" v-html="scope.row.name" style="color: #409EFF;word-break: keep-all" :href="scope.row.advt_url" target="_blank"></a>
            <span style="word-break: keep-all;" v-else v-html="scope.row.name"></span>
          </template>
        </el-table-column>
        <el-table-column prop="type"
                         align="center"
                         :render-header="renderHeader"
                         column-key="type"
                         width="70"
                         :filters="[{ text: 'Normal', value: '1' }, { text: 'Variation', value: '2' }]"
                         :filter-method="filterType"
                         filter-placement="bottom-start"
        >
          <template slot-scope="scope">
            <el-tag :type="Number(scope.row.type) === 1 ? 'success' : ''" size="small">{{ scope.row.type | getTypeLabel(options) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="product_line_name" label="产品线" width="80"></el-table-column>
        <el-table-column prop="sales_7_days" label="7天销量" width="60"></el-table-column>
        <el-table-column prop="sales_30_days" label="30天销量" width="65"></el-table-column>
        <el-table-column prop="sales_60_days" label="60天销量" width="65"></el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="86" sort-by="create_time" sortable>
          <template slot-scope="scope">{{ scope.row.create_time }}</template>
        </el-table-column>
        <el-table-column label="操作" width="115" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openIstoreLogs(scope.row)" v-permission="permissions.advertising_SeeTheLog">日志</el-button>
            <el-button type="text" size="mini"
                       v-permission="permissions.advertising_ViewTheAD"
                       @click="openTheNewTAB('allegro.advertising.detail', { id: scope.row.id, status: listQuery.advtStatus })"
            >
              详情
            </el-button>
            <el-button type="text" size="mini" v-permission="permissions.advertising_delete" @click="handleEnd([scope.row.id])"
                       v-if="statusMap.showEndBtn.includes(listQuery.advtStatus) && scope.row.showEndBtn"
            >
              END
            </el-button>
            <el-button
              type="text"
              size="mini"
              v-permission="permissions.advertising_relisting"
              @click="relist('father',scope.row)"
              v-if="[130,230].includes(listQuery.advtStatus)"
            >
              relist
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
import { filterQueryParams } from '@/utils/help'
import { PostRelist, apiGetSelectAll, apiFetchList, apiEndAdvt, setCustomStock, updateCustomerPrice, cancelCustomerPrice, setCustomGrossMargin, cancelCustomGrossMargin } from '@/api/allegro'
import { resultAlert } from '@/utils/index'
import setGrossMargins from './components/setGrossMargins'
import setPrice from './components/setPrice'
import istoreLog from './components/istoreLog'
import multipleSelectAccount from './components/multipleSelectAccount'

export default {
  name: 'Advertising',
  components: { setGrossMargins, setPrice, istoreLog, multipleSelectAccount },
  data() {
    return {
      hasActiveInput: false,
      // 线上状态 110 == Normal 140 == Stay deleted 220 == Shortage 150 == PublishFail
      setPriceStatus: [110, 140, 220, 150],
      title: '类型 ',
      filter: 'filter',
      newDate: new Date().getTime(),
      isDisable: false,
      options: [],
      expand: true,
      listLoading: true,
      listData: [],
      statusMap: {
        push_fail: 'push_fail',
        prohibited_words: 'prohibited_words',
        showFailed: [150], // 失败原因
        showTitleLink: [110],
        showEndBtn: [110], // 展示 end 按钮的状态
        showEndBtnChild: ['active', 'sketch', 'publishing', 'pending', 'upload error'] // 展示 end 状态的子产品
      },
      permissions: {
        advertising_setinventory: 'allegro.advt.custom-information.custom-stock',//设置库存
        // advertising_cancelinventory: 'allegro.advt.custom-quantity.cancel',//取消库存
        advertising_customSetPrice: 'allegro.advt.custom-information.custom-price',//设置指定价
        advertising_customCancelStock: 'allegro.advt.custom-information.cancel-custom-price',//取消指定价
        advertising_customGrossmArgin: 'allegro.advt.custom-information.custom-gross-margin',//设置指定毛利率
        advertising_cancelCustomGrossMargin: 'allegro.advt.custom-information.custom-gross-margin',//取消指定毛利率
        advertising_SeeTheLog: 'allegro.advt.logs.change-log',//查看日志
        advertising_ViewTheAD: 'allegro.advt.advt.info',//查看广告详情
        advertising_delete: 'allegro.advt.mgr-advt.end',//下架
        advertising_relisting: 'allegro.advt.advt.relisting'//relist重新推送
      },
      listQuery: {
        price_type: undefined,
        page: 1,
        per_page: 20,
        accountId: [],
        advtProductIds: undefined,
        advtSpuId: undefined,
        advtType: [],
        advtStatus: 110,
        advtCreated: [],
        custom_price_type: undefined,
        custom_stock_type: undefined,
        productLine: undefined,
        sales_count: undefined,
        spu_id: undefined
      },
      pagination: null,
      multipleTable: [],
      currentRow: null,
      checkPickShow: true,
      sorting: {},
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
        advtId: '',
        isVary: 1,
        operateTypeArr:[]
      }
    }
  },
  created() {
    const optionsParams = ['allegroAdvtAccount', 'allegroAdvtTypes', 'allegroProductLine', 'allegroChangeLogOptions']
    apiGetSelectAll(optionsParams).then(response => {
      this.options = response.data
      this._.forEach(this.options.allegroAdvtShopAccount, (v, i) => {
        v.value = i
        this._.forEach(v.children, v1 => {
          v1.label = v1.site_code
          v1.value = v1.id
        })
      })
    })
    this.renderList()
  },
  computed: {
    setPriceArr() {
      const arr = []
      this._.forEach(this.multipleTable, (v) => {
        arr.push(v)
      })
      return arr
    },
    // 父产品为选中状态的所有子产品
    parentSelectedChild() {
      const arr = []
      this._.forEach(this.multipleTable, (v) => {
        arr.push(v.id)
      })
      return arr
    }
  },
  methods: {
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
    openMoreTab() {
      const detailsId = this.multipleTable.map(v => {
        return { id: v.id, status: v.status }
      })
      detailsId.map(v => {
        window.open(`/allegro/advertising/detail/${v.id}/${v.status}`)
      })
    },
    openIstoreLogs(row) {
      this.logOptions = {
        open: true,
        advtId: row.id,
        isVary: row.type,
        operateTypeArr: this.options.allegroChangeLogOptions
      }
    },
    cloneDeep(param, val) {
      const data = this._.cloneDeep(this[param])
      this[param] = val
      this[param] = data
    },
    selectionChange(val) {
      this.multipleTable = val
    },
    /* 跳转新标签 */
    openTheNewTAB(name, params) {
      const { href } = this.$router.resolve({
        name: name,
        params: params
      })
      window.open(href, '_blank')
    },
    selectChange(row) {
      const check = this._.some(row.child_product, (v, i) => {
        return v.isSelected
      })
      if (check) {
        this.$refs.table.toggleRowSelection(row, true)
      } else {
        this.$refs.table.toggleRowSelection(row, false)
      }
    },
    renderList(val) {
      this.listData = []
      this.listLoading = true
      this.listQuery.advtProductIds = this._.trim(this.listQuery.advtProductIds)
      this.listQuery.spu_id = this._.trim(this.listQuery.spu_id)
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
      apiFetchList(queryParams).then(response => {
        this.listData = response.data.list
        this.pagination = response.data.pagination
        this.options.esAdvtStatus = response.data.statistics
        this._.forEach(this.listData, v => {
          // 图片缩略图
          v.pathArr = []
          v.pathArr.push({
            original: v.product_image,
            thumbnail: v.thumb_image_path || v.product_image
          })
          this._.forEach(v.child_product, (val) => {
            val.isSelected = false
            val.virtual_gross_margin = val.gross_margin
            val.virtual_custom_price = val.custom_price
            val.virtual_custom_stock = val.custom_stock
            val.show_quantity_edit = false
            val.show_quantity_icon = false
            val.show_price_icon = false
            val.show_price_edit = false
            val.show_gross_icon = false
            val.show_gross_edit = false
          })
          v.showEndBtn = this._.some(v.child_product, v1 => this.statusMap.showEndBtnChild.includes(v1.status_label))
        })
        this.checkPickShow = false
        this.$nextTick(() => {
          this.checkPickShow = true
        })
        this.cloneDeep('listData', [])
        document.querySelector('.el-table__body-wrapper').scrollTop = 0
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleFilter() {
      if ((this.listQuery.advtProductIds && this.listQuery.advtProductIds.trim())) {
        const advtIdStr = this.listQuery.advtProductIds.trim().replace(/\s+/g, ',')
        const productIdArr = advtIdStr.split(',')
        if (productIdArr.length > 10) {
          this.$message.error('最多输入10个 Product ID')
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
      this.$refs['multipleSelectAccount'].handleCancelAllUser()
      this.$refs.listQuery.resetFields()
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
    // 表格类型筛选
    filterType(value, row) {
      return row.type === value
    },
    // 清理缩略图缓存
    tableResortEvent(param) {
      this.checkPickShow = false
      this.$nextTick(() => {
        this.checkPickShow = true
      })
      // this.sorting = param
      // this.renderList(this.sorting)
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
    // site code多选框
    selectAccount(arr) {
      console.log(arr)
      this.listQuery.accountId = arr
    },
    cleanSelect() {
      this.listQuery.accountId = []
    },
    relist(type, row) {
      const ids = []
      this.$confirm('是否要 relist 此产品', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (type === 'sub') {
          ids.push(row.id)
        } else if (type === 'father') {
          row.child_product.forEach((item) => {
            ids.push(item.id)
          })
        } else if (type === 'all') {
          this.multipleTable.forEach(v => {
            v.child_product.forEach(k => {
              if (k.isSelected) {
                ids.push(k.id)
              }
            })
          })
        }
        PostRelist({ 'product_id': ids }).then((res) => {
        }).finally(() => {
          this.renderList()
        })
      }).catch(() => {
      })
    },
    handleEnd(data, type) {
      this.$confirm('是否要 END 此产品', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const obj = type === 'isChild' ? { productIds: data } : { advtIds: data }
        apiEndAdvt(obj).then(res => {
          this.renderList()
        })
      }).catch(() => {
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
      let ids = []
      let custom_price = ''
      this.isDisable = true
      if (type === 'all') {
        const status = []
        this._.forEach(this.setPriceArr, (v) => {
          this._.forEach(v.child_product, (val) => {
            if (val.isSelected === true) {
              status.push(val.custom_price_type)
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
    unpricing() {
      const advIds = []
      this.$confirm('您确定要取消指定价吗？', '提示', {
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
          product_ids: this._.compact(advIds).join(','),
          not_show_message: true
        }
        this.listLoading = true
        cancelCustomerPrice(obj).then(res => {
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
        if (this.checkGross(data.custom_gross_margin)) {
          const obj = {
            product_ids: data.id,
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
        this._.forEach(this.setPriceArr, (v) => {
          this._.forEach(v.child_product, (val) => {
            if (val.isSelected === true) {
              advIds.push(val.id)
            }
          })
        })
        const obj = {
          product_ids: this._.compact(advIds).join(','),
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
    // 检测毛利率
    checkGross(value) {
      const reg = /^\d\.([1-9]{1,2}|[0-9][1-9])$|^[1-9]\d{0,1}(\.\d{1,2}){0,1}$|^100(\.0{1,2}){0,1}$/
      if (!reg.test(value)) {
        this.$message.error('毛利率必须是0-100之间的数字')
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
          ids.push(row.id)
          // 调用接口设置，设置成功 是否指定库存显示为 是
          this.listLoading = true
          setCustomStock({ product_ids: ids.join(','), custom_stock: row.custom_stock, custom_stock_type: 1 }).then(() => {
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
              v.child_product.forEach(k => {
                if (k.isSelected) {
                  ids.push(k.id)
                }
              })
            })
            this.listLoading = true
            setCustomStock({ product_ids: ids.join(','), custom_stock: value, custom_stock_type: 1 }).then(() => {
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
        v.child_product.forEach(k => {
          if (k.isSelected) {
            ids.push(k.id)
          }
        })
      })
      this.listLoading = true
      // 调用取消接口
      setCustomStock({ product_ids: ids.join(','), custom_stock_type: 0 }).then((res) => {
        this.renderList()
      }).catch(err => {
        this.$message.error(err)
      }).finally(() => {
        this.listLoading = false
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
  filters: {
    getTypeLabel(val, options) {
      const types = options.allegroAdvtTypes
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
          if (val) {
            document.querySelector('.el-table th>.cell > svg').style.transform = 'rotate(90deg)'
          } else {
            document.querySelector('.el-table th>.cell > svg').style.transform = 'rotate(0deg)'
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
  /*transform: rotate(90deg);*/
  transition: linear .5s;
  cursor: pointer;
}
</style>
