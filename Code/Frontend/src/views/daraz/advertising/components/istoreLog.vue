<template>
  <el-dialog
    title="日志"
    class="istore-log"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="1100px"
    v-dragMove
  >
    <el-form ref="searchParams" size="small" :inline="true" class="form-search" :model="searchParams">
      <el-form-item label="操作类型" prop="log_type">
        <el-select v-model="searchParams.log_type" clearable placeholder="请选择" style="width: 120px;">
          <el-option v-for="item in logOptions" :key="item.value" :label="item.value" :value="item.label"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="操作结果" prop="result_status">
        <el-select v-model="searchParams.result_status" clearable placeholder="请选择" style="width: 120px;">
          <el-option v-for="item in resultOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="search">搜索</el-button>
        <el-button size="mini" @click="clearSearchParams">清空</el-button>
      </el-form-item>
    </el-form>
    <!-- 列表 -->
    <div>
      <el-table :data="listData"
                ref="table"
                v-loading.lock="listLoading"
                element-loading-text="努力加载中"
                border
                class="table-gray"
                style="width: 100%"
                highlight-current-row
      >
        <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
        <el-table-column prop="istore_product_id" label="istore Product ID" width="140"></el-table-column>
        <el-table-column prop="type" label="操作类型"></el-table-column>
        <el-table-column prop="operate_type" label="操作" width="50"></el-table-column>
        <el-table-column prop="result_status" label="操作结果"></el-table-column>
        <el-table-column prop="message" label="内容" width="350">
          <template slot-scope="scope">
            <div v-if="!scope.row.message">{{ String(scope.row.message) }}</div>
            <div v-else-if="scope.row.message.length < 50">{{ scope.row.message }}</div>
            <div v-else>
              <el-popover placement="top" width="480" trigger="hover">
                <p style="line-height: 24px; font-size: 12px; word-wrap: break-word; max-height: 400px; overflow-y: auto;">{{ scope.row.message }}</p>
                <p slot="reference" class="in-a-line" style="width: 100%; color: #E6A23C; margin: 0;">{{ String(scope.row.message).slice(0, 50) }}</p>
              </el-popover>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="update_time" label="操作时间" width="170">
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
          :page-sizes="[ 10, 20, 40]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { filterQueryParams } from '@/utils/help'
import { getChangeLog } from '@/api/daraz'

export default {
  name: 'IstoreLogs',
  props: {
    advtId: {
      type: [String, Number],
      required: true,
      default: ''
    },
    open: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  data() {
    return {
      logOptions: [],
      resultOptions: [
        { label: '等待执行', value: '0' },
        { label: '执行失败', value: '1' },
        { label: '执行成功', value: '2' }
      ],
      searchParams: {
        log_type: undefined,
        result_status: undefined
      },
      listData: [],
      listLoading: false,
      pagination: null,
      listQuery: {
        page: 1,
        per_page: 10
      }
    }
  },
  methods: {
    search() {
      this.renderList()
    },
    clearSearchParams() {
      this.listQuery.page = 1
      this.$refs['searchParams'].resetFields()
      this.search()
    },
    renderList() {
      this.listData = []
      const queryParams = filterQueryParams(Object.assign(this.listQuery, this.searchParams))
      queryParams.status = this.status
      queryParams.advtId = this.advtId
      this.listLoading = true
      getChangeLog(queryParams).then((res) => {
        this.listData = res.data.list
        this.logOptions = res.data.type
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
    onClose() {
      this.listQuery = {
        page: 1,
        per_page: 10
      }
      this.$refs['searchParams'].resetFields()
      this.$emit('update:open', false)
    }
  },
  filters: {},
  watch: {
    open(val) {
      if (val) {
        this.renderList()
      }
    }
  }
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
<style rel="stylesheet/scss" lang="scss">
.istore-log {
  .el-dialog .el-dialog__body {
    max-height: 700px;
    overflow: auto;
  }

  .el-dialog__body {
    padding: 0;
  }
}

.form-search {
  margin-top: 20px;
  margin-left: 20px;
}
</style>
