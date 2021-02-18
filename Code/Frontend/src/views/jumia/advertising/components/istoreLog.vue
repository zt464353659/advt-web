<template>
  <el-dialog
    title="istore 更新日志"
    class="istore-log"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="1100px"
    v-dragMove
  >
    <template>
      <el-form :inline="true" :data="listQuery" ref="listQuery" :model="listQuery" size="mini" @submit.native.prevent>
        <el-form-item label="操作类型" prop="type">
          <el-select v-model="listQuery.type" placeholder="请选择操作类型">
            <el-option v-for="item in operateTypeArr.log_type" :key="item.key" :label="item.label" :value="item.key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="操作结果" prop="status">
          <el-select v-model="listQuery.status" placeholder="请选择操作结果">
            <el-option v-for="item in operateTypeArr.result_status" :key="item.key" :label="item.label" :value="item.key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="clearInput" size="mini">重 置</el-button>
          <el-button type="primary" @click="search" v-debounce size="mini">查 询</el-button>
        </el-form-item>
      </el-form>
    </template>
    <!-- 列表 -->
    <div style="height: 100%">
      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane label="系统日志" name="first">
          <el-table :data="systemListData"
                    ref="table"
                    v-loading.lock="systemListLoading"
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
              @size-change="systemHandleSizeChange"
              @current-change="systemHandleCurrentChange"
              :current-page="systemListQuery.page"
              :page-sizes="[ 10, 20, 40]"
              :page-size="systemListQuery.per_page"
              :total="systemPagination ? systemPagination.total : 0"
            >
            </el-pagination>
          </div>
        </el-tab-pane>
        <el-tab-pane label="操作日志" name="second">
          <el-table
            :data="operationListData"
            :span-method="objectSpanMethod"
            element-loading-text="努力加载中"
            ref="table"
            v-loading.lock="operationListLoading"
            border
            class="table-gray"
            highlight-current-row
          >
            <el-table-column label="序号" prop="index" align="center" width="50"></el-table-column>
            <el-table-column label="istore product id" prop="istore_product_id" width="150" align="center"></el-table-column>
            <el-table-column label="操作类型" prop="type" align="center"></el-table-column>
            <el-table-column label="操作" prop="operate_type" align="center"></el-table-column>
            <el-table-column label="编辑字段" prop="edit_field" align="center"></el-table-column>
            <el-table-column label="子ID" prop="sub_product_id" align="center"></el-table-column>
            <el-table-column label="内容" prop="content" align="center" width="200">
              <template slot-scope="scope">
                <div v-if="scope.row.content.length > 30">
                  <el-popover placement="right" width="480" trigger="hover">
                    <p style="line-height: 24px; font-size: 12px; word-wrap: break-word; max-height: 400px; overflow-y: auto;">
                      {{ scope.row.content }}
                    </p>
                    <p slot="reference" class="in-a-line" style="width: 100%; color: #E6A23C; margin: 0;">{{ scope.row.content }}</p>
                  </el-popover>
                </div>
                <div v-else>{{ scope.row.content }}</div>
              </template>
            </el-table-column>
            <el-table-column label="操作结果" prop="result_status" align="center"></el-table-column>
            <el-table-column label="失败原因" prop="reason" align="center">
              <template slot-scope="scope">
                <div v-if="scope.row.reason.length > 30">
                  <el-popover placement="right" width="480" trigger="hover">
                    <p style="line-height: 24px; font-size: 12px; word-wrap: break-word; max-height: 400px; overflow-y: auto;">
                      {{ scope.row.reason }}
                    </p>
                    <p slot="reference" class="in-a-line" style="width: 100%; color: #E6A23C; margin: 0;">{{ scope.row.reason }}</p>
                  </el-popover>
                </div>
                <div v-else>{{ scope.row.reason }}</div>
              </template>
            </el-table-column>
            <el-table-column label="操作人" prop="user_name" align="center"></el-table-column>
            <el-table-column label="操作时间" prop="update_time" align="center"></el-table-column>
          </el-table>
          <!--分页-->
          <div class="pagination-container">
            <el-pagination
              background
              layout="total, sizes, prev, pager, next, jumper" small
              @size-change="operationHandleSizeChange"
              @current-change="operationHandleCurrentChange"
              :current-page="operationListQuery.page"
              :page-sizes="[10,20, 40]"
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
import { getChangeLog } from '@/api/jumia'

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
    operateTypeArr: {
      type: [Array, Object],
      required: true,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      listQuery: {
        page: 1,
        per_page: 10,
        type: undefined,
        status: undefined
      },
      activeName: 'first',
      systemListData: [],
      systemListLoading: false,
      systemPagination: null,
      systemListQuery: {
        page: 1,
        per_page: 10,
        type: '0',
        resultStatus: undefined,
        operateType: undefined
      },
      //操作日志
      operationListData: [],
      operationListLoading: false,
      operationPagination: null,
      operationListQuery: {
        page: 1,
        per_page: 10,
        type: '1',
        resultStatus: undefined,
        operateType: undefined
      },
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
  methods: {
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
    //搜索
    search() {
      if (this.activeName === 'first') {
        this.systemListQuery.page = 1
        this.systemListQuery.result_status = this.listQuery.status
        this.systemListQuery.log_type = this.listQuery.type
        this.systemRenderList()
      } else {
        this.operationListQuery.page = 1
        this.operationListQuery.result_status = this.listQuery.status
        this.operationListQuery.log_type = this.listQuery.type
        this.operationRenderList()
      }
    },
    clearInput() {
      this.$refs['listQuery'].resetFields()
      this.systemListQuery = {
        result_status: undefined,
        log_type: undefined,
        page: 1,
        per_page: 10,
        type: '0'
      }
      this.operationListQuery = {
        result_status: undefined,
        log_type: undefined,
        page: 1,
        per_page: 10,
        type: '1'
      }
      this.search()
    },
    handleClick(tab) {
      if (tab.name == 'first') {
        this.systemRenderList()
      }
      if (tab.name == 'second') {
        this.operationRenderList()
      }
    },
    //系统
    systemRenderList() {
      this.systemListData = []
      const queryParams = filterQueryParams(this.systemListQuery)
      queryParams.advt_id = this.advtId
      this.systemListLoading = true
      getChangeLog(queryParams).then((res) => {
        this.systemListData = res.data.list
        this.systemPagination = res.data.pagination
      }).finally(() => {
        this.systemListLoading = false
      })
    },
    //操作
    operationRenderList() {//操作日志
      this.operationListData = []
      const queryParams = filterQueryParams(this.operationListQuery)
      queryParams.advt_id = this.advtId
      this.operationListLoading = true
      getChangeLog(queryParams).then((res) => {
        const list = []
        this._.forEach(res.data.list, (v, ind) => {
          if (!this._.isEmpty(v.data)) {
            this._.forEach(v.data, (v1, key) => {
              this._.forEach(v1, v2 => {
                list.push({
                  index: ind+1,
                  istore_product_id: v.istore_product_id,
                  type: v.type,
                  operate_type: v.operate_type,
                  edit_field: key,
                  sub_product_id: v2.istore_product_id ? v2.istore_product_id : '',
                  content: v2.content ? v2.content : '',
                  result_status: v.result_status,
                  reason: v.message,
                  user_name: v.username,
                  update_time: v.update_time ? v.update_time : v.create_time
                })
              })
            })
          } else {
            list.push({
              index: ind+1,
              istore_product_id: v.istore_product_id,
              type: v.type,
              operate_type: v.operate_type,
              edit_field: '',
              ub_product_id: v.istore_product_id ? v.istore_product_id : '',
              content: v.message,
              result_status: v.result_status,
              reason: "",
              user_name: v.username,
              update_time: v.update_time ? v.update_time : v.create_time
            })
          }
        })
        this.operationListData = list
        this.operationPagination = res.data.pagination
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
      this.$refs['listQuery'].resetFields()
      this.activeName = 'first'
      this.systemListQuery = {
        page: 1,
        per_page: 10,
        type: '0',
        resultStatus: undefined,
        operateType: undefined
      }
      this.operationListQuery = {
        page: 1,
        per_page: 10,
        type: '1',
        resultStatus: undefined,
        operateType: undefined
      }
      this.$emit('update:open', false)
    }
  },
  filters: {},
  watch: {
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
</style>
<style rel="stylesheet/scss" lang="scss">
.istore-log {
  .el-dialog .el-dialog__body {
    max-height: 700px;
    overflow: auto;
  }
}
</style>
