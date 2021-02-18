<template>
  <el-dialog
    title="计划执行详情"
    class="dialog-details-plan"
    :visible="open"
    :before-close="onClose"
    width="740px"
  >
    <template>
      <el-table :data="detailsData" border v-loading="listLoading" max-height="332" class="table-gray" style="width: 100%">
        <el-table-column prop="product_id" label="产品id" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template slot-scope="scope">
            <el-tag type="info" size="small" v-if="Number(scope.row.status) === 10">未执行</el-tag>
            <el-tag type="danger" size="small" v-else-if="Number(scope.row.status) === 20">执行出错</el-tag>
            <el-tag type="success" size="small" v-else-if="Number(scope.row.status) === 30">执行成功</el-tag>
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
    <div slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取 消</el-button>
      <el-button type="primary" @click="onCancel">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { planDetail } from '@/api/shopify'

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
      data: {
        type: Object,
        required: true
      },
      open: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      getDetails() {
        this.listQuery.id = this.data.id
        this.listLoading = true
        planDetail(this.listQuery).then(response => {
          this.listLoading = false
          this.detailsData = response.data.list
          this.pagination = response.data.pagination
          document.querySelector('.dialog-details-plan .el-table__body-wrapper').scrollTop = 0
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
</style>
