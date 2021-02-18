<template>
  <div
    v-loading.lock="loading"
    element-loading-text="图片验证中"
    class="coupang_variation_description"
  >
    <div class="header-box">
      <label class="title">Basic Information(variation)</label>
      <el-row class="right-row">
        <el-button v-if="editShow"
                   type="primary"
                   size="mini"
                   @click="noUpdate"
                   :disabled="is_disabled"
                   v-permission="permissionsEdit"
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
            :rules="basicInforules"
            ref="basicInfo"
          >
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Coupang account">
                  <p>{{ editForm.account_name }}</p>
                </el-form-item>
              </el-col>
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
              <!-- <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="库存">
                  <p>{{ editForm.product_info.data.quantity }}</p>
                </el-form-item>
              </el-col> -->
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="广告名称" prop="former_product_name">
                  <template v-if="is_edit">
                    <el-input
                      type="text"
                      size="mini"
                      clearable
                      placeholder="请输入内容"
                      v-model="editForm.former_product_name"
                      ref="product_name"
                      @clear="clearInput('product_name')"
                      @input="replaceSpace"
                      style="width: calc(98% - 200px);min-width: 200px;"
                    >
                    </el-input>
                    <el-tag size="small" :type="editForm.former_product_name.length > 150 ? 'danger' : 'success'">{{ editForm.former_product_name.length }}/150（限制文本150个字符）</el-tag>
                  </template>
                  <p v-else v-html="editForm.former_product_name"></p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="12">
                <el-form-item label="Coupang 分类">
                  <p>{{ editForm.category_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="12">
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
          <el-collapse v-model="activeNames2" class="product-collapse">
            <el-collapse-item
              :title="item.name"
              :name="index"
              v-for="(item, index) in editForm.product_info.list"
              :key="item.id"
            >
              <el-form
                label-width="220px"
                size="small"
                class="price-form"
                :model="item"
                :rules="basicInforules"
                :ref="'otherInfo'+ index"
              >
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="istore 产品ID">
                      <p>{{ item.istore_product_id }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="总重(KG)">
                      <p>{{ item.total_weight }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="iStore价格(KRW)" prop="discount_price">
                      <!-- <p v-if="!is_edit">{{ item.discount_price }}</p>
                      <el-input v-else
                                type="text"
                                size="mini"
                                clearable
                                placeholder="请输入售价"
                                v-model.trim="item.discount_price"
                                :ref="'other' + index"
                                @clear="clearInput('other'+ index)"
                      >
                      </el-input> -->
                      <p>{{ `${parseInt(item.discount_price)}.00` }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="原价(KRW)">
                      <p>{{ item.total_price }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="保本价(KRW)">
                      <p>{{ item.base_price || 0 }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="库存">
                      <p>{{ item.quantity }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="状态">
                      <p>{{ item.status_name }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <!--必填属性-->
                <el-row v-if="item.attrbutes.length > 0">
                  <el-col :xs="24" :sm="24" :md="12" :lg="12" v-for="(v,k) in item.attrbutes" :key="k" class="attribute_edit">
                    <!--el-form-item 中的prop绑定的值必须是el-form v-model绑定值得子属性，否则elementUI报错-->
                    <!--有单位-->
                    <template v-if="v.optionStatus">
                      <el-form-item :label="v.key" :prop="'attrbutes.'+ k +'.inputValue'" class="attr-class" :rules="[{required: true, validator: attBasicInforules(), trigger: 'blur' }]">
                        <div v-if="is_edit&&[130, 1001, 1002].includes(Number(item.status))" class="option_util">
                          <el-input type="text" v-model="v.inputValue"></el-input>
                          <el-select v-model="v.optionValue" filterable placeholder="请选择" style="width:150px; margin-left:10px">
                            <el-option
                              v-for="(opt, optIndex) in v.option"
                              :key="optIndex"
                              :label="opt"
                              :value="opt"
                            >
                            </el-option>
                          </el-select>
                        </div>
                        <p v-else>{{ v.value }}</p>
                      </el-form-item>
                    </template>
                    <!--input-->
                    <template v-else>
                      <el-form-item :label="v.key" :prop="'attrbutes.'+ k +'.value'" :rules="[{required: true, validator: attBasicInforules(), trigger: 'blur' }]">
                        <el-input clearable v-if="is_edit&&[130, 1001, 1002].includes(Number(item.status))" v-model="v.value"></el-input>
                        <p v-else>{{ v.value }}</p>
                      </el-form-item>
                    </template>
                  </el-col>
                </el-row>
                <el-form-item label="图片" prop="images">
                  <template v-if="is_edit">
                    <edit-image
                      :key="item.id"
                      :pictureList="item.images"
                      :isEdit="is_edit&&[130, 1001, 1002].includes(Number(item.status)) && $route.params.state !== '1002'"
                      :pictures="item.istore_image_all"
                      :editimgageAction="{account_id: item.account_id,
                                          istore_product_id: item.istore_product_id,
                                          max_size: 3,//最大三M,
                                          isFile:true}"
                      :max-length="10"
                      :default-props="defaultProps"
                      :picture-key="'image_path'"
                      :thumb-url="'thumb_image_path'"
                      :isVariChild="Number(index)"
                      @emit-update-pictureList="updateImageList($event,index)"
                    ></edit-image>
                  </template>
                  <div v-else style="padding-right:50px">
                    <picture-view
                      ref="pictureview"
                      :pictureList="item.images"
                      :width="100"
                      :height="100"
                      :spaceBetween="6"
                      :thumbnailWidth="80"
                      :thumbnailHeight="80"
                      :defaultProps="defaultProps"
                    >
                    </picture-view>
                  </div>
                </el-form-item>
                <el-row>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item label="Key Word" prop="keyword">
                      <template v-if="is_edit&&[130, 1001, 1002].includes(Number(item.status))">
                        <el-input type="textarea" v-model="item.keyword" :autosize="{ minRows: 2, maxRows: 6 }" class="no-back-ground"></el-input>
                      </template>
                      <template v-else>
                        <div v-for="(element, i) in keywordarr(item.keyword)" :key="i">
                          <span style="display:inline-block;" v-html="element"></span>
                        </div>
                      </template>
                      <p class="tip-color">
                        <i class="el-icon-warning"></i>
                        一行输入一个关键词，最多输入10个，每个关键词不能超过20个字符。
                      </p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="描述" prop="description" :rules="[{required: true, validator: val_description(index), trigger: 'blur' }]">
                  <template v-if="is_edit&&[130, 1001, 1002].includes(Number(item.status))">
                    <tinymce
                      style="padding-left: 0px"
                      class="no-back-ground"
                      :class="tinymcestat[index]?'tinymceborder':''"
                      @set-content="setContent($event,index)"
                      v-model="item.description"
                      :height="400"
                      :ind="index"
                      @contextmenu="sign(index)"
                      @blur="onEditorBlur(index)"
                      @click="sign(index)"
                      @success="uploadSuccess"
                      :plugins="plugins"
                      :uploadAction="uploadAction"
                    />
                    <p class="tip-color">
                      <i class="el-icon-warning"></i>
                      描述中最多支持上传添加10张图片（不包含店铺公告）。
                    </p>
                  </template>
                  <template v-else>
                    <div v-html="item.description" class="description"></div>
                    <ul class="discriptionImage">
                      <li v-show="pic.is_description_picture" v-for="(pic,picIndex) in item.images" :key="picIndex">
                        <img :src="pic.product_image_url" alt="加载失败">
                      </li>
                    </ul>
                  </template>
                </el-form-item>
              </el-form>
            </el-collapse-item>
          </el-collapse>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import { changeDetail, uploadoss, wordReview } from '@/api/coupang'
import editImage from '@/views/coupang/advertising/detail/component/editImage'
import { resultAlert } from '@/utils/index'
import tinymce from '@/components/Tinymce/index'

export default {
  name: 'VariationDetails',
  components: {
    tinymce,
    editImage
  },
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
    },
    listQueryAdvtStatus: {
      type: String,
      default: ''
    }
  },
  data() {
    // 广告名称校验
    const val_productName = (rule, value, callback) => {
      if (!value) {
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
      activeNames2: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      labelWidth: '220px',
      pictureList: [],
      // 编辑是否开启
      is_edit: false,
      tosign: undefined,//标记当前的富文本
      loading: false,//全屏遮罩
      is_disabled: false,//按钮置灰
      tinymcestat: [],//富文本红框
      // 校验
      basicInforules: {
        former_product_name: [
          { required: true, validator: val_productName, trigger: 'blur' }
        ],
        keyword: [
          { required: true, validator: val_key_word, trigger: 'blur' }
        ]
      },
      defaultProps: {
        originalKey: 'image_path',
        thumbnailKey: 'thumb_image_path'
      },
      editForm: {},
      resetForm: {},
      uploadAction: {
        api: (process.env.NODE_ENV === 'production' ? process.env.VUE_APP_BASE_API : '/api/') + 'coupang-new/advt/image/upload-oss',
        account_id: this.detailData.account_id,
        istore_product_id: this.detailData.product_info.data.istore_product_id,
        url: '',
        imgType: ['jpg']//图片类型
      },
      //自定义plugins，为了屏蔽富文本源代码操作
      plugins: ['advlist anchor autolink autosave codesample colorpicker colorpicker contextmenu directionality emoticons fullscreen hr image imagetools insertdatetime link lists media nonbreaking noneditable pagebreak paste preview print save searchreplace spellchecker tabfocus table template textcolor textpattern visualblocks visualchars wordcount']
    }
  },
  mounted() {
  },
  destroyed() {
    sessionStorage.removeItem('detal')
    document.querySelector('body').removeEventListener('click', this.setbox)
  },
  methods: {
    sign(index) {
      console.log(index)
      this.tosign = index
    },
    //重点来了
    getBox() {
      let box = document.querySelector('body')
      if (box) {
        box.addEventListener('click', this.setbox)
      }
    },
    setbox(e) {
      // 为了避免富文本找不到index没办法的办法
      if (e.target.parentNode.innerText.trim() === '插入') {
        console.log(e.target)
        const tinymce_index = e.target.offsetParent.offsetParent.offsetParent.offsetParent.getAttribute('ind')
        this.sign(tinymce_index)
      }
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
      let arrimg = this.editForm.product_info.list[this.tosign].description.match(/<img.*?(?:>|\/>)/gi)
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
        istore_product_id: this.editForm.product_info.data.istore_product_id
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
      let arrimg = this.editForm.product_info.list[this.tosign].description.match(/<img.*?(?:>|\/>)/gi)
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
        //富文本编辑打开
        this.getBox()
      }
    },
    //组装请求数据
    requestPack() {

      const params = {
        'advt_id': this.editForm.id,
        'product_id': this.editForm.product_info.id,
        'account_id': this.editForm.account_id,
        'isJson': true,//以json提交数据
        'data': {}
      }
      const detal = JSON.parse(sessionStorage.getItem('detal'))
      debugger
      if (!this._.isEqual(detal.former_product_name, this.editForm.former_product_name)) {
        params.data.title = [{
          'istore_product_id': this.editForm.istore_product_id,
          'content': this.editForm.former_product_name.trim()
        }]
      }
      if (!this._.isEqual(detal.is_under_age, this.editForm.is_under_age)) {
        params.data.is_under_age = [{
          'istore_product_id': this.editForm.istore_product_id,
          'content': this.editForm.is_under_age // 19禁止
        }]
      }
      this._.forEach(this.editForm.product_info.list, (item, inde) => {
        if (!this._.isEqual(detal.product_info.list[inde].attrbutes, item.attrbutes)) {
          const specifics = this._.forEach(item.attrbutes, v => {
            v.value = v.value.replace(/(^\s*)|(\s*$)/g, '').replace(/(\s+)/g, ' ')
          })
          const obj = {
            'istore_product_id': item.istore_product_id,
            'content': specifics
          }
          params.data.attribute = params.data.specifics ? [...params.data.specifics, obj] : [obj]
        }
      })
      this._.forEach(this.editForm.product_info.list, (item, inde) => {
        debugger
        if (!this._.isEqual(detal.product_info.list[inde].images, item.images)) {
          const obj = {
            'istore_product_id': item.istore_product_id,
            'content': item.images
          }
          params.data.images = params.data.images ? [...params.data.images, obj] : [obj]
        }
      })
      this._.forEach(this.editForm.product_info.list, (item, inde) => {
        //debugger
        if (!this._.isEqual(detal.product_info.list[inde].keyword, item.keyword)) {
          const obj = {
            'istore_product_id': item.istore_product_id,
            'content': this._.compact(item.keyword.split('\n')).map((value) => {
              return value.trim()
            })
          }
          params.data.keywords = params.data.keywords ? [...params.data.keywords, obj] : [obj]
        }
      })
      this._.forEach(this.editForm.product_info.list, (item, inde) => {
        if (!this._.isEqual(detal.product_info.list[inde].description, item.description)) {
          const obj = {
            'istore_product_id': item.istore_product_id,
            'content': item.description.replace(/\n/g, '')
          }
          params.data.description = params.data.description ? [...params.data.description, obj] : [obj]
        }
      })
      console.log(params)
      return params
    },
    // 保存
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
      const other = () => {
        const list = []
        this._.forIn(this.editForm.product_info.list, (item, key) => {
          list.push(new Promise((resolve, reject) => {
            console.log(key)
            this.index = key
            this.$refs['otherInfo' + key][0].validate(valid => {
              if (!valid) {
                reject(`Price区域有错误，请查证第${key}个子`)
              } else if (item.images.length < 1) {
                this.$message.error(`第${key}个子图片不允许为空`)
                reject('图片不允许为空')
              } else if (item.images.length > 10) {
                this.$message.error(`第${key}个子图片最多允许添加10张`)
                reject('图片最多允许添加10张')
              } else {
                resolve()
              }
            })
          }))
        })
        return list
      }
      Promise.all([basic, ...(other())]).then(() => {
        const loading = this.$loading({
          lock: true,
          text: '努力加载中',
          background: 'rgba(0, 0, 0, 0.5)'
        })
        changeDetail(this.requestPack()).then(response => {
          this.is_edit = false
          // this.$parent.init()
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
    // clearable
    clearInput(attr) {
      if (attr.indexOf('other') > -1) {
        this.$refs[attr][0].focus()
      } else {
        this.$refs[attr].focus()
      }
    },
    // 编辑器校验调用
    onEditorBlur(index) {
      this.$refs['otherInfo' + index][0].validateField('description')
    },
    //富文本的校验规则
    val_description(index) {
      return (rule, value, callback) => {
        let trimVal = value.replace(/<[^>]+>|&nbsp;+|\s+/g, '')
        trimVal = trimVal.replace(/&[a-z]+;/g, '*')
        if (trimVal.length === 0) {
          this.is_disabled = true
          this.tinymcestat[index] = true
          return callback(new Error('描述不能为空或全为空格或空行'))
        }
        const imgs = value.match(/<img.*?(?:>|\/>)/gi)
        if (imgs && imgs.length > 10) {
          this.is_disabled = true
          this.tinymcestat[index] = true
          return callback(new Error('描述中最多支持上传添加10张图片'))
        }
        callback()
        this.tinymcestat[index] = false
        this.is_disabled = false
      }
    },
    setContent(content, ind) {
      //console.log(content,ind)
      this.resetForm.product_info.list[Number(ind)].description = content
      this.editForm.product_info.list[Number(ind)].description = content
      //
      if (!sessionStorage.getItem('detal') && Object.keys(this.editForm.product_info.list).length === Number(ind)) {
        sessionStorage.setItem('detal', JSON.stringify(this._.cloneDeep(this.editForm)))
      }
    },
    updateImageList(list, index) {
      console.log(list)
      this.editForm.product_info.list[index].images = list
    },
    attBasicInforules() {
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
    keywordarr(keyword) {
      return keyword.split('\n')
    },
    //替换标题输入空格
    replaceSpace(value) {
      this.editForm.former_product_name = value.replace(/\s{2,}/g, ' ')
    },
    item_Status(list) {
      let status = false
      this._.forEach(list, (item) => {
        if ([130, 1001, 1002].includes(Number(item.status))) {
          status = true
        }
      })
      return status
    }

  },
  computed: {
    // 是否存在编辑button
    editShow() {
      //console.log(this.listQueryAdvtStatus)
      return [130, 1001, 1002].includes(Number(this.listQueryAdvtStatus)) && this.item_Status(this.editForm.product_info.list)
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
        this.is_edit = false
        this.detailData.is_under_age = String(this.detailData.is_under_age)
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
.coupang_variation_description {
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

.attr-class {
  .el-form-item__error {
    background-color: #fff !important;
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

</style>
