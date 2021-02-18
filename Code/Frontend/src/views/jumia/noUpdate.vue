<template>
  <div class="noupdate">
    <!-- 搜索 -->
    <div class="header-box special-delete">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="Site Code" prop="account_id">
          <el-select v-model="listQuery.account_id" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="item in options.JumiaAdvtAccount" :key="item.id" :label="item.account" :value="item.id"></el-option>
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
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column prop="id" label="ID" width="60"></el-table-column>
        <el-table-column prop="account" width="110">
          <template slot="header">
            <span style="display: inline-block;width: 100%;text-align: center;">Site Code</span>
          </template>
        </el-table-column>
        <el-table-column prop="istore_product_id" label="Product ID" width="100"></el-table-column>
        <el-table-column prop="product_type" width="400">
          <template slot="header">
            <span style="display: inline-block;width:100%;text-align: center;">不更新类型</span>
          </template>
          <template slot-scope="scope">
            <pre style="margin: 0; font-family: inherit;">{{ scope.row.comment }}</pre>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="操作人" width="100" align="center"></el-table-column>
        <el-table-column prop="update_time" label="操作时间" width="140" align="center"></el-table-column>
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
import { getSelectAll, updateRuleList, updateRuleCancel } from '@/api/jumia'
import addForm from './noUpdate/addNoUpdate'
import { filterQueryParams } from '@/utils/help'

export default {
  components: { addForm },
  data() {
    return {
      selectData: [],
      options: [],
      updateOptions: [
        { key: 'title', label: 'title' },
        { key: 'description', label: 'description' },
        { key: 'category', label: 'category' },
        { key: 'price', label: 'price' },
        { key: 'stock', label: 'stock' },
        { key: 'images', label: 'images' },
        { key: 'specifics', label: 'specifics' }
      ],
      permissions: {
        add: 'jumia.advt.update-rule.set',//设置不更新
        cancel: 'jumia.advt.update-rule.cancel'//取消
      },
      newDate: new Date().getTime(),
      addNoUpdateProduct: {
        open: false,
        accountOptions: {},
        updateOptions: []
      },
      listData: [],
      listLoading: false,
      listQuery: {
        account_id: undefined,
        istore_product_id: '',
        no_update_type: '',
        page: 1,
        per_page: 10
      },
      pagination: null
    }
  },
  created() {
    this.searchInit()
    this.getList()
  },
  mounted() {
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
        id.push(item.id)
      })
      const data = {
        id
        // user_id: Number(this.$store.state.user.info.id),
        // user_name: this.$store.state.user.info.name
      }
      this.$confirm('确定要取消不更新吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        type: 'warning'
      }).then(() => {
        // 调用接口
        updateRuleCancel(data).then(() => {
          this.getList()
        })
      }).catch(() => {
      })
    },
    searchInit() {
      const keys = ['JumiaAdvtAccount', 'JumiaAdvtTypes']
      getSelectAll({ keys }).then(res => {
        console.log(res)
        this.options = res.data
      })
      // getNoUpdateType().then(res => {
      //   this.updateOptions = res.data
      // })
    },
    //
    getList() {
      this.listData = []
      this.listLoading = true
      const queryParams = filterQueryParams(this.listQuery)
      updateRuleList(queryParams).then(response => {
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
    //
    addNoUpdate() {
      this.addNoUpdateProduct = {
        open: true,
        updateOptions: this.updateOptions,
        accountOptions: this.options.JumiaAdvtAccount
      }
    },
    //清空
    clearSearch() {
      this.$refs.listQuery.resetFields()
      this.newDate = new Date().getTime()
      this.getList()
    },
    //搜索
    handleFilter() {
      this.listQuery.page = 1
      this.newDate = new Date().getTime()
      this.getList()
    }
  },
  watch: {}
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
</style>
<style rel="stylesheet/scss" lang="scss">

</style>
