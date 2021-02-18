<template>
<!-- 老跟卖业务，菜单已经屏蔽 -->
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="账号" prop="type">
          <el-select v-model="listQuery.account_id" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="(item, key) in options" :key="key" :label="item.site_code" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Product ID" prop="istore_product_id">
          <el-input type="text" size="mini" v-model="listQuery.istore_product_id" clearable placeholder="多个请用空格分隔"></el-input>
        </el-form-item>
        <el-form-item label="执行结果" prop="state">
          <el-select v-model="listQuery.state" clearable placeholder="请选择">
            <el-option label="未执行" value="0"></el-option>
            <el-option label="执行中" value="1"></el-option>
            <el-option label="成功" value="2"></el-option>
            <el-option label="失败" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="处理时间" prop="update_time" size="mini">
          <el-date-picker v-model="listQuery.update_time" type="datetimerange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss" style="width: 310px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">搜索</el-button>
          <el-button @click="clearSearch('listQuery')">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table
        :key="newDate"
        :data="listData"
        v-loading="listLoading"
        border
        :max-height="maxHeight"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" sortable :sort-method="(a,b) => a-b" align="center"></el-table-column>
        <el-table-column prop="site_code" label="Site Code" width="160" align="center"></el-table-column>
        <el-table-column prop="istore_product_id" label="Product ID" min-width="100" align="center"></el-table-column>
        <el-table-column prop="product_image" label="产品图片" width="80" align="center">
          <template slot-scope="scope">
            <picture-view
              v-if="scope.row.product_image && checkPickShow"
              :pictureList="[scope.row.picture]"
              :width="50"
              :height="50"
              :thumbnail="false"
              :defaultProps="defaultProps"
            >
            </picture-view>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="product_name" label="名称" min-width="240" align="center">
          <template slot-scope="scope">
            <a style="color: #409EFF;" :href="'https://fr.shopping.rakuten.com/offer/buy/' + scope.row.spu_id" target="_blank">{{
              scope.row.product_name.trim() }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="follow_price" label="跟卖最低价" min-width="100" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.follow_price">{{ scope.row.follow_price }}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="store_name" label="跟卖店铺" min-width="120" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.store_name">{{ scope.row.store_name }}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="discount_price" label="在售价" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.discount_price">{{ scope.row.discount_price }}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="base_price" label="保本价" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.base_price">{{ scope.row.base_price }}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="state" label="执行结果" align="center" width="100">
          <template slot-scope="scope">
            <el-tag type="info" size="small" v-if="scope.row.state === 0">未执行</el-tag>
            <el-tag type="warning" size="small" v-else-if="scope.row.state === 1">进行中</el-tag>
            <el-tag type="success" size="small" v-else-if="scope.row.state === 2">执行成功</el-tag>
            <el-tag type="danger" size="small" v-else-if="scope.row.state === 3">执行失败</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price_change" label="处理内容" min-width="120" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.price_change">{{ scope.row.price_change }}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="update_time" label="处理时间" width="170" sort-by="update_time" align="center" sortable>
          <template slot-scope="scope" v-if="scope.row.update_time !== no_time && scope.row.update_time !== default_time">
            <span>{{ scope.row.update_time }}</span>
          </template>
        </el-table-column>
        <el-table-column label="原因" min-width="180" align="center" prop="message">
          <template slot-scope="scope">
            <span v-if="scope.row.message">{{ scope.row.message }}</span>
            <span v-else>--</span>
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
          :page-sizes="[10, 20, 30, 50]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { followUpPriceMonitorList, getSelectAll } from '@/api/priceminister'

export default {
  data() {
    return {
      no_time: 0,
      default_time: '1970-01-01 08:00:00',
      // 权限管理
      permissions: {
        info: 'priceminister.advt.product-upload-plan.info', // 详情
        add: 'priceminister.advt.product-upload-plan.add-plan' // 添加计划
      },
      newDate: new Date().getTime(),
      status: '状态 ',
      title: '类型 ',
      filterTypeIcon: 'filter',
      filterStatusIcon: 'filter',
      maxHeight: document.documentElement.clientHeight - 200,
      listData: [],
      listLoading: true,
      listQuery: {
        page: 1,
        per_page: 10,
        account_id: undefined,
        state: undefined,
        istore_product_id: undefined,
        update_time: undefined
      },
      pagination: null,
      options: {},
      defaultProps: {
        originalKey: 'original',
        thumbnailKey: 'thumbnail'
      },
      checkPickShow: true
    }
  },
  created() {
    this.searchItem()
    this.getList()
    this.maxHeight = this.maxHeight < 200 ? 200 : this.maxHeight
  },
  mounted() {
    const that = this
    window.onresize = () => {
      return (() => {
        window.maxHeight = document.documentElement.clientHeight - 200
        that.maxHeight = window.maxHeight < 200 ? 200 : window.maxHeight
      })()
    }
  },
  methods: {
    searchItem() {
      getSelectAll().then(response => {
        this.options = this._.assign(this.options, response.data.PmAdvtAccount || {})
      })
    },
    getList() {
      this.listLoading = true
      let param = {
        page: this.listQuery.page || undefined,
        per_page: this.listQuery.per_page || undefined,
        account_id: this.listQuery.account_id || undefined,
        state: this.listQuery.state || undefined,
        istore_product_id: this.listQuery.istore_product_id ? this.listQuery.istore_product_id.replace(/,/g, ' ') : undefined,
        start_update_time: Array.isArray(this.listQuery.update_time) ? this.listQuery.update_time[0]: undefined,
        end_update_time: Array.isArray(this.listQuery.update_time) ? this.listQuery.update_time[1]: undefined
      }
      followUpPriceMonitorList(param).then(response => {
        this.listData = response.data.list
        this.pagination = response.data.pagination
        this._.forEach(this.listData, (v) => {
          v.picture = {
            thumbnail: v.thumb_image_path,
            original: v.product_image
          }
        })
        // this.cloneDeep('listData', [])
        this.checkPickShow = false
        this.$nextTick(() => {
          this.checkPickShow = true
        })
        document.querySelector('.el-table__body-wrapper').scrollTop = 0
      }).finally(_ => {
        this.listLoading = false
      })
    },
    handleSizeChange(val) {
      this.listQuery.page = 1
      this.listQuery.per_page = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    clearSearch(formName) {
      this.listQuery = {
        page: 1,
        per_page: 10,
        account_id: undefined,
        state: undefined,
        istore_product_id: undefined,
        update_time: undefined
      }
      this.$refs[formName].resetFields()
      this.newDate = new Date().getTime()
      this.filterTypeIcon = 'filter'
      this.filterStatusIcon = 'filter'
      this.getList()
    },
    handleFilter() {
      this.listQuery.page = 1
      this.newDate = new Date().getTime()
      this.filterTypeIcon = 'filter'
      this.filterStatusIcon = 'filter'
      this.getList()
    },
    // 状态筛选
    filterStatus(value, row) {
      return row.status === value
    }
  },
  watch: {
    maxHeight(val) {
      if (!this.timer) {
        this.maxHeight = val
        this.timer = true
        const that = this
        setTimeout(function() {
          that.timer = false
        }, 400)
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .el-popover {
    max-height: 400px !important;
    overflow-y: auto !important;
  }
</style>
