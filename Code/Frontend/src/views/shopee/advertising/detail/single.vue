<template>
  <div style="position:relative">
    <!--<label class="title">Basic Information(Normal)</label>-->
    <div v-permission="permissions.single_editAll">
      <el-button class="editBtn"
                 v-if="(this.$route.params.status === '110' || this.$route.params.status === '120' || this.$route.params.status === '140' || this.$route.params.status === '170') && isEidt"
                 type="primary" size="mini"
                 @click="eidt"
      >
        编辑
      </el-button>
      <div class="editBtn">
        <el-button v-if="(this.$route.params.status === '110' || this.$route.params.status === '120' || this.$route.params.status === '140' || this.$route.params.status === '170') && !isEidt"
                   size="mini" @click="cancle"
        >
          取消编辑
        </el-button>
        <el-button v-if="(this.$route.params.status === '110' || this.$route.params.status === '120' || this.$route.params.status === '140' || this.$route.params.status === '170') && !isEidt"
                   type="primary" size="mini"
                   @click="savaAdvtData('ruleForm', 'collForm')"
        >
          更新
        </el-button>
      </div>
    </div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="Basic Information(Normal)" name="first">
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
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item v-show="isEidt" label="广告名称">
                      <p>{{ data.product_name }}</p>
                    </el-form-item>
                    <el-form-item v-show="!isEidt" label="广告名称" prop="product_name">
                      <el-input v-model="showData.product_name"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="总重(KG)">
                      <p>{{ data.product_info.total_weight }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="库存">
                      <p>{{ data.product_info.quantity }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="Site Code">
                      <p>{{ data.account_name }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-collapse-item>
            <el-collapse-item title="Price" name="2">
              <el-form
                label-width="220px"
                size="small"
                class="price-form" :model="showData" :rules="rules" ref="collForm"
              >
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="istore 产品ID">
                      <p>{{ data.product_info.istore_product_id }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="折扣活动">
                      <p>{{ data.discount && data.discount.name ? data.discount.name : '' }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item v-if="data.product_info.currency_code" :label="'售价(' + data.product_info.currency_code + ')'">
                      <p>{{ data.product_info.discount_price }}</p>
                    </el-form-item>
                    <el-form-item v-else label="售价">
                      <p>{{ data.product_info.discount_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col v-show="this.$route.params.status !== '170' ? true : isEidt" :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item v-if="data.product_info.currency_code" :label="'原价(' + data.product_info.currency_code + ')'">
                      <p>{{ data.product_info.total_price }}</p>
                    </el-form-item>
                    <el-form-item v-else label="原价">
                      <p>{{ data.product_info.total_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col v-show="this.$route.params.status !== '170' ? false : !isEidt" :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item v-if="data.product_info.currency_code" :label="'原价(' + data.product_info.currency_code + ')'" prop="total_price">
                      <el-input v-model="data.product_info.total_price"></el-input>
                    </el-form-item>
                    <el-form-item v-else label="原价" prop="total_price">
                      <el-input v-model="data.product_info.total_price"></el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item v-if="data.product_info.currency_code" :label="'运费(' + data.product_info.currency_code + ')'">
                      <p>{{ data.product_info.shipping_costs }}</p>
                    </el-form-item>
                    <el-form-item v-else label="运费">
                      <p>{{ data.product_info.shipping_costs }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="毛利率(%)">
                      <p>{{ data.product_info.gross_margin }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item v-show="isEidt" label="Shopee分类">
                      <p>{{ data.category_name }}</p>
                    </el-form-item>
                    <el-form-item v-show="!isEidt" prop="category" label="Shopee分类">
                      <el-cascader
                        placeholder="请选择分类"
                        :options="optionsData"
                        :filterable="true"
                        :props="props"
                        v-model="showData.category"
                        clearable
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
                <el-form-item label="图片">
                  <template>
                    <div style="padding-right:50px">
                      <picture-view v-if="isEidt" :pictureList="pictureList" :width="100" :height="100" :spaceBetween="6" :thumbnailWidth="80" :thumbnailHeight="80"
                                    :defaultProps="defaultProps"
                      ></picture-view>
                      <edit-image v-else :pictureList="data.product_info.images" :isEidt="isEidt" :advtId="data.product_info.advt_id" @emit-update-pictureList="updatePictureList"></edit-image>
                    </div>
                  </template>
                </el-form-item>
                <el-form-item v-if="isEidt" label="描述">
                  <div v-html="data.product_info.description" class="description"></div>
                </el-form-item>
                <el-form-item class="decPaddding" v-if="!isEidt" label="描述">
                  <el-input
                    type="textarea"
                    autosize
                    placeholder="请输入内容"
                    v-model="data.product_info.raw_description"
                  >
                  </el-input>
                </el-form-item>
                <!--<el-form-item label="描述">-->
                <!--<div v-if="isEidt">-->
                <!--<div v-html="data.product_info.description" class="description"></div>-->
                <!--</div>-->
                <!--<tinymce v-else class="no-back-ground"  v-model="data.product_info.description"  :height="400" />-->
                <!--</el-form-item>-->
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="包裹尺寸" prop="packageSize">
                      <el-row>
                        <el-col :xs="24" :sm="24" :md="8" :lg="8">
                          <el-form-item style="margin-bottom: 0" label="宽" :inline="true" prop="package_width" label-width="0">
                            <el-input v-model="showData.package_width" size="mini" style="width: 30%;margin-left: 10px;" :disabled="this.$route.params.status === '170' ? true : isEidt"></el-input>
                            CM
                          </el-form-item>
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="8" :lg="8">
                          <el-form-item style="margin-bottom: 0" label="长" :inline="true" prop="package_length" label-width="0">
                            <el-input v-model="showData.package_length" size="mini" style="width: 30%;margin-left: 10px;" :disabled="this.$route.params.status === '170' ? true : isEidt"></el-input>
                            CM
                          </el-form-item>
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="8" :lg="8">
                          <el-form-item style="margin-bottom: 0" label="高" :inline="true" prop="package_height" label-width="0">
                            <el-input v-model="showData.package_height" size="mini" style="width: 30%;margin-left: 10px;" :disabled="this.$route.params.status === '170' ? true : isEidt"></el-input>
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
                            <span v-if="data.product_info.currency_code">售价({{ data.product_info.currency_code }})</span>
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
import { getAttributes, getCategories, prohibitedJudgment, saveDetailEdit } from '@/api/shopee'

export default {
  name: 'SingleDetails',
  components: { editImage },
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
    return {
      permissions: {
        single_editAll: 'shopee.advt.alters.edit-all'//广告详情编辑
      },//权限
      activeName: 'first',
      isEidt: true,
      attribute: [],
      listPrice: [],
      addPrices: 1,
      activeNames: ['1', '2'],
      labelWidth: '220px',
      pictureList: [],
      defaultProps: {
        originalKey: 'original',
        thumbnailKey: 'thumbnail'
      },
      radio: '1',
      optionsData: [],
      value: '',
      props: {
        value: 'category_id',
        label: 'name',
        children: '_child'
      },
      arr: [],
      showData: {
        optionsBrand: [],
        product_name: '',
        category: [],
        value: '',
        package_width: '',
        package_length: '',
        package_height: '',
        total_price: ''
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
        ]
      }
    }
  },
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  methods: {
    updatePictureList(list) {
      this.data.product_info.images = list
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
          this.data.wholesales.forEach((val, index) => {
            val.min_disabled = true
            if (!index) {
              val.min_disabled = false
            }
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
    // 长宽高验证
    // validate(val) {
    //   const arr = [val.package_width.trim(), val.package_length.trim(), val.package_height.trim()]
    //   const noInput = arr.every(item => item === '')
    //   if (!noInput) {
    //     const reg = /^[1-9]\d*$/
    //     const checkResult = arr.every(item => reg.test(item))
    //     if (!checkResult) {
    //       this.$message.error('输入的长宽高必须是大于0的正整数')
    //       return false
    //     }
    //   }
    // },
    // 数据处理
    // aa() {
    //   // 字符串中 [] "去掉
    //   this.data.props_list[0].options = this.data.props_list[0].options.slice(1, -1).replace(/"/g, '')
    //   // 转为数组
    //   this.data.props_list[0].options = this.data.props_list[0].options.split(',')
    //   // 遍历
    //   this._.map(this.data.props_list[0].options, val => {
    //     this.arr.push({ value: val })
    //   })
    //   console.log(this.arr)
    // },
    // 递归遍历
    // itemForEach(val) {
    //   val.forEach(value => {
    //     value.label = value.name
    //     value.children = value._child
    //     value.value = value.id
    //     if (value._child) {
    //       this.itemForEach(value._child)
    //     }
    //   })
    // },
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
    // 修改广告详情
    savaAdvtData(ruleForm, collForm) {
      this.$refs[collForm].validate((valid) => {
        if (valid) {
          this.$refs[ruleForm].validate((valid) => {
            if (valid) {
              const obj = {
                id: this.data.id,
                product_name: this.showData.product_name,
                description: this.data.product_info.raw_description,
                wholesales: this.data.wholesales,
                category_id: this.showData.category[this.showData.category.length - 1],
                images: this.data.product_info.images,
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
                  arr[this.data.product_info.id] = this.data.product_info.total_price
                  return arr
                })()
              }
              const prohibited = {
                account_id: this.data.account_id,
                product_str: this.showData.product_name + this.data.product_info.raw_description,
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
        } else {
          return false
        }
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
      this.data.product_info.images.forEach((v, index) => {
        this.pictureList.push({
          original: v,
          thumbnail: this.data.product_info.thumb_image_path[index]
        })
      })
    }
  },
  created() {
    this.categories()
    this.showEdit()
    this.thumbnail()
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
