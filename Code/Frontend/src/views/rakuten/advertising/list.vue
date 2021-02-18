<template>
  <div class="linio-export-loading-area">
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <!--        <el-form-item label="Site Code" prop="account_id">-->
        <!--          <el-select v-model="listQuery.account_id" clearable placeholder="请选择" style="width: 150px;">-->
        <!--            <el-option v-for="item in options.account" :key="item.id" :label="item.account" :value="item.id"></el-option>-->
        <!--          </el-select>-->
        <!--        </el-form-item>-->
        <el-form-item label="Site Code" prop="account_id">
          <multiple-select-account ref="multipleSelectAccount" v-bind.sync="multipleSelectAccountOption" @select-account="selectAccount" @clean-select="cleanSelect"></multiple-select-account>
        </el-form-item>
        <el-form-item label="Product ID" prop="product_ids">
          <el-input v-model="listQuery.product_ids" clearable placeholder="多个请用空格分隔" style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item label="产品来源" prop="product_source">
          <el-select v-model="listQuery.product_source" placeholder="请选择" multiple collapse-tags clearable class="se-multiple">
            <el-option v-for="item in options.product_source" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品线" prop="product_line_id">
          <el-select v-model="listQuery.product_line_id" clearable placeholder="请选择" style="width: 120px;">
            <el-option v-for="item in options.product_line" :key="item.id" :label="item.name" :value="item.id"></el-option>
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
        <el-form-item v-if="options.types" label="广告类型" prop="types">
          <el-checkbox-group v-model="listQuery.types">
            <el-checkbox-button v-for="types in options.types" :label="types.key" :key="types.key">{{ types.label }}</el-checkbox-button>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="创建时间" prop="create_time">
          <el-date-picker
            v-model="listQuery.create_time"
            type="daterange"
            style="width: 220px;"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="是否指定库存" prop="is_custom_quantity">
          <el-select v-model="listQuery.is_custom_quantity" clearable placeholder="请选择" style="width: 120px;">
            <el-option label="是" value="1"></el-option>
            <el-option label="否" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="价格区间">
          <div class="interval">
            <el-input size="mini" clearable v-model="listQuery.min_price" placeholder="最小价格" style="width:100px;"></el-input>
            <span>-</span>
            <el-input size="mini" clearable v-model="listQuery.max_price" placeholder="最大价格" style="width:100px;"></el-input>
          </div>
        </el-form-item>
        <el-form-item label="毛利率区间(%)">
          <div class="interval">
            <el-input size="mini" clearable v-model="listQuery.min_gross_margin" placeholder="最小毛利率" style="width:110px;"></el-input>
            <span>-</span>
            <el-input size="mini" clearable v-model="listQuery.max_gross_margin" placeholder="最大毛利率" style="width:110px;"></el-input>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">搜索</el-button>
          <el-button data-type="clear" @click="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 状态 -->
    <div v-if="esAdvtStatus" class="header-box" style="position: relative;">
      <el-row class="left-row">
        <el-tag v-for="status in esAdvtStatus" :key="status.key" :type="statusSelected(status.key)" size="medium">
          <span @click="changeStatus(status.key)">{{ status.label }} ({{ status.total }})</span>
        </el-tag>
      </el-row>
      <!--online状态下-->
      <el-row class="right-row">
        <el-button type="primary" size="mini" @click="openMoreTab" :disabled="multipleTable.length === 0" v-permission="permissions.advertising_ViewTheAD">批量打开广告详情页</el-button>
        <el-dropdown v-if="listQuery.advt_status === 110"
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
        <el-dropdown v-if="listQuery.advt_status === 110"
                     size="mini"
                     split-button
                     type="primary"
                     trigger="click"
                     @command="price"
                     v-permission="[permissions.advertising_customSetPrice,permissions.advertising_customCancelStock]"
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
        <el-dropdown v-if="listQuery.advt_status === 110"
                     size="mini"
                     split-button
                     type="primary"
                     trigger="click"
                     @command="margin"
                     v-permission="[permissions.advertising_customSetPrice,permissions.advertising_customCancelStock]"
        >
          指定毛利率
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-permission="permissions.advertising_customSetPrice" :disabled="this.multipleTable.length === 0"
                              :command="{ fuc: 'setGrossMargins', value: multipleTable, type: 'all' }"
            >
              设置指定毛利率
            </el-dropdown-item>
            <el-dropdown-item v-permission="permissions.advertising_customCancelStock" :disabled="this.multipleTable.length === 0" :command="{ fuc: 'unpricing', value: multipleTable }">
              取消指定毛利率
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button type="danger"
                   size="mini"
                   v-show="listQuery.advt_status === 110"
                   @click="deleteFileOrDirectory(multipleTable,'all')"
                   :disabled="multipleTable.length === 0"
                   v-permission="permissions.advertising_delete"
        >
          批量下架
        </el-button>
        <el-button v-permission="permissions.advertising_export" v-if="[110,140].includes(listQuery.advt_status)" type="primary" size="mini" @click="exportListData">导出</el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table
        ref="table"
        :key="newDate"
        :data="listData"
        v-loading="listLoading"
        element-loading-text="努力加载中"
        border
        style="width: 100%;"
        @select-all="handleSelectionChange"
        @select="handleSelectionRow"
        @selection-change="selectionChange"
        @sort-change="tableResortEvent"
        :default-expand-all="expand"
        @header-click="handleExpand"
      >
        <el-table-column type="expand" width="40" align="center">
          <template slot="header">
            <svg-icon icon-class="right"/>
          </template>
          <template slot-scope="props">
            <el-table :data="props.row.child_product" border>
              <el-table-column width="25" v-if="[110,140].includes(listQuery.advt_status)" align="center">
                <template slot-scope="scope">
                  <el-checkbox @input="smt(props.row)" v-model="scope.row.isSelected"/>
                </template>
              </el-table-column>
              <el-table-column prop="istore_product_id" align="center" width="75" label="产品 ID">
                <template v-slot="scope">
                  <a href="javascript:;" style="color:rgb(64, 158, 255)">{{ scope.row.istore_product_id }}</a>
                </template>
              </el-table-column>
              <el-table-column prop="base_price" align="center" label="保本价(JPY)" width="85"></el-table-column>
              <el-table-column prop="discount_price" label="iStore价格" align="center" width="75"></el-table-column>
              <el-table-column prop="gross_margin" label="iStore毛利率(%)" align="center" width="110"></el-table-column>
              <el-table-column prop="current_price" label="当前销售价" align="center" width="75"></el-table-column>
              <el-table-column prop="current_gross_margin" label="当前毛利率(%)" align="center" width="95"></el-table-column>
              <el-table-column prop="price_type" label="价格类型" align="center" width="80">
                <template slot-scope="scope">
                  {{ getLabelByCode(scope.row.price_type) }}
                </template>
              </el-table-column>
              <el-table-column prop="custom_price" label="指定价" v-if="listQuery.advt_status === 110" align="center">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_price_icon',scope.row)" @mouseleave="hideEdit('show_price_icon',scope.row)" style="width:100%;height:32px;line-height:32px;">
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
                    <i v-show="scope.row.show_price_icon && !hasActiveInput"
                       class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:13px;"
                       @click="showEdit('show_price_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_price_edit',scope.row)"
                       v-permission="permissions.advertising_customSetPrice"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="gross_margin" label="指定毛利率(%)" v-if="listQuery.advt_status === 110" align="center">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_gross_icon',scope.row)" @mouseleave="hideEdit('show_gross_icon',scope.row)" style="width:100%;height:32px;line-height:32px;">
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
                    <i v-show="scope.row.show_gross_icon && !hasActiveInput"
                       class="el-icon-edit" title="编辑"
                       style="color:#409EFF; font-size:20px;top:13px;"
                       @click="showEdit('show_gross_edit',scope.row, scope.$index)"
                       @blur="hideEdit('show_gross_edit',scope.row)"
                       v-permission="permissions.advertising_customSetPrice"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="库存" width="60" align="center"></el-table-column>
              <el-table-column prop="custom_quantity" label="指定库存" min-width="60" v-if="listQuery.advt_status === 110" align="center">
                <template slot-scope="scope">
                  <div @mouseenter="showEdit('show_quantity_icon',scope.row)" @mouseleave="hideEdit('show_quantity_icon',scope.row)" style="width:100%;height:32px;line-height:32px;">
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
                    <i v-show="scope.row.show_quantity_icon && !hasActiveInput"
                       class="el-icon-edit"
                       title="编辑"
                       style="color:#409EFF; font-size:20px;top:13px;"
                       @click="showEdit('show_quantity_edit',scope.row, scope.$index)"
                       v-permission="permissions.advertising_setinventory"
                    ></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="is_custom_quantity" label="是否指定库存" v-if="listQuery.advt_status === 110" align="center" width="90">
                <template slot-scope="scope">
                  {{ Number(scope.row.is_custom_quantity) === 1 ? '是' : '否' }}
                </template>
              </el-table-column>
              <el-table-column prop="source_type" label="产品来源" align="center">
                <template slot-scope="scope">
                  {{ formatSourceType(scope.row.source_type) }}
                </template>
              </el-table-column>
              <el-table-column label="7天销量" v-if="props.row.type === 2" prop="sold_quantity_7" width="100" align="center"/>
              <el-table-column label="30天销量" v-if="props.row.type === 2" prop="sold_quantity_30" width="100" align="center"/>
              <el-table-column label="60天销量" v-if="props.row.type === 2" prop="sold_quantity_60" width="100" align="center"/>
              <el-table-column label="状态" align="center">
                <template slot-scope="scope">
                  {{ formatStatus(scope.row.status) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" width="74">
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    v-if="listQuery.advt_status === 110&&scope.row.status===110"
                    size="mini"
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
        <el-table-column type="selection" width="40"></el-table-column>
        <el-table-column prop="id" label="ID" sortable :sort-method="(a,b) => a-b" width="75"></el-table-column>
        <el-table-column prop="account" label="Site Code" width="85"></el-table-column>
        <el-table-column prop="istore_product_id" label="Product ID" width="80"></el-table-column>
        <!--<el-table-column prop="spu_id" label="平台商品号" min-width="120"></el-table-column>-->
        <el-table-column prop="product_image" label="产品图片" width="65">
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
        <el-table-column prop="product_name" label="产品名称" min-width="260">
          <template slot-scope="scope">
            <a v-if="listQuery.advt_status === 110" style="color: #409EFF;" :href="scope.row.platform_item_url" target="_blank">{{ scope.row.product_name }}</a>
            <span v-else>{{ scope.row.product_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="库存" width="60"></el-table-column>
        <el-table-column prop="type" label="类型" width="70">
          <template slot-scope="scope">
            <el-tag :type="Number(scope.row.type) === 1 ? 'success' : ''" size="small">{{ scope.row.type | getTypeLabel(options) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="产品线" prop="product_line_name" width="80"/>
        <el-table-column label="7天销量" prop="sold_quantity_7" width="65"/>
        <el-table-column label="30天销量" prop="sold_quantity_30" width="70"/>
        <el-table-column label="60天销量" prop="sold_quantity_60" width="70"/>
        <el-table-column prop="create_time" label="创建时间" width="86" sort-by="create_time" sortable>
          <template slot-scope="scope">{{ scope.row.create_time }}</template>
        </el-table-column>
        <el-table-column prop="create_time" label="更新时间" width="86" sort-by="create_time" sortable>
          <template slot-scope="scope">{{ scope.row.update_time }}</template>
        </el-table-column>
        <el-table-column label="操作" width="90" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openLog(scope.row.id)" v-permission="permissions.advertising_SeeTheLog">日志</el-button>
            <el-button type="text" size="mini" @click="openTheNewTAB('rakuten.advertising.detail', { id: scope.row.id })" v-permission="permissions.advertising_ViewTheAD">详情</el-button>
            <el-button
              type="text"
              v-if="listQuery.advt_status === 110"
              size="mini"
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
import { fetchList } from '@/api/rakuten'
import { batchSoldOut, getSelectAll, updateCustomerPrice, setCustomStock, cancleStock, cancelCustomPrice } from '@/api/rakuten'
import setGrossMargin from './components/setGrossMargins'
import setPrice from './components/setPrice'
import istoreLog from './components/istoreLog'
import multipleSelectAccount from '@/views/rakuten/advertising/components/multipleSelectAccount'
import axios from 'axios'
import qs from 'qs'
import Cookies from 'js-cookie'

export default {
  components: { setPrice, setGrossMargin, istoreLog, multipleSelectAccount },
  data() {
    return {
      multipleSelectAccountOption: {
        accountArr: [],
        accountKey: 'id'
      },
      permissions: {
        advertising_setinventory: 'rakuten.advt.custom-quantity.set',//设置库存
        advertising_cancelinventory: 'rakuten.advt.custom-quantity.cancel',//取消库存
        advertising_customSetPrice: 'rakuten.advt.custom-price.set',//设置指定价/毛利率
        advertising_customCancelStock: 'rakuten.advt.custom-price.cancel',//取消指定价/毛利率
        advertising_SeeTheLog: 'rakuten.advt.advt.change-log',//查看日志
        advertising_ViewTheAD: 'rakuten.advt.advt.info',//查看广告
        advertising_delete: 'rakuten.advt.advt.delete',//下架
        advertising_export: 'rakuten.advt.export.get-file'
      },
      isDisable: false,
      newDate: new Date().getTime(),
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
        account_id: [],
        product_ids: undefined,
        product_line_id: undefined,//产品线
        types: [],
        advt_status: 110,
        create_time: [],
        product_source: [],
        is_custom_price: undefined,
        is_custom_quantity: undefined,
        sales_count: undefined,//销量搜索
        price_type: undefined,
        min_price: '',
        max_price: '',
        min_gross_margin: '',
        max_gross_margin: ''
      },
      pagination: null,
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
      expand: true,
      defaultProps: {
        originalKey: 'origin',
        thumbnailKey: 'thumb'
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
      },
      esAdvtStatus: [],
      hasActiveInput: false
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
    // 导出
    exportListData() {
      if (typeof this.createSelectParams() !== 'string') {
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
            params = this.createSelectParams()
            delete params.page
            delete params.per_page
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
      } else {
       this.$message({
         type: 'error',
         message: this.createSelectParams(),
         duration: 5000
       })
      }
    },
    // 下载地址
    getDownLoadPath() {
      const API_ADDRESS = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_BASE_API : process.env.VUE_APP_BASE_API
      return API_ADDRESS + 'rakuten-new/advt/export/get-file'
    },
    getParam() {
      const product_id = []
      this.multipleTable.map(item => {
        if (item.type === 2) {
          product_id.push(item.product_id)
        }
        item.child_product.map(val => {
          if (val.isSelected) {
            //
            product_id.push(val.product_id)
          }
        })
      })
      return product_id
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
    formatStatus(val) {
      return this.esAdvtStatus.filter(v => v.key === val)[0]['label']
    },
    openMoreTab() {
      const detailsId = this.multipleTable.map(v => v.id)
      detailsId.map(v => {
        window.open(`/rakuten/advertising/detail/${ v }`)
      })
    },
    // 日志
    openLog(id) {
      this.logOptions = {
        open: true,
        advtId: id
      }
    },
    showEdit(type, row) {
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
            let selector = `.${ focus_target } .el-input__inner`
            document.querySelector(selector).focus()
          })
          this.hasActiveInput = true
        }
      }
    },
    hideEdit(type, row) {
      row[type] = false
    },
    selectionChange(val) {
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
    formatSourceType(val) {
      let type = ''
      this._.forEach(this.options.product_source, item => {
        if (item.id === parseInt(val)) {
          type = item.name
        }
      })
      return type
    },
    searchInit() {
      getSelectAll().then(response => {
        this.options = response.data
        this.multipleSelectAccountOption.accountArr = response.data.account
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
    createSelectParams() {
      // 验证区间范围输入值
      //区间范围仅存在一个值
      if ((this.listQuery.min_price && !this.listQuery.max_price) || (this.listQuery.max_price && !this.listQuery.min_price)) {
        return '价格区间必须同时存在最小值和最大值'
      }
      if (this.listQuery.min_price && this.listQuery.max_price) {
        const reg = /^[1-9]\d*0$/
        if (!reg.test(this.listQuery.min_price) || !reg.test(this.listQuery.max_price)) {
          return '输入价格必须为10的整数倍'
        }
        if (Number(this.listQuery.max_price) < Number(this.listQuery.min_price)) {
          return '最大价格不能小于最小价格'
        }
      }
      if ((this.listQuery.min_gross_margin && !this.listQuery.max_gross_margin) || (this.listQuery.max_gross_margin && !this.listQuery.min_gross_margin)) {
        return '毛利率区间必须同时存在最小值和最大值'
      }
      if (this.listQuery.min_gross_margin && this.listQuery.max_gross_margin) {
        const reg = /^0$|^100$|^\d{1,2}(\.\d{0,2})?$/
        if (!reg.test(this.listQuery.min_gross_margin) || !reg.test(this.listQuery.max_gross_margin)) {
          return '输入毛利率必须为0-100之间的数字，小数点后最多保留两位'
        }
        if (Number(this.listQuery.max_gross_margin) < Number(this.listQuery.min_gross_margin)) {
          return '最大毛利率不能小于最小毛利率'
        }
      }
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
      if (this.listQuery.min_price) {
        delete queryParams.min_price
        delete queryParams.max_price
        queryParams.price = {
          min_price: this.listQuery.min_price,
          max_price: this.listQuery.max_price
        }
      }
      if (this.listQuery.min_gross_margin) {
        delete queryParams.min_gross_margin
        delete queryParams.max_gross_margin
        queryParams.gross_margin = {
          min_gross_margin: this.listQuery.min_gross_margin,
          max_gross_margin: this.listQuery.max_gross_margin
        }
      }
      return queryParams
    },
    renderList() {
      this.listData = []
      if (typeof (this.createSelectParams()) !== 'string') {
        this.listLoading = true
        // this.expand = true
        fetchList(this.createSelectParams()).then(response => {
          this.listData = response.data.list
          this.pagination = response.data.pagination
          this.esAdvtStatus = response.data.statistics
          this.createUserList = response.data.createUser
          this._.forEach(this.listData, (v) => {
            // 图片缩略图
            v.pathArr = []
            if (v.product_image) {
              // 无缩略图链接时使用原图链接
              v.pathArr.push({ origin: v.product_image, thumb: v.product_image_thumb ? v.product_image_thumb : v.product_image })
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
      } else {
        this.$message({
          message: this.createSelectParams(),
          type: 'error',
          duration: 5000
        })
      }
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
    deleteFileOrDirectory(row, type) {
      let params = []
      if (type === 'all') {
        this._.map(row, v => {
          params.push({ advt_id: v.advt_id, product_id: v.child_product.filter(v => v.isSelected && [110].includes(v.status)).map(v => v.product_id) })
        })
      }
      // 主产品下架
      if (type === 'single') {
        params.push({ advt_id: row.advt_id, product_id: row.child_product.filter(v => [110].includes(v.status)).map(v => v.product_id) })
      }
      // 子产品下架
      if (type === 'child') {
        params.push({ advt_id: row.advt_id, product_id: [row.product_id] })
      }
      params = params.filter(v => v.product_id.length)
      if (params.length) {
        this.$confirm('确定要下架此产品吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          batchSoldOut({ params, not_show_message: true }).then(response => {
            if (response.code === 200) {
              this.$message({
                type: 'success',
                message: response.message
              })
              this.renderList()
            } else {
              this.$message({
                type: 'info',
                message: response.message
              })
            }
          })
        }).finally(() => {
          this.listLoading = false
        })
      } else {
        this.$alert('该产品已经进入待下架状态，不可再次提交。', '提示', {
          dangerouslyUseHTMLString: true
        })
      }
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
    checkPrice(inputPrice) {
      const reg = /^\d+$/
      if (!reg.test(inputPrice)) {
        this.$message.error('指定价只能设置整数')
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
        // 单独设置指定价
        if (this.checkPrice(data.custom_price)) {
          const obj = {
            custom_price: data.custom_price,
            product_id: [data.id],
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
        this.hasActiveInput = false
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
              advIds.push(val.id)
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
        // 单独设置毛利率
        if (this.checkGross(this.currentRow.custom_gross_margin)) {
          // 验证通过调接口
          const obj = {
            custom_price: data.custom_gross_margin,
            product_id: [data.id],
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
          data.gross_margin = data.virtualGross_margin
        }
        this.hasActiveInput = false
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
          ids.push(row.id)
          // 调用接口设置，设置成功 是否指定库存显示为 是
          setCustomStock({ product_id: ids, custom_quantity: row.custom_quantity, not_show_message: true }).then((res) => {
            resultAlert(res)
            row.is_custom_quantity = 1
          }).catch(() => {
            row.custom_quantity = row.virtualCustom_quantity
          }).finally(() => {
            this.listLoading = false
          })
        } else {
          // 验证不通过，恢复初始值显示
          row.custom_quantity = row.virtualCustom_quantity
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
                  ids.push(k.id)
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
            ids.push(k.id)
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
    clearValue() {
      this.listQuery.min_price = ''
      this.listQuery.max_price = ''
      this.listQuery.max_gross_margin = ''
      this.listQuery.min_gross_margin = ''
    },
    clearSearch() {
      this.$refs.listQuery.resetFields()
      this.clearValue()
      this.newDate = new Date().getTime()
      this.clearAccount()
      this.renderList()
    },
    changeStatus(key) {
      this.newDate = new Date().getTime()
      if (this.listQuery.advt_status !== key) {
        this.listQuery.advt_status = key
        this.listQuery.page = 1
        this.filter = 'filter'
        // 非OnLine状态下去 是否指定价、是否指定库存 条件
        if (this.listQuery.advt_status !== 110) {
          this.listQuery.is_custom_price = undefined
          this.listQuery.is_custom_quantity = undefined
        }
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
      const types = options.types
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
<style rel="stylesheet/scss" lang="scss">
.el-select {
  .el-select__tags {
    span {
      span:first-child {
        display: flex !important;

        i.el-tag__close {
          top: 3px;
        }
      }
    }
  }
}
</style>
