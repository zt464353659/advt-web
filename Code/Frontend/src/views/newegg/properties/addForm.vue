<template>
  <el-dialog
    title="配置属性值"
    class="dialog-add-upload-plan"
    :visible="open"
    :close-on-click-modal="false"
    :before-close="closeClearForm"
    width="740px"
    v-drag-move
  >
    <template>
      <!-- 搜索 -->
      <div class="header-box">
        <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
          <el-form-item label="属性值" prop="attribute_value">
            <el-input size="mini" v-model="listQuery.attribute_value" clearable placeholder="请输入属性值"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
            <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- 列表 -->

      <div class="content-box">
        <el-table
          :key="newDate"
          :data="listData"
          v-loading="listLoading"
          border
          :max-height="500"
          style="width: 100%"
        >
          <el-table-column prop="id" label="ID" sortable :sort-method="(a,b) => a-b" align="center"></el-table-column>
          <el-table-column prop="attribute_name" label="属性名称" min-width="200" align="center"></el-table-column>
          <el-table-column prop="attribute_value" label="属性值" min-width="200" align="center"></el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button type="text" v-if="Number(scope.row.is_default) === 1" size="mini" disabled>已设置</el-button>
              <el-button type="text" v-else size="mini" @click="closedialog(scope.row)">设置为默认值</el-button>
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
            :page-sizes="[20, 50, 100, 150, 200]"
            :page-size="listQuery.per_page"
            :total="pagination ? pagination.total : 0"
          >
          </el-pagination>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script>
  import { getAttributeValueList, setAttributeValue } from '@/api/newegg'
  import { filterQueryParams } from '@/utils/help'
  export default {
    data() {
      return {
        newDate: new Date().getTime(),
        listData: [],
        listLoading: true,
        listQuery: {
          attribute_value: undefined
        },
        oldData: undefined,
        pagination: null,
        paramData: {
          old_id: undefined,
          id: undefined,
          attribute_value: undefined,
          not_show_message: true
        }
      }
    },
    props: {
      rowData: {
        type: Object,
        required: true,
        default: () => {}
      },
      open: {
        type: Boolean,
        default: false
      }
    },
    watch: {
      open(val) {
        if (val) {
          this.getList()
        }
      }
    },
    methods: {
      getList() {
        this.listData = []
        this.listLoading = true
        this.listQuery = this._.assign(this.listQuery, this.rowData)
        const queryParams = filterQueryParams(this.listQuery)
        getAttributeValueList(queryParams).then(response => {
          this.listLoading = false
          this.listData = response.data.list
          this.pagination = response.data.pagination
          this.oldData = this._.find(this.listData, o => o.is_default === '1')
          document.querySelector('.el-table__body-wrapper').scrollTop = 0
        }).catch(() => {
          this.listLoading = false
        })
      },
      handleSizeChange(val) {
        this.listQuery.page = 1
        this.listQuery.per_page = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.getList()
      },
      clearSearch() {
        this.$refs.listQuery.resetFields()
        this.newDate = new Date().getTime()
        this.getList()
      },
      handleFilter() {
        this.listQuery.page = 1
        this.newDate = new Date().getTime()
        this.getList()
      },
      closedialog(row) {
        this.$emit('update:data', {})
        this.$emit('update:open', false)
        // if (this.oldData) {
        if (!this.oldData) {
          this.paramData = {
            old_id: '0',
            id: row.id,
            attribute_value: row.attribute_value
          }
        } else {
          this.paramData = {
            old_id: this.oldData.id,
            id: row.id,
            attribute_value: row.attribute_value
          }
        }
        setAttributeValue(this.paramData).then(res => {
          this.$emit('current-attribute', res.data)
        }).catch(err => { console.log(err) })
      },
      closeClearForm() {
        this.$refs.listQuery.resetFields()
        this.$emit('update:rowData', {})
        this.$emit('update:open', false)
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .el-form-item {
    p {
      margin: 0;
      color: #F56C6C;
      font-size: 12px;
    }
  }
</style>
