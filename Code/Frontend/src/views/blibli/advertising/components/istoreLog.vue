<template>
  <el-dialog
    title="istore 更新日志"
    class="istore-log dialog-limit-height-has"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="1200px"
    v-dragMove
  >
    <template>
      <el-form :inline="true" :data="listQuery" ref="listQuery" :model="listQuery" size="mini" class="form-search" @submit.native.prevent>
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
                    highlight-current-row
          >
            <el-table-column label="序号" width="50" align="center">
              <template slot-scope="scope">
                {{ scope.row.index }}
              </template>
            </el-table-column>
            <el-table-column prop="istore_product_id" label="istore Product ID" width="140"></el-table-column>
            <el-table-column prop="type_label" label="操作类型"></el-table-column>
            <el-table-column prop="type_label" label="操作" width="50"></el-table-column>
            <el-table-column prop="result_status_label" label="操作结果"></el-table-column>
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
            <el-table-column prop="create_time" label="操作时间"></el-table-column>
          </el-table>
          <!--分页-->
          <div class="pagination-container">
            <el-pagination
              background
              layout="total, sizes, prev, pager, next, jumper" small
              @size-change="systemHandleSizeChange"
              @current-change="systemHandleCurrentChange"
              :current-page="listQuery.page"
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
            <el-table-column label="序号" prop="id" min-width="50" align="center">
            </el-table-column>
            <el-table-column label="istore product id" prop="istore_product_id" align="center"></el-table-column>
            <el-table-column label="操作类型" prop="type_label" min-width="70" align="center"></el-table-column>
            <el-table-column label="操作" prop="operate_type_label" min-width="60" align="center"></el-table-column>
            <el-table-column label="编辑字段" prop="editWord" min-width="60" align="center">
            </el-table-column>
            <el-table-column label="子ID" prop="Chistore_product_id" align="center">
            </el-table-column>
            <el-table-column label="内容" min-width="150" align="center">
              <template slot-scope="scope">
                <el-popover placement="top" width="480" trigger="hover">
                  <p style="line-height: 24px; font-size: 12px; word-wrap: break-word; max-height: 400px; overflow-y: auto;">{{ scope.row.content == null ? scope.row.message : scope.row.content }}</p>
                  <p slot="reference" class="in-a-line" style="width: 100%; color: #E6A23C; margin: 0;">{{ String(scope.row.content ? scope.row.content : scope.row.message).slice(0, 50) }}</p>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column label="操作结果" prop="result_status_label" align="center"></el-table-column>
            <el-table-column label="失败原因" align="center">
              <template slot-scope="scope">
                {{ scope.row.result_status === 1 ? '/' : scope.row.message }}
              </template>
            </el-table-column>
            <el-table-column label="操作人" prop="username" min-width="60" align="center"></el-table-column>
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
              :page-sizes="[10,20]"
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
import { filterQueryParams } from '@/utils/help'
import { getIstoreLogs } from '@/api/blibli'

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


function getNewlist(date) {
  let operateListData = []
  if (date.length !== 0) {
    date.forEach(element => {
      let arrayList = []
      if (element.data) {
        if (element.data.attributes) {
          arrayList.push(...element.data.attributes.map(attribute => {
              attribute.editWord = '属性'
              return attribute
            })
          )
        }
        if (element.data.description) {
          arrayList.push(...element.data.description.map(description => {
            description.editWord = '描述'
            return description
          }))
        }
        if (element.data.images) {
          arrayList.push(...element.data.images.map(image => {
            image.editWord = '图片'
            return image
          }))
        }
        if (element.data.title) {
          arrayList.push(...element.data.title.map(title => {
            title.editWord = '标题'
            return title
          }))
        }
      } else {
        arrayList.push(element)
      }
      if (arrayList.length !== 0) {
        arrayList.map((e, i) => {
          e.Chistore_product_id = e.istore_product_id
          operateListData.push({ ...arrayList[i], ...element })
        })
      }
    })
  }
  return operateListData
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
        type: '0',
        resultStatus: undefined,
        operateType: undefined
      },
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
          0: ['id'],
          1: ['id', 'istore_product_id'],
          2: ['id', 'istore_product_id', 'type_label'],
          3: ['id', 'istore_product_id', 'operate_type_label'],
          4: ['id', 'istore_product_id', 'editWord'],
          7: ['id', 'istore_product_id', 'result_status_label'],
          8: ['id', 'istore_product_id', 'message'],
          9: ['id', 'istore_product_id', 'username'],
          10: ['id', 'istore_product_id', 'update_time']


        }
      }
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
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
    handleClick(tab) {
      if (tab.name == 'first') {
        this.systemRenderList()
      }
      if (tab.name == 'second') {
        this.operationRenderList()
      }
    },
    systemRenderList() {//系统日志
      this.systemListData = []
      debugger
      const queryParams = filterQueryParams(this.systemListQuery)
      queryParams.advt_id = this.advtId
      this.systemListLoading = true
      getIstoreLogs(queryParams).then((res) => {
        //this.listData = res.data.list
        this.systemPagination = res.data.pagination
        let data = res.data.list
        data.forEach((element, index) => {
          element.index = this.systemPagination.total - (this.systemListQuery.page - 1) * this.systemListQuery.per_page - index
        })
        this.systemListData = data
      }).finally(() => {
        this.systemListLoading = false
      })
    },

    operationRenderList() {//操作日志
      this.operationListData = []
      const queryParams = filterQueryParams(this.operationListQuery)
      queryParams.advt_id = this.advtId
      this.operationListLoading = true
      getIstoreLogs(queryParams).then((res) => {
        const { list, pagination } = res.data
        this.operationPagination = pagination
        this.operationListData = getNewlist(list)
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
