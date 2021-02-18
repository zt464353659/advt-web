<template>
  <div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table :data="listData"
                ref="table"
                v-loading.lock="listLoading"
                element-loading-text="努力加载中"
                border
                style="width: 100%"
                highlight-current-row
      >
        <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
        <el-table-column prop="user" label="操作人" align="center"></el-table-column>
        <el-table-column prop="varyId" label="vary子ID" v-if="showVaryId" align="center"></el-table-column>
        <el-table-column prop="creat_time" label="操作时间" align="center"></el-table-column>
        <el-table-column prop="operate_type" label="操作类型" align="center"></el-table-column>
        <el-table-column prop="operate_before" label="变更前" align="center"></el-table-column>
        <el-table-column prop="operate_after" label="变更后" align="center"></el-table-column>
        <el-table-column prop="online_time" label="有效/在线天数" align="center"></el-table-column>
      </el-table>
      <!--分页-->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper" small
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="listQuery.page"
          :page-sizes="[10, 20, 30, 50, 100, 200]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { filterQueryParams } from '../../../../../utils/help'
import { getOperationLog } from '@/api/cdiscount'

export default {
  props: {
    advtId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    showVaryId: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      listData: [],
      listLoading: false,
      pagination: null,
      listQuery: {
        page: 1,
        per_page: 10
      }
    }
  },
  created() {
    this.renderList()
  },
  mounted() {
  },
  methods: {
    renderList() {
      this.listData = []
      const queryParams = filterQueryParams(this.listQuery)
      queryParams.status = this.status
      queryParams.advtId = this.advtId
      this.listLoading = true
      getOperationLog(queryParams).then((res) => {
        this.listData = res.data.list
        this.pagination = res.data.pagination
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.renderList()
    },
    handleSizeChange(val) {
      this.listQuery.page = 1
      this.listQuery.per_page = val
      this.renderList()
    }
  },
  filters: {},
  watch: {}
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .scopeBtn > span {
    display: inline-block;
    padding: 0 6px;
    color: #8b8b8b;
    font-size: 12px;
  }
</style>
