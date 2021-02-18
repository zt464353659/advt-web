<template>
  <el-dialog
    title="热销竞品跟卖处理详情"
    :visible="open"
    class="dialog-add-upload-plan dialog-limit-height"
    :before-close="closeClearForm"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="800px"
    v-drag-move
  >
    <template>
      <el-form ref="formData" :model="formData" label-width="120px" size="mini" @submit.native.prevent>
        <el-form-item label="Site code" prop="site_code">
          <div class="Bg-div" style="width: 150px;">{{ formData.site_code }}</div>
        </el-form-item>
        <el-form-item label="产品ID" prop="istore_product_id">
          <div class="Bg-div" style="width: 150px;">{{ formData.istore_product_id }}</div>
        </el-form-item>
        <el-form-item label="竞品链接">
          <div v-if="formData.links">（总计：{{ formData.links.length }}条）</div>
        </el-form-item>
        <el-form-item prop="links">
          <div v-for="(item,index) in formData.links" :key="index" style="margin-bottom: 10px">
            <a style="color:#409EFF" :href="item.link" target="_blank">{{ item.link }}</a><br />
          </div>
        </el-form-item>
        <el-form-item label="设置毛利率">
          <el-col :span="2">
            <el-form-item prop="min_gross_margin" style="margin-bottom: 0">
              <div class="Bg-div" style="text-align: center">{{ formData.min_gross_margin }}</div>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="3" style="text-align: center">%≤ 毛利率 ≤</el-col>
          <el-col :span="2">
            <el-form-item prop="max_gross_margin" style="margin-bottom: 0">
              <div class="Bg-div" style="text-align: center">{{ formData.max_gross_margin }}</div>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="1">%</el-col>
        </el-form-item>
        <el-form-item label="设置调价幅度" prop="price_range">
          <el-col :span="4">
            <span>比竞品最低价低</span>
          </el-col>
          <el-col :span="2">
            <div class="Bg-div" style="text-align: center">{{ formData.price_range }}</div>
          </el-col>
          <el-col :span="2" style="text-align: center">
            <span>KRW</span>
          </el-col>
        </el-form-item>
        <el-form-item label="是否启用" prop="is_enable">
          <div class="Bg-div" style="width: 150px;">{{ formData.is_enable === 1 ? '已启用' : '未启用' }}</div>
        </el-form-item>
      </el-form>
    </template>
  </el-dialog>
</template>

<script>
export default {
  mixins: [],
  filters: {},
  components: {},
  props: {
    open: {
      type: Boolean,
      required: true,
      default: false
    },
    advtData: {
      type: [Object],
      required: false,
      default: () => {
      }
    }
  },
  data() {
    return {
      formData: {
        site_code: undefined,
        istore_product_id: undefined,
        link: undefined,
        min_gross_margin: undefined,
        max_gross_margin: undefined,
        price_range: undefined,
        is_enable: 0
      }
    }
  },
  computed: {},
  watch: {
    advtData(val) {
      if (val) {
        this.formData = val
      }
    }
  },
  created() {
  },
  mounted() {
  },
  destroyed() {
  },
  methods: {
    closeClearForm() {
      this.$emit('update:open', false)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.Bg-div {
  background-color: #ebeef5;
  padding: 0 6px 0 6px;
  border-radius: 3px;
  margin: 0;
}
</style>
