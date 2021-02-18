<template>
  <el-dialog
    :title="`计划执行详情 ID: ${data.id}`"
    class="dialog-details-plan istore-log"
    :visible="open"
    :before-close="onClose"
    width="800px"
    v-dragMove
  >
    <template>
      <el-form :inline="true" :data="listQuery" ref="listQuery" :rules="rules" :model="listQuery" size="mini" @submit.native.prevent>
        <el-form-item label="状态" prop="status">
          <el-select v-model="listQuery.status" placeholder="请选择状态">
            <el-option label="未执行" value="10"></el-option>
            <el-option label="执行出错" value="20"></el-option>
            <el-option label="执行成功" value="30"></el-option>
            <el-option label="正在执行" value="15"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品ID" prop="istore_product_id">
          <el-input v-model="listQuery.istore_product_id" type="text" size="mini" placeholder="多个之间使用空格分隔"></el-input>
        </el-form-item>
        <el-button @click="onCancel" size="mini">重 置</el-button>
        <el-button type="primary" @click="search" size="mini">查 询</el-button>
      </el-form>
    </template>
    <template>
      <el-table :data="detailsData" border v-loading="listLoading" max-height="332" class="table-gray" style="width: 100%">
        <el-table-column prop="product_id" label="产品id" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template slot-scope="scope">
            <el-tag type="info" size="small" v-if="scope.row.status === '10'">未执行</el-tag>
            <el-tag type="danger" size="small" v-else-if="scope.row.status === '20'">执行出错</el-tag>
            <el-tag type="success" size="small" v-else-if="scope.row.status === '30'">执行成功</el-tag>
            <el-tag type="primary" size="small" v-if="scope.row.status === '15'">正在执行</el-tag>
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
  </el-dialog>
</template>

<script>
import { getPlanDetail } from '@/api/shopee'
import { filterQueryParams } from '@/utils/help'

export default {
  data() {
    const val_istore_product_id = (rule, value="", callback) => {
      this._.forEach(this._.compact(value.split(' ')), (item) => {
        if (item.length > 8||item.length<8) {
          return callback(new Error('请输入正确的产品id'))
        }
      })
      callback()
    }
    return {
      detailsData: [],
      listLoading: true,
      listQuery: {
        id: undefined,
        status: undefined,
        istore_product_id: undefined,
        page: 1,
        per_page: 10
      },
      pagination: null,
      rules: {
        istore_product_id: [{ required: false, validator: val_istore_product_id, trigger: 'blur' }]
      }
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
      query.istore_product_id = this.listQuery.istore_product_id ? this.listQuery.istore_product_id.trim() : undefined
      getPlanDetail(query).then(response => {
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
    search() {
      this.$refs['listQuery'].validate((valid) => {
        if (valid) {
          this.listQuery.page = 1
          this.getDetails()
        }
      })
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
