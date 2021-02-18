<template>
  <el-dialog :title="'设置指定库存'" v-dragMove :visible="open" :before-close="onClose" width="600px" v-loading="loading" :close-on-press-escape="false" :close-on-click-modal="false">
    <el-form ref="form" label-width="80px" :model="formData" :rules="rules" size="small">
      <el-form-item label="指定库存" prop="inventory">
        <el-input v-model="formData.inventory" style="width: 450px"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="onSubmit('form')">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
  import { setInventory } from '@/api/shopee'

  export default {
    data() {
      const checkPrice = (rule, value, callback) => {
        const reg = /^((?!(0[0-9]{0,}$))[0-9]{1,}$)|(0$)/
        if (!reg.test(value)) {
          callback(new Error('库存只能输入0或正整数'))
        } else {
          callback()
        }
      }
      return {
        formData: {
          inventory: ''
        },
        loading: true,
        rules: {
          inventory: [
            { required: true, message: '请输入指定库存', trigger: 'blur' },
            { validator: checkPrice, trigger: 'blur' }
          ]
        }
      }
    },
    props: {
      open: Boolean,
      advtIds: {
        type: Array,
        default: () => []
      },
      inventory: {
        type: [String, Number],
        default: ''
      }
    },
    watch: {
      open(val) {
        if (val) {
          this.formData.inventory = this.inventory
        }
      }
    },
    methods: {
      onSubmit(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            const obj = {
              product_id: this.advtIds,
              custom_stock: this.formData.inventory,
              user_id: this.$store.state.user.info.id
            }
            setInventory(obj).finally(() => {
              this.loading = false
              this.$refs['form'].resetFields()
              this.$emit('renderList')
            })
            this.$emit('update:open', false)
          } else {
            return false
          }
        })
      },
      onClose() {
        this.$emit('update:open', false)
        this.$refs['form'].resetFields()
      }
    }
  }
</script>
