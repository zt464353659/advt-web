<template>
  <el-dialog
    title="任务执行结果"
    class="dialog-limit"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="800px"
    v-drag-move
  >
    <template>
      <el-table :key="newDate" :data="detailsData" border v-loading="listLoading" max-height="500" class="table-gray" style="width: 100%">
        <el-table-column prop="spu_id" label="平台商品号" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template slot-scope="scope">
            <el-tag type="info" size="small" v-if="Number(scope.row.status) === 0">未执行</el-tag>
            <el-tag type="success" size="small" v-else-if="Number(scope.row.status) === 1">执行成功</el-tag>
            <el-tag type="danger" size="small" v-else-if="Number(scope.row.status) === 2">执行出错</el-tag>
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
          :page-sizes="[20,50,100,200]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </template>
  </el-dialog>
</template>

<script>
  import { apiPullAdvtDetail } from '@/api/kr11street'

  export default {
    data() {
      return {
        detailsData: [],
        listLoading: true,
        listQuery: {
          task_id: '',
          page: 1,
          per_page: 20
        },
        pagination: null,
        newDate: new Date().getTime()
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
    methods: {
      getDetails() {
        this.listQuery.task_id = this.rowData.id
        this.listLoading = true
        apiPullAdvtDetail(this.listQuery).then(response => {
          this.listLoading = false
          this.detailsData = response.data.list
          this.pagination = response.data.pagination
          this.$nextTick(() => {
            document.querySelector('.el-dialog .el-table__body-wrapper').scrollTop = 0
            this.newDate = new Date().getTime()
          })
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
        this.newDate = new Date().getTime()
        this.$emit('update:open', false)
      },
      onClose() {
        this.newDate = new Date().getTime()
        this.$emit('update:open', false)
      }
    },
    watch: {
      open(val) {
        if (val) {
          this.detailsData = []
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
</style>
