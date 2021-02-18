<template>
  <el-dialog
    :title="'新增折扣活动广告'"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    v-dragMove
  >
    <!--搜索-->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" class="advt-form-inline" :model="listQuery" size="mini" >
        <el-form-item label="Product ID" prop="product_id">
          <el-input size="mini" v-model="listQuery.product_id" placeholder="多个请用空格隔开"></el-input>
        </el-form-item>
        <el-form-item label="平台商品号" prop="spu_id">
          <el-input size="mini" v-model="listQuery.spu_id" placeholder="请用空格分隔"></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="product_name">
          <el-input size="mini" v-model="listQuery.product_name" placeholder="关键字搜索"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!--列表-->
    <el-table :data="listData"
              ref="table"
              :key="newDate"
              v-loading="listLoading"
              element-loading-text="努力加载中"
              border
              style="width: 100%"
              highlight-current-row
              @current-change="handleCurrentChange1"
              @select-all="handleSelectionChange"
              @select="handleSelectionRow"
              @selection-change="selectionChange"
              @sort-change="tableResortEvent"
    >
      <el-table-column type="selection" width="40"></el-table-column>
      <el-table-column prop="id" label="ID" min-width="50"></el-table-column>
      <el-table-column prop="istore_product_id" label="Product ID" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.istore_product_id }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="spu_id" label="平台商品号" width="120"></el-table-column>
      <el-table-column prop="image_path" label="产品图片" width="90" align="center">
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
      <el-table-column prop="product_name" label="名称" min-width="300"></el-table-column>
    </el-table>
    <!--分页-->
    <div class="pagination-container">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper" small
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="listQuery.page"
        :page-sizes="[10, 20, 30, 50, 100, 200]"
        :page-size="listQuery.per_page"
        :total="pagination ? pagination.total : 0"
      >
      </el-pagination>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" :disabled="setPriceArr.length === 0" @click="submit(setPriceArr)">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { filterQueryParams } from '@/utils/help'
  import { addActivationAdvt, addDiscountDetailAdvt } from '@/api/shopee'

  export default {
    name: 'NewAdvertisement',
    components: {},
    data() {
      return {
        listQuery: {
          page: 1,
          per_page: 10,
          account_id: this.$route.params.account_id,
          product_id: undefined,
          product_name: undefined,
          spu_id: undefined
        },
        checkPickShow: true,
        pagination: null,
        listData: [],
        newDate: new Date().getTime(),
        checkNum: 0,
        multipleTable: [],
        discount_ids: this.$route.params.discount_id,
        listLoading: false
      }
    },
    created() {
      this.addActivatedAdvt()
    },
    mounted() {
    },
    props: {
      open: Boolean
    },
    methods: {
      // 调用新增活动接口
      addActivatedAdvt() {
        this.listData = []
        this.listLoading = true
        this.listQuery.product_id = this._.trim(this.listQuery.product_id)
        this.listQuery.product_name = this._.trim(this.listQuery.product_name)
        const queryParams = filterQueryParams(this.listQuery)
        addActivationAdvt(queryParams).then((res) => {
          this.listLoading = false
          this.listData = res.data.list
          this.pagination = res.data.pagination
          this._.forEach(this.listData, (v) => {
            // 图片缩略图
            v.pathArr = []
            if (v.image_path) {
              v.pathArr.push(v.image_path)
            }
          })
          this.tableResortEvent()
        }).catch(() => {
          this.listLoading = false
        })
      },
      handleFilter() {
        if (this.listQuery.product_id && this.listQuery.product_id.trim()) {
          const aa = this.listQuery.product_id.trim().replace(/\s+/g, ',')
          const productIdArr = aa.split(',')
          if (productIdArr.length > 10) {
            this.$message.error('最多输入10个 Product ID')
            return
          }
        }
        if (this.listQuery.spu_id && this.listQuery.spu_id.trim()) {
          const aa = this.listQuery.spu_id.trim().replace(/\s+/g, ',')
          const productIdArr = aa.split(',')
          if (productIdArr.length > 10) {
            this.$message.error('最多输入10个平台商品号')
            return
          }
        }
        this.newDate = new Date().getTime()
        this.filter = 'filter'
        this.listQuery.page = 1
        this.addActivatedAdvt()
      },
      // 搜索清空
      clearSearch() {
        this.$refs.listQuery.resetFields()
        this.newDate = new Date().getTime()
        this.filter = 'filter'
        this.addActivatedAdvt()
      },
      handleSelectionChange(val) {
        this._.forEach(this.listData, (v) => {
          this._.forEach(v.child_product, (v2) => {
            v2.isSelected = false
          })
        })
        this._.forEach(val, (v) => {
          this._.forEach(v.child_product, (v2) => {
            v2.isSelected = true
          })
        })
        this.multipleTable = val
      },
      handleSelectionRow(val, row) {
        const check = this._.some(row.child_product, (v, i) => {
          return v.isSelected
        })
        if (check) {
          this._.forEach(row.child_product, v => {
            v.isSelected = false
          })
        } else {
          this._.forEach(row.child_product, v => {
            v.isSelected = true
          })
        }
      },
      // 勾选内容
      selectionChange(val) {
        this.multipleTable = val
        this.checkNum++
      },
      // 清理缩略图缓存
      tableResortEvent() {
        this.checkPickShow = false
        this.$nextTick(() => {
          this.checkPickShow = true
        })
      },
      handleSizeChange(val) {
        this.listQuery.page = 1
        this.listQuery.per_page = val
        this.addActivatedAdvt()
      },
      handleCurrentChange1(val) {
        this.currentRow = val
      },
      handleCurrentChange(val) {
        this.listQuery.page = 1
        this.listQuery.page = val
        this.addActivatedAdvt()
      },
      // 关闭弹窗
      onClose() {
        this.$emit('update:open', false)
        this.$refs['listQuery'].resetFields()
        this.handleCurrentChange()
      },
      // 确定提交
      submit(row) {
        const advts = []
        this._.forEach(row, (v) => {
          advts.push(v.id)
        })
        const obj = {
          discount_id: this.discount_ids,
          account_id: this.listQuery.account_id,
          user_id: this.$store.state.user.info.id,
          advt_id: this._.join(advts, ',')
        }
        addDiscountDetailAdvt(obj).then(() => {
          this.$emit('reload')
        }).catch(() => {})
        this.onClose()
      }
    },
    computed: {
      setPriceArr() {
        // this.checkNumChange(this.checkNum)
        const arr = []
        this._.forEach(this.multipleTable, (v) => {
          arr.push(v)
        })
        return arr
      }
    },
    filters: {},
    watch: {}
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
