<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="分类目录 ID" prop="category_id">
          <el-input v-model="listQuery.category_id" clearable size="mini" placeholder="多个请用空格分隔"></el-input>
        </el-form-item>
        <el-form-item label="分类目录" prop="category_name">
          <el-input v-model="listQuery.category_name" clearable size="mini" placeholder="请输入分类目录"></el-input>
        </el-form-item>
        <el-form-item label="属性 ID" prop="attribute_id">
          <el-input v-model="listQuery.attribute_id" clearable size="mini" placeholder="多个请用空格分隔"></el-input>
        </el-form-item>
        <el-form-item label="属性名" prop="attribute_name">
          <el-input v-model="listQuery.attribute_name" clearable size="mini" placeholder="请输入属性名"></el-input>
        </el-form-item>
        <el-form-item label="属性值 ID" prop="attribute_value_id">
          <el-input v-model="listQuery.attribute_value_id" clearable size="mini" placeholder="多个请用空格分隔"></el-input>
        </el-form-item>
        <el-form-item label="属性值" prop="attribute_value">
          <el-input v-model="listQuery.attribute_value" clearable size="mini" placeholder="请输入属性值"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="attribute_type">
          <el-select v-model="listQuery.attribute_type" clearable placeholder="选择类型">
            <el-option label="dictionary" value="dictionary"></el-option>
            <el-option label="float" value="float"></el-option>
            <el-option label="integer" value="integer"></el-option>
            <el-option label="string" value="string"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <!--<label class="title">计划列表</label>-->
      <el-row class="right-row">
        <el-button type="success" v-permission="permissions.import" size="mini" @click="importExcel">导入</el-button>
        <el-button type="primary" v-permission="permissions.export" size="mini" @click="exportExcel">导出</el-button>
      </el-row>
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
        <el-table-column prop="category_id" label="分类目录 ID" width="120" sortable :sort-method="(a,b) => a-b"></el-table-column>
        <el-table-column prop="category_full_name" label="分类目录" min-width="400"></el-table-column>
        <el-table-column prop="attribute_id" label="属性ID" width="100"></el-table-column>
        <el-table-column prop="attribute_name" label="属性名" width="120"></el-table-column>
        <el-table-column prop="attribute_type" label="类型" width="120"></el-table-column>
        <el-table-column prop="attribute_value_id" label="属性值ID" width="100"></el-table-column>
        <el-table-column prop="attribute_value" label="属性值" width="180">
          <template v-slot="scope">
            <div v-if="scope.row.isEdit">
              <el-select v-if="scope.row.attribute_type === 'dictionary'" v-model="scope.row.clone_attribute_value" size="mini" placeholder="选择类型">
                <el-option v-for="item in scope.row.dictionary" :key="item.id" :label="item.value" :value="item.id"></el-option>
              </el-select>
              <el-input size="mini" v-else v-model="scope.row.clone_attribute_value"></el-input>
            </div>
            <span v-else>{{ scope.row.attribute_value }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template v-slot="scope">
            <el-button v-if="!scope.row.isEdit" v-permission="permissions.edit" type="text" size="mini" @click="handelRowEdit(scope.row)">修改</el-button>
            <div v-else>
              <el-button type="text" size="mini" @click="handleRowSave(scope.row)">保存</el-button>
              <el-button type="text" size="mini" @click="handleRowCancel(scope.row)">取消</el-button>
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
          :page-sizes="[20, 50, 100, 200]"
          :page-size="listQuery.per_page"
          :total="pagination ? Number(pagination.total) : 0"
        >
        </el-pagination>
      </div>
    </div>
    <import-advt v-bind.sync="importOption" @emit-render-list="clearSearch"></import-advt>
  </div>
</template>

<script>
  import { apiEditAttribute, apiExportAttribute, apiGetAttributeList } from '@/api/allegro'
  import { exportLongTile } from '@/utils/export/allegro'
  // import addForm from './plan/addForm'
  // import detailsForm from './plan/detailsForm'
  import importAdvt from './attributeSet/importAdvt'

  export default {
    components: { importAdvt },
    data() {
      return {
        newDate: new Date().getTime(),
        status: '状态 ',
        title: '类型 ',
        maxHeight: document.documentElement.clientHeight - 300,
        listData: [],
        listLoading: true,
        listQuery: {
          page: 1,
          per_page: 20,
          category_id: undefined,
          attribute_id: undefined,
          category_name: undefined,
          attribute_name: undefined,
          attribute_type: undefined,
          attribute_value_id: undefined,
          attribute_value: undefined
        },
        listQueried: {}, // 请求完列表后存储请求状态，用于导出当前列表
        pagination: null,
        importOption: {
          open: false,
          advtStatus: ''
        },
        permissions: {
          export: 'allegro.advt.default-attribute.export',//导出
          import: 'allegro.advt.default-attribute.import',//导入
          edit: 'allegro.advt.default-attribute.edit'//编辑
        }
      }
    },
    created() {
      this.getList()
      this.maxHeight = this.maxHeight < 200 ? 200 : this.maxHeight
    },
    mounted() {
      const that = this
      window.onresize = () => {
        return (() => {
          window.maxHeight = document.documentElement.clientHeight - 300
          that.maxHeight = window.maxHeight < 200 ? 200 : window.maxHeight
        })()
      }
      this.listQueried = this._.cloneDeep(this.listQuery)
    },
    methods: {
      cloneDeep(form) {
        const list = this._.cloneDeep(this[form])
        this[form] = []
        this[form] = list
      },
      getList() {
        this.listData = []
        this.listLoading = true
        const queryParams = this._.cloneDeep(this.listQuery)
        apiGetAttributeList(queryParams).then(response => {
          this.listLoading = false
          this.listData = response.data.list
          this.pagination = response.data.pagination
          this._.forEach(this.listData, v => {
            v.clone_attribute_value = v.attribute_type === 'dictionary' ? v.attribute_value_id : v.attribute_value
            v.isEdit = false
          })
          this.cloneDeep('listData')
          this.listQueried = this._.cloneDeep(this.listQuery)
          document.querySelector('.el-table__body-wrapper').scrollTop = 0
        }).catch(() => {
          this.listLoading = false
        })
      },
      handelRowEdit(row) {
        row.isEdit = true
      },
      handleRowSave(row) {
        const data = {
          category_id: row.category_id,
          attribute_id: row.attribute_id
        }
        if (row.attribute_type === 'dictionary') {
          data.attribute_value_id = row.clone_attribute_value
        } else {
          data.attribute_value = row.clone_attribute_value
        }
        this.listLoading = true
        apiEditAttribute(data).then(res => {
          this.getList()
        }).catch(() => {
          this.listLoading = false
        })
      },
      handleRowCancel(row) {
        if (row.attribute_type === 'dictionary') {
          row.clone_attribute_value = row.attribute_value_id
        } else {
          row.clone_attribute_value = row.attribute_value
        }
        row.isEdit = false
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
      addPlan() {
        this.addPlanDialogOption = {
          open: true,
          data: {}
        }
      },
      getPlanDetails(data) {
        this.detailsPlanDialogOption = {
          open: true,
          data: data
        }
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
      importExcel() {
        this.importOption = {
          open: true
        }
      },
      exportExcel(row) {
        if (this.listData.length === 0) {
          this.$message({
            message: '没有可导出的数据',
            type: 'warning'
          })
          return false
        }
        const data = {
          category_id: this.listQueried.category_id,
          attribute_id: this.listQueried.attribute_id,
          category_name: this.listQueried.category_name,
          attribute_value: this.listQueried.attribute_value
        }
        this.$message({
          message: '正在导出请耐心等待',
          type: 'info'
        })
        apiExportAttribute(data).then(response => {
          if (response.data.length === 0) {
            this.$message({
              message: '数据异常请重新导出',
              type: 'warning'
            })
          } else {
            this.execExport(response.data.list)
          }
        })
      },
      execExport(exportData) {
        exportLongTile(exportData)
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
</style>
