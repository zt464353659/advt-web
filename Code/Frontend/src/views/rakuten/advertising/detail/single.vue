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
            :model="cloneData.product_info"
            :rules="infoRules"
            ref="infoForm"
          >
            <el-row>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="广告名称" prop="title">
                  <div class="no-back-ground" v-if="isEdit && canEdit">
                    <el-input v-model="cloneData.product_info.title" size="mini" clearable></el-input>
                    <div class="tip pt-2"><i class="el-icon-info"></i>请输入日文</div>
                  </div>
                  <p v-else>{{ cloneData.product_info.title.replace(/\s/g,'&nbsp;') }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="account name">
                  <p>{{ cloneData.account }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="广告ID">
                  <p>{{ cloneData.product_info.advt_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="iStore Product ID">
                  <p>{{ cloneData.product_info.istore_product_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="平台产品 ID">
                  <p>{{ cloneData.product_info.spu_id }}</p>
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
                  <p>{{ `${ cloneData.category_path } [${ cloneData.category_id }]` }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24" v-if="canEditCategory && isEdit">
                <el-form-item label="新目录ID" prop="category_id">
                  <div class="no-back-ground">
                    <el-input v-model="category" size="mini" clearable @blur="getInputCategoryPath(category)"></el-input>
                    <div>
                      <span v-if="showLoading"><i class="el-icon-loading"></i></span>
                      <span v-if="category_path"> {{ `${category_path} [${category}]` }}</span>
                    </div>
                    <div class="tip pt-2"><i class="el-icon-info"></i>目录ID只能为纯数字</div>
                  </div>
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
          >
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="保本价(JPY)">
                  <p>{{ cloneData.product_info.base_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="价格(JPY)">
                  <p>{{ cloneData.product_info.discount_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="毛利率(%)">
                  <p>{{ cloneData.product_info.gross_margin }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="重量(g)">
                  <p>{{ cloneData.product_info.total_weight }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="尺寸 (长 * 宽 * 高 cm)">
                  <p>{{ `${ cloneData.product_info.length } * ${ cloneData.product_info.width } * ${ cloneData.product_info.height }` }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="图片" class="is-required-attr">
              <template>
                <edit-image
                  v-if="isEdit && canEdit"
                  :pictureList="cloneData.product_info.images"
                  :is-edit="isEdit && canEdit"
                  :pictures="istorePictures.filter(v => Number(v.istore_product_id) === Number(cloneData.product_info.istore_product_id))[0].content"
                  :max-length="1000"
                  :default-props="defaultProps"
                  :picture-key="'image_path'"
                  :thumb-url="'product_image_thumb'"
                  @emit-update-pictureList="updateImages"
                ></edit-image>
                <p v-if="isEdit && canEdit" class="no-back-ground pt-5 tip"><i class="el-icon-info"></i>第一张为主图</p>
                <div v-else style="padding-right:50px">
                  <picture-view
                    :pictureList="cloneData.product_info.images"
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
            <el-form-item label="描述" class="is-required-attr">
              <div class="no-back-ground" v-if="isEdit && canEdit">
                <tinymce
                  @set-content="setContent"
                  v-model="cloneData.product_info.description"
                  :height="400"
                  class="no-back-ground"
                />
                <div class="tip pt-5"><i class="el-icon-info"></i>请输入日文</div>
              </div>
              <div v-else v-html="cloneData.product_info.description" class="description"></div>
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
import { editDetail, fetchDetail, getEditData } from '@/api/rakuten'

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
    const checkTitle = (rule, value, callback) => {
      if (!value.trim()) {
        callback(new Error('标题不能为空'))
        return
      }
      if (value.trim().length > 255) {
        callback(new Error('标题最多输入255字符'))
        return
      }
      callback()
    }
    const checkCategory = (rule, value, callback) => {
      if (this.category && !/^\d+$/.test(this.category)) {
        callback(new Error('目录ID只能为纯数字'))
        return
      }
      callback()
    }
    return {
      permissions: {
        edit: 'rakuten.advt.advt.edit'
      },
      showLoading: false,
      category_path: '',
      category: '',
      infoRules: {
        title: [{ required: true, validator: checkTitle, trigger: 'blur' }],
        category_id: [{ validator: checkCategory, trigger: ['blur', 'change'] }]
      },
      istorePictures: [],
      cloneData: {},
      canEdit: false,
      isEdit: false,
      canEditCategory: false,
      advt_id: this.$route.params.id,
      activeName: 'first',
      activeNames: ['0', '1', '2'],
      labelWidth: '220px',
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
    // 是否是可编辑状态 onLine ==110、Upload Error ==140、 状态产品详情页新增编辑功能
    // Upload Error状态下可编辑广告标题，描述，目录ID，图片，区分项。编辑目录ID
    // OnLine状态下可编辑广告标题，描述，图片
    this.canEdit = [110, 140].includes(Number(this.detailData.status))
    // this.canEditCategory = this.detailData.status === 140
    this.canEditCategory = [110, 140].includes(Number(this.detailData.status))
    this.cloneData = this._.cloneDeep(this.detailData)
    sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
  },
  mounted() {
    this.setImageWidth()
  },
  methods: {
    getInputCategoryPath(val) {
      if (!val.trim()) {
        this.category_path = ''
      }
      if (/^\d+$/.test(val)) {
        this.showLoading = true
        const params = {
          advt_id: this.detailData.advt_id,
          account_id: this.detailData.account_id,
          istore_product_id: this.detailData.product_info.istore_product_id,
          type: ['category'],
          category_id: this.category
        }
        getEditData(params).then(res => {
          this.showLoading = false
          this.category_path = Array.isArray(res.data.category) ? '' : res.data.category.tree
        }).catch(() => {
          this.showLoading = false
        })
      } else {
        this.showLoading = false
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
        this.canEdit = [110, 140].includes(Number(this.cloneData.status))
        // this.canEditCategory = this.cloneData.status === 140
        this.canEditCategory = [110, 140].includes(Number(this.cloneData.status))
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
      this.cloneData.product_info.description = content
      sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
    },
    // 图片更新,主产品图片
    updateImages(list) {
      if (list) {
        this.cloneData.product_info.images = list
      }
    },
    saveEdit() {
      // 保存编辑数据
      // 产品数据是否发生改变
      if (this._.isEqual(JSON.stringify(this.cloneData), sessionStorage.getItem('copyData')) && ((!this.category) || Number(this.category) === Number(this.cloneData.category_id))) {
        this.$message.warning('该广告数据未发生变化')
      } else {
        const checkOther = new Promise((resolve, reject) => {
          // 主图是否为空
          if (!this.cloneData.product_info.images.length) {
            reject('主图不能为空')
          }
          if (!this.cloneData.product_info.description.trim().length || this.cloneData.product_info.description.trim().length > 10240) {
            reject('描述不能为空且最多输入10240字符')
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
          istore_product_id: that.cloneData.product_info.istore_product_id,
          content: that.cloneData.product_info.images.map(v => {
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
              istore_product_id: this.cloneData.product_info.istore_product_id,
              content: this.cloneData.product_info.title.trim()
            }
          ],
          description: [
            {
              istore_product_id: this.cloneData.product_info.istore_product_id,
              content: { description: this.cloneData.product_info.description.trim() === JSON.parse(sessionStorage.copyData).product_info.description.trim() ? '' : this.cloneData.product_info.description.trim() }
            }
          ],
          images: formatAllImages(),
          category: [
            {
              istore_product_id: this.cloneData.product_info.istore_product_id,
              content: this.category ? this.category : this.cloneData.product_info.category_id
            }
          ]
        }
      }
      return obj
    },
    // 切换编辑状态
    toggleEdit(val) {
      // 取消保存还原页面数据
      if (!val) {
        this.category = ''
        this.showLoading = false
        this.category_path = ''
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
        istore_product_id: this.detailData.product_info.istore_product_id,
        type: ['images', 'category'],
        category_id: this.detailData.category_id
      }
      getEditData(params).then(res => {
        loading.close()
        this.isEdit = true
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
