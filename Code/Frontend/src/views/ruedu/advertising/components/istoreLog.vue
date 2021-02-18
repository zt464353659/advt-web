<template>
  <el-dialog
    title="istore 更新日志"
    class="istore-log dialog-limit-height-has"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="1300px"
    v-dragMove
  >
    <template>
      <el-form :inline="true" :data="listQuery" ref="listQuery" :model="listQuery" size="mini" class="form-search" @submit.native.prevent>
        <el-form-item label="操作类型" prop="type">
          <el-select v-model="listQuery.type" placeholder="请选择状态">
            <el-option v-for="item in operateTypeArr.log_type" :key="item.key" :label="item.label" :value="item.key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="操作结果" prop="status">
          <el-select v-model="listQuery.status" placeholder="请选择状态">
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
    <div class="content-box">
      <el-tabs v-model="activeName" type="card">
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
            <el-table-column prop="index" label="序号" width="50" align="center"></el-table-column>
            <el-table-column prop="istore_product_id" label="istore Product ID" width="140"></el-table-column>
            <el-table-column prop="type_label" label="操作类型"></el-table-column>
            <el-table-column prop="operate_type_label" label="操作"></el-table-column>
            <el-table-column prop="result_msg" label="操作结果"></el-table-column>
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
            <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
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
              :page-sizes="[ 10, 20, 40]"
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
import { getChangeLog } from '@/api/ruedu'

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
        type: '0'
      },
      operationListData: [],
      operationListLoading: false,
      operationPagination: null,
      operationListQuery: {
        page: 1,
        per_page: 10,
        type: '1'
      },
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
    // 数据格式处理
    formatList(arr) {
      const list = []
      // price  image stock name  short_name  description short_description offline
      const columnType = {
        name: '标题',
        short_name: '短标题',
        description: '描述',
        short_description: '短描述',
        image: '图片',
        price: '价格',
        stock: '库存',
        offline: '下架'
      }
      // id istore_product_id 操作类型 操作 编辑字段 子id 内容 操作结果 失败原因 操作人 操作时间
      arr.forEach(v => {
        if (v.data) {
          const data = v.data
          for (let key in data) {
            data[key].forEach(v1 => {
              list.push({
                id: v.id,
                istore_product_id: v.istore_product_id,
                operate_type: v.type_label,
                operate: v.operate_type_label,
                column: columnType[key],
                sub_istore_product_id: v1.istore_product_id,
                content: Array.isArray(v1.content) ? v1.content.join(',') : v1.content,
                result_status: v.result_msg,
                reason: v.reason || '',
                user_name: v.username,
                create_time: v.create_time
              })
            })
          }
        } else {
          list.push({
            id: v.id,
            istore_product_id: v.istore_product_id,
            operate_type: v.type_label,
            operate: v.operate_type_label,
            result_status: v.result_msg,
            reason: v.reason || '',
            user_name: v.username,
            create_time: v.create_time,
            content: v.message
          })
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

    systemRenderList() {
      this.systemListData = []
      const queryParams = filterQueryParams(this.systemListQuery)
      queryParams.id = this.advtId
      this.systemListLoading = true
      getChangeLog(queryParams).then((res) => {
        const list = res.data.list
        this.systemPagination = res.data.pagination
        this._.forEach(list, (v, ind) => {
          v.index = this.systemPagination.total - (this.systemListQuery.page - 1) * this.systemListQuery.per_page - ind
        })
        this.systemListData = list
      }).finally(() => {
        this.systemListLoading = false
      })
    },
    operationRenderList() {
      this.operationListData = []
      const queryParams = filterQueryParams(this.operationListQuery)
      queryParams.id = this.advtId
      this.operationListLoading = true
      getChangeLog(queryParams).then((res) => {
        this.operationListData = this.formatList(res.data.list)
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
        type: '0'
      }
      this.operationListQuery = {
        page: 1,
        per_page: 10,
        type: '1'
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
.form-search {
  margin-top: 20px;
  margin-left: 20px;
}

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

.istore-log .el-dialog__body {
  padding: 0 !important;
}
</style>
