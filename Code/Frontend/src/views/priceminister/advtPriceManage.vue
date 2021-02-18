<template>
  <!-- 新跟卖业务 -->
  <div style="width: 100%">
    <!--  搜索    -->
    <div class="header-box">
      <el-form ref="listQuery" :model="listQuery" size="mini" :inline="true" class="advt-form-inline">
        <el-form-item label="Site Code" prop="accountId">
          <el-select v-model="listQuery.accountId" placeholder="请选择" clearable multiple collapse-tags style="width: 240px;margin-left: 20px;">
            <el-option v-for="(item,index) in options.PmAdvtAccount"
                       :key="index"
                       :label="item.site_code"
                       :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Product ID" prop="advtProductIds">
          <el-input v-model="listQuery.advtProductIds" clearable placeholder="多个请用空格分隔" style="width: 150px"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="type">
          <el-select v-model="listQuery.type" clearable placeholder="请选择" style="width: 150px">
            <el-option label="启用" value="1"></el-option>
            <el-option label="禁用" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-debounce @click="ToSearch">搜索</el-button>
          <el-button data-type="clear" @click="toClearSearch">清空</el-button>
        </el-form-item>
      </el-form>
      <el-row class="right-row">
        <el-button type="primary" size="mini" @click="openTask" v-permission="permissions.advtPriceManage_followAdd">添加任务</el-button>
      </el-row>
    </div>
    <!--  列表  -->
    <div class="content-box">
      <el-table :data="ListData"
                border
                element-loading-text="努力加载中"
      >
        <el-table-column label="ID" prop="id" width="60" align="center"></el-table-column>
        <el-table-column label="Product ID" prop="istore_product_id" width="90"></el-table-column>
        <el-table-column label="Site code" prop="site_code" width="140"></el-table-column>
        <el-table-column label="产品图片" prop="image" width="70" align="center">
          <template slot-scope="scope">
            <PictureView
              v-if="scope.row.image"
              :pictureList="[scope.row.image]"
              :width="50"
              :height="50"
              :thumbnail="false"
              :defaultProps="defaultProps"
            >
            </PictureView>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="产品名称" prop="product_name"></el-table-column>
        <el-table-column label="竞品链接" prop="links">
          <template slot-scope="scope">
            <el-popover placement="left" width="680" trigger="hover">
              <p
                style="line-height: 24px; font-size: 12px; word-wrap: break-word; max-height: 400px; overflow-y: auto;"
                v-for="(item,index) in scope.row.links" :key="index"
              >
                链接{{ index + 1 }}：
                <a style="color:#409EFF" :href="item" target="_blank"> {{ item }}</a>
              </p>
              <div slot="reference">
                <p class="in-a-line" style="width: 100%; color: #E6A23C; margin: 0;"
                   v-for="(item,index) in scope.row.links" :key="index"
                >
                  {{ String(item) }}
                </p>
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="is_enable" width="60" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.is_enable===1?'success':'danger'" size="small">{{ scope.row.is_enable === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="添加人" prop="user_name" width="100" align="center"></el-table-column>
        <el-table-column label="添加时间" prop="create_time" width="150" align="center"></el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="Switchoperation(scope.row)" v-permission="permissions.advtPriceManage_followEnable">{{ scope.row.is_enable === 1 ? '禁用' : '启用' }}</el-button>
            <el-button type="text" size="mini" @click="ModifyTask(scope.row)" v-permission="permissions.advtPriceManage_followUpdate">编辑</el-button>
            <el-button type="text" size="mini" @click="showDetails(scope.row)">详情</el-button>
            <el-button type="text" size="mini" @click="openLog(scope.row)" v-permission="permissions.advtPriceManage_followLog">日志</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper" small
          @size-change="listSize"
          @current-change="listChange"
          :current-page="listQuery.page"
          :page-sizes="[10, 20, 50,100]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        >
        </el-pagination>
      </div>
    </div>
    <!--  组件  -->
    <istoreLog v-bind.sync="logOptions"></istoreLog>
    <task v-bind.sync="logTask" @renderList="ToSearch"></task>
    <taskeditor v-bind.sync="logEditor" @renderList="ToSearch"></taskeditor>
    <taskdetails v-bind.sync="logDetails"></taskdetails>
  </div>
