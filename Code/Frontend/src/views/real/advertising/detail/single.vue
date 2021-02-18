<template>
  <div>
    <div class="header-box">
      <label class="title">Basic Information(Normal)</label>
      <el-row class="right-row">
        <!--   TODO： 'BLACKLISTED'黑名单不允许编辑     -->
        <el-button v-if="[130,150].includes(Number(data.status))&&data.error_reason !== 'BLACKLISTED'"
                   type="primary" size="mini"
                   @click="handleButtonChange"
                   v-permission="permissionsEdit"
                   :disabled="is_disabled"
        >
          {{ button_inner }}
        </el-button>
      </el-row>
    </div>
    <!--内容区-->
    <el-form
      :label-width="labelWidth"
      size="small"
      class="information-form"
      :model="data"
      :rules="otherInforules"
      ref="datas"
    >
      <div class="content-box" style="padding-top: 0">
        <el-collapse v-model="activeNames">
          <el-collapse-item title="Listing Information" name="1" class="editAttribut">
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="广告ID">
                  <p>{{ data.id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Status">
                  <p>{{ data.status_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="广告名称" prop="product_name">
                  <template v-if="edit">
                    <el-input type="text" v-model="data.product_name"
                              style="width: calc(98% - 200px);min-width: 200px;"
                              @input="replaceSpace"
                              placeholder="请输入内容"
                    ></el-input>
                    <el-tag size="small" :type="data.product_name.length > 255 ? 'danger' : 'success'">{{ data.product_name.length }}/255（限制文本255个字符）</el-tag>
                  </template>
                  <p v-else>{{ data.product_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="产品分类">
                  <p>{{ data.category_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="EAN">
                  <p>{{ data.ean }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="库存">
                  <p>{{ data.quantity }}</p>
                </el-form-item>
              </el-col>
            </el-row>
          </el-collapse-item>

          <el-collapse-item v-if="data.attribute.length > 0" title="Attrbutes" name="2">
            <el-collapse v-model="activeNames1">
              <el-collapse-item title="Mandatory Attributes" name="1.1" class="editAttribut">
                <el-row>
                  <el-col :xs="24" :sm="24"
                          :md="Number(attr.is_textarea) ? 24: 24"
                          :lg="Number(attr.is_textarea) ? 24: 12"
                          v-for="(attr, index) in data.editAttribute" :key="attr.key"
                  >
                    <el-form-item
                      :label="['width', 'length'].includes(attr.key)? (attr.key + '(m)'):(attr.key === 'weight'?(attr.key + '(KG)'):attr.key)"
                      :prop="'editAttribute.' + index +'.value'"
                      :rules="[{required: Boolean(attr.is_mandatory === 1), validator: valid(attr.max_length,attr.is_mandatory), trigger: 'blur' }]"
                    >
                      <el-input v-if="edit" :type="Number(attr.is_textarea) ? 'textarea' : 'text'" v-model="attr.value"></el-input>
                      <p v-else>{{ attr.value }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>
              <el-collapse-item title="Key Word" name="1.2" class="editAttribut">
                <el-row>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item label="Key Word" prop="key_word">
                      <div v-if="edit" style="padding: 0">
                        <el-input type="textarea" v-model="key_word" :autosize="{ minRows: 2, maxRows: 6 }"></el-input>
                        <div class="tip-color">
                          <i class="el-icon-warning"></i>
                          一行输入一个关键词，最多了输入10行，每行最多可输入100个字符
                        </div>
                      </div>
                      <div v-else :class="edit ? 'no-back-ground' : ''">
                        <div v-for="(val, ind) in data.key_word" :key="ind">
                          <span style="word-wrap:break-word;">{{ val }}</span>
                        </div>
                        <!-- <div>{{ data.key_word.length ? data.key_word.join('\n').toString() : '' }}</div> -->
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>
              <el-collapse-item title="Variation Attributes"
                                :name="data.editAttribute.length > 0 ? '1.2' : '1.1'"
                                v-if="data.readAttribute.length > 0"
              >
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12" v-for="(attr, index) in data.readAttribute" :key="index">
                    <el-form-item
                      :required="attr.is_mandatory === 1"
                      :label="['width', 'length'].includes(attr.key)? (attr.key + '(m)'):(attr.key === 'weight'?(attr.key + '(KG)'):attr.key)"
                    >
                      <p>{{ attr.value }}</p>
                      <!-- <p v-if="!edit && !attr.is_mandatory">{{ attr.value }}</p> -->
                      <!-- <el-input v-else :type="parseInt(attr.is_textarea) ? 'textarea' : 'text'" v-model="attr.value"></el-input> -->
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-collapse-item>
            </el-collapse>
          </el-collapse-item>
          <el-collapse-item title="Price" :name="data.attribute.length > 0 ? '3' : '2'" class="editAttribut">
            <el-form
              label-width="220px"
              size="small"
              class="price-form"
              :model="data"
              :rules="otherInforules"
              ref="data"
            >
              <el-row>
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                  <el-form-item label="istore 产品ID">
                    <p>{{ data.istore_product_id }}</p>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                  <el-form-item label="account_name">
                    <p>{{ data.site_code }}</p>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                  <el-form-item label="平台佣金(%)">
                    <p>{{ data.commission }}</p>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                  <el-form-item label="毛利率(%)">
                    <p>{{ data.gross_margin }}</p>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                  <el-form-item label="运输方式">
                    <p>{{ data.shipping_method }}</p>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                  <el-form-item :label="`运费(${data.currency_code})`">
                    <p>{{ data.shipping_costs }}</p>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                  <el-form-item label="包装费(CNY)">
                    <p>{{ data.parcel_processing_fee }}</p>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                  <el-form-item label="汇率">
                    <p>{{ data.currency_rate }}</p>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                  <el-form-item :label="`保本价(${data.currency_code})`">
                    <p>{{ data.base_price }}</p>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                  <el-form-item :label="`原价(${data.currency_code})`">
                    <p>{{ data.total_price }}</p>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" :lg="12">
                  <el-form-item :label="`iStore价格(${data.currency_code})`">
                    <p>{{ data.discount_price }}</p>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="图片">
                <template>
                  <PictureView
                    class="no_picture_delete"
                    ref="pictureview"
                    :pictureList="data.image"
                    menuType="all"
                    :width="100"
                    :height="100"
                    :isEdit="edit"
                    v-if="!edit"
                    :spaceBetween="6"
                    :thumbnailWidth="80"
                    :thumbnailHeight="80"
                    @updateList="updateImages"
                    :defaultProps="defaultProps"
                  >
                  </PictureView>
                  <edit-image v-else :pictureList="data.image" :pictures="data.image_all" :isEidt="edit" @emit-update-pictureList="updatePictureList"></edit-image>
                </template>
              </el-form-item>
              <el-form-item label="描述" prop="description">
                <template v-if="edit">
                  <tinymce class="no-back-ground"
                           v-model="data.description"
                           @set-content="setContent"
                           :height="400"
                           @blur="onEditorBlur"
                           style="padding-left: 0px"
                           :class="tinymceTitle!==''?'tinymceborder':''"
                  />
                  <span style="color: red;padding-left: 5px">{{ tinymceTitle }}</span>
                </template>
                <div v-else>
                  <div v-html="data.description" class="description"></div>
                  <ul class="discriptionImage" v-show="data.image.length > 0" v-if="!edit">
                    <li v-for="(pic,index) in data.image" :key="index">
                      <img :src="pic.image_path" alt="加载失败">
                    </li>
                  </ul>
                </div>
              </el-form-item>
            </el-form>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-form>
  </div>
</template>

<script>
import { status_code, permissions } from '../common/static'
import Tinymce from '@/components/Tinymce'
import editImage from '../components/editImage'
import { editAdvt, fetchDetail } from '@/api/real'

export default {
  name: 'SingleDetails',
  components: { Tinymce, editImage },
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  data() {
    const product_name = (rule, value, callback) => {
      if (!value.trim()) {
        this.is_disabled = true
        return callback(new Error('广告名称内容不能为空'))
      } else if (value.length > 255) {
        this.is_disabled = true
        return callback(new Error('广告名称不能超过255个字符'))
      }
      callback()
      this.is_disabled = false
    }
    return {
      // 权限 和 状态
      permissionsEdit: permissions.edit,
      PRODUCT_STATUS_CODE: status_code.FALSE,
      PRODUCT_STATUS_ONLINE: status_code.ONLINE,
      // 编辑button
      edit: false,
      // 下拉条
      activeNames: ['1', '2', '3'],
      activeNames1: ['1.1', '1.2'],
      labelWidth: '220px',
      // 图片相关配置
      pictureList: [],
      defaultProps: {
        originalKey: 'image_path',
        thumbnailKey: 'thumb_image_path'
      },
      // price rule
      otherInforules: {
        product_name: [{ required: true, validator: product_name, trigger: ['blur', 'change'] }]
      },
      key_word: '',
      resetForm: {},
      is_disabled: false,//按钮禁用
      tinymceTitle: ''//富文本验证提示
    }
  },
  created() {
    this.key_word = this.data.key_word.join('\n').toString()
  },
  methods: {
    //替换标题输入空格
    replaceSpace(value) {
      this.data.product_name = value.replace(/\s{2,}/g, ' ')

    },
    // 页面重载
    reload() {
      const loading = this.$loading({
        lock: true,
        text: '努力加载中',
        background: 'rgba(0, 0, 0, 0.5)'
      })
      fetchDetail(this.$route.params.id).then(response => {
        this.data = response.data
        let editAttribute = [], readAttribute = []
        this.data.attribute.forEach(item => {
          if (Number(item.is_variation) === 0) {
            editAttribute.push(item)
          } else {
            readAttribute.push(item)
          }
        })
        this.data.editAttribute = editAttribute
        this.data.readAttribute = readAttribute
        this.resetForm = this._.cloneDeep(this.data)
      }).finally(() => {
        loading.close()
      })
    },
    /**
     * @description: 接收子组件返回数据
     */
    updatePictureList(list) {
      this.data.image = list
    },
    /**
     * @description: 拖动图片
     */
    updateImages(list) {
      this.data.image = list
    },
    handleButtonChange() {
      if (this.edit) {
        this.$refs['datas'].validate((valid) => {
          console.log(valid)
          if (valid && this.onEditorBlur()) {
            const loading = this.$loading({
              lock: true,
              text: '努力加载中',
              background: 'rgba(0, 0, 0, 0.5)'
            })
            const isCheckEdit = new Promise((resolve, reject) => {
              if (this._.isEqual(this.key_word.split('\n'), this.resetForm.key_word) && this._.isEqual(this.data, this.resetForm)) {
                this.$confirm('该广告没有发生任何更改', '提示', {
                  confirmButtonText: '重新编辑',
                  cancelButtonText: '放弃修改',
                  closeOnClickModal: false,
                  closeOnPressEscape: false,
                  type: 'warning'
                }).then(() => {
                  this.edit = true
                  loading.close()
                  document.querySelector('.el-input__inner').focus()
                }).catch(() => {
                  this.edit = false
                  loading.close()
                })
              } else if(!this.data.image.length){
                loading.close()
                this.$message.error('图片不能为空')
              }else {
                resolve()
              }
            })

            Promise.all([isCheckEdit]).then(() => {
              const params = {
                'advt_id': this.data.id,
                'product_id': this.data.product_id,
                'account_id': this.data.account_id,
                'data': {},
                'isJson': true
              }
              if (!this._.isEqual(this.key_word.split('\n'), this.resetForm.key_word)) {
                params.data.keywords = [
                  {
                    'istore_product_id': this.data.istore_product_id,
                    'content': this._.compact(this.key_word.split('\n'))
                  }
                ]
              }
              if (this.data.product_name !== this.resetForm.product_name) {
                params.data.title = [
                  {
                    'istore_product_id': this.data.istore_product_id,
                    'content': this.data.product_name.trim()
                  }
                ]
              }
              if (this.data.description !== this.resetForm.description) {
                params.data.description = [
                  {
                    'istore_product_id': this.data.istore_product_id,
                    'content': {
                      'description': this.data.description.replace(/\n/g, ''),
                      'note': ''
                    }
                  }
                ]
              }
              const specific = this._.cloneDeep(this.data.editAttribute)
              if (!this._.isEqual(specific, this.resetForm.editAttribute)) {
                const specifics = this._.forEach(specific, v => {
                  v.value = v.value.replace(/(^\s*)|(\s*$)/g, '').replace(/(\s+)/g, ' ')
                })
                params.data.specifics = [
                  {
                    'istore_product_id': this.data.istore_product_id,
                    'content': specifics
                  }
                ]
              }
              if (!this._.isEqual(this.data.image, this.resetForm.image)) {
                params.data.images = [
                  {
                    'istore_product_id': this.data.istore_product_id,
                    'content': this.data.image.map(v => {
                      return { image_path: v.image_path, thumb_image_path: v.thumb_image_path, is_istore: v.is_istore }
                    })
                  }
                ]
              }
              editAdvt(params).then((res) => {
                this.edit = false
                this.$parent.init()
              }).finally(() => {
                loading.close()
              })
            }).catch(err => {
              loading.close()
              this.$message({
                message: err,
                type: 'warning'
              })
            })
          } else {
            this.is_disabled = true
          }
        })
      } else {
        this.edit = true
        this.resetForm = this._.cloneDeep(this.data)
      }
    },
    setContent(content) {
      this.data.description = content
      this.resetForm.description = content

    },
    valid(length, required) {
      return (rule, value, callback) => {
        if (!value && required === 1) {
          this.is_disabled = true
          return callback(new Error('必填字段不能为空'))
        }
        if (value.length > length) {
          this.is_disabled = true
          return callback(new Error('字数不能超过' + length))
        }
        if (/^\s+$/g.test(value)) {
          this.is_disabled = true
          return callback(new Error('输入不能全是空格'))
        }
        callback()
        this.is_disabled = false
      }
    },
    // 编辑器校验调用
    onEditorBlur() {
      let trimVal = this.data.description.replace(/<[^>]+>|&nbsp;+|\s+/g, '').replace(/&[a-z]+;/g, '*')
      if (trimVal.length === 0) {
        this.is_disabled = true
        this.tinymceTitle = '描述不能为空或全为空格或空行'
        return false
      } else {
        this.tinymceTitle = ''
        this.is_disabled = false
        return true
      }
    }
  },
  computed: {
    // 编辑按钮展示内容
    button_inner() {
      return this.edit ? '保存并更新' : '编辑'
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.tinymceborder {
  border: 2px solid #F56C6C;
}

.no-back-ground {
  background-color: #fff !important;
}

.attribute_box {
  .attribute_item {
    display: inline-block;
    width: 25%;
  }
}

@media (max-width: 1620px) {
  .attribute_box {
    .attribute_item {
      display: inline-block;
      width: 33.3%;
    }
  }
}

@media (max-width: 1250px) {
  .attribute_box {
    .attribute_item {
      display: inline-block;
      width: 50%;
    }
  }
}

@media (max-width: 990px) {
  .attribute_box {
    .attribute_item {
      display: inline-block;
      width: 100%;
    }
  }
}

.tip-color {
  color: #E6A23C;
  line-height: 30px;
  font-size: 14px;
  background-color: white !important;
}

</style>
<style rel="stylesheet/scss" lang="scss">
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

.editAttribut .el-form-item__content .el-form-item__error {
  background-color: transparent !important;
}

@media (max-width: 1110px) {
  .discriptionImage > li > img {
    width: 95%;
  }
}

.is_required {
  content: "*";
  color: #F56C6C;
  margin-right: 4px;
}
</style>
