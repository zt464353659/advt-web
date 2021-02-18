<template>
  <!-- divider 右侧带 展开/收缩/文本按钮组件 -->
  <div class="driver-expand">
    <el-divider content-position="left">
      <span v-if="isRequest" class="required">*</span>
      {{ optTitle }}
      <span v-if="title">
        <slot name="title-content"></slot>
      </span>
    </el-divider>
    <div class="optTab">
      <slot name="btn-group"></slot>
      <el-button v-if="hasExpand" type="text" style="margin-left:10px;" @click="isExpand = !isExpand">{{ isExpand ? '收起' : '展开' }}</el-button>
    </div>
    <div v-if="isShow" v-show="isExpand">
      <slot name="content"></slot>
    </div>
    <div v-else>
      <slot name="content" v-if="isExpand"></slot>
    </div>
  </div>
</template>

<script>

export default {
  name: 'DriverExpand',
  props: {
    optTitle: {
      type: String,
      default: ''
    },
    hasExpand: {
      type: Boolean,
      default: true
    },
    isRequest: {
      type: Boolean,
      default: false
    },
    isShow: {
      type: Boolean,
      default: false
    },
    title: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isExpand: true
    }
  },
  computed: {},
  watch: {},
  mounted() {
  },
  methods: {
    expandClick() {
      this.isExpand = true
    },
    closeExpand() {
      this.isExpand = false
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.driver-expand {
  position: relative;
  min-height: 22px;

  .optTab {
    position: absolute;
    right: 20px;
    top: -20px;
    background: #ffffff;
    padding: 0 10px;
    text-align: center;
    font-size: 18px;
    cursor: pointer;
    color: #67c23a;
  }
  .required {
    color: #F56C6C;
    padding-right: 5px;
  }
}
</style>
