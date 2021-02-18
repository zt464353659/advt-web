<template>
  <el-select
    @input.native="checkAccount"
    @click.native.capture="checkAccount"
    @change="accountChange"
    v-model="account"
    :reserve-keyword="true"
    filterable
    clearable
    multiple
    collapse-tags
    placeholder="Select"
    class="more-select-el"
  >
    <div style="text-align:center;padding: 2px 0" v-show="Object.keys(nowAccountArr).length">
      <el-button size="mini" @click="handleSelectAllUser">Select all</el-button>
      <el-button size="mini" @click="handleCancelAllUser">Cancel all</el-button>
    </div>
    <el-option
      class="sm-option"
      v-for="(item,index) in options"
      :key="index"
      :label="item.istore_account_name"
      :value="item.id"
    >
    </el-option>
  </el-select>
</template>

<script>
export default {
  props: {
    options: {
      type: [Array, Object],
      default: () => []
    }
  },
  data() {
    return {
      account: [],
      nowAccountArr: [] // 存储当前account下拉框的值
    }
  },
  watch: {
    options(value) {
      if (value) {
        this.nowAccountArr = this._.cloneDeep(value)
        // TODO 这里注释account是因为b2w的列表请求会每次刷新options多选条件，导致Site Code字段自动清空的bug
        //this.account = []
      }
    }
  },
  methods: {
    // 根据输入的值，获取当前下拉框中显示的数组
    checkAccount(el) {
      console.log(el.target.value)
      const str = el.target.value
      if (this._.trim(str) === '') {
        this.nowAccountArr = this._.cloneDeep(this.options)
      } else {
        this.nowAccountArr = this._.filter(this.options, v => {
          return this._.includes(v.account.toLowerCase(), str.toLowerCase())
        })
      }
    },
    // 设置 当前下拉框中的值 （拼接并去重）
    handleSelectAllUser() {
      this.account = this._.map(Object.values(this.nowAccountArr), (item) => {
        return item.id
      })
      this.accountChange()
    },
    // 取消 当前下拉框中的值
    handleCancelAllUser() {
      this.account = []
      this.$emit('clean-select')
    },
    accountChange() {
      this.$emit('select-account', this.account)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.more-select-el {
  .el-tag {
    position: relative;
    display: inline-block;
    max-width: 130px;
    overflow: hidden;
    padding-right: 20px;
    left: 6px;
  }

  .el-select__tags-text {
    display: inline-block !important;
    max-width: 130px;
  }

  .el-icon-close {
    position: absolute;
    right: 0 !important;
    bottom: 0;
    margin: auto 0;
  }
}
</style>
