<template>
  <div>
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="Basic Information" name="first">
        <div>
          <div class="header-box">
            <label class="title">Basic Information(Normal)</label>
            <el-row class="right-row">
              <el-button v-permission="permissions.edit" v-show="!isEdit && canEdit" type="primary" size="mini" @click="toggleEdit(true)">编辑</el-button>
              <el-button v-show="isEdit" type="success" size="mini" @click="saveEdit">保存</el-button>
              <el-button v-show="isEdit" type="secondary" size="mini" @click="toggleEdit(false)">取消保存</el-button>
              <el-button v-debounce type="primary" size="mini" @click="openLog">日志</el-button>
            </el-row>
          </div>
          <!--内容区-->
          <div class="content-box detail-form" style="padding-top: 0">
            <el-collapse v-model="activeNames">
              <el-collapse-item title="错误信息" v-if="cloneData.error_log_message && canEdit" name="0">
                <div class="error-tip" v-if="cloneData.error_log_message && canEdit">
                  错误信息: {{ cloneData.error_log_message }}
                </div>
              </el-collapse-item>
              <el-collapse-item title="Listing Information" name="1">
                <el-form
                  :label-width="labelWidth"
                  size="small"
                  class="information-form"
                  :model="cloneData.product_info.description"
                  ref="infoForm"
                  :rules="rule"
                >
                  <el-row>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                      <el-form-item label="广告ID">
                        <p>{{ cloneData.advt_id }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                      <el-form-item label="Status">
                        <p>{{ cloneData.status_name }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="24" :lg="24">
                      <el-form-item label="英文标题" prop="title">
                        <div class="no-back-ground" v-if="isEdit && canEditEnglishTitle">
                          <el-input v-model="cloneData.product_info.description.title" size="mini" clearable></el-input>
                          <div class="tip pt-2"><i class="el-icon-info"></i>请输入英语标题</div>
                        </div>
                        <p v-else>{{ cloneData.product_info.description.title.replace(/\s/g, '&nbsp;') }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="24" :lg="24">
                      <el-form-item label="小语种标题" class="is-required-attr">
                        <div class="no-back-ground" v-if="isEdit && canEditOtherTitle">
                          <el-input v-model="cloneData.product_info.description.small_language_title" size="mini" clearable></el-input>
                          <div class="tip pt-2"><i class="el-icon-info"></i>请输入小语种标题</div>
                        </div>
                        <p v-else>{{ cloneData.product_info.description.small_language_title.replace(/\s/g, '&nbsp;') }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                      <el-form-item label="总重(KG)">
                        <p>{{ cloneData.product_info.total_weight }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                      <el-form-item label="库存">
                        <p>{{ cloneData.product_info.quantity }}</p>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item label="目录">
                      <p>{{ `${ cloneData.category_name } [${ cloneData.category_id }]` }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24" v-if="canEditEnglishTitle && isEdit">
                    <el-form-item label="选择新目录">
                      <div class="no-back-ground">
                        <el-cascader
                          placeholder="请选择目录"
                          :props="categoryProps"
                          :options="categoryList"
                          :filterable="true"
                          style="width:100%"
                          v-model="category"
                          @change="categoryChange"
                        ></el-cascader>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item label="属性" v-if="cloneData.product_info.single_attribute && cloneData.product_info.single_attribute">
                      <el-form-item label-width="280px" v-for="(attr,attrInd) in cloneData.product_info.single_attribute" :label="attr.key" :key="attrInd" :class="attr.required ? 'is-required-attr': ''">
                        <!--          可输入可选择类型              -->
                        <div v-if="attr.value_type === 'string' && attr.choice_value.length" style="display: inline-block">
                          <el-select
                            :disabled="!isEdit || !canEdit"
                            size="mini"
                            clearable
                            v-model="attr.key_value"
                            @change="attributeSelectChange($event,attr)"
                            style="width:300px;"
                          >
                            <el-option v-for="(option,optInd) in attr.choice_value" :label="option.name" :value="option.name" :key="optInd"></el-option>
                          </el-select>
                          <el-input
                            :disabled="!isEdit || !canEdit"
                            v-if="['string','number','number_unit'].includes(attr.value_type)"
                            size="mini"
                            v-model="attr.unit_value"
                            @change="attributeInputChange($event,attr)"
                            style="width:300px;"
                            clearable
                          ></el-input>
                        </div>
                        <!--                        仅可选择类型-->
                        <div v-if="['list','boolean'].includes(attr.value_type)" style="display: inline-block">
                          <el-select
                            :disabled="!isEdit || !canEdit"
                            size="mini"
                            clearable
                            v-model="attr.key_value"
                            style="width:300px;"
                          >
                            <el-option v-for="(option,optInd) in attr.choice_value" :label="option.name" :value="option.name" :key="optInd"></el-option>
                          </el-select>
                        </div>
                        <!--                        仅可输入类型-->
                        <div v-if="(attr.value_type === 'string' && !attr.choice_value.length) || attr.value_type === 'number'" style="display: inline-block">
                          <el-input
                            :disabled="!isEdit || !canEdit"
                            size="mini"
                            v-model="attr.unit_value"
                            style="width:300px;"
                            clearable
                          ></el-input>
                        </div>
                        <!--                        带单位数值类型-->
                        <div v-if="attr.value_type === 'number_unit'" style="display: inline-block">
                          <el-input
                            :disabled="!isEdit || !canEdit"
                            v-if="['string','number','number_unit'].includes(attr.value_type)"
                            size="mini"
                            v-model="attr.unit_value"
                            style="width:300px;"
                            clearable
                          ></el-input>
                          <el-select
                            :disabled="!isEdit || !canEdit"
                            v-if="attr.value_type === 'number_unit'"
                            size="mini"
                            clearable
                            v-model="attr.key_value"
                            style="width:300px;"
                          >
                            <el-option v-for="(option,optInd) in attr.choice_value" :label="option.name" :value="option.name" :key="optInd"></el-option>
                          </el-select>
                        </div>
                        <span class="tip attr-tip" v-if="isEdit">
                          <span v-if="attr.value_type === 'string' && attr.choice_value && attr.choice_value.length">
                            <i class="el-icon-info"></i>
                            支持选择或自定义输入，自定义输入值优先。输入值类型为任意字符串
                          </span>
                          <span v-if="['number','number_unit'].includes(attr.value_type)">
                            <i class="el-icon-info"></i>
                            支持输入正整数，有单位选项时必须选择单位
                          </span>
                        </span>
                      </el-form-item>
                    </el-form-item>
                  </el-col>
                </el-form>
              </el-collapse-item>
              <el-collapse-item title="Commodity information" name="2">
                <el-form
                  label-width="220px"
                  size="small"
                  class="price-form"
                  :model="cloneData.product_info"
                  ref="priceForm"
                  :rules="priceRules"
                >
                  <el-row>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                      <el-form-item label="iStore 产品ID">
                        <p>{{ cloneData.product_info.istore_product_id }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                      <el-form-item label="Site Code">
                        <p>{{ cloneData.account_name }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                      <el-form-item label="保本价(USD)">
                        <p>{{ cloneData.product_info.base_price }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                      <el-form-item label="原价(USD)">
                        <p>{{ cloneData.product_info.total_price }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                      <el-form-item label="平台佣金(%)">
                        <p>{{ cloneData.product_info.commission }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                      <el-form-item label="运输方式">
                        <p>{{ cloneData.product_info.shipping_method }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                      <el-form-item label="运费">
                        <p>{{ cloneData.product_info.shipping_costs }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                      <el-form-item label="包装费(CNY)">
                        <p>{{ cloneData.product_info.parcel_processing_fee }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                      <el-form-item label="汇率">
                        <p>{{ cloneData.product_info.currency_rate }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                      <el-form-item label="当前价格类型">
                        <p>{{ price_type[cloneData.product_info.price_type] }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                      <el-form-item label="iStore价格(USD)">
                        <p>{{ cloneData.product_info.discount_price }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                      <el-form-item label="当前售价(USD)" prop="current_price">
                        <el-input v-if="canEditPrice && isEdit" size="mini" clearable v-model="cloneData.product_info.current_price"></el-input>
                        <p v-else>{{ cloneData.product_info.current_price }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                      <el-form-item label="iStore毛利率(%)">
                        <p>{{ cloneData.product_info.gross_margin }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                      <el-form-item label="当前毛利率(%)" prop="current_gross_margin">
                        <el-input v-if="canEditPrice && isEdit" size="mini" clearable v-model="cloneData.product_info.current_gross_margin"></el-input>
                        <p v-else>{{ cloneData.product_info.current_gross_margin }}</p>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-form-item label="图片">
                    <template>
                      <div style="padding-right: 50px;">
                        <picture-view
                          v-if="cloneData.product_info.images.length && !isEdit"
                          :pictureList="cloneData.product_info.images"
                          :defaultProps="defaultProps"
                          :width="100"
                          :height="100"
                          :spaceBetween="6"
                          :thumbnailWidth="80"
                          :thumbnailHeight="80"
                        ></picture-view>
                        <edit-image
                          v-if="isEdit && canEdit"
                          :pictureList="cloneData.product_info.images"
                          :is-edit="isEdit"
                          :pictures="istorePictures[0] ? istorePictures[0].content : []"
                          :max-length="12"
                          :default-props="defaultProps"
                          :picture-key="'image_path'"
                          :thumb-url="'thumb_image_path'"
                          @emit-update-pictureList="updateImages"
                        ></edit-image>
                      </div>
                      <p v-if="isEdit && canEdit" class="no-back-ground tip pt-5"><i class="el-icon-info"></i>第一张为主图，最多上传12张</p>
                    </template>
                  </el-form-item>
                  <el-form-item label="英文描述" class="is-required-attr">
                    <div class="no-back-ground">
                      <el-input
                        :class="isEdit && canEditEnglishTitle ? '' : 'hidden-input-style'"
                        :readonly="!isEdit || !canEditEnglishTitle" type="textarea"
                        :autosize="{ minRows: 8, maxRows: 100 }"
                        v-model="cloneData.product_info.description.description"
                        class="description"
                      ></el-input>
                      <div class="tip pt-5" v-if="isEdit && canEdit"><i class="el-icon-info"></i>请输入英语描述，且必须为纯文本</div>
                    </div>
                  </el-form-item>
                  <el-form-item label="小语种描述" class="is-required-attr">
                    <div class="no-back-ground">
                      <el-input
                        :class="isEdit && canEditOtherTitle ? '' : 'hidden-input-style'"
                        :readonly="!isEdit || !canEditOtherTitle"
                        type="textarea"
                        :autosize="{ minRows: 8, maxRows: 100 }"
                        v-model="cloneData.product_info.description.small_language_description"
                        class="description"
                      ></el-input>
                      <div class="tip pt-5" v-if="isEdit && canEditOtherTitle"><i class="el-icon-info"></i>请输入小语种描述，且必须为纯文本</div>
                    </div>
                  </el-form-item>
                </el-form>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <istore-log v-bind.sync="logOptions"></istore-log>
  </div>

  <!-- <el-tab-pane label="日志" name="second">
    <istore-logs :advtId="advt_id"></istore-logs>
  </el-tab-pane> -->
</template>

<script>
import istoreLog from '../components/istoreLog'
import editImage from './component/editImage'
import { editDetail, getEditData, fetchDetail } from '@/api/mercadolibre.gs'

export default {
  name: 'SingleDetails',
  components: { istoreLog, editImage },
  props: {
    detailData: {
      type: Object,
      required: true,
      default: () => {
      }
    }
  },
  data() {
    const checkName = (rule, value, callback) => {
      if (!value.trim()) {
        callback(new Error('标题不能为空'))
        return
      }
      // if (value.trim().length > 140) {
      //   callback(new Error('标题最多输入140字符'))
      //   return
      // }
      callback()
    }
    const checkPrice = (rule, value, callback) => {
      if (!String(value).trim()) {
        callback(new Error('指定价不能为空'))
        return
      }
      if (!/^\d+(\.\d*)?$/.test(value)) {
        callback(new Error('请输入正确格式的指定价'))
        return
      }
      callback()
    }
    const checkGross = (rule, value, callback) => {
      if (!String(value).trim()) {
        callback(new Error('毛利率不能为空'))
        return
      }
      if (!/^[1-9]\d?$|^100$/.test(value) || Number(value) === 0) {
        callback(new Error('毛利率只能输入1-100之间的正整数'))
        return
      }
      callback()
    }
    return {
      permissions: {
        edit: 'mercadolibre.advt.advt.edit'
      },
      price_type: {
        10: 'iStore价格',
        20: '动态调整价',
        30: '指定价',
        40: '指定毛利率',
        50: '跟卖价'
      },
      category: [],
      categoryProps: {
        value: 'category_id',
        label: 'name',
        children: '_child'
      },
      categoryList: [],
      priceRules: {
        current_price: [{ required: true, validator: checkPrice, trigger: ['blur', 'change'] }],
        current_gross_margin: [{ required: true, validator: checkGross, trigger: ['blur', 'change'] }]
      },
      rule: {
        // title: [{ required: true, validator: checkName, trigger: ['change', 'blur'] }]
      },
      cloneData: {},
      istorePictures: [],
      canEdit: false,
      canEditOtherTitle: false,
      canEditEnglishTitle: false,
      canEditPrice: false,
      isEdit: false,
      logOptions: {
        open: false,
        advtId: ''
      },
      advt_id: this.$route.params.id,
      activeName: 'first',
      activeNames: ['0', '1', '2'],
      labelWidth: '220px',
      pictureList: [],
      defaultProps: {
        originalKey: 'image_path',
        thumbnailKey: 'thumb_image_path'
      }
    }
  },
  created() {
    // 是否是可编辑状态 Active ==130、Paused=140、Upload Error==150、Publish Error == 160 状态产品详情页新增编辑功能
    // active paused uploadError publishError 可编辑图片、属性、区分项字段
    // active paused 状态下可编辑小语种标题、小语种描述、
    // uploadError publishError 状态下可编辑 目录、英语标题、英语描述
    // publishError 状态下可编辑 价格、毛利率
    this.canEdit = [130, 140, 150, 160].includes(Number(this.detailData.status))
    this.canEditOtherTitle = [130, 140].includes(Number(this.detailData.status))
    this.canEditEnglishTitle = [150, 160].includes(Number(this.detailData.status))
    this.canEditPrice = Number(this.detailData.status) === 160
    this.detailData.product_info.single_attribute = this.formatAttr(this.detailData.product_info.single_attribute)
    this.cloneData = this._.cloneDeep(this.detailData)
    sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
  },
  methods: {
    attributeInputChange(val, attr) {
      let select_value = ''
      if (val) {
        attr.choice_value.map(v => {
          if (v.name.toLowerCase() === val.trim().toLowerCase()) {
            select_value = v.name
          }
        })
        attr.key_value = select_value
      }
    },
    attributeSelectChange(val, attr) {
      if (val) {
        attr.unit_value = val
      }
    },
    formatAttr(arr) {
      // number_unit格式处理
      return arr.map(v => {
        let obj = JSON.parse(JSON.stringify(v))
        if (v.value_type === 'number_unit' && v.key_value) {
          obj.key_value = obj.key_value.split(' ')[1]
          obj.unit_value = v.key_value.split(' ')[0]
        } else if (v.value_type === 'string' && v.choice_value && v.choice_value.length && v.key_value) {
          obj.key_value = ''
          v.choice_value.map(v1 => {
            if (v1.name.toLowerCase() === v.key_value.toLowerCase()) {
              obj.key_value = v.key_value
            }
          })
          obj.unit_value = v.key_value
        } else {
          obj.unit_value = v.key_value ? v.key_value : ''
        }
        return obj
      })
    },
    categoryChange() {
      if (this.category.length) {
        const loading = this.$loading({
          lock: true,
          text: '努力加载中',
          background: 'rgba(0, 0, 0, 0.5)'
        })
        const params = {
          advt_id: this.detailData.advt_id,
          account_id: this.detailData.account_id,
          istore_product_id: this.detailData.product_info.istore_product_id,
          product_id: this.detailData.product_id,
          category_id: this.category[this.category.length - 1],
          type: ['attribute']
        }
        getEditData(params).then(res => {
          loading.close()
          // 选中目录为单品目录时赋值，为vari类型时提示并清空当前目录
          if (res.data.attribute.category_type.includes('single')) {
            this.cloneData.product_info.single_attribute = this.formatAttr(res.data.attribute.single_attribute)
          } else {
            this.$message.error('该目录不支持创建normal类型广告，请重新选择')
            this.category = []
          }
        }).catch(e => {
          loading.close()
          this.$message.error(e)
        })
      }
    },
    refreshDetail() {
      const loading = this.$loading({
        lock: true,
        text: '努力加载中',
        background: 'rgba(0, 0, 0, 0.5)'
      })
      fetchDetail(this.$route.params.id).then(res => {
        const data = res.data
        this.canEdit = [130, 140, 150, 160].includes(Number(data.status))
        this.canEditOtherTitle = [130, 140].includes(Number(data.status))
        this.canEditEnglishTitle = [150, 160].includes(Number(data.status))
        this.canEditPrice = Number(data.status) === 160
        data.product_info.single_attribute = this.formatAttr(data.product_info.single_attribute)
        this.cloneData = this._.cloneDeep(data)
        sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
        setTimeout(() => {
          loading.close()
        }, 800)
      }).catch(() => {
        loading.close()
      })
    },
    // 图片更新
    updateImages(list) {
      this.cloneData.product_info.images = list
    },
    saveEdit() {
      // 保存编辑数据
      // 产品数据是否发生改变
      // 分类目录是否改变
      const categoryChange = () => {
        if (!this.category.length) {
          return false
        } else {
          if (this.category[this.category.length - 1] === this.cloneData.category_id) {
            return false
          }
          return true
        }
      }
      if (this._.isEqual(JSON.stringify(this.cloneData), sessionStorage.getItem('copyData')) && !categoryChange()) {
        this.$message.warning('该广告数据未发生改变')
      } else {
        const checkOther = new Promise((resolve, reject) => {
          // 主图是否为空
          if (!this.cloneData.product_info.images.length) {
            reject('主图不能为空')
          }
          if ((!this.cloneData.product_info.description.title.trim().length || this.cloneData.product_info.description.title.trim().length > 60) && this.canEditEnglishTitle) {
            reject('英文标题不能为空且最多输入60字符')
          }
          if (!this.cloneData.product_info.description.description.trim().length && this.canEditEnglishTitle) {
            reject('英文描述不能为空')
          }
          if ((!this.cloneData.product_info.description.small_language_title.trim().length || this.cloneData.product_info.description.small_language_title.trim().length > 60) && this.canEditOtherTitle) {
            reject('小语种标题不能为空且最多输入60字符')
          }
          if (!this.cloneData.product_info.description.small_language_description.trim().length && this.canEditOtherTitle) {
            reject('小语种描述不能为空')
          }
          resolve()
        })
        // const checkForm = new Promise((resolve, reject) => {
        //   this.$refs['infoForm'].validate(v => {
        //     if (v) {
        //       resolve()
        //     }
        //     reject('Listing Information区域字段不合法，请输入正确格式！')
        //   })
        // })
        const checkPriceForm = new Promise((resolve, reject) => {
          this.$refs['priceForm'].validate(v => {
            if (v) {
              resolve()
            }
            reject('Commodity information区域字段不合法，请输入正确格式')
          })
        })
        // 属性检测
        const checkAttr = new Promise((resolve, reject) => {
          this.cloneData.product_info.single_attribute.forEach(v => {
            // 必填验证
            if (v.required && (!v.key_value.trim() && !v.unit_value.trim())) {
              reject('必填属性不能为空')
            }
            if (['number', 'number_unit'].includes(v.value_type) && v.unit_value && !(/^[1-9]\d*$/.test(v.unit_value))) {
              reject('数值类型只支持输入正整数')
            }
            if (['number_unit'].includes(v.value_type) && !v.key_value && (v.unit_value || v.key_value)) {
              reject('数值类型有单位必须选择单位')
            }
          })
          resolve()
        })
        Promise.all([checkPriceForm, checkAttr, checkOther]).then(res => {
          const loading = this.$loading({
            lock: true,
            text: '保存中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.5)'
          })
          editDetail(this.formatEditData()).then(() => {
            loading.close()
            this.isEdit = false
            this.refreshDetail()
          }).catch(err => {
            loading.close()
          })
        }).catch(err => {
          this.$message.warning(err)
        })
      }
    },
    formatEditData() {
      try {
        const that = this

        function formatAllImages() {
          const arr = []
          // 主图obj
          const obj = {
            istore_product_id: that.cloneData.product_info.istore_product_id,
            content: that.cloneData.product_info.images.map(v => {
              return {
                image_path: v.image_path,
                thumb_image_path: v.product_image_thumb ? v.product_image_thumb : v.image_path
              }
            })
          }
          arr.push(obj)
          return arr
        }

        function formatSpec() {
          const arr = []
          const obj = {
            istore_product_id: that.cloneData.product_info.istore_product_id,
            content: {}
          }
          that.cloneData.product_info.single_attribute.forEach(v => {
            if (v.key_value || v.unit_value) {
              if (v.value_type === 'number_unit') {
                obj.content[v.key] = `${ v.unit_value.trim() } ${ v.key_value }`
              } else if (v.value_type === 'string' && v.choice_value.length) {
                obj.content[v.key] = v.unit_value ? v.unit_value.trim() : v.key_value.trim()
              } else if (v.value_type === 'list' || v.value_type === 'boolean') {
                obj.content[v.key] = v.key_value ? v.key_value.trim() : ''
              } else {
                obj.content[v.key] = v.unit_value ? v.unit_value.trim() : ''
              }
            }
          })
          arr.push(obj)
          return arr
        }

        const istore_product_id = this.cloneData.product_info.istore_product_id
        const obj = {
          advt_id: this.cloneData.advt_id,
          account_id: this.cloneData.account_id,
          data: {
            title: [
              {
                // 小语种
                istore_product_id,
                content: {
                  en: this.cloneData.product_info.description.title.trim(),
                  small: this.cloneData.product_info.description.small_language_title.trim()
                }
              }
            ],
            description: [
              // 小语种描述
              {
                istore_product_id,
                content: {
                  en: this.cloneData.product_info.description.description.trim(),
                  small: this.cloneData.product_info.description.small_language_description.trim()
                }
              }
            ],
            images: formatAllImages(),
            category: [
              {
                istore_product_id,
                content: this.category.length ? this.category[this.category.length - 1] : this.cloneData.product_info.category_id
              }
            ],
            specifics: formatSpec()
          }
        }
        // 可编辑价格且价格或毛利率修改
        const oldData = JSON.parse(sessionStorage.getItem('copyData'))
        if (this.canEditPrice && (this.cloneData.product_info.current_price !== oldData.product_info.current_price || this.cloneData.product_info.current_gross_margin !== oldData.product_info.current_gross_margin)) {
          obj.data.price = [
            {
              istore_product_id,
              content: {
                custom_price: this.cloneData.product_info.current_price,
                custom_gross_margin: this.cloneData.product_info.current_gross_margin
              }
            }]
        }
        return obj
      } catch (e) {
        console.log(e)
      }
    },
    // 切换编辑状态
    toggleEdit(val) {
      if (!val) {
        // 清除表单验证
        this.$refs['infoForm'].clearValidate()
        this.$refs['priceForm'].clearValidate()
        this.cloneData = JSON.parse(sessionStorage.getItem('copyData'))
        this.isEdit = false
      } else {
        // 拉取编辑数据
        this.getEdit()
      }
    },
    getEdit() {
      const loading = this.$loading({
        lock: true,
        text: '努力加载中',
        background: 'rgba(0, 0, 0, 0.5)'
      })
      const params = {
        advt_id: this.detailData.advt_id,
        account_id: this.detailData.account_id,
        istore_product_id: this.detailData.product_info.istore_product_id,
        product_id: this.detailData.product_id,
        type: ['images', 'category']
      }
      getEditData(params).then(res => {
        loading.close()
        this.isEdit = true
        this.categoryList = res.data.category
        this.istorePictures = res.data.images
      }).catch(e => {
        this.$message.error(e)
        loading.close()
      })
    },
    openLog() {
      this.logOptions = {
        open: true,
        advtId: this.$route.params.id
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.error-tip {
  color: #F56C6C;
  margin-bottom: 5px;
}

.attr-more-click {
  cursor: pointer;
  font-size: 12px;
  color: #409EFF;
  padding: 5px;
  text-align: center;
}
</style>
<style rel="stylesheet/scss" lang="scss">
.detail-form .hidden-input-style {
  textarea {
    border: 0 !important;
    background: #ebeef5 !important;
  }
}

.detail-form {
  .is-required-attr {
    .el-form-item__label:before {
      content: "*";
      color: #F56C6C;
      margin-right: 4px;
    }
  }
}

.detail-form .tip {
  background: #fff !important;
  font-size: 12px;
  color: #909399;
  min-height: 12px !important;
  line-height: 12px;
}

.detail-form .el-form-item__error {
  background: #fff !important;
}

.detail-form .information-form .el-form-item .el-form-item__content .no-back-ground {
  background: #fff !important;
}

.detail-form .pt-5 {
  padding-top: 5px;
}

.detail-form .pt-2 {
  padding-top: 2px;
}

.detail-form .el-select--mini {
  padding: 0 !important;
}

.detail-form .attr-tip {
  color: #cf9236;
  background: #EBEEF5 !important;
}

.detail-form .el-input.is-disabled .el-input__inner {
  color: #444;
}
</style>
