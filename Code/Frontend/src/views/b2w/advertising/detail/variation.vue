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
                  <p>{{ cloneData.total_weight / 1000 }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="库存">
                  <p>{{ cloneData.quantity }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="istore 产品ID">
                  <p>{{ cloneData.product_info.data.istore_product_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Site Code">
                  <p>{{ cloneData.account_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="广告名称" prop="title">
                  <el-input v-if="isEdit" type="text" size="mini" placeholder="请输入广告名称" v-model="cloneData.title"></el-input>
                  <p v-else>{{ cloneData.title }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="主图" class="is-required-attr">
              <template>
                <edit-image
                  v-if="isEdit"
                  :pictureList="pictureList"
                  :is-edit="isEdit"
                  :pictures="istorePictures"
                  :max-length="5"
                  :default-props="defaultProps"
                  :picture-key="'original'"
                  :thumb-url="'thumbnail'"
                  @emit-update-pictureList="updateImages"
                ></edit-image>
                <p v-if="isEdit" class="no-back-ground">第一张为主图，最多可上传5张</p>
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
              </template>
            </el-form-item>
            <el-form-item label="描述" class="is-required-attr">
              <tinymce
                v-if="isEdit"
                @set-content="setContent"
                v-model="cloneData.product_info.data.description"
                :height="400"
                class="no-back-ground"
              />
              <div v-else v-html="cloneData.product_info.data.description" class="description"></div>
            </el-form-item>
          </el-form>
        </el-collapse-item>
        <el-collapse-item title="Commodity information" name="2">
          <!--<el-row v-for="(item, index) in priceForm.specifics" :key="index">-->
          <!--<el-col :xs="24" :sm="24" :md="12" :lg="12">-->
          <!--<el-form-item :label="'Specifics Name' + (index + 1)">-->
          <!--<p></p>-->
          <!--</el-form-item>-->
          <!--</el-col>-->
          <!--</el-row>-->
          <el-collapse v-model="activeNames2" class="product-collapse">
            <el-collapse-item :title="item.title" :name="index" v-for="(item, index) in cloneData.product_info.list" :key="index">
              <el-form
                :ref="'priceForm' + index"
                :model="item"
                :rules="priceFormRules"
                label-width="220px"
                size="small"
                class="price-form"
              >
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="istore 产品ID">
                      <p>{{ item.istore_product_id }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="保本价(USD)">
                      <p>{{ item.base_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="原价(USD)">
                      <p>{{ item.total_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="售价(USD)">
                      <p>{{ item.discount_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="毛利率(%)">
                      <p>{{ item.gross_margin }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="总重(KG)">
                      <p>{{ item.total_weight / 1000 }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="库存">
                      <p>{{ item.quantity }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="佣金(%)">
                      <p>{{ item.commission }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="打包费(CNY)">
                      <p>{{ item.parcel_processing_fee }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="汇率">
                      <p>{{ item.currency_rate }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="运输方式">
                      <p>{{ item.shipping_method }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="运费(USD)">
                      <p>{{ item.shipping_costs }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12" v-for="(k, index1) in item.attribution" :key="index1">
                    <el-form-item :label="k.key" class="is-required-attr">
                      <el-input v-if="isEdit" type="text" size="mini" v-model="k.value"></el-input>
                      <p v-else>{{ k.value }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item class="pictureChild" label="图片">
                  <template>
                    <div style="padding-right: 50px;">
                      <picture-view
                        v-if="item.pictureListChild && activeNames2.includes(index)"
                        :pictureList="item.pictureListChild"
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
                <el-form-item label="描述">
                  <div v-html="item.description" class="description"></div>
                </el-form-item>
                <el-form-item label="产品包装尺寸" class="pk-size">
                  <el-row>
                    <el-col :xs="24" :sm="24" :md="5" :lg="5">
                      <el-form-item label-width="50px" style="margin-bottom: 0" label="宽" prop="product_pack_width">
                        <div class="fl-l" v-if="isEdit">
                          <el-input
                            :disabled="!isEdit"
                            v-model="item.product_pack_width"
                            size="mini"
                            style="width: 60%;"
                          ></el-input>
                          CM
                        </div>
                        <p class="fl-l" v-else>{{ item.product_pack_width }} CM</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="5" :lg="5">
                      <el-form-item label-width="50px" style="margin-bottom: 0" label="长" prop="product_pack_length">
                        <div class="fl-l" v-if="isEdit">
                          <el-input
                            :disabled="!isEdit"
                            v-model="item.product_pack_length"
                            size="mini"
                            style="width: 60%;"
                          ></el-input>
                          CM
                        </div>
                        <p class="fl-l" v-else>{{ item.product_pack_length }} CM</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="5" :lg="5">
                      <el-form-item
                        label-width="50px"
                        style="margin-bottom: 0"
                        label="高"
                        prop="product_pack_height"
                      >
                        <div class="fl-l" v-if="isEdit">
                          <el-input
                            :disabled="!isEdit"
                            v-model="item.product_pack_height"
                            size="mini"
                            style="width: 60%;"
                          ></el-input>
                          CM
                        </div>
                        <p v-else>{{ item.product_pack_height }} CM</p>
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
  import { saveDetailEdit, getPictures } from '@/api/b2w'
  import Tinymce from '@/components/Tinymce'
  import editImage from './component/editImage'

  export default {
    name: 'VariationDetails',
    components: { PictureView, Tinymce, editImage },
    props: {
      data: {
        type: Object,
        required: true,
        default: () => {}
      }
    },
    created() {
      this.cloneData = this._.cloneDeep(this.data)
      this.thumbnail()
      // 是否是可编辑状态 Online ==110、Upload_error ==150 状态产品详情页新增编辑功能
      this.canEdit = Number(this.cloneData.status) === 110 || Number(this.cloneData.status) === 400
      // 可编辑状态获取istore图片
      if (this.canEdit) {
        this.getPic()
      }
    },
    data() {
      const checkPackageSize = (rule, value, callback) => {
        if (!value.trim()) {
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
        if (!value.trim()) {
          callback(new Error('标题不能为空!'))
          return
        }
        if (value.length > 180) {
          callback(new Error('标题不能超过180字符'))
          return
        }
        callback()
      }
      return {
        permissions:{
          single_editAll:"b2w.advt-management.advt-management.advt-edit",//广告详情编辑
        },//权限
        activeName: 'first',
        isEdit: false,
        canEdit: false,
        activeNames: ['1', '2'],
        activeNames2: ['1'],
        labelWidth: '220px',
        pictureList: [],
        defaultProps: {
          originalKey: 'original',
          thumbnailKey: 'thumbnail'
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
        pictureIndex: '',
        oldPicList: [],
        cloneData: {},
        infoRules: {
          title: [{ required: true, validator: checkTitle, trigger: 'blur' }]
        },
        priceFormRules: {
          product_pack_width: [{ required: true, validator: checkPackageSize, trigger: 'blur' }],
          product_pack_length: [{ required: true, validator: checkPackageSize, trigger: 'blur' }],
          product_pack_height: [{ required: true, validator: checkPackageSize, trigger: 'blur' }],
        },
        istorePictures: []
      }
    },
    methods: {
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
        this._.forEach(this.cloneData.product_info.list,(v,index) => {
          validatePriceArr.push(this.$refs['priceForm' + index][0].validate())
        })
        const validateSize = new Promise((resolve,reject) => {
          Promise.all([...validatePriceArr]).then(() => {
            resolve()
          }).catch(() => {
            reject('请检查子产品信息!')
          })
        })

        const hasSame = () => {
          // 子产品是否有重复区分项
          const specArr = this.cloneData.product_info.list.map(v => v.attribution)
          let have = false
          for (let i = 0; i < specArr.length; i++) {
            for (let j = specArr.length - 1; j > i; j--) {
              if(this._.isEqual(specArr[i],specArr[j])){
                have = true
                break
              }
            }
          }
          return have
        }
        const hasEmpty = () => {
          // 区分项是否有空值
          const allAttrValue = []
          this.cloneData.product_info.list.map(v => {
            v.attribution.map(v1 => {
              allAttrValue.push(v1.value)
            })
          })
          return allAttrValue.some(v => !v.trim())
        }
        const validateSpec = new Promise((resolve,reject) => {
          if(hasEmpty()) {
            reject('子产品区分项不能为空!')
          } else if(hasSame()) {
            reject('子产品区分项不能重复!')
          } else {
            resolve()
          }
        })
        const checkOther = new Promise((resolve, reject) => {
          if (this._.isEqual(this.pictureList,this.oldPicList) && JSON.stringify(this.cloneData) === sessionStorage.getItem('copyData')) {
            reject('广告数据未发生改变!')
          }
          if (!this.cloneData.product_info.data.description) {
            reject('描述不能为空!')
          }
          resolve()
        })
        Promise.all([validateSize, validateSpec, checkOther, validateInfo]).then(() => {
          // 验证通过，保存数据
          const list = []
          this.cloneData.product_info.list.forEach(v => {
            list.push({
              id: v.id,
              product_pack_width: v.product_pack_width,
              product_pack_length: v.product_pack_length,
              product_pack_height: v.product_pack_height,
              attribution: v.attribution
            })
          })
          const obj = {
            id: this.cloneData.id,
            image: this.pictureList,
            title: this.cloneData.title,
            description: this.cloneData.product_info.data.description,
            list
          }
          saveDetailEdit(obj).then(() => {
            this.isEdit = false
            this.$parent.init()
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
          this.$parent.init()
        }
      },
      // tinymce内容重置
      setContent(content) {
        this.cloneData.product_info.data.description = content
        sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
      },
      // 图片更新
      updateImages(list) {
        this.pictureList = list
      },
      // 缩略图处理
      thumbnail() {
        // 主产品图片格式处理
        if (this.cloneData.product_info.data.image_path) {
          this.cloneData.product_info.data.image_path.forEach((v, index) => {
            this.pictureList.push({
              original: v,
              thumbnail: this.data.product_info.data.thumb_image_path[index]
            })
          })
        }
        // 存储原始图片
        this.oldPicList = this._.cloneDeep(this.pictureList)
        // 子产品图片格式处理
        if (this.cloneData.product_info.list) {
          this.cloneData.product_info.list.forEach(k => {
            k.pictureListChild = []
            if (k.image_path) {
              k.image_path.forEach((item, index) => {
                this.pictureIndex = index
                k.pictureListChild.push({
                  original: item,
                  thumbnail: k.thumb_image_path[index]
                })
              })
            }
          })
        }
      },
      // 获取istore图片
      getPic() {
        getPictures(this.$route.params.id).then(res => {
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

  .pictureChild {
    .picture-list {
      height: 106px;
    }
  }

  .pk-size {
    .el-form-item__error{
      background: #fff !important;
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
