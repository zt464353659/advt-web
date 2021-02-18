<template>
  <div>
    <div class="header-box">
      <label class="title">Basic Information(variation)</label>
      <div style="float:right;" v-permission="permissions.single_editAll">
        <el-button v-show="canEdit && !isEdit" type="primary" size="mini" @click="toggleEdit(true)">编辑</el-button>
        <el-button v-show="canEdit && isEdit" type="success" size="mini" @click="saveEdit">保存</el-button>
        <el-button v-show="canEdit && isEdit" type="secondary" size="mini" @click="toggleEdit(false)">取消编辑</el-button>
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
                  <p>{{ data.id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="状态">
                  <p>{{ cloneData.status_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="广告名称" prop="product_name">
                  <el-input v-if="isEdit" type="text" size="mini" placeholder="请输入广告名称" v-model="cloneData.product_name"></el-input>
                  <p v-else>{{ cloneData.product_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Site Code">
                  <p>{{ cloneData.account_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="istore 产品ID">
                  <p>{{ cloneData.product_info.data.istore_product_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="分类目录ID">
                  <p>{{ cloneData.category_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="分类目录" prop="category_name">
                  <el-cascader
                    v-if="isEdit"
                    placeholder="请选择分类"
                    :options="categoryList"
                    :filterable="true"
                    :clearable="true"
                    :props="props"
                    v-model="category"
                    @change="attributes"
                    style="width: 100%"
                  ></el-cascader>
                  <p v-else>{{ cloneData.category_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="属性" v-if="!isEdit">
                  <p v-for="(item, index) in cloneData.props_list" :key="index">
                    <span>{{ item.attribute_name }}：</span>
                    <span>{{ item.value_label }}</span>
                  </p>
                </el-form-item>
                <el-form-item v-else label="属性">
                  <p class="prop-area">
                    <el-form-item
                      v-for="(item, index) in cloneData.props_list"
                      :prop="'props_list.' + index + '.value'"
                      :key="index"
                      :label="item.attribute_name"
                      label-width="200px"
                      style="margin-bottom: 0"
                      :rules="Number(item.is_mandatory) === 1 ? { required:true, message: '必填项', trigger: ['change', 'blur'] } : {}"
                    >
                      <el-select
                        v-if="item.attribute_type === 'PREDEFINED_ATTRIBUTE'"
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
                      <el-input v-else v-model="item.value" size="mini" style="width:70%;" clearable></el-input>
                    </el-form-item>
                  </p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="主图">
              <template>
                <div style="padding-right: 50px;">
                  <picture-view :pictureList="pictureList" :width="100" :height="100" :spaceBetween="6" :thumbnailWidth="80" :thumbnailHeight="80" :defaultProps="defaultProps"></picture-view>
                </div>
              </template>
            </el-form-item>
            <el-form-item label="描述">
              <tinymce
                v-if="isEdit"
                @set-content="setContent"
                v-model="cloneData.product_info.data.description"
                :height="400"
                class="no-back-ground"
              />
              <div v-else v-html="cloneData.product_info.data.description" class="description"></div>
            </el-form-item>
            <el-form-item label="产品卖点">
              <tinymce
                v-if="isEdit"
                @set-content="setContentProduct"
                v-model="cloneData.product_info.data.selling_point"
                :height="200"
                class="no-back-ground"
              />
              <div v-else v-html="cloneData.product_info.data.selling_point" class="description"></div>
            </el-form-item>
          </el-form>
        </el-collapse-item>
        <el-collapse-item title="Commodity information" name="2">
          <el-row v-for="(item, index) in cloneData.specifics" :key="index">
            <el-col :xs="24" :sm="24" :md="12" :lg="12">
              <el-form-item :label="'Specifics Name' + (index + 1)">
                <p></p>
              </el-form-item>
            </el-col>
          </el-row>
          <el-collapse v-model="activeNames2" class="product-collapse">
            <el-collapse-item :title="item.name" :name="index" v-for="(item, index) in cloneData.product_info.list" :key="index">
              <el-form
                label-width="220px"
                size="small"
                class="price-form"
                :ref="'priceForm' + index"
                :model="item"
                :rules="priceFormRules"
              >
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="istore 产品ID">
                      <p>{{ item.istore_product_id }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="UPC">
                      <p>{{ item.upc }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="总重(G)">
                      <p>{{ item.total_weight }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="运输方式">
                      <p>{{ item.shipping_method }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="运费(CNY)">
                      <p>{{ item.shipping_costs }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="`保本价${cloneData.product_info.data.currency_code ? '(' + cloneData.product_info.data.currency_code + ')' : ''}`">
                      <p>{{ item.base_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="`原价${cloneData.product_info.data.currency_code ? '(' + cloneData.product_info.data.currency_code + ')' : ''}`">
                      <p>{{ item.total_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="`售价${cloneData.product_info.data.currency_code ? '(' + cloneData.product_info.data.currency_code + ')' : ''}`">
                      <p>{{ item.discount_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="毛利率(%)">
                      <p>{{ item.gross_margin }}</p>
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
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="库存">
                      <p>{{ item.quantity }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12" v-for="(v, k) in item.attributes" :key="k">
                    <el-form-item
                      :label="v.attribute_name"
                      prop="attributes"
                      v-if="isEdit"
                      class="is-required-attr"
                    >
                      <!--<el-select-->
                      <!--v-if="v.attribute_type === 'DEFINING_ATTRIBUTE'"-->
                      <!--v-model="v.value"-->
                      <!--size="mini"-->
                      <!--placeholder="请选择"-->
                      <!--clearable-->
                      <!--filterable-->
                      <!--&gt;-->
                      <!--<el-option-->
                      <!--v-for="(i,ind) in v.dictionary"-->
                      <!--:key="ind"-->
                      <!--:label="i"-->
                      <!--:value="i"-->
                      <!--&gt;-->
                      <!--</el-option>-->
                      <!--</el-select>-->
                      <el-input type="text" size="mini" v-model="v.value"></el-input>
                    </el-form-item>
                    <el-form-item v-else :label="v.attribute_name" prop="attributes" class="is-required-attr">
                      <p>{{ v.value }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item label="图片">
                      <template>
                        <div style="padding-right:50px">
                          <picture-view
                            v-if="item.images && activeNames2.includes(index) && !isEdit"
                            :pictureList="item.images"
                            :defaultProps="defaultProps"
                            :width="100"
                            :height="100"
                            :spaceBetween="6"
                            :thumbnailWidth="80"
                            :thumbnailHeight="80"
                          ></picture-view>
                          <edit-image
                            v-if="isEdit && activeNames2.includes(index)"
                            :pictureList="item.images"
                            :is-edit="isEdit"
                            :pictures="istorePictures"
                            :max-length="5"
                            :default-props="defaultProps"
                            :picture-key="'url'"
                            :thumb-url="'thumb_url'"
                            :is-vari-child="index"
                            @emit-update-pictureList="updateImages"
                          ></edit-image>
                        </div>
                        <p v-if="isEdit" class="no-back-ground">第一张为主图，最多可上传5张</p>
                      </template>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="描述">
                  <div v-html="item.description" class="description"></div>
                </el-form-item>
                <el-form-item label="产品包装尺寸" class="pk-size">
                  <el-row>
                    <el-col :xs="24" :sm="24" :md="5" :lg="5">
                      <el-form-item label-width="50px" style="margin-bottom: 0" label="宽" prop="pack_width">
                        <div class="fl-l" v-if="isEdit">
                          <el-input
                            :disabled="!isEdit"
                            v-model="item.pack_width"
                            size="mini"
                            style="width: 60%;"
                          ></el-input>
                          CM
                        </div>
                        <p class="fl-l" v-else>{{ item.pack_width }} CM</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="5" :lg="5">
                      <el-form-item label-width="50px" style="margin-bottom: 0" label="长" prop="pack_length">
                        <div class="fl-l" v-if="isEdit">
                          <el-input
                            :disabled="!isEdit"
                            v-model="item.pack_length"
                            size="mini"
                            style="width: 60%;"
                          ></el-input>
                          CM
                        </div>
                        <p class="fl-l" v-else>{{ item.pack_length }} CM</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="5" :lg="5">
                      <el-form-item
                        label-width="50px"
                        style="margin-bottom: 0"
                        label="高"
                        prop="pack_height"
                      >
                        <div class="fl-l" v-if="isEdit">
                          <el-input
                            :disabled="!isEdit"
                            v-model="item.pack_height"
                            size="mini"
                            style="width: 60%;"
                          ></el-input>
                          CM
                        </div>
                        <p v-else>{{ item.pack_height }} CM</p>
                      </el-form-item>
                    </el-col>
                  </el-row>
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
  import PictureView from 'vue-simple-picture-preview'
  import Tinymce from '@/components/Tinymce'
  import editImage from './component/editImage'
  import { getCategoryList, getAttributes, getIstorePictures, saveDetailEdit, fetchDetail } from '@/api/blibli'

  export default {
    name: 'VariationDetails',
    components: { PictureView, Tinymce, editImage },
    props: {
      data: {
        type: Object,
        required: true,
        default: () => {
        }
      }
    },
    created() {
      // 是否是可编辑状态 Online ==110、Upload_error ==150
      this.cloneData = this._.cloneDeep(this.data)
      this.canEdit = Number(this.cloneData.status) === 110 || Number(this.cloneData.status) === 150
      // 组装数据
      this.formatOriginData()
      if(this.canEdit) {
        this.getCategory()
        this.getPics()
      }
    },
    data() {
      const checkPackageSize = (rule, value, callback) => {
        if (!value) {
          callback(new Error('尺寸不能为空!'))
          return
        }
        if (Number(value) <= 0) {
          callback(new Error('尺寸必须大于0'))
          return
        }
        callback()
      }
      const checkTitle = (rule, value, callback) => {
        if (!value) {
          callback(new Error('标题不能为空!'))
          return
        }
        if (value.length > 150) {
          callback(new Error('标题不能超过150字符'))
          return
        }
        callback()
      }
      const checkCategory = (rule, value, callback) => {
        callback()
      }
      return {
        permissions:{
          single_editAll:"blibli.advt.alters.edit-all",//广告详情编辑
        },//权限
        activeName: 'first',
        activeNames: ['1', '2'],
        activeNames2: ['1'],
        labelWidth: '220px',
        pictureList: [],
        defaultProps: {
          originalKey: 'url',
          thumbnailKey: 'thumb_url'
        },
        priceForm: {
          shippingTableData: [
            {
              elevenStreetShippingPolicy: '',
              adShippingFee: ''
            }],
          status: ['Cancelled', 'Draft', 'Cancelled', 'Cancelled'],
          cost: ['BIN:308.93', 'BIN：877.41', 'BIN：877.41', 'BIN：877.41'],
          grossMargin: ['BIN：19%', 'BIN：20%', 'BIN：18%', 'BIN：22%'],
          grossProfit: ['BIN:88.63', 'BIN:88.63', 'BIN:88.63', 'BIN:88.63'],
          BIDPrice: ['396.00', '396.00', '396.00', '396.00'],
          BINPrice: ['396.00', '396.00', '396.00', '396.00'],
          quantity: ['8', '8', '8', '9'],
          actualShippingCost: ['176.16', '176.16', '176.16', '176.16'],
          specificsName1: ['Size    (Image Specifics)', 'Size    (Image Specifics)', 'Size    (Image Specifics)', 'Size    (Image Specifics)'],
          specificsValue1: ['S', 'M', 'L', 'XL'],
          mainPictureUr: ['', '', '', ''],
          log: []
        },
        originData: {},
        pictureIndex: '',
        isEdit: false,
        canEdit: false,
        cloneData: {},
        infoRules: {
          product_name: [{ required: true, validator: checkTitle, trigger: 'blur' }],
          category_name: [{ required: true, validator: checkCategory, trigger: 'blur' }]
        },
        priceFormRules: {
          width: [{ required: true, validator: checkPackageSize, trigger: 'blur' }],
          length: [{ required: true, validator: checkPackageSize, trigger: 'blur' }],
          height: [{ required: true, validator: checkPackageSize, trigger: 'blur' }]
        },
        oldPicList: [],
        // 分类目录
        categoryList: [],
        props: {
          value: 'category_id',
          label: 'name',
          children: '_child'
        },
        category: [],
        istorePictures: []
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
          this.formatOriginData()
        })
      },
      formatOriginData() {
        this.thumbnail()
        this.category = []
        this._.map(this.cloneData.category_nodes, v => {
          this.category.push(v.category_id)
        })
        this._.forEach(this.cloneData.product_info.list,v => {
          const obj = {}
          v.attributes.forEach(v1 => {
            obj[v1.key] = v1.value
          })
          const attributes = []
          this._.forEach(this.cloneData.spec_list, v3 => {
            attributes.push({ attribute_name: v3.attribute_name, value: obj[v3.attribute_name] || '' })
          })
          v.attributes = attributes
        })
      },
      // 保存详情
      saveEdit() {
        // 是否符合保存条件
        const validateInfo = new Promise((resolve, reject) => {
          this.$refs['infoForm'].validate(valid => {
            if (valid) {
              resolve()
            } else {
              reject('请检查标题!')
            }
          })
        })
        // 子产品尺寸验证
        const validatePriceArr = []
        this._.forEach(this.cloneData.product_info.list, (v, index) => {
          validatePriceArr.push(this.$refs['priceForm' + index][0].validate())
        })
        const validateSize = new Promise((resolve, reject) => {
          Promise.all([...validatePriceArr]).then(() => {
            resolve()
          }).catch(() => {
            reject('请检查子产品信息!')
          })
        })
        // 子产品是否有重复区分项
        const specArr = this.cloneData.product_info.list.map(v => v.attributes)
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
            v.attributes.map(v1 => {
              allAttrValue.push(v1.value)
            })
          })
          return allAttrValue.some(v => !v.trim())
        }
        const validateSpec = new Promise((resolve, reject) => {
          if (hasEmpty()) {
            reject('子产品区分项不能为空')
          }
          if (hasSame(specArr)) {
            reject('子产品区分项不能重复!')
          } else {
            resolve()
          }
        })
        const checkOther = new Promise((resolve, reject) => {
          if (this._.isEqual(this.pictureList, this.oldPicList) && JSON.stringify(this.cloneData) === sessionStorage.getItem('copyData')) {
            reject('广告数据未发生改变!')
          }
          if (!this.cloneData.product_info.data.description) {
            reject('描述不能为空!')
          }
          if (!this.cloneData.product_info.data.selling_point) {
            reject('产品卖点不能为空!')
          }
          if (this.cloneData.product_info.data.selling_point.length > 500) {
            reject('卖点最多输入500字符!')
          }
          resolve()
        })
        console.log(this.cloneData)
        Promise.all([validateSize, validateSpec, checkOther, validateInfo]).then(() => {
          // 验证通过，保存数据
          try{
            const props = {}
            this._.map(this.cloneData.props_list,v => {
              props[v.attribute_name] = v.value
            })
            const list = []
            this.cloneData.product_info.list.forEach(v => {
              let attr = {}
              v.attributes.forEach(v1 => {
                attr[v1.attribute_name] = v1.value
              })
              list.push({
                id: v.id,
                pack_width: v.pack_width,
                pack_length: v.pack_length,
                pack_height: v.pack_height,
                attributes: attr,
                images: v.images
              })
            })
            const obj = {
              id: this.cloneData.id,
              product_name: this.cloneData.product_name,
              description: this.cloneData.product_info.data.description,
              category_id: this.category[this.category.length - 1],
              selling_point: this.cloneData.product_info.data.selling_point,
              props,
              list,
            }
            saveDetailEdit(obj).then(() => {
              this.refresh()
              this.isEdit = false
            })
          }catch(e) {
            console.log(e)
          }

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
        this.cloneData.product_info.data.description = content
        sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
      },
      // tinymce内容重置
      setContentProduct(content) {
        this.cloneData.product_info.data.selling_point = content
        sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
      },
      // 图片更新
      updateImages(list, index) {
        if (index !== undefined) {
          this.cloneData.product_info.list[index].images = list
        }
      },
      // 缩略图处理
      thumbnail() {
        if (this.cloneData.product_info.data.first_images) {
          this.cloneData.product_info.data.first_images.forEach((v, index) => {
            this.pictureList.push({
              url: v.url,
              thumb_url: v.thumb_url
            })
          })
        }
      },
      attributes() {
        getAttributes(this.category[this.category.length - 1]).then((res) => {
          const result = []
          this._.forEach(res.data.props_list,v => {
            let obj = { ...v, value: '' }
            let options = []
            v.dictionary.forEach(v1 => {
              options.push({ value: v1, label: v1 })
            })
            obj.options = options
            result.push(obj)
          })
          this.cloneData.props_list = result
          this._.forEach(this.cloneData.product_info.list,v => {
            // const obj = {}
            // v.attributes.forEach(v1 => {
            //   obj[v1.key] = v1.value
            // })
            const attributes = []
            // this._.forEach(this.cloneData.spec_list, v3 => {
            //   attributes.push({...v3,value: obj[v3.attribute_name]})
            // })
            this._.forEach(res.data.spec_list,v1 => {
              attributes.push({ attribute_name: v1.attribute_name, value: '' })
            })
            v.attributes = attributes
          })
        })
      },
      getCategory() {
        getCategoryList().then(res => {
          this.categoryList = res.data
        })
      },
      getPics() {
        getIstorePictures(this.$route.params.id).then(res => {
          this.istorePictures = res.data
        })
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

</style>
<style rel="stylesheet/scss" lang="scss">

  .el-tabs__content {
    position: unset;
  }

  .is-required-attr {
    .el-form-item__label:before{
      content: "*";
      color: #F56C6C;
      margin-right: 4px;
    }
  }

  .pictureChild {
    .picture-list {
      height: 106px;
    }
  }

  .detail-form .el-form-item__error {
    background: #fff !important;
  }

</style>
