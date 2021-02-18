<template>
  <div>
    <div class="header-box">
      <label class="title">Basic Information(variation)</label>
      <el-row class="right-row">
        <el-button v-permission="permissions.edit" v-show="canEdit && !isEdit" type="primary" size="mini" @click="toggleEdit(true)">编辑</el-button>
        <el-button v-show="canEdit && isEdit" type="success" size="mini" @click="saveEdit">保存</el-button>
        <el-button v-show="canEdit && isEdit" type="secondary" size="mini" @click="toggleEdit(false)">取消保存</el-button>
        <el-button type="primary" size="mini" @click="openLog(cloneData.advt_id)">日志</el-button>
      </el-row>
    </div>
    <!--内容区-->
    <div class="content-box detail-form" style="padding-top: 0">
      <el-collapse v-model="activeNames">
        <el-collapse-item title="Listing Information" name="1">
          <el-form
            :label-width="labelWidth"
            size="small"
            class="information-form"
          >
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="account name">
                  <p>{{ cloneData.account_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="广告ID">
                  <p>{{ cloneData.advt_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Product ID">
                  <p>{{ cloneData.istore_product_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="广告状态">
                  <p>{{ cloneData.status_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="广告类型">
                  <p>{{ cloneData.type_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Manufacturer">
                  <p>{{ cloneData.manufacturer }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Shipping Method">
                  <p>{{ cloneData.shipping_method || '无' }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="Category">
                  <p>{{ `${ cloneData.category_name } [${ cloneData.category_id }]` }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24" v-if="canEditCategory && isEdit">
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
            </el-row>
          </el-form>
        </el-collapse-item>
        <el-collapse-item title="Commodity information" name="2">
          <el-collapse v-model="activeNames2" class="product-collapse">
            <el-collapse-item :title="`${String(item.istore_product_id)} ${item.name ? `[${item.name}]`: ''}`" :name="index" v-for="(item, index) in cloneData.product_info" :key="index">
              <el-form
                :ref="'priceForm' + index"
                :model="item"
                :rules="priceFormRules"
                label-width="240px"
                size="small"
                class="price-form"
              >
                <el-row>
                  <div class="error-tip" v-if="item.error_log_message" style="padding: 10px 0;background: #EBEEF5;margin-left: -15px;padding-left: 8px;margin-bottom: 15px;">
                    错误信息: {{ item.error_log_message }}
                  </div>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24" v-if="item.error_log_message && canEdit">
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item label="Website Short Title" prop="name">
                      <div
                        class="no-back-ground"
                        v-if="isEdit && ((cloneData.advt_status === 120 && [100,120,170].includes(item.advt_status)) || cloneData.advt_status === 170 && [100,170].includes(item.advt_status))"
                      >
                        <el-input v-model="item.name" size="mini" clearable></el-input>
                        <div class="tip pt-2"><i class="el-icon-info"></i>请输入英语</div>
                      </div>
                      <p v-else>{{ item.name.replace(/\s/g, '&nbsp;') }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="Product ID(Seller Part#)">
                      <p>{{ item.istore_product_id }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="广告状态">
                      <p>{{ item.status_name }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="UPC">
                      <p>{{ item.upc }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="`保本价(${item.currency_code})`">
                      <p>{{ item.base_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="`原价(${item.currency_code})`">
                      <p>{{ item.total_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="`Selling Price(${item.currency_code})`">
                      <p>{{ item.discount_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="运输方式">
                      <p>{{ item.shipping_method }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="`运费(${item.currency_code})`">
                      <p>{{ item.shipping_costs }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="打包费(CNY)">
                      <p>{{ item.parcel_processing_fee }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="Gross Margin(%)">
                      <p>{{ item.gross_margin }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="汇率">
                      <p>{{ item.currency_rate }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="Commission Rate(%)">
                      <p>{{ cloneData.commission }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="Item Weight(g)">
                      <p>{{ item.total_weight }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="Item Dimensions(in.)">
                      <p>{{ `${ item.length } * ${ item.width } * ${ item.height }` }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="Inventory">
                      <p>{{ item.quantity }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="Packs Or Sets">
                      <p>{{ cloneData.packs_or_sets }}</p>
                    </el-form-item>
                  </el-col>
                  <!-- var区分项和属性值信息是一个值 -->
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <div
                      style="padding-left:240px;font-family: emoji;color:#cf9236;margin-bottom:10px;"
                      v-if="item.specifics_tip && isEdit && (item.attribute.specifics.length || item.attribute.attribute.length)"
                    >
                      <b>提示:&nbsp;</b>{{ item.specifics_tip }}
                    </div>
                    <el-form-item label="区分项" v-if="showAttr && item.attribute.specifics && item.attribute.specifics.length">
                      <el-form-item
                        v-for="(attr,ind) in item.attribute.specifics"
                        :label="attr.attribute_name"
                        :key="ind"
                        :class="attr.is_required ? 'is-required-attr': 'is-spec'"
                      >
                        <div style="display: flex; width:100%;">
                          <el-select
                            size="mini"
                            v-model="attr.select_value"
                            @change="attrSelectChange($event,attr)"
                            :disabled="!isEdit || (canEdit && isEdit && ![100,170].includes(item.advt_status))"
                            style="width:300px;"
                            clearable
                          >
                            <div v-if="attr.options && attr.options.length" class="attr-more-click" @click="openAttrDialog(attr,'specifics',index)">
                              查看更多属性信息
                              <i class="el-icon-info"></i>
                            </div>
                            <el-option v-for="(option,specIndex) in attr.options" :label="option" :value="option" :key="specIndex"></el-option>
                          </el-select>
                          <el-input v-model="attr.value" disabled size="mini" style="width:300px"></el-input>
                          <el-popover
                            placement="top-start"
                            width="400"
                            trigger="hover"
                          >
                            <div>
                              <span v-if="attr.is_required">所有<span style="color:#F56C6C;font-size:30px;line-height:14px;transform: translateY(13px);display: inline-block;">&nbsp;*&nbsp;</span>表示此项是必填，不可为空</span>
                              <span v-else>所有<span style="color:#409EFF;font-size:30px;line-height:14px;transform: translateY(13px);display: inline-block;">&nbsp;*&nbsp;</span>表示此项至少要填一项</span>
                            </div>
                            <el-button slot="reference" type="text"><i class="el-icon-question"></i></el-button>
                          </el-popover>
                        </div>
                      </el-form-item>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item label="属性" v-if="showAttr && item.attribute.attribute && item.attribute.attribute.length">
                      <el-form-item
                        v-for="(attr,ind) in item.attribute.attribute"
                        :label="attr.attribute_name"
                        :key="ind"
                        :class="attr.is_required ? 'is-required-attr': ''"
                      >
                        <div style="display: flex; width:100%;">
                          <el-select
                            size="mini"
                            v-model="attr.select_value"
                            @change="attrSelectChange($event,attr)"
                            :disabled="!isEdit || (canEdit && isEdit && ![100,170].includes(item.advt_status))"
                            style="width:300px;"
                            clearable
                          >
                            <div v-if="attr.options && attr.options.length" class="attr-more-click" @click="openAttrDialog(attr,'attribute',index)">
                              查看更多属性信息
                              <i class="el-icon-info"></i>
                            </div>
                            <el-option v-for="(option,attrInd) in attr.options" :label="option" :value="option" :key="attrInd"></el-option>
                          </el-select>
                          <el-input v-model="attr.value" disabled size="mini" style="width:300px;"></el-input>
                          <el-popover
                            v-if="attr.is_required"
                            placement="top-start"
                            width="400"
                            trigger="hover"
                          >
                            <div>
                              <span>所有<span style="color:#F56C6C;transform: translateY(13px);display: inline-block;font-size:30px;">&nbsp;*&nbsp;</span>表示此项是必填，不可为空</span>
                            </div>
                            <el-button slot="reference" type="text"><i class="el-icon-question"></i></el-button>
                          </el-popover>
                        </div>
                      </el-form-item>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="主图" class="is-required-attr">
                  <template>
                    <div style="padding-right:50px">
                      <picture-view
                        v-if="activeNames2.includes(index) && (!isEdit || (isEdit && !((cloneData.advt_status === 120 && [100,120,170].includes(item.advt_status)) || cloneData.advt_status === 170 && [100,170].includes(item.advt_status))))"
                        :pictureList="item.images"
                        :defaultProps="defaultProps"
                        :width="100"
                        :height="100"
                        :spaceBetween="6"
                        :thumbnailWidth="80"
                        :thumbnailHeight="80"
                      ></picture-view>
                      <edit-image
                        v-if="activeNames2.includes(index) && isEdit && ((cloneData.advt_status === 120 && [100,120,170].includes(item.advt_status)) || cloneData.advt_status === 170 && [100,170].includes(item.advt_status))"
                        :pictureList="item.images"
                        :is-edit="isEdit && canEdit"
                        :pictures="istorePictures.filter(v => Number(v.istore_product_id) === Number(item.istore_product_id))[0].content"
                        :max-length="7"
                        :default-props="defaultProps"
                        :picture-key="'image_path'"
                        :thumb-url="'product_image_thumb'"
                        :is-vari-child="index"
                        @emit-update-pictureList="updateImages"
                      ></edit-image>
                    </div>
                    <p v-if="isEdit && ((cloneData.advt_status === 120 && [100,120,170].includes(item.advt_status)) || cloneData.advt_status === 170 && [100,170].includes(item.advt_status))"
                       class="no-back-ground tip pt-5"
                    >
                      <i class="el-icon-info"></i>第一张为主图，最多可上传7张
                    </p>
                  </template>
                </el-form-item>
                <el-form-item label="Short Description" class="is-required-attr">
                  <div class="no-back-ground">
                    <el-input
                      :class="isEdit && ((cloneData.advt_status === 120 && [100,120,170].includes(item.advt_status)) || cloneData.advt_status === 170 && [100,170].includes(item.advt_status)) ? '' : 'hidden-input-style'"
                      :readonly="!isEdit || ![120,170].includes(cloneData.advt_status) || (cloneData.advt_status === 120 && ![100,120,170].includes(item.advt_status)) || (cloneData.advt_status === 170 && ![100,170].includes(item.advt_status))"
                      type="textarea"
                      :autosize="{ minRows: 8, maxRows: 100 }"
                      v-model="item.short_description"
                      class="description"
                    ></el-input>
                    <div class="tip pt-5"
                         v-if="isEdit && ((cloneData.advt_status === 120 && [100,120,170].includes(item.advt_status)) || cloneData.advt_status === 170 && [100,170].includes(item.advt_status))"
                    >
                      <i class="el-icon-info"></i>请输入英语
                    </div>
                  </div>
                </el-form-item>
                <el-form-item label="Product Description" class="is-required-attr">
                  <div class="no-back-ground"
                       v-if="isEdit && ((cloneData.advt_status === 120 && [100,120,170].includes(item.advt_status)) || cloneData.advt_status === 170 && [100,170].includes(item.advt_status))"
                  >
                    <tinymce
                      @set-content="setContent"
                      v-model="item.description"
                      :is-vari="index"
                      :height="400"
                      class="no-back-ground"
                    />
                    <div class="tip pt-5"><i class="el-icon-info"></i>请输入英语</div>
                  </div>
                  <div v-else v-html="item.description" class="description"></div>
                </el-form-item>
              </el-form>
            </el-collapse-item>
          </el-collapse>
        </el-collapse-item>
      </el-collapse>
    </div>
    <!--日志-->
    <istore-log v-bind.sync="logOptions"></istore-log>
    <!--    属性选择-->
    <attr-select v-bind.sync="attrOptions" @setAttr="setAttributes"></attr-select>
  </div>
</template>

<script>
import istoreLog from '../components/istoreLog'
import Tinymce from './component/Tinymce'
import editImage from './component/editImage'
import attrSelect from '@/views/newegg/advertising/detail/component/attrSelect'
import { editDetail, getEditData, fetchDetail } from '@/api/newegg'

export default {
  name: 'VariationDetails',
  components: { istoreLog, Tinymce, editImage, attrSelect },
  props: {
    detailData: {
      type: Object,
      required: true,
      default: () => {
      }
    }
  },
  data() {
    const checkTitle = (rule, value, callback) => {
      if (!value.trim()) {
        callback(new Error('标题不能为空！'))
        return
      }
      if (value.trim().length > 200) {
        callback(new Error('标题最多输入200字符'))
        return
      }
      callback()
    }
    return {
      // 120Active 170UploadError
      canEditChild: [120, 170],
      // 主产品120状态下除 120、180、190状态外都可以编辑属性，180 190 状态不可编辑
      permissions: {
        edit: 'newegg.advt.advt.edit'
      },
      showAttr: true,
      category: [],
      categoryProps: {
        value: 'category_id',
        label: 'name',
        children: '_child'
      },
      categoryList: [],
      priceFormRules: {
        name: [{ required: true, validator: checkTitle, trigger: ['blur', 'change'] }]
      },
      istorePictures: [],
      cloneData: {},
      canEdit: false,
      isEdit: false,
      canEditCategory: false,
      advt_id: this.$route.params.id,
      activeName: 'first',
      activeNames: ['0', '1', '2'],
      activeNames2: [0],
      labelWidth: '240px',
      defaultProps: {
        originalKey: 'image_path',
        thumbnailKey: 'product_image_thumb'
      },
      priceForm: {
        smallAmount: 'N',
        shippingTableData: [
          {
            elevenStreetShippingPolicy: '暂无数据',
            adShippingFee: '暂无数据'
          }],
        status: ['Cancelled', 'Draft', 'Cancelled', 'Cancelled'],
        cost: ['BIN:308.93', 'BIN：877.41', 'BIN：877.41', 'BIN：877.41'],
        grossMargin: ['BIN：19%', 'BIN：20%', 'BIN：18%', 'BIN：22%'],
        grossProfit: ['BIN:88.63', 'BIN:88.63', 'BIN:88.63', 'BIN:88.63'],
        BIDPrice: ['396.00', '396.00', '396.00', '396.00'],
        BINPrice: ['396.00', '396.00', '396.00', '396.00'],
        quantity: ['8', '8', '8', '9'],
        actualShippingCost: ['176.16', '176.16', '176.16', '176.16'],
        specificsName1: ['Size    (Image Specifics)', 'Size    (Image Specifics)', 'Size    (Image Specifics)', 'Size    (Image Specifics)'],
        specificsValue1: ['S', 'M', 'L', 'XL'],
        mainPictureUr: ['', '', '', ''],
        log: []
      },
      logOptions: {
        open: false,
        advtId: ''
      },
      attrOptions: {
        open: false,
        attr: {},
        detailData: {},
        type: '',
        index: -1
      }
    }
  },
  created() {
    // 是否是可编辑状态 Active/Upload Error 状态产品详情页新增编辑功能 // Upload Error状态增加编辑目录属性功能
    this.canEdit = this.detailData.status_name === 'Active' || this.detailData.status_name === 'Upload Error'
    this.canEditCategory = this.detailData.status_name === 'Upload Error'
    this.cloneData = this._.cloneDeep(this.detailData)
    sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
  },
  mounted() {
    this.setImageWidth()
  },
  methods: {
    // 下拉选value
    formatAttr(attr) {
      this._.forEach(attr, v => {
        this._.forEach(v, v1 => {
          v1.select_value = ''
        })
      })
      return attr
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
          istore_product_id: this.detailData.istore_product_id,
          product_id: this.detailData.product_id,
          category_id: this.category[this.category.length - 1],
          type: ['attribute']
        }
        getEditData(params).then(res => {
          loading.close()
          if (res.data.attribute.specifics && res.data.attribute.specifics.length) {
            const attribute = this.formatAttr(res.data.attribute)
            this._.forEach(this.cloneData.product_info, v => {
              v.attribute = this._.cloneDeep(attribute)
            })
            this.showAttr = false
            this.$nextTick(() => {
              this.showAttr = true
            })
          } else {
            this.$message.warning('该目录下没有区分项属性,不支持创建vary广告')
            this.category = []
          }
        }).catch(e => {
          loading.close()
          this.$message.error(e)
        })
      }
    },
    // 搜索属性设置
    setAttributes(type, val, newValue, index) {
      //  vari子属性
      if (index !== undefined) {
        this.cloneData.product_info[index].attribute[type].forEach(v => {
          if (v.attribute_id === val.attribute_id) {
            v.value = newValue
            v.select_value = newValue
          }
        })
      }
    },
    openAttrDialog(attr, type, index) {
      this.attrOptions = {
        open: true,
        attr,
        detailData: this.detailData,
        type,
        index
      }
    },
    attrSelectChange(val, attr) {
      if (val) {
        attr.value = val
      } else {
        attr.value = ''
      }
    },
    refreshDetail() {
      const loading = this.$loading({
        lock: true,
        text: '努力加载中',
        background: 'rgba(0, 0, 0, 0.5)'
      })
      fetchDetail(this.$route.params.id).then(response => {
        this.cloneData = response.data
        this.canEdit = this.cloneData.status_name === 'Active' || this.cloneData.status_name === 'Upload Error'
        this.canEditCategory = this.cloneData.status_name === 'Upload Error'
        sessionStorage.setItem('copyData', this.cloneData)
        setTimeout(() => {
          loading.close()
        }, 800)
      }).catch(() => {
        loading.close()
      })
    },
    // tinymce内容重置
    setContent(content, index) {
      this.cloneData.product_info[index].description = content
      sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
    },
    // 子产品图片更新
    updateImages(list, index) {
      if (list) {
        if (index !== undefined) {
          this.cloneData.product_info[index].images = list
        }
      }
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
        this.$message.warning('该广告数据未发生变化！')
      } else {
        const checkOther = new Promise((resolve, reject) => {
          this._.forEach(this.cloneData.product_info, v => {
            if (!v.images.length) {
              reject(`子产品 ${v.istore_product_id} 图片不能为空`)
            }
          })
          this._.forEach(this.cloneData.product_info, v => {
            if (!v.short_description.trim().length || v.short_description.trim().length > 1000) {
              reject(`子产品 ${v.istore_product_id} 短描述不能为空且最多输入1000个字符!`)
            }
          })
          this._.forEach(this.cloneData.product_info, v => {
            if (!v.description.trim().length || v.description.trim().length > 4000) {
              reject(`子产品 ${v.istore_product_id} 描述不能为空且最多输入4000个字符`)
            }
          })
          resolve()
        })
        // 子产品Form验证
        const validatePriceArr = []
        this._.forEach(this.cloneData.product_info, (v, index) => {
          validatePriceArr.push(this.$refs['priceForm' + index][0].validate())
        })
        const validateChildForm = new Promise((resolve, reject) => {
          Promise.all([...validatePriceArr]).then(() => {
            resolve()
          }).catch(() => {
            reject('Commodity information区域数据输入不合法，请检查!')
          })
        })
        const hasSame = () => {
          // uploadError状态 advt_status == 170子产品是否有重复区分项
          const specArr = []
          this.cloneData.product_info.forEach(v => {
            if (this.cloneData.advt_status === 170 || (this.cloneData.advt_status === 120 && ![120, 180, 190].includes(v.advt_staus))) {
              specArr.push(v.attribute.specifics)
            }
          })
          let have = false
          for (let i = 0; i < specArr.length; i++) {
            for (let j = specArr.length - 1; j > i; j--) {
              if (this._.isEqual(specArr[i], specArr[j])) {
                have = true
                break
              }
            }
          }
          return have
        }
        const hasEmpty = new Promise((resolve, reject) => {
          // uploadError状态 advt_status == 170 必填区分项、属性是否有空值
          this.cloneData.product_info.map(v => {
            if (this.cloneData.advt_status === 170 || (this.cloneData.advt_status === 120 && ![120, 180, 190].includes(v.advt_staus))) {
              this._.forEach(v.attribute, v1 => {
                this._.forEach(v1, v2 => {
                  if (v2.is_required && !v2.value.trim()) {
                    reject(`子产品 ${v.istore_product_id} 必填属性和必填区分项不能为空`)
                  }
                })
              })
            }
          })
          resolve()
        })
        const validateSpec = new Promise((resolve, reject) => {
          if (hasSame()) {
            reject('子产品区分项不能重复!')
          } else {
            resolve()
          }
        })

        Promise.all([validateChildForm, checkOther, hasEmpty, validateSpec]).then(res => {
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
      const that = this

      function formatAllImages() {
        const arr = []
        that._.forEach(that.cloneData.product_info, v => {
          arr.push({
            istore_product_id: v.istore_product_id,
            content: v.images.map(v1 => {
              return {
                image_path: v1.image_path,
                thumb_image_path: v1.product_image_thumb ? v1.product_image_thumb : v1.image_path
              }
            })
          })
        })
        return arr
      }

      function formatAllTitles() {
        const arr = []
        that._.forEach(that.cloneData.product_info, v => {
          arr.push({
            istore_product_id: v.istore_product_id,
            content: v.name.trim()
          })
        })
        return arr
      }

      function formatAllDescription() {
        const arr = []
        that._.forEach(that.cloneData.product_info, (v, ind) => {
          arr.push({
            istore_product_id: v.istore_product_id,
            content: {
              description: v.description.trim() === JSON.parse(sessionStorage.copyData).product_info[ind].description.trim() ? '' : v.description.trim(),
              short_description: v.short_description.trim()
            }
          })
        })
        return arr
      }

      function formatAllAttribute() {
        const arr = []
        that._.forEach(that.cloneData.product_info, (v, ind) => {
          const obj = {
            istore_product_id: v.istore_product_id,
            content: {}
          }
          that._.forEach(v.attribute, v1 => {
            that._.forEach(v1, v2 => {
              if (v2.value) {
                obj.content[v2.attribute_name] = v2.value
              }
            })
          })
          arr.push(obj)
        })
        return arr
      }

      const obj = {
        advt_id: this.cloneData.advt_id,
        account_id: this.cloneData.account_id,
        data: {
          title: formatAllTitles(),
          description: formatAllDescription(),
          images: formatAllImages(),
          category: [
            {
              istore_product_id: this.cloneData.istore_product_id,
              content: this.category.length ? this.category[this.category.length - 1] : this.cloneData.category_id
            }
          ],
          specifics: formatAllAttribute()
        }
      }
      return obj
    },
    // 切换编辑状态
    toggleEdit(val) {
      // 取消保存还原页面数据
      this.category = []
      if (!val) {
        this._.forEach(this.cloneData.product_info, (v, index) => {
          this.$refs['priceForm' + index][0].clearValidate()
        })
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
        istore_product_id: this.detailData.istore_product_id,
        product_id: this.detailData.product_id,
        type: ['images', 'category']
      }
      getEditData(params).then(res => {
        this.isEdit = true
        loading.close()
        this.categoryList = res.data.category
        this.istorePictures = res.data.images
      }).catch(e => {
        loading.close()
        this.$message.error(e)
      })
    },
    // 日志
    openLog(id) {
      this.logOptions = {
        open: true,
        advtId: id
      }
    },
    setImageWidth() {
      const imgArr = (document.querySelectorAll('.description>img'))
      imgArr.forEach(item => {
        item.setAttribute('width', '50%')
      })
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.attr-more-click {
  cursor: pointer;
  font-size: 12px;
  color: #409EFF;
  padding: 5px;
  text-align: center;
}

.error-tip {
  color: #F56C6C;
  margin-bottom: 5px;
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

  .is-spec {
    .el-form-item__label:before {
      content: "*";
      color: #409EFF;
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

.detail-form .el-input.is-disabled .el-input__inner {
  color: #666;
}
</style>
