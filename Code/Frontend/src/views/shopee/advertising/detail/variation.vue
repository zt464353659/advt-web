<template>
  <div style="position:relative">
    <el-button class="editBtn" v-if="this.$route.params.status === '110' || this.$route.params.status === '120' || this.$route.params.status === '140' || this.$route.params.status === '170'"
               v-show="isEidt" type="primary" size="mini"
               @click="eidt"
               v-permission="permissions.single_editAll"
    >
      编辑
    </el-button>
    <div class="editBtn">
      <el-button v-if="this.$route.params.status === '110' || this.$route.params.status === '120' || this.$route.params.status === '140' || this.$route.params.status === '170'"
                 v-show="!isEidt" size="mini" @click="cancle"
      >
        取消编辑
      </el-button>
      <el-button v-if="this.$route.params.status === '110' || this.$route.params.status === '120' || this.$route.params.status === '140' || this.$route.params.status === '170'"
                 v-show="!isEidt" type="primary" size="mini"
                 @click="savaAdvtData('ruleForm')"
      >
        更新
      </el-button>
    </div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="Basic Information(variation)" name="first">
        <!--内容区-->
        <div class="content-box" style="padding-top: 0">
          <el-collapse v-model="activeNames">
            <el-collapse-item title="Listing Information" name="1">
              <el-form
                :label-width="labelWidth"
                size="small"
                class="information-form" :rules="rules"
                :model="showData" ref="ruleForm"
              >
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
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="总重(KG)">
                      <p>{{ data.product_info.data.total_weight }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="库存">
                      <p>{{ data.product_info.data.quantity }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="Site Code">
                      <p>{{ data.account_name }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item v-show="isEidt" label="广告名称">
                      <p>{{ data.product_name }}</p>
                    </el-form-item>
                    <el-form-item v-show="!isEidt" label="广告名称" prop="product_name">
                      <el-input v-model="showData.product_name"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="istore 产品ID">
                      <p>{{ data.product_info.data.parent_istore_product_id }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="折扣活动">
                      <p>{{ data.discount && data.discount.name ? data.discount.name : '' }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item v-if="data.product_info.data.currency_code" :label="'售价(' + data.product_info.data.currency_code + ')'">
                      <p>{{ data.product_info.data.discount_price }}</p>
                    </el-form-item>
                    <el-form-item v-else label="售价">
                      <p>{{ data.product_info.data.discount_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item v-if="data.product_info.data.currency_code" :label="'原价(' + data.product_info.data.currency_code + ')'">
                      <p>{{ data.product_info.data.total_price }}</p>
                    </el-form-item>
                    <el-form-item v-else label="原价">
                      <p>{{ data.product_info.data.total_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item v-if="data.product_info.data.currency_code" :label="'运费(' + data.product_info.data.currency_code + ')'">
                      <p>{{ data.product_info.data.shipping_costs }}</p>
                    </el-form-item>
                    <el-form-item v-else label="运费">
                      <p>{{ data.product_info.data.shipping_costs }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="毛利率(%)">
                      <p>{{ data.product_info.data.gross_margin }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item v-show="isEidt" label="Shopee分类">
                      <p>{{ data.category_name }}</p>
                    </el-form-item>
                    <el-form-item v-show="!isEidt" label="Shopee分类" prop="category">
                      <el-cascader
                        placeholder="请选择分类"
                        :options="optionsData"
                        :filterable="true"
                        :clearable="true"
                        :props="props"
                        v-model="showData.category"
                        @change="attributes"
                        style="width: 100%"
                      ></el-cascader>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item v-if="!isEidt" label="属性">
                      <p>
                        <el-form-item v-for="(item, index) in showData.optionsBrand"
                                      :prop="'optionsBrand.' + index + '.value'"
                                      :key="index"
                                      :label="item.attribute_name"
                                      label-width="200px"
                                      style="margin-bottom: 0"
                                      :rules="item.is_mandatory === '1' ? { required:true, validator: checkName, trigger: ['change', 'blur'] } : {}"
                        >
                          <el-select v-show="item.input_type === 'COMBO_BOX' || item.input_type === 'DROP_DOWN'"
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
                          <el-input v-show="item.input_type === 'TEXT_FILED'"
                                    type="textarea"
                                    autosize
                                    v-model="item.value"
                                    style="width: 80%"
                                    placeholder="请输入内容"
                          >
                          </el-input>
                        </el-form-item>
                      </p>
                    </el-form-item>
                    <el-form-item v-if="isEidt" label="属性">
                      <p v-for="(item, index) in data.props_list" :key="index">
                        <span>{{ item.attribute_name }}：</span>
                        <span v-if="isEidt">{{ item.value }}</span>
                      </p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="主图">
                  <template>
                    <div style="padding-right:50px">
                      <picture-view v-if="isEidt" :pictureList="pictureList" :width="100" :height="100" :spaceBetween="6" :thumbnailWidth="80" :thumbnailHeight="80" :defaultProps="defaultProps"></picture-view>
                      <edit-image v-else :pictureList="data.product_info.data.first_name" :isEidt="isEidt" :advtId="data.product_info.data.advt_id" @emit-update-pictureList="updatePictureList"></edit-image>
                    </div>
                  </template>
                </el-form-item>
                <el-form-item v-if="isEidt" label="描述">
                  <div v-html="data.product_info.data.first_description" class="description"></div>
                </el-form-item>
                <el-form-item v-if="!isEidt" label="描述">
                  <el-input
                    type="textarea"
                    autosize
                    placeholder="请输入内容"
                    v-model="data.product_info.data.first_raw_description"
                  >
                  </el-input>
                </el-form-item>
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="包裹尺寸" prop="packageSize">
                      <el-row>
                        <el-col :xs="24" :sm="24" :md="8" :lg="8">
                          <el-form-item style="margin-bottom: 0" label="宽" :inline="true" prop="package_width" label-width="0">
                            <el-input v-model="showData.package_width" size="mini" style="width: 30%;margin-left: 10px;"
                                      :disabled="this.$route.params.status === '170' ? true : isEidt"
                            ></el-input>
                            CM
                          </el-form-item>
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="8" :lg="8">
                          <el-form-item style="margin-bottom: 0" label="长" :inline="true" prop="package_length" label-width="0">
                            <el-input v-model="showData.package_length" size="mini" style="width: 30%;margin-left: 10px;"
                                      :disabled="this.$route.params.status === '170' ? true : isEidt"
                            ></el-input>
                            CM
                          </el-form-item>
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="8" :lg="8">
                          <el-form-item style="margin-bottom: 0" label="高" :inline="true" prop="package_height" label-width="0">
                            <el-input v-model="showData.package_height" size="mini" style="width: 30%;margin-left: 10px;"
                                      :disabled="this.$route.params.status === '170' ? true : isEidt"
                            ></el-input>
                            CM
                          </el-form-item>
                        </el-col>
                      </el-row>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="批发价">
                      <p v-if="this.$route.params.status === '170' ? false : !isEidt" style="text-align: center; cursor: pointer; color: #409EFF" @click="addPrice">新增批发价</p>
                      <p>
                        <el-form>
                          <el-form-item v-for="(item, index) in data.wholesales" :key="index" :label="'批发价'+ (index+1)">
                            <el-input onkeyup="if (this.value.length === 1) {
                          this.value = this.value.replace(/[^1-9]/g, '')
                         } else {
                            this.value = this.value.replace(/\D/g, '')
                         }" size="mini" v-model="item.min" @input="handleInputChange($event, index, 'min')" style="width: 10%" :disabled="isEidt ? isEidt : item.min_disabled"
                            ></el-input>
                            Min
                            <el-input onkeyup="if (this.value.length === 1) {
                          this.value = this.value.replace(/[^1-9]/g, '')
                         } else {
                            this.value = this.value.replace(/\D/g, '')
                         }" size="mini" v-model="item.max" @input="handleInputChange($event, index, 'max')" style="width: 10%" :disabled="isEidt"
                            ></el-input>
                            Max
                            <el-input onkeyup="if (this.value.length === 1) {
                          this.value = this.value.replace(/[^1-9]/g, '')
                         } else {
                            const reg = /^\d*(\.\d{0,2})?$/
                            if (!reg.test(this.value)) {
                              this.value = this.value.slice(0, this.value.length - 1)
                            }
                         }" size="mini" v-model="item.unit_price" style="width: 10%" :disabled="isEidt"
                            ></el-input>
                            <span v-if="data.product_info.data.currency_code">售价({{ data.product_info.data.currency_code }})</span>
                            <span v-else>售价</span>
                            <span v-if="!isEidt" style="cursor: pointer;margin-left: 26px;display: inline-block;" @click="delPrice(index)">X</span>
                          </el-form-item>
                        </el-form>
                      </p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="预购">
                      <template>
                        <el-radio v-model="data.pre_order" :disabled="this.$route.params.status === '170' ? true : isEidt" label="1">是</el-radio>
                        <el-radio v-model="data.pre_order" :disabled="this.$route.params.status === '170' ? true : isEidt" label="0">否</el-radio>
                      </template>
                      <p v-if="data.pre_order !== '1'">我将在2天内发货（不包括公共假期和快递服务休息日）。</p>
                      <p v-else>
                        我需要
                        <el-input v-model="data.days_to_ship" size="mini" :disabled="this.$route.params.status === '170' ? true : isEidt" style="width: 8%"></el-input>
                        days to ship (You can fill in it between 7 to 30)
                      </p>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-collapse-item>
            <el-collapse-item title="Commodity information" name="2">
              <el-form
                ref="form"
                :model="priceForm"
                label-width="220px"
                size="small"
                class="price-form" v-model="originData" :rules="rules"
              >
                <!-- <el-form-item label="Shipping">
                  <el-table
                    :data="priceForm.shippingTableData"
                    border
                    size="mini"
                    class="table-gray"
                    style="width: 100%"
                  >
                    <el-table-column prop="elevenStreetShippingPolicy" label="Shopee Shipping Policy"><br/></el-table-column>
                    <el-table-column prop="adShippingFee" label="Ad Shipping Fee"><br/></el-table-column>
                  </el-table>
                </el-form-item> -->
                <el-row v-for="(item, index) in priceForm.specifics" :key="index">
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="'Specifics Name' + (index + 1)">
                      <p></p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-collapse v-model="activeNames2" class="product-collapse">
                  <el-collapse-item :title="item.name" :name="index" v-for="(item, index) in originData.product_info.list" :key="index">
                    <el-row>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item label="istore 产品ID">
                          <p>{{ item.istore_product_id }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item v-if="originData.product_info.data.currency_code" :label="'售价(' + originData.product_info.data.currency_code + ')'">
                          <p>{{ item.discount_price }}</p>
                        </el-form-item>
                        <el-form-item v-else label="售价">
                          <p>{{ item.discount_price }}</p>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-col v-show="routering !== '170' ? true : isEidt" :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item v-if="originData.product_info.data.currency_code" :label="'原价(' + originData.product_info.data.currency_code + ')'">
                          <p>{{ item.total_price }}</p>
                        </el-form-item>
                        <el-form-item v-else label="原价">
                          <p>{{ item.total_price }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col v-show="routering !== '170' ? false : !isEidt" :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item v-if="originData.product_info.data.currency_code"
                                      :label="'原价(' + originData.product_info.data.currency_code + ')'"
                                      prop="total_price"
                        >
                          <el-input v-model="item.total_price"></el-input>
                        </el-form-item>
                        <el-form-item v-else label="原价"
                                      prop="total_price"
                        >
                          <el-input v-model="item.total_price"></el-input>
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
                        <el-form-item label="库存">
                          <p>{{ item.quantity }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12" v-for="(v, k) in item.attrbutes" :key="k">
                        <el-form-item :label="v.key" prop="attributes">
                          <p v-show="routering !== '170' ? true : isEidt">{{ v.value }}</p>
                          <el-input v-show="routering !== '170' ? false : !isEidt" v-model="v.value"></el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-form-item label="图片">
                      <template>
                        <div style="padding-right:50px">
                          <picture-view v-if="item.pictureListChild && activeNames2.includes(index)" :pictureList="item.pictureListChild" :width="100" :height="100" :spaceBetween="6" :thumbnailWidth="80" :thumbnailHeight="80" :defaultProps="defaultProps"></picture-view>
                        </div>
                      </template>
                    </el-form-item>
                    <el-form-item label="描述">
                      <div v-html="item.description" class="description"></div>
                    </el-form-item>
                  </el-collapse-item>
                </el-collapse>
              </el-form>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-tab-pane>
      <!-- <el-tab-pane v-if="$route.params.status === '110'" label="istore描述更新日志" name="second">
        <description-update></description-update>
      </el-tab-pane> -->
    </el-tabs>
  </div>
</template>

<script>
  import editImage from '../components/editImage'
  // import DescriptionUpdate from '../components/descriptionUpdate'
  import { getCategories, saveDetailEdit, getAttributes, prohibitedJudgment } from '@/api/shopee'

  export default {
    name: 'VariationDetails',
    components: { editImage },
    props: {
      data: {
        type: Object,
        required: true
      }
    },
    created() {
      this.routingAssignment()
      this.categories()
      this.showEdit()
      // getPictures()
      this.originData = this._.cloneDeep(this.data)
      const cloneData = this._.cloneDeep(this.originData)
      this.originData = {}
      this.originData = cloneData
      // 缩略图
      this.thumbnail()
    },
    data() {
      // 分类验证
      const checkCategory = (rule, value, callback) => {
        if (this.showData.category.length === 0) {
          callback(new Error('请选择分类'))
        } else {
          callback()
        }
      }
      const checkPrice = (rule, value, callback) => {
        callback()
      }
      const checkAttributes = (rule, value, callback) => {
        callback()
      }
      return {
        permissions:{
          single_editAll:"shopee.advt.alters.edit-all",//广告详情编辑
        },//权限
        routering: '',
        activeName: 'first',
        optionsData: [],
        value: undefined,
        isEidt: true,
        radio: '1',
        activeNames: ['1', '2'],
        activeNames2: ['1'],
        labelWidth: '220px',
        pictureList: [],
        defaultProps: {
          originalKey: 'original',
          thumbnailKey: 'thumbnail'
        },
        priceForm: {
          smallAmount: 'N',
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
        props: {
          value: 'category_id',
          label: 'name',
          children: '_child'
        },
        // optionsBrand: [],
        arr: [],
        showData: {
          optionsBrand: [],
          product_name: '',
          category: [],
          value: '',
          package_width: '',
          package_length: '',
          package_height: '',
          total_price: [],
          attributes: []
        },
        rules: {
          product_name: [
            { required: true, message: '请填写广告名称', trigger: 'blur' }
          ],
          category: [
            { required: true, validator: checkCategory, trigger: 'change' }
          ],
          total_price: [
            { required: true, validator: checkPrice, trigger: 'blur' }
          ],
          attributes: [
            { required: true, validator: checkAttributes, trigger: 'blur' }
          ]
        },
        originData: {},
        pictureIndex: ''
      }
    },
    methods: {
      updatePictureList(list) {
        this.data.product_info.data.first_name = list
      },
      // 路由赋值
      routingAssignment() {
        this.routering = this.$route.params.status
      },
      // 属性选择验证
      checkName(rule, value, callback) {
        if (!value) {
          callback(new Error(' '))
        } else {
          callback()
        }
      },
      eidt() {
        if (this.data.is_prohibit_words === '1') {
          this.$message({
            message: '请在违禁词待审核下审核广告后再进行编辑',
            type: 'warning'
          })
        } else {
          this.isEidt = !this.isEidt
          if (!this.isEidt) {
            this.data.wholesales.forEach(val => {
              val.min_disabled = true
            })
          }
          this.categoryData()
          this.attributeData()
        }
      },
      cancle() {
        this.isEidt = !this.isEidt
        window.location.reload()
      },
      // 获取广告分类树
      categories() {
        const obj = {
          advt_id: this.$route.params.id
        }
        getCategories(obj).then((res) => {
          this.optionsData = res.data
        // this.itemForEach(this.optionsData)
        })
      },
      // 获取分类属性组
      getAttributes() {
        const obj = {
          category_id: this.showData.category[this.showData.category.length - 1]
        }
        getAttributes(obj).then((res) => {
          res.data.forEach(val => {
            val.attribute = undefined
          })
          this.showData.optionsBrand = res.data
        })
      },
      attributes() {
        this.getAttributes()
      },
      // 修改广告详情
      savaAdvtData(ruleForm) {
        const total_price = this.originData.product_info.list.every(val => {
          return Boolean(val.total_price)
        })
        const attributes = this.originData.product_info.list.map(val => {
          return Boolean(val.attrbutes[0].value)
        }).every(val => val)
        if (!total_price) {
          this.$message({
            type: 'error',
            message: '*号为必填'
          })
          return
        } else {
          if (!attributes) {
            this.$message({
              type: 'error',
              message: '*号为必填'
            })
            return
          } else {
            this.$refs[ruleForm].validate((valid) => {
              if (valid) {
                const obj = {
                  id: this.data.id,
                  product_name: this.showData.product_name,
                  description: this.data.product_info.data.first_raw_description,
                  wholesales: this.data.wholesales,
                  category_id: this.showData.category[this.showData.category.length - 1],
                  images: this.data.product_info.data.first_name,
                  pre_order: this.data.pre_order,
                  days_to_ship: this.data.days_to_ship,
                  package_length: this.showData.package_length,
                  package_width: this.showData.package_width,
                  package_height: this.showData.package_height,
                  props: (() => {
                    const arr = []
                    this._.forEach(this.showData.optionsBrand, v => {
                      arr[v.attribute_id] = v.value
                    })
                    return arr
                  })(),
                  total_price: (() => {
                    const arr = []
                    this._.forEach(this.originData.product_info.list, v => {
                      arr[v.id] = (v.total_price)
                    })
                    return arr
                  })(),
                  attributes: (() => {
                    const obj = {}
                    this._.forEach(this.originData.product_info.list, v => {
                      const obj1 = {}
                      obj[v.id] = obj1
                      this._.forEach(v.attrbutes, v1 => {
                        obj1[v1.key] = v1.value
                      })
                    })
                    return obj
                  })()
                }
                const prohibited = {
                  account_id: this.data.account_id,
                  product_str: this.showData.product_name + this.data.product_info.data.first_raw_description,
                  not_show_message: true
                }
                if (this.data.wholesales.length !== 0) {
                  let flag = true
                  for (var i = 0; i < this.data.wholesales.length; i++) {
                    if (this.data.wholesales[i].max === '' || this.data.wholesales[i].min === '' || this.data.wholesales[i].unit_price === '') {
                      this.$message.error('批发价不能为空')
                      flag = false
                      break
                    } else if (Number(this.data.wholesales[i].max) < Number(this.data.wholesales[i].min)) {
                      this.$message.error('批发价最大值不能小于最小值')
                      flag = false
                      break
                    }
                  }
                  if (flag) {
                    // 违禁词判断
                    prohibitedJudgment(prohibited).then((res) => {
                      if (res.data.res_code === 200) {
                        saveDetailEdit(obj).then(() => {
                          self.location.reload()
                        }).catch(() => {
                        })
                      } else if (res.data.res_code === 300002) {
                        this.$confirm('标题/描述包含可保存违禁词，是否保存？').then(() => {
                          saveDetailEdit(obj).then(() => {
                            self.location.reload()
                          }).catch(() => {
                          })
                        }).catch(() => {
                        })
                      } else if (res.data.res_code === 30001) {
                        this.$message({
                          message: res.message,
                          type: 'warning'
                        })
                      }
                    }).catch(() => {
                    })
                  }
                } else {
                  // 违禁词判断
                  prohibitedJudgment(prohibited).then((res) => {
                    if (res.data.res_code === 200) {
                      saveDetailEdit(obj).then(() => {
                        self.location.reload()
                      }).catch(() => {
                      })
                    } else if (res.data.res_code === 300002) {
                      this.$confirm('标题/描述包含可保存违禁词，是否保存？').then(() => {
                        saveDetailEdit(obj).then(() => {
                          self.location.reload()
                        }).catch(() => {
                        })
                      }).catch(() => {
                      })
                    } else if (res.data.res_code === 30001) {
                      this.$message({
                        message: res.message,
                        type: 'warning'
                      })
                    }
                  }).catch(() => {
                  })
                }
              } else {
                return false
              }
            })
          }
        }
      },
      // 新增批发价
      addPrice() {
        if (this.data.wholesales.length < 5) {
          this.data.wholesales.push({ min: '', max: '', unit_price: '', min_disabled: true })
          this.data.wholesales[0]['min_disabled'] = false
          const _length = this.data.wholesales.length
          if (_length > 1) {
            // 新增时确定新增项之前的一条批发价 有最大值取最大值+1 否则取最小值+1
            if (Number(this.data.wholesales[_length - 2]['max'])) {
              this.data.wholesales[_length - 1]['min'] = Number(this.data.wholesales[_length - 2]['max']) + 1
            } else {
              this.data.wholesales[_length - 1]['min'] = Number(this.data.wholesales[_length - 2]['min']) + 1
            }
          }
        } else {
          this.$message({
            message: '批发价最多5条',
            type: 'warning'
          })
        }
      },
      delPrice(index) {
        // 删除索引
        const arrLength = this.data.wholesales.length
        this.data.wholesales.splice(index, 1)
        // 如果删除的不是最后一个和第一个批发价，改变当前删除项之后所有批发价的最小
        if (index !== this.data.wholesales[arrLength - 1] && index !== 0) {
          this.changePrice(index)
        }
        // 当前批发价的第一条输入取消禁用
        if (this.data.wholesales.length) {
          this.data.wholesales[0]['min_disabled'] = false
        }
      },
      // shopee分类回填
      categoryData() {
        this._.forEach(this.data.category_nodes, v => {
          this.showData.category.push(v.category_id)
        })
      },
      // 属性回填
      attributeData() {
        this.showData.optionsBrand = this.data.props_list
      },
      // 回填值
      showEdit() {
        this.showData.product_name = this.data.product_name
        this.showData.package_width = this.data.product_info.package_width
        this.showData.package_length = this.data.product_info.package_length
        this.showData.package_height = this.data.product_info.package_height
      },
      handleInputChange(val, index, type) {
        // 批发价的最小改变
        if (type === 'min') {
          this.data.wholesales[index]['min'] = val
          this.changePrice(1)
        } else {
          this.data.wholesales[index]['max'] = val
          this.changePrice(1)
        }
      },
      changePrice(val) {
        const _length = this.data.wholesales.length
        // 修改删除项之后所有批发价最小值 如果上一项有最大取最大加一，否则取最小加一
        for (let i = val; i < _length; i++) {
          if (Number(this.data.wholesales[i - 1]['max'])) {
            this.data.wholesales[i]['min'] = Number(this.data.wholesales[i - 1]['max']) + 1
          } else {
            this.data.wholesales[i]['min'] = Number(this.data.wholesales[i - 1]['min']) + 1
          }
        }
      },

      // 缩略图处理
      thumbnail() {
        this.data.product_info.data.first_name.forEach((v, index) => {
          this.pictureList.push({
            original: v,
            thumbnail: this.data.product_info.data.thumb_image_path[index]
          })
        })
        this.originData.product_info.list.forEach(k => {
          k.pictureListChild = []
          k.images.forEach((item, index) => {
            this.pictureIndex = index
            k.pictureListChild.push({
              original: item,
              thumbnail: k.thumb_image_path[index]
            })
          })
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
    top: 15px;
    z-index: 999;
    right: 22px;
  }
</style>
<style rel="stylesheet/scss" lang="scss">

  .el-tabs__content {
    position: unset;
  }

</style>
