<template>
  <div>
    <div class="header-box">
      <el-row class="right-row">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-circle-plus-outline"
          @click="onCreate"
          v-permission="permissions.add"
          v-debounce
        >
          添加权限
        </el-button>
      </el-row>
    </div>
    <div class="content-box">
      <el-table
        :data="treeData"
        border
        highlight-current-row
        row-key="id"
        class="permission-table"
      >
        <el-table-column
          prop="name"
          label="权限名称"
          min-width="300"
        />
        <el-table-column
          prop="id"
          label="ID"
          min-width="50"
        />
        <el-table-column
          prop="platform"
          label="平台"
          min-width="100"
        />
        <el-table-column
          prop="tag"
          label="Tag"
          min-width="250"
        />
        <el-table-column
          prop="action"
          label="Action"
          min-width="250"
        />
        <el-table-column
          prop="method"
          label="Method"
          align="center"
          min-width="80"
        />
        <el-table-column
          label="操作"
          align="center"
          min-width="120"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              @click="onEdit(scope.row)"
              v-permission="permissions.edit"
              v-debounce
            >
              编辑
            </el-button>
            <el-button
              size="mini"
              type="text"
              @click="onDelete(scope.row)"
              v-permission="permissions.delete"
              v-debounce
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <permission-form
      v-bind.sync="dialogOption"
      :tree-data="treeData"
      @reload="renderTreeList"
    />
  </div>
</template>

<script>
  import { fetchTreeList, deletePermission } from '@/api/permission'
  import permissionForm from './permission/form'

  export default {
    name: 'SystemPermission',
    components: { permissionForm },
    created() {
      this.renderTreeList()
    },
    data() {
      return {
        permissions: {
          add: 'manager.manager.permission.add',
          edit: 'manager.manager.permission.edit',
          delete: 'manager.manager.permission.delete'
        },
        dialogOption: {
          data: {},
          open: false
        },
        treeData: []
      }
    },
    methods: {
      renderTreeList() {
        fetchTreeList().then(response => {
          this.treeData = response.data.filter(item => item.platform !== 'collect').reverse()
        })
      },
      onCreate() {
        this.dialogOption = {
          open: true,
          data: {}
        }
      },
      onEdit(row) {
        this.dialogOption = {
          open: true,
          data: row
        }
      },
      onDelete(row) {
        this.$confirm('确认删除？', '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            closeOnClickModal: false,
            closeOnPressEscape: false
          }).then(() => {
          deletePermission({ id: row.id }).then(response => {
            this.renderTreeList()
          })
        }).catch(() => {
        })
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">
  .permission-table {
    .el-table__expand-icon {
      margin: 0 12px !important;
      & > {
        .el-icon {
          font-weight: 600;
          color: #409EFF;
          font-size: 16px;
          margin-top: -8px;
          margin-left: -8px;
          margin-right: 10px;
        }
      }
    }
  }
</style>
