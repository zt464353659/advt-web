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
    <el-form size="small" :inline="true" class="form-search">
      <el-form-item label="操作类型">
        <el-select v-model="operateType" clearable placeholder="请选择" style="width: 120px;">
          <el-option v-for="item in operateTypeArr" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="操作结果">
        <el-select v-model="resultStatus" clearable placeholder="请选择" style="width: 120px;">
          <el-option v-for="item in resultStatusArr" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="search">查询</el-button>
        <el-button size="mini" @click="clearInput">清空</el-button>
      </el-form-item>
    </el-form>
    <!-- 列表 -->
    <div style="height: 100%">
      <el-tabs v-model="activeName" type="card" @tab-click="tabClick">
        <el-tab-pane label="系统日志" name="first">
          <el-table :data="systemListData"
                    ref="table"
                    v-loading.lock="systemListLoading"
                    element-loading-text="努力加载中"
                    border
                    max-height="500"
                    class="table-gray"
                    style="width: 100%"
                    highlight-current-row
          >
            <el-table-column prop="index" label="序号" width="50" align="center"></el-table-column>
            <el-table-column prop="istore_product_id" label="istore Product ID" width="140"></el-table-column>
            <el-table-column prop="operate_type" label="操作类型"></el-table-column>
            <el-table-column prop="operate" label="操作"></el-table-column>
            <el-table-column prop="result_status" label="操作结果"></el-table-column>
            <el-table-column prop="message" label="内容" width="350">
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
              @size-change="systemHandleSizeChange"
              @current-change="systemHandleCurrentChange"
              :current-page="systemListQuery.page"
              :page-sizes="[20,50,100,200]"
              :page-size="systemListQuery.per_page"
              :total="systemPagination ? systemPagination.total : 0"
            >
            </el-pagination>
          </div>
        </el-tab-pane>
        <el-tab-pane label="操作日志" name="second">
          <el-table :data="operationListData"
                    :span-method="objectSpanMethod"
                    ref="table"
                    v-loading.lock="operationListLoading"
                    element-loading-text="努力加载中"
                    border
                    max-height="500"
                    class="table-gray"
                    style="width: 100%"
                    highlight-current-row
          >
            <el-table-column prop="id" label="序号" width="80" align="center"></el-table-column>
            <el-table-column prop="istore_product_id" label="istore Product ID" width="140"></el-table-column>
            <el-table-column prop="operate_type" label="操作类型"></el-table-column>
            <el-table-column prop="operate" label="操作"></el-table-column>
            <el-table-column prop="column" label="编辑字段"></el-table-column>
            <el-table-column v-if="isVary" prop="operate_type" label="子id"></el-table-column>
            <el-table-column prop="content" label="内容" width="200">
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
            <el-table-column prop="result_status" label="操作结果"></el-table-column>
            <el-table-column prop="reason" label="失败原因"></el-table-column>
            <el-table-column prop="user_name" label="操作人"></el-table-column>
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
              @size-change="operationHandleSizeChange"
              @current-change="operationHandleCurrentChange"
              :current-page="operationListQuery.page"
              :page-sizes="[20,50,100,200]"
              :page-size="operationListQuery.per_page"
              :total="operationPagination ? operationPagination.total : 0"
            >
            </el-pagination>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>

<script>
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

