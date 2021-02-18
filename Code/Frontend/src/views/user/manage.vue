<template>
  <div>
    <div class="header-box">
      <el-form
        ref="listQuery"
        :inline="true"
        :model="listQuery"
        class="demo-form-inline"
        size="mini"
      >
        <!--页面title-->
        <!--<el-form-item label="用户管理"></el-form-item>-->
        <!--检索区域form-->
        <el-form-item
          label="账号"
          prop="username"
        >
          <el-input
            clearable
            v-model="listQuery.username"
            placeholder="账号"
          />
        </el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-select
            v-model="listQuery.status"
            clearable
            placeholder="选择状态"
          >
            <el-option
              label="启用"
              value="1"
            />
            <el-option
              label="禁用"
              value="0"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="角色"
          prop="role"
        >
          <el-input
            v-model="listQuery.role"
            clearable
            placeholder="请输入用户角色"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            v-debounce:listQuery="handleFilter"
          >
            搜索
          </el-button>
          <el-button
            data-type="clear"
            v-debounce:listQuery="clearSearch"
          >
            清空
          </el-button>
        </el-form-item>
      </el-form>
      <!--操作按钮组 -左侧-->
      <!--<el-row class="left-row">
        <el-button type="primary" size="mini" icon="el-icon-circle-plus-outline">按钮1</el-button>
        <el-button type="warning" size="mini" icon="el-icon-circle-plus-outline">按钮2</el-button>
      </el-row>-->
      <!--操作按钮组 -右侧-->
      <el-row class="right-row">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-circle-plus-outline"
          v-permission="permissions.add"
          @click="addUser"
        >
          添加用户
        </el-button>
      </el-row>
    </div>
    <!--内容区-->
    <div class="content-box">
      <el-table
        :key="newDate"
        ref="table"
        v-loading="listLoading"
        :data="tableData"
        @filter-change="handleFilterChange"
        border
        :max-height="maxHeight"
        style="width: 100%"
      >
        <el-table-column
          prop="id"
          label="ID"
          sortable
          :sort-method="(a,b) => a-b"
          width="80"
        />
        <el-table-column
          prop="username"
          label="账号"
          width="120"
        />
        <el-table-column
          prop="email"
          label="邮箱"
          width="200"
        />
        <el-table-column
          prop="name"
          label="姓名"
          width="140"
        />
        <el-table-column
          prop="mobile"
          label="手机"
          width="160"
        />
        <el-table-column
          prop="role"
          label="拥有角色"
          min-width="200"
        />
        <el-table-column
          prop="status"
          :render-header="renderHeader"
          column-key="status"
          width="100"
          :filters="[{ text: '启用', value: '1' }, { text: '禁用', value: '0' }]"
          :filter-method="filterStatus"
          filter-placement="bottom-start"
        >
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.status === '1' ? 'success' : 'info'"
              size="small"
              disable-transitions
            >
              {{ scope.row.status === '1' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="200"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="mini"
              v-permission="permissions.enable"
              @click="modifyStatus(scope.row)"
              v-debounce
              :disabled="userName === scope.row.name"
            >
              {{ scope.row.status === '1' ? '禁用' : '启用' }}
            </el-button>
            <el-button
              type="text"
              size="mini"
              v-permission="permissions.delete"
              @click="deleteUser(scope.row)"
              v-debounce
              :disabled="userName=== scope.row.name"
            >
              删除
            </el-button>
            <el-button
              type="text"
              size="mini"
              v-permission="permissions.edit"
              @click="editUserRoles(scope.row)"
              v-debounce
            >
              修改角色
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          small
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="listQuery.page"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="listQuery.per_page"
          :total="pagination ? pagination.total : 0"
        />
      </div>
    </div>
    <!--添加用户弹窗dialog-->
    <add-user-form
      v-bind.sync="addUserDialogOption"
      @reload="getList"
    />
    <!--修改角色弹窗dialog-->
    <edit-role-form
      v-bind.sync="editRoleDialogOption"
      @reload="getList"
    />
  </div>
</template>

<script>
  import {
    fetchList,
    delUserRequest,
    modifyStatusRequest
  } from '@/api/user'
  import editRoleForm from './manage/editRoleForm'
  import addUserForm from './manage/addUserForm'
  import { filterQueryParams } from '@/utils/help'

  export default {
    name: 'UserManage',
    components: { editRoleForm, addUserForm },
    data() {
      return {
        userName: this.$store.getters.userInfo.name,
        newDate: new Date().getTime(),
        filter: 'filter',
        status: '状态 ',
        maxHeight: document.documentElement.clientHeight - 200,
        permissions: {
          add: 'manager.manager.user.add',
          edit: 'manager.manager.user.edit',
          enable: 'manager.manager.user.enable',
          delete: 'manager.manager.user.delete'
        },
        editRoleDialogOption: {
          data: {},
          open: false
        },
        addUserDialogOption: {
          data: {},
          open: false
        },
        tableData: [],
        listLoading: true,
        listQuery: {
          page: 1,
          per_page: 10,
          role: undefined,
          username: undefined,
          status: undefined
        },
        pagination: null
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
          window.maxHeight = document.documentElement.clientHeight - 200
          that.maxHeight = window.maxHeight < 200 ? 200 : window.maxHeight
        })()
      }
    },
    methods: {
      getList() {
        this.listLoading = true
        this.listQuery.role = this._.trim(this.listQuery.role)
        this.listQuery.username = this._.trim(this.listQuery.username)
        const queryParams = filterQueryParams(this.listQuery)
        fetchList(queryParams).then(response => {
          this.listLoading = false
          this.tableData = response.data.list
          this.pagination = response.data.pagination
          document.querySelector('.el-table__body-wrapper').scrollTop = 0
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
      handleFilter() {
        this.listQuery.page = 1
        this.newDate = new Date().getTime()
        this.filter = 'filter'
        this.getList()
      },
      /* 状态修改-启用禁用 */
      modifyStatus(d) {
        const message = d.status === '1' ? '禁用' : '启用'
        this.$confirm('确认' + message + '此用户？', '提示',
                      {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        closeOnClickModal: false,
                        closeOnPressEscape: false,
                        type: 'warning'
                      }).then(_ => {
          const modifyStatusParams = {
            id: d.id,
            status: d.status === '1' ? '0' : '1'
          }
          modifyStatusRequest(modifyStatusParams).then(response => {
            this.getList()
          })
        }).catch(_ => {
        })
      },
      /* 用户删除 */
      deleteUser(d) {
        this.$confirm('删除后数据不可恢复，确定删除吗？', '提示',
                      {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        closeOnClickModal: false,
                        closeOnPressEscape: false,
                        type: 'warning'
                      }).then(_ => {
          delUserRequest({ id: d.id }).then(response => {
            this.getList()
          })
        }).catch(_ => {
        })
      },
      /* 添加用户 */
      addUser() {
        this.addUserDialogOption = {
          open: true,
          data: {}
        }
      },
      /* 用户角色编辑 */
      editUserRoles(d) {
        this.editRoleDialogOption = {
          open: true,
          data: d
        }
      },
      clearSearch() {
        this.$refs.listQuery.resetFields()
        this.newDate = new Date().getTime()
        this.filter = 'filter'
        this.getList()
      },
      //  用户状态筛选
      filterStatus(value, row) {
        return row.status === value
      },
      // 筛选图标
      renderHeader(h, { column, $index }) {
        return h('span', [
          h('span', this.status),
          h('svg-icon', { 'attrs': { 'icon-class': this.filter }})
        ])
      },
      // 筛选图标处理
      handleFilterChange(filters) {
        if (filters.status.length === 0) {
          this.filter = 'filter'
          document.querySelector(' .el-table th>.cell>span>svg').style.color = '#c0c4cc'
        } else {
          this.filter = 'filter-in'
          document.querySelector(' .el-table th>.cell.highlight>span>svg').style.color = '#f00'
        }
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
