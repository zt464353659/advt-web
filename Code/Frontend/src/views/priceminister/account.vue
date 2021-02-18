<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-row class="right-row">
        <el-button type="primary" size="mini" icon="el-icon-circle-plus-outline" @click="addOrEditAccount('add')">添加账号</el-button>
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
        <el-table-column prop="channel" label="channel">
        </el-table-column>
        <el-table-column prop="account" label="account" min-width="100">
        </el-table-column>
        <el-table-column prop="key" label="key" min-width="150">
        </el-table-column>
        <el-table-column prop="data.store_name" label="store_name">
        </el-table-column>
        <el-table-column prop="sku_suffix" label="sku_suffix">
        </el-table-column>
        <el-table-column label="request limit" align="center">
          <el-table-column prop="request_limit.add" label="add" align="center" width="80">
          </el-table-column>
          <el-table-column prop="request_limit.edit" label="edit" align="center" width="80">
          </el-table-column>
          <el-table-column prop="request_limit.delete" label="delete" align="center" width="80">
          </el-table-column>
        </el-table-column>
        <el-table-column label="advt_number limit" align="center">
          <el-table-column prop="advt_number_limit.add" label="add" align="center" width="80">
          </el-table-column>
          <el-table-column prop="advt_number_limit.edit" label="edit" align="center" width="80">
          </el-table-column>
          <el-table-column prop="advt_number_limit.delete" label="delete" align="center" width="80">
          </el-table-column>
        </el-table-column>
        <el-table-column label="操作" width="90" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="addOrEditAccount('edit', scope.row)">编辑</el-button>
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
          :page-sizes="[10, 20, 50,100]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
    <!--添加计划弹窗dialog-->
    <add-form v-bind.sync="addAccountOption" @reload="getList"></add-form>
  </div>
</template>

<script>
  import { fetchAccountManager } from '@/api/priceminister'
  import { filterQueryParams } from '@/utils/help'
  import addForm from './account/addAccount'

  export default {
    components: { addForm },
    data() {
      return {
        newDate: new Date().getTime(),
        maxHeight: document.documentElement.clientHeight - 200,
        listData: [],
        listLoading: true,
        listQuery: {
          page: 1,
          per_page: 10
        },
        pagination: null,
        addAccountOption: {
          data: {},
          open: false,
          title: undefined
        }
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
      // 列表信息
      getList() {
        this.listLoading = true
        const queryParams = filterQueryParams(this.listQuery)
        fetchAccountManager(queryParams).then(response => {
          this.listData = response.data.list
          this.pagination = response.data.pagination
          document.querySelector('.el-table__body-wrapper').scrollTop = 0
        }).finally(_ => {
          this.listLoading = false
        })
      },
      addOrEditAccount(option, row) {
        const addAccountOption = {
          rowData: {},
          open: true,
          title: option
        }
        if (option === 'edit') {
          addAccountOption.rowData = {
            store_name: row.data.store_name,
            limit: Number(row.request_limit.add) + Number(row.request_limit.edit) + Number(row.request_limit.delete),
            ...row
          }
        }
        this.addAccountOption = addAccountOption
      },
      handleSizeChange(val) {
        this.listQuery.page = 1
        this.listQuery.per_page = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
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
    }
  }
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .el-popover {
    max-height: 400px !important;
    overflow-y: auto !important;
  }
</style>
