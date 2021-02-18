<template>
  <div>
    <div class="header-box">
      <label class="title">Basic Information(Normal)</label>
      <div style="float:right;" v-permission="permissions.single_editAll">
        <el-button v-show="(canEdit || canEditCategory) && !isEdit" type="primary" size="mini" @click="toggleEdit(true)">编辑</el-button>
        <el-button v-show="(canEdit || canEditCategory) && isEdit" type="primary" size="mini" @click="saveEdit('all')">批量保存</el-button>
        <el-button v-show="(canEdit || canEditCategory) && isEdit" type="success" size="mini" @click="saveEdit">保存</el-button>
        <el-button v-show="(canEdit || canEditCategory) && isEdit" type="secondary" size="mini" @click="toggleEdit(false)">取消编辑</el-button>
      </div>
    </div>
    <!--内容区-->
    <div class="content-box detail-form" style="padding-top: 0">
      <el-collapse v-model="activeNames">
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
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="广告ID">
                  <p>{{ cloneData.id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Status">
                  <p>{{ cloneData.status_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="广告名称" prop="name" class="ad-name">
                  <el-input v-if="isEdit && canEdit" v-model="cloneData.product_info.name"></el-input>
                  <p v-else>{{ cloneData.product_info.name }}</p>
                  <span class="ad-name-num" :class="{ wordColor: cloneData.product_info.name.length > 50 }">{{ cloneData.product_info.name.length }}个字符</span>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="总重(KG)">
                  <p>{{ cloneData.product_info.total_weight }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="库存">
                  <p>{{ cloneData.product_info.quantity }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="EAN">
                  <p>{{ cloneData.product_info.ean }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Site Code">
                  <p>{{ cloneData.account_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="sales formats">
                  <p>{{ cloneData.sales_formats }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="分类目录 id">
                  <p>{{ cloneData.product_info.category_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item v-if="isEdit && canEditCategory" prop="category" label="分类目录">
                  <el-cascader
                    placeholder="请选择分类"
                    :props="categoryProps"
                    :options="categoryList"
                    :filterable="true"
                    style="width:100%"
                    v-model="category"
                    @change="attributes"
                  ></el-cascader>
                </el-form-item>
                <el-form-item v-else label="分类目录">
                  <p>{{ cloneData.category_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item v-if="!isEdit" label="属性">
                  <p v-for="(item, index) in cloneData.product_info.props_list" :key="index">
                    <span>{{ item.attribute_name }}：</span>
                    <span>{{ item.value_label }}</span>
                  </p>
                </el-form-item>
                <el-form-item v-if="isEdit && showAttr" label="属性">
                  <p class="prop-area">
                    <el-form-item
                      v-for="(item, index) in cloneData.product_info.props_list"
                      :prop="'props_list.' + index + '.value'"
                      :key="index"
                      :label="item.attribute_name"
                      label-width="250px"
                      style="margin-bottom: 0"
                      :class="Number(item.is_mandatory) === 1 ? 'is-required-attr' : ''"
                    >
                      <el-select
                        v-if="item.attribute_type === 'dictionary'"
                        v-model="item.value"
                        size="mini"
                        placeholder="请选择"
                        clearable
                        filterable
                        style="width: 70%"
                      >
                        <el-option
                          v-for="i in item.options"
                          :key="i.value"
                          :label="i.label"
                          :value="i.value"
                        >
                        </el-option>
                      </el-select>
                      <div v-else style="width:100%;">
                        <!-- 非范围值类型 -->
                        <div v-if="!item.restrictions.range" style="width:100%;">
                          <el-input v-if="item.unit" v-model="item.value" size="mini" style="width:70%;margin-left:0;" clearable>
                            <template slot="append">{{ item.unit }}</template>
                          </el-input>
                          <el-input v-else v-model="item.value" size="mini" style="width:70%;margin-left:0;" clearable></el-input>
                          <span v-if="item.attribute_type === 'string'" class="prop-tip">最多输入{{ item.restrictions.maxLength }}个字符{{ item.restrictions.allowedNumberOfValues ? '' : ',不能为纯数字' }}</span>
                          <span v-else class="prop-tip">{{ item.restrictions.min }}-{{ item.restrictions.max }}之间的{{ item.attribute_type === 'integer' ? '整数' : '数字' }}</span>
                        </div>
                        <!-- 范围值类型属性 -->
                        <div v-else>
                          <el-input v-if="item.unit" v-model="item.value_min" size="mini" style="width:35%;margin-left:0;" clearable placeholder="最小值">
                            <template slot="append">{{ item.unit }}</template>
                          </el-input>
                          <el-input v-else v-model="item.value_min" size="mini" style="width:35%;margin-left:0;" clearable placeholder="最小值"></el-input>
                          -
                          <el-input v-if="item.unit" v-model="item.value_max" size="mini" style="width:35%;margin-left:0;" clearable placeholder="最大值">
                            <template slot="append">{{ item.unit }}</template>
                          </el-input>
                          <el-input v-else v-model="item.value_max" size="mini" style="width:35%;margin-left:0;" clearable placeholder="最大值"></el-input>
                          <span class="prop-tip">最小值不能小于 {{ item.restrictions.min }} 最大值不能大于 {{ item.restrictions.max }}</span>
                        </div>
                      </div>
                    </el-form-item>
                  </p>
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
            :model="cloneData.product_info"
            ref="priceForm"
          >
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="istore 产品ID">
                  <p>{{ cloneData.product_info.istore_product_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="运输方式">
                  <p>{{ cloneData.product_info.shipping_method }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="`运费(${cloneData.product_info.currency_code})`">
                  <p>{{ cloneData.product_info.shipping_costs }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="`保本价${cloneData.product_info.currency_code ? '(' + cloneData.product_info.currency_code + ')' : ''}`">
                  <p>{{ cloneData.product_info.base_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="`原价${cloneData.product_info.currency_code ? '(' + cloneData.product_info.currency_code + ')' : ''}`">
                  <p>{{ cloneData.product_info.total_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="`售价${cloneData.product_info.currency_code ? '(' + cloneData.product_info.currency_code + ')' : ''}`">
                  <p>{{ cloneData.product_info.discount_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="毛利率(%)">
                  <p>{{ cloneData.product_info.gross_margin }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="平台佣金率(%)">
                  <p>{{ cloneData.product_info.commission }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="汇率">
                  <p>{{ cloneData.product_info.currency_rate }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="打包费(CNY)">
                  <p>{{ cloneData.product_info.parcel_processing_fee }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
            </el-row>
            <el-form-item label="图片" class="is-required-attr">
              <template>
                <edit-image
                  v-if="isEdit && canEdit"
                  :pictureList="cloneData.product_info.images"
                  :is-edit="isEdit && canEdit"
                  :pictures="istorePictures"
                  :max-length="16"
                  :default-props="defaultProps"
                  :picture-key="'url'"
                  :thumb-url="'thumb_url'"
                  @emit-update-pictureList="updateImages"
                ></edit-image>
                <p v-if="isEdit && canEdit" class="no-back-ground">第一张为主图，最多可上传16张</p>
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
              <tinymce
                v-if="isEdit && canEdit"
                @set-content="setContent"
                v-model="cloneData.product_info.description"
                :height="400"
                class="no-back-ground"
              />
              <div v-else v-html="cloneData.product_info.description" class="description"></div>
            </el-form-item>
            <el-form-item label="描述1">
              <tinymce
                v-if="isEdit && canEdit"
                @set-content="setContent1"
                v-model="cloneData.product_info.description1"
                :height="400"
                class="no-back-ground"
              />
              <div v-else v-html="cloneData.product_info.description1" class="description"></div>
            </el-form-item>
            <el-form-item label="描述2">
              <tinymce
                v-if="isEdit && canEdit"
                @set-content="setContent2"
                v-model="cloneData.product_info.description2"
                :height="400"
                class="no-back-ground"
              />
              <div v-else v-html="cloneData.product_info.description2" class="description"></div>
            </el-form-item>
            <el-form-item label="描述图" class="is-required-attr">
              <template>
                <edit-image
                  v-if="isEdit && canEdit"
                  :pictureList="cloneData.product_info.desc_images"
                  :is-edit="isEdit && canEdit"
                  :pictures="istorePictures"
                  :max-length="6"
                  :default-props="defaultProps"
                  :picture-key="'url'"
                  :thumb-url="'thumb_url'"
                  @emit-update-pictureList="updateDesImages"
                ></edit-image>
                <p v-if="isEdit && canEdit" class="no-back-ground">第一张为主图，最多可上传6张描述图</p>
                <div v-else style="padding-right:50px">
                  <picture-view
                    :pictureList="cloneData.product_info.desc_images"
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
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
// import DescriptionUpdate from '../components/descriptionUpdate'
import { getAttributes, getCategories, getPictures, fetchDetail, saveDetailEdit } from '@/api/allegro'
import Tinymce from '@/components/Tinymce'
import editImage from './component/editImage'


export default {
  components: { Tinymce, editImage },
  data() {
    // 标题验证
    const checkTitle = (rule, value, callback) => {
      if (!value.trim()) {
        callback(new Error('标题不能为空!'))
        return
      }
      callback()
    }
    const checkPrice = (rule, value, callback) => {
      callback()
    }
    return {
      permissions: {
        single_editAll: 'allegro.advt.advt.edit-advt'//广告详情编辑
      },//权限
      activeName: 'first',
      isEdit: false,
      canEdit: false,
      activeNames: ['1', '2'],
      labelWidth: '220px',
      categoryProps: {
        value: 'category_id',
        label: 'name',
        multiple: false,
        lazy: true,
        lazyLoad(node, resolve) {
          if (node.data) {
            getCategories(node.data.category_id).then(res => {
              const result = res.data.map(item => {
                return { category_id: item.category_id, name: item.name, leaf: Number(item.is_leaf) === 1 }
              })
              resolve(result)
            })
          }
        }
      },
      categoryList: [],
      showData: {
        category: []
      },
      defaultProps: {
        originalKey: 'url',
        thumbnailKey: 'thumb_url'
      },
      cloneData: {},
      infoRules: {
        name: [{ required: true, validator: checkTitle, trigger: 'blur' }]
      },
      oldPicList: [],
      istorePictures: [],
      category: [],
      showAttr: true,
      canEditCategory: false
    }
  },
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  methods: {
    refresh() {
      const loading = this.$loading({
        lock: true,
        text: '努力加载中',
        background: 'rgba(0, 0, 0, 0.5)'
      })
      const obj = {
        advtId: this.$route.params.id,
        status: this.$route.params.status
      }
      fetchDetail(obj).then(response => {
        this.cloneData = response.data
        this.isEdit = false
        loading.close()
      }).catch(() => {
        loading.close()
      })
    },
    // 保存详情
    saveEdit(saveType) {
      // 是否符合保存条件
      const validateInfo = new Promise((resolve, reject) => {
        this.$refs['infoForm'].validate(valid => {
          if (valid) {
            resolve()
          } else {
            reject('请检查Listing Information区域数据!')
          }
        })
      })

      // 子产品是否有必填属性为空
      const lostProps = () => {
        const mustArr = []
        this.cloneData.product_info.props_list.map(v => {
          if (Number(v.is_mandatory) === 1) {
            mustArr.push(v)
          }
        })
        return mustArr.some(v => !v.value)
      }

        const checkProp = new Promise((resolve, reject) => {
          if (lostProps()) {
            reject('请检查子产品必填属性')
          }
          const inputProps = []
          this.cloneData.product_info.props_list.map(v => {
            if (v.attribute_type !== 'dictionary') {
              inputProps.push(v)
            }
          })
          inputProps.forEach(v => {
            // 范围类型验证
            if (v.restrictions.range) {
              let reg
              if (v.attribute_type === 'integer') {
                reg = /^\d+$/
              } else if (v.attribute_type === 'float') {
                reg = /^\d+(\.\d*)?$/
              }
              if ((v.value_min && reg.test(v.value_min)) && (v.value_max && reg.test(v.value_max))) {
                if (Number(v.value_min) < v.restrictions.min || Number(v.value_max) > v.restrictions.max || Number(v.value_min) > Number(v.value_max)) {
                  reject(`属性${v.attribute_name}输入值不符合规则`)
                }
              } else {
                if (v.value_min === '' && v.value_max === '' && !v.is_mandatory) {
                } else {
                  reject(`属性${v.attribute_name}输入值不符合规则`)
                }
              }
            } else {
              if (v.value) {
                if (v.attribute_type === 'string') {
                  if (v.value.length > v.restrictions.maxLength) {
                    reject(`属性${v.attribute_name}输入值不符合规则`)
                  }
                  if (!v.restrictions.allowedNumberOfValues) {
                    if (!/^\d+$/.test(v.value)) {
                      reject(`属性${v.attribute_name}输入值不符合规则`)
                    }
                  }
                }
                if (v.attribute_type === 'integer') {
                  const reg = /^\d+$/
                  if (!reg.test(v.value) || v.value < v.restrictions.min || v.value > v.restrictions.max) {
                    reject(`属性${v.attribute_name}输入值不符合规则`)
                  }
                }
                if (v.attribute_type === 'float') {
                  const reg = /^\d+(\.\d*)?$/
                  if (!reg.test(v.value) || v.value < v.restrictions.min || v.value > v.restrictions.max) {
                    reject(`属性${v.attribute_name}输入值不符合规则`)
                  }
                }
              }
            }
          })
          resolve()
        })
        const checkOther = new Promise((resolve, reject) => {
          if (!this.cloneData.product_info.description) {
            reject('描述不能为空')
          }
          if (!this.cloneData.product_info.images.length) {
            reject('图片不能为空!')
          }
          if (!this.cloneData.product_info.desc_images.length) {
            reject('描述图不能为空!')
          }
          if (JSON.stringify(this.cloneData) === sessionStorage.getItem('copyData')) {
            reject('广告数据未发生改变!')
          }
          resolve()
        })
        Promise.all([validateInfo, checkOther, checkProp]).then(() => {
          // 验证通过，保存数据
          const oldData = JSON.parse(sessionStorage.getItem('copyData'))
          const obj = {
            advt_id: this.cloneData.id,
            title: [],
            description: [],
            specifics: [],
            images: [],
            attribution: [],
            category_id: this.category.length ? this.category[this.category.length - 1] : this.cloneData.category_id
          }
          const product_id = this.cloneData.product_info.id
          // 修改标题
          if (this.cloneData.product_info.name !== oldData.product_info.name) {
            obj.title.push({ product_id, title: this.cloneData.product_info.name })
          }
          // 修改图片
          if (!this._.isEqual(this.cloneData.product_info.images, oldData.product_info.images)) {
            obj.images.push({ product_id, images: this.cloneData.product_info.images })
          }
          // 修改描述
          if (this.cloneData.product_info.description !== oldData.product_info.description || !this._.isEqual(this.cloneData.product_info.desc_images, oldData.product_info.desc_images) || this.cloneData.product_info.description1 !== oldData.product_info.description1 || this.cloneData.product_info.description2 !== oldData.product_info.description2) {
            obj.description.push({ product_id, description: this.cloneData.product_info.description, description1: this.cloneData.product_info.description1, description2: this.cloneData.product_info.description2, desc_image: this.cloneData.product_info.desc_images })
          }
          // 修改属性
          if (!this._.isEqual(this.cloneData.product_info.props_list, oldData.product_info.props_list)) {
            this._.forEach(this.cloneData.product_info.props_list, v => {
              if (v.restrictions.range) {
                v.value = `${v.value_min}~${v.value_max}`
                v.value = v.value === '~' ? '' : v.value
                delete v.value_min
                delete v.value_max
              }
            })

          obj.specifics.push({ product_id, props_list: this.cloneData.product_info.props_list })
        }
        if (saveType === 'all') {
          obj.edit_all_advt = true
        }
        saveDetailEdit(obj).then(() => {
          this.refresh()
          this.isEdit = false
        })
      }).catch(err => {
        this.$message.warning(err)
      })
    },
    // 切换编辑状态
    toggleEdit(val) {
      this.isEdit = val
      // 取消编辑重新刷新页面
      if (!this.isEdit) {
        this.refresh()
        this.isEdit = false
      }
    },
    // tinymce内容重置
    setContent(content) {
      this.cloneData.product_info.description = content
      sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
    },
    // tinymce内容重置
    setContent1(content) {
      this.cloneData.product_info.description1 = content
      sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
    },
    // tinymce内容重置
    setContent2(content) {
      this.cloneData.product_info.description2 = content
      sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
    },
    // 图片更新
    updateImages(list) {
      if (list) {
        this.cloneData.product_info.images = list
      }
    },
    // 描述图更新
    updateDesImages(list) {
      if (list) {
        this.cloneData.product_info.desc_images = list
      }
    },
    // 属性选择验证
    checkName(rule, value, callback) {
      if (!value) {
        callback(new Error(''))
      } else {
        callback()
      }
    },
    // // 获取广告分类树
    categories(val) {
      getCategories(val).then((res) => {
        this.categoryList = res.data
      })
    },
    // 获取分类属性组
    getAttributes() {
      getAttributes(this.category[this.category.length - 1]).then((res) => {
        this.cloneData.product_info.props_list = res.data.map(v => {
          if (!v.restrictions.range) {
            return { ...v, value: '' }
          } else {
            return { ...v, value_min: '', value_max: '' }
          }
        })
        this.showAttr = false
        this.$nextTick(() => {
          this.showAttr = true
        })
      })
    },
    attributes() {
      this.getAttributes()
    },
    // 获取istore图片
    getPics(id) {
      getPictures(id).then(res => {
        this.istorePictures = res.data
      })
    }
  },
  created() {
    // 是否是可编辑状态 normal ==110、pushfail ==150、shortage ==220 EndByAdmin==230 Deleted==130 状态产品详情页新增编辑功能// draft状态增加编辑目录属性功能
    this.canEdit = [110,150,220,100,230,130].includes(Number(this.$route.params.status))
    this.canEditCategory = [100,150].includes(Number(this.$route.params.status))
    this.cloneData = this._.cloneDeep(this.data)
    this.oldList = this.cloneData.product_info.images
    // 可编辑状态获取istore图片
    if (this.canEdit || this.canEditCategory) {
      this.categories(0)
      this.getPics(this.$route.params.id)
      sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
    }
  },
  watch: {
    isEdit(val) {
      if (val) {
        // 编辑状态处理范围类型属性显示
        const cloneData = this._.cloneDeep(this.cloneData)
        cloneData.product_info.props_list.forEach(v => {
          if (v.restrictions.range) {
            v.value_min = v.value.split('~')[0] || ''
            v.value_max = v.value.split('~')[1] || ''
          }
        })
        this.cloneData = null
        this.cloneData = cloneData
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.description {
  line-height: 18px !important;
  padding-top: 7px;
}

.el-input--mini {
  margin-left: 20px;
}

.price-form .el-form-item .el-form-item__content .no-back-ground {
  background: #fff;
}

.editBtn {
  position: absolute;
  top: 76px;
  z-index: 999;
  right: 22px;
}

.wordColor {
  color: #F08080 !important;
}
</style>
<style rel="stylesheet/scss" lang="scss">
.ad-name .el-form-item__content {
  display: flex;

  p {
    width: 100%;
  }

  .ad-name-num {
    display: block;
    text-align: center;
    width: 7%;
    font-size: 12px;
    color: #909399;
    background: #fff;
  }
}

.el-tabs__content {
  position: unset;
}

.prop-area {
  .el-form-item__content {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;

    .el-form-item__error {
      position: static;
      line-height: 28px;
    }
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

  .prop-tip {
    color: #909399;
    font-size: 12px;
    margin-left: 5px;
  }
}
</style>
