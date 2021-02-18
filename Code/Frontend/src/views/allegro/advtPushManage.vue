<template>
  <div>
    <!-- 搜索 -->
    <div>
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
        <el-form-item label="操作时间" prop="create_time">
          <el-date-picker
            size="mini"
            v-model="listQuery.create_time"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <!--      -->
      <div class="header-box">
        <el-row class="right-row">
          <el-button type="primary" size="mini" icon="el-icon-circle-plus-outline" v-permission="permission.allegropAdd" @click="openAddform">添加广告排名推广</el-button>
        </el-row>
      </div>
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
        <el-table-column prop="id" label="ID" width="50" align="center"></el-table-column>
        <el-table-column prop="site_code" label="site code" width="100" align="center"></el-table-column>
        <el-table-column prop="data" label="SPU ID" min-width="220">
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
        <el-table-column prop="options" label="设置类型" width="240">
          <template slot-scope="scope">
            <div v-for="(item,index) in scope.row.options_list" :key="index">
              {{ item }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="操作时间" width="170" sort-by="create_time" align="center">
          <template slot-scope="scope">{{ scope.row.create_time }}</template>
        </el-table-column>
        <el-table-column prop="username" label="操作人" width="120" align="center"></el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openDetailsForm(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
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
    <!--  组件  -->
    <addForm v-bind.sync="product" @reload="handleFilter"></addForm>
    <detailsForm v-bind.sync="detailsForm"></detailsForm>
  </div>
</template>

<script>
import addForm from '@/views/allegro/advtPushManage/addForm'
import detailsForm from '@/views/allegro/advtPushManage/detailsForm'
import { apiGetSelectAll, getAdvtPromotionPlanList } from '@/api/allegro'
import { filterQueryParams } from '@/utils/help'

export default {
  mixins: [],
  filters: {},
  components: {
    addForm,
    detailsForm
  },
  props: {},
  data() {
    return {
      permission: {
        allegropAdd: 'allegro.advt.advt-promotion-plan.add'
      },
      newDate: new Date().getTime(),
      listLoading: false,
      options: [],
      listQuery: {
        account_id: undefined,//店铺
        spu_id: undefined,//产品号
        status: undefined,//设置类型
        create_time: undefined,//时间
        page: 1,
        per_page: 10
      },//请求参数
      pagination: undefined,//翻页
      listData: undefined,//表格数组
      product: {
        open: false
      },
      detailsForm: {
        open: false,
        trandata: {}
      }
    }
  },
  computed: {},
  watch: {},
  created() {
    this.getall()
    this.getList()
  },
  mounted() {
  },
  methods: {
    //制空搜索条件
    clearSearch() {
      this.listQuery.page=1
      this.listQuery.create_time=undefined//单独清除时间
      this.$refs.listQuery.resetFields()
      this.newDate = new Date().getTime()
      this.getList()
    },
    //搜索
    handleFilter() {
      this.listQuery.page = 1
      this.newDate = new Date().getTime()
      this.getList()
    },
    //列表请求
    getList() {
      this.listData = []
      this.listLoading = true
      const queryParams = filterQueryParams(this.listQuery)
      getAdvtPromotionPlanList(queryParams).then(response => {
        this.listData = response.data.list
        this.pagination = response.data.pagination
        document.querySelector('.el-table__body-wrapper').scrollTop = 0
      }).finally(() => {
        this.listLoading = false
      })
    },
    //翻页
    handleSizeChange(val) {
      this.listQuery.page = 1
      this.listQuery.per_page = val
      this.getList()
    },
    //切换翻页总条数
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    //公共信息
    getall() {
      const optionsParams = ['allegroAdvtAccount', 'allegroAdvtTypes', 'allegroProductLine']
      apiGetSelectAll(optionsParams).then(res => {
        let { data } = res
        this.options = data
      })
    },
    //打开新增组件
    openAddform() {
      this.product = {
        open: true
      }
    },
    //打开详情
    openDetailsForm(row) {
      this.detailsForm = {
        open: true,
        trandata: row.id
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped></style>
