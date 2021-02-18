<template>
  <div v-loading="loading" element-loading-text="拼命加载中" element-loading-background="rgba(0, 0, 0, 0.3)">
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="Site Code" prop="accountId">
          <el-select v-model="listQuery.accountId" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="(item, key) in options.krAdvtAccount" :key="key" :label="item.site_code" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Product ID" prop="advtProductIds">
          <el-input v-model="listQuery.advtProductIds" clearable placeholder="多个请用空格分隔" style="width: 200px;" @keyup.enter.native="handleFilter"></el-input>
        </el-form-item>
        <el-form-item label="平台商品号" prop="advtSpuId">
          <el-input v-model="listQuery.advtSpuId" clearable placeholder="平台商品号" style="width: 120px;" @keyup.enter.native="handleFilter"></el-input>
        </el-form-item>
        <el-form-item label="产品线" prop="productLine">
          <el-select v-model="listQuery.productLine" clearable placeholder="请选择" style="width: 120px;">
            <el-option v-for="(item, key) in options.krProductLine" :key="key" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="价格类型" prop="price_type">
          <el-select v-model="listQuery.price_type" clearable placeholder="请选择" style="width: 120px;">
            <el-option v-for="(item, key) in priceTypeArr" :key="key" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="销量" prop="sales_count">
          <el-select v-model="listQuery.sales_count" clearable placeholder="请选择" style="width: 120px;">
            <el-option label="7天-由高到低" value="sales_7_days-desc"></el-option>
            <el-option label="7天-由低到高" value="sales_7_days-asc"></el-option>
            <el-option label="30天-由高到低" value="sales_30_days-desc"></el-option>
            <el-option label="30天-由低到高" value="sales_30_days-asc"></el-option>
            <el-option label="60天-由高到低" value="sales_60_days-desc"></el-option>
            <el-option label="60天-由低到高" value="sales_60_days-asc"></el-option>
          </el-select>
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
        <el-form-item label="创建人" prop="create_user_id">
          <el-select v-model="listQuery.create_user_id" clearable placeholder="请选择" style="width: 130px;">
            <el-option v-for="(item, key) in createUserList" :key="key" :label="item.create_user" :value="item.create_user_id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="刊登时间" prop="upload_time">
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
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 状态 -->
    <div class="header-box" style="position: relative;">
      <el-row class="left-row">
        <el-tag v-for="status in esAdvtStatus"
                :key="status.key"
                :type="statusSelected(status.key)"
                size="medium"
        >
          <span @click="changeStatus(status.key)">{{ status.label }} ({{ status.total }})</span>
        </el-tag>
      </el-row>
      <!-- 之n-->
      <el-row class="right-row">
        <el-button type="primary" v-permission="permissions.info" size="mini" @click="openMoreTab" :disabled="multipleTable.length === 0">批量打开广告详情页</el-button>
        <!--before draft send to draft-->
        <el-button
          v-show="Number(listQuery.advtStatus) === PRODUCT_STATUS_CODE.BEFORE_DRAPT_CODE"
          type="success"
          size="mini"
          @click="advtOperate('send', 'batch', multipleTable)"
          :disabled="this.multipleTable.length === 0" v-permission="permissions.sendToDraft"
        >
          send to draft
        </el-button>
        <!--on sale 吊牌价-->
        <el-dropdown
          size="mini"
          split-button trigger="click"
          type="primary" @command="handlePriceCommand"
          v-show="Number(listQuery.advtStatus) === PRODUCT_STATUS_CODE.ONSALE_CODE"
          v-permission="[permissions.setProductPrice,permissions.cancelProductPrice]"
        >
          指定价
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :disabled="this.multipleTable.length === 0" command="setPrice" v-permission="permissions.setProductPrice">
              设置指定价
            </el-dropdown-item>
            <el-dropdown-item :disabled="this.multipleTable.length === 0" command="canclePrice" v-permission="permissions.cancleProductPrice">
              取消指定价
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <!--on sale 吊牌价-->
        <el-dropdown
          size="mini"
          split-button trigger="click"
          type="warning" @command="handleCommand"
          v-permission="[permissions.setTagPrice,permissions.cancelTagPrice]"
          v-show="Number(listQuery.advtStatus) === PRODUCT_STATUS_CODE.ONSALE_CODE"
        >
          指定吊牌价
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :disabled="this.multipleTable.length === 0" command="tagPrice(0)" v-permission="permissions.setTagPrice">
              设置指定吊牌价
            </el-dropdown-item>
            <el-dropdown-item :disabled="this.multipleTable.length === 0" command="tagPrice(1)" v-permission="permissions.cancelTagPrice">
              取消指定吊牌价
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <!--on salde 库存-->
        <el-dropdown
          size="mini"
          split-button trigger="click"
          type="success"
          @command="handleCommand"
          v-show="Number(listQuery.advtStatus) === PRODUCT_STATUS_CODE.ONSALE_CODE"
          v-permission="[permissions.setStock,permissions.stockOut]"
        >
          指定库存
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="inventory(0)" :disabled="this.multipleTable.length === 0" v-permission="permissions.setStock">
              设置指定库存
            </el-dropdown-item>
            <el-dropdown-item command="inventory(1)" :disabled="this.multipleTable.length === 0" v-permission="permissions.stockOut">
              取消指定库存
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <!--onsale 下架-->
        <el-button
          v-show="[103].includes(Number(listQuery.advtStatus))"
          type="danger"
          size="mini"
          @click="advtOperate('under','batch',multipleTable)"
          :disabled="this.multipleTable.length === 0"
          v-debounce
          v-permission="permissions.soldOut"
        >
          批量下架
        </el-button>
        <!--draft 优先推送-->
        <el-button
          v-show="Number(listQuery.advtStatus) === PRODUCT_STATUS_CODE.DRAPT_CODE"
          type="warning"
          size="mini"
          @click="priorityPush"
          :disabled="this.multipleTable.length === 0"
          v-debounce
          v-permission="permissions.draft"
        >
          优先推送
        </el-button>
        <!--liveN 全量导出-->
        <el-button
          v-show="Number(listQuery.advtStatus) === PRODUCT_STATUS_CODE.LIVEN_CODE"
          type="primary"
          size="mini"
          :disabled="this.pagination ? this.pagination.total === 0 : true"
          @click="advtOperate('export','all')"
          v-debounce
          v-permission="permissions.exportPart"
        >
          全量导出
        </el-button>
        <!--live 选择导出-->
        <el-button
          v-show="listQuery.advtStatus === PRODUCT_STATUS_CODE.LIVEN_CODE"
          type="success"
          size="mini"
          @click="advtOperate('export','batch',multipleTable)"
          :disabled="this.multipleTable.length === 0"
          v-debounce
          v-permission="permissions.exportPart"
        >
          选择导出
        </el-button>
        <!--删除全量广告（除draft状态、Before Authoriazation状态、on sale状态、Stop Display状态外）-->
        <el-button
          v-show="[PRODUCT_STATUS_CODE.DRAPT_CODE, PRODUCT_STATUS_CODE.BEFORE_AUTHORIAZATION_CODE,PRODUCT_STATUS_CODE.ONSALE_CODE,PRODUCT_STATUS_CODE.STOP_DISPLAY_CODE, PRODUCT_STATUS_CODE.UPDATE_ERROR_CODE].indexOf(listQuery.advtStatus) < 0"
          type="danger"
          size="mini"
          @click="advtOperate('deleteAll', 'all')"
          :disabled="this.pagination ? this.pagination.total === 0 : true"
          v-debounce
          v-permission="permissions.deleteAll"
        >
          全量删除
          <!--v-permission="permissions.deleteAll"-->
        </el-button>
        <!--live n 删除-->
        <el-button
          v-show="listQuery.advtStatus === PRODUCT_STATUS_CODE.LIVEN_CODE"
          type="warning"
          size="mini"
          @click="advtOperate('deleteBatch','batch',multipleTable )"
          :disabled="this.multipleTable.length === 0"
          v-debounce
          v-permission="permissions.advtDelete"
        >
          批量删除
        </el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table
        ref="listTable"
        :key="newDate"
        :data="listData"
        v-loading.lock="listLoading"
        element-loading-text="努力加载中"
        border
        :default-expand-all="expand"
        @header-click="handleExpand"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="tableResortEvent"
        @filter-change="handleFilterChange"
      >
        <el-table-column type="expand">
          <template slot="header">
            <svg-icon icon-class="right" />
          </template>
          <template slot-scope="props">
            <el-table :data="props.row.child_product" border :key="newDate">
              <el-table-column prop="istore_product_id" label="产品ID">
                <template v-slot="scope">
                  <span>{{ scope.row.istore_product_id }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="产品名称" min-width="260"></el-table-column>
              <el-table-column label="指定吊牌价" v-if="Number(listQuery.advtStatus) === PRODUCT_STATUS_CODE.ONSALE_CODE || Number(listQuery.advtStatus) === PRODUCT_STATUS_CODE.UPDATE_ERROR_CODE">
                <template slot-scope="scope">
                  <div
                    @mouseenter="showEdit('show_tags_icon',scope.row)"
                    @mouseleave="hideEdit('show_tags_icon',scope.row)"
                    style="width:100%;height:32px;line-height:32px;position:relative;"
                    :class="{ product_name : permission_setStock }"
                  >
                    <el-input
                      v-if="scope.row.show_tags_edit"
                      size="small"
                      class="tags_input inline-edit-input"
                      v-model="scope.row.tag_price"
                      @blur="handleSpecified(scope.row, 'single', 'tagPrice')"
                      :disabled="listQuery.advtStatus === PRODUCT_STATUS_CODE.UPDATE_ERROR_CODE"
                    >
                    </el-input>
                    <span v-else>{{ scope.row.tag_price }}</span>
                    <i
                      v-show="scope.row.show_tags_icon && noLiveInput"
                      v-permission="permissions.setTagPrice"
                      class="el-icon-edit" title="编辑"
                      style="color:#409EFF;font-size:20px;top:9px;right:-7px;cursor:pointer; "
                      @click="showEdit('show_tags_edit',scope.row, scope.$index)"
                      @blur="hideEdit('show_tags_edit',scope.row)"
                    >
                    </i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="吊牌价" min-width="60">
                <template slot-scope="scope">
                  <span>{{ scope.row.msrp ? scope.row.msrp : scope.row.total_price }}</span>
                </template>
              </el-table-column>
              <el-table-column min-width="100"
                               prop="is_tag_price" label="是否指定吊牌价"
                               v-if="Number(listQuery.advtStatus) === PRODUCT_STATUS_CODE.ONSALE_CODE || Number(listQuery.advtStatus) === PRODUCT_STATUS_CODE.UPDATE_ERROR_CODE"
              >
                <template slot-scope="scope">
                  <span>{{ Number(scope.row.is_tag_price) === 1 ? '是' : '否' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="base_price" label="保本价" min-width="60"></el-table-column>
              <el-table-column prop="discount_price" label="iStore价格"></el-table-column>
              <el-table-column prop="gross_margin" label="iStore毛利率(%)" min-width="110"></el-table-column>
              <el-table-column prop="current_price" label="当前销售价"></el-table-column>
              <el-table-column prop="current_gross_margin" label="当前毛利率(%)" min-width="110"></el-table-column>
              <el-table-column prop="price_type" label="价格类型">
                <template slot-scope="scope">
                  {{ getLabelByCode(scope.row.price_type) }}
                </template>
              </el-table-column>
              <el-table-column label="指定价" v-if="listQuery.advtStatus === PRODUCT_STATUS_CODE.ONSALE_CODE">
                <template slot-scope="scope">
                  <div
                    @mouseenter="showEdit('show_price_icon',scope.row)"
                    @mouseleave="hideEdit('show_price_icon',scope.row)"
                    style="width:100%;height:32px;line-height:32px;position:relative;"
                    :class="{ product_name : permission_setProductPrice }"
                  >
                    <el-input
                      v-if="scope.row.show_price_edit"
                      size="small"
                      class="price_input inline-edit-input"
                      v-model="scope.row.custom_price"
                      @blur="handleSetPrice('single',scope.row)"
                      autofocus
                      :disabled="!permission_setProductPrice"
                    >
                    </el-input>
                    <span v-else>{{ scope.row.custom_price }}</span>
                    <i
                      v-show="scope.row.show_price_icon && noLiveInput&&scope.row.price_type!==50"
                      v-permission:permission_setProductPrice="permissions.setProductPrice"
                      class="el-icon-edit" title="编辑"
                      style="color:#409EFF; font-size:20px;top:9px;right:-7px; cursor:pointer;"
                      @click="showEdit('show_price_edit',scope.row, scope.$index)"
                      @blur="hideEdit('show_price_edit',scope.row)"
                    >
                    </i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="custom_quantity" label="指定库存"
                               v-if="Number(listQuery.advtStatus) === PRODUCT_STATUS_CODE.ONSALE_CODE || Number(listQuery.advtStatus) === PRODUCT_STATUS_CODE.UPDATE_ERROR_CODE"
              >
                <template slot-scope="scope">
                  <div
                    @mouseenter="showEdit('show_quantity_icon',scope.row)"
                    @mouseleave="hideEdit('show_quantity_icon',scope.row)"
                    style="width:100%;height:32px;line-height:32px;position:relative;"
                    :class="{ product_name : permission_setStock }"
                  >
                    <el-input
                      v-if="scope.row.show_quantity_edit"
                      size="small"
                      class="stock_input inline-edit-input"
                      v-model="scope.row.custom_quantity"
                      @blur="handleSpecified(scope.row, 'single', 'inventory')"
                      autofocus
                      :disabled="!permission_setStock || Number(listQuery.advtStatus) === PRODUCT_STATUS_CODE.UPDATE_ERROR_CODE"
                    ></el-input>
                    <span v-else>{{ scope.row.custom_quantity }}</span>
                    <i
                      v-permission:permission_setStock="permissions.setStock"
                      v-show="scope.row.show_quantity_icon && noLiveInput"
                      class="el-icon-edit" title="编辑"
                      style="color:#409EFF; font-size:20px;top:7px;right:-7px;cursor:pointer;"
                      @click="showEdit('show_quantity_edit',scope.row, scope.$index)"
                      @blur="hideEdit('show_quantity_edit',scope.row)"
                    >
                    </i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="quantity" width="104" label="库存" align="center"></el-table-column>
              <el-table-column width="104" align="center"
                               prop="is_tag_quantity" label="是否指定库存"
                               v-if="Number(listQuery.advtStatus) === PRODUCT_STATUS_CODE.ONSALE_CODE || Number(listQuery.advtStatus) === PRODUCT_STATUS_CODE.UPDATE_ERROR_CODE"
              >
                <template slot-scope="scope">
                  <span>{{ Number(scope.row.is_custom_quantity) === 1 ? '是' : '否' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="gross_margin" width="104" label="指定毛利率(%)" v-if="Number(listQuery.advtStatus) === 110">
                <template slot-scope="scope">
                  <el-input
                    size="small"
                    class="inline-edit-input"
                    v-model="scope.row.gross_margin"
                    :disabled="Number(scope.row.custom_price_type) === 1 ? this.isDisable=true : this.isDisable=false"
                    @focus="setGrossMargins(scope.row, '2')"
                  >
                  </el-input>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="40" align="center"></el-table-column>
        <el-table-column prop="id" label="ID" min-width="80" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column prop="site_code" label="Site Code" min-width="85"></el-table-column>
        <el-table-column prop="istore_product_id" label="Product ID" width="80">
        </el-table-column>
        <el-table-column prop="spu_id" label="平台商品号" min-width="100"></el-table-column>
        <el-table-column prop="product_image" label="产品图片" width="70" align="center">
          <template slot-scope="scope">
            <PictureView
              v-if="scope.row.product_image && checkPickShow"
              :pictureList="[scope.row.picture]"
              :width="50"
              :height="50"
              :thumbnail="false"
              :defaultProps="defaultProps"
            >
            </PictureView>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="product_name" label="名称" min-width="260">
          <template slot-scope="scope">
            <div
              @mouseenter="showEdit('show_setTitle_icon',scope.row)"
              @mouseleave="hideEdit('show_setTitle_icon',scope.row)"
              :class="{ product_name : isAdvtName && Number(scope.row.is_remove) === 0 }"
              v-permission:permission_updateTitle="permissions.updateTitle"
            >
              <template v-if="!scope.row.show_setTitle_edit">
                <!--on sale 广告名称超链接-->
                <a
                  v-if="[103,102].includes(Number(listQuery.advtStatus))"
                  style="color: #409EFF;"
                  :href="'http://www.11st.co.kr/product/SellerProductDetail.tmall?method=getSellerProductDetail&prdNo=' + scope.row.spu_id"
                  target="_blank"
                >
                  {{ scope.row.product_name.trim() }}
                </a>
                <!--其他状况下-->
                <span v-else>{{ scope.row.product_name.trim() }}</span>
              </template>
              <!--编辑-->
              <i
                v-if="[103,1004].includes(listQuery.advtStatus)"
                v-show="scope.row.show_setTitle_icon && noLiveInput "
                class="el-icon-edit"
                title="编辑"
                style="color:#409EFF; font-size:20px;cursor:pointer;"
                @click="showEdit('show_setTitle_edit',scope.row)"
              ></i>
            </div>
            <el-input
              v-if="scope.row.show_setTitle_edit" size="small"
              class="title_input draft-edit-disable"
              v-model="scope.row.product_name "
              @blur="noSaveAlert(scope.row)"
            >
            </el-input>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="70" align="center">
          <template slot-scope="scope">
            <el-tag :type="Number(scope.row.type) === 1 ? 'success' : ''" size="small">{{ scope.row.type | getTypeLabel(options) }}</el-tag>
          </template>
        </el-table-column>
        <!--update error 失败原因-->
        <el-table-column v-if="[1003,1004].includes(Number(listQuery.advtStatus))" prop="error_message" label="失败原因" min-width="120">
          <template slot-scope="scope">
            <span v-if="scope.row.error_message.length<20">{{ scope.row.error_message }}</span>
            <el-popover
              v-else
              placement="left"
              width="500"
              trigger="hover"
            >
              <span style="line-height: 24px; font-size: 12px; word-wrap: break-word;max-height: 500px;">{{ scope.row.error_message }}</span>
              <span slot="reference" style="color: #E6A23C" class="in-two-line">{{ scope.row.error_message }}</span>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="product_line_name" label="产品线" width="70"></el-table-column>
        <el-table-column prop="sales_7_days" label="7天销量" width="60"></el-table-column>
        <el-table-column prop="sales_30_days" label="30天销量" width="70"></el-table-column>
        <el-table-column prop="sales_60_days" label="60天销量" width="70"></el-table-column>
        <el-table-column prop="create_user" label="创建人" min-width="70"></el-table-column>
        <!-- on sales -->
        <el-table-column prop="create_time" label="创建时间" width="85" sortable :sort-method="(a,b) => a-b">
          <template slot-scope="scope" v-if="scope.row.create_time !== no_time">{{ scope.row.create_time }}</template>
        </el-table-column>
        <el-table-column width="85"
                         v-if="listQuery.advtStatus !== PRODUCT_STATUS_CODE.DRAPT_CODE && listQuery.advtStatus !== PRODUCT_STATUS_CODE.UPLOAD_ERROR_CODE && listQuery.advtStatus !== PRODUCT_STATUS_CODE.BEFORE_AUTHORIAZATION_CODE"
                         prop="upload_time"
                         label="刊登时间"
                         sortable :sort-method="(a,b) => a-b"
        >
          <template slot-scope="scope" v-if="scope.row.upload_time !== no_time">{{ scope.row.upload_time }}</template>
        </el-table-column>
        <el-table-column prop="update_time" label="更新时间" width="85" sortable :sort-method="(a,b) => a-b">
          <template slot-scope="scope" v-if="scope.row.update_time !== no_time">{{ scope.row.update_time }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openLog(scope.row)">日志</el-button>
            <el-button
              type="text"
              size="mini"
              @click="openTheNewTAB('kr11street.advertising.detail', { id: scope.row.id })"
              v-permission="permissions.info"
            >
              详情
            </el-button>
            <el-button
              type="text"
              v-if="[103].includes(listQuery.advtStatus)"
              size="mini"
              @click="advtOperate('under','single', scope )"
              v-permission="permissions.soldOut"
              :disabled="scope.row.is_remove ===1"
            >
              下架
            </el-button>
            <el-button
              type="text"
              v-if="[1002].includes(listQuery.advtStatus)"
              size="mini"
              @click="advtOperate('deleteBatch','single', scope)"
              v-permission="permissions.advtDelete"
            >
              删除
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
          :page-sizes="[10, 20, 50, 100]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
    <!-- istore更新日志 -->
    <istore-log v-bind.sync="logOptions"></istore-log>
  </div>
</template>

<script>
// toBoolean,
import { filterQueryParams } from '@/utils/help'
import { resultAlert, countStrToBit, fllowUpExcel } from './common/11street'
// 静态变量
import advertStatic from './common/static'
// 日志组件
import istoreLog from './components/istoreLog'

// 接口
import {
  fetchList,
  batchSoldOut,
  batchDelete,
  changeDraft,
  appointDrop,
  cancelDrop,
  setTheInventory,
  cancelTheInventory,
  getSelectAll,
  sendToDraft,
  exportExcel,
  deleteAdvt,
  setProductPrice,
  cancleProductPrice,
  priorityPush,
  founder
} from '@/api/kr11street'

export default {
  name: 'Kr11streetAdvertising',
  components: { istoreLog },
  data() {
    return {
      no_time: '1970-01-01 08:00:00',
      // 常量状态
      PRODUCT_STATUS_CODE: advertStatic.productStatusCode,
      permissions: advertStatic.permissions,
      permission_updateTitle: true,
      permission_setTagPrice: true,
      permission_setStock: true,
      permission_setProductPrice: true,
      // 页面loading
      loading: false,
      // 列表中编辑广告名称
      editProductName: {
        advtIndex: null,
        input: false,
        permissions: true
      },
      isEdit: true,
      isDisable: false,
      newDate: new Date().getTime(),
      getOnSaleStatus: 0,
      title: '类型 ',
      filter: 'filter',
      options: {
        krAdvtAccount: [] // 账号
      },
      esAdvtStatus: [], // 状态
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
        price_type: undefined,
        advtType: [],
        advtStatus: 103,
        advtCreated: [],
        create_user_id: '',
        sales_count: undefined,//销量搜索
        upload_time: []
      },
      listReactQuery: {},
      pagination: null,
      createUserList: [],
      // statusTags: [],
      multipleTable: [],
      checkPickShow: true,
      expand: false,
      defaultProps: {
        originalKey: 'original',
        thumbnailKey: 'thumbnail'
      },
      logOptions: {
        open: false,
        advtId: '',
        isVary: false
      },
      noLiveInput: true
    }
  },
  created() {
    this.searchItem()
    this.renderList()
    this.getfounder()
  },
  destroyed() {
    sessionStorage.removeItem('tagPrice')
    sessionStorage.removeItem('product_name')
    sessionStorage.removeItem('inventory')
  },
  methods: {
    getfounder() {
      founder().then(res => {
        this.createUserList = res.data
      })
    },
    //列表价格类型
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
        window.open(`/kr11street/advertising/detail/${v.id}`)
      })
    },
    // 搜索中 sitecode,产品线,广告类型 optionArray获取
    searchItem() {
      getSelectAll().then(response => {
        this.options = response.data
      })
    },
    // 表格数据获取及状态栏
    renderList() {
      // expand 全部展开
      this.expand = true
      this.listLoading = true
      // 标题编辑初始化
      this.editProductName.input = false
      this.editProductName.advtIndex = null
      // 接口参数处理
      this.listQuery.advtProductIds = this._.trim(this.listQuery.advtProductIds)
      this.listQuery.advtSpuId = this._.trim(this.listQuery.advtSpuId)
      const queryParams = filterQueryParams(this.listQuery)
      //销量查询参数
      delete queryParams.sales_count
      let sort = {}
      if (this.listQuery.sales_count) {
        let value = this.listQuery.sales_count.split('-')
        sort[value[0]] = value[1]
      }
      if (!this._.isEmpty(sort)) {
        queryParams.sort = sort
      }
      // 表格选择为空
      this.multipleTable = []
      this.listData = []
      // 拷贝参数
      this.listReactQuery = this._.clone(queryParams)
      delete this.listReactQuery.page
      delete this.listReactQuery.per_page
      fetchList(queryParams).then(response => {
        this.listData = response.data.list
        this.pagination = response.data.pagination
        this.esAdvtStatus = response.data.statistics
        this._.forEach(this.listData, (v) => {
          // 判断时所需要的原始变量
          v.virtualGross_margin = v.gross_margin
          v.virtualCustom_price = v.custom_price
          v.show_setTitle_icon = false//标题
          v.show_setTitle_edit = false//标题
          //
          v.picture = {
            thumbnail: v.product_image,
            original: v.image_path
            // original: v.product_image
          }
          this._.forEach(v.child_product, (val) => {
            val.isSelected = false
            val.show_quantity_icon = false
            val.show_quantity_edit = false
            val.show_price_icon = false
            val.show_price_edit = false
            val.show_gross_icon = false
            val.show_gross_edit = false
            val.show_tags_icon = false
            val.show_tags_edit = false
            val.virtualGross_margin = val.custom_gross_margin
            val.virtualCustom_price = val.custom_price
            val.virtualCustom_quantity = val.custom_quantity
            val.virtualCustom_tag_price = val.tag_price
          })

        })
        const newdata = this._.cloneDeep(this.listData)
        this.listData = newdata
        this.checkPickShow = false
        this.$nextTick(() => {
          this.checkPickShow = true
        })
        document.querySelector('.el-table__body-wrapper').scrollTop = 0
      }).finally(() => {
        this.listLoading = false
      })
    },

    // 详情
    openTheNewTAB(name, params) {
      const { href } = this.$router.resolve({
        name: name,
        params: params || {}
      })
      window.open(href, '_blank')
    },

    /**
     * 广告相关功能
     * @param row 表格中的数据
     * @param sign 批量（batch） or 单条(single) or 全部(all)
     * @param type 操作标识符 相关操作
     * send to draft（send）、下架（under）、导出（export）、
     * 批量删除（deleteBatch）、全量删除（deleteAll)
     */
    advtOperate(type, sign, row) {
      let proudctParams
      const paramsObj = {
        send: {
          advt_id: this._.map(this.multipleTable, 'id'),
          state: 'draft',
          not_show_message: true
        },
        export: { advt_id: this._.map(this.multipleTable, 'id'), advtStatus: 1002 },
        other: this._.map(this.multipleTable, 'id')
      }
      // 参数配置
      switch (sign) {
        case 'all':
          proudctParams = this.listReactQuery
          break
        case 'batch':
          if (Object.keys(paramsObj).indexOf(type) > -1) {
            proudctParams = paramsObj[type]
          } else {
            proudctParams = paramsObj.other
          }
          break
        default:
          proudctParams = [row.row.id]
      }
      // 接口配置
      const apiObj = {
        send: { resultStatus: 1, api: sendToDraft, message: '确定导入draft列表吗' },
        under: {
          resultStatus: sign === 'all' ? null : this._.indexOf(sign === 'batch' ? this._.map(this.multipleTable, 'is_deleted') : [row.row.is_deleted], 0),
          api: batchSoldOut,
          message: '是否要下架此产品',
          upderMsg: '广告已经进入待下架状态，不可再次提交。'
        },
        export: { resultStatus: 1, api: exportExcel },
        deleteBatch: { resultStatus: 1, api: batchDelete, message: '确定要删除此产品吗' },
        deleteAll: { resultStatus: 1, api: deleteAdvt, message: '广告删除后无法恢复，确认该状态下广告全量删除？' }
      }
      if (apiObj[type].resultStatus > -1) {
        if (apiObj[type].message) {
          this.$confirm(apiObj[type].message, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            apiObj[type].api(proudctParams).then(response => {
              this.$message({ type: 'success', message: response.message })
              if (type === 'deleteAll') {
                this.listQuery = {
                  page: 1,
                  per_page: 10,
                  accountId: undefined,
                  advtProductIds: undefined,
                  advtSpuId: undefined,
                  productLine: undefined,
                  advtType: [],
                  advtStatus: this.listQuery.advtStatus,
                  advtCreated: [],
                  upload_time: [],
                  create_user_id: ''
                }
              }
              this.renderList()
            })
          }).catch(() => {
            this.listLoading = false
          })
        } else {
          apiObj[type].api(proudctParams).then(response => {
            fllowUpExcel(response)
          })
        }
      } else {
        this.$alert(apiObj[type].upderMsg, '提示', {
          dangerouslyUseHTMLString: true
        })
      }
    },
    /**
     * 批量优先推送
     */
    priorityPush() {
      const obj = { advt_id: this._.map(this.multipleTable, 'id') }
      this.$confirm('确认优先推送广告吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        priorityPush(obj).then(() => {
        })
      }).catch(() => {
      })
    },
    /**
     * 下拉框回调
     */
    handleCommand(command) {
      const sign = command.slice(0, command.indexOf('('))
      const index = command.slice(command.indexOf('(') + 1, command.indexOf(')'))
      index === '0' ? this.setBath(sign) : this.cancelAll(sign)
    },
    // 批量设置指定吊牌价/库存（弹出框）
    setBath(sign) {
      const signName = '指定' + (sign === 'tagPrice' ? '吊牌价/售价的比例' : '库存')
      this.$prompt(`请输入${signName}`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        inputValidator: (value) => {
          if (!value) {
            return `${signName}不能为空`
          } else if (!/^(1.[1-9]\d*)|2$/.test(Number(value)) && sign === 'tagPrice') {
            return `${signName}须设置在1.1~2.0之间`
          } else if (!/^[1-9]\d*$/.test(Number(value)) && sign === 'inventory') {
            return `${signName}必须为正整数`
          } else {
            return true
          }
        }
      }).then(({ value }) => {
        this.handleSpecified('all', value, sign)
      }).catch(() => {
        this.listLoading = false
      })
    },
    // 2、指定吊牌价/库存
    handleSpecified(row, value, sign) {
      this.noLiveInput = true
      this.listLoading = true
      let ids = []
      let otherParams
      const product_arr = {}
      const virtualTag_price = sessionStorage.getItem('tagPrice')
      const virtualCustom_quantity = sessionStorage.getItem('inventory')
      if (row === 'all') {
        this._.forEach(this.multipleTable, (v) => {
          ids.push(v.child_product[0].id)
          product_arr[v.child_product[0].id] = value
          if (sign === 'tagPrice') {
            otherParams = 1
          }
        })
      } else {
        const result = sign === 'tagPrice' ? handleSingle(row.tag_price, virtualTag_price, row.discount_price, row) : handleSingle(row.custom_quantity, virtualCustom_quantity, row.quantity)
        if (result === -1) {
          if (sign === 'tagPrice') {
            row.tag_price = parseInt(row.tag_price) + '.00'
            ids = [row.id]
            product_arr[row.id] = row.tag_price
          } else {
            row.custom_quantity = parseInt(row.custom_quantity)
            ids = [row.id]
            product_arr[row.id] = row.custom_quantity
          }
        } else {
          const resultObj = sign === 'tagPrice' ? { 1: '指定吊牌价不能为空', 3: '指定吊牌价必须为正整数', 4: '指定吊牌价必须大于售价', 5: '指定吊牌价必须大于指定价' } : { 1: '指定库存不能为空', 3: '指定库存必须为正整数', 4: '指定库存价必须大于库存值' }
          this.listLoading = false
          this.$message.error(resultObj[result])
          row.show_tags_edit = false
          if (resultObj[result].indexOf('指定库存') > -1) {
            row.show_quantity_edit = false
            row.custom_quantity = row.virtualCustom_quantity
          }
          if (resultObj[result].indexOf('吊牌价') > -1) {
            row.tag_price = row.virtualCustom_tag_price
            row.show_tags_edit = false
          }
          return
        }
      }
      const obj = {
        product_id: ids,
        not_show_message: true,
        sel: otherParams
      }
      let api
      if (sign === 'tagPrice') {
        obj.tag_price = product_arr
        api = appointDrop
      } else {
        obj.custom_quantity = product_arr
        api = setTheInventory
      }
      api(obj).then(res => {
        resultAlert(res, (status) => {
          if (status) {
            if (row === 'all') {
              this.renderList()
            } else {
              sign === 'tagPrice' ? row.is_tag_price = '1' : row.is_custom_quantity = '1'
            }
          } else {
            if (row !== 'all') {
              sign === 'tagPrice' ? row.tag_price = virtualTag_price : row.custom_quantity = virtualCustom_quantity
            }
          }
        })
      }).catch(_ => {
      }).finally(_ => {
        this.searchItem()
        this.renderList()
        this.listLoading = false
      })

      function handleSingle(value, virtualValue, tag, rowData) {
        let result = -1
        if (rowData) {
          if (!(value + '').trim()) {
            result = 1
          } else if (!/^[1-9]\d*$/.test(Number(value))) {
            result = 3
          }
          // else if (rowData.is_custom_price === '0' && Number(value) < Number(tag)) {
          //   result = 4
          // } else if (rowData.is_custom_price === '1' && Number(value) < Number(rowData.custom_price)) {
          //   result = 5
          // }
          return result
        } else {
          if (!(value + '').trim()) {
            result = 1
          } else if (!/^[1-9]\d*$/.test(Number(value))) {
            result = 3
          }
          return result
        }
      }
    },
    // 取消指定吊牌价、取消库存
    cancelAll(type) {
      let msg = ''
      let api = ''
      const advIds = []
      const obj = { not_show_message: true }
      if (type === 'tagPrice') { // 吊牌价
        msg = '您确定要取消指定吊牌价吗？'
        api = cancelDrop
      } else if (type === 'inventory') { // 指定库存
        msg = '您确定要取消指定库存吗？'
        api = cancelTheInventory
      } else if (type === 'productPrice') { // 指定库存
        msg = '您确定要取消指定价吗？'
        api = cancleProductPrice
      }
      this.$confirm(msg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        this._.forEach(this.multipleTable, (v) => {
          advIds.push(v.child_product[0].id)
        })
        if (api === cancleProductPrice) {
          obj.appoint = advIds
        } else {
          obj.product_id = advIds
        }
        api(obj).then(res => {
          resultAlert(res, status => {
            if (status) {
              this.renderList()
            }
          })
        }).finally(() => {
          this.listLoading = false
        })
      }).catch(() => {
        this.listLoading = false
      })
    },
    showEdit(type, row) {
      if (this.noLiveInput) {
        row[type] = true
        if (['show_quantity_edit', 'show_price_edit', 'show_gross_edit', 'show_tags_edit', 'show_setTitle_edit'].includes(type)) {
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
            case 'show_tags_edit':
              focus_target = 'tags_input'
              break
            case 'show_setTitle_edit':
              focus_target = 'title_input'
              break
            default:
              focus_target = undefined
          }
          this.$nextTick(() => {
            let selector = `.${focus_target} .el-input__inner`
            document.querySelector(selector).focus()
          })
          this.noLiveInput = false
        }

      }
    },
    hideEdit(type, row) {
      row[type] = false
    },
    // 广告名称保存
    updateProudct(row) {
      if (!row.product_name.trim()) {
        this.$message({
          message: '广告名称不能为空',
          type: 'warning'
        })
        return false
      } else if (countStrToBit(row.product_name) > 100) {
        this.$message({
          message: '广告名称超长，最多可输入100个字节',
          type: 'warning'
        })
        return false
      }
      return true
    },
    noSaveAlert(row) {
      this.noLiveInput = true
      row.show_setTitle_icon = false
      row.show_setTitle_edit = false
      if (this.updateProudct(row)) {
        const params = {
          'advt_id': row.id,
          'product_id': row.id,
          'account_id': row.account_id,
          'isJson': true,//以json提交数据
          data: {
            'title': [{
              'istore_product_id': row.istore_product_id,
              'content': row.product_name.trim()
            }]
          }
        }
        changeDraft(params).finally(() => {
          this.renderList()
        })
      } else {
        this.renderList()
      }
    },
    // checkbox是否可选择(下架)
    selectable(row, index) {
      if (row.is_remove === 1) {
        return false
      } else {
        return true
      }
    },
    handleSelectionChange(val) {
      this.multipleTable = val
    },
    handleFilter() {
      this.newDate = new Date().getTime()
      this.filter = 'filter'
      this.listQuery.page = 1
      this.listQuery.per_page = 10
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
      this.listQuery.page = 1
      this.listQuery.per_page = 10
      this.renderList()
    },
    changeStatus(key, sign) {
      this.newDate = new Date().getTime()
      if (this.listQuery.advtStatus !== key || sign === 'hand') {
        this.listQuery.advtStatus = key
        this.listQuery.page = 1
        this.pagination = undefined
        this.filter = 'filter'
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
    },
    handlePriceCommand(command) {
      if (command === 'setPrice') {
        this.setPrice()
      } else {
        this.cancelAll('productPrice')
      }
    },
    setPrice() {
      this.$prompt('请输入指定价/售价的比率', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        inputValidator: value => {
          if (!value) {
            return '指定价不能为空'
          } else if (!(/^0\.?\d{0,2}$|^1\.?\d{0,2}$/.test(value) && value < 1.8 && value > 0)) {
            return '输入的比率只可以为大于0小于1.8的数字，且小数点后最多可输入2位'
          }
        }
      }).then(({ value }) => {
        this.handleSetPrice('all', value)
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleSetPrice(type, value) {
      this.noLiveInput = true
      console.log(value)
      this.listLoading = true
      const advIds = []
      if (type === 'all') {
        this.multipleTable.map(v => {
          v.child_product.map(item => {
            advIds[item.id] = {
              'product_id': item.id,
              'custom_rate': value
            }
          })
        })
      } else {
        if (value.custom_price % 10 !== 0) {
          this.$message.error('请输入10的整数倍')
          value.custom_price = sessionStorage.getItem('productPrice')
          value.custom_price = value.virtualCustom_price
          this.listLoading = false
          value.show_price_edit = false
          return
        }
        if (Number(value.custom_price) < Number(value.base_price)) {
          this.$message.error(`请输入大于等于保本价${value.base_price}的数字`)
          this.listLoading = false
          value.custom_price = sessionStorage.getItem('productPrice')
          value.custom_price = value.virtualCustom_price
          value.show_price_edit = false
          return
        }
        advIds[value.id] = {
          'product_id': value.id,
          'custom_price': value.custom_price
        }
      }

      setProductPrice({ appoint: advIds, not_show_message: true }).then(res => {
        if (res.code === 200) {
          resultAlert(res, (status) => {
            if (status) {
              type === 'all' ? this.renderList() : value.is_custom_price = '1'
            } else {
              if (type !== 'all') {
                value.custom_price = sessionStorage.getItem('productPrice')
              }
            }
          })
        } else {
          this.$message({
            message: res.message,
            type: 'warning'
          })
        }
      }).finally(() => {
        this.searchItem()
        this.renderList()
        this.listLoading = false
      })


    }
  },
  computed: {
    // 广告名称编辑
    isAdvtName: function() {
      const status = [this.PRODUCT_STATUS_CODE.BEFORE_DRAPT_CODE, this.PRODUCT_STATUS_CODE.ONSALE_CODE, this.PRODUCT_STATUS_CODE.TITLE_REPETITION_CODE, this.PRODUCT_STATUS_CODE.UPLOAD_ERROR_CODE].includes(this.listQuery.advtStatus)
      return status && this.permission_updateTitle && !this.editProductName.input
    }
  },
  filters: {
    getTypeLabel(val, options) {
      const types = options.krAdvtTypes
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
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.advt-form-inline {
  .line {
    text-align: center;
  }
}

.product_name {
  position: relative;
  padding-right: 20px;

  &:hover {
    .el-icon-edit {
      display: block;
    }
  }
}

.el-icon-edit {
  display: none;
}

.el-icon-edit {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  margin: auto;
}

</style>
<style rel="stylesheet/scss" lang="scss">
.el-input.is-disabled.advtlist-disable .el-input__inner {
  color: #606266;
  cursor: not-allowed !important;
}
</style>

