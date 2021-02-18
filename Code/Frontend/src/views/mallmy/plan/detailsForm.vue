<template>
  <el-dialog
    title="计划执行详情"
    class="dialog-details-plan"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="740px"
    v-dragMove
  >
    <template>
      <el-table :data="detailsData" border v-loading="listLoading" max-height="332" class="table-gray" style="width: 100%">
        <el-table-column prop="product_id" label="产品id" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template slot-scope="scope">
            <el-tag type="info" size="small" v-if="scope.row.status === '10'">未执行</el-tag>
            <el-tag type="danger" size="small" v-else-if="scope.row.status === '20'">执行出错</el-tag>
            <el-tag type="success" size="small" v-else-if="scope.row.status === '30'">执行成功</el-tag>
            <el-tag type="primary" size="small" v-else-if="scope.row.status === '40'">正在执行</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="执行结果"></el-table-column>
      </el-table>
      <!--分页-->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper" small
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="listQuery.page"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </template>
    <div class="footer">
    </div>
  </el-dialog>
</template>

<script>
  import { fetchDetails } from '@/api/mallmy'

  export default {
    data() {
      return {
        detailsData: [],
        listLoading: true,
        listQuery: {
          id: '',
          page: 1,
          per_page: 10
        },
        pagination: null
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
        required: true,
        default: false
      }
    },
    methods: {
      getDetails() {
        this.listQuery.id = this.rowData.id
        this.listLoading = true
        fetchDetails(this.listQuery).then(response => {
          this.listLoading = false
          this.detailsData = response.data.list
          this.pagination = response.data.pagination
          document.querySelector('.el-table__body-wrapper').scrollTop = 0
        }).catch(() => {
          this.listLoading = false
        })
      },
      handleSizeChange(val) {
        this.listQuery.page = 1
        this.listQuery.per_page = val
        this.getDetails()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.getDetails()
      },
      onCancel() {
        this.$emit('update:open', false)
      },
      onClose() {
        this.$emit('update:open', false)
      }
    },
    watch: {
      open(val) {
        if (val) {
          this.listQuery.page = 1
          this.getDetails()
        }
      }
    }
  }
</script>
<style rel="stylesheet/scss" lang="scss">
  .dialog-details-plan {
    .el-table {
      .el-table__header {
        tr {
          background-color: #d3dce6;
        }
      }
    }
    .el-dialog {
      max-height: 500px;
      .el-dialog__body {
        padding-bottom: 0 !important;
      }
    }
  }
  .footer {
    height: 15px;
  }
</style>
