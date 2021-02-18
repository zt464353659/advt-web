<template>
  <el-dialog
    title="日志"
    class="istore-log dialog-limit"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="1300px"
    v-dragMove
  >
    <div class="titile-search" v-show="activeName==='first'">
      <el-form ref="listQuery" :inline="true" :model="listQuery" size="mini">
        <el-form-item label="处理结果" prop="status">
          <el-select v-model="listQuery.status">
            <el-option label="成功" value="10"></el-option>
            <el-option label="失败" value="20"></el-option>
            <el-option label="进行中" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce @click="handleSearch">搜索</el-button>
          <el-button data-type="clear" @click="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <template>
      <div style="height: 100%">
        <el-tabs type="card" v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="系统日志" name="first">
            <el-table :data="systemListData"
                      ref="table"
                      v-loading.lock="systemListLoading"
                      element-loading-text="努力加载中"
                      border
                      max-height="400"
                      class="table-gray"
                      style="width: 100%"
                      highlight-current-row
            >
              <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
              <el-table-column prop="istore_product_id" label="Product ID" align="center"></el-table-column>
              <el-table-column prop="min_price" label="最低价" align="center"></el-table-column>
              <el-table-column prop="store_name" label="最低价店铺" align="center">
              </el-table-column>
              <el-table-column prop="status" label="处理结果" align="center">
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.status===10" type="success">成功</el-tag>
                  <el-tag v-else-if="scope.row.status===20" type="danger">失 败</el-tag>
                  <el-tag v-else-if="scope.row.status===1">进行中</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="content" label="处理内容" align="center"></el-table-column>
              <el-table-column prop="update_time" label="处理时间" align="center"></el-table-column>
              <el-table-column prop="message" label="失败原因" align="center"></el-table-column>
            </el-table>
            <!--分页-->
            <div class="pagination-container">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="systemHandleSizeChange"
                @current-change="systemHandleCurrentChange"
                :current-page="getSystemQiue.page"
                :page-sizes="[ 20, 50,100,200]"
                :page-size="getSystemQiue.per_page"
                :total="systemPagination ? systemPagination.total : 0"
              >
              </el-pagination>
            </div>
          </el-tab-pane>
          <el-tab-pane label="操作日志" name="second">
            <el-table :data="operationListData"
                      ref="table"
                      v-loading.lock="operationListLoading"
                      element-loading-text="努力加载中"
                      border
                      max-height="400"
                      class="table-gray"
                      style="width: 100%"
                      highlight-current-row
            >
              <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
              <el-table-column prop="istore_product_id" label="Product ID" width="100" align="center"></el-table-column>
              <el-table-column label="内容" align="center" class-name="content">
                <template slot-scope="scope">
                  <span v-html="scope.row.content"></span>
                </template>
              </el-table-column>
              <el-table-column prop="user_name" label="操作人" width="120" align="center"></el-table-column>
              <el-table-column prop="update_time" label="操作时间" width="160" align="center"></el-table-column>
            </el-table>
            <!--分页-->
            <div class="pagination-container">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="operationHandleSizeChange"
                @current-change="operationHandleCurrentChange"
                :current-page="getOperationQiue.page"
                :page-sizes="[ 20, 50,100,200]"
                :page-size="getOperationQiue.per_page"
                :total="operationPagination ? operationPagination.total : 0"
              >
              </el-pagination>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { filterQueryParams } from '@/utils/help'
import { createFollowLog } from '@/api/cdiscount'

export default {
  mixins: [],
  filters: {},
  components: {},
  props: {
    open: {
      type: Boolean,
      required: true,
      default: false
    },
    advtid: {
      type: [Number, String],
      required: true,
      default: ''
    }
  },
  data() {
    return {
      activeName: 'first',
      //系统日志
      getSystemQiue: {
        page: 1,
        per_page: 20,
        type: 2
      },
      systemPagination: {},
      systemListData: [],
      systemListLoading: false,
      //操作日志
      getOperationQiue: {
        page: 1,
        per_page: 20,
        type: 1
      },
      operationPagination: {},
      operationListData: [],
      operationListLoading: false,
      //搜索
      listQuery: {
        status: undefined
      }
    }
  },
  computed: {},
  watch: {
    open(val) {
      if (val) {
        this.getSystemList()
      }
    }
  },
  created() {

  },
  mounted() {
  },
  destroyed() {
  },
  methods: {
    //搜索
    handleSearch() {
      this.getSystemQiue.page = 1
      this.getSystemList()
    },
    //清空
    clearSearch() {
      this.getSystemQiue.page = 1
      this.getSystemQiue.status = undefined
      this.$refs.listQuery.resetFields()
      this.getSystemList()
    },
    //系统日志
    getSystemList() {
      this.systemListData = []
      this.systemListLoading = true
      this.getSystemQiue.status = this.listQuery.status
      const queryParams = filterQueryParams(this.getSystemQiue)
      queryParams.follow_id = this.advtid
      createFollowLog(queryParams).then(res => {
        this.systemListData = res.data.list
        this.systemPagination = res.data.pagination
      }).finally(() => {
        this.systemListLoading = false
      })
    },
    systemHandleCurrentChange(val) {
      this.getSystemQiue.page = val
      this.getSystemList()
    },
    systemHandleSizeChange(val) {
      this.getSystemQiue.page = 1
      this.getSystemQiue.per_page = val
      this.getSystemList()
    },
    //操作日志
    getOperationList() {
      this.operationListData = []
      this.operationListLoading = true
      const queryParams = filterQueryParams(this.getOperationQiue)
      queryParams.follow_id = this.advtid
      createFollowLog(queryParams).then(res => {
        this.operationListData = res.data.list
        this.operationPagination = res.data.pagination
      }).finally(() => {
        this.operationListLoading = false
      })
    },
    operationHandleCurrentChange(val) {
      this.getOperationQiue.page = val
      this.getOperationList()
    },
    operationHandleSizeChange(val) {
      this.getOperationQiue.page = 1
      this.getOperationQiue.per_page = val
      this.getOperationList()
    },
    handleClick(tab, event) {
      if (tab.name === 'first') {
        //系统日志
        this.getSystemQiue.page = 1
        this.getSystemList()
      } else {
        this.getOperationQiue.page = 1
        this.getOperationList()
      }
    },
    onClose() {
      this.getSystemQiue = {
        page: 1,
        per_page: 20,
        type: 2
      }
      this.getOperationQiue = {
        page: 1,
        per_page: 20,
        type: 1
      }
      this.$refs.listQuery.resetFields()
      this.activeName = 'first'
      this.$emit('update:open', false)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
<style rel="stylesheet/scss" lang="scss">
.istore-log {
  .el-dialog .el-dialog__body {
    max-height: 700px;
    overflow: auto;
  }

  .el-dialog__body {
    padding: 0px;
  }


  .el-tabs__content {
    height: calc(100% - 58px);
    overflow: auto;
  }

  .titile-search {
    padding: 20px 0 0 20px;
  }
}

.content {
  .cell {
    text-align: left;
  }
}
</style>
