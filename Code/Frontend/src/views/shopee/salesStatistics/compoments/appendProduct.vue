<template>
  <el-dialog
    title="新增产品"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="clearAccount"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    width="600px"
    v-dragMove
  >
    <template>
      <el-form ref="formData" :model="formData" label-width="100px" size="small">
        <el-form-item label="Product ID" prop="productId">
          <el-input
            type="textarea"
            rows="20"
            size="mini"
            placeholder="每行一个id"
            v-model="formData.productId"
            style="width: 400px"
          >
          </el-input>
        </el-form-item>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="clearAccount">取 消</el-button>
      <el-button type="primary" @click="search">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { salesAdd } from '@/api/shopee'

  export default {
    data() {
      return {
        formData: {
          productId: ''
        }
      }
    },
    props: {
      open: Boolean,
      data: {
        type: Object,
        default: () => {}
      }
    },
    created() {
    },
    mounted() {
    },
    methods: {
      clearAccount() {
        this.closeClearForm()
      },
      closeClearForm() {
        this.$emit('update:open', false)
        this.$refs.formData.resetFields()
      },
      search() {
        const reg = /^[1-9]\d{7}$/
        const productArr = this.formData.productId.split('\n')
        const product_id = productArr.every(val => reg.test(val.trim()))
        if (!product_id) {
          this.$message.error('product_id不能为空且必须是8位数字')
          return
        }
        const arr = this._.map(productArr, V => V.trim())
        const obj = {
          user_name: this.$store.state.user.info.name,
          user_id: this.$store.state.user.info.id,
          istore_product_id: this._.compact(this._.uniq(arr)).join(' ')
        }
        salesAdd(obj).then(() => {
          this.closeClearForm()
          this.$emit('renderList')
        })
      }
    },
    filters: {},
    watch: {}
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
