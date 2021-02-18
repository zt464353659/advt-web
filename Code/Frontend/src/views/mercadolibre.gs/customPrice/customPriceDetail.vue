<template>
  <el-dialog
    :title="`设置指定价详情 ID:${rowData.id}`"
    class="dialog-details-custom"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="740px"
    v-dragMove
  >
    <template>
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="状态" prop="status">
          <el-select v-model="listQuery.status" clearable placeholder="请选择状态" style="width:120px;">
            <el-option label="未执行" value="10"></el-option>
            <el-option label="执行出错" value="20"></el-option>
            <el-option label="执行成功" value="30"></el-option>
            <el-option label="正在执行" value="40"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="iStore Product Id" prop="istore_product_id">
          <el-input size="mini" v-model="listQuery.istore_product_id" clearable placeholder="多个请用空格分隔"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="detailsData" border v-loading="listLoading" max-height="420" class="table-gray" style="width: 100%">
        <el-table-column prop="istore_product_id" label="product ID" width="100"></el-table-column>
        <el-table-column prop="price" label="售价" width="80"></el-table-column>
        <el-table-column prop="custom_price" label="指定价" width="80"></el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template>
            {{ Number(rowData.type) === 1 ? '指定价' : '取消指定价' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag type="info" size="small" v-if="Number(scope.row.status) === 10">未执行</el-tag>
            <el-tag type="danger" size="small" v-else-if="Number(scope.row.status) === 20">执行出错</el-tag>
            <el-tag type="success" size="small" v-else-if="Number(scope.row.status) === 30">执行成功</el-tag>
            <el-tag type="primary" size="small" v-else-if="Number(scope.row.status) === 40">正在执行</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="执行结果"></el-table-column>
      </el-table>
      <!--分页-->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          small
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
import { customPriceDetail } from '@/api/mercadolibre.gs'
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
        istore_product_id: '',
        status: undefined
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
    // 搜索
    handleFilter() {
      this.listQuery.page = 1
      this.newDate = new Date().getTime()
      this.getDetails()
    },
    // 清空
    clearSearch() {
      this.$refs.listQuery.resetFields()
      this.newDate = new Date().getTime()
      this.getDetails()
    },
    getDetails() {
      this.listQuery.id = this.rowData.id
      this.listLoading = true
      this.listQuery.istore_product_id = this.listQuery.istore_product_id.trim()
      const params = filterQueryParams(this.listQuery)
      customPriceDetail(params).then(response => {
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
.dialog-details-custom {
  max-height: 800px;

  .el-table {
    .el-table__header {
      tr {
        background-color: #d3dce6;
      }
    }
  }

  .el-dialog {
    max-height: 800px;

    .el-dialog__body {
      padding-bottom: 0 !important;
    }
  }
}
</style>

