<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="Category name" prop="category_id">
          <el-input v-model="listQuery.category_id" clearable placeholder="请输入..." style="width: 180px;"></el-input>
        </el-form-item>
        <el-form-item label="Code Attribut" prop="attr_en_name">
          <el-input v-model="listQuery.attr_en_name" clearable placeholder="请输入..." style="width: 180px;"></el-input>
        </el-form-item>
        <el-form-item label="Libellé Attribut" prop="attr_fr_name">
          <el-input v-model="listQuery.attr_fr_name" clearable placeholder="请输入..." style="width: 180px;"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table :data="listData"
                ref="table"
                :key="newDate"
                v-loading.lock="listLoading"
                element-loading-text="努力加载中"
                border
                style="width: 100%"
                highlight-current-row
                @current-change="handleCurrentChange1"
      >
        <el-table-column prop="id" label="ID" min-width="50">
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="category_id" label="Category name" width="140"></el-table-column>
        <el-table-column prop="attr_en_name" label="Code Attribut" width="140"></el-table-column>
        <el-table-column prop="en_value" label="Code Valeur" align="center"></el-table-column>
        <el-table-column prop="attr_fr_name" label="Libellé Attribut" min-width="140"></el-table-column>
        <el-table-column prop="fr_value" label="Libellé Valeur"></el-table-column>
        <el-table-column prop="input_type" label="Type"></el-table-column>
        <el-table-column prop="is_mandatory" label="是否必填">
          <template slot-scope="scope">
            <span>{{ Number(scope.row.is_mandatory) === 1 ? '是' : '否' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="115" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openTheNewTAB(scope.row)" v-permission="permissions.properties_setDefault">配置属性值</el-button>
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
    <!--导入组件-->
    <list-dialog v-bind.sync="listDialogOptions" @renderList="renderList"></list-dialog>
    <text-dialog v-bind.sync="textDialogOptions" @renderList="renderList"></text-dialog>
  </div>
</template>

<script>
  import { filterQueryParams } from '@/utils/help'
  import { attrList } from '@/api/ruedu'
  import listDialog from './components/listDialog'
  import textDialog from './components/textDialog'

  export default {
    components: { listDialog, textDialog },
    data() {
      return {
        permissions:{
          properties_setDefault:"rueducommerce.advt.attr.edit",//配置属性值
        },//权限
        listData: [],
        filter: 'filter',
        newDate: new Date().getTime(),
        listLoading: false,
        currentRow: null,
        expand: false,
        pagination: null,
        listQuery: {
          page: 1,
          per_page: 20,
          category_id: undefined,
          attr_en_name: undefined,
          attr_fr_name: undefined,
          is_mandatory: undefined
        },
        listDialogOptions: {
          open: false,
          id: ''
        },
        textDialogOptions: {
          open: false,
          id: ''
        }
      }
    },
    created() {
      this.renderList()
    },
    mounted() {
    },
    methods: {
      renderList() {
        this.listData = []
        this.listLoading = true
        this.listQuery.category_id = this._.trim(this.listQuery.category_id)
        this.listQuery.attr_en_name = this._.trim(this.listQuery.attr_en_name)
        this.listQuery.is_mandatory = this._.trim(this.listQuery.is_mandatory)
        const queryParams = filterQueryParams(this.listQuery)
        attrList(queryParams).then(response => {
          this.listData = response.data.list
          this.pagination = response.data.pagination
          const table = this._.cloneDeep(this.listData)
          this.listData = []
          this.listData = table
          document.querySelector('.el-table__body-wrapper').scrollTop = 0
          this.listLoading = false
          this.$refs['table'].doLayout()
        }).catch(() => {
          this.listLoading = false
        })
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
      handleCurrentChange1(val) {
        this.currentRow = val
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.renderList()
      },
      handleExpand(column) {
        if (column.type === 'expand') {
          this.expand = !this.expand
          // 强制刷新DOM
          this.newDate = new Date().getTime()
        }
      },
      // 配置弹窗
      openTheNewTAB(row) {
        if (row.input_type === 'LIST') {
          this.listDialogOptions = {
            open: true,
            row: row
          }
        } else {
          this.textDialogOptions = {
            open: true,
            row: row
          }
        }
      }
    },
    filters: {},
    watch: {}
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
