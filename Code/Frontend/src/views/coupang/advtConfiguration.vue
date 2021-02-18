<!--店铺配置-->
<template>
  <div>
    <!-- 搜索 -->
    <div style="border-bottom: 1px solid #EBEEF5;margin-bottom: 10px;">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="site Code" prop="account_id">
          <el-select v-model="listQuery.account_id" multiple filterable clearable collapse-tags placeholder="请选择" style="width: 220px;" size="mini">
            <el-option v-for="(item, key) in options.krAdvtAccount" :key="key" :label="item.site_code" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="自动上传广告状态" prop="status">
          <el-select v-model="listQuery.status" placeholder="请选择状态" size="mini" clearable>
            <el-option label="启用" value="1"></el-option>
            <el-option label="禁用" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="操作人" prop="user_name">
          <el-input type="text" v-model="listQuery.user_name" size="mini" placeholder="请输入操作人" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">搜索</el-button>
          <el-button data-type="clear" @click="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table
        :key="newDate"
        :data="listData"
        v-loading="listLoading"
        border
        style="width: 100%"
        size="mini"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="site_code" label="Site Code" width="150"></el-table-column>
        <el-table-column prop="status" label="自动上传广告状态">
          <template slot-scope="scope">
            <el-tag type="success" size="small" v-if="Number(scope.row.status) === 1">启用</el-tag>
            <el-tag type="warning" size="small" v-else-if="Number(scope.row.status) === 0">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="max_num" label="每日上传最大数量"></el-table-column>
        <el-table-column prop="update_time" label="更新时间"></el-table-column>
        <el-table-column prop="user_name" label="操作人" width="120"></el-table-column>
        <el-table-column label="操作" width="170" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="status_set(scope.row)" v-permission="permissions.info" v-debounce>{{ Number(scope.row.status) === 1 ? '禁用' : '启用' }}</el-button>
            <el-button type="text" size="mini" @click="getPlanDetails(scope.row)" v-permission="permissions.info" v-debounce>修改自动上传配置</el-button>
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
          :page-sizes="[10, 20, 50,100]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
    <!--自动上传配置dialog-->
    <advt_Form v-bind.sync="detailsPlanDialogOption" @reload="upList"></advt_Form>
  </div>
</template>

<script>
import { getSelectAll, accountList, accountUpdate } from '@/api/coupang'
import advt_Form from './advtConfiguration/advtform'
import { filterQueryParams } from '@/utils/help'

export default {
  name: 'UserManage',
  components: { advt_Form },
  data() {
    return {
      // 权限管理
      permissions: {
        info: 'coupang.advt.account.update' // 修改自动上传配置
      },
      newDate: new Date().getTime(),
      maxHeight: document.documentElement.clientHeight - 200,
      detailsPlanDialogOption: {
        rowData: {},
        open: false
      },
      listData: [],
      listLoading: true,
      listQuery: {
        page: 1,
        per_page: 10,
        status: undefined,
        user_name: undefined,
        account_id: []
      },
      pagination: null,
      options: {
        krAdvtAccount: []
      }
    }
  },
  created() {
    this.getOption()
    this.getList()
  },
  mounted() {
  },
  beforeDestroy() {
  },
  methods: {
    //切换状态
    status_set(row) {
      const mes = Number(row.status) === 1 ? '禁用' : '启用'
      this.$confirm(`是否确定${mes}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const obj = {
          account_id: row.account_id,
          status: Number(row.status) === 1 ? 0 : 1
        }
        accountUpdate(obj).then((res) => {
          this.getList()
        })
      }).catch()
    },
    //公共项获取
    getOption() {
      getSelectAll().then(response => {
        this.options = response.data
      })
    },
    upList() {
      this.listQuery.page = 1
      this.getList()
    },
    getList() {
      this.listLoading = true
      const queryParams = filterQueryParams(this.listQuery)
      accountList(queryParams).then(response => {
        this.listData = response.data.list
        this.pagination = response.data.pagination
        document.querySelector('.el-table__body-wrapper').scrollTop = 0
      }).finally((err) => {
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
    getPlanDetails(data) {
      console.log(data)
      this.detailsPlanDialogOption = {
        open: true,
        rowData: data
      }
    },
    clearSearch() {
      this.$refs['listQuery'].resetFields()
      this.upList()
    }
  },
  watch: {}
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
</style>
