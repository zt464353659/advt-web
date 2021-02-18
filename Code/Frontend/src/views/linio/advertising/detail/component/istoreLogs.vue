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
        <el-table-column prop="istore_product_id" label="istore Product ID"></el-table-column>
        <el-table-column prop="type" label="操作类型"></el-table-column>
        <el-table-column prop="operate_type" label="操作"></el-table-column>
        <el-table-column prop="result_status" label="操作结果"></el-table-column>
        <el-table-column prop="message" label="内容" width="750">
          <template slot-scope="scope">
            <div v-if="!scope.row.message">{{ String(scope.row.message) }}</div>
            <div v-else-if="scope.row.message.length < 210">{{ scope.row.message }}</div>
            <div v-else>
              <el-popover placement="top" width="480" trigger="hover">
                <p style="line-height: 24px; font-size: 12px; word-wrap: break-word; max-height: 400px; overflow-y: auto;">{{ scope.row.message }}</p>
                <p slot="reference" class="in-a-line" style="width: 100%; color: #E6A23C; margin: 0;">{{ String(scope.row.message).slice(0,200) }}</p>
              </el-popover>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="update_time" label="操作时间">
          <template slot-scope="scope">
            {{ scope.row.update_time ? scope.row.update_time : scope.row.create_time }}
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
          :page-sizes="[ 20, 40, 60, 100]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
  import { filterQueryParams } from '@/utils/help'
  import { getChangeLog } from '@/api/linio'

  export default {
    name: 'IstoreLogs',
    props: {
      advtId: {
        type: [String, Number],
        required: true,
        default: ''
      }
    },
    data() {
      return {
        listData: [],
        listLoading: false,
        pagination: null,
        listQuery: {
          page: 1,
          per_page: 20
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
        queryParams.advt_id = this.advtId
        this.listLoading = true
        getChangeLog(queryParams).then((res) => {
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
