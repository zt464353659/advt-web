<template>
  <el-dialog
    :title="`计划执行详情 ID: ${listQuery.id}`"
    class="dialog-limit"
    :visible="open"
    :before-close="onClose"
    @closed="onClose"
    width="800px"
  >
    <el-form size="small" :inline="true" class="form-search" ref="listQuery">
      <el-form-item label="状态">
        <el-select v-model="listQuery.status" clearable placeholder="请选择" style="width: 120px;">
          <el-option v-for="item in resultStatusArr" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="产品ID">
        <el-input v-model="listQuery.product_id" placeholder="多个请用空格分隔" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="search">查询</el-button>
        <el-button size="mini" @click="clearInput">清空</el-button>
      </el-form-item>
    </el-form>
    <template>
      <el-table :data="detailsData" border v-loading="listLoading" max-height="500" class="table-gray" style="width: 100%">
        <el-table-column prop="product_id" label="产品id" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template slot-scope="scope">
            <el-tag type="info" size="small" v-if="scope.row.status === 10">未执行</el-tag>
            <el-tag type="danger" size="small" v-else-if="scope.row.status === 20">执行出错</el-tag>
            <el-tag type="success" size="small" v-else-if="scope.row.status === 30">执行成功</el-tag>
            <el-tag type="primary" size="small" v-else-if="scope.row.status === 40">正在执行</el-tag>
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
          :page-sizes="[ 20,50,100,200]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { fetchDetails } from '@/api/priceminister'

export default {
  data() {
    return {
      resultStatusArr: [
        { label: '未执行', value: 10 },
        { label: '执行出错', value: 20 },
        { label: '执行成功', value: 30 },
        { label: '正在执行', value: 40 }
      ],
      detailsData: [],
      listLoading: true,
      listQuery: {
        product_id: undefined,
        status: undefined,
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
    clearInput() {
      this.listQuery = {
        product_id: undefined,
        status: undefined,
        id: '',
        page: 1,
        per_page: 20
      }
      this.getDetails()
    },
    search() {
      this.listQuery.page = 1
      this.getDetails()
    },
    getDetails() {
      this.listQuery.id = this.data.id
      this.listLoading = true
      fetchDetails(this.listQuery).then(response => {
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
      this.$refs.listQuery.resetFields()
      this.$emit('update:open', false)
      this.listQuery.status = undefined
      this.listQuery.product_id = undefined
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
    max-height: 551px;

    .el-dialog__body {
      padding-bottom: 0 !important;
    }
  }
}
</style>
