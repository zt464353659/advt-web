<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="Product ID" prop="istore_product_id">
          <el-input v-model="listQuery.istore_product_id" size="mini" placeholder="多个请用空格隔开"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <el-row class="right-row">
        <el-button type="primary" size="mini" @click="append">新增产品</el-button>
        <el-button type="danger" size="mini" :disabled="setPriceArr.length === 0" @click="handleDelete(setPriceArr, 'all')">批量删除</el-button>
        <el-button type="warning" size="mini" @click="exportP">导出</el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table
        :key="newDate"
        :data="listData"
        v-loading="listLoading"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="100" align="center"></el-table-column>
        <el-table-column prop="id" label="ID" width="100" align="center"></el-table-column>
        <el-table-column prop="istore_product_id" label="product ID" align="center"></el-table-column>
        <el-table-column prop="create_time" label="创建时间" align="center" sort-by="create_time" sortable>
          <template slot-scope="scope" v-if="parseInt(scope.row.create_time) > 0">{{ parseInt(scope.row.create_time) | moment('YYYY-MM-DD HH:mm') }}</template>
        </el-table-column>
        <el-table-column prop="user_name" label="操作人" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="handleDelete(scope.row, 'single')">删除</el-button>
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
          :current-page="listQuery.pages"
          :page-sizes="[10, 20, 50, 100, 200]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
    <append-product v-bind.sync="productOptions" @renderList="renderList"></append-product>
    <export-product v-bind.sync="exportOptions" @renderList="renderList"></export-product>
  </div>
</template>

<script>
  import appendProduct from './compoments/appendProduct'
  import exportProduct from './compoments/exportProduct'
  import { salesList, salesDelete } from '@/api/shopee'
  import { filterQueryParams } from '@/utils/help'

  export default {
    components: { appendProduct, exportProduct },
    data() {
      return {
        newDate: new Date().getTime(),
        listData: [],
        multipleTable: [],
        listLoading: false,
        pagination: null,
        listQuery: {
          istore_product_id: '',
          pages: 1,
          per_page: 10
        },
        filterTypeIcon: 'filter',
        filterStatusIcon: 'filter',
        productOptions: {
          open: false,
          data: {}
        },
        exportOptions: {
          open: false,
          data: {}
        }
      }
    },
    created() {
      this.renderList()
    },
    mounted() {
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
      // 初始化列表
      renderList() {
        this.listData = []
        this.listLoading = true
        this.listQuery.istore_product_id = this._.trim(this.listQuery.istore_product_id)
        const queryParams = filterQueryParams(this.listQuery)
        salesList(queryParams).then(res => {
          this.listData = res.data.list
          this.pagination = res.data.pagination
        }).finally(() => {
          this.listLoading = false
        })
      },
      // 搜索
      handleFilter() {
        this.listQuery.pages = 1
        this.newDate = new Date().getTime()
        this.filterTypeIcon = 'filter'
        this.filterStatusIcon = 'filter'
        this.renderList()
      },
      // 清空
      clearSearch() {
        this.$refs.listQuery.resetFields()
        this.newDate = new Date().getTime()
        this.filterTypeIcon = 'filter'
        this.filterStatusIcon = 'filter'
        this.renderList()
      },
      // 批量勾选
      handleSelectionChange(val) {
        this.multipleTable = val
      },
      // 分页
      handleSizeChange(val) {
        this.listQuery.pages = 1
        this.listQuery.per_page = val
        this.renderList()
      },
      // 分页
      handleCurrentChange(val) {
        this.listQuery.pages = val
        this.renderList()
      },
      // 新增产品
      append() {
        this.productOptions = {
          open: true,
          data: {}
        }
      },
      // 导出
      exportP() {
        this.exportOptions = {
          open: true,
          data: this.setPriceArr
        }
      },
      // 批量删除
      handleDelete(row, type) {
        let obj = {}
        if (type === 'all') {
          const productIdArr = []
          row.forEach(v => {
            productIdArr.push(v.istore_product_id)
          })
          obj = {
            user_id: this.$store.state.user.info.id,
            istore_product_id: this._.compact(this._.uniq(productIdArr)).join(' ')
          }
        } else {
          obj = {
            user_id: this.$store.state.user.info.id,
            istore_product_id: row.istore_product_id
          }
        }
        this.$confirm('是否确认删除此产品', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          salesDelete(obj).then(() => {
            this.renderList()
          })
        })
      }
    },
    filters: {},
    watch: {}
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
