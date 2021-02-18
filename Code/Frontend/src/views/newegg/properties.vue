<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="目录 ID" prop="category_id">
          <el-input size="mini" v-model="listQuery.category_id" clearable placeholder="请输入目录ID"></el-input>
        </el-form-item>
        <el-form-item label="目录名称" class="select-check" prop="category_name">
          <multiple-select-account v-bind.sync="multipleSelectCategoryOption" @select-account="selectCategory"></multiple-select-account>
        </el-form-item>
        <el-form-item label="属性名称" min-width="200" class="select-check" prop="name">
          <multiple-select-account v-bind.sync="multipleSelectAttributeOption" @select-account="selectAttribute"></multiple-select-account>
        </el-form-item>
        <el-form-item label="是否为分组" prop="is_group">
          <el-select v-model="listQuery.is_group" clearable placeholder="请选择">
            <el-option label="是" value="1"></el-option>
            <el-option label="否" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否为必填属性" prop="is_required">
          <el-select v-model="listQuery.is_required" clearable placeholder="请选择">
            <el-option label="是" value="1"></el-option>
            <el-option label="否" value="0"></el-option>
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
        <el-table-column prop="id" label="ID" sortable :sort-method="(a,b) => a-b" align="center"></el-table-column>
        <el-table-column prop="category_id" label="目录 ID" align="center"></el-table-column>
        <el-table-column prop="category_name" show-overflow-tooltip>
          <template slot="header" slot-scope="scope">
            <span v-if="scope" style="display:inline-block;text-align:center;width:100%;">目录名称</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" show-overflow-tooltip>
          <template slot="header" slot-scope="scope">
            <span v-if="scope" style="display:inline-block;text-align:center;width:100%;">属性名称</span>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="是否分组属性" align="center">
          <template slot-scope="scope">{{ Number(scope.row.is_group) === 1 ? '是' : '否' }}</template>
        </el-table-column>
        <el-table-column prop="create_time" label="是否必填属性" align="center">
          <template slot-scope="scope">{{ Number(scope.row.is_required) === 1 ? '是' : '否' }}</template>
        </el-table-column>
        <el-table-column prop="attribute_value" label="属性值" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="getProperitesDetails(scope.row)" v-permission="permissions.properties_setDefault" >配置属性值</el-button>
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
          :page-sizes="[20, 50, 100, 150, 200]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
    <!--添加计划弹窗dialog-->
    <add-form v-bind.sync="addPropertiesDialogOption" @current-attribute="getCurrentProperties" @reload="getList"></add-form>
  </div>
</template>

<script>
  import { getAttributeList, getSearchList } from '@/api/newegg'
  import addForm from './properties/addForm'
  import multipleSelectAccount from './properties/component/multipleSelectAccount'
  import { filterQueryParams } from '@/utils/help'

  export default {
    components: { addForm, multipleSelectAccount },
    data() {
      return {
        permissions:{
          properties_setDefault:"newegg.category.attribute-value.set-default",//配置属性值
        },//权限
        newDate: new Date().getTime(),
        maxHeight: document.documentElement.clientHeight - 200,
        addPropertiesDialogOption: {
          rowData: {},
          open: false
        },
        listData: [],
        listLoading: true,
        listQuery: {
          type: 'all',
          page: 1,
          per_page: 20,
          name: [],
          category_name: [],
          category_id: undefined,
          is_required: undefined,
          is_group: undefined
        },
        pagination: null,
        options: {},
        nowAccountArr: [],
        multipleSelectCategoryOption: {
          accountArr: [],
          name: 'name'
        },
        multipleSelectAttributeOption: {
          accountArr: [],
          name: 'name'
        }
      }
    },
    created() {
      this.searchInit()
      this.getList()
      this.maxHeight = this.maxHeight < 200 ? 200 : this.maxHeight
    },
    mounted() {
      this.resize()
    },
    methods: {
      resize() {
        const that = this
        window.onresize = () => {
          return (() => {
            window.maxHeight = document.documentElement.clientHeight - 200
            that.maxHeight = window.maxHeight < 200 ? 200 : window.maxHeight
          })()
        }
      },
      getList() {
        this.listData = []
        this.listLoading = true
        const queryParams = filterQueryParams(this.listQuery)
        getAttributeList(queryParams).then(response => {
          this.listLoading = false
          this.listData = response.data.list
          this.pagination = response.data.pagination
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
      getProperitesDetails(row) {
        this.addPropertiesDialogOption = {
          open: true,
          rowData: { id: row.id }
        }
      },
      selectCategory(arr) {
        this.listQuery.category_name = arr
      },
      selectAttribute(arr) {
        this.listQuery.name = arr
      },
      siteCategory() {
        this.listQuery.category_name = []
        this.multipleSelectCategoryOption.accountArr = this.options.category
      },
      siteAttribute() {
        this.listQuery.name = []
        this.multipleSelectAttributeOption.accountArr = this.options.attribute
      },
      clearSearch() {
        this.multipleSelectCategoryOption.accountArr = []
        this.multipleSelectAttributeOption.accountArr = []
        this.$refs.listQuery.resetFields()
        this.newDate = new Date().getTime()
        this.searchInit()
        this.getList()
      },
      getCurrentProperties(data) {
        if (data) {
          this._.forEach(this.listData, item => {
            if (data.attribute_id === item.id) {
              item.attribute_value = data.attribute_value
            }
          })
        }
      },
      handleFilter() {
        this.listQuery.page = 1
        this.newDate = new Date().getTime()
        this.getList()
      },
      // 根据输入的值，获取当前下拉框中显示的数组
      checkAccount(el) {
        const str = el.target.value
        if (this._.trim(str) === '') {
          this.nowAccountArr = this._.cloneDeep(this.accountArr)
        } else {
          this.nowAccountArr = this._.filter(this.accountArr, v => {
            return this._.includes(v.name.toLowerCase(), str.toLowerCase())
          })
        }
      },
      searchInit() {
        getSearchList().then(res => {
          this.options = this._.assign(this.options, res.data)
          this.siteCategory()
          this.siteAttribute()
        }).catch(() => { this.options = {} })
      }
    },
    watch: {
      maxHeight(val) {
        if (!this.timer) {
          this.maxHeight = val
          this.timer = true
          const that = this
          setTimeout(function() {
            that.timer = false
          }, 400)
        }
      }
    }
  }
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .el-popover {
    max-height: 400px !important;
    overflow-y: auto !important;
  }
  /* 多选样式 */
  .select-check {
    .el-tag {
      margin: 0 0 0 10px;
      span {
        display: inline;
      }
    }
  }
</style>
