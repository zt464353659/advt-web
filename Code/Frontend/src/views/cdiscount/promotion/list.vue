<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box" ref="headerBox">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="活动名称" prop="sale_name">
          <el-input v-model="listQuery.sale_name" clearable placeholder="请输入" style="width: 150px;"></el-input>
        </el-form-item>
        <el-form-item label="账号" prop="account_id">
          <el-select v-model="listQuery.account_id" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="item in options" :key="item.id" :label="item.site_code" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="促销类型" prop="type">
          <el-select v-model="listQuery.type" clearable placeholder="请选择" style="width: 150px;">
            <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品ID" prop="product_id">
          <el-input v-model="listQuery.product_id" clearable placeholder="请输入" style="width: 150px;"></el-input>
        </el-form-item>
        <!--        <el-form-item label="活动开始时间" prop="start_time">-->
        <!--          <el-date-picker-->
        <!--            v-model="listQuery.start_time"-->
        <!--            type="date"-->
        <!--            value-format="yyyy-MM-dd HH:mm:ss"-->
        <!--            style="width: 150px;"-->
        <!--            placeholder="选择开始日期"-->
        <!--          >-->
        <!--          </el-date-picker>-->

        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 状态 -->
    <div class="header-box" style="position: relative;">
      <el-row class="right-row">
        <el-button v-permission="permissions.addPromo" v-debounce type="primary" size="mini" @click="addPromotion" >
          添加促销活动
        </el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table ref="listTable"
                :key="newDate"
                :data="listData"
                v-loading="listLoading"
                border
                style="width: 100%"
      >
        <el-table-column prop="id" label="序号" width="70" sortable></el-table-column>
        <el-table-column prop="sale_name" label="活动名称"></el-table-column>
        <el-table-column prop="site_code" label="账号" width="120"></el-table-column>
        <el-table-column prop="type" width="90" label="促销类型">
          <template slot-scope="scope">
            {{ scope.row.type === 1 ? '限时促销' : '促销季' }}
          </template>
        </el-table-column>
        <el-table-column prop="number" label="广告数" width="80"></el-table-column>
        <el-table-column prop="end_time" label="活动结束时间" width="150">
        </el-table-column>
        <el-table-column prop="create_time" label="添加时间" width="150">
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" v-debounce @click="openTheNewTAB('cdiscount.promotion.detail', { salename: scope.row.sale_name, saleId: scope.row.id, status: scope.row.status, time: scope.row.end_time })">广告</el-button>
            <el-button v-permission="permissions.deletePromo" v-if="scope.row.number === 0" type="text" v-debounce size="mini" @click="deletePromotion(scope.row)">删除</el-button>
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
          :page-sizes="[10, 20, 50, 100]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
    <!--添加广告活动弹窗-->
    <add-promotion v-bind.sync="addPromotionData" @reload="Listupdate"></add-promotion>
  </div>
</template>

<script>
  import { filterQueryParams } from '@/utils/help'
  import { fetchPromoList, delPromo, getSelectAll } from '@/api/cdiscount'

  import addPromotion from './list/addPromotion'

  export default {
    components: { addPromotion },
    data() {
      return {
        listQuery: {
          page: 1,
          per_page: 10,
          account_id: undefined,
          product_id: undefined,
          sale_name: undefined,
          type: undefined,
          status: undefined,
          start_time: undefined,
          end_time: undefined
        },
        permissions: {
          // 删除活动
          deletePromo: 'cdiscount.advt.sale.del-sale',
          // 添加活动
          addPromo: 'cdiscount.advt.sale.add-sale'
        },
        statusList: [{
          value: '0',
          label: '未开始'
        }, {
          value: '1',
          label: '设置中'
        }, {
          value: '2',
          label: '设置失败'
        }, {
          value: '3',
          label: '活动中'
        }, {
          value: '4',
          label: '已结束'
        }],
        typeList: [{
          value: '1',
          label: '限时促销'
        }, {
          value: '2',
          label: '促销季'
        }],
        options: [],
        listLoading: false,
        newDate: new Date().getTime(),
        listData: [],
        expand: true,
        pagination: null,
        // 添加促销活动
        addPromotionData: {
          open: false,
          selectAll: []
        }
      }
    },
    created() {
      this.renderList()
      this.searchInit()
    },
    mounted() {
    },
    methods: {
      //添加广告活动弹窗,关闭后表格重载第一页
      Listupdate() {
        this.listQuery.page = 1
        this.renderList()
      },
      // 获取账号信息
      searchInit() {
        const selectAll = ['esAdvtAccount']
        getSelectAll(selectAll).then(response => {
          this.options = response.data.esAdvtAccount
        })
      },
      /* 跳转新标签 */
      openTheNewTAB(name, params) {
        const { href } = this.$router.resolve({
          name: name,
          params: params || {}
        })
        window.open(href, '_blank')
      },
      renderList() {
        this.listLoading = true
        this.expand = true
        this.listData = null
        const queryParams = filterQueryParams(this.listQuery)
        fetchPromoList(queryParams).then(response => {
          this.listData = response.data.list
          this.pagination = response.data.pagination
          const table = this._.cloneDeep(this.listData)
          this.listData = []
          this.listData = table
          this.listLoading = false
          this.$refs['table'].doLayout()
        }).catch(() => {
          this.listLoading = false
        })
      },
      // 添加促销活动
      addPromotion() {
        this.addPromotionData = {
          open: true,
          selectAll: this.options
        }
      },
      // 删除促销活动
      deletePromotion(row) {
        const obj = {
          saleId: row.id
        }
        this.$confirm('删除后数据不可恢复，确定删除吗？', '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            closeOnClickModal: false,
            closeOnPressEscape: false,
            type: 'warning'
          }).then(() => {
          delPromo(obj).then(() => {
            this.renderList()
          })
        }).catch(() => {})
      },
      handleFilter() {
        this.newDate = new Date().getTime()
        this.filter = 'filter'
        this.listQuery.page = 1
        this.renderList()
      },
      clearSearch() {
        this.$refs.listQuery.resetFields()
        this.newDate = new Date().getTime()
        this.filter = 'filter'
        this.renderList()
      },
      handleSizeChange(val) {
        this.listQuery.page = 1
        this.listQuery.per_page = val
        this.renderList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.renderList()
      }
    },
    filters: {},
    watch: {}
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
