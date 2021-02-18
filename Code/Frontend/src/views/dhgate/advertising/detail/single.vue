<template>
  <div>
    <div class="header-box">
      <el-row class="right-row">
        <el-button v-permission="permissions.edit" v-show="!isEdit && canEdit" type="primary" size="mini" @click="toggleEdit(true)">编辑</el-button>
        <el-button v-show="isEdit" type="success" size="mini" @click="saveEdit">保存</el-button>
        <el-button v-show="isEdit" type="secondary" size="mini" @click="toggleEdit(false)">取消保存</el-button>
        <el-button type="primary" size="mini" @click="openLog(detailData.advt_id)">日志</el-button>
      </el-row>
      <label class="title">Basic Information(Normal)</label>
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
              <!-- 广告ID、状态、广告名称、重量（kg）、库存、Site Code。-->
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
                <el-form-item label="库存">
                  <p>{{ cloneData.quantity }}</p>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-collapse-item>
        <el-collapse-item title="Commodity information" name="2">
          <el-form
            label-width="220px"
            size="small"
            class="price-form"
            :model="cloneData"
            ref="priceForm"
            :rules="priceRules"
          >
            <!-- istore 产品ID、运费（USD）、售价（USD）、原价（USD）、毛利率（%）、平台佣金率（%）、分类目录、分类目录ID、属性、包装尺寸（长cm、宽cm、高cm）、图片、描述 运输方式 保本价 汇率 打包费 产品成本-->
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="iStore Product ID">
                  <p>{{ cloneData.istore_product_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12" v-if="!notShowSpu.includes(cloneData.advt_status)">
                <el-form-item label="平台商品号">
                  <p>{{ cloneData.spu_code }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="运输方式">
                  <p>{{ cloneData.shipping_method }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="运费(CNY)">
                  <p>{{ cloneData.shipping_costs }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="`保本价(${cloneData.currency_code})`">
                  <p>{{ cloneData.base_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="`售价(${cloneData.currency_code})`">
                  <p>{{ cloneData.discount_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="`原价(${cloneData.currency_code})`">
                  <p>{{ cloneData.discount_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="毛利率(%)">
                  <p>{{ cloneData.gross_margin }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="汇率">
                  <p>{{ cloneData.currency_rate }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="打包费(CNY)">
                  <p>{{ cloneData.parcel_processing_fee }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="产品成本(CNY)">
                  <p>{{ cloneData.product_base_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="平台佣金率(%)">
                  <p>{{ cloneData.commission }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12" v-if="cloneData.advt_status === 120">
                <el-form-item label="到期时间">
                  <p><span>{{ cloneData.valid_day }}</span></p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="备货期(天)">
                  <p>{{ cloneData.leading_time }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12" v-for="(item,index) in cloneData.attributes" :key="index">
                <el-form-item :label="item.key">
                  {{ item.value }}
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="包装尺寸(长*宽*高 cm)">
                  <p>{{ `${ cloneData.length } * ${ cloneData.width } * ${ cloneData.high }` }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="图片" class="is-required-attr">
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
            <el-form-item label="短描述" prop="short_description">
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
  name: 'SingleDetails',
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
      if (!value.trim()) {
        callback(new Error('标题不能为空'))
        return
      }
      if (value.trim().length > 140) {
        callback(new Error('标题最多输入140字符'))
        return
      }
      callback()
    }
    const checkShortDescription = (rule, value, callback) => {
      if (!value.trim()) {
        callback(new Error('短描述不能为空'))
        return
      }
      if (value.trim().length > 500) {
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
      priceRules: {
        short_description: [{ required: true, validator: checkShortDescription, trigger: ['blur', 'change'] }]
      },
      rule: {
        name: [{ required: true, validator: checkName, trigger: ['change', 'blur'] }],
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
      activeNames: ['0', '1', '2'],
      activeName: 'first',
      labelWidth: '220px',
      pictureList: [],
      button_inner: '编辑',
      is_edit: false,
      product_name: '',
      checkPickShow: true,
      defaultProps: {
        originalKey: 'image_path',
        thumbnailKey: 'product_image_thumb'
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
        const checkPriceForm = new Promise((resolve, reject) => {
          this.$refs['priceForm'].validate(v => {
            if (v) {
              resolve()
            }
            reject('Commodity information区域字段不合法，请输入正确格式')
          })
        })
        Promise.all([checkForm, checkPriceForm, checkOther]).then(res => {
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
              istore_product_id: this.cloneData.istore_product_id,
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
              content: this.category.length ? this.category[this.category.length - 1] : this.cloneData.category
            }
          ]
        }
      }
      return obj
    },
    // 切换编辑状态
    toggleEdit(val) {
      if (!val) {
        // 清除表单验证
        this.$refs['infoForm'].clearValidate()
        this.$refs['priceForm'].clearValidate()
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

.discriptionImage {
  background-color: #ebeef5;
  list-style: none;
  margin: 0;
  padding: 30px 0 0 0;

  li {
    margin: 0;
    padding: 0;

    img {
      width: 713px;
      margin: 0 15px;
    }
  }
}

@media (max-width: 1058px) {
  .discriptionImage > li > img {
    width: 100%;
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

.detail-form .information-form .el-form-item .el-form-item__content .no-back-ground {
  background: #fff !important;
}

.detail-form .pt-5 {
  padding-top: 5px;
}

.detail-form .pt-2 {
  padding-top: 2px;
}
</style>
