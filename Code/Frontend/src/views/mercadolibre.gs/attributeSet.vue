<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="demo-form-inline" size="mini">
        <el-form-item label="目录 ID" prop="category_id">
          <el-input v-model="listQuery.category_id" clearable size="mini" placeholder="多个请用空格分隔"></el-input>
        </el-form-item>
        <el-form-item label="目录" prop="category_name">
          <el-input v-model="listQuery.category_name" clearable size="mini" placeholder="请输入分类目录"></el-input>
        </el-form-item>
        <el-form-item label="属性 ID" prop="attribute_id">
          <el-input v-model="listQuery.attribute_id" clearable size="mini" placeholder="多个请用空格分隔"></el-input>
        </el-form-item>
        <el-form-item label="属性名" prop="attribute_name">
          <el-input v-model="listQuery.attribute_name" clearable size="mini" placeholder="请输入属性名"></el-input>
        </el-form-item>
        <el-form-item label="属性值" prop="attribute_value">
          <el-input v-model="listQuery.attribute_value" clearable size="mini" placeholder="请输入属性值"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="value_type">
          <el-select v-model="listQuery.value_type" clearable placeholder="选择类型">
            <el-option label="number" value="number"></el-option>
            <el-option label="string" value="string"></el-option>
            <el-option label="boolean" value="boolean"></el-option>
            <el-option label="number_unit" value="number_unit"></el-option>
            <el-option label="list" value="list"></el-option>
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
        :max-height="maxHeight"
        border
        style="width: 100%"
      >
        <!--        ID、目录ID、目录、属性名、类型、属性值、操作-->
        <el-table-column prop="id" label="ID" width="120"></el-table-column>
        <el-table-column prop="category_id" label="目录 ID" width="120"></el-table-column>
        <el-table-column prop="category_full_name" label="目录"></el-table-column>
        <el-table-column prop="attribute_name" label="属性名" width="180"></el-table-column>
        <el-table-column prop="value_type" label="类型" width="120"></el-table-column>
        <el-table-column prop="attribute_value" label="属性值" width="120"></el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template v-slot="scope">
            <el-button type="text"
                       size="mini"
                       @click="setAttribute(scope.row)"
                       v-permission="permissions.attributeSet_setDefault"
            >
              配置属性值
            </el-button>
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
    <!--  配置弹窗  -->
    <attribute-config v-bind.sync="attrConfigDialog" @reload="getList"></attribute-config>
  </div>
</template>

<script>
import { attributeConfigList } from '@/api/mercadolibre.gs'
import attributeConfig from '@/views/mercadolibre.gs/attributeSet/attributeConfig'
import { filterQueryParams } from '@/utils'

export default {
  components: { attributeConfig },
  data() {
    return {
      maxHeight: document.documentElement.clientHeight - 250,
      newDate: new Date().getTime(),
      status: '状态 ',
      title: '类型 ',
      listData: [],
      listLoading: false,
      listQuery: {
        page: 1,
        per_page: 20,
        category_id: '',
        attribute_id: '',
        category_name: '',
        attribute_name: '',
        value_type: '',
        attribute_value: ''
      },
      listQueried: {}, // 请求完列表后存储请求状态，用于导出当前列表
      pagination: null,
      permissions: {
        attributeSet_setDefault: 'mercadolibre.category.attribute.set-default'//配置属性值
      },
      attrConfigDialog: {
        open: false,
        rowData: {}
      }
    }
  },
  created() {
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
          window.maxHeight = document.documentElement.clientHeight - 250
          that.maxHeight = window.maxHeight < 200 ? 200 : window.maxHeight
        })()
      }
    },
    setAttribute(row) {
      this.attrConfigDialog = {
        open: true,
        rowData: row
      }
    },
    getList() {
      this.listData = []
      this.listLoading = true
      this.listQuery.category_id = this.listQuery.category_id.trim()
      this.listQuery.attribute_id = this.listQuery.attribute_id.trim()
      this.listQuery.category_name = this.listQuery.category_name.trim()
      this.listQuery.attribute_name = this.listQuery.attribute_name.trim()
      this.listQuery.attribute_value = this.listQuery.attribute_value.trim()
      const queryParams = filterQueryParams(this.listQuery)
      attributeConfigList(queryParams).then(response => {
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
    clearSearch() {
      this.$refs.listQuery.resetFields()
      this.newDate = new Date().getTime()
      this.getList()
    },
    handleFilter() {
      this.listQuery.page = 1
      this.newDate = new Date().getTime()
      this.getList()
    }
  },
  watch: {
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
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.el-popover {
  max-height: 400px !important;
  overflow-y: auto !important;
}

</style>
