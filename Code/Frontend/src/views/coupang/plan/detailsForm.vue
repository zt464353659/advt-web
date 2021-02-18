<template>
  <el-dialog
    :title="`计划执行详情 ID: ${listQuery.id}`"
    class="dialog-limit"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="800px"
    v-drag-move
  >
    <template>
      <el-form ref="listQuery" :inline="true" :model="listQuery" size="mini" class="form-search">
        <el-form-item label="状态">
          <el-select v-model="listQuery.status" clearable placeholder="请选择" style="width: 120px;">
            <el-option v-for="item in resultStatusArr" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品ID" prop="istore_product_id">
          <el-input type="text" v-model="listQuery.istore_product_id" size="" clearable placeholder="多个请用空格分隔"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button data-type="clear" @click="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
    </template>
    <div>
      <el-table :key="newDate" :data="detailsData" border max-height="400" class="table-gray" v-loading="listLoading">
        <el-table-column prop="product_id" label="产品id" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag type="info" size="small" v-if="Number(scope.row.status) === 10">未执行</el-tag>
            <el-tag type="danger" size="small" v-else-if="Number(scope.row.status) === 20">执行出错</el-tag>
            <el-tag type="success" size="small" v-else-if="Number(scope.row.status) === 30">执行成功</el-tag>
            <el-tag type="primary" size="small" v-else-if="Number(scope.row.status) === 40">正在执行</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="执行结果">
          <template slot-scope="scope">
            <div v-if="Number(scope.row.status) !== 40" v-html="scope.row.message"></div>
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
          :page-sizes="[ 20,50,100,200]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { fetchDetails } from '@/api/coupang'

export default {
  data() {
    return {
      resultStatusArr: [
        { label: '未执行', value: 10 },
        { label: '执行出错', value: 20 },
        { label: '执行成功', value: 30 },
        { label: '正在执行', value: 40 }
      ],
      newDate: new Date().getTime(),
      detailsData: [],
      listLoading: true,
      listQuery: {
        id: '',
        page: 1,
        per_page: 20,
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
      default: false
    }
  },
  methods: {
    handleSearch() {
      this.listQuery.page = 1
      this.getDetails()
    },
    clearSearch() {
      this.listQuery.istore_product_id = ''
      this.listQuery.status = undefined
      this.getDetails()
    },
    getDetails() {
      this.listQuery.id = this.rowData.id
      const param = {
        id: this.rowData.id,
        page: this.listQuery.page,
        per_page: this.listQuery.per_page,
        status: this.listQuery.status
      }
      if (this.listQuery.istore_product_id) {
        param.istore_product_id = this.listQuery.istore_product_id.replace(/\s+/g, ' ').toString()
      }
      this.listLoading = true
      fetchDetails(param).then(response => {
        this.listLoading = false
        this.detailsData = response.data.list
        this.pagination = response.data.pagination
        this.$nextTick(() => {
          document.querySelector('.el-dialog .el-table__body-wrapper').scrollTop = 0
          this.newDate = new Date().getTime()
        })
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
      this.listQuery.istore_product_id = ''
      this.listQuery.status = undefined
      this.newDate = new Date().getTime()
      this.$emit('update:open', false)
    }
  },
  watch: {
    open(val) {
      if (val) {
        this.listQuery.istore_product_id = ''
        this.listQuery.page = 1
        this.listQuery.per_page = 20
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
