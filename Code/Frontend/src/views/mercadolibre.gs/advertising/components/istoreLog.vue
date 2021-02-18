<template>
  <el-dialog
    title="日志"
    class="istore-log dialog-limit-height-has-btn"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="1300px"
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
    <div class="content-box">
      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane label="操作日志" name="second">
          <el-table :data="operationListData"
                    :span-method="objectSpanMethod"
                    ref="table"
                    v-loading.lock="operationListLoading"
                    element-loading-text="努力加载中"
                    border
                    class="table-gray"
                    style="width: 100%"
                    highlight-current-row
          >
            <el-table-column prop="index" label="序号" width="50" align="center"/>
            <el-table-column prop="istore_product_id" label="iStore Product ID" width="140" align="center"></el-table-column>
            <el-table-column prop="type" label="操作类型" align="center"></el-table-column>
            <el-table-column prop="operate_type" label="操作" align="center"></el-table-column>
            <el-table-column prop="edit_field" label="编辑字段" align="center"></el-table-column>
            <el-table-column prop="sub_product_id" label="子id" align="center"></el-table-column>
            <el-table-column label="内容" width="200" align="center">
              <template slot-scope="scope">
                <div v-if="!scope.row.content">{{ String(scope.row.content) }}</div>
                <div v-else-if="scope.row.content.length < 50">{{ scope.row.content }}</div>
                <div v-else>
                  <el-popover placement="top" width="480" trigger="hover">
                    <p style="line-height: 24px; font-size: 12px; word-wrap: break-word; max-height: 400px; overflow-y: auto;">{{ scope.row.content }}</p>
                    <p slot="reference" class="in-a-line" style="width: 100%; color: #E6A23C; margin: 0;">{{ String(scope.row.content).slice(0, 50) }}</p>
                  </el-popover>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="result_status" label="操作结果" align="center"></el-table-column>
            <el-table-column prop="reason" label="失败原因" align="center">
              <template slot-scope="scope">
                <div v-if="!scope.row.reason">{{ String(scope.row.reason) }}</div>
                <div v-else-if="scope.row.reason.length < 50">{{ scope.row.reason }}</div>
                <div v-else>
                  <el-popover placement="top" width="480" trigger="hover">
                    <p style="line-height: 24px; font-size: 12px; word-wrap: break-word; max-height: 400px; overflow-y: auto;">{{ scope.row.reason }}</p>
                    <p slot="reference" class="in-a-line" style="width: 100%; color: #E6A23C; margin: 0;">{{ String(scope.row.reason).slice(0, 50) }}</p>
                  </el-popover>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="user_name" label="操作人" align="center"></el-table-column>
            <el-table-column prop="create_time" label="操作时间" width="170" align="center">
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
              @size-change="operationHandleSizeChange"
              @current-change="operationHandleCurrentChange"
              :current-page="operationListQuery.page"
              :page-sizes="[ 10, 20, 40]"
              :page-size="operationListQuery.per_page"
              :total="operationPagination ? operationPagination.total : 0"
            >
            </el-pagination>
          </div>
        </el-tab-pane>
        <el-tab-pane label="系统日志" name="first">
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
            <el-table-column prop="istore_product_id" label="iStore Product ID" width="140"></el-table-column>
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
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>

<script>
import { filterQueryParams } from '@/utils/help'
import { getChangeLog } from '@/api/mercadolibre.gs'

