<template>
  <div>
    <div class="header-box">
      <el-row class="right-row">
        <el-button v-permission="permissions.edit" v-show="!isEdit && canEdit" type="primary" size="mini" @click="toggleEdit(true)">编辑</el-button>
        <el-button v-show="isEdit" type="success" size="mini" @click="saveEdit">保存</el-button>
        <el-button v-show="isEdit" type="secondary" size="mini" @click="toggleEdit(false)">取消保存</el-button>
        <el-button type="primary" size="mini" @click="openLog(cloneData.advt_id)">日志</el-button>
      </el-row>
      <label class="title">Basic Information(variation)</label>
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
            :model="cloneData"
            ref="infoForm"
            :rules="rule"
          >
            <el-row>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="广告名称" prop="name">
                  <div class="no-back-ground" v-if="isEdit && canEdit">
                    <el-input v-model="cloneData.name" size="mini" clearable></el-input>
                    <div class="tip pt-2"><i class="el-icon-info"></i>请输入英语</div>
                  </div>
                  <p v-else>{{ cloneData.name.replace(/\s/g,'&nbsp;') }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="关键词1" prop="keywords1">
                  <div class="no-back-ground" v-if="isEdit && canEdit">
                    <el-input size="mini" clearable v-model="cloneData.keywords1"></el-input>
                    <div class="tip pt-2"><i class="el-icon-info"></i>请输入英语</div>
                  </div>
                  <p v-else>{{ cloneData.keywords1 }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="关键词2" prop="keywords2">
                  <div class="no-back-ground" v-if="isEdit && canEdit">
                    <el-input size="mini" clearable v-model="cloneData.keywords2"></el-input>
                    <div class="tip pt-2"><i class="el-icon-info"></i>请输入英语</div>
                  </div>
                  <p v-else>{{ cloneData.keywords2 }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="关键词3" prop="keywords3">
                  <div class="no-back-ground" v-if="isEdit && canEdit">
                    <el-input size="mini" clearable v-model="cloneData.keywords3"></el-input>
                    <div class="tip pt-2"><i class="el-icon-info"></i>请输入英语</div>
                  </div>
                  <p v-else>{{ cloneData.keywords3 }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="目录">
                  <p>{{ `${ cloneData.category_name } [${ cloneData.category_id }]` }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item v-if="isEdit && canEditCategory" prop="category" label="选择新目录">
                  <div class="no-back-ground">
                    <el-cascader
                      placeholder="请选择目录"
                      :props="categoryProps"
                      :options="categoryList"
                      :filterable="true"
                      style="width:100%"
                      v-model="category"
                    ></el-cascader>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Site Code">
                  <p>{{ cloneData.account_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="广告ID">
                  <p>{{ cloneData.advt_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12" v-if="!notShowSpu.includes(cloneData.advt_status)">
                <el-form-item label="平台商品号">
                  <p>{{ cloneData.spu_code }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="状态">
                  <p>{{ cloneData.status_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="广告类型">
                  <p>{{ cloneData.type_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="重量(kg)">
                  <p>{{ cloneData.total_weight }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="包装尺寸(长*宽*高 cm)">
                  <p>{{ `${ cloneData.length } * ${ cloneData.width } * ${ cloneData.high }` }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12" v-if="cloneData.advt_status === 120">
                <el-form-item label="到期时间">
                  <p><span>{{ cloneData.valid_day }}</span></p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="主图" class="is-required-attr">
              <template>
                <div style="padding-right:50px">
                  <picture-view
                    v-if="cloneData.images.length && !isEdit"
                    :pictureList="cloneData.images"
                    :defaultProps="defaultProps"
                    :width="100"
                    :height="100"
                    :spaceBetween="6"
                    :thumbnailWidth="80"
                    :thumbnailHeight="80"
                  ></picture-view>
                  <edit-image
                    v-if="isEdit && canEdit"
                    :pictureList="cloneData.images"
                    :is-edit="isEdit"
                    :pictures="istorePictures[0].content"
                    :max-length="8"
                    :default-props="defaultProps"
                    :picture-key="'image_path'"
                    :thumb-url="'product_image_thumb'"
                    @emit-update-pictureList="updateImages"
                  ></edit-image>
                </div>
                <p v-if="isEdit && canEdit" class="no-back-ground tip pt-5"><i class="el-icon-info"></i>第一张为主图，产品图片至少上传3张，最多上传8张</p>
              </template>
            </el-form-item>
            <el-form-item label="短描述" prop="short_description" class="no-back-ground">
              <div class="no-back-ground" v-if="isEdit && canEdit">
                <el-input type="textarea" :autosize="{ minRows: 8, maxRows: 8 }" v-model="cloneData.short_description"></el-input>
                <div class="tip pt-5"><i class="el-icon-info"></i>请输入英语</div>
              </div>
              <p v-else>{{ cloneData.short_description }}</p>
            </el-form-item>
            <el-form-item label="描述" class="is-required-attr">
              <div class="no-back-ground" v-if="isEdit && canEdit">
                <tinymce
                  @set-content="setContent"
                  v-model="cloneData.description"
                  :height="400"
                  class="no-back-ground"
                />
                <div class="tip pt-5"><i class="el-icon-info"></i>请输入英语</div>
              </div>
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
              <el-collapse-item :title="`${String(item.istore_product_id)}${item.name ? '[' + item.name + ']' : ''}`" :name="index" v-for="(item, index) in cloneData.product_info" :key="index">
                <!-- 库存 istore 产品ID、运费（USD）、售价（USD）、原价（USD）、毛利率（%）、平台佣金率（%）、分类目录、分类目录ID、属性、包装尺寸（长cm、宽cm、高cm）、图片、描述 运输方式 保本价 汇率 打包费 产品成本-->
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="库存">
                      <p>{{ item.quantity }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="iStore Product ID">
                      <p>{{ item.istore_product_id }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="运输方式">
                      <p>{{ item.shipping_method }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="运费(CNY)">
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
                    <el-form-item label="汇率">
                      <p>{{ item.currency_rate }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="打包费(CNY)">
                      <p>{{ item.parcel_processing_fee }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="产品成本(CNY)">
                      <p>{{ item.product_base_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="平台佣金率(%)">
                      <p>{{ item.commission }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="备货期(天)">
                      <p>{{ item.leading_time }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item label="区分项">
                      <el-row class="attr-row">
                        <el-col :xs="12" :sm="12" :md="12" :lg="12" style="border:none;">
                          <div class="grid-content bg-purple bg-border">属性名</div>
                        </el-col>
                        <el-col :xs="12" :sm="12" :md="12" :lg="12">
                          <div class="grid-content bg-purple">属性值</div>
                        </el-col>
                      </el-row>
                      <template v-if="item.attributes && item.attributes.length > 0">
                        <el-row class="attr-row" v-for="(it, ind) in item.attributes" :key="ind">
                          <el-col :xs="12" :sm="12" :md="12" :lg="12">
                            <div class="grid-content bg-purple bg-border">{{ it.key }}</div>
                          </el-col>
                          <el-col :xs="12" :sm="12" :md="12" :lg="12">
                            <div class="grid-content bg-purple">{{ it.value }}</div>
                          </el-col>
                        </el-row>
                      </template>
                      <p v-else style="text-align: center;">无</p>
                    </el-form-item>
                  </el-col>
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
import istoreLog from '../components/istoreLog'
import Tinymce from '@/components/Tinymce'
import editImage from './component/editImage'
import { editDetail, getEditData, fetchDetail } from '@/api/dhgate'

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
    const checkName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('标题不能为空'))
        return
      }
      if (value.length > 140) {
        callback(new Error('标题最多输入140字符'))
        return
      }
      callback()
    }
    const checkShortDescription = (rule, value, callback) => {
      if (!value) {
        callback(new Error('短描述不能为空'))
        return
      }
      if (value.length > 500) {
        callback(new Error('短描述最多输入500字符'))
        return
      }
      callback()
    }
    return {
      permissions: {
        edit: 'dhgate.advt.advt.edit'
      },
      category: [],
      categoryProps: {
        value: 'category_id',
        label: 'name',
        children: '_child'
      },
      categoryList: [],
      rule: {
        name: [{ required: true, validator: checkName, trigger: ['change', 'blur'] }],
        short_description: [{ required: true, validator: checkShortDescription, trigger: ['blur', 'change'] }],
        keywords1: [{ required: true, message: '关键词不能为空', trigger: ['blur', 'change'] }],
        keywords2: [{ required: true, message: '关键词不能为空', trigger: ['blur', 'change'] }],
        keywords3: [{ required: true, message: '关键词不能为空', trigger: ['blur', 'change'] }]
      },
      cloneData: {},
      istorePictures: [],
      canEdit: false,
      isEdit: false,
      canEditCategory: false,
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
      },
      notShowSpu: [100, 110, 140],
      //日志
      logOptions: {
        open: false,
        advtId: ''
      }
    }
  },
  created() {
    // 是否是可编辑状态 online ==120、uploadError=140 状态产品详情页新增编辑功能 Upload Error状态支持编辑目录，OnLine状态不支持编辑目录
    this.canEdit = [120, 140].includes(Number(this.detailData.advt_status))
    this.canEditCategory = Number(this.detailData.advt_status) === 140
    this.cloneData = this._.cloneDeep(this.detailData)
    sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
  },
  mounted() {
    this.setImageWidth()
  },
  methods: {
    refreshDetail() {
      const loading = this.$loading({
        lock: true,
        text: '努力加载中',
        background: 'rgba(0, 0, 0, 0.5)'
      })
      fetchDetail(this.$route.params.id).then(response => {
        this.cloneData = response.data
        this.canEdit = [120, 140].includes(Number(this.cloneData.advt_status))
        this.canEditCategory = Number(this.cloneData.advt_status) === 140
        sessionStorage.setItem('copyData', this.cloneData)
        setTimeout(() => {
          loading.close()
        }, 800)
      }).catch(() => {
        loading.close()
      })
    },
    // tinymce内容重置
    setContent(content) {
      this.cloneData.description = content
      sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
    },
    // 图片更新
    updateImages(list) {
      this.cloneData.images = list
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
        this.$message.warning('该广告数据未发生变化')
      } else {
        const checkOther = new Promise((resolve, reject) => {
          // 主图是否为空
          if (!this.cloneData.images.length || this.cloneData.images.length < 3) {
            reject('主图不能为空且产品图片不能少于3张')
          }
          if (!this.cloneData.description.trim().length || this.cloneData.description.trim().length > 80000) {
            reject('描述不能为空且最多输入80000字符')
          }
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
        Promise.all([checkForm, checkOther]).then(res => {
          const loading = this.$loading({
            lock: true,
            text: '保存中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.3)'
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
                short_description: this.cloneData.short_description.trim(),
                keywords: [this.cloneData.keywords1.trim(), this.cloneData.keywords2.trim(), this.cloneData.keywords3.trim()]
              }
            }
          ],
          images: formatAllImages(),
          category: [
            {
              istore_product_id: this.cloneData.istore_product_id,
              content: this.category.length ? this.category[this.category.length - 1] : this.cloneData.category_id
            }
          ]
        }
      }
      return obj
    },
    // 切换编辑状态
    toggleEdit(val) {
      this.isEdit = val
      if (!this.isEdit) {
        // 清除表单验证
        this.$refs['infoForm'].clearValidate()
        this.category = []
        this.cloneData = JSON.parse(sessionStorage.getItem('copyData'))
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
        loading.close()
        this.isEdit = true
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

.detail-form .information-form .no-back-ground {
  background: #fff !important;
}

.detail-form .pt-5 {
  padding-top: 5px;
}

.detail-form .pt-2 {
  padding-top: 2px;
}
</style>
