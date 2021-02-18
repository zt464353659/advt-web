<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box special-delete">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="Site Code" prop="account_id">
          <el-select v-model="listQuery.account_id" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="item in options.account" :key="item.id" :label="item.account" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Product ID" prop="istore_product_id">
          <el-input size="mini" v-model="listQuery.istore_product_id" clearable placeholder="多个请用空格分隔"></el-input>
        </el-form-item>
        <el-form-item label="不更新类型" prop="no_update_type">
          <el-select v-model="listQuery.no_update_type" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="(item,index) of updateOptions" :label="item.label" :value="item.key" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <!--<label class="title">计划列表</label>-->
      <el-row class="right-row">
        <el-button type="danger" size="mini" :disabled="!selectData.length" @click="cancleNoUpdate" v-permission="permissions.cancel">批量取消不更新</el-button>
        <el-button type="primary" size="mini" @click="addNoUpdate" v-permission="permissions.add">添加/取消广告</el-button>
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
        <el-table-column prop="id" label="ID" align="center"></el-table-column>
        <el-table-column prop="account" align="center">
          <template slot="header">
            <span style="display: inline-block;width: 100%;text-align: center;">Site Code</span>
          </template>
        </el-table-column>
        <el-table-column prop="istore_product_id" label="Product ID" align="center"></el-table-column>
        <el-table-column prop="product_type" width="400">
          <template slot="header">
            <span style="display: inline-block;width:100%;text-align: center;">不更新类型</span>
          </template>
          <template slot-scope="scope">
            <pre style="margin: 0; font-family: inherit;">{{ scope.row.comment }}</pre>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="操作人" align="center"></el-table-column>
        <el-table-column prop="update_time" label="操作时间" align="center"></el-table-column>
        <el-table-column prop="remark">
          <template slot="header">
            <span style="display: inline-block;width:100%;text-align: center;">备注</span>
          </template>
          <template slot-scope="scope">
            <span>{{ scope.row.remark }}</span>
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
    </div>
    <!--添加指定不更新产品-->
    <add-form v-bind.sync="addNoUpdateProduct" @reload="getList"></add-form>
  </div>
</template>

<script>
import { getSelectAll, noUpdateList, getNoUpdateType, cancleProductNoUpdate } from '@/api/rakuten'
import addForm from './noUpdate/addNoUpdate'
import { filterQueryParams } from '@/utils/help'

export default {
  name: 'UserManage',
  components: { addForm },
  data() {
    return {
      selectData: [],
      options: [],
      updateOptions: [
        { key: 'price', label: '价格' },
        { key: 'stock', label: '库存' },
        { key: 'title', label: '标题' },
        { key: 'description', label: '描述' },
        { key: 'images', label: '图片' },
        { key: 'category', label: '目录' },
        { key: 'specifics', label: '属性' }
      ],
      permissions: {
        add: 'rakuten.advt.update-rule.set',//设置不更新
        cancel: 'rakuten.advt.update-rule.cancel'
      },
      newDate: new Date().getTime(),
      maxHeight: document.documentElement.clientHeight - 200,
      addNoUpdateProduct: {
        open: false,
        accountOptions: [],
        updateOptions: []
      },
      listData: [],
      listLoading: false,
      listQuery: {
        account_id: '',
        no_update_type: '',
        istore_product_id: '',
        page: 1,
        per_page: 10
      },
      pagination: null
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
    // 表格多选
    handleSelectionChange(val) {
      this.selectData = val
    },
    // 批量取消不更新
    cancleNoUpdate() {
      let id = []
      this._.map(this.selectData, item => {
        id = id.concat(item.id)
      })
      const data = {
        id,
        user_id: parseInt(this.$store.state.user.info.id),
        user_name: this.$store.state.user.info.name
      }
      this.$confirm('确定要取消不更新吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        type: 'warning'
      }).then(() => {
        // 调用接口
        cancleProductNoUpdate(data).then(() => {
          this.getList()
        })
      }).catch(() => {
      })
    },
    searchInit() {
      getSelectAll().then(res => {
        this.options = res.data
      })
      getNoUpdateType().then(res => {
        this.updateOptions = res.data
      })
    },
    getList() {
      this.listData = []
      const queryParams = filterQueryParams(this.listQuery)
      noUpdateList(queryParams).then(response => {
        this.listLoading = false
        this.listData = response.data.list
        this.pagination = response.data.pagination
        document.querySelector('.el-table__body-wrapper').scrollTop = 0
      }).finally(() => {
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
        updateOptions: this.updateOptions,
        accountOptions: this.options.account
      }
    },
    clearSearch() {
      this.$refs.listQuery.resetFields()
      this.newDate = new Date().getTime()
      this.getList()
    },
    handleFilter() {
      this.listQuery.page = 1
      this.newDate = new Date().getTime()
      this.getList()
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