function filterArray(item) {
  const valueArray = this.rule.filter(prop => {
    return item[prop] === this.data[prop]
  })
  if (valueArray.length === this.rule.length) {
    return true
  } else {
    return false
  }
}

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
      activeName: 'second',
      listData: [],
      listLoading: false,
      pagination: null,
      listQuery: {
        page: 1,
        per_page: 10,
        type: 1
      },
      operationListQuery: {
        page: 1,
        per_page: 10,
        type: 2
      },
      operationListData: [],
      operationPagination: null,
      operationListLoading: false,
      spanRule: {
        rule: {
          0: ['index'],
          1: ['index', 'istore_product_id'],
          2: ['index', 'istore_product_id', 'type'],
          3: ['index', 'istore_product_id', 'type', 'operate_type'],
          4: ['index', 'istore_product_id', 'edit_field'],
          7: ['index', 'istore_product_id', 'type', 'operate_type', 'result_status'],
          8: ['index', 'istore_product_id', 'type', 'operate_type', 'reason'],
          9: ['index', 'istore_product_id', 'type', 'operate_type', 'user_name'],
          10: ['index', 'istore_product_id', 'type', 'operate_type', 'update_time']
        }
      }
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    search() {
      if (this.activeName === 'first') {
        this.renderList()
      } else {
        this.ULogRenderList()
      }
    },
    clearSearchParams() {
      this.listQuery.page = 1
      this.operationListQuery.page = 1
      this.$refs['searchParams'].resetFields()
      this.search()
    },
    // 表格合并
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      let newSpanRule = {}

      if (Object.keys(this.spanRule.rule).includes(columnIndex.toString())) {
        // filter验证数组
        const currentTable = {
          rule: this.spanRule.rule[columnIndex],
          data: this.operationListData[rowIndex]
        }
        // 该单元格是否被合并 true 合并， false : 不合并
        let chooseSpan = false
        if (rowIndex !== 0) {
          chooseSpan = filterArray.call(currentTable, this.operationListData[rowIndex - 1])
        }
        if (chooseSpan) {
          return {
            rowspan: 0,
            colspan: 0
          }
        } else {
          return {
            rowspan: this.operationListData.filter(filterArray, currentTable).length,
            colspan: 1
          }
        }
      }
    },
    operationHandleCurrentChange(val) {
      this.operationListQuery.page = val
      this.ULogRenderList()
    },
    operationHandleSizeChange(val) {
      this.operationListQuery.page = 1
      this.operationListQuery.per_page = val
      this.ULogRenderList()
    },
    handleClick() {
      this.clearSearchParams()
    },
    ULogRenderList() {
      this.listData = []
      const queryParams = filterQueryParams(Object.assign(this.operationListQuery, this.searchParams))
      queryParams.advt_id = this.advtId
      this.operationListLoading = true
      getChangeLog(queryParams).then((res) => {
        const list = []
        this._.forEach(res.data.list, (v, ind) => {
          if (!this._.isEmpty(v.data)) {
            this._.forEach(v.data, (v1, key) => {
              this._.forEach(v1, v2 => {
                list.push({
                  index: ind + 1,
                  istore_product_id: v.istore_product_id,
                  type: v.type,
                  operate_type: v.operate_type,
                  edit_field: key,
                  sub_product_id: v2.istore_product_id ? v2.istore_product_id : '',
                  content: v2.content ? v2.content : '',
                  result_status: v.result_status,
                  reason: v.message,
                  user_name: v.user_name,
                  update_time: v.update_time ? v.update_time : v.create_time
                })
              })
            })
          }
        })
        this.operationListData = list
        this.operationPagination = res.data.pagination
        this.logOptions = res.data.type
      }).finally(() => {
        this.operationListLoading = false
      })
    },
    renderList() {
      this.listData = []
      const queryParams = filterQueryParams(Object.assign(this.listQuery, this.searchParams))
      queryParams.advt_id = this.advtId
      this.listLoading = true
      getChangeLog(queryParams).then((res) => {
        this.listData = res.data.list
        this.pagination = res.data.pagination
        this.logOptions = res.data.type
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
      this.activeName = 'second'
      // 页码分页清空
      this.listQuery = {
        page: 1,
        per_page: 10,
        type: 1
      }
      this.operationListQuery = {
        page: 1,
        per_page: 10,
        type: 2
      }
      this.$refs['searchParams'].resetFields()
      this.$emit('update:open', false)
    }
  },
  filters: {},
  watch: {
    open(val) {
      if (val) {
        this.ULogRenderList()
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
