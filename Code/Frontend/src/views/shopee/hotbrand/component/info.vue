<!--
 * @Author: zhangzhengzhe
 * @Date: 2019-06-05 17:04:28
 * @LastEditors: zhangzhengzhe
 * @LastEditTime: 2019-06-11 13:53:28
 -->
<template>
  <div>
    <el-dialog
      :title="data.task_id ? '执行详情' : '获取热销产品信息'"
      :visible="true"
      v-if="open"
      :before-close="onClose"
      @closed="onClose"
      width="880px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="dialog-limit-height dialog-add-form"
      v-dragMove
    >
      <!-- 获取列表数据详情 -->
      <div class="content-box">
        <template v-if="data.task_id">
          <el-table :data="listData"
                    ref="table"
                    v-loading="listLoading"
                    :key="newDate"
                    element-loading-text="努力加载中"
                    border
                    style="width: 100%"
                    class="center-table-th"
          >
            <el-table-column prop="url" label="链接" show-overflow-tooltip></el-table-column>
            <el-table-column prop="status" label="状态" align="center" width="100">
              <template slot-scope="scope">
                <div v-if="scope.row.status">
                  <el-tag type="primary" size="small" v-if="scope.row.status === 10">正在执行</el-tag>
                  <el-tag type="danger" size="small" v-else-if="scope.row.status === 20">执行出错</el-tag>
                  <el-tag type="success" size="small" v-else-if="scope.row.status === 30">执行成功</el-tag>
                </div>
                <p v-else>/</p>
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
        </template>
        <template v-else>
          <el-form ref="form" :model="form" label-width="140px" :rules="rules" size="mini" @submit.native.prevent>
            <el-form-item label="热销品链接" prop="urls">
              <el-input type="textarea" :rows="24" placeholder="每行一个链接" resize="none" v-model="form.urls" style="width: 90%"></el-input>
            </el-form-item>
            <el-form-item><p style="color: red; font-size: 12px;">每行一个链接，最多可输入500个。</p></el-form-item>
          </el-form>
        </template>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="onCancel">取 消</el-button>
        <el-button size="mini" type="primary" v-if="data.task_id" @click="onSubmit('detail')">确 定</el-button>
        <el-button size="mini" type="primary" v-else @click="onSubmit('add')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import { addhotbrandInfo, queryHotbrandDetail } from '@/api/shopee'
  export default {
    name: 'Info',
    data() {
      const checkhotbrandUrl = (rule, value, callback) => {
        // const strRegex = '^((https|http|ftp|rtsp|mms)?://)' + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" + // ftp的user@
        // '(([0-9]{1,3}\.){3}[0-9]{1,3}' + // IP形式的URL- 199.194.52.184
        // '|' + // 允许IP和DOMAIN（域名）
        // "([0-9a-z_!~*'()-]+\.)*" + // 域名- www.
        // '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.' + // 二级域名
        // '[a-z]{2,6})' + // first level domain- .com or .museum
        // '(:[0-9]{1,4})?' + // 端口- :80
        // '((/?)|' + // a slash isn't required if there is no file name
        // "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$"
        const strRegex = '^((https|http|ftp|rtsp|mms)?://)'
        const reg = new RegExp(strRegex)
        const regs = /[,，]{2,}/g
        const strArr = this._.compact(value.replace(/\n/g, ',').split(','))
        if (strArr.length > 500) {
          callback(new Error('最多只能输入500个链接'))
        } else if (strArr.length === 0) {
          callback(new Error('链接不能为空'))
        } else {
          if (regs.test(value)) {
            callback(new Error('链接格式错误'))
          } else {
            const result = this._.every(strArr, val => reg.test(val))
            if (!result) {
              callback(new Error('链接格式错误'))
            }
          }
        }
        callback()
      }
      return {
        form: {
          urls: '',
          not_show_message: true
        },
        listQuery: {
          page: 1,
          per_page: 20,
          task_id: ''
        },
        pagination: null,
        rules: {
          urls: [
            { required: true, message: '链接不能为空', trigger: 'blur' },
            { validator: checkhotbrandUrl, trigger: 'blur' }
          ]
        },
        newDate: new Date().getTime(),
        listData: [],
        listLoading: false
      }
    },
    methods: {
      getDetail() {
        this.listLoading = true
        if (this.data.task_id) {
          this.listQuery.task_id = this.data.task_id
          queryHotbrandDetail(this.listQuery).then(res => {
            this.listData = res.data.list
            this.pagination = res.data.pagination
            this.listLoading = false
          }).catch(err => {
            console.log(err)
            this.listLoading = false
          })
        }
      },
      onClose() {
        if (this.data.task_id) {
          this.form.task_id = ''
        } else {
          this.form.urls = ''
        }
        this.listQuery.page = 1
        this.$emit('update:data', {})
        this.$emit('update:open', false)
      },
      onCancel() {
        if (this.data.task_id) {
          this.form.task_id = ''
        } else {
          this.form.urls = ''
        }
        this.listQuery.page = 1
        this.$emit('update:data', {})
        this.$emit('update:open', false)
      },
      onSubmit(type) {
        if (type === 'add') {
          this.$refs['form'].validate((valid) => {
            if (valid) {
              let urls = ''
              urls = this._.compact(this.form.urls.replace(/\s+|\r\n+/g, ',').split(',')).join(',')
              this.form.urls = urls
              addhotbrandInfo(this.form).then(res => {
                this.onClose()
                this.$emit('reload')
              }).catch(err => {
                console.log(err)
              })
            }
          })
        } else {
          this.getDetail()
          this.listQuery.page = 1
          this.$emit('update:data', {})
          this.$emit('update:open', false)
        }
      },
      handleSizeChange(val) {
        this.listQuery.page = 1
        this.listQuery.per_page = val
        this.getDetail()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.getDetail()
      }
    },
    props: {
      data: {
        require: true,
        type: Object,
        default: () => {}
      },
      open: {
        require: true,
        type: Boolean
      }
    },
    watch: {
      open(val) {
        if (val) {
          if (this.data.task_id) {
            this.getDetail()
          }
        }
      }
    }
  }
</script>
