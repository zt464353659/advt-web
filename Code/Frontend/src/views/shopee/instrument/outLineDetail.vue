<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="账号" prop="accounts">
          <multiple-select-account
            ref="multipleSelectAccount"
            v-bind.sync="multipleSelectAccountOption"
            @select-account="selectAccount"
            @clean-select="cleanSelect"
            style="width: 240px"
          ></multiple-select-account>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="listQuery.type" placeholder="请选择类型" clearable>
            <el-option label="无销量下架" value="1"></el-option>
            <el-option label="无销量删除" value="2"></el-option>
            <el-option label="异仓下架" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="操作人" prop="username" clearable>
          <el-input type="text" v-model="listQuery.username" size="mini"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <el-row class="right-row">
        <el-button type="primary"
                   size="mini"
                   @click="addOffLine"
                   v-permission="permissions.outLineDetail_offlineAdd"
        >
          下架
        </el-button>
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
      >
        <!--序号、账号、操作时间、操作人-->
        <el-table-column prop="id" label="序号"></el-table-column>
        <el-table-column prop="account" label="账号"></el-table-column>
        <el-table-column prop="type" label="类型">
          <template slot-scope="scope">
            <div v-if="scope.row.type === 1">无销量下架</div>
            <div v-if="scope.row.type === 2">无销量删除</div>
            <div v-if="scope.row.type === 3">异仓下架</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态"></el-table-column>
        <el-table-column prop="create_time" label="操作时间"></el-table-column>
        <el-table-column prop="username" label="操作人"></el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="getPlanDetails(scope.row)" v-permission="permissions.outLineDetail_offlineInfo">详情</el-button>
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
    <!--添加计划弹窗dialog-->
    <add-form v-bind.sync="addPlanDialogOption" @reload="getList"></add-form>
    <!--计划执行详情弹窗dialog-->
    <details-form v-bind.sync="detailsPlanDialogOption"></details-form>
  </div>
</template>

<script>
import { toolOffLineList, userSelect } from '@/api/shopee'
import addForm from './compoments/addForm'
import multipleSelectAccount from './compoments/components/multipleSelectAccount'
import detailsForm from './compoments/components/detailsForm.vue'

export default {
  name: 'Plan',
  components: { addForm, multipleSelectAccount, detailsForm },
  data() {
    return {
      permissions: {
        outLineDetail_offlineAdd: 'shopee.tools.offline.add',//添加异仓下架
        outLineDetail_offlineInfo: 'shopee.tools.offline.info'//详情日志
      },//权限
      multipleSelectAccountOption: {
        accountArr: [],
        accountKey: 'id'
      },
      newDate: new Date().getTime(),
      maxHeight: document.documentElement.clientHeight - 200,
      addPlanDialogOption: {
        data: {},
        open: false
      },
      detailsPlanDialogOption: {
        data: {},
        open: false
      },
      listData: [],
      listLoading: true,
      listQuery: {
        page: 1,
        per_page: 10,
        accounts: [],
        type: undefined,
        username: undefined
      },
      pagination: null
    }
  },
  created() {
    this.SearchInit()
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
    //打开详情
    getPlanDetails(data) {
      this.detailsPlanDialogOption = {
        open: true,
        data: data
      }
    },
    // 初始化站点选项
    SearchInit() {
      const optionsParams = ['shopeeAdvtAccount']
      userSelect(optionsParams).then(response => {
        this.multipleSelectAccountOption.accountArr = response.data.shopeeAdvtAccount
      })
    },
    // site code多选框
    selectAccount(arr) {
      this.listQuery.accounts = arr
    },
    cleanSelect() {
      this.$refs['listQuery'].resetFields()
    },
    getList() {
      this.listData = []
      this.listLoading = true
      toolOffLineList(Object.assign(this.listQuery, { not_show_message: true })).then(response => {
        this.listLoading = false
        this.listData = response.data.list
        this.pagination = response.data.pagination
        document.querySelector('.el-table__body-wrapper').scrollTop = 0
      }).catch((e) => {
        this.$message.error(e)
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
    addOffLine() {
      this.addPlanDialogOption = {
        open: true,
        data: {}
      }
    },
    clearSearch() {
      this.$refs.multipleSelectAccount.handleCancelAllUser()
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
