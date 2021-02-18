<template>
  <el-dialog
    title="日志"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="onClose"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    @open="onOpen"
    width="1000px"
    v-dragMove
  >
    <el-table
      :data="listData"
      v-loading="listLoading"
      border
      style="width: 100%"
      size="mini"
    >
      <el-table-column label="账号" prop="account" align="center" />
      <el-table-column label="优惠券代码" prop="coupon_code" align="center" />
      <el-table-column label="优惠券名称" prop="coupon_no" align="center" />
      <el-table-column label="领取期限" prop="coupon_code" align="center" min-width="260px">
        <template slot-scope="scope">
          <span>{{ `${scope.row.coupon_start_date} - ${scope.row.coupon_end_date}` }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" align="center" />
      <el-table-column label="信息" prop="message" align="center" />
      <el-table-column label="创建时间" prop="create_time" align="center" width="160" />
    </el-table>
  </el-dialog>
</template>
<script>
import { getVoucherLog } from '@/api/shopee'

export default {
  data() {
    return {
      listData: [],
      listLoading: false
    }
  },
  props: {
    open: {
      type: Boolean,
      required: true
    },
    id: {
      type: String,
      required: true
    }
  },
  methods: {
    onOpen() {
      this.listLoading = true
      getVoucherLog({ id: this.id }).then((res) => {
        this.listData = res.data
      }).finally(() => {
        this.listLoading = false
      })
    },
    onClose() {
      this.$emit('update:open', false)
      this.listData = []
    }
  }
}
</script>
