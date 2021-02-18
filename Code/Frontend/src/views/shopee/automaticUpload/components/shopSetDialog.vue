<template>
  <el-dialog
    title="修改店铺配置"
    class="dialog-add-upload-plan"
    :visible="open"
    :before-close="onClose"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    width="560px"
    v-dragMove
  >
    <template>
      <el-form ref="formData" :model="formData" size="mini" class="advt-form-inline" label-width="220px">
        <el-form-item label="自动更新预购天数：" prop="is_auto_dts">
          <el-radio-group v-model="formData.is_auto_dts">
            <el-radio label="1">启用</el-radio>
            <el-radio label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div class="auto-offline-disabled">
        <div class="auto-offline-label">
          <el-popover
            placement="top-start"
            width="300"
            trigger="hover"
            content="自动下架上线超过6个月且销量、浏览量、点赞量均为0的产品"
          >
            <div slot="reference">自动下架无销量广告:</div>
          </el-popover>
        </div>
        <div class="auto-offline-radio">
          <el-radio-group v-model="formData.is_auto_offline">
            <el-radio label="1">启用</el-radio>
            <el-radio label="0">禁用</el-radio>
          </el-radio-group>
        </div>
      </div>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="confirm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { storeDisabled } from '@/api/shopee'

  export default {
    data() {
      return {
        content: {
          assign1: '敏感属性、清货、置N产品不指定库存。',
          assign2: ''
        },
        formData: {
          is_auto_dts: '0',
          is_auto_offline: '0'
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
    computed: {},
    methods: {
      confirm() {
        const data = this._.cloneDeep(this.formData)
        storeDisabled(data).then(res => {
          this.onClose()
        }).catch(() => {
        })
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

  .auto-offline-disabled {
    line-height: 28px;
    display: flex;
    .auto-offline-label {
      width: 220px;
      padding-right: 20px;
      text-align: right;
      font-size: 14px;
      color: #606266;
      font-weight: 700;
    }
  }
</style>
