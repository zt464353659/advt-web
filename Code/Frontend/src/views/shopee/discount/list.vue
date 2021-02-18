<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="Site Code" prop="account_id">
          <el-select v-model="listQuery.account_id" size="mini" clearable filterable placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.id"
              :label="item.site_code"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="折扣活动名称" prop="name">
          <el-input v-model="listQuery.name" size="mini" placeholder="请输入关键字"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="header-box">
      <el-row class="left-row">
        <el-tag v-for="(status, i) in activityType" :key="i" :type="statusSelected(status.key)" size="medium">
          <span @click="changeStatus(status.key)">{{ status.label }}</span>
        </el-tag>
      </el-row>
      <el-row class="right-row">
        <el-button v-permission="permission.delete" v-if="listQuery.status === 1" :disabled="!multipleTable.length" type="danger" size="mini" @click="handleDelete('all')">批量删除</el-button>
        <el-button v-permission="permission.add" type="primary" size="mini" @click="addActivity">新增折扣活动</el-button>
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
        <el-table-column type="selection" width="50" v-if="listQuery.status === 1"></el-table-column>
        <el-table-column prop="id" label="序号" width="80"></el-table-column>
        <el-table-column prop="site_code" label="Site Code" width="220" align="center"></el-table-column>
        <el-table-column prop="name" label="折扣名称" align="center"></el-table-column>
        <el-table-column prop="start_countdow" label="开始倒计时" align="center" v-if="listQuery.status === 1">
          <template slot-scope="scope">
            <span v-if="scope.row.timer.year">{{ `${scope.row.timer.year}年` }}</span>
            <span v-if="scope.row.timer.month">{{ `${scope.row.timer.month}月` }}</span>
            <span v-if="scope.row.timer.day">{{ `${scope.row.timer.day}天` }}</span>
            <span v-if="scope.row.timer.hour">{{ `${scope.row.timer.hour}时` }}</span>
            <span v-if="scope.row.timer.minute">{{ `${scope.row.timer.minute}分` }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="start_countdow" label="结束倒计时" align="center" v-if="listQuery.status === 2">
          <template slot-scope="scope">
            <span v-if="scope.row.timer.year">{{ `${scope.row.timer.year}年` }}</span>
            <span v-if="scope.row.timer.month">{{ `${scope.row.timer.month}月` }}</span>
            <span v-if="scope.row.timer.day">{{ `${scope.row.timer.day}天` }}</span>
            <span v-if="scope.row.timer.hour">{{ `${scope.row.timer.hour}时` }}</span>
            <span v-if="scope.row.timer.minute">{{ `${scope.row.timer.minute}分` }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="discount_num" label="广告数量" align="center" width="100"></el-table-column>
        <el-table-column prop="product_image" label="产品图片" width="90" align="center">
          <template slot-scope="scope">
            <PictureView
              v-if="scope.row.pathArr.length > 0 && checkPickShow"
              :pictureList="scope.row.pathArr"
              :width="50"
              :height="50"
              :thumbnail="false"
            ></PictureView>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="start_time" label="开始时间" align="center" sort-by="create_time" sortable>
          <template slot-scope="scope" v-if="parseInt(scope.row.start_time) > 0">{{ parseInt(scope.row.start_time) | moment('YYYY-MM-DD HH:mm') }}</template>
        </el-table-column>
        <el-table-column prop="end_time" label="结束时间" align="center" sort-by="end_time" sortable>
          <template slot-scope="scope" v-if="parseInt(scope.row.end_time) > 0">{{ parseInt(scope.row.end_time) | moment('YYYY-MM-DD HH:mm') }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openTheNewTAB('shopee.discount.detail',{ discount_id: scope.row.id, account_id: scope.row.account_id, is_clear_stocks: scope.row.is_clear_stocks })">详情</el-button>
            <el-button v-permission="permission.delete" v-if="listQuery.status === 1 && scope.row.is_clear_stocks !== '1' && scope.row.is_clear_stocks !== '2'" type="text" size="mini" @click="handleDelete('single', scope.row.id)">删除</el-button>
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
    <!-- 导入组件 -->
    <add-activity v-bind.sync="addActivityOptions" @reload="getList"></add-activity>
  </div>
</template>

<script>
  import { getDiscountList, deleteDiscount } from '@/api/shopee'
  import { userSelect } from '@/api/shopee'
  import { filterQueryParams } from '@/utils/help'
  import addActivity from './component/addActivity'

  export default {
    name: 'Plan',
    components: { addActivity },
    data() {
      return {
        newDate: new Date().getTime(),
        multipleTable: [],
        options: [],
        checkPickShow: true,
        addActivityOptions: {
          options: [],
          open: false
        },
        detailsPlanDialogOption: {
          data: {},
          open: false
        },
        listData: [],
        listLoading: true,
        listQuery: {
          account_id: undefined,
          name: undefined,
          status: 1,
          page: 1,
          per_page: 20
        },
        pagination: null,
        activityType: [
          { key: 1, label: '接下来活动' },
          { key: 2, label: '进行中活动' },
          { key: 3, label: '过期活动' }
        ],
        permission: {
          add: 'shopee.discount.discount-advt.add',
          delete: 'shopee.discount.discount.delete'
        }
      }
    },
    created() {
      this.selectInit()
      this.getList()
    },
    methods: {
      // 初始化站点选项
      selectInit() {
        const optionsParams = ['shopeeAdvtAccount']
        userSelect(optionsParams).then(response => {
          this.options = response.data.shopeeAdvtAccount
        })
      },
      handleSelectionChange(val) {
        this.multipleTable = val
      },
      // 表格序号
      indexMethod(index) {
        return index + 1
      },
      /* 跳转详情 */
      openTheNewTAB(name, params) {
        // this.$router.push(path + id.id + '/' + id.account_id)
        const { href } = this.$router.resolve({
          name: name,
          params: params || {}
        })
        window.open(href, '_blank')
      },

      // 删除
      handleDelete(type, id) {
        this.$confirm('确定删除活动吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.listLoading = true
          let ids = []
          if (type === 'all') {
            ids = this.multipleTable.map(val => val.id)
          } else {
            ids.push(id)
          }
          deleteDiscount({ ids }).then(() => {
            this.getList()
          }).finally(() => {
            this.listLoading = false
          })
        }).catch(() => {})
      },
      // 搜索
      handleFilter() {
        this.newDate = new Date().getTime()
        this.listQuery.page = 1
        this.getList()
      },
      statusSelected(key) {
        return this.listQuery.status === key ? 'warning' : ''
      },
      changeStatus(key) {
        this.newDate = new Date().getTime()
        if (this.listQuery.advtStatus !== key) {
          this.listQuery.status = key
          this.listQuery.page = 1
          this.getList()
        }
      },
      // 获取活动列表
      getList() {
        this.listData = []
        this.listLoading = true
        this.multipleTable = []
        const queryParams = filterQueryParams(this.listQuery)
        getDiscountList(queryParams).then(response => {
          this.listLoading = false
          this.listData = response.data.list
          this.pagination = response.data.pagination
          this._.forEach(this.listData, V => {
            V.pathArr = []
            if (V.discount_imgs.length > 0) {
              V.pathArr.push(V.discount_imgs[0])
            }
          })
          this.checkPickShow = false
          this.$nextTick(() => {
            this.checkPickShow = true
          })
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
      // 新增折扣活动
      addActivity() {
        this.addActivityOptions = {
          open: true,
          options: this.options
        }
      },
      // 清空筛选项
      clearSearch() {
        this.$refs.listQuery.resetFields()
        this.newDate = new Date().getTime()
        this.filter = 'filter'
        this.getList()
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
