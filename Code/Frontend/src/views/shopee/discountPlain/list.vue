<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="状态" prop="status">
          <el-select size="mini" v-model="listQuery.status" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="item in options.statusList" :key="item.id" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="操作人" prop="user_name">
          <el-input v-model="listQuery.user_name" size="mini"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <el-row class="right-row">
        <el-button v-permission="permissions.discountPlain_planAdd"
                   type="primary"
                   size="mini"
                   @click="handleAddDiscountPlain"
        >
          添加折扣计划
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
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" align="center" width="80"></el-table-column>
        <el-table-column prop="site_code" label="Site Code" width="300" align="center"></el-table-column>
        <el-table-column prop="operation_type" label="任务类型" align="center">
          <template v-slot="scope">
            <span>{{ Number(scope.row.operation_type) === 1 ? '更新售价（折扣价）' : '更新系统折扣售价' }}</span>
          </template>
        </el-table-column>
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
        <el-table-column prop="user_name" label="操作人" width="100" align="center"></el-table-column>
        <el-table-column prop="create_time" label="操作时间" width="150" align="center">
          <!-- <template v-slot="scope">
            <div v-if="scope.row.create_time">
              {{ parseInt(scope.row.create_time) | moment('YYYY-MM-DD HH:mm') }}
            </div>
            <div v-else>/</div>
          </template> -->
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button type="text"
                       size="mini"
                       @click="handelViewDetail(scope.row)"
                       v-permission="permissions.discountPlain_planInfo"
            >
              详情
            </el-button>
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
          :page-sizes="[20, 50, 100, 200]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
    <!-- 增加折扣计划弹窗 -->
    <add-discount-plain-dialog v-bind.sync="addDiscountPlainDialogOption" @emit-upload="renderList"></add-discount-plain-dialog>
    <!-- 折扣计划详情弹窗 -->
    <discount-plan-detail-dialog v-bind.sync="discountPlanDetailDialogOption"></discount-plan-detail-dialog>
  </div>
</template>

<script>
import addDiscountPlainDialog from './components/addDiscountPlainDialog'
import discountPlanDetailDialog from './components/discountPlanDetailDialog'
import { apiGetDiscountPlainList, addPlanAccount } from '@/api/shopee'

export default {
  name: 'Plan',
  components: { addDiscountPlainDialog, discountPlanDetailDialog },
  data() {
    return {
      permissions: {
        discountPlain_planAdd: 'shopee.discount.discount-plan.add',//添加折扣计划
        discountPlain_planInfo: 'shopee.discount.discount-plan.info'//查看折扣计划详情
      },//权限
      newDate: new Date().getTime(),
      options: {
        statusList: [
          { label: '未执行', value: 10 },
          { label: '正在执行', value: 15 },
          { label: '执行成功', value: 30 },
          { label: '执行出错', value: 20 }
        ]
      },
      listData: [],
      listLoading: false,
      listQuery: {
        user_name: undefined,
        status: '',
        page: 1,
        per_page: 20
      },
      pagination: null,
      permission: {
        add: 'shopee.discount.discount-plan.add'
      },
      addDiscountPlainDialogOption: {
        open: false,
        data: {},
      },
      discountPlanDetailDialogOption: {
        open: false,
        data: {}
      }
    }
  },
  created() {
    this.renderList()
  },
  methods: {
    /* 跳转详情 */
    openTheNewTAB(name, params) {
      const { href } = this.$router.resolve({
        name: name,
        params: params || {}
      })
      window.open(href, '_blank')
    },
    handleAddDiscountPlain() {
      this.addDiscountPlainDialogOption.open = true
    },
    // 搜索
    handleFilter() {
      this.newDate = new Date().getTime()
      this.listQuery.page = 1
      this.renderList()
    },
    renderList() {
      this.listData = []
      this.listLoading = true
      const data = this.createSearchData()
      apiGetDiscountPlainList(data).then(response => {
        this.listData = response.data.list
        this.pagination = response.data.pagination
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    createSearchData() {
      const cloneForm = this._.cloneDeep(this.listQuery)
      cloneForm.status = cloneForm.status || 0
      cloneForm.not_show_message = true
      return cloneForm
    },
    // 查看详情
    handelViewDetail(row) {
      this.discountPlanDetailDialogOption = {
        open: true,
        data: row
      }
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
    // 清空筛选项
    clearSearch() {
      this.$refs.listQuery.resetFields()
      this.newDate = new Date().getTime()
      this.renderList()
    }
  },
  watch: {}
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.el-popover {
  max-height: 400px !important;
  overflow-y: auto !important;
}
</style>
