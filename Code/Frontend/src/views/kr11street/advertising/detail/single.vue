<template>
  <div
    v-loading.lock="loading"
    element-loading-text="图片验证中"
  >
    <div class="header-box">
      <label class="title">Basic Information(Normal)</label>
      <el-row class="right-row">
        <el-button v-if="editShow"
                   type="primary"
                   size="mini"
                   @click="noUpdate"
                   v-permission="permissions.updateTitle"
                   :disabled="isdisabled"
        >
          {{ button_inner }}
        </el-button>
      </el-row>
    </div>
    <!--内容区-->
    <!--  TODO: price-form类目为了隐藏图片编辑上的删除按钮    -->
    <el-form
      :label-width="labelWidth"
      size="small"
      class="information-form price-form"
      :model="detailData"
      :rules="rules"
      ref="detailDatas"
    >
      <div class="content-box">
        <el-collapse v-model="activeNames">
          <el-collapse-item title="Listing Information" name="1" class="editAttribut">
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="广告ID">
                  <p>{{ detailData.id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Status">
                  <p>{{ detailData.status_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="广告名称" prop="product_name">
                  <template v-if="is_edit">
                    <el-input
                      type="text"
                      size="mini"
                      clearable
                      placeholder="请输入内容"
                      v-model="detailData.product_name"
                      style="width: calc(98% - 200px);min-width: 200px;"
                      @input="replaceSpace"
                    >
                    </el-input>
                    <el-tag size="small" :type="detailData.product_name.length > 100 ? 'danger' : 'success'">{{ detailData.product_name.length }}/100（限制文本100个字符）</el-tag>
                  </template>
                  <p v-else>{{ detailData.product_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="Kr11Street 分类">
                  <p>{{ detailData.category_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="总重(G)">
                  <p>{{ detailData.product_info.total_weight }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="库存">
                  <p>{{ detailData.product_info.quantity }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="是否19禁" prop="forbid">
                  <p v-if="!is_edit">{{ Number(detailData.is_under_age) === 1 ? '是' : '否' }}</p>
                  <el-radio v-if="is_edit" v-model="detailData.is_under_age" :label="1" size="small">是</el-radio>
                  <el-radio v-if="is_edit" v-model="detailData.is_under_age" :label="0" size="small">否</el-radio>
                </el-form-item>
              </el-col>
            </el-row>
          </el-collapse-item>

          <el-collapse-item title="Price" name="2">
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="istore 产品ID">
                  <p>{{ detailData.product_info.istore_product_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="account_name">
                  <p>{{ detailData.account_name }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="平台佣金(%)">
                  <p>{{ detailData.product_info.commission }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="毛利率(%)">
                  <p>{{ detailData.product_info.gross_margin }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="包装费(RMB)">
                  <p>{{ detailData.product_info.parcel_processing_fee }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="汇率">
                  <p>{{ detailData.product_info.currency_rate }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="iStore价格(KRW)">
                  <p>{{ detailData.product_info.discount_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="原价(KRW)">
                  <p>{{ detailData.product_info.total_price }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="运费(KRW)">
                  <p>{{ detailData.product_info.shipping_costs }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="图片">
              <picture-view
                ref="pictureview"
                class="no_picture_delete"
                :pictureList="detailData.product_info.images"
                :width="100"
                :height="100"
                :spaceBetween="6"
                :thumbnailWidth="80"
                :thumbnailHeight="80"
                :isEdit="is_edit"
                @updateList="updateImageList"
                :defaultProps="defaultProps"
              >
              </picture-view>
              <p class="tip-color">
                <i class="el-icon-warning"></i>
                平台支持最多上传5张图片，默认第一张为主图（编辑状态支持拖动图片顺序）。
              </p>
            </el-form-item>
            <el-form-item label="描述">
              <template v-if="is_edit">
                <tinymce
                  style="padding-left: 0px"
                  @set-content="setContent"
                  class="no-back-ground"
                  :class="tinymceTitle!==''?'tinymceborder':''"
                  :uploadAction="uploadAction"
                  :plugins="plugins"
                  v-model="detailData.product_info.description"
                  :height="400"
                  @success="uploadSuccess"
                  @blur="onEditorBlur"
                />
                <p class="tip-color">
                  <i class="el-icon-warning"></i>
                  描述中最多支持上传添加5张图片（不包含店铺公告）。
                  <span style="color: red;padding-left: 5px">{{ tinymceTitle }}</span>
                </p>
              </template>
              <div class="description" v-else>
                <div v-html="detailData.product_info.description"></div>
                <div>
                  <p v-if="pic.is_description_picture" v-for="(pic, index) in detailData.product_info.images" :key="index">
                    <img :src="pic.product_image_url" alt="加载失败">
                  </p>
                </div>
              </div>
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-form>
  </div>
</template>
<script>
import Tinymce from '@/components/Tinymce'
import { changeDetail, uploadoss, fetchDetail } from '@/api/kr11street'
// 静态变量
import advertStatic from '../common/static'

export default {
  name: 'SingleDetails',
  components: { Tinymce },
  props: {
    detailData: {
      type: Object,
      required: true,
      default: () => {
      }
    }
  },
  data() {
    const product_name = (rule, value, callback) => {
      if (!value.trim()) {
        this.isdisabled = true
        return callback(new Error('广告名称内容不能为空'))
      } else if (value.length > 100) {
        this.isdisabled = true
        return callback(new Error('广告名称不能超过100个字符'))
      }
      callback()
      this.isdisabled = false
    }
    return {
      rules: {
        product_name: [{ required: true, validator: product_name, trigger: ['blur', 'change'] }]
      },
      isdisabled: false,
      tinymceTitle: '',
      PRODUCT_STATUS_CODE: advertStatic.productStatusCode,
      permissions: advertStatic.permissions,
      activeNames: ['1', '2'],
      labelWidth: '220px',
      pictureList: [],
      is_edit: false,
      defaultProps: {
        originalKey: 'image',
        thumbnailKey: 'icon_image'
      },
      loading: false,
      uploadAction: {
        api: (process.env.NODE_ENV === 'production' ? process.env.VUE_APP_BASE_API : '/api/') + 'kr11street-new/advt/image/upload-oss',
        account_id: this.detailData.account_id,
        istore_product_id: this.detailData.product_info.istore_product_id,
        url: '',
        imgType: ['jpg', 'jpeg', 'png']//图片类型
      },
      //自定义plugins，为了屏蔽富文本源代码操作
      plugins: ['advlist anchor autolink autosave codesample colorpicker colorpicker contextmenu directionality emoticons fullscreen hr image imagetools insertdatetime link lists media nonbreaking noneditable pagebreak paste preview print save searchreplace spellchecker tabfocus table template textcolor textpattern visualblocks visualchars wordcount']
    }
  },
  destroyed() {
    sessionStorage.removeItem('detal'),
      document.querySelector('body').removeEventListener('click', this.setbox)
  },
  watch: {
    'detailData.product_info': {
      immediate: true,
      deep: true,
      handler(val) {
        this.$nextTick(function() {
          const images = document.querySelector('.description') ? Array.from(document.querySelector('.description').getElementsByTagName('img')) : []
          images.forEach((img) => {
            console.log(img)
            if (img) {
              const clientWidth = img.clientWidth
              const width = img.getAttribute('width')
              const height = img.getAttribute('height')
              const clientHeight = clientWidth * height / width
              img.style.height = clientHeight + 'px'
            }
          })
        })
      }
    }
  },
  create() {
  },
  methods: {
    getBox() {
      let box = document.querySelector('body')
      if (box) {
        box.addEventListener('click', this.setbox)
      }
    },
    setbox() {
      let that = this
      let imgbox = document.querySelector('div[role=\'dialog\'][aria-label=\'Insert/edit image\']')
      if (imgbox) {
        let imginput = document.querySelector('input[hidefocus="1"][placeholder]')
        let imgbut = imgbox.querySelectorAll('div[role=\'dialog\'][aria-label=\'Insert/edit image\'] div[tabindex=\'-1\'][role=\'button\']')
        imginput.setAttribute('placeholder', '请输入url')
        if (!imgbox.querySelector('div[check="标志"]')) {
          const checkButton = ` <div style="color: #fff;display:block;
                                            background-color: #409eff;border-color: #409eff; width: 60px;height: 20px;text-align: center;top: 10px;position: absolute;  left: 252px;padding: 5px 5px;
                                            " check="标志" >链接校验</div>`
          imgbut[1].insertAdjacentHTML('beforebegin', checkButton)
          imgbut[1].style.display = 'none'
        }
        document.querySelector('div[check="标志"]').onclick = function() {
          console.log('onclick')
          that.checkImg(imginput)
        }
      }
    },
    checkImg(imginput) {
      let ossurl = /(?:https?:\/\/)dr\.szecommerce.com\/?/
      const reg = /(http|https):\/\/([\w.]+\/?)\S*/
      let arrimg = this.detailData.product_info.description.match(/<img.*?(?:>|\/>)/gi)
      if (arrimg && arrimg.length > 4) {
        imginput.value = ''
        this.$message({
          message: '描述中最多支持上传添加5张图片',
          type: 'error'
        })
      } else {
        //如果点击按钮后，内容是空
        if (imginput.value === '') {
          //什么都不做
        } else if (!reg.test(imginput.value)) {
          this.$message({
            message: '请输入http://或https://开头的地址',
            type: 'error'
          })
          imginput.value = ''
        } else if (imginput.value.match(/(http:\/\/|https:\/\/)/gi) && imginput.value.match(/(http:\/\/|https:\/\/)/gi).length > 1) {
          this.$message({
            message: '请输入一条url链接',
            type: 'error'
          })
          imginput.value = ''
        } else {
          //不是平台oss地址
          if (!ossurl.test(imginput.value)) {
            this.loading = true
            this.getimg(imginput)
          } else {
            document.querySelectorAll('div[role=\'dialog\'][aria-label=\'Insert/edit image\'] div[tabindex=\'-1\'][role=\'button\']')[1].style.display = ''
            document.querySelector('div[check="标志"]').style.display = 'none'
          }
        }
      }
    },
    getimg(imginput) {
      let fromdata = {
        url: imginput.value,
        account_id: this.detailData.account_id,
        istore_product_id: this.detailData.product_info.istore_product_id
      }
      imginput.value = ''
      uploadoss(fromdata).then((res) => {
        imginput.value = res.data.url
        document.querySelector('div[check="标志"]').style.display = 'none'
        document.querySelectorAll('div[role=\'dialog\'][aria-label=\'Insert/edit image\'] div[tabindex=\'-1\'][role=\'button\']')[1].style.display = ''
      }).finally(() => {
        this.loading = false
      })
    },
    uploadSuccess() {
      let arrimg = this.detailData.product_info.description.match(/<img.*?(?:>|\/>)/gi)
      if (arrimg && arrimg.length > 4) {
        this.$message({
          message: '描述中最多添加5张图片',
          type: 'error'
        })
      } else {
        document.querySelector('div[check="标志"]').style.display = 'none'
        document.querySelectorAll('div[role=\'dialog\'][aria-label=\'Insert/edit image\'] div[tabindex=\'-1\'][role=\'button\']')[1].style.display = ''
      }
    },
    //标题空格替换
    replaceSpace(value) {
      this.detailData.product_name = value.replace(/\s{2,}/g, ' ')
    },
    // 编辑器校验调用
    onEditorBlur() {
      let arrimg = this.detailData.product_info.description.match(/<img.*?(?:>|\/>)/gi)
      let trimVal = this.detailData.product_info.description.replace(/<[^>]+>|&nbsp;+|\s+/g, '').replace(/&[a-z]+;/g, '*')
      if (!trimVal.length) {
        this.isdisabled = true
        this.tinymceTitle = '描述不能为空或全为空格或空行'
        return false
      } else if (arrimg && arrimg.length > 5) {
        this.isdisabled = true
        this.tinymceTitle = '描述中最多添加5张图片'
        return false
      } else {
        this.isdisabled = false
        this.tinymceTitle = ''
        return true
      }
    },
    // 没有发生任何更改
    noUpdate() {
      if (this.is_edit) {
        const detal = JSON.parse(sessionStorage.getItem('detal'))
        if (this._.isEqual(detal, this.detailData)||this._.isEmpty(this.createEditParam().data)) {
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
        this.getBox()
      }
    },
    // 编辑
    createEditParam() {
      const params = {
        'advt_id': this.detailData.id,
        'product_id': this.detailData.product_info.id,
        'account_id': this.detailData.account_id,
        'isJson': true,//以json提交数据
        'data': {}
      }
      const detal = JSON.parse(sessionStorage.getItem('detal'))
      if (!this._.isEqual(detal.product_name, this.detailData.product_name)) {
        params.data.title = [{
          'istore_product_id': this.detailData.product_info.istore_product_id,
          'content': this.detailData.product_name.trim()
        }]
      }
      if (!this._.isEqual(detal.is_under_age, this.detailData.is_under_age)) {
        params.data.is_under_age = [{
          'istore_product_id': this.detailData.product_info.istore_product_id,
          'content': this.detailData.is_under_age // 19禁止
        }]
      }
      if (!this._.isEqual(detal.product_info.images, this.detailData.product_info.images)) {
        let imgarr = this._.map(this.detailData.product_info.images, function(value) {
          return { 'image_path': value.image, 'thumb_image_path': value.icon_image }
        })
        params.data.images = [{
          'istore_product_id': this.detailData.product_info.istore_product_id,
          'content': imgarr
        }]
      }
      if (!this._.isEqual(detal.product_info.description, this.detailData.product_info.description)) {
        params.data.description = [{
          'istore_product_id': this.detailData.product_info.istore_product_id,
          'content': this.detailData.product_info.description // 描述
        }]
      }
      return params
    },
    handleButtonChange() {
      this.$refs['detailDatas'].validate((valid) => {
        if (valid && this.onEditorBlur()) {
          // 保存
          const loading = this.$loading({
            lock: true,
            text: '努力加载中',
            background: 'rgba(0, 0, 0, 0.5)'
          })
          changeDetail(this.createEditParam()).then(response => {
            this.is_edit = false
            this.$parent.init()
            //每次提交后
            sessionStorage.setItem('detal', JSON.stringify(this._.cloneDeep(this.detailData)))
          }).finally(() => {
            loading.close()
          })
        } else {
          this.isdisabled = true
        }
      })
    },
    updateImageList(list) {
      this.detailData.product_info.images = list
    },
    setContent(content) {
      this.detailData.product_info.description = content
      if (!sessionStorage.getItem('detal')) {
        sessionStorage.setItem('detal', JSON.stringify(this._.cloneDeep(this.detailData)))
      }
    }
  }
  ,
  computed: {
    editShow() {
      //is_remove 0/1  1为加入下架队列，不可编辑
      //kr7 账号不可编辑
      return Number(this.detailData.is_remove) === 0 && [1004, 103].includes(this.detailData.status) && this.detailData.product_info.site_code !== '11st.co.kr7'
    }
    ,

    button_inner() {
      return this.is_edit ? Number(this.detailData.status) === 1001 ? '保存并上架' : '保存并更新' : '编辑'
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.tinymceborder {
  border: 1px solid red;
  border-right: 3px solid red;
}



.tip-color {
  color: #E6A23C;
  line-height: 30px;
  font-size: 14px;
  background-color: transparent !important;
}

::v-deep .description {
  padding: 6px 10px !important;

  p {
    &:first-child {
      margin-top: 0;
    }

    margin-top: 6px;
    margin-bottom: 0;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  img {
    /*width: 90%;*/
    /*min-width: 200px;*/
    max-width: 800px;
    /*height: auto;*/
    /*overflow: hidden;*/
  }
}

</style>
<style rel="stylesheet/scss" lang="scss">
.editAttribut .el-form-item__content .el-form-item__error {
  background-color: transparent !important;
}
</style>
