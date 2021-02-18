<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-row class="right-row">
        <el-button type="primary" size="mini" @click="handleAdd" v-permission="permissions.add">添加</el-button>
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
        <el-table-column prop="id" label="任务ID" width="80"></el-table-column>
        <el-table-column prop="site_code" label="Site Code" width="100"></el-table-column>
        <el-table-column prop="data" label="广告ID" min-width="200">
          <template slot-scope="scope">
            <div v-if="scope.row.data.length > 90">
              <el-popover placement="right" width="480" trigger="hover">
                <p style="line-height: 24px; font-size: 12px; word-wrap: break-word; max-height: 400px; overflow-y: auto;">{{ scope.row.data }}</p>
                <p slot="reference" class="in-a-line" style="width: 100%; color: #E6A23C; margin: 0;">{{ scope.row.data }}</p>
              </el-popover>
            </div>
            <div v-else>{{ scope.row.data }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" align="center" width="100">
          <template slot-scope="scope">
            <el-tag type="info" size="small" v-if="Number(scope.row.status) === 10">未执行</el-tag>
            <el-tag type="primary" size="small" v-else-if="Number(scope.row.status) === 20">执行中</el-tag>
            <el-tag type="success" size="small" v-else-if="Number(scope.row.status) === 30">执行成功</el-tag>
            <el-tag type="danger" size="small" v-else-if="Number(scope.row.status) === 40">执行失败</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="操作人" width="100" align="center"></el-table-column>
        <el-table-column prop="create_time" label="操作时间" width="140">
          <template slot-scope="scope" v-if="scope.row.create_time !== no_time">{{ scope.row.create_time }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="getPlanDetails(scope.row)" v-permission="permissions.info">详情</el-button>
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
    <!--添加计划弹窗dialog-->
    <add-online-error v-bind.sync="addPlanDialogOption" @reload="getList"></add-online-error>
    <!--计划执行详情弹窗dialog-->
    <online-error-detail v-bind.sync="detailsPlanDialogOption"></online-error-detail>
  </div>
</template>

<script>
import { onlineErrorList } from '@/api/real'
import addOnlineError from './onlineError/addOnlineError'
import onlineErrorDetail from './onlineError/onlineErrorDetails'
import { filterQueryParams } from '@/utils/help'

export default {
  name: 'UserManage',
  components: { addOnlineError, onlineErrorDetail },
  data() {
    return {
      no_time: '1970-01-01 08:00:00',
      // 权限管理
      permissions: {
        info: 'real.advt.online-error-unit.info', // 异常广告详情
        add: 'real.advt.online-error-unit.create' // 添加异常广告
      },
      newDate: new Date().getTime(),
      status: '状态 ',
      title: '类型 ',
      filterTypeIcon: 'filter',
      filterStatusIcon: 'filter',
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
        per_page: 10
      },
      pagination: null
    }
  },
  created() {
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
    getList() {
      this.listLoading = true
      const queryParams = filterQueryParams(this.listQuery)
      onlineErrorList(queryParams).then(response => {
        this.listData = response.data.list
        this.pagination = response.data.pagination
        document.querySelector('.el-table__body-wrapper').scrollTop = 0
      }).finally(_ => {
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
    handleAdd() {
      this.addPlanDialogOption = {
        open: true
      }
    },
    getPlanDetails(data) {
      this.detailsPlanDialogOption = {
        open: true,
        data: data
      }
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
