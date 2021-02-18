<template>
  <div>
    <div class="header-box">
      <!--      <div class="error-tip" v-if="cloneData.error_log_message && canEdit">-->
      <!--        错误信息: {{ cloneData.error_log_message }}-->
      <!--      </div>-->
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
          <div class="error-tip">
            {{ cloneData.error_log_message }}
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
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="目录">
                  <p>{{ `${ cloneData.category_name } [${ cloneData.category_id }]` }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item v-if="canEdit && isEdit" prop="category" label="选择新目录">
                  <el-cascader
                    placeholder="请选择目录"
                    :props="categoryProps"
                    :options="categoryList"
                    :filterable="true"
                    style="width:100%"
                    v-model="category"
                    class="no-back-ground"
                  ></el-cascader>
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
            :rules="infoRules"
            ref="infoForm"
          >
            <el-row>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="Title" prop="name" class="no-back-ground">
                  <el-input v-if="isEdit && canEdit" v-model="cloneData.name" size="mini" clearable></el-input>
                  <div class="tip pt-2" v-if="isEdit && canEdit"><i class="el-icon-info"></i>请输入英语</div>
                  <p v-else>{{ cloneData.name.replace(/\s/g,'&nbsp;') }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="`Base Price(${cloneData.currency_code})`">
                  <p>{{ cloneData.base_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="`Selling Price(${cloneData.currency_code})`">
                  <p>{{ cloneData.discount_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Gross Margin(%)">
                  <p>{{ cloneData.gross_margin }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Commission Rate(%)">
                  <p>{{ cloneData.commission }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Item Weight(lb.)">
                  <p>{{ cloneData.total_weight }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Inventory">
                  <p>{{ cloneData.quantity }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Product Dimensions(cm)">
                  <p>{{ `${ cloneData.length } × ${ cloneData.width } × ${ cloneData.high }` }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="packing Dimensions(cm)">
                  <p>{{ `${ cloneData.package_length } × ${ cloneData.package_width } × ${ cloneData.package_high }` }}</p>
                </el-form-item>
              </el-col>
              <!--                  <el-col :xs="24" :sm="24" :md="12" :lg="12" v-if="!isEdit">-->
              <!--                    <el-form-item label="packing Dimensions(cm)">-->
              <!--                      <p>{{ `${ cloneData.package_length } × ${ cloneData.package_width } × ${ cloneData.package_high }` }}</p>-->
              <!--                    </el-form-item>-->
              <!--                  </el-col>-->
              <!--                  <el-col :xs="24" :sm="24" :md="12" :lg="12" v-else>-->
              <!--                    <el-form-item label="packing Dimensions(cm)">-->
              <!--                      <el-row>-->
              <!--                        <el-col :xs="24" :sm="24" :md="8" :lg="8">-->
              <!--                          <el-form-item style="margin-bottom: 0" label="长" :inline="true" prop="package_length" label-width="50px">-->
              <!--                            <el-input v-model="cloneData.package_length" size="mini" style="width:50%;"></el-input>-->
              <!--                          </el-form-item>-->
              <!--                        </el-col>-->
              <!--                        <el-col :xs="24" :sm="24" :md="8" :lg="8">-->
              <!--                          <el-form-item style="margin-bottom: 0" label="宽" :inline="true" prop="package_width" label-width="50px">-->
              <!--                            <el-input v-model="cloneData.package_width" size="mini" style="width: 50%;margin-left: 10px;"></el-input>-->
              <!--                          </el-form-item>-->
              <!--                        </el-col>-->
              <!--                        <el-col :xs="24" :sm="24" :md="8" :lg="8">-->
              <!--                          <el-form-item style="margin-bottom: 0" label="高" :inline="true" prop="package_high" label-width="50px">-->
              <!--                            <el-input v-model="cloneData.package_high" size="mini" style="width: 50%;margin-left: 10px;"></el-input>-->
              <!--                          </el-form-item>-->
              <!--                        </el-col>-->
              <!--                      </el-row>-->
              <!--                    </el-form-item>-->
              <!--                  </el-col>-->
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Shipping Method">
                  <p>{{ cloneData.shipping_method || '无' }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="`Shipping Costs(${cloneData.currency_code})`">
                  <p>{{ cloneData.shipping_costs }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Parcel Processing Fee(CNY)">
                  <p>{{ cloneData.parcel_processing_fee }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Currency Rate">
                  <p>{{ cloneData.currency_rate }}</p>
                </el-form-item>
              </el-col>
              <template v-for="(item,index) in cloneData.category_attribute">
                <el-col :xs="24" :sm="24" :md="12" :lg="12" v-if="item.key !== 'dimensions' && item.key !== 'product_top_features'" :key="index">
                  <el-form-item :label="item.key">
                    <p>{{ item.value }}</p>
                  </el-form-item>
                </el-col>
              </template>
            </el-row>
            <el-form-item label="图片" class="is-required-attr">
              <template>
                <edit-image
                  v-if="isEdit && canEdit"
                  :pictureList="cloneData.images"
                  :is-edit="isEdit && canEdit"
                  :pictures="istorePictures[0].content"
                  :max-length="1000"
                  :default-props="defaultProps"
                  :picture-key="'image_path'"
                  :thumb-url="'product_image_thumb'"
                  @emit-update-pictureList="updateImages"
                ></edit-image>
                <p v-if="isEdit && canEdit" class="no-back-ground tip pt-5"><i class="el-icon-info"></i>第一张为主图</p>
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
            <el-form-item label="Product Top Features" prop="note">
              <div class="no-back-ground" v-if="canEdit && isEdit">
                <el-input type="textarea" v-model="cloneData.note" :autosize="{ minRows: 8, maxRows: 8}"></el-input>
                <div class="tip pd-5"><i class="el-icon-info"></i>请输入英语</div>
              </div>
              <div v-else class="text-wrap">{{ cloneData.note }}</div>
            </el-form-item>
            <el-form-item label="Product Description" class="is-required-attr">
              <tinymce
                v-if="isEdit && canEdit"
                @set-content="setContent"
                v-model="cloneData.description"
                :height="400"
                class="no-back-ground"
              />
              <div class="tip pd-5" v-if="isEdit && canEdit"><i class="el-icon-info"></i>请输入英语</div>
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
import { editDetail, getEditData, fetchDetail } from '@/api/tiki'

export default {
  name: 'SingleDetails',
  components: { istoreLog, editImage, Tinymce },
  props: {
    detailData: {
      type: Object,
      required: true,
      default: () => {
      }
    }
  },
  data() {
    return {
      permissions: {
        edit: 'tiki.advt.advt.edit'
      },
      category: [],
      categoryProps: {
        value: 'category_id',
        label: 'name',
        children: '_child'
      },
      categoryList: [],
      infoRules: {
        name: [{ required: true, message: '标题不能为空！', trigger: 'blur' }],
        note: [{ required: true, message: 'Product Top Features 不能为空', trigger: 'blur' }]
      },
      istorePictures: [],
      formKey: new Date().getTime(),
      cloneData: {},
      canEdit: false,
      isEdit: false,
      advt_id: this.$route.params.id,
      activeNames: ['0', '1', '2'],
      activeName: 'first',
      labelWidth: '220px',
      pictureList: [],
      button_inner: '编辑',
      is_edit: false,
      defaultProps: {
        originalKey: 'image_path',
        thumbnailKey: 'product_image_thumb'
      },
      //日志
      logOptions: {
        open: false,
        advtId: ''
      }
    }
  },
  created() {
    // 是否是可编辑状态 draft ==100、Upload Error ==170、Approve Error ==180 状态产品详情页新增编辑功能
    this.canEdit = [100, 170, 180].includes(Number(this.detailData.advt_status))
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
        this.canEdit = [100, 170, 180].includes(Number(this.cloneData.advt_status))
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
          if (!this.cloneData.images.length) {
            reject('主图不能为空')
          }
          if (!this.cloneData.description.length) {
            reject('描述不能为空')
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
            background: 'rgba(0, 0, 0, 0.5)'
          })
          editDetail(this.formatEditData()).then(() => {
            // 退出编辑状态，更新数据
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
              product_image_thumb: v.product_image_thumb ? v.product_image_thumb : v.image_path
            }
          })
        }
        arr.push(obj)
        return arr
      }

      const obj = {
        advt_id: this.cloneData.advt_id,
        account_id: this.cloneData.account_id,
        data: {
          title: [
            {
              istore_product_id: this.cloneData.istore_product_id,
              content: this.cloneData.name.trim()
            }
          ],
          description: [
            {
              istore_product_id: this.cloneData.istore_product_id,
              content: {
                description: this.cloneData.description.trim() === JSON.parse(sessionStorage.copyData).description.trim() ? '' : this.cloneData.description.trim(),
                note: this.cloneData.note.trim()
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
      // 取消保存还原页面数据及目录选择,清除已触发的表单验证
      if (!val) {
        this.$refs['infoForm'].clearValidate()
        this.cloneData = JSON.parse(sessionStorage.getItem('copyData'))
        this.category = []
        this.isEdit = false
      } else {
        // 拉取编辑数据，拉取成功进入编辑状态
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

.text-wrap {
  white-space: pre-wrap;
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

.detail-form .information-form .el-form-item .el-form-item__content .el-cascader--small {
  background: #fff !important;
}

.detail-form .pt-5 {
  padding-top: 5px;
}

.detail-form .pt-2 {
  padding-top: 2px;
}
</style>
