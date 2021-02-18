<template>
  <div>
    <div class="header-box">
      <label class="title">Basic Information(variation)</label>
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
            :model="cloneData"
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
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="总重(KG)">
                  <p>{{ cloneData.product_info.data.total_weight }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="库存">
                  <p>{{ cloneData.product_info.data.quantity }}</p>
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
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="广告名称" prop="product_name">
                  <p>{{ cloneData.product_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="istore 产品ID">
                  <p>{{ cloneData.product_info.data.parent_istore_product_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="分类目录 id">
                  <p>{{ cloneData.product_info.data.category_id }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item v-if="canEditCategory && isEdit" label="分类目录" prop="category">
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
            </el-row>
            <!--<el-form-item label="主图">-->
            <!--<template>-->
            <!--<div style="padding-right:50px">-->
            <!--<picture-view-->
            <!--:pictureList="cloneData.product_info.data.first_images"-->
            <!--:width="100"-->
            <!--:height="100"-->
            <!--:spaceBetween="6"-->
            <!--:thumbnailWidth="80"-->
            <!--:thumbnailHeight="80"-->
            <!--:defaultProps="defaultProps"-->
            <!--&gt;</picture-view>-->
            <!--</div>-->
            <!--</template>-->
            <!--</el-form-item>-->
            <!--<el-form-item label="描述" class="is-required-attr">-->
            <!--<div v-html="cloneData.product_info.data.first_description" class="description"></div>-->
            <!--</el-form-item>-->
            <el-row>
            </el-row>
          </el-form>
        </el-collapse-item>
        <el-collapse-item title="Commodity information" name="2">
          <!--<el-row v-for="(item, index) in cloneData.specifics" :key="index">-->
          <!--<el-col :xs="24" :sm="24" :md="12" :lg="12">-->
          <!--<el-form-item :label="'Specifics Name' + (index + 1)">-->
          <!--<p></p>-->
          <!--</el-form-item>-->
          <!--</el-col>-->
          <!--</el-row>-->
          <el-collapse v-model="activeNames2" class="product-collapse">
            <el-collapse-item :title="item.name" :name="index" v-for="(item, index) in cloneData.product_info.list" :key="index">
              <el-form
                ref="form"
                label-width="220px"
                size="small"
                class="price-form"
              >
                <el-row>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item label="广告标题" class="is-required-attr ad-name">
                      <el-input v-if="isEdit && canEdit" size="mini" v-model="item.name" clearable></el-input>
                      <p v-else>{{ item.name }}</p>
                      <span class="ad-name-num" :class="{ wordColor: item.name.length > 50 }">{{ item.name.length }}个字符</span>
                    </el-form-item>
                  </el-col>
                </el-row>
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
                </el-row>
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="运输方式">
                      <p>{{ item.shipping_method }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="`运费(${item.currency_code})`">
                      <p>{{ item.shipping_costs }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="`保本价${item.currency_code ? '(' + item.currency_code + ')' : ''}`">
                      <p>{{ item.base_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="`原价${item.currency_code ? '(' + item.currency_code + ')' : ''}`">
                      <p>{{ item.total_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="`售价${item.currency_code ? '(' + item.currency_code + ')' : ''}`">
                      <p>{{ item.discount_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="毛利率(%)">
                      <p>{{ item.gross_margin }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="库存">
                      <p>{{ item.quantity }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="EAN">
                      <p>{{ item.ean }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="平台佣金率(%)">
                      <p>{{ item.commission }}</p>
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
                  <el-col :xs="24" :sm="24" :md="12" :lg="12" v-for="(v, k) in item.attrbutes" :key="k">
                    <el-form-item :label="v.key" prop="attrbutes" class="is-required-attr">
                      <el-input v-if="isEdit && canEdit" type="text" size="mini" v-model="v.value"></el-input>
                      <p v-else>{{ v.value }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item v-if="isEdit && showAttr" label="属性" prop="props">
                      <p class="prop-area" v-if="isEdit">
                        <el-form-item
                          v-for="(prop, index1) in item.props_list"
                          :prop="'props_list.' + index + '.value'"
                          :key="index1"
                          :label="prop.attribute_name"
                          label-width="200px"
                          style="margin-bottom: 0"
                          :class="Number(prop.is_mandatory) === 1 ? 'is-required-attr' : ''"
                        >
                          <el-select
                            v-model="prop.value"
                            size="mini"
                            placeholder="请选择"
                            clearable
                            filterable
                            @change="changeVal"
                            style="width: 70%"
                            v-if="prop.attribute_type === 'dictionary'"
                          >
                            <el-option
                              v-for="i in prop.options"
                              :key="i.value"
                              :label="i.label"
                              :value="i.value"
                            >
                            </el-option>
                          </el-select>
                          <div v-else style="width:100%;">
                            <!-- 非范围值类型 -->
                            <div v-if="!prop.restrictions.range" style="width:100%;">
                              <el-input v-if="prop.unit" v-model="prop.value" size="mini" style="width:70%;margin-left:0;" clearable> <template slot="append">{{ prop.unit }}</template></el-input>
                              <el-input v-else v-model="prop.value" size="mini" style="width:70%;margin-left:0;" clearable></el-input>
                              <span v-if="prop.attribute_type === 'string'" class="prop-tip">最多输入{{ prop.restrictions.maxLength }}个字符{{ prop.restrictions.allowedNumberOfValues ? '' : ',不能为纯数字' }}</span>
                              <span v-else class="prop-tip">{{ prop.restrictions.min }}-{{ prop.restrictions.max }}之间的{{ prop.attribute_type === 'integer' ? '整数' : '数字' }}</span>
                            </div>
                            <!-- 范围值类型属性 -->
                            <div v-else>
                              <el-input v-if="prop.unit" v-model="prop.value_min" size="mini" style="width:35%;margin-left:0;" clearable placeholder="最小值"> <template slot="append">{{ prop.unit }}</template></el-input>
                              <el-input v-else v-model="prop.value_min" size="mini" style="width:35%;margin-left:0;" clearable placeholder="最小值"></el-input>-
                              <el-input v-if="prop.unit" v-model="prop.value_max" size="mini" style="width:35%;margin-left:0;" clearable placeholder="最大值"> <template slot="append">{{ prop.unit }}</template></el-input>
                              <el-input v-else v-model="prop.value_max" size="mini" style="width:35%;margin-left:0;" clearable placeholder="最大值"></el-input>
                              <span class="prop-tip">最小值不能小于 {{ prop.restrictions.min }} 最大值不能大于 {{ prop.restrictions.max }}</span>
                            </div>
                          </div>
                        </el-form-item>
                      </p>
                    </el-form-item>
                    <el-form-item v-else label="属性">
                      <p v-for="(prop, index2) in item.props_list" :key="index2">
                        <span>{{ prop.attribute_name }}：</span>
                        <span>{{ prop.value_label }}</span>
                      </p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item label="图片" :class="item.images && activeNames2.includes(index) && canEdit && item.status_label !== 'finished' ? 'is-required-attr' : ''">
                      <template>
                        <div style="padding-right:50px">
                          <picture-view
                            v-if="(item.images && activeNames2.includes(index) && !isEdit) || (item.images && activeNames2.includes(index) && isEdit && item.status_label === 'finished')"
                            :pictureList="item.images"
                            :defaultProps="defaultProps"
                            :width="100"
                            :height="100"
                            :spaceBetween="6"
                            :thumbnailWidth="80"
                            :thumbnailHeight="80"
                          ></picture-view>
                          <edit-image
                            v-if="item.images && isEdit && activeNames2.includes(index) && canEdit && item.status_label !== 'finished'"
                            :pictureList="item.images"
                            :is-edit="isEdit && canEdit"
                            :pictures="istorePictures"
                            :max-length="16"
                            :default-props="defaultProps"
                            :picture-key="'url'"
                            :thumb-url="'thumb_url'"
                            :is-vari-child="index"
                            @emit-update-pictureList="updateImages"
                          ></edit-image>
                        </div>
                        <p v-if="isEdit && canEdit" class="no-back-ground">第一张为主图，最多可上传16张</p>
                      </template>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="描述" class="is-required-attr">
                  <tinymce
                    v-if="isEdit && canEdit"
                    @set-content="setContent"
                    v-model="item.description"
                    :is-vari="index"
                    :height="400"
                    class="no-back-ground"
                  />
                  <div v-else v-html="item.description" class="description"></div>
                </el-form-item>
                <el-form-item label="描述1">
                  <tinymce
                    v-if="isEdit && canEdit"
                    @set-content="setContent1"
                    v-model="item.description1"
                    :is-vari="index"
                    :height="400"
                    class="no-back-ground"
                  />
                  <div v-else v-html="item.description1" class="description"></div>
                </el-form-item>
                <el-form-item label="描述2">
                  <tinymce
                    v-if="isEdit && canEdit"
                    @set-content="setContent2"
                    v-model="item.description2"
                    :is-vari="index"
                    :height="400"
                    class="no-back-ground"
                  />
                  <div v-else v-html="item.description2" class="description"></div>
                </el-form-item>
                <el-form-item label="描述图" :class="item.images && activeNames2.includes(index) && canEdit ? 'is-required-attr' : ''">
                  <template>
                    <div style="padding-right:50px">
                      <edit-image
                        v-if="item.images && isEdit && activeNames2.includes(index) && canEdit"
                        :pictureList="item.desc_images"
                        :is-edit="isEdit"
                        :pictures="istorePictures"
                        :max-length="6"
                        :default-props="defaultProps"
                        :picture-key="'url'"
                        :thumb-url="'thumb_url'"
                        :is-vari-child="index"
                        @emit-update-pictureList="updateDesImages"
                      ></edit-image>
                      <picture-view
                        v-if="item.images && !isEdit && activeNames2.includes(index)"
                        :pictureList="item.desc_images"
                        :defaultProps="defaultProps"
                        :width="100"
                        :height="100"
                        :spaceBetween="6"
                        :thumbnailWidth="80"
                        :thumbnailHeight="80"
                      ></picture-view>
                    </div>
                    <p v-if="isEdit && canEdit" class="no-back-ground">第一张为主图，最多可上传6张描述图</p>
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
  // import DescriptionUpdate from '../components/descriptionUpdate'
  import Tinymce from './component/Tinymce'
  import editImage from './component/editImage'
  import { getCategories, getAttributes, getPictures, saveDetailEdit, fetchDetail  } from '@/api/allegro'

  export default {
    components: { Tinymce, editImage },
    props: {
      data: {
        type: Object,
        required: true
      }
    },
    created() {
      // 是否是可编辑状态 normal ==110、pushfail ==150、shortage ==220 EndByAdmin==230 Deleted==130 状态产品详情页新增编辑功能 // draft状态增加编辑目录属性功能
      this.canEdit = [110,150,220,100,230,130].includes(Number(this.$route.params.status))
      this.isNormal = [110].includes(Number(this.$route.params.status))
      this.canEditCategory = [100,150].includes(Number(this.$route.params.status))
      this.cloneData = this._.cloneDeep(this.data)
      const cloneData = this._.cloneDeep(this.cloneData)
      this.cloneData = null
      this.cloneData = cloneData
      // 可编辑状态获取istore图片
      if (this.canEdit || this.canEditCategory) {
        this.categories(0)
        this.getPics(this.$route.params.id)
        sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
      }
    },
    data() {
      const checkTitle = (rule, value, callback) => {
        if (!value) {
          callback(new Error('标题不能为空!'))
          return
        }
        // if (value.length > 50) {
        //   callback(new Error('标题不能超过50字符'))
        //   return
        // }
        callback()
      }
      const checkCategory = (rule, value, callback) => {
        callback()
      }
      return {
        permissions: {
          single_editAll: 'allegro.advt.advt.edit-advt'//广告详情编辑
        },//权限
        activeName: 'first',
        optionsData: [],
        activeNames: ['1', '2'],
        activeNames2: ['1'],
        labelWidth: '220px',
        categoryProps: {
          value: 'category_id',
          label: 'name',
          multiple: false,
          lazy: true,
          lazyLoad(node, resolve) {
            getCategories(node.data.category_id).then(res => {
              const result = res.data.map(item => {
                return { category_id: item.category_id, name: item.name, leaf: Number(item.is_leaf) === 1 }
              })
              resolve(result)
            })
          }
        },
        categoryList: [],
        category: [],
        showData: {
          category: []
        },
        originData: {},
        defaultProps: {
          originalKey: 'url',
          thumbnailKey: 'thumb_url'
        },
        canEdit: false,
        isEdit: false,
        cloneData: {},
        infoRules: {
          // product_name: [{ required: true, validator: checkTitle, trigger: 'blur' }],
          // category: [{ required: true, validator: checkCategory, trigger: ['blur','change'] }]
        },
        oldPicList: [],
        istorePictures: [],
        // 子产品props无法编辑
        showAttr: true,
        canEditCategory: false,
        isNormal: false
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
        }).finally(() => {
          loading.close()
        })
      },
      changeVal(val) {
        this.showInfo = false
        this.$nextTick(() => {
          this.showInfo = true
        })
      },
      // 保存详情
      saveEdit(saveType) {
        // 是否符合保存条件
        const validateInfo = new Promise((resolve, reject) => {
          if(this.cloneData.product_info.list.some(v => !v.name)) {
            reject('子产品标题不能为空')
          }
          resolve()
        })
        // 子产品是否有重复区分项
        const specArr = this.cloneData.product_info.list.map(v => v.attrbutes)
        const hasSame = arr => {
          let have = false
          for (let i = 0; i < arr.length; i++) {
            for (let j = arr.length - 1; j > i; j--) {
              if (this._.isEqual(arr[i], arr[j])) {
                have = true
                break
              }
            }
          }
          return have
        }
        // 子产品是否有空区分项
        const hasEmpty = () => {
          // 区分项是否有空值
          const allAttrValue = []
          this.cloneData.product_info.list.map(v => {
            v.attrbutes.map(v1 => {
              allAttrValue.push(v1.value)
            })
          })
          return allAttrValue.some(v => !v.trim())
        }
        // 子产品是否有必填属性为空
        const lostProps = () => {
          const mustArr = []
          this.cloneData.product_info.list.map(v => {
            v.props_list.map(v1 => {
              if(Number(v1.is_mandatory) === 1){
                mustArr.push(v1)
              }
            })
          })
          return mustArr.some(v => !v.value)
        }

        //子产品input类型属性是否符合要求
        const checkProp = new Promise((resolve,reject) => {
          if (lostProps()) {
            reject('请检查子产品必填属性')
          }
          const inputProps = []
          this.cloneData.product_info.list.map(v => {
            v.props_list.map(v1 => {
              if (v1.attribute_type !== 'dictionary') {
                inputProps.push(v1)
              }
            })
          })
          inputProps.forEach(v => {
            // 范围类型验证
            if (v.restrictions.range) {
              let reg
              if(v.attribute_type === 'integer') {
                reg = /^\d+$/
              } else if( v.attribute_type === 'float') {
                reg = /^\d+(\.\d*)?$/
              }
              if((v.value_min && reg.test(v.value_min)) && (v.value_max && reg.test(v.value_max))) {
                if(Number(v.value_min) < v.restrictions.min || Number(v.value_max) > v.restrictions.max || Number(v.value_min) > Number(v.value_max)) {
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
                    reject(`子产品属性${v.attribute_name}输入值不符合规则`)
                  }
                  if (!v.restrictions.allowedNumberOfValues) {
                    if (!/^\d+$/.test(v.value)) {
                      reject(`子产品属性${v.attribute_name}输入值不符合规则`)
                    }
                  }
                }
                if (v.attribute_type === 'integer') {
                  const reg = /^\d+$/
                  if (!reg.test(v.value) || v.value < v.restrictions.min || v.value > v.restrictions.max) {
                    reject(`子产品属性${v.attribute_name}输入值不符合规则`)
                  }
                }
                if (v.attribute_type === 'float') {
                  const reg = /^\d+(\.\d*)?$/
                  if (!reg.test(v.value) || v.value < v.restrictions.min || v.value > v.restrictions.max) {
                    reject(`子产品属性${v.attribute_name}输入值不符合规则`)
                  }
                }
              }
            }
          })
          resolve()
        })
        // 子产品图片是否为空
        const mainPicEmpty = () => {
          return this.cloneData.product_info.list.some(v => !v.images.length)
        }

        // 子产品图片或描述是否为空
        const desPicEmpty = () => {
          return this.cloneData.product_info.list.some(v => !v.desc_images.length) || this.cloneData.product_info.list.some(v => !v.description)
        }
        // 是否存在超长描述
        const longDescription = () => {
          return this.cloneData.product_info.list.some(v => String(v.description).length > 40000)
        }
        const validateSpec = new Promise((resolve, reject) => {
          // 区分项存在空值
          if(hasEmpty()) {
            reject('子产品区分项不能为空!')
          }
          // 存在重复区分项
          // if (hasSame(specArr)) {
          //   reject('子产品区分项不能重复!')
          // }
          // 存在必填属性为空
          if (lostProps()) {
            reject('请检查子产品必填属性')
          }
          if (mainPicEmpty()) {
            reject('子产品图片不能为空')
          }
          if (desPicEmpty()) {
            reject('子产品描述及描述图不能为空')
          }
          if (longDescription()) {
            reject('描述最多输入40000个字符')
          }
          resolve()
        })
        const checkOther = new Promise((resolve, reject) => {
          if (JSON.stringify(this.cloneData) === sessionStorage.getItem('copyData')) {
            reject('广告数据未发生改变!')
          }
          resolve()
        })
        Promise.all([validateInfo, validateSpec, checkOther, checkProp]).then(() => {
          // 验证通过，保存数据
          const list = this.cloneData.product_info.list
          const oldList = JSON.parse(sessionStorage.copyData).product_info.list
          const obj = {
            advt_id: this.cloneData.id,
            title: [],
            description: [],
            specifics: [],
            images: [],
            attribution: [],
            category_id: this.category.length ? this.category[this.category.length - 1] : this.cloneData.category_id
          }
          // 修改标题
          this._.map(list, (v, i) => {
            // 标题
            if (v.name !== oldList[i]['name']) {
              obj.title.push({ product_id: v.id, title: v.name })
            }
            // 图片
            if (!this._.isEqual(v.images, oldList[i]['images'])) {
              obj.images.push({ product_id: v.id, images: v.images })
            }
            // 描述
            if (v.description !== oldList[i]['description'] || !this._.isEqual(v.desc_images, oldList[i]['desc_images']) || v.description1 !== oldList[i]['description1'] || v.description2 !== oldList[i]['description2']) {
              obj.description.push({ product_id: v.id, desc_image: v.desc_images, description: v.description, description1: v.description1, description2: v.description2 })
            }
            // 属性
            if (!this._.isEqual(v.props_list, oldList[i]['props_list'])) {
              this._.forEach(v.props_list, v => {
                if(v.restrictions.range) {
                  v.value = `${v.value_min}~${v.value_max}`
                  delete v.value_min
                  delete v.value_max
                }
              })
              obj.specifics.push({ product_id: v.id, props_list: v.props_list })
            }
            // 区分项
            if (!this._.isEqual(v.attrbutes, oldList[i]['attrbutes'])) {
              obj.attribution.push({ product_id: v.id, attribution: v.attrbutes })
            }
          })
          if(saveType === 'all') {
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
        if(this.isEdit) {
          this.showInfo = false
          this.$nextTick(() => {
            this.showInfo = true
          })
        }
        // 取消编辑重新刷新页面
        if (!this.isEdit) {
          this.refresh()
          this.isEdit = false
        }
      },
      // tinymce内容重置
      setContent(content,index) {
        this.cloneData.product_info.list[index].description = content
        sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
      },
      // tinymce内容重置
      setContent1(content,index) {
        this.cloneData.product_info.list[index].description1= content
        sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
      },
      // tinymce内容重置
      setContent2(content,index) {
        this.cloneData.product_info.list[index].description2 = content
        sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
      },
      // 图片更新
      updateImages(list, index) {
        if (list) {
          if (index !== undefined) {
            this.cloneData.product_info.list[index].images = list
          }
        }
      },
      // 图片更新
      updateDesImages(list, index) {
        if (list) {
          if(index !== undefined) {
            this.cloneData.product_info.list[index].desc_images = list
          }
        }
      },
      // 属性选择验证
      checkName(rule, value, callback) {
        if (!value) {
          callback(new Error(' '))
        } else {
          callback()
        }
      },
      cancle() {
        this.isEdit = !this.isEdit
        window.location.reload()
      },
      // 获取广告分类树
      categories(val) {
        getCategories(val).then((res) => {
          this.categoryList = res.data
        })
      },
      // 获取分类属性组
      getAttributes() {
        getAttributes(this.category[this.category.length - 1]).then((res) => {
          const result = res.data.map(v => {
            if (!v.restrictions.range) {
              return { ...v, value: '' }
            } else {
              return { ...v, value_min: '', value_max: '' }
            }
          })
          this._.forEach(this.cloneData.product_info.list, v => {
            v.props_list = this._.cloneDeep(result)
          })
          const cloneData = this._.cloneDeep(this.cloneData)
          this.cloneData = null
          this.cloneData = cloneData
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
    watch: {
      isEdit(val) {
        if(val) {
          // 编辑状态处理范围类型属性显示
          const cloneData = this._.cloneDeep(this.cloneData)
          cloneData.product_info.list.forEach(v => {
            v.props_list.map(v1 => {
              if (v1.restrictions.range) {
                v1.value_min = v1.value ? (v1.value.split('~')[0] || '') : ''
                v1.value_max = v1.value ? (v1.value.split('~')[1] || '') : ''
              }
            })
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

  .editBtn {
    position: absolute;
    top: 76px;
    z-index: 999;
    right: 22px;
  }

  .wordColor{
    color: 	#F08080 !important;
  }
</style>
<style rel="stylesheet/scss" lang="scss">
  .ad-name .el-form-item__content{
    display: flex;
    p{
      width: 100%;
    }
    .ad-name-num{
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
  .prop-area{
    .el-form-item__content{
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      .el-form-item__error{
        position: static;
        line-height: 28px;
      }
    }
  }

  .detail-form {
    .is-required-attr{
      .el-form-item__label:before{
        content: "*";
        color: #F56C6C;
        margin-right: 4px;
      }
    }
  }

</style>
