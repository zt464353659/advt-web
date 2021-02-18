<template>
  <el-dialog :title="'设置店铺指定库存'" v-dragMove :visible="open" :before-close="onClose" width="600px" v-loading="loading" :close-on-press-escape="false" :close-on-click-modal="false">
    <el-form ref="form" label-width="120px" :model="formData" :rules="rules" size="small">
      <el-form-item label="Site Code" prop="site_code">
        <el-select
          v-model="formData.site_code"
          filterable
          clearable
          placeholder="请选择"
          style="width: 400px"
        >
          <el-option
            v-for="item in options"
            :key="item.id"
            :label="item.site_code"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="onSubmit('form')">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
  import { setStoreInventory } from '@/api/shopee'

  export default {
    data() {
      return {
        formData: {
          site_code: ''
        },
        loading: true,
        rules: {
          site_code: [
            { required: true, message: '请输入Site Code', trigger: ['blur', 'change'] }
          ]
        }
      }
    },
    props: {
      open: Boolean,
      options: {
        type: Array,
        default: () => []
      }
    },
    watch: {},
    methods: {
      onSubmit(formName) {
        this.$refs[formName].validate((valid) => {
          this.loading = true
          if (valid) {
            const obj = {
              account_id: this.formData.site_code,
              user_id: this.$store.state.user.info.id
            }
            setStoreInventory(obj).finally(() => {
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
