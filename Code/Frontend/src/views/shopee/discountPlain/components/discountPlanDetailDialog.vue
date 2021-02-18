<template>
  <el-dialog :title="'执行详情'" :visible="open" :before-close="onClose" width="900px" v-loading="loading" :close-on-press-escape="false" :close-on-click-modal="false">
    <el-table
      :data="listData"
      border
      style="width: 100%"
    >
      <el-table-column prop="istore_product_id" label="product ID" align="center"></el-table-column>
      <el-table-column prop="status" label="状态" align="center">
        <template v-slot="scope">
          <div>
            <el-tag type="info" size="small" v-if="scope.row.status === 10">未执行</el-tag>
            <el-tag type="primary" size="small" v-else-if="scope.row.status === 15">正在执行</el-tag>
            <el-tag type="danger" size="small" v-else-if="scope.row.status === 20">执行出错</el-tag>
            <el-tag type="success" size="small" v-else-if="scope.row.status === 30">执行成功</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="message" label="执行结果" align="center"></el-table-column>
    </el-table>
    <!--分页-->
    <div class="pagination-container">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper" small
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="listQuery.page"
        :page-sizes="[20, 50, 100, 200]"
        :page-size="listQuery.per_page"
        :total="pagination ? pagination.total : 0"
      >
      </el-pagination>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="onSubmit">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
  import { apiDiscountPlainInfo } from '@/api/shopee'
  export default {
    props: {
      open: Boolean,
      data: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        listData: [],
        loading: false,
        listQuery: {
          page: 1,
          per_page: 20
        },
        pagination: null
      }
    },
    watch: {
      open(val) {
        if (val) {
          this.renderList()
        }
      }
    },
    methods: {
      renderList() {
        this.listData = []
        this.loading = true
        const data = this.createSearchData()
        apiDiscountPlainInfo(data).then(response => {
          this.listData = response.data.list
          this.pagination = response.data.pagination
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      },
      createSearchData() {
        const cloneForm = this._.cloneDeep(this.listQuery)
        cloneForm.plan_id = this.data.id
        return cloneForm
      },
      handleSizeChange(val) {
        this.listQuery.page = 1
        this.listQuery.per_page = val
        this.renderList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.renderList()
      },
      onSubmit() {
        this.onClose()
      },
      onClose() {
        this.listQuery = {
          page: 1,
          per_page: 20
        }
        this.listData = []
        this.pagination = null
        this.$emit('update:open', false)
      }
    }
  }
</script>
<style lang="scss" scoped>
  .add-iscount-Plain-dialog {
    border: 1px solid #b0b0b0;
    h3 {
      text-align: center;
      margin: 0;
      padding: 10px 0;
      border-bottom: 1px solid #b0b0b0;
    }
  }
  .left {
    border-right: 1px solid #b0b0b0;
  }
  .data-picker {
    width: 360px;
  }
</style>
