<template>
  <el-dialog
    :title="'计划执行详情[ ID:'+rowData.id+' ]'"
    class="dialog-details-plan"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="740px"
    v-dragMove
  >
    <template>
      <el-form ref="listQuery" :model="listQuery" :inline="true" size="mini">
        <el-form-item label="状态" prop="status">
          <el-select v-model="listQuery.status" clearable placeholder="请选择状态" style="width:120px;" size="mini">
            <el-option label="未执行" value="10"></el-option>
            <el-option label="执行出错" value="20"></el-option>
            <el-option label="执行成功" value="30"></el-option>
            <el-option label="正在执行" value="40"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="iStore Product Id" prop="istore_product_id">
          <el-input v-model="listQuery.istore_product_id" clearable size="mini" placeholder="多个请用空格分隔"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="handleFilter">搜索</el-button>
          <el-button data-type="clear" size="mini" @click="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="detailsData" border v-loading="listLoading" max-height="332" class="table-gray" style="width: 100%">
        <el-table-column prop="product_id" label="产品id" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template slot-scope="scope">
            <el-tag type="info" size="small" v-if="scope.row.status === 10">未执行</el-tag>
            <el-tag type="danger" size="small" v-else-if="scope.row.status === 20">执行出错</el-tag>
            <el-tag type="success" size="small" v-else-if="scope.row.status === 30">执行成功</el-tag>
            <el-tag type="primary" size="small" v-else-if="scope.row.status === 40">正在执行</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="message" label="执行结果">
          <template slot-scope="scope">
            <div v-html="scope.row.message"></div>
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
          :page-sizes="[10, 20, 30, 50]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="onClose">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { fetchDetails } from '@/api/rakuten'
import { filterQueryParams } from '../../../utils'

export default {
  data() {
    return {
      detailsData: [],
      listLoading: true,
      listQuery: {
        id: '',
        page: 1,
        per_page: 10,
        istore_product_id: undefined,//搜索id
        status: undefined//搜索状态
      },
      pagination: null
    }
  },
  props: {
    rowData: {
      type: Object,
      required: true,
      default: () => {
      }
    },
    open: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  methods: {
    //搜索
    handleFilter() {
      this.listQuery.page = 1
      if (this.listQuery.istore_product_id !== undefined) {
        this.listQuery.istore_product_id = this.listQuery.istore_product_id.trim()
      }
      this.getDetails()
    },
    //清空搜索
    clearSearch() {
      this.$refs.listQuery.resetFields()
      this.getDetails()
      this.listQuery.page = 1
    },

    getDetails() {
      this.listQuery.id = this.rowData.id
      this.listLoading = true
      const params = filterQueryParams(this.listQuery)
      fetchDetails(params).then(response => {
        this.listLoading = false
        this.detailsData = response.data.list
        this.pagination = response.data.pagination
        document.querySelector('.dialog-details-plan .el-table__body-wrapper').scrollTop = 0
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
    onClose() {
      this.$refs.listQuery.resetFields()
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
    max-height: 700px;

    .el-dialog__body {
      padding-bottom: 0 !important;
    }
  }
}
</style>
