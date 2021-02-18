<template>
  <div>
    <!-- 搜索 -->
    <div >
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="site code" prop="account_id">
          <el-select v-model="listQuery.account_id" clearable placeholder="请选择">
            <el-option
              v-for="i in options.allegroAdvtAccount"
              :key="i.id"
              :label="i.account"
              :value="i.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="平台商号" prop="spu_id">
          <el-input v-model="listQuery.spu_id" clearable size="mini" placeholder="多个请用空格分隔"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="options">
          <el-select v-model="listQuery.options" placeholder="请选择类型" collapse-tags clearable multiple style="margin-left: 20px;width: 280px;">
            <el-option label="featured offers" value="emphasized"></el-option>
            <el-option label="Promo Package" value="emphasizedHighlightBoldPackage"></el-option>
            <el-option label="promotion on the category page" value="departmentPage"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
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
        :max-height="maxHeight"
        style="width: 100%"
      >
        <el-table-column type="index" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="site_code" label="site code" width="100" align="center"></el-table-column>
        <el-table-column prop="spu_id" label="平台商品号"></el-table-column>
        <el-table-column prop="promotion.emphasized" label="featured offers" align="center" width="220">
          <template slot-scope="scope">
            <div class="promColor">{{ scope.row.promotion.emphasized.enable ? '参加' : '未参加' }}</div>
            <div v-if="scope.row.promotion.emphasized.enable">
              <el-tooltip class="item" effect="dark" content="到期时间" placement="top">
                <span>{{ scope.row.promotion.emphasized.expire }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="promotion.EmphasizedHighlightBoldPackage" align="center" label="Promo Package">
          <template slot-scope="scope">
            <div class="promColor">{{ scope.row.promotion.emphasizedHighlightBoldPackage.enable ? '参加' : '未参加' }}</div>
            <div v-if="scope.row.promotion.emphasizedHighlightBoldPackage.enable">
              <el-tooltip class="item" effect="dark" content="到期时间" placement="top">
                <span>{{ scope.row.promotion.emphasizedHighlightBoldPackage.expire }}</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="promotion.DepartmentPage" align="center" label="promotion on the category page">
          <template slot-scope="scope">
            <div class="promColor">{{ scope.row.promotion.departmentPage.enable ? '参加' : '未参加' }}</div>
            <div v-if="scope.row.promotion.departmentPage.enable">
              <el-tooltip class="item" effect="dark" content="到期时间" placement="top">
                <span>{{ scope.row.promotion.departmentPage.expire }}</span>
              </el-tooltip>
            </div>
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
  </div>
</template>

<script>
import { apiGetSelectAll, getAdvtPrPlanlist } from '@/api/allegro'

export default {
  components: {},
  data() {
    return {
      newDate: new Date().getTime(),
      maxHeight: document.documentElement.clientHeight - 200,
      listData: [],
      options: [],
      listLoading: true,
      listQuery: {
        spu_id: undefined,
        account_id: undefined,
        type: undefined,
        page: 1,
        per_page: 10
      },
      pagination: undefined
    }
  },
  created() {
    this.getall()
    this.getList()
  },
  mounted() {
  },
  methods: {
    getList() {
      this.listData = []
      this.listLoading = true
      this.listQuery.spu_id = this.listQuery.spu_id ? this.listQuery.spu_id.trim() : undefined
      const queryParams = this._.cloneDeep(this.listQuery)
      getAdvtPrPlanlist(queryParams).then(response => {
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
    clearSearch() {
      this.listQuery.page = 1
      this.$refs.listQuery.resetFields()
      this.newDate = new Date().getTime()
      this.getList()
    },
    handleFilter() {
      this.listQuery.page = 1
      this.newDate = new Date().getTime()
      this.getList()
    },
    //公共信息
    getall() {
      const optionsParams = ['allegroAdvtAccount', 'allegroAdvtTypes', 'allegroProductLine']
      apiGetSelectAll(optionsParams).then(res => {
        let { data } = res
        this.options = data
      })
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
.promColor {
  color: #409EFF;
}

</style>

