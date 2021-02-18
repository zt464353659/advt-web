<template>
  <el-dialog :title="'配置属性值'" :visible="open" :before-close="onClose" v-loading="loading" :close-on-press-escape="false" :close-on-click-modal="false">
    <el-table :data="listData" border style="width: 100%">
      <el-table-column prop="id" label="ID" min-width="50" align="center"></el-table-column>
      <el-table-column prop="attr_en_name" label="Code Attribut" align="center"></el-table-column>
      <el-table-column prop="en_value" label="Code Valeur" align="center">
        <template slot-scope="scope">
          <el-input type="text" size="mini" v-model="scope.row.enValue"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="attr_fr_name" label="Libellé Attribut" align="center"></el-table-column>
      <el-table-column prop="fr_value" label="Libellé Valeur" align="center">
        <template slot-scope="scope">
          <el-input type="text" size="mini" v-model="scope.row.frValue"></el-input>
        </template>
      </el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { attrInfo, attrEdit } from '@/api/ruedu'

  export default {
    data() {
      return {
        listData: [],
        loading: false
      }
    },
    created() {
    },
    mounted() {
    },
    props: {
      open: Boolean,
      row: {
        type: Object,
        default: () => {
        }
      }
    },
    methods: {
      renderList() {
        attrInfo({ id: this.row.id }).then((res) => {
          const arr = []
          arr.push(res.data)
          this.listData = arr
          this.listData = this.listData.map(v => {
            return this._.assign(v, {
              enValue: undefined,
              frValue: undefined
            })
          })
          this.reFresh()
        })
      },
      // 刷新dom
      reFresh() {
        const table = this._.cloneDeep(this.listData)
        this.listData = []
        this.listData = table
      },
      submit() {
        const obj = {
          id: this.row.id,
          en_value: this.listData[0].enValue,
          fr_value: this.listData[0].frValue
        }
        attrEdit(obj).then(() => {
          this.onClose()
          this.$emit('renderList')
        })
      },
      onClose() {
        this.$emit('update:open', false)
        this.listData = []
      }
    },
    filters: {},
    watch: {
      open(val) {
        if (val) {
          this.renderList()
        }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
