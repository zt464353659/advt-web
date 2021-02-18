<template>
  <el-dialog
    title="修改库存配置"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="onClose"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    width="760px"
    v-dragMove
  >
    <template>
      <el-form ref="formData" :model="formData" size="mini" class="advt-form-inline" label-width="140px">
        <el-form-item label="库存类型：" prop="is_custom_stock">
          <el-select v-model="formData.is_custom_stock" clearable placeholder="请选择" style="width: 150px;vertical-align:top;">
            <el-option label="实际库存" value="0"></el-option>
            <el-option label="虚拟库存" value="1"></el-option>
          </el-select>
          <div class="right-notice-box" v-if="stockNotice" v-html="stockNotice">
          </div>
        </el-form-item>
        <el-form-item v-if="formData.is_custom_stock !== '0'" label="异仓验证：" prop="is_foreign_warehouse">
          <el-radio-group v-model="formData.is_foreign_warehouse">
            <el-radio label="1">启用</el-radio>
            <el-radio label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="confirm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { InventoryConfiguration } from '@/api/shopee'

  export default {
    data() {
      return {
        content: {
          assign1: '敏感属性、清货、置N产品不指定库存。',
          assign2: ''
        },
        formData: {
          is_custom_stock: '1',
          is_foreign_warehouse: '0'
        }
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
    created() {
    },
    mounted() {
    },
    computed: {
      stockNotice() {
        let str = ''
        switch (this.formData.is_custom_stock) {
        case '0':
          str = `置N和敏感属性库存为0，其它产品使用实际库存。`
          break
        case '1':
          str = `有实际库存产品（除置N、敏感属性、清货）指定库存为999。<br>
                  0库存产品，若为新品或有ETA指定库存为999；若为非新品且无ETA，不指定库存，使用实际库存0。`
          break
        }
        return str
      }
    },
    methods: {
      confirm() {
        const data = this.createSubmitData()
        InventoryConfiguration(data).then(res => {
          this.onClose()
        }).catch(() => {})
      },
      createSubmitData() {
        const { account_id, is_custom_stock, is_foreign_warehouse } = this.formData
        const obj = { account_id }
        obj.custom_stock_type = is_custom_stock
        obj.is_foreign_warehouse = this.formData.is_custom_stock === '0' ? undefined : is_foreign_warehouse
        return obj
      },
      onClose() {
        this.$emit('update:data', {})
        this.$emit('update:open', false)
        this.$emit('reload')
      }
    },
    filters: {},
    watch: {
      open: {
        handler(val) {
          if (val) {
            this.formData = this._.cloneDeep(this.data)
          }
        }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .radioCss {
    width: 80%;
    margin: 20px auto 0;
  }
  .different {
    position: relative;
    left: 6px;
  }
  .right-notice-box {
    display: inline-block;
    width: calc(100% - 170px);
    border: 1px solid #b0b0b0;
    border-radius: 4px;
    margin-left: 10px;
    padding: 0 5px;
  }
</style>
