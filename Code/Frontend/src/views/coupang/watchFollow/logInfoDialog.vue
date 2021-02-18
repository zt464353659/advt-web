<template>
  <el-dialog
    title="查看日志详情"
    class="dialog-details-plan"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="740px"
    v-drag-move
  >
    <template>
      <el-table :data="detailsData" border v-loading="listLoading" max-height="332" class="table-gray" style="width: 100%">
        <el-table-column prop="id" label="序号" min-width="60">
          <template v-slot="scope">
            {{ scope.$index + 1 + (listQuery.page -1) * listQuery.per_page }}
          </template>
        </el-table-column>
        <el-table-column prop="product_id" label="处理类型" width="180">
          <template v-slot="scope">
            <el-tag v-if="Number(scope.row.operate_type) === 0" type="info" size="small">无操作</el-tag>
            <el-tag v-if="Number(scope.row.operate_type) === 1" type="primary" size="small">降价</el-tag>
            <el-tag v-if="Number(scope.row.operate_type) === 2" type="success" size="small">邮件发送</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="处理内容" width="180">
          <template slot-scope="scope">{{ scope.row.message || '/' }}</template>
        </el-table-column>
        <el-table-column prop="create_time" label="处理日期" width="180">
          <template slot-scope="scope" v-if="parseInt(scope.row.create_time) > 0">{{ parseInt(scope.row.create_time) | moment('YYYY-MM-DD HH:mm') }}</template>
        </el-table-column>
        <!-- <el-table-column prop="status" label="状态" width="120">
          <template slot-scope="scope">
            <el-tag type="info" size="small" v-if="Number(scope.row.status) === 10">未执行</el-tag>
            <el-tag type="danger" size="small" v-else-if="Number(scope.row.status) === 20">执行出错</el-tag>
            <el-tag type="success" size="small" v-else-if="Number(scope.row.status) === 30">执行成功</el-tag>
          </template>
        </el-table-column> -->
      </el-table>
      <!--分页-->
      <!-- <div class="pagination-container">
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
      </div> -->
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="onClose">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { apiGetWacthLog } from '@/api/coupang'

  export default {
    data() {
      return {
        detailsData: [],
        listLoading: true,
        listQuery: {
          id: '',
          page: 1,
          per_page: 10000
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
        default: false
      }
    },
    methods: {
      getDetails() {
        this.listQuery.id = this.rowData.id
        this.listLoading = true
        apiGetWacthLog(this.listQuery).then(response => {
          this.listLoading = false
          this.detailsData = response.data
          // this.pagination = response.data.pagination
          document.querySelector('.el-table__body-wrapper').scrollTop = 0
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
      onClose() {
        this.$emit('update:open', false)
      }
    },
    watch: {
      open(val) {
        if (val) {
          this.listQuery.page = 1
          this.listQuery.per_page = 20
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