import { filterQueryParams } from '@/utils/help'
import { getChangeLog } from '@/api/real'

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
    },
    isVary: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      operateType: undefined,
      resultStatus: undefined,
      operateTypeArr: [],
      resultStatusArr: [
        { label: '待执行', value: '0' },
        { label: '执行失败', value: '1' },
        { label: '执行成功', value: '2' }
      ],
      systemListData: [],
      systemListLoading: false,
      systemPagination: null,
      systemListQuery: {
        result_status: undefined,
        column: undefined,
        page: 1,
        per_page: 20,
        type: 1
      },
      operationListData: [],
      operationListLoading: false,
      operationPagination: null,
      operationListQuery: {
        result_status: undefined,
        column: undefined,
        page: 1,
        per_page: 20,
        type: 2
      },
      activeName: 'first',
      spanRule: {
        rule: {
          0: ['id'],
          1: ['id', 'istore_product_id'],
          2: ['id', 'istore_product_id', 'operate_type'],
          3: ['id', 'istore_product_id', 'operate'],
          4: ['id', 'istore_product_id', 'operate', 'column'],
          6: ['id', 'istore_product_id', 'operate', 'operate_status'],
          7: ['id', 'istore_product_id', 'operate', 'reason'],
          8: ['id', 'istore_product_id', 'operate', 'user_name'],
          9: ['id', 'istore_product_id', 'operate', 'create_time'],
          10: ['id', 'istore_product_id', 'operate', 'create_time']
        }
      }
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    tabClick() {
      this.resultStatus = undefined
      this.operateType = undefined
      this.systemListQuery.result_status = this.resultStatus
      this.systemListQuery.column = this.operateType
      this.operationListQuery.result_status = this.resultStatus
      this.operationListQuery.column = this.operateType
    },
    search() {
      if (this.activeName === 'first') {
        this.systemListQuery.result_status = this.resultStatus
        this.systemListQuery.column = this.operateType
        this.systemListQuery.page = 1
        this.systemRenderList()
      } else {
        this.operationListQuery.result_status = this.resultStatus
        this.operationListQuery.column = this.operateType
        this.operationListQuery.page = 1
        this.operationRenderList()
      }
    },
    clearInput() {
      this.resultStatus = undefined
      this.operateType = undefined
      this.systemListQuery = {
        result_status: undefined,
        column: undefined,
        page: 1,
        per_page: 20,
        type: 1
      }
      this.operationListQuery = {
        result_status: undefined,
        column: undefined,
        page: 1,
        per_page: 20,
        type: 2
      }
      this.search()
    },
    // 数据格式处理
    formatList(arr) {
      const list = []
      arr.forEach(v => {
        if (v.content && Array.isArray(v.content)) {
          v.content.forEach(v1 => {
            const obj = JSON.parse(JSON.stringify(v))
            obj.content = v1
            list.push(obj)
          })
        } else {
          list.push(v)
        }
      })
      return list
    },
    // 表格合并
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
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
    systemRenderList() {
      console.log('this.systemListQuery', this.systemListQuery)
      this.systemListData = []
      const queryParams = filterQueryParams(this.systemListQuery)
      queryParams.advt_id = this.advtId
      this.systemListLoading = true
      getChangeLog(queryParams).then((res) => {
        const list = res.data.list
        this.systemPagination = res.data.pagination
        this._.forEach(list, (v, ind) => {
          v.index = this.systemPagination.total - (this.systemListQuery.page - 1) * this.systemListQuery.per_page - ind
        })
        this.systemListData = list
        this.operateTypeArr = res.data.type
      }).finally(() => {
        this.systemListLoading = false
      })
    },
    operationRenderList() {
      this.operationListData = []
      const queryParams = filterQueryParams(this.operationListQuery)
      queryParams.advt_id = this.advtId
      this.operationListLoading = true
      getChangeLog(queryParams).then((res) => {
        this.operationListData = this.formatList(res.data.list)
        this.operationPagination = res.data.pagination
        this.operateTypeArr = res.data.type
      }).finally(() => {
        this.operationListLoading = false
      })
    },
    systemHandleCurrentChange(val) {
      this.systemListQuery.page = val
      this.systemRenderList()
    },
    operationHandleCurrentChange(val) {
      this.operationListQuery.page = val
      this.operationRenderList()
    },
    systemHandleSizeChange(val) {
      this.systemListQuery.page = 1
      this.systemListQuery.per_page = val
      this.systemRenderList()
    },
    operationHandleSizeChange(val) {
      this.operationListQuery.page = 1
      this.operationListQuery.per_page = val
      this.operationRenderList()
    },
    onClose() {
      this.resultStatus = undefined
      this.operateType = undefined
      this.activeName = 'first'
      this.systemListQuery = {
        page: 1,
        per_page: 20,
        type: 1
      }
      this.operationListQuery = {
        page: 1,
        per_page: 20,
        type: 2
      }
      this.$emit('update:open', false)
    }
  },
  filters: {},
  watch: {
    activeName(val) {
      if (val === 'first') {
        this.systemRenderList()
      }
      if (val === 'second') {
        this.operationRenderList()
      }
    },
    open(val) {
      if (val) {
        this.systemRenderList()
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

.form-search {
  margin-top: 20px;
  margin-left: 20px;
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

  .el-tabs.el-tabs--card.el-tabs--top {
    height: 100%;
  }

  .el-tabs__content {
    height: calc(100% - 58px);
    overflow: auto;
  }

}
</style>
