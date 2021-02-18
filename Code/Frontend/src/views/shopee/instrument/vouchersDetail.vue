<template>
  <div>
    <div class="header-box">
      <el-row class="left-row">
        <el-form ref="listQuery" :inline="true" size="mini" :model="listQuery">
          <el-form-item label="账号">
            <el-select v-model="listQuery.account" clearable>
              <el-option
                v-for="item in acountArr"
                :key="item.value"
                :label="item.account"
                :value="item.account"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="listQuery.coupon_status" clearable>
              <el-option
                v-for="item in stateArr"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" v-debounce:listQuery="handleFilter">查询</el-button>
            <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
          </el-form-item>
        </el-form>
      </el-row>
      <el-row class="right-row">
        <el-button type="primary" size="mini" @click="openCreateWindow" v-permission="permissions.vouchersDetail_couponAdd">创建优惠券</el-button>
      </el-row>
    </div>

    <el-table
      :data="listData"
      v-loading="listLoading"
      border
      :max-height="maxHeight"
      style="width: 100%"
      size="mini"
    >
      <el-table-column label="账号" prop="account_list" align="center" min-width="260px" />
      <el-table-column label="领取期限" prop="coupon_code" align="center" min-width="260px">
        <template slot-scope="scope">
          <span>{{ `${scope.row.coupon_start_date} - ${scope.row.coupon_end_date}` }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="coupon_status" align="center" />
      <el-table-column label="创建时间" prop="create_time" align="center" width="160" />
      <el-table-column label="操作人" prop="user_name" align="center" />
      <el-table-column label="操作" fixed="right" align="center" width="180">
        <template slot-scope="scope">
          <el-button type="text" @click="openDetail(scope.row, false)">详情</el-button>
          <el-button type="text" @click="voucherEnd(scope.row.id)"
                     v-if="scope.row.coupon_status === '进行中'"
                     :disabled="scope.row.is_handle !== '0'"
                     v-permission="permissions.vouchersDetail_couponEnd"
          >
            结束
          </el-button>
          <el-button type="text" @click="voucherDel(scope.row.id)"
                     v-if="scope.row.coupon_status === '预定'"
                     :disabled="scope.row.is_handle !== '0'"
                     v-permission="permissions.vouchersDetail_couponDelete"
          >
            删除
          </el-button>
          <el-button type="text"
                     @click="openDetail(scope.row, true)"
                     v-permission="permissions.vouchersDetail_couponCopy"
          >
            复制
          </el-button>
          <el-button type="text" @click="openLog(scope.row.id)">日志</el-button>
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
    <voucherCreate v-bind.sync="createDialogOption" @close="handleFilter" />
    <voucherLog v-bind.sync="logDialogOption" />
  </div>
</template>
<script>
import voucherCreate from './compoments/voucherCreate'
import voucherLog from './compoments/voucherLog'
import { getVoucherList, voucherEnd, voucherAccount, voucherDel } from '@/api/shopee'

export default {
  data() {
    return {
      permissions: {
        vouchersDetail_couponAdd: 'shopee.tools.coupon.add',//创建优惠券
        vouchersDetail_couponEnd: 'shopee.tools.coupon.end',//结束优惠券
        vouchersDetail_couponDelete: 'shopee.tools.coupon.delete',//删除优惠券
        vouchersDetail_couponCopy: 'shopee.tools.coupon.copy'//复制优惠券
      },//权限

      stateArr: [
        { value: '1', label: '预定' },
        { value: '2', label: '进行中' },
        { value: '3', label: '已结束' }
      ],
      acountArr: [],
      listData: [],
      listLoading: false,
      listQuery: {
        account: '',
        coupon_status: '',
        page: 1,
        per_page: 10
      },
      pagination: null,
      maxHeight: document.documentElement.clientHeight - 200,
      createDialogOption: {
        data: {},
        open: false,
        readonly: false,
        copy: false
      },
      logDialogOption: {
        open: false,
        id: ''
      }
    }
  },
  components: {
    voucherCreate,
    voucherLog
  },
  mounted() {
    this.getList()
    this.getAccount()
  },
  methods: {
    getAccount() {
      voucherAccount().then((res) => {
        this.acountArr = res.data
      })
    },
    getList() {
      this.listLoading = true
      getVoucherList(this.listQuery).then((res) => {
        this.listData = res.data.list
        this.pagination = res.data.pagination
      }).catch((err) => {

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
    openCreateWindow() {
      this.createDialogOption = {
        data: {},
        open: true,
        readonly: false,
        copy: false
      }
    },
    voucherEnd(id) {
      this.$confirm('是否结束优惠券?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log('结束')
        voucherEnd({ id: id }).then((res) => {
          this.getList()
        })
      })
    },
    voucherDel(id) {
      this.$confirm('是否删除优惠券?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log('删除')
        voucherDel({ id: id }).then((res) => {
          this.getList()
        })
      })
    },
    openLog(id) {
      this.logDialogOption = {
        open: true,
        id: id
      }
    },
    openDetail(row, isCopy) {
      this.createDialogOption = {
        data: {
          id: row.id,
          coupon_code: row.coupon_code,
          coupon_type: row.coupon_type
        },
        open: true,
        readonly: true,
        copy: isCopy
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList(this.listQuery)
    },
    clearSearch() {
      this.listQuery = {
        account: '',
        coupon_status: '',
        page: 1,
        per_page: 10
      },
        this.getList(this.listQuery)
    }
  }
}
</script>
<style lang="scss" scoped>
.create-btn {
  display: flex;
  justify-content: flex-end;
}
</style>
