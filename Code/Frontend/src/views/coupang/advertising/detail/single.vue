<template>
  <div
    v-loading.lock="loading"
    element-loading-text="图片验证中"
    class="coupang_single_description"
  >
    <div class="header-box">
      <label class="title">Basic Information(Normal)</label>
      <el-row class="right-row">
        <el-button v-if="editShow"
                   type="primary" size="mini"
                   @click="noUpdate"
                   v-permission="permissionsEdit"
                   :disabled="is_disabled"
                   v-debounce
        >
          {{ button_inner }}
        </el-button>
        <el-button v-if="showBtn === '10102' && editShow"
                   type="success" size="mini" @click="examinePass(1)" v-permission="permissionsEdit"
                   :disabled="disabledBtn"
        >
          审核通过
        </el-button>
        <el-button v-if="showBtn === '10102' && editShow"
                   type="danger" size="mini" @click="examinePass(0)" v-permission="permissionsEdit"
                   :disabled="disabledBtn"
        >
          驳回
        </el-button>
      </el-row>
    </div>
    <!--内容区-->
    <div class="content-box coupang_info" style="padding-top: 0">
      <el-collapse v-model="activeNames">
        <el-collapse-item title="Listing Information" name="1">
          <el-form
            :label-width="labelWidth"
            size="small"
            class="information-form"
            :model="editForm"
            :rules="otherInforules"
            ref="basicInfo"
          >
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="广告ID">
                  <p>{{ editForm.id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Status">
                  <p>{{ editForm.status_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="广告名称" prop="former_product_name">
                  <p v-if="!is_edit" v-html="editForm.former_product_name"></p>
                  <template v-else>
                    <el-input
                      ref="product_name"
                      type="text"
                      size="mini"
                      clearable
                      placeholder="请输入内容"
                      v-model="editForm.former_product_name"
                      @clear="clearInput('product_name')"
                      @input="replaceSpace"
                      style="width: calc(98% - 200px);min-width: 200px;"
                    >
                    </el-input>
                    <el-tag size="small" :type="editForm.former_product_name.length > 150 ? 'danger' : 'success'">{{ editForm.former_product_name.length }}/150（限制文本150个字符）</el-tag>
                  </template>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="Coupang 分类">
                  <p>{{ editForm.category_name }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="editForm.product_info.attrbutes.length > 0">
              <el-col :xs="24" :sm="24" :md="12" :lg="12" v-for="(attrs, index) in editForm.product_info.attrbutes" :key="index" class="attribute_edit">
                <!--有单位-->
                <template v-if="attrs.optionStatus">
                  <el-form-item
                    :label="attrs.key"
                    :prop="'product_info.attrbutes.'+ index +'.inputValue'"
                    :rules="[{required: true, validator: basicInforules(), trigger: 'blur' }]"
                  >
                    <p v-if="!is_edit">{{ attrs.value }}</p>
                    <div v-else class="option_util">
                      <el-input type="text" v-model="attrs.inputValue"></el-input>
                      <el-select v-model="attrs.optionValue" placeholder="请选择" filterable style="width:150px; margin-left:10px">
                        <el-option
                          v-for="(item, childIndex) in attrs.option"
                          :key="childIndex"
                          :label="item"
                          :value="item"
                        >
                        </el-option>
                      </el-select>
                    </div>
                  </el-form-item>
                </template>
                <!--input-->
                <template v-else>
                  <el-form-item
                    :label="attrs.key"
                    :prop="'product_info.attrbutes.'+ index +'.value'"
                    :rules="[{required: true, validator: basicInforules(), trigger: 'blur' }]"
                  >
                    <p v-if="!is_edit">{{ attrs.value }}</p>
                    <el-input v-else v-model="attrs.value"></el-input>
                  </el-form-item>
                </template>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="总重(KG)">
                  <p>{{ editForm.product_info.total_weight }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="库存">
                  <p>{{ editForm.product_info.quantity }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="是否19禁" prop="forbid">
                  <template v-if="is_edit && $route.params.state !== '1002'">
                    <el-radio v-model="editForm.is_under_age" label="1" size="small">是</el-radio>
                    <el-radio v-model="editForm.is_under_age" label="0" size="small">否</el-radio>
                  </template>
                  <template v-else>
                    <p>{{ editForm.is_under_age === '1' ? '是' : '否' }}</p>
                  </template>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-collapse-item>

        <el-collapse-item title="Price" name="2">
          <el-form
            label-width="220px"
            size="small"
            class="price-form"
            :model="editForm.product_info"
            :rules="otherInforules"
            ref="otherInfo"
          >
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="istore 产品ID">
                  <p>{{ editForm.product_info.istore_product_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="account_name">
                  <p>{{ editForm.account_name }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="平台佣金(%)">
                  <p>{{ editForm.product_info.commission }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="毛利率(%)">
                  <p>{{ editForm.product_info.gross_margin }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="包装费(RMB)">
                  <p>{{ editForm.product_info.parcel_processing_fee }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="汇率">
                  <p>{{ editForm.product_info.currency_rate }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="iStore价格(KRW)" prop="discount_price">
                  <p>{{ editForm.product_info.discount_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="原价(KRW)">
                  <p>{{ editForm.product_info.total_price }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="保本价(KRW)">
                  <p>{{ editForm.product_info.base_price || 0 }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="图片" prop="images">
              <template>
                <template v-if="is_edit">
                  <edit-image
                    :pictureList="editForm.product_info.images"
                    :isEdit="is_edit && $route.params.state !== '1002'"
                    :pictures="editForm.product_info.istore_image_all"
                    :editimgageAction="{
                      account_id: this.editForm.account_id,
                      istore_product_id: this.editForm.product_info.istore_product_id,
                      max_size: 3,//最大三M,
                      isFile:true
                    }"
                    :max-length="10"
                    :default-props="defaultProps"
                    :picture-key="'image_path'"
                    :thumb-url="'thumb_image_path'"
                    @emit-update-pictureList="updateImageList"
                  ></edit-image>
                </template>
                <div v-else style="padding-right:50px">
                  <picture-view
                    ref="pictureview"
                    :pictureList="editForm.product_info.images"
                    :width="100"
                    :height="100"
                    :spaceBetween="6"
                    :thumbnailWidth="80"
                    :thumbnailHeight="80"
                    :defaultProps="defaultProps"
                  >
                  </picture-view>
                </div>
              </template>
            </el-form-item>
            <el-row>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="Key Word" prop="keyword">
                  <template v-if="!is_edit">
                    <div v-for="(element, index) in keywordarr(editForm.product_info.keyword)" :key="index">
                      <span style="display:inline-block;" v-html="element"></span>
                    </div>
                  </template>
                  <template v-else>
                    <el-input type="textarea" v-model="editForm.product_info.keyword" :autosize="{ minRows: 2, maxRows: 6 }" class="no-back-ground"></el-input>
                  </template>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="描述" prop="description">
              <div v-if="!is_edit">
                <div v-html="editForm.product_info.description" class="description"></div>
                <ul class="discriptionImage">
                  <li v-show="pic.is_description_picture" v-for="(pic,index) in editForm.product_info.images" :key="index">
                    <img :src="pic.product_image_url" alt="加载失败">
                  </li>
                </ul>
              </div>
              <template v-else>
                <tinymce
                  style="padding-left: 0px"
                  class="no-back-ground"
                  :class="tinymcestat?'tinymceborder':''"
                  @set-content="setContent"
                  v-model="editForm.product_info.description"
                  :height="400"
                  :plugins="plugins"
                  :uploadAction="uploadAction"
                  @success="uploadSuccess"
                  @blur="onEditorBlur"
                />
                <p class="tip-color">
                  <i class="el-icon-warning"></i>
                  描述中最多支持上传添加10张图片（不包含店铺公告）。
                </p>
              </template>
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import editImage from '@/views/coupang/advertising/detail/component/editImage'
import { changeDetail, wordReview, uploadoss } from '@/api/coupang'

export default {
  name: 'SingleDetails',
  components: { Tinymce, editImage },
  props: {
    detailData: {
      type: Object,
      required: true,
      default: () => {
      }
    },
    showBtn: {
      type: String,
      default: ''
    }
  },
  data() {
    const val_discountPrice = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('售价不能为空或者为0'))
      } else if (!/^[1-9]\d{0,}0(\.0*)?$/.test(value)) {
        return callback(new Error('售价必为10的正整数倍数,且不能有小数'))
      } else if (Number(value) < Number(this.editForm.product_info.base_price ? this.editForm.product_info.base_price : 0)) {
        return callback(new Error('售价不能小于保本价'))
      }
      callback()
    }
    const val_description = (rule, value, callback) => {
      let trimVal = value.replace(/<[^>]+>|&nbsp;+|\s+/g, '')
      trimVal = trimVal.replace(/&[a-z]+;/g, '*')
      if (trimVal.length === 0) {
        this.is_disabled = true
        this.tinymcestat = true
        return callback(new Error('描述不能为空或全为空格或空行'))
      }
      const imgs = value.match(/<img.*?(?:>|\/>)/gi)
      if (imgs && imgs.length > 10) {
        this.is_disabled = true
        this.tinymcestat = true
        return callback(new Error('描述中最多支持上传添加10张图片'))
      }
      callback()
      this.tinymcestat = false
      this.is_disabled = false
    }
    const val_former_product_name = (rule, value, callback) => {
      if (!value.trim()) {
        this.is_disabled = true
        return callback(new Error('广告名称内容不能为空'))
      } else if (value.length > 150) {
        this.is_disabled = true
        return callback(new Error('广告名称不能超过150个字符'))
      }
      callback()
      this.is_disabled = false
    }
    const val_key_word = (rule, value, callback) => {
      if (!value) {
        this.is_disabled = true
        return callback(new Error('key word不能为空'))
      }
      value.split('\n').forEach((item, index) => {
        if (item.length > 20) {
          this.is_disabled = true
          return callback(new Error('每个关键词字符数不能超过20个，最多可输入10个关键词'))
        }
        if (index > 9) {
          this.is_disabled = true
          return callback(new Error('每个关键词字符数不能超过20个，最多可输入10个关键词'))
        }
      })
      callback()
      this.is_disabled = false
    }
    return {
      disabledBtn: false,
      permissionsEdit: 'coupang.advt.update-advt.update',
      activeNames: ['1', '2'],
      labelWidth: '220px',
      pictureList: [],
      is_edit: false,
      loading: false,
      is_disabled: false,//按钮置灰
      tinymcestat: false,//富文本红框
      // price 验证
      otherInforules: {
        discount_price: [//iStore价格
          { validator: val_discountPrice, trigger: 'blur' }
        ],
        description: [
          { required: true, validator: val_description, trigger: 'blur' }
        ],
        former_product_name: [
          { required: true, validator: val_former_product_name, trigger: ['blur', 'change'] }
        ],
        keyword: [
          { required: true, validator: val_key_word, trigger: 'blur' }
        ]
      },
      // attr 上传属性
      attr: [],
      defaultProps: {
        originalKey: 'image_path',
        thumbnailKey: 'thumb_image_path'
      },
      editForm: {},
      resetForm: {},
      plugins: ['advlist anchor autolink autosave codesample colorpicker colorpicker contextmenu directionality emoticons fullscreen hr image imagetools insertdatetime link lists media nonbreaking noneditable pagebreak paste preview print save searchreplace spellchecker tabfocus table template textcolor textpattern visualblocks visualchars wordcount'],
      uploadAction: {
        api: (process.env.NODE_ENV === 'production' ? process.env.VUE_APP_BASE_API : '/api/') + 'coupang-new/advt/image/upload-oss',
        account_id: this.detailData.account_id,
        istore_product_id: this.detailData.product_info.istore_product_id,
        imgType: ['jpg']//图片类型
      }
    }
  },
  mounted() {
  },
  destroyed() {
    sessionStorage.removeItem('detal')
    document.querySelector('body').removeEventListener('click', this.setbox)
  },
  methods: {
    //重点来了
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
      let arrimg = this.editForm.product_info.description.match(/<img.*?(?:>|\/>)/gi)
      if (arrimg && arrimg.length > 9) {
        imginput.value = ''
        this.$message({
          message: '描述中最多支持上传添加10张图片',
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
        url: imginput.value.trim(),
        account_id: this.editForm.account_id,
        istore_product_id: this.editForm.product_info.istore_product_id
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
    //上传图片回调
    uploadSuccess() {
      let arrimg = this.editForm.product_info.description.match(/<img.*?(?:>|\/>)/gi)
      if (arrimg && arrimg.length > 9) {
        this.$message({
          message: '描述中最多添加10张图片',
          type: 'error'
        })
      } else {
        document.querySelector('div[check="标志"]').style.display = 'none'
        document.querySelectorAll('div[role=\'dialog\'][aria-label=\'Insert/edit image\'] div[tabindex=\'-1\'][role=\'button\']')[1].style.display = ''
      }
    },
    examinePass(type) {
      wordReview({
        advt_id: this.$route.params.id,
        status: type,
        not_show_message: true
      }).then(res => {
        this.$message.success(res.data)
        this.disabledBtn = true
        this.$emit('reload')
      }).catch(err => {
        this.$message.error(err)
      })
    },
    // 没有发生任何更改
    noUpdate() {
      // normal 属性中带单位的赋值, value = input + until
      // this._.forEach(this.editForm.product_info.attrbutes, item => {
      //   if (item.optionStatus) {
      //     item.value = this._.trim(item.inputValue) + item.optionValue.trim()
      //   }
      //   item.value = this._.trim(item.value)
      //   attr.push({ key: item.key.trim(), value: item.value })
      // })
      if (this.is_edit) {
        const detal = JSON.parse(sessionStorage.getItem('detal'))
        if (this._.isEqual(detal, this.editForm) || this._.isEmpty(this.requestPack().data)) {
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
    //请求数据组装
    requestPack() {
      const params = {
        'advt_id': this.editForm.id,
        'product_id': this.editForm.product_info.id,
        'account_id': this.editForm.account_id,
        'isJson': true,//以json提交数据
        'data': {}
      }
      const detal = JSON.parse(sessionStorage.getItem('detal'))
      if (!this._.isEqual(detal.former_product_name, this.editForm.former_product_name)) {
        params.data.title = [{
          'istore_product_id': this.editForm.product_info.istore_product_id,
          'content': this.editForm.former_product_name.trim()
        }]
      }
      if (!this._.isEqual(detal.product_info.attrbutes, this.editForm.product_info.attrbutes)) {
        params.data.attribute = [{
          'istore_product_id': this.editForm.product_info.istore_product_id,
          'content': this.editForm.product_info.attrbutes
        }]
      }
      if (!this._.isEqual(detal.is_under_age, this.editForm.is_under_age)) {
        params.data.is_under_age = [{
          'istore_product_id': this.editForm.product_info.istore_product_id,
          'content': this.editForm.is_under_age // 19禁止
        }]
      }
      //debugger
      // console.log(JSON.stringify(detal.product_info.images))
      // console.log('===========')
      // console.log(JSON.stringify(this.editForm.product_info.images))
      if (!this._.isEqual(detal.product_info.images, this.editForm.product_info.images)) {
        params.data.images = [{
          'istore_product_id': this.editForm.product_info.istore_product_id,
          'content': this.editForm.product_info.images
        }]
      }
      if (!this._.isEqual(detal.product_info.keyword, this.editForm.product_info.keyword)) {
        params.data.keywords = [{
          'istore_product_id': this.editForm.product_info.istore_product_id,
          'content': this._.compact(this.editForm.product_info.keyword.split('\n')).map((value) => {
            return value.trim()
          })// keyword
        }]
      }
      if (!this._.isEqual(detal.product_info.description, this.editForm.product_info.description)) {
        params.data.description = [{
          'istore_product_id': this.editForm.product_info.istore_product_id,
          'content': this.editForm.product_info.description // 描述
        }]
      }
      return params
    },
    // 编辑
    handleButtonChange() {
      const basic = new Promise((resolve, reject) => {
        this.$refs['basicInfo'].validate(valid => {
          if (valid) {
            resolve()
          } else {
            reject('Listing Information区域有错误，请查证')
          }
        })
      })
      const other = new Promise((resolve, reject) => {
        this.$refs['otherInfo'].validate(valid => {
          if (valid) {
            resolve()
          } else {
            reject('Price区域有错误，请查证')
          }
        })
      })
      const image = new Promise((resolve, reject) => {
        if (this.editForm.product_info.images.length < 1) {
          this.$message.error('图片不允许为空')
          reject('图片不允许为空')
        } else if (this.editForm.product_info.images.length > 10) {
          this.$message.error('图片最多允许添加10张')
          reject('图片最多允许添加10张')
        } else {
          resolve()
        }
      })
      Promise.all([basic, other, image]).then(() => {
        // 保存
        const loading = this.$loading({
          lock: true,
          text: '努力加载中',
          background: 'rgba(0, 0, 0, 0.5)'
        })
        changeDetail(this.requestPack()).then(response => {
          this.is_edit = false
          //this.$parent.init()
          this.$emit('reload')
          //每次提交后
          sessionStorage.removeItem('detal')
          // sessionStorage.setItem('detal', JSON.stringify(this._.cloneDeep(this.editForm)))
        }).finally(_ => {
          loading.close()
        })
      }).catch(err => {
        this.is_disabled = true
        console.error(err)
      })

    },
    // 清除标题后重新获取焦点，并触发校验
    clearInput(attr) {
      this.$refs[attr].focus()
    },
    // 编辑器校验调用
    onEditorBlur() {
      this.$refs['otherInfo'].validateField('description')
    },
    updateImageList(list) {
      this.editForm.product_info.images = list
    },
    basicInforules() {
      // 属性验证规则（非空）
      return (rule, value, callback) => {
        if (!this._.trim(value)) {
          this.is_disabled = true
          return callback(new Error('该属性不能为空'))
        }
        callback()
        this.is_disabled = false
      }
    },

    //富文本初始化后把转译内容返回给description
    setContent(content) {
      this.resetForm.product_info.description = content
      this.editForm.product_info.description = content
      if (!sessionStorage.getItem('detal')) {
        sessionStorage.setItem('detal', JSON.stringify(this._.cloneDeep(this.editForm)))
      }
    },
    keywordarr(keyword) {
      return keyword.split('\n')
    },
    //替换标题输入空格
    replaceSpace(value) {
      this.editForm.former_product_name = value.replace(/\s{2,}/g, ' ')
    }
  },
  computed: {
    // 是否存在编辑button
    editShow() {
      return [130, 1001, 1002].includes(Number(this.editForm.status))
    },
    // 编辑按钮展示内容
    button_inner() {
      return this.is_edit ? '保存并更新' : '编辑'
    }
  },
  watch: {
    detailData: {
      deep: true,
      immediate: true,
      handler(val) {
        this.detailData.is_under_age = String(this.detailData.is_under_age)
        this.is_edit = false
        this.editForm = this._.cloneDeep(this.detailData)
        this.resetForm = this._.cloneDeep(this.detailData)
      }
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


</style>
<style rel="stylesheet/scss" lang="scss">
.coupang_single {
  .description {
    padding: 5px 0 0 5px;

    img {
      width: calc(70% - 50px);
      height: calc(70% - 50px);
      margin: 0 15px;
    }
  }
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

@media (max-width: 1110px) {
  .discriptionImage > li > img {
    width: 95%;
  }
}

.price-form .el-form-item .el-form-item__content .no-back-ground {
  background: #fff;
}

.coupang_info {
  /*deep*/
  .el-form-item__error {
    background: #fff !important;
  }
}
</style>
