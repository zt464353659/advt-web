<template>
  <el-dialog
    title="任务详情日志"
    class="dialog-details-plan istore-log"
    :visible="open"
    :before-close="onClose"
    width="900px"
    v-dragMove
  >
    <template>
      <el-form :inline="true" :data="listQuery" ref="listQuery" :model="listQuery" size="mini" @submit.native.prevent>
        <el-form-item label="状态" prop="status">
          <el-select v-model="listQuery.status" placeholder="请选择状态">
            <el-option label="执行出错" value="0"></el-option>
            <el-option label="执行成功" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="iStore Product id" prop="product_id">
          <el-input v-model="listQuery.product_id" type="text" size="mini" placeholder="多个之间使用空格分隔"></el-input>
        </el-form-item>
        <el-button @click="onCancel" size="mini">重 置</el-button>
        <el-button type="primary" @click="search" v-debounce size="mini">确 定</el-button>
      </el-form>
    </template>
    <template>
      <el-table :data="detailsData" border v-loading="listLoading" max-height="332" class="table-gray" style="width: 100%">
        <el-table-column prop="istore_product_id" label="产品id" width="80"></el-table-column>
        <el-table-column prop="spu_id" label="spu" min-width="90"></el-table-column>
        <el-table-column prop="sales" label="销量" min-width="50"></el-table-column>
        <el-table-column prop="likes" label="关注" min-width="50"></el-table-column>
        <el-table-column prop="views" label="浏览" min-width="50"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag type="danger" size="small" v-if="scope.row.status === 0">执行出错</el-tag>
            <el-tag type="success" size="small" v-if="scope.row.status === 1">执行成功</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="执行结果" min-width="200"></el-table-column>
        <el-table-column prop="upload_date" label="上架时间" width="150"></el-table-column>
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
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onClose">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { offlineInfo } from '@/api/shopee'
import { filterQueryParams } from '@/utils/help'

export default {
  data() {
    return {
      detailsData: [],
      listLoading: true,
      listQuery: {
        id: undefined,
        status: undefined,
        product_id: undefined,
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
      this.listLoading = true
      const query = filterQueryParams(this.listQuery)
      query.id = this.data.id
      query.product_id = this.listQuery.product_id ? this.listQuery.product_id.trim() : undefined
      offlineInfo(query).then(response => {
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
      this.$refs['listQuery'].resetFields()
      this.$emit('update:open', false)
    },
    //重置
    onCancel() {
      this.$refs['listQuery'].resetFields()
      this.getDetails()
    },
    search(){
      this.listQuery.page = 1
      this.getDetails()
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


}
</style>
