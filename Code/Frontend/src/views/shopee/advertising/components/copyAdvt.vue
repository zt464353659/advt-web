<template>
  <el-dialog
    title="copy广告"
    :visible="open"
    :before-close="onClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="no-required"
    v-dragMove
  >
    <!-- 搜索 -->
    <div>
      <el-form ref="listQuery" :model="listQuery" class="advt-form-inline" size="mini" label-width="120px">
        <el-form-item label="Site Code" prop="siteCode">
          <el-select filterable v-model="listQuery.siteCode" clearable placeholder="请选择" style="width: 220px" @change="contrast">
            <el-option v-for="item in siteCode" :key="item.id" :label="item.account" :value="item.account"></el-option>
          </el-select>
          <el-button type="primary" size="mini" style="margin-left: 10px" plain :disabled="multipleSelection.length === 0" @click="updateSelected">更新选中广告</el-button>
        </el-form-item>
        <el-form-item prop="classify" label="Shopee分类" style="margin-top: 10px">
          <el-cascader
            placeholder="请选择分类"
            :options="listQuery.serchClassify ? listQuery.serchClassify : []"
            :filterable="true"
            :props="props"
            v-model="listQuery.classify"
            clearable
            :rules="{ required:true, validator: checkCategory, trigger: ''}"
            @change="classifiedSearch(listQuery.classify)"
            style="width: 90%"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="属性" prop="serchProperty">
          <template>
            <el-form-item v-for="(item, index) in listQuery.serchProperty"
                          :prop="'serchProperty.' + index + '.value'"
                          :key="index"
                          :label="item.attribute_name"
                          label-width="100px"
                          :rules="item.is_mandatory === '1' ? { required:true, validator: checkName, trigger: '' } : {}"
                          style="margin-bottom: 6px"
            >
              <el-select v-show="item.input_type === 'COMBO_BOX' || item.input_type === 'DROP_DOWN'"
                         v-model="item.value"
                         size="mini"
                         placeholder="请选择"
                         clearable
                         filterable
                         @change="selectChange"
                         style="width: 80%;"
              >
                <el-option
                  v-for="i in item.options"
                  :key="i.value"
                  :label="i.label"
                  :value="i.value"
                >
                </el-option>
              </el-select>
              <el-input v-show="item.input_type === 'TEXT_FILED'"
                        type="textarea"
                        autosize
                        v-model="item.value"
                        style="width: 70%"
                        placeholder="请输入内容"
              >
              </el-input>
            </el-form-item>
          </template>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      :data="listData"
      border
      v-loading="listLoading"
      default-expand-all
      :key="newDate"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-form label-position="right"
                   :label-width="labelWidth"
                   size="small"
                   :model="scope.row"
                   :rules="rules"
                   ref="form"
                   :key="formNewDate"
                   class="information-form"
          >
            <el-row>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item prop="category" label="Shopee分类" style="margin-top: 10px">
                  <el-cascader
                    placeholder="请选择分类"
                    :options="scope.row.optionsData ? scope.row.optionsData : []"
                    :filterable="true"
                    :props="props"
                    v-model="scope.row.category"
                    clearable
                    :rules="{ required:true, validator: checkCategory, trigger: ''}"
                    @change="attributes(scope.row.istore_product_id, scope.row.category)"
                    style="width: 98%"
                  ></el-cascader>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="属性" prop="optionsBrand">
                  <template>
                    <el-form-item v-for="(item, index) in scope.row.optionsBrand"
                                  :prop="'optionsBrand.' + index + '.value'"
                                  :key="index"
                                  :label="item.attribute_name"
                                  label-width="120px"
                                  :rules="item.is_mandatory === '1' ? { required:true, validator: checkName, trigger: '' } : {}"
                    >
                      <el-select v-show="item.input_type === 'COMBO_BOX' || item.input_type === 'DROP_DOWN'"
                                 v-model="item.value"
                                 size="mini"
                                 placeholder="请选择"
                                 clearable
                                 filterable
                                 @change="selectChange"
                                 style="width: 80%;"
                      >
                        <el-option
                          v-for="i in item.options"
                          :key="i.value"
                          :label="i.label"
                          :value="i.value"
                        >
                        </el-option>
                      </el-select>
                      <el-input v-show="item.input_type === 'TEXT_FILED'"
                                type="textarea"
                                autosize
                                v-model="item.value"
                                style="width: 70%"
                                placeholder="请输入内容"
                      >
                      </el-input>
                    </el-form-item>
                  </template>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column type="selection" align="center" width="60"></el-table-column>
      <el-table-column prop="istore_product_id" label="product ID" width="120px"></el-table-column>
      <el-table-column prop="site_code" label="Site Code" width="180px"></el-table-column>
      <el-table-column prop="product_name" label="标题"></el-table-column>
    </el-table>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :disabled="listQuery.siteCode === '' || this.listData.length === 0" @click="onConfirm">确 定</el-button>
      <el-button @click="onClose">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { copyAdvt, getCategories, getAttributes } from '@/api/shopee'

  export default {
    data() {
      // 分类验证
      const checkCategory = (rule, value, callback) => {
        callback()
      }
      // 属性选择验证
      const checkName = (rule, value, callback) => {
        callback()
      }
      return {
        listLoading: false,
        listData: [],
        newDate: new Date().getTime(),
        formNewDate: new Date().getTime(),
        listQuery: {
          id: '',
          page: 1,
          per_page: 10,
          siteCode: '',
          serchProperty: [],
          serchClassify: [],
          classify: []
        },
        pagination: null,
        options: [],
        id: '',
        props: {
          value: 'category_id',
          label: 'name',
          children: '_child'
        },
        categoryIdArr: [],
        attributesArr: [],
        optionsData: [],
        showData: {
          optionsBrand: [],
          category: []
        },
        multipleSelection: [],
        thirdClassification: [],
        thirdAttributes: [],
        labelWidth: '140px',
        rules: {
          category: [
            { required: true, validator: checkCategory, trigger: 'change' }
          ]
        },
        checkCategory: checkCategory,
        checkName: checkName
      }
    },
    props: {
      siteCode: {
        type: Array,
        required: true,
        default: () => []
      },
      data: {
        type: Array,
        required: true,
        default: () => []
      },
      open: Boolean
    },
    created() {
    },
    mounted() {
    },
    methods: {
      onClose() {
        // this.$refs.listQuery.resetFields()
        this.listQuery.siteCode = ''
        this.listQuery.classify = []
        this.listQuery.serchClassify = []
        this.listQuery.serchProperty = []
        this.$emit('update:open', false)
      },
      // 筛选site_code规则
      contrast(val) {
        this.listData = this._.cloneDeep(this.data)
        this.listQuery.serchClassify = []
        this.listQuery.classify = []
        this.listQuery.serchProperty = []
        if (val) {
          this.listData = this.listData.filter(item => {
            if (val.slice(0, -3).toLowerCase() === item.site_code.slice(7).slice(0, -3).toLowerCase()) {
              if (val.slice(-2) !== item.site_code.slice(-2).toLowerCase()) {
                return item
              }
            }
          })
          // 取site_code的id
          this._.forEach(this.siteCode, val => {
            if (val.account === this.listQuery.siteCode) {
              this.id = val.id
            }
          })
          const obj = {
            account_id: this.id
          }
          getCategories(obj).then((res) => {
            this.listQuery.serchClassify = res.data
            this._.forEach(this.listData, val => {
              val.optionsData = res.data
              val.category = []
              val.optionsBrand = []
            })
            const table = this._.cloneDeep(this.listData)
            this.listData = []
            this.listData = table
          })
        }
      },
      onConfirm() {
        const listArr = []
        this._.forEach(this.listData, (item, index) => {
          if (item.category.length) {
            listArr.push(item.category[item.category.length - 1])
          }
        })
        this.categoryIdArr = listArr
        if (this.categoryIdArr.length === this.listData.length) {
          const options = []
          this.listData.forEach(item => {
            const arr = item.optionsBrand.every(val => {
              if (val.is_mandatory === '1') {
                return Boolean(val.value)
              }
              return true
            })
            options.push(arr)
          })
          const _options = options.every(val => val)
          if (!_options) {
            this.$message({
              type: 'error',
              message: '请选择属性分类，*号为必填'
            })
          } else {
            this._.forEach(this.siteCode, val => {
              if (val.account === this.listQuery.siteCode) {
                this.id = val.id
              }
            })
            const advts = this.listData.map((item, index) => {
              return JSON.stringify({
                advt_id: item.id,
                spu_id: item.spu_id,
                istore_product_id: item.istore_product_id,
                account_id: item.account_id,
                category_id: this.categoryIdArr[index],
                attributes: this.resultData()[index]
              })
            })
            const obj = {
              account_id: [this.id],
              advts
            }
            copyAdvt(obj).then(() => {
              this.$emit('renderList')
            }).finally(() => {
              this.onClose()
            })
          }
        } else {
          this.$message({
            type: 'error',
            message: '请选择shopee分类，*号为必填'
          })
        }
      },
      // 处理属性分类数据
      resultData() {
        let listArr = []
        this._.forEach(this.listData, (item, index) => {
          if (item.optionsBrand.length) {
            listArr.push(item.optionsBrand)
          }
        })
        const arr = []
        this._.forEach(listArr, single => {
          arr.push(single.filter(val => val.value))
        })
        listArr = []
        this._.map(arr, val => {
          const _arr = {}
          this._.map(val, item => {
            if (item.value) {
              _arr[item.attribute_id] = item.value
            }
          })
          listArr.push(_arr)
        })
        return listArr
      },
      // 获取广告分类树
      categories(id) {
        const obj = {
          advt_id: id
        }
        getCategories(obj).then((res) => {
          this.optionsData = res.data
        })
      },
      // 获取分类属性组
      getAttributes(category_id, index) {
        const obj = {
          category_id: category_id
        }
        getAttributes(obj).then((res) => {
          res.data.forEach(val => {
            val.attribute = undefined
          })
          this.listData[index].optionsBrand = res.data
        // this.formNewDate = new Date().getTime()
        })
      },
      // 分类搜索回填属性值
      classifiedSearch(val) {
        if (val && val.length && val.length !== 0) {
          const obj = {
            category_id: val[val.length - 1]
          }
          getAttributes(obj).then((res) => {
            this.listQuery.serchProperty = res.data
          })
        } else {
          this.listQuery.serchProperty = []
        }
      },
      attributes(istore_product_id, val) {
        if (val.length && val.length !== 0) {
          const listArr = []
          this._.forEach(this.listData, (item, index) => {
            if (item.category.length) {
              listArr.push(item.category[item.category.length - 1])
            }
          })
          let index
          this._.map(this.listData, (item, target) => {
            if (item.istore_product_id === istore_product_id) {
              index = target
            }
          })
          if (val) {
            const category_id = val[val.length - 1]
            if (category_id) {
              this.getAttributes(category_id, index)
              this.categoryIdArr = listArr
            }
          }
        } else {
          this.categoryIdArr = []
          let index
          this._.map(this.listData, (item, target) => {
            if (item.istore_product_id === istore_product_id) {
              index = target
            }
          })
          this.listData[index].optionsBrand = []
        // this.newDate = new Date().getTime()
        }
      },
      selectChange() {
      // this.newDate = new Date().getTime()
      },
      // 选中项
      handleSelectionChange(val) {
        this.multipleSelection = val
      },
      // 更新选中广告
      updateSelected() {
        if (this.listQuery.classify && this.listQuery.classify.length !== 0) {
          const options = []
          const arr = this.listQuery.serchProperty.every(val => {
            if (val.is_mandatory === '1') {
              return Boolean(val.value)
            }
            return true
          })
          options.push(arr)
          const _options = options.every(val => val)
          if (!_options) {
            this.$message({
              type: 'warning',
              message: '请选择属性分类，*号为必填'
            })
          } else {
            this.thirdAttributes = this._.cloneDeep(this.listQuery.serchProperty)
            this.thirdClassification = this._.cloneDeep(this.listQuery.classify)
            this.multipleSelection.forEach((val, index) => {
              val.category = this._.cloneDeep(this.thirdClassification)
              val.optionsBrand = this._.cloneDeep(this.thirdAttributes)
            })
          }
        } else {
          this.$message({
            type: 'warning',
            message: '请选择shopee分类模板'
          })
        }
      }
    },
    filters: {},
    watch: {
      open(val) {
        if (val) {
          this.listData = this._.cloneDeep(this.data)
        }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .information-form {
    background-color: #EBEEF5;
  }
</style>
