<template>
  <el-dialog
    title="授权"
    :visible="open"
    :before-close="onClose"
    width="680px"
    v-loading="listLoading"
    class="dialog-accredit"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    v-dragMove
  >
    <div class="tree-container">
      <el-tree
        :check-on-click-node="true"
        :expand-on-click-node="false"
        ref="tree"
        :data="treeData"
        :props="defaultProps"
        default-expand-all
        node-key="id"
        show-checkbox
        @check="handleNodeClick"
      />
    </div>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button @click="onCancel">取 消</el-button>
      <el-button
        type="primary"
        @click="onSubmit"
        v-debounce
      >确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { transformTreeToList } from '@/utils/help'
  import { fetchPerList, updatePermission } from '@/api/role'

  export default {
    name: 'RoleAccredit',
    data() {
      return {
        form: {},
        treeData: [],
        defaultProps: {
          children: 'children',
          label: 'name'
        },
        accredit: {},
        listLoading: true
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
    watch: {
      data(newVal) {
        if (!this._.isEmpty(newVal)) {
          this.listLoading = true
          fetchPerList({
            type: 'role',
            roleid: newVal.id
          }).then(response => {
            this.listLoading = false
            const treeData = response.data.reverse()
            const accredit = {}
            treeData.forEach(firstItem => {
              firstItem.children.forEach(secondItem => {
                if (secondItem.children && secondItem.children.length > 0) {
                  let primary_code = 0
                  const assistant_code = []
                  secondItem.children.forEach((item, index) => {
                    item.parentTag = secondItem.tag
                    if (item.action === '') {
                      primary_code = item.id
                      if (index > 0) {
                        const limit = secondItem.children.splice(index, 1)
                        secondItem.children.unshift(limit[0])
                      }
                    } else {
                      assistant_code.push(item.id)
                    }
                  })
                  accredit[secondItem.tag] = {
                    primary: primary_code,
                    assistant: assistant_code
                  }
                }
              })
            })
            this.accredit = accredit
            this.treeData = treeData
            const permissions = transformTreeToList(response.data)
            this.checkedPermission(permissions)
          })
        }
      }
    },
    methods: {
      checkedPermission(permissions) {
        const enablePermissions = this._.filter(permissions, { 'enable': true })
        const enableIds = this._.map(enablePermissions, 'id')
        const parentIds = this._.map(enablePermissions, 'pid')
        const checkedIds = this._.difference(enableIds, parentIds)
        this.$refs.tree.setCheckedKeys(checkedIds, true)
      },
      onSubmit() {
        const checkedKeys = this.$refs.tree.getCheckedKeys()
        const halfCheckedKeys = this.$refs.tree.getHalfCheckedKeys()
        const permissionIds = this._.concat(checkedKeys, halfCheckedKeys)
        updatePermission({
          permissionIds: permissionIds,
          roleId: this.data.id
        }).then(response => {
          this.clear()
        })
      },
      onCancel() {
        this.clear()
      },
      onClose() {
        this.clear()
      },
      clear() {
        this.$emit('update:open', false)
        this.$emit('update:data', {})
        this.treeData = []
      },
      handleNodeClick(data, node) {
        const arrList = this.$refs.tree.getCheckedKeys()
        // 三级权限中主权限取消,其他权限跟随取消
        if (this.accredit[data.parentTag] && data.id === this.accredit[data.parentTag].primary && arrList.indexOf(data.id) === -1) {
          this.accredit[data.parentTag].assistant.forEach(id => {
            arrList.splice(arrList.indexOf(id), 1)
          })
          this.$refs.tree.setCheckedKeys(arrList)
        }
        // 三级权限中，副权限选择时，主权限必须被选择
        if (this.accredit[data.parentTag] && this.accredit[data.parentTag].assistant.indexOf(data.id) > -1 && arrList.indexOf(this.accredit[data.parentTag].primary) === -1) {
          arrList.splice(arrList.indexOf(data.id), 0, this.accredit[data.parentTag].primary)
          this.$refs.tree.setCheckedKeys(arrList)
        }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">
  @mixin node-is-expanded {
    .el-tree-node.is-expanded {
      & > {
        .el-tree-node__content {
          border-bottom: 0;
        }
      }
    }
  }

  @mixin node-content($c1, $c2) {
    .el-tree-node__content {
      height: 32px;
      background-color: $c1;
      border-bottom: 1px solid $c2;
    }
  }

  @mixin node-children {
    .el-tree-node__children {
      & > {
        .el-tree-node {
          float: left;
        }
      }
    }
  }

  .tree-container {
    .el-tree {
      & > {
        .el-tree-node {
          & > {
            @include node-content('#e0e3eb', '#cacdd4');

            .el-tree-node__children {
              & > {
                .el-tree-node {
                  & > {
                    @include node-content('#eef1f8', '#dcdfe6');
                    @include node-children;
                  }
                }

                @include node-is-expanded;
              }
            }
          }
        }

        @include node-is-expanded;
      }
    }
  }

  .dialog-accredit {
    .el-dialog {
      height: 70%;
    }
  }
</style>
