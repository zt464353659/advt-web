<!--导出架上广告-->
<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="任务创建时间" prop="time">
          <el-date-picker
            v-model="listQuery.time"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="操作人" prop="username">
          <el-input v-model="listQuery.username" clearable placeholder="请输入操作人" style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <el-row class="right-row">
        <el-button size="mini" type="primary" class="el-icon-circle-plus-outline" @click="searchReport" v-permission="permissions.exportShelvesAdvt_add">添加导出任务</el-button>
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
      >
        <el-table-column prop="id" label="任务ID" width="100" align="center"></el-table-column>
        <el-table-column prop="username" label="操作人" width="200" align="center"></el-table-column>
        <el-table-column label="导出时间段" align="center">
          <template slot-scope="scope">
            {{ scope.row.start_time }} 至 {{ scope.row.end_time }}
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="任务创建时间" align="center">
          <template slot-scope="scope" v-if="Number(scope.row.create_time) > 0">{{ Number(scope.row.create_time) | moment('YYYY-MM-DD HH:mm') }}</template>
        </el-table-column>
        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.status">
              <el-tag type="primary" size="small" v-if="scope.row.status === 15">正在执行</el-tag>
              <el-tag type="danger" size="small" v-if="scope.row.status === 20">执行出错</el-tag>
              <el-tag type="success" size="small" v-if="scope.row.status === 30">执行成功</el-tag>
            </div>
            <p v-else>/</p>
          </template>
        </el-table-column>
        <el-table-column label="报表下载" align="center">
          <template slot-scope="scope">
            <el-link type="primary" v-if="scope.row.status === 30&&userid===scope.row.user_id" size="mini" :href="scope.row.export_url" target="_blank">下载({{ scope.row.file_size }})</el-link>
            <!--     TODO:当前登录的用户只能下载自己导出的数据     -->
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
          :page-sizes="[10, 20, 50, 100, 200]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
    <!--添加导出任务弹窗-->
    <addForm v-bind.sync="addForm" @renderList="renderList"></addForm>
  </div>
</template>

<script>
import { getadvtList, addPlanAccount } from '@/api/shopee'
import addForm from './exportShelvesAdvt/addform'
import { filterQueryParams } from '@/utils/help'
import store from '@/store'

export default {
  components: { addForm },
  data() {
    return {
      permissions: {
        exportShelvesAdvt_add: 'shopee.export.advt.add'//添加
      },//权限
      listQuery: {
        page: 1,
        per_page: 10,
        username: undefined,
        time: []
      },
      listData: [],
      listLoading: false,
      newDate: new Date().getTime(),
      pagination: null,
      multipleSelect: [],
      userid: store.getters.userId||0,//当前用户的userid
      addForm: {
        open: false,
        multipleSelect: []
      }
    }
  },
  created() {
    this.renderList()
    this.options()
  },
  mounted() {
  },
  methods: {
    renderList() {
      this.listData = []
      this.listLoading = true
      this.listQuery.username = this._.trim(this.listQuery.username)
      const query = filterQueryParams(this.listQuery)
      getadvtList(query).then(res => {
        this.listData = res.data.list
        this.pagination = res.data.pagination
      }).finally(() => {
        this.listLoading = false
      })

    },
    handleFilter() {
      this.newDate = new Date().getTime()
      this.listQuery.page = 1
      this.renderList()
    },
    clearSearch() {
      this.$refs.listQuery.resetFields()
      this.newDate = new Date().getTime()
      this.renderList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.renderList()
    },
    handleSizeChange(val) {
      this.listQuery.page = 1
      this.listQuery.per_page = val
      this.renderList()
    },
    options() {
      addPlanAccount().then(response => {
        this.multipleSelect = response.data
      })
    },
    searchReport() {
      this.addForm = {
        open: true,
        multipleSelect: this.multipleSelect
      }
    }
  }
  ,
  filters: {}
  ,
  watch: {}
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
