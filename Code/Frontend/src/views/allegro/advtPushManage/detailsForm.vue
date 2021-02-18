<template>
  <el-dialog
    title="查看执行详情"
    class="dialog-details-plan"
    :visible="open"
    :before-close="onClose"
    width="740px"
  >
    <template>
      <el-table :data="detailsData" border v-loading="listLoading" max-height="332" class="table-gray" style="width: 100%">
        <el-table-column prop="spu_id" label="SPU id" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status===10" type="warning">执行中</el-tag>
            <el-tag v-if="scope.row.status===20" type="danger">执行出错</el-tag>
            <el-tag v-if="scope.row.status===30" type="success">执行成功</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="执行结果" align="center">
          <template slot-scope="scope">
            {{ scope.row.message ? scope.row.message : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="执行时间" width="150"></el-table-column>
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
      <el-button type="primary" @click="onClose">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getAdvtPromotionPlanInfo } from '@/api/allegro'

export default {
  data() {
    return {
      detailsData: [],
      listLoading: true,
      listQuery: {
        page: 1,
        per_page: 10
      },
      pagination: undefined
    }
  },
  props: {
    trandata: {
      type: [Object, Number],
      required: true,
      default: () => {
      }
    },
    open: {
      type: Boolean,
      default: false,
      required: true
    }
  },
  methods: {
    getDetails() {
      this.detailsData = []
      this.listLoading = true
      const queryParams = this._.cloneDeep(this.listQuery)
      queryParams.id = this.trandata
      getAdvtPromotionPlanInfo(queryParams).then(response => {
        this.detailsData = response.data.list
        this.pagination = response.data.pagination
        document.querySelector('.dialog-details-plan .el-table__body-wrapper').scrollTop = 0
      }).finally(() => {
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
    onClose() {
      this.listQuery = {
        id: undefined,
        page: 1,
        per_page: 10
      },
        this.$emit('update:open', false)
    }
  },
  watch: {
    open(val) {
      if (val) {
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
