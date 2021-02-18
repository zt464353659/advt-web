<template>
  <el-dialog
    title="执行详情"
    class="dialog-limit"
    :visible="open"
    :before-close="onClose"
    width="1000px"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    v-drag-move
  >
    <div class="content-box">
      <el-table :data="detailsData" border v-loading="listLoading" max-height="500" class="table-gray" style="width: 100%">
        <el-table-column type="index" label="序号" width="50"></el-table-column>
        <el-table-column prop="message" label="处理结果" width="180"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag type="info" size="small" v-if="Number(scope.row.status) === 10">未执行</el-tag>
            <el-tag type="primary" size="small" v-else-if="Number(scope.row.status) === 20">执行中</el-tag>
            <el-tag type="success" size="small" v-else-if="Number(scope.row.status) === 30">执行成功</el-tag>
            <el-tag type="danger" size="small" v-else-if="Number(scope.row.status) === 40">执行失败</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="update_time" label="更新时间" width="150">
          <template slot-scope="scope" v-if="scope.row.update_time !== no_time">{{ scope.row.update_time }}</template>
        </el-table-column>
        <el-table-column prop="unit_url" label="链接"></el-table-column>
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
    </div>
  </el-dialog>
</template>

<script>
import { onlineErrorDetail } from '@/api/real'

export default {
  data() {
    return {
      no_time: '1970-01-01 08:00:00',
      detailsData: [],
      listLoading: true,
      listQuery: {
        id: '',
        page: 1,
        per_page: 20
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
      onlineErrorDetail(this.listQuery).then(response => {
        this.listLoading = false
        this.detailsData = response.data.list
        this.pagination = response.data.pagination
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
        this.listQuery.per_page = 20
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
