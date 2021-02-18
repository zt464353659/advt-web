<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="站点" prop="site_code">
          <el-select v-model="listQuery.site_code" clearable placeholder="请选择站点">
            <el-option v-for="(item, index) of sites" :key="index" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <!--<el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>-->
        </el-form-item>
      </el-form>
      <el-row class="right-row">
        <el-button type="primary" size="mini" @click="downLoadExcel">下载模板</el-button>
        <el-button type="primary" size="mini" @click="importProhibitedCatalogue">导入禁售目录</el-button>
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
        <el-table-column label="站点" prop="site_code"></el-table-column>
        <el-table-column label="shopee目录ID" prop="category_id"></el-table-column>
        <el-table-column label="一级目录" prop="one_level_name"></el-table-column>
        <el-table-column label="二级目录" prop="two_level_name"></el-table-column>
        <el-table-column label="三级目录" prop="three_level_name"></el-table-column>
        <el-table-column label="LWE是否可运" prop="is_lwe">
          <template slot-scope="scope">
            {{ scope.row.is_lwe === '1' ? '是' : '否' }}
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
    <!--导入禁售目录excel-->
    <import-catalogue v-bind.sync="importDialog" @reload="getList"></import-catalogue>
  </div>
</template>

<script>
  import { exportTemplate } from './export'
  import { getProhibitedCatalogue, getSelectAll } from '@/api/shopee'
  import importCatalogue from './prohibitedCatalogue/importCatalogue'

  export default {
    name: 'ProhibitedCatalogue',
    components: { importCatalogue },
    data() {
      return {
        newDate: new Date().getTime(),
        status: '状态 ',
        title: '类型 ',
        listData: [],
        listLoading: false,
        listQuery: {
          site_code: 'id',
          page: 1,
          per_page: 10
        },
        sites: [],
        pagination: null,
        importDialog: {
          options: '',
          open: false
        }
      }
    },
    created() {
      this.searchInit()
      this.getList()
    },
    methods: {
      searchInit() {
        const optionsParams = ['shopeeAdvtAccount', 'shopeeAdvtTypes', 'shopeeProductLine', 'shopeeAdvtShopAccount']
        getSelectAll(optionsParams).then(response => {
          this.sites = response.data.shopeeAdvtShopAccount.map(item => item.label)
        })
      },
      getList() {
        this.listData = []
        this.listLoading = true
        // const obj = this._.cloneDeep(this.listQuery)
        // if (!obj.site_code) {
        //   obj.site_code = 'id'
        // }
        getProhibitedCatalogue(this.listQuery).then(response => {
          this.listLoading = false
          this.listData = response.data.list
          this.pagination = response.data.pagination
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
      clearSearch() {
        this.$refs.listQuery.resetFields()
        this.newDate = new Date().getTime()
        this.getList()
      },
      handleFilter() {
        this.listQuery.page = 1
        this.newDate = new Date().getTime()
        this.getList()
      },
      // 下载模板
      downLoadExcel() {
        exportTemplate()
      },
      // 导入弹窗
      importProhibitedCatalogue() {
        this.importDialog = {
          open: true,
          sites: this.sites
        }
      }
    }
  }
</script>
