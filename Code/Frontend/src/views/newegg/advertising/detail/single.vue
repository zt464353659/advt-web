<template>
  <div>
    <div class="header-box">
      <label class="title">Basic Information(Normal)</label>
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
          >
            <el-row>
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
                <el-form-item label="Product ID(Seller Part#)">
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
                      @change="categoryChange"
                      style="width:100%"
                      v-model="category"
                    ></el-cascader>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <div
                  style="padding-left:240px;font-family: emoji;color:#cf9236;margin-bottom:10px;"
                  v-if="cloneData.specifics_tip && isEdit && (cloneData.attribute.specifics.length || cloneData.attribute.attribute.length)"
                >
                  <b>提示:&nbsp;</b>{{ cloneData.specifics_tip }}
                </div>
                <el-form-item label="区分项" v-if="cloneData.attribute.specifics && cloneData.attribute.specifics.length">
                  <el-form-item
                    v-for="(attr,ind) in cloneData.attribute.specifics"
                    :label="attr.attribute_name"
                    :key="ind"
                    :class="attr.is_required ? 'is-required-attr': 'is-spec'"
                  >
                    <div style="display: flex; width:100%;">
                      <el-select size="mini" v-model="attr.select_value" @change="attrSelectChange($event,attr)" :disabled="!isEdit || !canEditCategory" style="width:300px;" clearable>
                        <div class="attr-more-click" @click="openAttrDialog(attr, 'specifics')">
                          查看更多属性信息
                          <i class="el-icon-info"></i>
                        </div>
                        <el-option v-for="(option,index) in attr.options" :label="option" :value="option" :key="index"></el-option>
                      </el-select>
                      <el-input v-model="attr.value" disabled size="mini" clearable style="width:300px;"></el-input>
                      <el-popover
                        placement="top-start"
                        width="400"
                        trigger="hover"
                      >
                        <div>
                          <span v-if="attr.is_required">所有<span style="color:#F56C6C;transform: translateY(13px);display: inline-block;font-size:30px;">&nbsp;*&nbsp;</span>表示此项是必填，不可为空</span>
                          <span v-else>所有<span style="color:#409EFF;transform: translateY(13px);display: inline-block;font-size:30px;">&nbsp;*&nbsp;</span>表示此项至少要填一项</span>
                        </div>
                        <el-button slot="reference" type="text"><i class="el-icon-question"></i></el-button>
                      </el-popover>
                    </div>
                  </el-form-item>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="属性" v-if="cloneData.attribute.attribute && cloneData.attribute.attribute.length">
                  <el-form-item
                    v-for="(attr,ind) in cloneData.attribute.attribute"
                    :label="attr.attribute_name"
                    :key="ind"
                    :class="attr.is_required ? 'is-required-attr': ''"
                  >
                    <div style="display: flex; width:100%;">
                      <el-select size="mini" v-model="attr.select_value" @change="attrSelectChange($event,attr)" :disabled="!isEdit || !canEditCategory" style="width:300px" clearable>
                        <div class="attr-more-click" @click="openAttrDialog(attr,'attribute')">
                          查看更多属性信息
                          <i class="el-icon-info"></i>
                        </div>
                        <el-option v-for="(option,index) in attr.options" :label="option" :value="option" :key="index"></el-option>
                      </el-select>
                      <el-input v-model="attr.value" disabled size="mini" style="width:300px"></el-input>
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
          </el-form>
        </el-collapse-item>
        <el-collapse-item title="Commodity information" name="2">
          <el-form
            :ref="'priceForm'"
            :model="cloneData"
            :rules="priceFormRules"
            label-width="240px"
            size="small"
            class="price-form"
          >
            <el-row>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="Website Short Title" prop="name">
                  <div class="no-back-ground" v-if="isEdit && canEdit" prop="name">
                    <el-input v-model="cloneData.name" size="mini" clearable></el-input>
                    <div class="tip pt-2"><i class="el-icon-info"></i>请输入英语</div>
                  </div>
                  <p v-else>{{ cloneData.name.replace(/\s/g, '&nbsp;') }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="`保本价(${cloneData.currency_code})`">
                  <p>{{ cloneData.base_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="`原价(${cloneData.currency_code})`">
                  <p>{{ cloneData.total_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="`Selling Price(${cloneData.currency_code})`">
                  <p>{{ cloneData.discount_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="运输方式">
                  <p>{{ cloneData.shipping_method }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="`运费(${cloneData.currency_code})`">
                  <p>{{ cloneData.shipping_costs }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="打包费(CNY)">
                  <p>{{ cloneData.parcel_processing_fee }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Gross Margin(%)">
                  <p>{{ cloneData.gross_margin }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="汇率">
                  <p>{{ cloneData.currency_rate }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Commission Rate(%)">
                  <p>{{ cloneData.commission }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="UPC">
                  <p>{{ cloneData.upc }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Item Weight(g)">
                  <p>{{ cloneData.total_weight }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Inventory">
                  <p>{{ cloneData.quantity }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Item Dimensions(in.)">
                  <p>{{ `${ cloneData.length } * ${ cloneData.width } * ${ cloneData.height }` }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Packs Or Sets">
                  <p>{{ cloneData.packs_or_sets }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="图片" class="is-required-attr">
              <template>
                <div style="padding-right:50px;">
                  <picture-view
                    v-if="(cloneData.images && !isEdit)"
                    :pictureList="cloneData.images"
                    :defaultProps="defaultProps"
                    :width="100"
                    :height="100"
                    :spaceBetween="6"
                    :thumbnailWidth="80"
                    :thumbnailHeight="80"
                  ></picture-view>
                  <edit-image
                    v-if="cloneData.images && isEdit"
                    :pictureList="cloneData.images"
                    :is-edit="isEdit && canEdit"
                    :pictures="istorePictures[0].content"
                    :max-length="7"
                    :default-props="defaultProps"
                    :picture-key="'image_path'"
                    :thumb-url="'product_image_thumb'"
                    @emit-update-pictureList="updateImages"
                  ></edit-image>
                </div>
                <p v-if="isEdit && canEdit" class="no-back-ground tip pt-5"><i class="el-icon-info"></i>第一张为主图，最多可上传7张</p>
              </template>
            </el-form-item>
            <el-form-item label="Short Description" class="is-required-attr">
              <div class="no-back-ground">
                <el-input
                  :class="(isEdit && canEdit) ? '' : 'hidden-input-style'"
                  :readonly="!isEdit || !canEdit"
                  type="textarea"
                  :autosize="{ minRows: 8, maxRows: 100 }"
                  v-model="cloneData.short_description"
                  class="description"
                ></el-input>
                <div class="tip pt-5" v-if="isEdit && canEdit"><i class="el-icon-info"></i>请输入英语</div>
              </div>
            </el-form-item>
            <el-form-item label="Product Description" class="is-required-attr">
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
  name: 'SingleDetails',
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
      permissions: {
        edit: 'newegg.advt.advt.edit'
      },
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
      activeNames: ['0', '1', '2'],
      activeName: 'first',
      labelWidth: '240px',
      pictureList: [],
      button_inner: '编辑',
      is_edit: false,
      checkPickShow: true,
      defaultProps: {
        originalKey: 'image_path',
        thumbnailKey: 'product_image_thumb'
      },
      logOptions: {
        open: false,
        advtId: ''
      },
      attrOptions: {
        open: false,
        attr: {},
        detailData: {},
        type: ''
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
    formatAttr(attr) {
      this._.forEach(attr, v => {
        this._.forEach(v, v1 => {
          v1.select_value = ''
        })
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
          this.cloneData.attribute = this.formatAttr(res.data.attribute)
        }).catch(e => {
          loading.close()
          this.$message.error(e)
        })
      }
    },
    // 搜索属性设置
    setAttributes(type, val, newValue, index) {
      if (index === undefined) {
        this.cloneData.attribute[type].forEach(v => {
          if (v.attribute_id === val.attribute_id) {
            v.value = newValue
            v.select_value = newValue
          }
        })
      }
    },
    // 搜索区分项设置
    setSpecs(val, newValue, index) {
      if (index === undefined) {
        this.cloneData.attribute.specifics.forEach(v => {
          if (v.attribute_id === val.attribute_id) {
            v.value = newValue
            v.select_value = newValue
          }
        })
      }
    },
    openAttrDialog(attr, type) {
      this.attrOptions = {
        open: true,
        attr,
        detailData: this.detailData,
        type
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
    setContent(content) {
      this.cloneData.description = content
      sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
    },
    // 子产品图片更新
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
          if (!this.cloneData.images.length) {
            reject('产品图片不能为空')
          }
          if (!this.cloneData.short_description.trim() || this.cloneData.short_description.trim().length > 1000) {
            reject('短描述不能为空且最多输入1000个字符')
          }
          if (!this.cloneData.description.trim().length || this.cloneData.description.trim().length > 4000) {
            reject('产品描述不能为空且最多输入4000个字符')
          }
          resolve()
        })
        // Form验证
        const checkForm = new Promise((resolve, reject) => {
          this.$refs['priceForm'].validate(v => {
            if (v) {
              resolve()
            }
            reject('Commodity information区域数据输入不合法，请检查!')
          })
        })
        // 区分项、属性必填验证
        const checkAttr = new Promise((resolve, reject) => {
          this._.forEach(this.cloneData.attribute, v => {
            this._.forEach(v, v1 => {
              if (v1.is_required && !v1.value.trim()) {
                reject('必填属性和必填区分项不能为空')
              }
            })
          })
          resolve()
        })

        Promise.all([checkForm, checkOther, checkAttr]).then(res => {
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
        const obj = {
          istore_product_id: that.cloneData.istore_product_id,
          content: {}
        }
        that._.forEach(that.cloneData.attribute, v => {
          that._.forEach(v, v1 => {
            if (v1.value) {
              obj.content[v1.attribute_name] = v1.value
            }
          })
        })
        return obj
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
                short_description: this.cloneData.short_description.trim()
              }
            }
          ],
          images: formatAllImages(),
          category: [
            {
              istore_product_id: this.cloneData.istore_product_id,
              content: this.category.length ? this.category[this.category.length - 1] : this.cloneData.category_id
            }
          ],
          specifics: [formatSpec()]
        }
      }
      return obj
    },
    // 切换编辑状态
    toggleEdit(val) {
      // 取消保存还原页面数据
      if (!val) {
        this.category = []
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
        this.$message.error(e)
        loading.close()
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

.attr-more-click {
  cursor: pointer;
  font-size: 12px;
  color: #409EFF;
  padding: 5px;
  text-align: center;
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
