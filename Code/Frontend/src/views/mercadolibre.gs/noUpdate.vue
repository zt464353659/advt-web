<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box special-delete">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="Site Code" prop="account_id">
          <el-select v-model="listQuery.account_id" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="item in options" :key="item.id" :label="item.site_code" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Product ID" prop="istore_product_id">
          <el-input size="mini" v-model="listQuery.istore_product_id" clearable placeholder="多个请用空格分隔"></el-input>
        </el-form-item>
        <el-form-item label="不更新类型" prop="type">
          <el-select v-model="listQuery.type" clearable placeholder="请选择" style="width: 250px;">
            <el-option v-for="item of updateOptions" :label="item.label" :value="item.key" :key="item.key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <!--<label class="title">计划列表</label>-->
      <el-row class="right-row">
        <el-button type="danger" size="mini" :disabled="!selectData.length" @click="cancleNoUpdate" v-permission="permissions.noUpdate_cancle">批量取消不更新</el-button>
        <el-button type="primary" size="mini" @click="addNoUpdate" v-permission="permissions.noUpdate_add">添加指定产品</el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table
        :key="newDate"
        :data="listData"
        v-loading="listLoading"
        border
        :max-height="maxHeight"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="account">
          <template slot="header">
            <span style="display: inline-block;width: 100%;text-align: center;">Site Code</span>
          </template>
        </el-table-column>
        <el-table-column prop="istore_product_id" label="Product ID" align="center"></el-table-column>
        <!--        <el-table-column prop="product_type" label="类型" align="center">-->
        <!--          <template slot-scope="scope">-->
        <!--            <el-tag :type="Number(scope.row.product_type) === 1 ? 'success' : ''" size="small">{{ Number(scope.row.product_type) === 1 ? 'Normal' : 'Variation' }}</el-tag>-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <el-table-column prop="product_type" width="400">
          <template slot="header">
            <span style="text-align: center;display: inline-block;width: 100%;">不更新类型</span>
          </template>
          <template slot-scope="scope">
            <span style="margin-right:8px;">{{ scope.row.comment }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="操作人" align="center"></el-table-column>
        <el-table-column prop="create_time" label="操作时间" align="center">
          <template slot-scope="scope">{{ scope.row.update_time }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" align="center"></el-table-column>
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
    </div>
    <!--添加指定不更新产品-->
    <add-form v-bind.sync="addNoUpdateProduct" @reload="getList"></add-form>
  </div>
</template>

<script>
import { getSelectAll, productUpdateList, cancleProductNoUpdate, getUpdateType } from '@/api/mercadolibre.gs'
import { resultAlert } from './advertising/common'
import addForm from './noUpdate/addNoUpdate'
// import detailsForm from './plan/detailsForm'
import { filterQueryParams } from '@/utils/help'

export default {
  name: 'UserManage',
  components: { addForm },
  data() {
    return {
      permissions: {
        noUpdate_cancle: 'mercadolibre.product.update-rule.cancel',//批量取消不更新
        noUpdate_add: 'mercadolibre.product.update-rule.set'//添加指定产品
      },
      newDate: new Date().getTime(),
      status: '状态 ',
      title: '类型 ',
      filterTypeIcon: 'filter',
      filterStatusIcon: 'filter',
      maxHeight: document.documentElement.clientHeight - 200,
      addNoUpdateProduct: {
        accountOptions: [],
        open: false,
        typeOptions: []
      },
      listData: [],
      updateOptions: [],
      options: [],
      advtTypeOptions: [],
      listLoading: false,
      listQuery: {
        account_id: '',
        istore_product_id: '',
        type: '',
        advt_type: [],
        page: 1,
        per_page: 10
      },
      pagination: null,
      selectData: []
    }
  },
  created() {
    this.searchInit()
    this.getList()
    this.maxHeight = this.maxHeight < 200 ? 200 : this.maxHeight
  },
  mounted() {
    const that = this
    window.onresize = () => {
      return (() => {
        window.maxHeight = document.documentElement.clientHeight - 200
        that.maxHeight = window.maxHeight < 200 ? 200 : window.maxHeight
      })()
    }
  },
  methods: {
    searchInit() {
      const optionsParams = ['MercadoLibreAdvtAccount', 'MercadoLibreAdvtTypes']
      getSelectAll(optionsParams).then(response => {
        this.options = response.data.MercadoLibreAdvtAccount
        this.advtTypeOptions = response.data.MercadoLibreAdvtTypes
      })
      getUpdateType().then(response => {
        this.updateOptions = response.data
      })
    },
    getList() {//获取列表
      this.listData = []
      this.listLoading = true
      if (this.listQuery.istore_product_id) {
        this.listQuery.istore_product_id = this.listQuery.istore_product_id.trim()
      }
      const queryParams = filterQueryParams(this.listQuery)
      productUpdateList(queryParams).then(response => {
        this.listLoading = false
        this.listData = response.data.list
        this.pagination = response.data.pagination
        document.querySelector('.el-table__body-wrapper').scrollTop = 0
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleSizeChange(val) {
      this.listQuery.page = 1
      this.listQuery.per_page = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    addNoUpdate() {

      this.addNoUpdateProduct = {
        open: true,
        accountOptions: this.options,
        typeOptions: this.updateOptions
      }
      console.log(this.addNoUpdateProduct)
    },
    clearSearch() {
      this.$refs.listQuery.resetFields()
      this.newDate = new Date().getTime()
      this.filterTypeIcon = 'filter'
      this.filterStatusIcon = 'filter'
      this.getList()
    },
    handleFilter() {
      console.log(this.listQuery.type)
      this.listQuery.page = 1
      this.newDate = new Date().getTime()
      this.filterTypeIcon = 'filter'
      this.filterStatusIcon = 'filter'
      this.getList()
    },
    // 表格多选
    handleSelectionChange(val) {
      this.selectData = val
    },
    // 批量取消不更新
    cancleNoUpdate() {
      let filter_ids = []
      this._.map(this.selectData, item => {
        filter_ids = filter_ids.concat(item.filter_ids)
      })
      const data = {
        filter_ids,
        user_id: parseInt(this.$store.state.user.info.id),
        user_name: this.$store.state.user.info.name,
        status: 0,
        id: this._.map(this.selectData, item => item.id)
      }
      this.$confirm('确定要取消不更新吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用接口
        cancleProductNoUpdate(data).then((res) => {
          resultAlert(res)
          this.getList()
        })
      }).catch(() => {
      })
    }
  },
  watch: {
    maxHeight(val) {
      if (!this.timer) {
        this.maxHeight = val
        this.timer = true
        const that = this
        setTimeout(function() {
          that.timer = false
        }, 400)
      }
    }
  },
  filters: {
    getTypeLabel(val, updateOptions) {
      const types = updateOptions
      let label = ''
      if (types) {
        types.forEach((v) => {
          if (v.key === parseInt(val)) {
            label = v.label
          }
        })
      }
      return label
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.el-popover {
  max-height: 400px !important;
  overflow-y: auto !important;
}
</style>
<style rel="stylesheet/scss">
.special-delete .el-select__tags {
  padding-left: 5px;
}

.special-delete .el-form-item--mini span + i {
  display: none;
}
</style>

