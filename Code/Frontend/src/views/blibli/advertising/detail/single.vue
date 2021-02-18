<template>
  <div>
    <div class="header-box">
      <label class="title">Basic Information(Normal)</label>
      <div style="float:right;" v-permission="permissions.single_editAll">
        <el-button v-show="canEdit && !isEdit" type="primary" size="mini" @click="toggleEdit(true)">编辑</el-button>
        <el-button v-show="canEdit && isEdit" type="success" size="mini" @click="saveEdit">保存</el-button>
        <el-button v-show="canEdit && isEdit" type="secondary" size="mini" @click="toggleEdit(false)">取消编辑</el-button>
      </div>
    </div>
    <!--内容区-->
    <div class="content-box" style="padding-top: 0">
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
                <el-form-item label="总重(G)">
                  <p>{{ cloneData.product_info.total_weight }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="库存">
                  <p>{{ cloneData.product_info.quantity }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Site Code">
                  <p>{{ cloneData.account_name }}</p>
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
            :model="cloneData"
            :rules="priceFormRules"
            ref="priceForm"
          >
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="istore 产品ID">
                  <p>{{ cloneData.product_info.istore_product_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="UPC">
                  <p>{{ cloneData.product_info.upc }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="运输方式">
                  <p>{{ cloneData.product_info.shipping_method }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="运费(CNY)">
                  <p>{{ cloneData.product_info.shipping_costs }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="保本价(INR)">
                  <p>{{ cloneData.product_info.base_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="售价(INR)">
                  <p>{{ cloneData.product_info.discount_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="原价(INR)">
                  <p>{{ cloneData.product_info.total_price }}</p>
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
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="分类目录ID">
                  <p>{{ cloneData.category_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="分类目录" prop="category">
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
            </el-row>
            <el-row>
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
            <el-form-item label="图片">
              <template>
                <edit-image
                  v-if="isEdit"
                  :pictureList="pictureList"
                  :is-edit="isEdit"
                  :pictures="istorePictures"
                  :max-length="5"
                  :default-props="defaultProps"
                  :picture-key="'url'"
                  :thumb-url="'thumb_url'"
                  @emit-update-pictureList="updateImages"
                ></edit-image>
                <div v-else style="padding-right:50px">
                  <picture-view
                    :pictureList="pictureList"
                    :width="100"
                    :height="100"
                    :spaceBetween="6"
                    :thumbnailWidth="80"
                    :thumbnailHeight="80"
                    :defaultProps="defaultProps"
                  ></picture-view>
                </div>
                <p v-if="isEdit" class="no-back-ground">第一张为主图，最多可上传5张</p>
              </template>
            </el-form-item>
            <el-form-item label="描述">
              <tinymce
                v-if="isEdit"
                @set-content="setContent"
                v-model="cloneData.product_info.description"
                :height="400"
                class="no-back-ground"
              />
              <div v-else v-html="cloneData.product_info.description" class="description"></div>
            </el-form-item>
            <el-form-item label="产品卖点">
              <tinymce
                v-if="isEdit"
                @set-content="setContentProduct"
                v-model="cloneData.product_info.selling_point"
                :height="200"
                class="no-back-ground"
              />
              <div v-else v-html="cloneData.product_info.selling_point" class="description"></div>
            </el-form-item>
            <el-form-item label="包装尺寸" class="pk-size" prop="package_size">
              <el-row>
                <el-col :xs="24" :sm="24" :md="5" :lg="5">
                  <el-form-item label-width="50px" style="margin-bottom: 0" label="宽" prop="pack_width">
                    <div class="fl-l" v-if="isEdit">
                      <el-input
                        :disabled="!isEdit"
                        v-model="cloneData.product_info.pack_width"
                        size="mini"
                        style="width: 60%;"
                      ></el-input>
                      CM
                    </div>
                    <p class="fl-l" v-else>{{ cloneData.product_info.pack_width }} CM</p>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="5" :lg="5">
                  <el-form-item label-width="50px" style="margin-bottom: 0" label="长" prop="pack_length">
                    <div class="fl-l" v-if="isEdit">
                      <el-input
                        :disabled="!isEdit"
                        v-model="cloneData.product_info.pack_length"
                        size="mini"
                        style="width: 60%;"
                      ></el-input>
                      CM
                    </div>
                    <p class="fl-l" v-else>{{ cloneData.product_info.pack_length }} CM</p>
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
                        v-model="cloneData.product_info.pack_height"
                        size="mini"
                        style="width: 60%;"
                      ></el-input>
                      CM
                    </div>
                    <p v-else>{{ cloneData.product_info.pack_height }} CM</p>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form-item>
          </el-form>
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
    name: 'SingleDetails',
    components: { PictureView, Tinymce, editImage },
    data() {
      const checkPackageSize = (rule, value, callback) => {
        if (!this.cloneData.product_info.pack_height || !this.cloneData.product_info.pack_length || !this.cloneData.product_info.pack_width) {
          callback(new Error('尺寸不能为空!'))
          return
        }
        if (Number(this.cloneData.product_info.pack_height) <= 0 || Number(this.cloneData.product_info.pack_width) <= 0 || Number(this.cloneData.product_info.pack_length) <= 0) {
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
      const checkCategory = (rule,value,callback) => {
        callback()
      }
      return {
        permissions:{
          single_editAll:"blibli.advt.alters.edit-all",//广告详情编辑
        },//权限
        activeName: 'first',
        activeNames: ['1', '2'],
        labelWidth: '220px',
        pictureList: [],
        defaultProps: {
          originalKey: 'url',
          thumbnailKey: 'thumb_url'
        },
        isEdit: false,
        canEdit: false,
        cloneData: {},
        infoRules: {
          product_name: [{ required: true, validator: checkTitle, trigger: 'blur' }],
          category_name: [{ required: true, validator: checkCategory, trigger: 'blur' }]
        },
        priceFormRules: {
          package_size: { required: true, validator: checkPackageSize, trigger: ['blur','change'] }
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
    props: {
      data: {
        type: Object,
        required: true,
        default: () => {
        }
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
        const validatePrice = new Promise((resolve, reject) => {
          this.$refs['priceForm'].validate(valid => {
            if (valid) {
              resolve()
            } else {
              reject('请检查 Commodity information 数据!')
            }
          })
        })
        const checkOther = new Promise((resolve, reject) => {
          if (this._.isEqual(this.pictureList,this.oldPicList) && JSON.stringify(this.cloneData) === sessionStorage.getItem('copyData')) {
            reject('广告数据未发生改变!')
          }
          if (!this.cloneData.product_info.description) {
            reject('描述不能为空!')
          }
          if (!this.cloneData.product_info.selling_point) {
            reject('产品卖点不能为空!')
          }
          if (this.cloneData.product_info.selling_point.length > 500) {
            reject('卖点最多输入500字符!')
          }
          if (!this.pictureList.length) {
            reject('图片不能为空!')
          }
          resolve()
        })
        Promise.all([checkOther,validatePrice, validateInfo]).then(() => {
          // 验证通过，保存数据
          const props = {}
          this.cloneData.props_list.map(v => {
            props[v.attribute_name] = v.value
          })
          const obj = {
            id: this.cloneData.id,
            category_id: this.category[this.category.length - 1],
            product_name: this.cloneData.product_name,
            description: this.cloneData.product_info.description,
            selling_point: this.cloneData.product_info.selling_point,
            props,
            list: [{
              id: this.cloneData.product_info.id,
              images: this.pictureList,
              pack_width: this.cloneData.product_info.pack_width,
              pack_length: this.cloneData.product_info.pack_length,
              pack_height: this.cloneData.product_info.pack_height
            }]
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
      setContentProduct(content) {
        this.cloneData.product_info.selling_point = content
        sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
      },
      // 图片更新
      updateImages(list) {
        this.pictureList = list
      },
      // 缩略图处理
      thumbnail() {
        if (this.data.product_info.images) {
          this.data.product_info.images.forEach((v, index) => {
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
      },
      formatOriginData() {
        this.category = []
        this._.map(this.cloneData.category_nodes, v => {
          this.category.push(v.category_id)
        })
      }
    },
    created() {
      this.thumbnail()
      // 是否是可编辑状态 Online ==110、Upload_error ==150
      this.cloneData = this._.cloneDeep(this.data)
      this.canEdit = Number(this.cloneData.status) === 110 || Number(this.cloneData.status) === 150
      // 组装数据
      this.formatOriginData()
      if(this.canEdit) {
        this.getCategory()
        this.getPics()
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
</style>
<style rel="stylesheet/scss" lang="scss">

  .el-tabs__content {
    position: unset;
  }

  .pk-size {
    .el-form-item__error {
      background: #fff !important;
    }
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
</style>
