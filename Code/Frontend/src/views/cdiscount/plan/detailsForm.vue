<template>
  <el-dialog
    :title="`计划执行详情 ID: ${listQuery.id}`"
    class="dialog-limit"
    :visible="open"
    :before-close="onClose"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    width="800px"
    v-drag-move
  >
    <el-form ref="listQuery" :inline="true" :model="listQuery" class="form-search" size="mini">
      <el-form-item label="产品ID" prop="istore_product_id">
        <el-input v-model="listQuery.istore_product_id" clearable placeholder="多个请用空格分隔" style="width: 200px;" @blur="rule"></el-input>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="listQuery.status" clearable placeholder="请选择状态">
          <el-option label="未执行" value="10"></el-option>
          <el-option label="执行出错" value="20"></el-option>
          <el-option label="执行成功" value="30"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
        <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
      </el-form-item>
    </el-form>
    <template>
      <el-table :data="detailsData" border v-loading="listLoading" max-height="500" class="table-gray" style="width: 100%">
        <el-table-column prop="product_id" label="产品id" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag type="info" size="small" v-if="scope.row.status === 10">未执行</el-tag>
            <el-tag type="danger" size="small" v-else-if="scope.row.status === 20">执行出错</el-tag>
            <el-tag type="success" size="small" v-else-if="scope.row.status === 30">执行成功</el-tag>
            <el-tag size="small" v-else-if="scope.row.status === 40">正在执行</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="执行结果">
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
          :page-sizes="[20, 50,100,200]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { productInfo } from '@/api/cdiscount'
import { filterQueryParams } from '@/utils/help'

export default {
  data() {
    return {
      detailsData: [],
      listLoading: true,
      listQuery: {
        status: undefined,
        istore_product_id: undefined,
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
      required: true,
      default: () => {
      }
    },
    open: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    rule() {
      if (this.listQuery.istore_product_id !== '' && this.listQuery.istore_product_id !== undefined) {
        let value = Number(this.listQuery.istore_product_id.replace(/\s*/g, ''))
        if (value.toString() === NaN.toString()) {
          this.$message.warning('请输入正确的产品ID')
          this.listQuery.istore_product_id = undefined
        }
      }
    },
    //搜索
    handleFilter() {
      this.listQuery.page = 1
      this.getDetails()
    },
    //清空
    clearSearch() {
      this.$refs.listQuery.resetFields()
      this.getDetails()
    },
    getDetails() {
      this.listQuery.id = this.data.id
      this.listLoading = true
      if (this.listQuery.istore_product_id) {
        this.listQuery.istore_product_id = this.listQuery.istore_product_id.trim()
      }
      const queryParams = filterQueryParams(this.listQuery)
      productInfo(queryParams).then(response => {
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
      this.$refs.listQuery.resetFields()
      this.$emit('update:open', false)
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
<style rel="stylesheet/scss" lang="scss" scoped>
.form-search {
  //margin-top: 20px;
  //margin-left: 20px;
}
</style>
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
    max-height: 551px;

    .el-dialog__body {
      padding-bottom: 0 !important;
    }
  }
}
</style>