</template>

<script>
import task from './advtPriceManage/task'
import taskdetails from './advtPriceManage/Taskdetails'
import taskeditor from './advtPriceManage/TaskEditor'
import istoreLog from './advtPriceManage/istoreLog'
import advertStatic from './advertising/common/static'
import { getSelectAll, followUpPriceMonitorList, createFollowEnable } from '@/api/priceminister'
import { filterQueryParams } from '@/utils/help'

export default {
  mixins: [],
  filters: {},
  components: {
    task, istoreLog, taskdetails, taskeditor
  },
  props: {},
  data() {
    return {
      permissions: advertStatic.permissions,//权限
      defaultProps: {
        originalKey: 'original',
        thumbnailKey: 'thumbnail'
      },//图片
      options: {},//搜索条件选择数据
      listQuery: {
        page: 1,
        per_page: 10,
        accountId: undefined,
        advtProductIds: undefined,
        type: undefined
      },//搜索条件
      ListData: [
        { ID: 1, Product_ID: 1 }
      ],//列表数据
      pagination: {},//分页数据
      logTask: {
        open: false
      },//添加
      logEditor: {
        open: false,
        advtData: {}
      },//编辑任务组件
      logDetails: {
        open: false,
        advtData: {}
      },//查看任务组件
      logOptions: {
        open: false,
        advtid: undefined
      }//日志组件
    }

  },
  computed: {},
  watch: {},
  created() {
    this.searchItem()
    this.getfollowList()
  },
  mounted() {
  },
  destroyed() {
  },
  methods: {
    //是否启用
    Switchoperation(row) {
      let obj = {
        is_enable: undefined,
        id: row.id
      }
      if (row.is_enable === 0) {
        obj.is_enable = 1
      } else {
        obj.is_enable = 0
      }
      const title = obj.is_enable === 1 ? '启用' : '禁用'
      this.$confirm(`是否确定${title}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        createFollowEnable(obj).then((res) => {
          this.getfollowList()
        })
      })
    },
    // 搜索中 sitecode,产品线,广告类型 optionArray获取
    searchItem() {
      getSelectAll().then(response => {
        this.options = response.data
      })
    },
    //搜索
    ToSearch() {
      this.listQuery.page = 1
      this.getfollowList()
    },
    //制空
    toClearSearch() {
      this.listQuery.page = 1
      this.$refs.listQuery.resetFields()
      this.getfollowList()
    },
    //获取列表
    getfollowList() {
      this.ListData = []
      this.listQuery.advtProductIds = this._.trim(this.listQuery.advtProductIds)
      const queryParams = filterQueryParams(this.listQuery)
      followUpPriceMonitorList(queryParams).then(res => {
        this.ListData = res.data.list
        this.pagination = res.data.pagination
      })
    },

    //添加任务弹窗
    openTask() {
      this.logTask = {
        open: true,
        advtData: ''
      }
    },
    //编辑任务弹窗
    ModifyTask(data) {
      let newlink = this._.map(data.links, (value) => {
        return { 'value': value }
      })
      let obj = {
        site_code: data.site_code,
        istore_product_id: data.istore_product_id,
        link: newlink,
        min_gross_margin: data.min_gross_margin,
        max_gross_margin: data.max_gross_margin,
        price_range: data.price_range,
        is_enable: data.is_enable,
        id: data.id
      }
      this.logEditor = {
        open: true,
        advtData: obj
      }
    },
    //查看任务弹窗
    showDetails(data) {
      this.logDetails = {
        open: true,
        advtData: data
      }
    },
    //日志弹窗
    openLog(row) {
      this.logOptions = {
        open: true,
        advtid: row.id
      }
    },
    //列表分页
    listSize(val) {
      this.listQuery.page = 1
      this.listQuery.per_page = val
      this.getfollowList()
    },
    listChange(val) {
      this.listQuery.page = val
      this.getfollowList()
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped></style>
