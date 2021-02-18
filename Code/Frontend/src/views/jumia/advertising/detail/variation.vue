<template>
  <div>
    <div class="header-box">
      <label class="title">Basic Information(variation)</label>
      <el-row class="right-row">
        <!--            <el-button type="primary" size="mini" @click="openLog(this.advt_id)">日志</el-button>-->
        <el-button type="primary" size="mini" v-if="setEdit" @click="toggleEdit">{{ button_inner }}</el-button>
      </el-row>
    </div>
    <!--内容区-->
    <div class="content-box" style="padding-top: 0">
      <el-collapse v-model="activeNames">
        <el-collapse-item title="Listing Information" name="1">
          <el-form
            :label-width="labelWidth"
            size="small"
            class="information-form"
            ref="editForm"
            :model="editForm"
            :rules="rules"
          >
            <el-row>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="广告名称" prop="name">
                  <template v-if="is_edit">
                    <el-input v-model="editForm.name"
                              size="mini"
                              type="text"
                              clearable
                              placeholder="请输入内容"
                              @input="replaceSpace"
                              style="width: calc(98% - 200px);min-width: 200px;"
                    ></el-input>
                    <el-tag size="small" :type="editForm.name.length > 255 ? 'danger' : 'success'">{{ editForm.name.length }}/255（限制文本255个字符）</el-tag>
                  </template>
                  <template v-else>
                    <p>{{ editForm.name }}</p>
                  </template>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="广告ID">
                  <p>{{ editForm.advt_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="广告类型">
                  <p>{{ editForm.type_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="总重量(kg)">
                  <p>{{ editForm.total_weight }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Account Name">
                  <p>{{ editForm.account_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Status">
                  <p>{{ editForm.status_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Category">
                  <p>{{ editForm.category_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Category ID">
                  <p>{{ editForm.category_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="包装尺寸(长*宽*高 cm)">
                  <p>{{ `${editForm.package_length} * ${editForm.package_width} * ${editForm.package_high}` }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-col :xs="24" :sm="24" :md="24" :lg="24">
              <el-form-item label="原目录">
                <p>{{ `${editForm.category_name} [${editForm.category_id}]` }}</p>
              </el-form-item>
            </el-col>
            <template v-if="is_edit">
              <el-form-item label="选择新目录">
                <el-cascader
                  placeholder="请选择目录"
                  :props="categoryProps"
                  :options="categoryList"
                  :filterable="true"
                  @change="categoryChange"
                  style="width: 100%"
                  v-model="category"
                ></el-cascader>
              </el-form-item>
            </template>
            <el-row v-if="editForm.attributes&&editForm.attributes.length>0">
              <el-col :xs="24" :sm="24" :md="12" :lg="12" v-for="(attrs, index) in editForm.attributes" :key="index">
                <!--有单位-->
                <template v-if="attrs.options&&attrs.options.length">
                  <el-form-item
                    :label="attrs.attribute_name"
                    :prop="'attributes.'+ index +'.value'"
                    :rules="[{required: attrs.is_required===0?false:true, validator: basicInforules(attrs), trigger: 'blur' }]"
                  >
                    <template v-if="is_edit">
                      <el-select v-model="attrs.value" style="width: calc(98% - 200px);min-width: 200px;" clearable>
                        <el-option v-for="(option,ind) in attrs.options" :label="option" :value="option" :key="ind"></el-option>
                      </el-select>
                    </template>
                    <template v-else><p style="width: calc(98% - 200px);min-width: 200px;display: inline-block">{{ attrs.value }}</p></template>
                    <el-popover
                      placement="top-start"
                      width="400"
                      trigger="hover"
                    >
                      <div>
                        <div v-if="attrs.description" class="description">
                          <span style="font-weight: 700;">description:</span> {{ attrs.description }}
                        </div>
                        <div v-if="attrs.example_value" class="example">
                          <span style="font-weight: 700;">example:</span> {{ attrs.example_value }}
                        </div>
                      </div>
                      <el-button type="text" slot="reference"><i class="el-icon-question"></i></el-button>
                    </el-popover>
                  </el-form-item>
                </template>
                <!--input-->
                <template v-else>
                  <el-form-item
                    :label="attrs.attribute_name"
                    :prop="'attributes.'+ index +'.value'"
                    :rules="[{required: attrs.is_required===0?false:true, validator: basicInforules(attrs), trigger: 'blur' }]"
                  >
                    <template v-if="is_edit">
                      <el-input v-model="attrs.value"
                                :type="attrs.input_type==='textfield'?'text':'textarea'"
                                :autosize="{ minRows: 1, maxRows: 4}"
                                style="width: calc(98% - 200px);min-width: 200px;"
                                clearable
                      ></el-input>
                      <el-tag v-if="attrs.max_length&&attrs.max_length>0" size="small"
                              :type="attrs.value.length > attrs.max_length ? 'danger' : 'success'"
                      >
                        {{ attrs.value.length }}/{{ attrs.max_length }}（限制文本{{ attrs.max_length }}个字符）
                      </el-tag>
                      <el-tag v-else size="small" type="success">{{ attrs.value.length }}（不限制字符）</el-tag>
                    </template>
                    <template v-else><p style="width: calc(98% - 200px);min-width: 200px;display: inline-block">{{ attrs.value }}</p></template>
                    <el-popover
                      placement="top-start"
                      width="400"
                      trigger="hover"
                    >
                      <div>
                        <div v-if="attrs.description" class="description">
                          <span style="font-weight: 700;">description:</span> {{ attrs.description }}
                        </div>
                        <div v-if="attrs.example_value" class="example">
                          <span style="font-weight: 700;">example:</span> {{ attrs.example_value }}
                        </div>
                      </div>
                      <el-button type="text" slot="reference"><i class="el-icon-question"></i></el-button>
                    </el-popover>
                  </el-form-item>
                </template>
              </el-col>
            </el-row>
            <el-form-item label="主图">
              <template>
                <edit-image
                  v-if="is_edit && canEdit"
                  :pictureList="editForm.images"
                  :is-edit="is_edit && canEdit"
                  :pictures="istorePictures"
                  :max-length="8"
                  :default-props="defaultProps"
                  :picture-key="'image_path'"
                  :thumb-url="'product_image_thumb'"
                  @emit-update-pictureList="updateImages"
                ></edit-image>
                <p v-if="is_edit && canEdit" class="no-back-ground tip-color"><i class="el-icon-info"></i>第一张为主图，最多可上传8张</p>
                <div v-else style="padding-right:50px;">
                  <picture-view
                    :pictureList="editForm.images"
                    :width="100"
                    :height="100"
                    :spaceBetween="6"
                    :thumbnailWidth="80"
                    :thumbnailHeight="80"
                    :defaultProps="defaultProps"
                  ></picture-view>
                </div>
              </template>
            </el-form-item>
            <el-form-item label="描述" prop="description">
              <template v-if="is_edit">
                <tinymce
                  style="padding-left: 0px"
                  class="no-back-ground"
                  @set-content="setContent"
                  v-model="editForm.description"
                  :height="400"
                  @blur="onEditorBlur"
                />
                <p class="tip-color">
                  <i class="el-icon-warning"></i>
                  描述内容限制在155-25000个字符
                </p>
              </template>
              <template v-else>
                <div v-html="editForm.description" class="description"></div>
              </template>
            </el-form-item>
          </el-form>
        </el-collapse-item>
        <el-collapse-item title="Commodity information" name="2">
          <el-form
            ref="otherInfo"
            label-width="220px"
            size="small"
            class="price-form"
            :model="editForm"
            :rules="rules"
          >
            <el-collapse v-model="activeNames2" class="product-collapse">
              <el-collapse-item :title="String(item.istore_product_id)" :name="index" v-for="(item, index) in editForm.product_info" :key="index">
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="istore Product ID">
                      <p>{{ item.istore_product_id }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="库存">
                      <p>{{ item.quantity }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="运输方式">
                      <p>{{ item.shipping_method }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <!--<el-form-item :label="`运费(${item.currency_code})`">-->
                    <el-form-item :label="`运费(CNY)`">
                      <p>{{ item.shipping_costs }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="`保本价(${item.currency_code})`">
                      <p>{{ item.base_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="`售价(${item.currency_code})`">
                      <p>{{ item.discount_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="`原价(${item.currency_code})`">
                      <p>{{ item.discount_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="毛利率(%)">
                      <p>{{ item.gross_margin }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="打包费(CNY)">
                      <p>{{ item.parcel_processing_fee }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="汇率">
                      <p>{{ item.currency_rate }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="平台佣金率(%)">
                      <p>{{ item.commission }}</p>
                    </el-form-item>
                  </el-col>
                  <template v-if="item.specifics && item.specifics.length">
                    <el-col :xs="24" :sm="24" :md="24" :lg="24" v-for="(spec,specInd) in item.specifics" :key="specInd">
                      <el-form-item :label="spec.istore_attribute_name"
                                    :prop="`product_info.${index}.specifics.${specInd}.istore_attribute_value`"
                                    :rules="rules.specifics"
                      >
                        <template v-if="is_edit&&![120].includes(Number(editForm.status))">
                          <el-input v-model="spec.istore_attribute_value" size="mini" clearable></el-input>
                        </template>
                        <template v-else>
                          <p>{{ spec.istore_attribute_value }}</p>
                        </template>
                      </el-form-item>
                    </el-col>
                  </template>
                </el-row>
              </el-collapse-item>
            </el-collapse>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import editImage from './component/editImage'
//import istoreLogs from './component/istoreLogs'
import { advtEdit, editFillerData } from '@/api/jumia'

export default {
  name: 'VariationDetails',
  components: {
    // istoreLogs
    editImage,
    Tinymce
  },
  props: {
    detailData: {
      type: Object,
      required: true,
      default: () => {
      }
    }
  },
  data() {
    let val_name = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('广告名称不能为空'))
      }
      if (value.length > 255) {
        return callback(new Error('广告名称字符数不能大于255'))
      }
      console.log(value)
      callback()
    }
    let val_description = (rule, value, callback) => {
      let trimVal = value.replace(/<[^>]+>|&nbsp;+|\s+/g, '')
      trimVal = trimVal.replace(/&[a-z]+;/g, '*')
      if (trimVal.length === 0) {
        return callback(new Error('描述不能为空或全为空格或空行'))
      }
      if (value.length < 150 || value.length > 25000) {
        return callback(new Error('描述限制在155-25000个字符'))
      }
      callback()
    }
    let val_basicSpecifics = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('此区分项不能为空'))
      }
      let arr = []
      this._.forEach(this.editForm.product_info, (productinfo) => {
        this._.forEach(productinfo.specifics, (specifics) => {
          arr.push(specifics.istore_attribute_value)
        })
      })
      if (this._.uniq(arr).length < arr.length) {
        return callback(new Error('区分项不能重复'))
      }
      callback()
    }
    return {
      advt_id: this.$route.params.id,
      activeName: 'first',
      activeNames: ['1', '2'],
      activeNames2: ['1'],
      labelWidth: '180px',
      pictureList: [],
      editForm: undefined,//拷贝的对象
      is_edit: false,
      canEdit: true,//图片可添加，
      istorePictures: [],
      category: [],//选择的目录
      categoryList: undefined,//获取的目录
      categoryProps: {
        value: 'category_id',
        label: 'name',
        children: '_child'
      },//目录参数
      defaultProps: {
        originalKey: 'image_path',
        thumbnailKey: 'product_image_thumb'
      },
      rules: {
        name: [{ required: true, validator: val_name, trigger: 'blur' }],
        description: [{ required: true, validator: val_description, trigger: 'blur' }],
        specifics: [{ required: true, validator: val_basicSpecifics, trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.setImageWidth()
    console.log(this.detailData)
  },
  methods: {
    toggleEdit() {
      if (this.is_edit) {
        const categoryChange = () => {
          if (this.category.length) {
            if (Number(this.category[this.category.length - 1]) === Number(this.editForm.category_id)) {
              return true
            }
          }
          return false
        }
        const detal = JSON.parse(sessionStorage.getItem('copyData'))
        if (this._.isEqual(detal, this.editForm) && !categoryChange()) {
          this.$confirm('广告没有发生任何更改,请重新编辑', '提示', {
            confirmButtonText: '重新编辑',
            cancelButtonText: '放弃修改',
            closeOnClickModal: false,
            closeOnPressEscape: false,
            type: 'warning'
          }).then(() => {
            document.querySelector('.el-input__inner').focus()
          }).catch(() => {
            this.is_edit = false
          })
        } else {
          this.handleButtonChange()
        }
      } else {
        // 编辑
        this.is_edit = true
        this.getEdit()
      }
    },
    handleButtonChange() {
      const checkAttr = new Promise((resolve, reject) => {
        this.$refs['editForm'].validate((valid) => {
          if (valid) {
            resolve()
          } else {
            reject('标题，描述，属性有错误')
          }
        })
      })
      const description = new Promise((resolve, reject) => {
        this.$refs['otherInfo'].validate((valid) => {
          if (valid) {
            resolve()
          } else {
            reject('区分项有错误')
          }
        })
      })
      const checkOther = new Promise((resolve, reject) => {
        console.log(this.editForm.images)
        if (!this.editForm.images.length || this.editForm.images.length > 8) {
          this.$message.error('主图最多选择8张图片')
          reject('主图最多选择8张图片')
        } else {
          resolve()
        }
      })
      Promise.all([checkAttr, description, checkOther]).then((res) => {
        console.log(res)
        const loading = this.$loading({
          lock: true,
          text: '保存中',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.5)'
        })
        advtEdit(this.formatEditData()).then(() => {
          loading.close()
          this.is_edit = false
          this.$emit('reload')
        }).catch(err => {
          loading.close()
        })
      }).catch((err) => {
        console.log(err)
      })
    },
    formatEditData() {
      const categoryChange = () => {
        if (this.category.length) {
          if (Number(this.category[this.category.length - 1]) === Number(this.editForm.category_id)) {
            return this.editForm.category_id
          } else {
            return this.category[this.category.length - 1]
          }
        } else {
          return this.editForm.category_id
        }
      }

      const formatSpec = () => {
        const arr = []
        const obj = {
          istore_product_id: this.editForm.istore_product_id,
          content: {}
        }
        this.editForm.attributes.map(v => {
          obj.content[v.attribute_name] = v.value.trim() || ''
        })
        arr.push(obj)
        this.editForm.product_info.map(v => {
          const obj = {
            istore_product_id: v.istore_product_id,
            content: {}
          }
          v.specifics.map(v1 => {
            obj.content[v1.istore_attribute_name] = v1.istore_attribute_value.trim() || ''
          })
          arr.push(obj)
        })
        return arr
      }

      const params = {
        'advt_id': this.editForm.advt_id,
        'product_id': this.editForm.product_id,
        'account_id': this.editForm.account_id,
        'isJson': true,//以json提交数据
        'data': {}
      }
      params.data.title = [{
        'istore_product_id': this.editForm.istore_product_id,
        'content': this.editForm.name.trim()
      }]
      params.data.category = [{
        'istore_product_id': this.editForm.istore_product_id,
        'content': categoryChange()
      }]
      params.data.images = [{
        'istore_product_id': this.editForm.istore_product_id,
        'content': this.editForm.images.map((v) => {
          return {
            'image_path': v.image_path,
            'thumb_image_path': v.product_image_thumb ? v.product_image_thumb : v.image_path
          }
        })
      }]
      params.data.description = [{
        'istore_product_id': this.editForm.istore_product_id,
        'content': {
          'description': this.editForm.description // 描述
        }
      }]
      params.data.specifics = formatSpec()
      return params
    },
    setImageWidth() {
      const imgArr = (document.querySelectorAll('.description>img'))
      imgArr.forEach(item => {
        item.setAttribute('width', '50%')
      })
    },
    formatAttr(attr) {
      this._.forEach(attr, v => {
        v.value = ''
      })
      return attr
    },
    // 重新拉取属性信息
    categoryChange() {
      if (this.category.length) {
        const loading = this.$loading({
          lock: true,
          text: '努力加载中',
          background: 'rgba(0, 0, 0, 0.5)'
        })
        const params = {
          advt_id: this.editForm.advt_id,
          account_id: this.editForm.account_id,
          istore_product_id: this.editForm.istore_product_id,
          product_id: this.editForm.product_id,
          category_id: this.category[this.category.length - 1],
          type: ['attribute']
        }
        editFillerData(params).then(res => {
          loading.close()
          this.editForm.attributes = this.formatAttr(res.data.attribute)
        }).catch(e => {
          loading.close()
          this.is_edit = false
          this.$message.error(e)
        })
      }
    },
    //请求istore图片和目录
    getEdit() {
      const loading = this.$loading({
        lock: true,
        text: '努力加载中',
        background: 'rgba(0, 0, 0, 0.5)'
      })
      const params = {
        advt_id: this.editForm.advt_id,
        account_id: this.editForm.account_id,
        istore_product_id: this.editForm.istore_product_id,
        type: ['images', 'category']
      }
      editFillerData(params).then(res => {
        this.categoryList = res.data.category
        this.istorePictures = res.data.images[0].content
      }).catch(e => {
        this.$message.error(e)
      }).finally(() => {
        loading.close()
      })
    },
    // 图片更新,主产品图片
    updateImages(list) {
      if (list) {
        this.editForm.images = list
      }
    },
    //属性校验
    basicInforules(attrs) {
      return (rule, value, callback) => {
        if (attrs.is_required === 1 && !value) {
          return callback(new Error('此属性名称不能为空'))
        }
        if (!attrs.options.length && attrs.max_length > 0) {
          if (value.length > attrs.max_length) {
            return callback(new Error(`此属性字符数不能大于${attrs.max_length}`))
          }
        }
        callback()
      }
    },
    //替换标题输入空格
    replaceSpace(value) {
      this.editForm.name = value.replace(/\s{2,}/g, ' ')
    },
    //初始化富文本
    setContent(content) {
      this.editForm.description = content
      sessionStorage.setItem('copyData', JSON.stringify(this.editForm))
    },
    // 编辑器校验调用
    onEditorBlur() {
      this.$refs['editForm'].validateField('description')
    }
  },
  computed: {
    //编辑按钮显示
    setEdit() {
      return [120, 140].includes(Number(this.detailData.status))
    },
    button_inner() {
      return this.is_edit ? '保存并更新' : '编辑'
    }
  },
  watch: {
    detailData: {
      deep: true,
      immediate: true,
      handler(val) {
        console.log(val)
        this.is_edit = false
        this.editForm = this._.cloneDeep(this.detailData)
        // this.resetForm = this._.cloneDeep(this.detailData)
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss">
.tip-color {
  color: #E6A23C;
  line-height: 30px;
  font-size: 14px;
  background-color: transparent !important;
}
</style>
<style rel="stylesheet/scss" lang="scss" scoped>
.el-form-item {
  ::v-deep.el-form-item__error {
    background-color: transparent !important;
  }
}

.attr-row {
  div {
    text-align: center;

    &.bg-border {
      border-right: 1px solid #fff;
    }
  }
}

.attr-row.el-row {
  border-bottom: 1px solid #fff;

  &:last-child {
    border: none;
  }
}
</style>
