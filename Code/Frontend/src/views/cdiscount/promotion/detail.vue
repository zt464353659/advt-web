<template>
  <div>
    <h3>当前活动是：{{ $route.params.salename }}</h3>
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="Product ID" prop="productId">
          <el-input v-model="listQuery.productId" clearable placeholder="多个请用空格分隔" style="width: 200px;">
          </el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="listQuery.status" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="item in options" :key="item.status" :label="item.value" :value="item.status"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <!-- 列表操作 -->
      <el-row class="right-row">
        <el-button size="mini" type="danger" :disabled="multipleList.length === 0" @click="buttonAction('cancel')" v-permission="permissions.endSale">批量取消不更新</el-button>
        <el-button size="mini" type="danger" @click="buttonAction('allCancel')" v-permission="permissions.endSale">全部取消不更新</el-button>
        <el-button size="mini" type="primary" @click="buttonAction('add')" :disabled="routerTime < nowTime" v-permission="permissions.addAdvt">添加</el-button>
      </el-row>
      <el-table
        ref="listTable"
        :key="newDate"
        :data="listData"
        v-loading="listLoading"
        border
        style="width: 100%"
        @header-click="handleExpand"
        @select-all="handleSelectionChange"
        @select="handleSelectionChange"
        @selection-change="selectionChange"
        @sort-change="tableResortEvent"
        @filter-change="handleFilterChange"
      >
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column prop="rank" label="序号" min-width="60" align="center" sortable></el-table-column>
        <el-table-column prop="site_code" label="账号" min-width="60" align="center"></el-table-column>
        <el-table-column prop="product_id" label="Product ID" align="center"></el-table-column>
        <el-table-column prop="sku" label="sku" align="center"></el-table-column>
        <el-table-column prop="status" label="状态" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 0">价格不更新</el-tag>
            <el-tag type="success" v-else-if="scope.row.status === 1">取消价格不更新</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              v-if="scope.row.status === 3"
              v-debounce
              size="mini"
              @click="buttonAction('setSale', scope.row)"
              v-permission="permissions.openSale"
            >
              设置不更新
            </el-button>
            <el-button
              type="text"
              v-debounce size="mini"
              v-if="scope.row.status === 0"
              @click="buttonAction('cancel', scope.row)"
              v-permission="permissions.endSale"
            >
              取消不更新
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <div class="pagination-container">
        <el-pagination
          background layout="total, sizes, prev, pager, next, jumper" small
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="listQuery.page"
          :page-sizes="[ 10, 20, 50,100]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
    <!--  添加广告  -->
    <add-advt v-bind.sync="addOption" @renderList="renderList"></add-advt>
  </div>
</template>

<script>
import { filterQueryParams } from '@/utils/help'
import { fetchSaleInfoList, fetchOpenSale, fetchEndSale } from '@/api/cdiscount'
import addAdvt from './components/addAdvt'

export default {
  components: {
    addAdvt
  },
  data() {
    return {
      nowTime: new Date().getTime(),
      routerTime: new Date(this.$route.params.time).getTime(),
      listQuery: {
        per_page: 10, //  每页几条
        page: 1, //  第几页
        saleId: '', // 活动Id
        productId: undefined, //  广告ID
        status: undefined // 广告状态
      },
      options: [
        {
          value: '价格不更新',
          status: '0'
        },
        {
          value: '取消价格不更新',
          status: '1'
        }
        // {
        //   value: '价格更新中',
        //   status: '2'
        // },
        // {
        //   value: '价格已更新',
        //   status: '3'
        // }
      ],
      listLoading: false,
      newDate: new Date().getTime(),
      listData: [],
      expand: true,
      pagination: null,
      importOption: {
        saleId: '',
        open: false
      },
      addOption: {
        data: {},
        open: false
      },
      sale_info: {
        sale_name: '', // 活动名称
        account: '' // 账号
      },
      multipleTable: [],
      multipleList: [], // 结束促销和删除促销list
      params: {
        not_show_message: true
      },
      permissions: {
        addAdvt: 'cdiscount.advt.sale.add-product',
        openSale: 'cdiscount.advt.sale.open-sale',
        endSale: 'cdiscount.advt.sale.end-sale'
      }
    }
  },
  created() {
    this.renderList()
    //const now = new Date().getTime()

    // .log(this.routerTime < now, now)
  },
  mounted() {
  },
  methods: {
    renderList() {
      this.listLoading = true
      this.expand = true
      this.listData = null
      const params = {
        per_page: this.listQuery.per_page, //  每页几条
        page: this.listQuery.page, //  第几页
        saleId: this.$route.params.saleId, // 活动Id
        productId: this.listQuery.productId ? this.listQuery.productId.trim() : this.listQuery.productId, //  广告ID
        status: this.listQuery.status // 广告状态
      }
      const queryParams = filterQueryParams(params)
      fetchSaleInfoList(queryParams).then(response => {
        this.listData = response.data.list
        this.pagination = response.data.pagination
        this.listLoading = false
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
    clearSearch() {
      this.$refs.listQuery.resetFields()
      this.newDate = new Date().getTime()
      this.filter = 'filter'
      this.renderList()
    },
    handleExpand(column) {
      if (column.type === 'expand') {
        this.expand = !this.expand
        // 强制刷新DOM
        this.newDate = new Date().getTime()
      }
    },
    handleSelectionChange(val) {
      if (val.length > 0) {
        this.multipleList = []
        this._.forEach(val, v => {
          if (v.status === 0) {
            this.multipleList.push(v.id)
          }
        })
      } else {
        this.multipleList = []
      }
    },
    handleSelectionRow(val, row) {
      this._.forEach(val, value => {
        if (val.status === 0) {
          this.multipleList.push(value.id)
        }
      })
    },
    selectionChange(val) {
      this.multipleTable = val
      this.checkNum++
    },
    // 清理缩略图缓存
    tableResortEvent() {
      this.checkPickShow = false
      this.$nextTick(() => {
        this.checkPickShow = true
      })
    },
    // 筛选图标处理
    handleFilterChange(type) {
      if (type.type.length === 0) {
        this.filter = 'filter'
        document.querySelector('.el-table th>.cell>span>svg').style.color = '#c0c4cc'
      } else {
        this.filter = 'filter-in'
        document.querySelector('.el-table th>.cell.highlight>span>svg').style.color = '#f00'
      }
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

    /* 列表上方操作事件 */
    buttonAction(type, data) {
      if (type === 'setSale') {
        const params = {
          sale_product_id: data.id
        }
        fetchOpenSale(params).then(res => {
          this.renderList()
        }).catch(err => {

        })
      } else if (type === 'cancel') {
        /* 批量取消不更新*/
        this.$confirm('你确定要取消不更新吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          closeOnClickModal: false,
          type: 'warning'
        }).then(res => {
          this.endSale(type, data)
        }).catch(err => {

        })
      } else if (type === 'allCancel') {
        /* 全部取消不更新 */
        this.$confirm('你确定要全部取消不更新吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          closeOnClickModal: false,
          type: 'warning'
        }).then(res => {
          this.endSale(type, data)
        }).catch(err => {

        })
      } else if (type === 'add') {
        /* 添加 */
        this.addOption = {
          data: {
            sale_id: this.$route.params.saleId
          },
          open: true
        }
        this.renderList()
      }
    },
    endSale(type, data) {
      let obj = {}
      if (type === 'allCancel') {
        obj.sale_id = this.$route.params.saleId
      } else {
        obj.sale_product_id = data ? [data.id] : this.multipleList
      }
      fetchEndSale(obj).then(res => {
        this.multipleList = []
        this.renderList()
      }).catch(err => {

      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
