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
                <el-form-item label="Status">
                  <p>{{ cloneData.status_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="广告名称" prop="title">
                  <el-input v-if="isEdit" type="text" size="mini" placeholder="请输入广告名称" v-model="cloneData.title"></el-input>
                  <p v-else>{{ cloneData.title }}</p>
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
            :model="cloneData.product_info.data"
            :rules="priceFormRules"
            ref="priceForm"
          >
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="istore 产品ID">
                  <p>{{ cloneData.product_info.data.istore_product_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="保本价(USD)">
                  <p>{{ cloneData.product_info.data.base_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="原价(USD)">
                  <p>{{ cloneData.product_info.data.total_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="售价(USD)">
                  <p>{{ cloneData.product_info.data.total_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="运输方式">
                  <p>{{ cloneData.product_info.data.shipping_method }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="运费(USD)">
                  <p>{{ cloneData.product_info.data.shipping_costs }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="毛利率(%)">
                  <p>{{ cloneData.product_info.data.gross_margin }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="佣金(%)">
                  <p>{{ cloneData.product_info.data.commission }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="打包费(CNY)">
                  <p>{{ cloneData.product_info.data.parcel_processing_fee }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="汇率">
                  <p>{{ cloneData.product_info.data.currency_rate }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="属性">
                  <p v-for="(item, index) in cloneData.product_info.data.attribution" :key="index">
                    <span>{{ item.key }}：</span>
                    <span>{{ item.value }}</span>
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
            <el-form-item label="产品包装尺寸" class="pk-size">
              <el-row>
                <el-col :xs="24" :sm="24" :md="5" :lg="5">
                  <el-form-item label-width="50px" style="margin-bottom: 0" label="宽" prop="product_pack_width">
                    <div class="fl-l" v-if="isEdit">
                      <el-input
                        :disabled="!isEdit"
                        v-model="cloneData.product_info.data.product_pack_width"
                        size="mini"
                        style="width: 60%;"
                      ></el-input>
                      CM
                    </div>
                    <p class="fl-l" v-else>{{ cloneData.product_info.data.product_pack_width }} CM</p>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="5" :lg="5">
                  <el-form-item label-width="50px" style="margin-bottom: 0" label="长" prop="product_pack_length">
                    <div class="fl-l" v-if="isEdit">
                      <el-input
                        :disabled="!isEdit"
                        v-model="cloneData.product_info.data.product_pack_length"
                        size="mini"
                        style="width: 60%;"
                      ></el-input>
                      CM
                    </div>
                    <p class="fl-l" v-else>{{ cloneData.product_info.data.product_pack_length }} CM</p>
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
                        v-model="cloneData.product_info.data.product_pack_height"
                        size="mini"
                        style="width: 60%;"
                      ></el-input>
                      CM
                    </div>
                    <p v-else>{{ cloneData.product_info.data.product_pack_height }} CM</p>
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
  import { getPictures, saveDetailEdit } from '@/api/b2w'

  export default {
    name: 'SingleDetails',
    components: { PictureView, Tinymce, editImage },
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
        labelWidth: '220px',
        pictureList: [],
        defaultProps: {
          originalKey: 'original',
          thumbnailKey: 'thumbnail'
        },
        cloneData: {},
        infoRules: {
          title: [{ required: true, validator: checkTitle, trigger: 'blur' }]
        },
        priceFormRules: {
          product_pack_width: [{ required: true, validator: checkPackageSize, trigger: 'blur' }],
          product_pack_length: [{ required: true, validator: checkPackageSize, trigger: 'blur' }],
          product_pack_height: [{ required: true, validator: checkPackageSize, trigger: 'blur' }]
        },
        oldPicList: [],
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
          if (this._.isEqual(this.pictureList, this.oldPicList) && JSON.stringify(this.cloneData) === sessionStorage.getItem('copyData')) {
            reject('广告数据未发生改变!')
          }
          if (!this.cloneData.product_info.data.description) {
            reject('描述不能为空!')
          }
          if (!this.pictureList.length) {
            reject('图片不能为空!')
          }
          resolve()
        })
        Promise.all([validateInfo, validatePrice, checkOther]).then(() => {
          // 验证通过，保存数据
          const obj = {
            id: this.cloneData.id,
            image: this.pictureList,
            title: this.cloneData.title,
            description: this.cloneData.product_info.data.description,
            product_pack_width: this.cloneData.product_info.data.product_pack_width,
            product_pack_length: this.cloneData.product_info.data.product_pack_length,
            product_pack_height: this.cloneData.product_info.data.product_pack_height
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
        if (this.data.product_info.data.image_path) {
          this.data.product_info.data.image_path.forEach((v, index) => {
            this.pictureList.push({
              original: v,
              thumbnail: this.data.product_info.data.thumb_image_path[index]
            })
          })
          this.oldPicList = this._.cloneDeep(this.pictureList)
        }
      },
      // 获取istore图片
      getPic() {
        getPictures(this.$route.params.id).then(res => {
          this.istorePictures = res.data
        })
      }
    },
    created() {
      this.thumbnail()
      // 是否是可编辑状态 Online ==110、Upload_error ==150 状态产品详情页新增编辑功能
      this.cloneData = this._.cloneDeep(this.data)
      this.canEdit = Number(this.cloneData.status) === 110 || Number(this.cloneData.status) === 400
      // 可编辑状态获取istore图片
      if (this.canEdit) {
        this.getPic()
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

</style>
