<!--
 * @Author: zhangzhengzhe
 * @Date: 2019-06-05 11:47:04
 * @LastEditors: zhangzhengzhe
 * @LastEditTime: 2019-06-11 16:59:10
 -->
<template>
  <div>
    <!-- 搜索 -->
    <div class="header-box">
      <el-form ref="listQuery" :inline="true" :model="listQuery" class="advt-form-inline" size="mini">
        <el-form-item label="状态" prop="status">
          <el-select v-model="listQuery.status" clearable placeholder="Select" style="width:120px">
            <el-option v-for="item in options" :key="item.id" :label="item.label" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="btn-form-item">
          <el-button type="primary" v-debounce:listQuery="handleFilter">搜索</el-button>
          <el-button data-type="clear" v-debounce:listQuery="clearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <el-row class="right-row">
        <el-button type="primary" size="mini" @click="getHotbrandInfo">获取信息</el-button>
      </el-row>
    </div>
    <!-- 列表 -->
    <div class="content-box">
      <el-table :data="listData"
                ref="table"
                v-loading="listLoading"
                :key="newDate"
                element-loading-text="努力加载中"
                border
                style="width: 100%"
                class="center-table-th"
      >
        <el-table-column prop="id" label="ID" align="center"></el-table-column>
        <el-table-column prop="num" label="数量" align="center"></el-table-column>
        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.status">
              <el-tag type="primary" size="small" v-if="scope.row.status === 10">正在执行</el-tag>
              <el-tag type="danger" size="small" v-else-if="scope.row.status === 20">执行出错</el-tag>
              <el-tag type="success" size="small" v-else-if="scope.row.status === 30">执行成功</el-tag>
            </div>
            <p v-else>/</p>
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="操作人员" align="center"></el-table-column>
        <el-table-column prop="update_time" label="操作时间" align="center">
          <template slot-scope="scope" v-if="parseInt(scope.row.update_time) > 0">{{ parseInt(scope.row.update_time) | moment('YYYY-MM-DD HH:mm') }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="handelDetail(scope.row)">详情</el-button>
            <el-button type="text" v-if="scope.row.status !== 10" size="mini" @click="downloadThisData(scope.row)">下载</el-button>
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
    <dialog-info v-bind.sync="dialoghotbrandOption" @reload="renderList"></dialog-info>
  </div>
</template>
<script>
  import { getHotbrandList, downloadhotbrand } from '@/api/shopee'
  import { filterQueryParams } from '@/utils/help'
  import dialogInfo from './component/info.vue'
  import { exportFormatHotbrand } from '@/views/shopee/export'
  export default {
    name: 'Hotbrand',
    components: { dialogInfo },
    data() {
      return {
        newDate: new Date().getTime(),
        listData: [],
        listLoading: false,
        listQuery: {
          status: undefined,
          page: 1,
          per_page: 20
        },
        pagination: null,
        options: [{
          id: 10,
          label: '正在执行'
        }, {
          id: 30,
          label: '执行成功'
        }, {
          id: 20,
          label: '执行出错'
        }],
        hotbrandInfo: {},
        dialoghotbrandOption: {
          data: {},
          open: false
        }
      }
    },
    created() {
      this.renderList()
    },
    methods: {
      getHotbrandInfo() {
        this.dialoghotbrandOption = {
          data: {},
          open: true
        }
      },
      clearSearch() {
        this.$refs.listQuery.resetFields()
        this.newDate = new Date().getTime()
        this.filter = 'filter'
        this.renderList()
      },
      /* 搜索 */
      handleFilter() {
        this.renderList()
      },
      renderList() {
        this.listLoading = true
        const query = filterQueryParams(this.listQuery)
        getHotbrandList(query).then(res => {
          // status == 30 成功 20 失败 10 执行中
          this.listLoading = false
          this.listData = res.data.list
          this.pagination = res.data.pagination
        }).catch(err => {
          console.log(err)
          this.listLoading = false
        })
      },
      handleSizeChange(val) {
        this.listQuery.page = 1
        this.listQuery.per_page = val
        this.renderList()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.renderList()
      },
      /* 查看当前列详情 */
      handelDetail(params) {
        this.dialoghotbrandOption = {
          data: {
            task_id: params.id
          },
          open: true
        }
      },
      /* 下载当前数据，并导出Excel */
      downloadThisData(params) {
        const query = {
          task_id: params.id
        }
        downloadhotbrand(query).then(res => {
          if (res.data.length === 0) {
            this.$message({
              message: '数据异常请重新导出',
              type: 'warning'
            })
          } else {
            this.$message({
              message: '正在导出请耐心等待',
              type: 'info'
            })
            let result = []
            result = this.queryParams(res.data)
            exportFormatHotbrand(result)
          }
        }).catch(err => {
          console.log(err)
        })
      },
      /* 序列化数据 */
      queryParams(params) {
        let category = ''
        const resultObj = {
          success: [],
          fail: []
        }
        const result = []
        const count = 100000
        this._.forEach(params, (resdata, index) => {
          this._.forEach(resdata, val => {
            category = ''
            if (val.item !== null) {
              let price = ''
              if (val.item.models && val.item.models.length > 0) {
                if (val.item.price_min === val.item.price_max) {
                  price = val.item.price_min / count
                } else {
                  price = (val.item.price_min / count) + '-' + (val.item.price_max / count)
                }
              } else {
                price = val.item.price / count
              }
              this._.forEach(val.item.categories, cat => {
                if (cat.display_name) { category += cat.display_name + '>' }
              })
              resultObj[index].push({
                url: val.url,
                name: val.item.name,
                site: val.item.site,
                price: price.toString(),
                categories: category.slice(0, -1),
                image: val.item.image
              })
            } else {
              resultObj[index].push({
                url: val.url,
                name: '',
                site: '',
                price: '',
                categories: '',
                image: ''
              })
            }
          })
        })
        for (const item in resultObj) {
          const obj = {
            sheetData: resultObj[item],
            sheetName: item
          }
          result.push(obj)
        }
        return result
      }
    }
  }
</script>
<style rel="stylesheet/scss" lang="scss" scoped>

</style>
