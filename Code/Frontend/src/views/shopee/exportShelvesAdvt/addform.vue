<template>
  <el-dialog
    title="添加导出任务"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="closeClearForm"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    width="600px"
    v-dragMove
  >
    <template>
      <el-form ref="formData" :model="formData" :rules="rules" label-width="100px" size="mini">
        <el-form-item label="site Code" prop="account_ids">
          <multiple-select-account
            ref="multipleSelectAccount"
            v-bind.sync="multipleSelectAccountOption"
            @select-account="selectAccount"
            @clean-select="cleanSelect"
            style="width: 240px"
          ></multiple-select-account>
        </el-form-item>
        <el-form-item label="创建时间" prop="time">
          <el-date-picker
            v-model="formData.time"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            style="width: 80%"
          >
          </el-date-picker>
        </el-form-item>
        <div style="margin-left: 30px;color: red">查询范围：广告发布系统架上商品</div>
      </el-form>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeClearForm">取 消</el-button>
      <el-button type="primary" @click="addForm">确定导出</el-button>
    </div>
  </el-dialog>
</template>

<script>
import multipleSelectAccount from './multipleSelectAccount'
import { getadvtAdd } from '@/api/shopee'

export default {
  components: {
    multipleSelectAccount
  },
  data() {
    return {
      formData: {
        account_ids: [],
        time: []
      },
      multipleSelectAccountOption: {
        accountArr: [],
        accountKey: 'id'
      },
      rules: {
        account_ids: [
          { required: true, message: 'site Code不能为空', trigger: 'blur' }
        ],
        time: [
          { required: true, message: '创建时间不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  props: {
    open: {
      required: true,
      type: Boolean,
      default:false
    },
    multipleSelect: {
      required: true,
      type: Array,
      default: () => {
      }
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    addForm() {
      this.$refs['formData'].validate((valid) => {
        if (valid) {
          getadvtAdd(this.formData).then(() => {
              this.closeClearForm()
              this.$emit('renderList')
          })
        }
      })
    },
    // site code多选框
    selectAccount(arr) {
      this.formData.account_ids = arr
    },
    cleanSelect() {
      this.formData.account_ids = []
    },

    closeClearForm() {
      this.$emit('update:open', false)
      this.$refs['formData'].resetFields()
      this.formData.time = []
      this.formData.account_ids = []
      this.$refs['multipleSelectAccount'].handleCancelAllUser()
    }
  },
  filters: {},
  watch: {
    multipleSelect(value) {
      if (value) {
        this.multipleSelectAccountOption.accountArr = value
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
