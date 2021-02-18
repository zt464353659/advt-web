<template>
  <el-dialog
    title="添加热销竞品跟卖处理"
    :visible="open"
    class="dialog-add-upload-plan dialog-limit-height"
    :before-close="closeClearForm"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="800px"
    v-drag-move
  >
    <template>
      <el-form ref="formData" :rules="rules" :model="formData" label-width="120px" size="mini" @submit.native.prevent>
        <el-form-item label="Site code" prop="site_code">
          <el-select v-model="formData.site_code" multiple collapse-tags>
            <el-option v-for="(item,index) in options.krAdvtAccount"
                       :key="index"
                       :label="item.site_code"
                       :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Product ID" prop="istore_product_id">
          <el-input style="width: 200px" clearable v-model="formData.istore_product_id"></el-input>
          <span class="color">只能输入单品或vary子ID</span>
        </el-form-item>
        <el-form-item
          v-for="(item, index) in formData.link"
          :label="'竞品链接' + (index + 1)"
          :key="item.key"
          :prop="'link.' + index + '.value'"
          :rules="rules.link"
          style="margin-bottom: 10px;"
        >
          <el-col :span="21">
            <el-input v-model="item.value"></el-input>
          </el-col>
          <el-col :span="3">
            <el-row style="margin-left: 5px">
              <i class="el-icon-remove-outline"
                 v-if="formData.link.length>1 "
                 @click.prevent="removeDomain(item)"
                 style="color: #F56C6C;font-size: 26px;cursor:pointer"
              >
              </i>
              <i v-if="index ===formData.link.length-1 "
                 class="el-icon-circle-plus-outline"
                 @click="addDomain"
                 style="color: #67C23A;font-size: 26px;cursor:pointer"
              ></i>
            </el-row>
          </el-col>
        </el-form-item>
        <el-form-item style="margin-bottom: 0">
          <div class="color">最多可输入50条链接，一行一个</div>
        </el-form-item>
        <!--        -->
        <el-form-item label="设置毛利率" required>
          <el-col :span="4">
            <el-form-item prop="min_gross_margin" style="margin-bottom: 0">
              <el-input placeholder="设置毛利率" v-model="formData.min_gross_margin" style="width: 100%"></el-input>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="3" align="center">%≤毛利率≤</el-col>
          <el-col :span="4">
            <el-form-item prop="max_gross_margin" style="margin-bottom: 0">
              <el-input placeholder="设置毛利率" v-model="formData.max_gross_margin" style="width: 100%"></el-input>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="1" align="center">%</el-col>
        </el-form-item>
        <el-form-item label="设置调价幅度" prop="price_range">
          <el-col :span="4" align="center">比竞品最低价低</el-col>
          <el-col :span="4">
            <el-input style="width: 100px;" v-model="formData.price_range"></el-input>
          </el-col>
          <span>KRW</span>
          <span class="color">必须为10的整倍数</span>
        </el-form-item>
        <el-form-item label="是否启用" prop="is_enable">
          <el-radio-group v-model="formData.is_enable">
            <el-radio-button label="1">是</el-radio-button>
            <el-radio-button label="0">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </template>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeClearForm">取 消</el-button>
      <el-button type="primary" @click="setPlanTask">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getSelectAll, setFellow } from '@/api/kr11street'
import { resultAlert } from './index'

