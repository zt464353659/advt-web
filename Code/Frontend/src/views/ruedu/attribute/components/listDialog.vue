<template>
  <el-dialog :title="'配置属性值'" :visible="open" :before-close="onClose" v-loading="loading" :close-on-press-escape="false" :close-on-click-modal="false">
    <el-table :data="listData" :key="newDate" border style="width: 100%">
      <el-table-column prop="id" label="ID" min-width="50" align="center"></el-table-column>
      <el-table-column prop="attr_en_name" label="Code Attribut" align="center"></el-table-column>
      <el-table-column prop="en_value" label="Code Valeur" align="center">
        <el-select v-model="enValue" placeholder="请选择" size="mini" @change="enChange">
          <el-option
            v-for="item in valueOption"
            :key="item.id"
            :label="item.en_value"
            :value="item.en_value"
          >
          </el-option>
        </el-select>
      </el-table-column>
      <el-table-column prop="attr_fr_name" label="Libellé Attribut" align="center"></el-table-column>
      <el-table-column prop="fr_value" label="Libellé Valeur" align="center">
        <el-select v-model="frValue" placeholder="请选择" size="mini" @change="frChange">
          <el-option
            v-for="item in valueOption"
            :key="item.id"
            :label="item.fr_value"
            :value="item.fr_value"
          >
          </el-option>
        </el-select>
      </el-table-column>
      <el-table-column label="操作" width="115" align="center">
        <el-button type="text" size="mini" @click="openTheNewTAB">设置为默认值</el-button>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script>
  import { attrInfo, listAttrEdit, attrEdit } from '@/api/ruedu'

  export default {
    data() {
      return {
        newDate: new Date().getTime(),
        loading: false,
        listData: [],
        enValue: undefined,
        frValue: undefined,
        valueOption: []
      }
    },
    props: {
      open: Boolean,
      row: {
        type: Object,
        default: () => {}
      }
    },
    methods: {
      renderList() {
        attrInfo({ id: this.row.id }).then((res) => {
          const arr = []
          arr.push(res.data)
          this.listData = arr
        })
        this.enValue = this.row.en_value
        this.frValue = this.row.fr_value
        listAttrEdit({ attr_en_name: this.row.attr_en_name, not_show_message: true }).then((res) => {
          this._.forEach(res.data, (val) => {
            this.valueOption.push({
              en_value: val.en_value,
              fr_value: val.fr_value
            })
          })
        })
      },
      openTheNewTAB() {
        const obj = {
          id: this.row.id,
          en_value: this.enValue,
          fr_value: this.frValue
        }
        attrEdit(obj).then(() => {
          this.onClose()
          this.$emit('renderList')
        })
      },
      // 刷新dom
      reFresh() {
        const table = this._.cloneDeep(this.listData)
        this.listData = []
        this.listData = table
      },
      enChange() {
        this.reFresh()
      },
      frChange() {
        this.reFresh()
      },
      onClose() {
        this.$emit('update:open', false)
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
