<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="Product ID" prop="istore_product_id">
          <el-input size="mini" v-model="listQuery.istore_product_id" clearable placeholder="多个请用空格分隔"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <el-row class="right-row">
        <el-button type="primary" size="mini" @click="addNoUpdate" v-permission="permissions.add">添加/取消产品</el-button>
      </el-row>
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
        <el-table-column prop="istore_product_id" label="Product ID" align="center"></el-table-column>
        <el-table-column prop="site_code" label="Site Code" align="center"></el-table-column>
        <el-table-column prop="spu_id" label="平台商品号" align="center">
          <template slot-scope="scope">
            {{ Number(scope.row.spu_id) === 0 ? '--' : scope.row.spu_id }}
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="不更新类型" align="center"></el-table-column>
        <el-table-column prop="user_name" label="操作人" align="center"></el-table-column>
        <el-table-column prop="update_time" label="操作时间" align="center"></el-table-column>
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
    <!--添加指定不更新产品-->
    <add-form v-bind.sync="addNoUpdateProduct" @reload="getList"></add-form>
  </div>
</template>

<script>
  import { noUpdateList } from '@/api/kr11street'
  import addForm from './noUpdate/addNoUpdate'
  import { filterQueryParams } from '@/utils/help'

  export default {
    components: { addForm },
    data() {
      return {
        permissions: {
          cancle: 'kr11street.advt.set-update.un-set-not-update',
          add: 'kr11street.advt.set-update.set-not-update'
        },
        newDate: new Date().getTime(),
        maxHeight: document.documentElement.clientHeight - 200,
        addNoUpdateProduct: {
          open: false
        },
        listData: [],
        listLoading: false,
        listQuery: {
          istore_product_id: '',
          page: 1,
          per_page: 10
        },
        pagination: null
      }
    },
    created() {
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
      getList() {
        this.listData = []
        this.listLoading = true
        this.listQuery.istore_product_id = this.listQuery.istore_product_id.trim()
        const queryParams = filterQueryParams(this.listQuery)
        noUpdateList(queryParams).then(response => {
          this.listData = response.data.list
          this.pagination = response.data.pagination
          document.querySelector('.el-table__body-wrapper').scrollTop = 0
        }).finally(() => {
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
      addNoUpdate() {
        this.addNoUpdateProduct = {
          open: true
        }
      },
      clearSearch() {
        this.$refs.listQuery.resetFields()
        this.newDate = new Date().getTime()
        this.getList()
      },
      handleFilter() {
        this.listQuery.page = 1
        this.newDate = new Date().getTime()
        this.getList()
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
    },
    filters: {
    }
  }
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .el-popover {
    max-height: 400px !important;
    overflow-y: auto !important;
  }
</style>
