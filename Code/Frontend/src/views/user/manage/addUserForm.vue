<template>
  <el-dialog
    title="添加用户"
    class="dialog-add-user"
    :visible="open"
    :before-close="onClose"
    width="800px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    v-dragMove
  >
    <el-form
      :inline="true"
      :model="listQuery"
      size="small"
      @submit.native.prevent
    >
      <el-form-item
        label="输入账号检索"
        :label-width="'200px'"
      >
        <el-autocomplete
          v-model="listQuery.key"
          :fetch-suggestions="querySearchAsync"
          placeholder="请输入账号自动检索，最少输入两个字符开始检索"
          @select="handleSelect"
          :trigger-on-focus="false"
        />
      </el-form-item>
    </el-form>
    <el-table
      :data="searchTableData"
      border
      size="small"
      style="width: 100%"
    >
      <el-table-column
        prop="login_id"
        label="账号"
        width="100"
      />
      <el-table-column
        prop="name"
        label="姓名"
        width="280"
      />
      <el-table-column
        prop="name_en"
        label="英文名"
        width=""
      />
      <el-table-column
        prop="mobile_phone"
        label="手机"
        width=""
      />
      <el-table-column
        prop="email"
        label="邮箱"
        width="160"
      />
    </el-table>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button @click="onCancel">
        取 消
      </el-button>
      <el-button
        type="primary"
        @click="addUser"
        v-debounce
      >
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { searchUserRequest, searchUserInfoRequest, addUserRequest } from '@/api/user'

  export default {
    data() {
      return {
        isNewRecord: true,
        listQuery: {
          key: undefined
        },
        searchTableData: [],
        form: {
          id: null,
          name: null,
          status: null
        },
        options: [],
        searchNameLen: '2'
      }
    },
    props: {
      data: {
        type: Object,
        required: true
      },
      open: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      /* 添加用户弹窗确定按钮的回调事件 */
      addUser() {
        if (this.searchTableData.length === 0) {
          this.$message.error('无法添加空用户！')
          return
        }
        this.$confirm('确认添加此用户吗？')
          .then(_ => {
            addUserRequest(this.searchTableData[0]).then(response => {
              this.searchTableData = []
              this.listQuery.key = ''
              this.$emit('update:open', false)
              this.$emit('reload')
            })
          })
          .catch(_ => {
          })
      },
      /* 查询用户 */
      loadAccountData(str, callback) {
        const searchUserParams = this.listQuery.key
        searchUserRequest(searchUserParams).then(response => {
          const r = response.data
          let results = str ? r.filter(this.createFilter(str)) : r
          if (results.length === 0) {
            results = [{ value: '查询不到此用户，请检查输入是否正确' }]
          }
          callback(results)
          this.emptySearchTableData()
        })
      },
      /* 验证用户输入 */
      querySearchAsync(str, callback) {
        if (str.length < this.searchNameLen) {
          const msg = [{ value: '请最少输入2个字符检索' }]
          callback(msg)
          return
        }
        this.loadAccountData(str, callback)
      },
      createFilter(str) {
        return (r) => {
          return (r.value.toLowerCase().indexOf(str.toLowerCase()) === 0)
        }
      },
      handleSelect() {
        const searchUserParams = this.listQuery.key
        searchUserInfoRequest(searchUserParams).then(response => {
          this.searchTableData = response.data
        })
      },
      onCancel() {
        this.listQuery.key = ''
        this.emptySearchTableData()
        this.$emit('update:open', false)
      },
      onClose() {
        this.listQuery.key = ''
        this.emptySearchTableData()
        this.$emit('update:open', false)
      },
      emptySearchTableData() {
        this.searchTableData = []
      }
    }
  }
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
    .dialog-add-user .el-autocomplete {
        width: 400px;
    }
</style>
