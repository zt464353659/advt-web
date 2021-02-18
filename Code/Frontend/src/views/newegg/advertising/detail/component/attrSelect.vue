<template>
  <el-dialog
    title="属性"
    class="dialog-details-plan"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="740px"
    v-drag-move
  >
    <template>
      <el-form ref="listQuery" :model="listQuery" :inline="true" size="mini">
        <el-form-item label="关键字" prop="keyword">
          <el-input v-model="listQuery.keyword" clearable size="mini" placeholder="输入关键字搜索" @input="keywordChange"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="handleFilter">搜索</el-button>
        </el-form-item>
      </el-form>
      <div class="radio-box" v-loading="listLoading">
        <el-radio-group v-model="radio" v-if="options && options.length">
          <div class="radio-item" v-for="(opt,ind) in options" :key="ind">
            <el-radio :label="opt" :key="ind">{{ opt }}</el-radio>
          </div>
        </el-radio-group>
        <div v-else style="text-align: center;color:#606266;">暂无数据</div>
      </div>
      <!--分页-->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper" small
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :disabled="disabledPagination"
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
      <el-button type="primary" @click="onConfirm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getEditData } from '@/api/newegg'

export default {
  data() {
    return {
      disabledPagination: true,
      radio: '',
      listLoading: false,
      listQuery: {
        page: 1,
        per_page: 10,
        keyword: '' //搜索关键字
      },
      pagination: null,
      options: []
    }
  },
  props: {
    detailData: {
      type: Object,
      required: true,
      default: () => {
      }
    },
    attr: {
      type: Object,
      required: true,
      default: () => {
      }
    },
    open: {
      type: Boolean,
      default: false
    },
    index: {
      type: Number,
      default: -1
    },
    type: {
      type: String,
      required: true,
      default: ''
    }
  },
  methods: {
    keywordChange(val) {
      if (!val.trim()) {
        this.listQuery.page = 1
        this.options = this.attr.options.length ? this.attr.options : []
        this.disabledPagination = true
        this.pagination = {
          total: 0
        }
      }
    },
    //搜索
    handleFilter() {
      this.listQuery.page = 1
      this.listQuery.keyword = this.listQuery.keyword.trim()
      this.getDetails()
    },
    getDetails() {
      const params = {
        advt_id: this.detailData.advt_id,
        account_id: this.detailData.account_id,
        type: ['options'],
        keyword: this.listQuery.keyword,
        page: this.listQuery.page,
        per_page: this.listQuery.per_page,
        attribute_id: this.attr.attribute_id
      }
      if (params.keyword.trim()) {
        this.listLoading = true
        getEditData(params).then(res => {
          this.listLoading = false
          this.disabledPagination = false
          this.options = res.data.options.list
          this.pagination = res.data.options.pagination
        }).catch(() => {
          this.listLoading = false
        })
      }
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
      this.options = []
      this.listLoading = false
      this.pagination = null
    },
    onConfirm() {
      if (this.index !== -1) {
        this.$emit('setAttr', this.type, this.attr, this.radio, this.index)
      } else {
        this.$emit('setAttr', this.type, this.attr, this.radio)
      }
      this.onClose()
    }
  },
  watch: {
    open(val) {
      if (val) {
        this.listQuery.page = 1
        this.options = this.attr.options.length ? this.attr.options : []
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss">
.radio-box {
  padding: 5px;
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
  }

  .radio-item {
    margin: 3px 0;
    min-width: 30% !important;
    max-width:100%;
    margin-right: 20px;
    overflow: hidden;
  }
}

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
