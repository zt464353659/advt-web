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
        <el-table-column prop="id" label="ID" width="100"></el-table-column>
        <el-table-column prop="ctime" label="更新时间" width="260">
          <template slot-scope="scope" v-if="parseInt(scope.row.ctime) > 0">{{ parseInt(scope.row.ctime) | moment('YYYY-MM-DD HH:mm') }}</template>
        </el-table-column>
        <el-table-column prop="content" label="istore描述">
          <template slot-scope="scope">
            <el-tooltip placement="bottom">
              <div slot="content" v-html="scope.row.content"></div>
              <div>
                <div style="display: inline-block" v-html="scope.row.content.substring(0, 120)"></div>
                <span v-if="scope.row.content.length > 120">...</span>
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <div class="scopeBtn" v-if="scope.row.verify === 0">
              <el-button type="text" size="mini" @click="noticeTip(scope.row.id, 1)">审核</el-button>
              <el-button type="text" size="mini" @click="noticeTip(scope.row.id, 0)">取消提醒</el-button>
            </div>
            <div class="scopeBtn" v-if="scope.row.verify === 1">
              <span>已审核</span>
              <span>取消提醒</span>
            </div>
            <div class="scopeBtn" v-if="scope.row.verify === 2">
              <span>审核</span>
              <span>已取消</span>
            </div>
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
  import { getIstore, notice } from '@/api/allegro'
  import { filterQueryParams } from '@/utils/help'

  export default {
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
        this.listLoading = true
        queryParams.advt_id = this.$route.params.id
        getIstore(queryParams).then((res) => {
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
      },
      noticeTip(id, val) {
        const obj = {
          notice_id: id,
          apply: val
        }
        notice(obj).then().finally(() => {
          this.renderList()
        })
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