export default {
  mixins: [],
  filters: {},
  components: {},
  props: {
    open: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  data() {
    const istore_product_id = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('Product ID 不能为空'))
      }
      const reg = /^\d{8}$/
      if (!reg.test(value.trim())) {
        return callback(new Error('产品ID 必须为8位数字值（不能包含特殊符号、标点符号及汉字）'))
      }
      callback()
    }
    const link = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('竞品链接不能为空'))
      }
      const reg = /(http|https):\/\/([\w.]+\/?)\S*/
      if (!reg.test(value.trim())) {
        return callback(new Error('请输入正确的链接格式'))
      }

      if (value.split('\n').length > 50) {
        return callback(new Error('最多输入50条链接'))
      }
      callback()
    }
    const min_gross_margin = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('毛利率不能为空'))
      }
      const reg = /([0-9]\d*\.?\d*)|(0\.\d*[0-9])/
      if (!reg.test(value)) {
        return callback(new Error('毛利率必须为数字'))
      }
      if (Number(value) < 0) {
        return callback(new Error(`毛利率不能小于0`))
      }
      if (String(value).includes('.') && String(value).split('.')[1].length > 2) {
        return callback(new Error('毛利率小数后只保留2位'))
      }
      callback()
    }
    const max_gross_margin = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('毛利率不能为空'))
      }
      const reg = /([0-9]\d*\.?\d*)|(0\.\d*[0-9])/
      if (!reg.test(value)) {
        return callback(new Error('毛利率必须为数字'))
      }
      if (Number(this.formData.min_gross_margin) > Number(this.formData.max_gross_margin)) {
        return callback(new Error(`毛利率左边不能比右边大`))
      }
      if (Number(value) > 100) {
        return callback(new Error(`毛利率不能大于100`))
      }
      if (String(value).includes('.') && String(value).split('.')[1].length > 2) {
        return callback(new Error('毛利率小数后只保留2位'))
      }

      callback()
    }
    const price_range = (rule, value, callback) => {
      const reg = /^[0-9]*$/
      if (!reg.test(value)) {
        return callback(new Error('调价必须为数字'))
      }
      if (parseInt(value) < 10 || parseInt(value) % 10 !== 0) {
        return callback(new Error('必须为10的整倍数'))
      }
      callback()
    }
    return {
      options: {},//搜索条件选择数据
      formData: {
        site_code: undefined,
        istore_product_id: undefined,
        link: [
          {
            value: ''
          }
        ],
        min_gross_margin: undefined,
        max_gross_margin: undefined,
        price_range: undefined,
        is_enable: 1
      },
      rules: {
        site_code: [{ required: true, message: '请选择site_code', trigger: 'blur' }],
        istore_product_id: [{ required: true, validator: istore_product_id, trigger: 'blur' }],
        link: [{ required: true, validator: link, trigger: 'blur' }],
        min_gross_margin: [{ required: true, validator: min_gross_margin, trigger: 'blur' }],
        max_gross_margin: [{ required: true, validator: max_gross_margin, trigger: 'blur' }],
        price_range: [{ required: true, validator: price_range, trigger: 'blur' }]
      }
    }
  },
  computed: {},
  watch: {},
  created() {
    this.searchItem()
  },
  mounted() {
  },
  destroyed() {
  },
  methods: {
    //新建计划任务
    setPlanTask() {

      this.$refs['formData'].validate(valid => {
        if (valid) {
          const queryParams = this._.cloneDeep(this.formData)
          queryParams.link = this._.map(this.formData.link, (list) => {
            return list.value.trim()
          })
          setFellow(queryParams).then(res => {
            if (res.code === 200 && res.data.length === 0) {
              this.$alert(res.message, '执行结果', {
                confirmButtonText: '确定',
                dangerouslyUseHTMLString: true
              })
              this.$emit('renderList')
              this.closeClearForm()
            } else {
              let stata = this._.filter(res.data, { 'type': 1 })
              if (stata.length === 0) {
                resultAlert(res)
              } else {
                resultAlert(res, this.closeClearForm)
              }
              this.$emit('renderList')
            }
          })
        }
      })
    },
    // 搜索中 sitecode,产品线,广告类型 optionArray获取
    searchItem() {
      getSelectAll().then(response => {
        this.options = response.data
      })
    },
    //新增链接
    addDomain() {
      if (this.formData.link.length >= 50) {
        this.$message.error('最多添加50条链接')
      } else {
        this.formData.link.push({
          value: '',
          key: Date.now()
        })
      }
    },
    //删除链接
    removeDomain(item) {
      var index = this.formData.link.indexOf(item)
      if (index !== -1) {
        this.formData.link.splice(index, 1)
      }
    },
    closeClearForm() {

      this.$refs.formData.resetFields()
      this.formData.link = [{ value: '' }]
      this.$emit('update:open', false)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.color {
  color: red;
}
</style>
<style rel="stylesheet/scss" lang="scss">
.task_alerbox {
  width: 700px;
}
</style>
