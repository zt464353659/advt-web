<template>
  <div>
    <div class="header-box">
      <label class="title">Basic Information(variation)</label>
      <el-row class="right-row">
        <el-button v-if="permissions.edit" v-show="canEdit && !isEdit" type="primary" size="mini" @click="toggleEdit(true)">编辑</el-button>
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
            :model="cloneData"
            :rules="infoRules"
            ref="infoForm"
          >
            <el-row>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="广告名称" prop="name">
                  <div class="no-back-ground" v-if="isEdit && canEdit">
                    <div>
                      <div class="ad-name">
                        <el-input v-model="cloneData.name" size="mini" clearable></el-input>
                        <span class="ad-name-num" :class="{ wordColor: cloneData.name.length > 255 || cloneData.name.length<2 }">
                          {{ `${ cloneData.name.length }/255` }}限制字符数(2-255)
                        </span>
                      </div>
                      <div class="tip pt-2"><i class="el-icon-info"></i>请输入西班牙语</div>
                    </div>
                  </div>
                  <p v-else>{{ cloneData.name.replace(/\s/g, '&nbsp;') }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="广告ID">
                  <p>{{ cloneData.advt_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="广告类型">
                  <p>{{ cloneData.type_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="总重量(kg)">
                  <p>{{ cloneData.total_weight }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Account Name">
                  <p>{{ cloneData.account_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Status">
                  <p>{{ cloneData.status_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="包装尺寸(长*宽*高 cm)">
                  <p>{{ `${ cloneData.package_length } * ${ cloneData.package_width } * ${ cloneData.package_high }` }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="目录">
                  <p>{{ `${ cloneData.category_name } [${ cloneData.category_id }]` }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24" v-if="canEdit && isEdit">
                <el-form-item label="选择新目录">
                  <div class="no-back-ground">
                    <el-cascader
                      placeholder="请选择目录"
                      :props="categoryProps"
                      :options="categoryList"
                      :filterable="true"
                      @change="categoryChange"
                      style="width:100%"
                      v-model="category"
                    ></el-cascader>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="属性">
                  <el-form-item v-for="(item,index) in cloneData.attributes" :label="item.attribute_name" :key="index" :class="item.is_required ? 'is-required-attr': ''">
                    <el-select v-if="item.options && item.options.length" v-model="item.value" style="width:600px" :disabled="!isEdit" clearable>
                      <el-option v-for="(option,ind) in item.options" :label="option" :value="option" :key="ind"></el-option>
                    </el-select>
                    <el-input v-else v-model="item.value" size="mini" clearable style="width:600px" :disabled="!isEdit" placeholder="请输入"></el-input>
                    <el-popover
                      placement="top-start"
                      width="400"
                      trigger="hover"
                    >
                      <div>
                        <div v-if="item.description" class="description">
                          <span style="font-weight: 700;">description:</span> {{ item.description }}
                        </div>
                        <div v-if="item.example_value" class="example">
                          <span style="font-weight: 700;">example:</span> {{ item.example_value }}
                        </div>
                      </div>
                      <el-button type="text" slot="reference"><i class="el-icon-question"></i></el-button>
                    </el-popover>
                  </el-form-item>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="主图" class="is-required-attr">
              <template>
                <edit-image
                  v-if="isEdit && canEdit"
                  :pictureList="cloneData.images"
                  :is-edit="isEdit && canEdit"
                  :pictures="istorePictures.filter(v => Number(v.istore_product_id) === Number(cloneData.istore_product_id))[0].content"
                  :max-length="8"
                  :default-props="defaultProps"
                  :picture-key="'image_path'"
                  :thumb-url="'product_image_thumb'"
                  @emit-update-pictureList="updateImages"
                ></edit-image>
                <p v-if="isEdit && canEdit" class="no-back-ground tip pt-5"><i class="el-icon-info"></i>第一张为主图，最多可上传8张</p>
                <div v-else style="padding-right:50px">
                  <picture-view
                    :pictureList="cloneData.images"
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
            <el-form-item label="短描述" class="is-required-attr">
              <tinymce
                v-if="isEdit && canEdit"
                @set-content="setContent1"
                v-model="cloneData.short_description"
                :height="400"
                class="no-back-ground"
              />
              <div class="tip pt-5" v-if="isEdit && canEdit"><i class="el-icon-info"></i>请输入西班牙语</div>
              <div v-else v-html="cloneData.short_description" class="description"></div>
            </el-form-item>
            <el-form-item label="描述" class="is-required-attr">
              <tinymce
                v-if="isEdit && canEdit"
                @set-content="setContent"
                v-model="cloneData.description"
                :height="400"
                class="no-back-ground"
              />
              <div class="tip pt-5" v-if="isEdit && canEdit"><i class="el-icon-info"></i>请输入西班牙语</div>
              <div v-else v-html="cloneData.description" class="description"></div>
            </el-form-item>
          </el-form>
        </el-collapse-item>
        <el-collapse-item title="Commodity information" name="2">
          <el-form
            ref="form"
            :model="priceForm"
            label-width="220px"
            size="small"
            class="price-form"
          >
            <el-row v-for="(item, index) in priceForm.specifics" :key="index">
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="'Specifics Name' + (index + 1)">
                  <p></p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-collapse v-model="activeNames2" class="product-collapse">
              <el-collapse-item :title="`${String(item.istore_product_id)} ${item.name ? `[${item.name}]` : ''}`" :name="index" v-for="(item, index) in cloneData.product_info" :key="index">
                <el-row>
                  <div class="error-tip" v-if="item.error_log_message" style="padding: 10px 0;background: #EBEEF5;margin-left: -15px;padding-left: 8px;margin-bottom: 15px;">
                    错误信息: {{ item.error_log_message }}
                  </div>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="iStore Product ID">
                      <p>{{ item.istore_product_id }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="Status">
                      <p>{{ item.status_name }}</p>
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
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item label="区分项" v-if="item.specifics && item.specifics.length">
                      <el-form-item label-width="100px" v-for="(spec,specInd) in item.specifics" class="is-required-attr" :label="spec.istore_attribute_name" :key="specInd">
                        <el-input v-if="canEdit && isEdit && canEditChild.includes(item.advt_status)" v-model="spec.istore_attribute_value" size="mini" clearable></el-input>
                        <p v-else>{{ spec.istore_attribute_value }}</p>
                      </el-form-item>
                    </el-form-item>
                  </el-col>
                  <!--                  <el-col :xs="24" :sm="24" :md="24" :lg="24">-->
                  <!--                    <el-form-item label="图片">-->
                  <!--                      <template>-->
                  <!--                        <div style="padding-right:50px;">-->
                  <!--                          <picture-view-->
                  <!--                            v-if="item.images.length > 0 && activeNames2.includes(index)"-->
                  <!--                            :pictureList="item.images"-->
                  <!--                            :width="100"-->
                  <!--                            :height="100"-->
                  <!--                            :spaceBetween="6"-->
                  <!--                            :defaultProps="defaultProps"-->
                  <!--                            :thumbnailWidth="80"-->
                  <!--                            :thumbnailHeight="80"-->
                  <!--                          ></picture-view>-->
                  <!--                        </div>-->
                  <!--                      </template>-->
                  <!--                    </el-form-item>-->
                  <!--                    <el-form-item label="短描述">-->
                  <!--                      <div v-html="item.short_description" class="description"></div>-->
                  <!--                    </el-form-item>-->
                  <!--                    <el-form-item label="描述">-->
                  <!--                      <div v-html="item.description" class="description"></div>-->
                  <!--                    </el-form-item>-->
                  <!--                  </el-col>-->
                </el-row>
              </el-collapse-item>
            </el-collapse>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </div>
    <!--日志-->
    <istore-log v-bind.sync="logOptions"></istore-log>
  </div>
</template>

<script>
import istoreLog from './../components/istoreLog'
import Tinymce from '@/components/Tinymce'
import editImage from './component/editImage'
import { editDetail, getEditData, fetchDetail } from '@/api/linio'

export default {
  name: 'VariationDetails',
  components: { istoreLog, Tinymce, editImage },
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
      if (value.trim().length > 255 || value.trim().length < 2) {
        callback(new Error('标题长度限制2-255字符'))
        return
      }
      callback()
    }
    return {
      // 是否是可编辑子产品 Active、Inactive、Upload Error
      canEditChild: [120, 130, 140],
      logOptions: {
        open: false,
        advtId: ''
      },
      permissions: {
        edit: 'linio.advt.advt.edit'
      },
      category: [],
      categoryProps: {
        value: 'category_id',
        label: 'name',
        children: '_child'
      },
      categoryList: [],
      infoRules: {
        name: [{ required: true, validator: checkTitle, trigger: ['blur', 'change'] }]
      },
      istorePictures: [],
      cloneData: {},
      canEdit: false,
      isEdit: false,
      not_show_spu: [100, 110, 140],
      advt_id: this.$route.params.id,
      activeName: 'first',
      activeNames: ['0', '1', '2'],
      activeNames2: [0],
      labelWidth: '220px',
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
      }
    }
  },
  created() {
    // 是否是可编辑状态 Active、Inactive、Upload Error 状态产品详情页新增编辑功能
    this.canEdit = [120, 130, 140].includes(Number(this.detailData.status))
    this.cloneData = this._.cloneDeep(this.detailData)
    sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
  },
  mounted() {
    this.setImageWidth()
  },
  methods: {
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
          advt_id: this.detailData.advt_id,
          account_id: this.detailData.account_id,
          istore_product_id: this.detailData.istore_product_id,
          product_id: this.detailData.product_id,
          category_id: this.category[this.category.length - 1],
          type: ['attribute']
        }
        getEditData(params).then(res => {
          loading.close()
          this.cloneData.attributes = this.formatAttr(res.data.attribute)
        }).catch(e => {
          this.$message.error(e)
          loading.close()
        })
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
        this.canEdit = [120, 130, 140].includes(Number(this.cloneData.status))
        sessionStorage.setItem('copyData', this.cloneData)
        setTimeout(() => {
          loading.close()
        }, 800)
      }).catch(() => {
        loading.close()
      })
    },
    // tinymce内容重置 描述
    setContent(content) {
      this.cloneData.description = content
      sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
    },
    // tinymce内容重置 短描述
    setContent1(content) {
      this.cloneData.short_description = content
      sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
    },
    // 图片更新,主产品图片
    updateImages(list) {
      if (list) {
        this.cloneData.images = list
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
          if (Number(this.category[this.category.length - 1]) === Number(this.cloneData.category_id)) {
            return false
          }
          return true
        }
      }
      if (this._.isEqual(JSON.stringify(this.cloneData), sessionStorage.getItem('copyData')) && !categoryChange()) {
        this.$message.warning('该广告数据未发生变化')
      } else {
        const hasSame = () => {
          // 子产品是否有重复区分项
          const specArr = []
          this.cloneData.product_info.forEach(v => {
            if (v.specifics && v.specifics.length) {
              const obj = {}
              v.specifics.forEach(v1 => {
                if (v1.istore_attribute_value.trim()) {
                  obj[v1.istore_attribute_name] = v1.istore_attribute_value
                }
              })
              specArr.push(obj)
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
        const checkOther = new Promise((resolve, reject) => {
          // 主图是否为空
          if (!this.cloneData.images.length || this.cloneData.images.length > 8) {
            reject('主图不能为空,最多选择8张图片')
          }
          // 描述、短描述 6至25000个字符
          if (this.cloneData.description.trim().length < 6 || this.cloneData.description.trim().length > 25000) {
            reject('描述不能为空且限制输入字符数量6-25000')
          }
          if (this.cloneData.short_description.trim().length < 6 || this.cloneData.short_description.trim().length > 25000) {
            reject('短描述不能为空且限制输入字符数量6-25000')
          }
          if (hasSame()) {
            reject('子产品区分项不能重复')
          }
          resolve()
        })
        // 属性必填验证
        const checkAttr = new Promise((resolve, reject) => {
          this._.forEach(this.cloneData.attributes, v => {
            if (v.is_required && !v.value.trim()) {
              reject('必填属性不能为空')
            }
          })
          resolve()
        })
        // 区分项必填验证
        const checkSpec = new Promise((resolve, reject) => {
          this._.forEach(this.cloneData.product_info, v => {
            this._.forEach(v.specifics, v1 => {
              if (!v1.istore_attribute_value.trim()) {
                reject('区分项不能为空')
              }
            })
          })
          resolve()
        })
        const checkForm = new Promise((resolve, reject) => {
          this.$refs['infoForm'].validate(v => {
            if (v) {
              resolve()
            }
            reject('Listing Information区域字段不合法，请输入正确格式')
          })
        })

        Promise.all([checkForm, checkOther, checkAttr, checkSpec]).then(res => {
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
        // 主图obj
        const obj = {
          istore_product_id: that.cloneData.istore_product_id,
          content: that.cloneData.images.map(v => {
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
          istore_product_id: that.cloneData.istore_product_id,
          content: {}
        }
        that.cloneData.attributes.map(v => {
          obj.content[v.attribute_name] = v.value.trim() || ''
        })
        arr.push(obj)
        that.cloneData.product_info.map(v => {
          const obj = {
            istore_product_id: v.istore_product_id,
            content: {}
          }
          v.specifics.map(v1 => {
            obj.content[v1.istore_attribute_name] = v1.istore_attribute_value.trim() || ''
          })
          // 仅提交可编辑状态子产品区分项
          if (that.canEditChild.includes(v.advt_status)) {
            arr.push(obj)
          }
        })
        return arr
      }

      const istore_product_id = this.cloneData.istore_product_id
      const obj = {
        advt_id: this.cloneData.advt_id,
        account_id: this.cloneData.account_id,
        data: {
          title: [
            {
              istore_product_id,
              content: this.cloneData.name.trim()
            }
          ],
          description: [
            {
              istore_product_id,
              content: {
                description: this.cloneData.description.trim() === JSON.parse(sessionStorage.copyData).description.trim() ? '' : this.cloneData.description.trim(),
                short_description: this.cloneData.short_description.trim() === JSON.parse(sessionStorage.copyData).short_description.trim() ? '' : this.cloneData.short_description.trim()
              }
            }
          ],
          images: formatAllImages(),
          category: [
            {
              istore_product_id,
              content: this.category.length ? this.category[this.category.length - 1] : this.cloneData.category_id
            }
          ],
          specifics: formatSpec()
        }
      }
      return obj
    },
    // 切换编辑状态
    toggleEdit(val) {
      // 取消保存还原页面数据
      if (!val) {
        this.category = []
        this.$refs['infoForm'].clearValidate()
        this.cloneData = JSON.parse(sessionStorage.getItem('copyData'))
        this.isEdit = false
      } else {
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
        type: ['images', 'category']
      }
      getEditData(params).then(res => {
        loading.close()
        this.isEdit = true
        this.categoryList = res.data.category
        this.istorePictures = res.data.images
      }).catch(e => {
        loading.close()
        this.$message(e)
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

.wordColor {
  color: #F08080 !important;
}
</style>
<style rel="stylesheet/scss" lang="scss">
.detail-form {
  .is-required-attr {
    .el-form-item__label:before {
      content: "*";
      color: #F56C6C;
      margin-right: 4px;
    }
  }
}

.ad-name {
  display: flex;

  p {
    width: 100%;
  }

  .ad-name-num {
    display: block;
    text-align: center;
    width: 15%;
    font-size: 12px;
    color: #909399;
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

.detail-form .el-select--small {
  padding: 0 !important;
}
</style>
