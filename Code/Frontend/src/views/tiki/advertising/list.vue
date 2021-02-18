<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="Site Code" prop="account_id">
          <multiple-select-account ref="multipleSelectAccount" v-bind.sync="multipleSelectAccountOption" @select-account="selectAccount" @clean-select="cleanSelect"></multiple-select-account>
        </el-form-item>
        <!--<el-form-item label="产品线" prop="product_line_id">-->
        <!--<el-select v-model="listQuery.product_line_id" clearable placeholder="请选择" style="width: 150px;">-->
        <!--<el-option v-for="item in options.TikiProductLine" :key="item.id" :label="item.name" :value="item.id"></el-option>-->
        <!--</el-select>-->
        <!--</el-form-item>-->
        <el-form-item label="Product ID" prop="advtProductIds">
          <el-input v-model="listQuery.advtProductIds" clearable placeholder="多个请用空格分隔" style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item label="广告类型" prop="advtType">
          <el-checkbox-group v-model="listQuery.advtType">
            <el-checkbox-button v-for="types in options.TikiAdvtTypes" :label="types.key" :key="types.key">{{ types.label }}</el-checkbox-button>
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
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="是否指定库存" prop="is_custom_quantity">
          <el-select v-model="listQuery.is_custom_quantity" clearable placeholder="请选择" style="width: 120px;">
            <el-option label="是" value="1"></el-option>
            <el-option label="否" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品线" prop="product_line_id">
          <el-select v-model="listQuery.product_line_id" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="item in options.TikiProductLine" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="价格类型" prop="price_type">
          <el-select v-model="listQuery.price_type" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="item in priceTypeArr" :key="item.id" :label="item.label" :value="item.value"></el-option>
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
        <el-button type="primary" size="mini" @click="openMoreTab" :disabled="multipleTable.length === 0">批量打开广告详情页</el-button>
        <el-dropdown v-if="[130,140].includes(listQuery.advtStatus)"
                     v-permission="[permissions.advertising_setinventory,permissions.advertising_cancelinventory]"
                     size="mini"
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
        <el-dropdown v-if="[130,140].includes(listQuery.advtStatus)"
                     v-permission="[permissions.advertising_customSetPrice,permissions.advertising_customCancelStock]" size="mini" split-button
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
        <el-dropdown v-if="[130,140].includes(listQuery.advtStatus)" v-permission="[permissions.advertising_customSetPrice,permissions.advertising_customCancelStock]" size="mini" split-button
                     type="primary" trigger="click"
                     @command="margin"
        >
          指定毛利率
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-permission="permissions.advertising_customSetPrice"
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
        <el-button v-if="[130,140].includes(listQuery.advtStatus)" type="danger" size="mini" @click="soldOut('more')" v-permission="permissions.advertising_delete" :disabled="!multipleTable.length">
          批量下架
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
                @select-all="handleSelectionChange"
                @select="handleSelectionRow"
                @selection-change="selectionChange"
                @sort-change="tableResortEvent"
                :default-expand-all="expand"
                @header-click="handleExpand"
      >
        <el-table-column type="expand" width="40">
          <template slot="header">
            <svg-icon icon-class="right" />
          </template>
          <template slot-scope="props">
            <el-table :data="props.row.child_product" border>
              <el-table-column align="center" width="25" v-if="[130,140].includes(listQuery.advtStatus)">
                <template slot-scope="scope">
                  <el-checkbox @input="selectChange(props.row)" v-model="scope.row.isSelected" />
                </template>
              </el-table-column>
              <el-table-column prop="istore_product_id" label="产品ID" align="center" width="68"></el-table-column>
              <el-table-column prop="msrp" label="吊牌价" align="center" width="63"></el-table-column>
              <el-table-column prop="base_price" label="保本价" align="center" width="76"></el-table-column>
              <el-table-column prop="discount_price" label="iStore价格" align="center" width="80"></el-table-column>
              <el-table-column prop="gross_margin" label="iStore毛利率(%)" align="center" min-width="110"></el-table-column>
              <el-table-column prop="current_price" label="当前销售价" align="center" min-width="80"></el-table-column>
              <el-table-column prop="current_gross_margin" label="当前毛利率(%)" align="center" min-width="100"></el-table-column>
              <el-table-column prop="price_type " label="价格类型" align="center" min-width="80">
                <template slot-scope="scope">
                  {{ getLabelByCode(scope.row.price_type) }}
                </template>
              </el-table-column>
              <el-table-column prop="custom_price" label="指定价" align="center" v-if="[130,140].includes(listQuery.advtStatus)">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_price_icon',scope.row)" @mouseleave="hideEdit('show_price_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position:relative;">
                    <el-input
                      v-if="scope.row.show_price_edit"
                      class="price_input inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_price"
                      @blur="setPress(scope.row, 'single')"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_price }}</span>
                    <i v-show="scope.row.show_price_icon"
                       v-permission="permissions.advertising_customSetPrice"
                       class="el-icon-edit" title="编辑"
                       @click="showEdit('show_price_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_price_edit',scope.row)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="gross_margin" label="指定毛利率(%)" align="center" min-width="100" v-if="[130,140].includes(listQuery.advtStatus)">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_gross_icon',scope.row)" @mouseleave="hideEdit('show_gross_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position: relative;">
                    <el-input
                      v-if="scope.row.show_gross_edit"
                      class="gross_input inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_gross_margin"
                      @blur="handleSetGrossMargins(scope.row, 'single')"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_gross_margin }}</span>
                    <i v-show="scope.row.show_gross_icon"
                       v-permission="permissions.advertising_customSetPrice"
                       class="el-icon-edit" title="编辑"
                       @click="showEdit('show_gross_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_gross_edit',scope.row)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="custom_quantity" label="指定库存" align="center" v-if="[130,140].includes(listQuery.advtStatus)" width="70">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_quantity_icon',scope.row)" @mouseleave="hideEdit('show_quantity_icon',scope.row)" style="width:100%;height:32px;line-height:32px;position:relative;">
                    <el-input
                      v-if="scope.row.show_quantity_edit"
                      class="stock_input inline-edit-input"
                      size="small"
                      v-model="scope.row.custom_quantity"
                      @blur="setStock('single',scope.row)"
                      style="width:85%"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_quantity }}</span>
                    <i v-show="scope.row.show_quantity_icon"
                       v-permission="permissions.advertising_setinventory"
                       class="el-icon-edit"
                       title="编辑"
                       @click="showEdit('show_quantity_edit',scope.row, scope.$index)"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="is_custom_quantity" label="是否指定库存" align="center" v-if="[130,140].includes(listQuery.advtStatus)" width="90">
                <template slot-scope="scope">
                  {{ Number(scope.row.is_custom_quantity) === 1 ? '是' : '否' }}
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="库存" width="60" align="center"></el-table-column>
              <el-table-column label="7天销量" align="center" v-if="props.row.type === 2" prop="sold_quantity_7" width="60"/>
              <el-table-column label="30天销量" align="center" v-if="props.row.type === 2" prop="sold_quantity_30" width="65"/>
              <el-table-column label="60天销量" align="center" v-if="props.row.type === 2" prop="sold_quantity_60" width="65"/>
              <el-table-column prop="status" label="状态" width="114" align="center">
                <template slot-scope="scope">
                  <span v-for="(item, index) in options.esAdvtStatus" :key="index">
                    <span v-if="Number(scope.row.status) === item.key" style="word-break: keep-all;">{{ item.label }}</span>
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" v-if="[140,130].includes(listQuery.advtStatus)" width="114">
                <template slot-scope="scope">
                  <el-button type="text" size="mini"
                             :disabled="![140,130].includes(Number(scope.row.status))"
                             @click="soldOut('child',scope.row)"
                             v-permission="permissions.advertising_delete"
                  >
                    下架
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column align="center" type="selection" width="40"></el-table-column>
        <el-table-column prop="id" align="center" label="ID" width="75" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column prop="site_code" align="center" label="Site Code" width="70"></el-table-column>
        <el-table-column prop="istore_product_id" align="center" label="Product ID" width="75"></el-table-column>
        <el-table-column v-if="isOnLine" prop="spu_id" align="center" label="平台商品号" width="75">
          <template slot-scope="scope">
            {{ showSpu(scope.row) }}
          </template>
        </el-table-column>
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
          <template slot="header" slot-scope="scope">
            <span v-if="scope" style="display:inline-block;text-align:center;width:100%;">产品名称</span>
          </template>
          <template slot-scope="scope">
            <a v-if="isOnLine" style="color: #409EFF;" :href="`https://tiki.vn/product/${scope.row.spu_id}?spid=${scope.row.spu_id}`"
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
        <el-table-column label="产品线" align="center" prop="product_line_name" width="80"/>
        <el-table-column label="7天销量" align="center" prop="sold_quantity_7" width="65"/>
        <el-table-column label="30天销量" align="center" prop="sold_quantity_30" width="70"/>
        <el-table-column label="60天销量" align="center" prop="sold_quantity_60" width="70"/>
        <el-table-column prop="create_time" align="center" label="创建时间" width="86" sort-by="create_time" sortable>
          <template slot-scope="scope">{{ scope.row.create_time }}</template>
        </el-table-column>
        <el-table-column prop="create_time" align="center" label="更新时间" width="86" sort-by="create_time" sortable>
          <template slot-scope="scope">{{ scope.row.update_time }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openLog(scope.row.id)" v-permission="permissions.advertising_SeeTheLog">日志</el-button>
            <el-button type="text" size="mini" @click="openTheNewTAB('tiki.advertising.detail', { id: scope.row.id })" v-permission="permissions.advertising_ViewTheAD">详情</el-button>
            <el-button v-if="[140,130].includes(listQuery.advtStatus)"
                       type="text"
                       size="mini"
                       @click="soldOut('row',scope.row)"
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
import { fetchList, batchSoldOut, getSelectAll, updateCustomerPrice, setCustomStock, cancleStock, cancelCustomPrice } from '@/api/tiki'
import setGrossMargin from './components/setGrossMargins'
import setPrice from './components/setPrice'
import istoreLog from './components/istoreLog'
import multipleSelectAccount from '@/views/tiki/advertising/components/multipleSelectAccount'
import { resultAlert } from './common'

export default {
  components: { setPrice, setGrossMargin, istoreLog, multipleSelectAccount },
  data() {
    return {
      multipleSelectAccountOption: {
        accountArr: [],
        accountKey: 'id'
      },
      permissions: {
        advertising_setinventory: 'tiki.advt.custom-price.set',//设置库存
        advertising_cancelinventory: 'tiki.advt.custom-price.set',//取消库存
        advertising_customSetPrice: 'tiki.advt.custom-price.set',//设置指定价/毛利率
        advertising_customCancelStock: 'tiki.advt.custom-price.cancel',//取消指定价/毛利率
        advertising_SeeTheLog: 'tiki.advt.advt.change-log',//查看日志
        advertising_ViewTheAD: 'tiki.advt.advt.info',//查看广告
        advertising_delete: 'tiki.advt.update-platform-advt.execute'//下架
      },
      isDisable: false,
      newDate: new Date().getTime(),
      ids: [],
      getOnSaleStatus: 0,
      options: [],
      priceTypeArr: [
        { label: 'iStore价格', value: 10 },
        // { label: '动态调整价', value: 20 },
        { label: '指定价', value: 30 },
        { label: '指定毛利率', value: 40 }
        // { label: '跟卖价', value: 50 }
      ],//价格类型
      /* 广告列表搜索条件列表 */
      selectOptions: ['TikiAdvtAccount', 'TikiAdvtTypes', 'TikiProductLine'],
      listLoading: true,
      listTotal: null,
      listData: [],
      listQuery: {
        account_id: [],
        product_line_id: undefined,
        sales_count: undefined,
        page: 1,
        per_page: 20,
        accountId: undefined,
        advtProductIds: undefined,
        // product_line_id: undefined,
        advtType: [],
        advtStatus: 130,
        advtCreated: [],
        is_custom_price: undefined,
        is_custom_quantity: undefined,
        price_type: undefined
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
    selectAccount(arr) {
      this.listQuery.account_id = arr
    },
    clearAccount() {
      this.$refs.multipleSelectAccount.handleCancelAllUser()
    },
    cleanSelect() {
      this.$refs['listQuery'].resetFields()
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
        window.open(`/tiki/advertising/detail/${ v }`)
      })
    },
    // 日志
    openLog(id) {
      this.logOptions = {
        open: true,
        advtId: id
      }
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
          let selector = `.${ focus_target } .el-input__inner`
          document.querySelector(selector).focus()
        })
      }
    },
    hideEdit(type, row) {
      row[type] = false
    },
    soldOut(type, row) {
      // 主列表下架 type = 'row' ，子列表下架 type = 'child', 批量下架 type = 'more'
      // status 固定传值
      const params = {
        product_id: [],
        status: 0,
        not_show_message: true
      }
      if (type === 'row') {
        this._.forEach(row.child_product, v => {
          // 仅筛选在上架状态的子产品
          if ([130, 140].includes(Number(v.status))) {
            params.product_id.push(v.product_id)
          }
        })
      }
      if (type === 'child') {
        params.product_id.push(row.product_id)
      }
      if (type === 'more') {
        this._.forEach(this.multipleTable, v => {
          this._.forEach(v.child_product, k => {
            if (k.isSelected) {
              if ([130, 140].includes(Number(k.status))) {
                params.product_id.push(k.product_id)
              }
            }
          })
        })
      }
      if (!params.product_id.length) {
        this.$alert('该产品已经进入待下架状态，不能重复操作。', '提示', {
          dangerouslyUseHTMLString: true
        })
        return
      }
      this.$confirm('确定要下架吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        type: 'warning'
      }).then(() => {
        batchSoldOut(params).then((res) => {
          resultAlert(res)
          this.renderList()
        })
      }).catch(() => {
      })

    },
    // 表头全选
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
    // 父级选项切换
    handleSelectionRow(val, row) {
      const check = this._.some(row.child_product, (v) => {
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
    // 子列表选项切换
    selectChange(row) {
      const check = this._.some(row.child_product, (v) => {
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
    searchInit() {
      getSelectAll({ keys: this.selectOptions }).then(response => {
        this.options = response.data
        this.multipleSelectAccountOption.accountArr = response.data.TikiAdvtAccount
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
          v.virtualGross_margin = v.custom_gross_margin
          v.virtualCustom_price = v.custom_price
          this._.forEach(v.child_product, k => {
            k.isSelected = false
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
        this.unpricing('指定毛利率', 2)
      }
    },
    checkPrice(inputPrice,inputData) {
      // 不为0 后三位为0 的整数
      const reg = /^[1-9]\d*0{3}$/
      if (!reg.test(Number(inputPrice))) {
        this.$message.error('指定价必须为整数且后三位为零')
        return
      }
      // input输入框验证是否大于吊牌价
      if (inputData && (inputPrice > inputData.msrp)) {
        this.$message.error('指定价不能大于吊牌价')
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
        data.show_price_edit = false
        if (this.checkPrice(data.custom_price, data)) {
          const obj = {
            custom_price: Number(data.custom_price),
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
        this.listLoading = true
        this.listData = []
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
        data.show_gross_edit = false
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
      }
    },
    // 指定库存
    stock(command) {
      if (command.fuc === 'setStock') {
        this.setStock('all')
      } else {
        this.handleCancleStock()
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
      this.$confirm('您确定要取消指定库存吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
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
        this.listLoading = true
        this.listData = []
        cancleStock({ product_id: ids, not_show_message: true }).then((res) => {
          resultAlert(res)
          this.renderList()
        }).finally(() => {
          this.listLoading = false
        })
      }).catch(() => {
      })
    },
    handleFilter() {
      this.newDate = new Date().getTime()
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
      this.clearAccount()
      this.renderList()
    },
    changeStatus(key) {
      this.newDate = new Date().getTime()
      if (this.listQuery.advtStatus !== key) {
        this.listQuery.advtStatus = key
        this.listQuery.page = 1
        this.renderList()
      }
    },
    statusSelected(key) {
      return this.listQuery.advtStatus === key ? 'warning' : ''
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
    },
    showSpu(row) {
      if (row.spu_id) {
        return row.spu_id
      }
      return row.child_product[0].spu_id
    }
  },
  computed: {
    isOnLine() {
      return this.listQuery.advtStatus === 130 || this.listQuery.advtStatus === 140 || this.listQuery.advtStatus === 150
    }
  },
  filters: {
    getTypeLabel(val, options) {
      const types = options.TikiAdvtTypes
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
  top: 9px;
  right: -7px;
}
</style>
