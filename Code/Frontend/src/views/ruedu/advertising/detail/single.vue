<template>
  <div>
    <div class="header-box">
      <label class="title">Basic Information(Normal)</label>
      <div class="edit-div" v-permission="permissions.single_edit">
        <el-button v-if="canEdit && !isEdit" type="primary" size="mini" @click="editAdvt">编辑</el-button>
        <el-button v-if="isEdit" type="primary" size="mini" @click="cancelEdit">取消编辑</el-button>
        <el-button v-if="isEdit" type="success" size="mini" @click="saveAdvt">保存</el-button>
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
          >
            <el-row>
              <el-col :xs="24" :sm="24" :md="24" :lg="24" :class="{'no-back-ground':isEdit}">
                <el-form-item label="长标题" prop="name">
                  <el-input v-if="isEdit" size="mini" v-model="cloneData.desc.name"></el-input>
                  <p v-else>{{ cloneData.desc.name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="短标题" prop="short_name" :class="{'no-back-ground':isEdit}">
                  <el-input v-if="isEdit" size="mini" v-model="cloneData.desc.short_name" class="no-back-ground"></el-input>
                  <p v-else>{{ cloneData.desc.short_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="accountName">
                  <p>{{ cloneData.account.account }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="广告ID">
                  <p>{{ cloneData.product.id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="Status">
                  <p>{{ cloneData.product.status }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="产品分类">
                  <p>{{ cloneData.product.category_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="库存">
                  <p>{{ cloneData.product.quantity }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="总重(g)">
                  <p>{{ cloneData.product.total_weight }}</p>
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
          >
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="istore 产品ID">
                  <p>{{ cloneData.product.istore_product_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="平台佣金(%)">
                  <p>{{ cloneData.product.commission }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="'保本价(' + cloneData.product.currency_code + ')'">
                  <p>{{ cloneData.product.base_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="'原价(' + cloneData.product.currency_code + ')'">
                  <p>{{ cloneData.product.total_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="'售价(' + cloneData.product.currency_code + ')'">
                  <p>{{ cloneData.product.total_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="毛利率(%)">
                  <p>{{ cloneData.product.gross_margin }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="运输方式">
                  <p>{{ cloneData.product.shipping_method }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="`运费(${cloneData.product.currency_code})`">
                  <p>{{ cloneData.product.shipping_costs }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="打包费(CNY)">
                  <p>{{ cloneData.product.parcel_processing_fee }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="汇率">
                  <p>{{ cloneData.product.currency_rate }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="图片">
              <template>
                <div :class="{'no-back-ground' : isEdit}">
                  <!--<div v-if="isEdit">-->
                  <!--<el-input v-model="add_url" style="margin-top: 12px">-->
                  <!--<el-button slot="append" v-debounce @click="addImg(pictureList)">添加</el-button>-->
                  <!--</el-input>-->
                  <!--</div>-->
                  <div style="padding-right: 50px;">
                    <picture-view
                      class="no_picture_delete"
                      :pictureList="pictureList"
                      :isEdit="isEdit"
                      @updateList="updateImages"
                      :width="100"
                      :height="100"
                      :spaceBetween="6"
                      menuType="all"
                      :thumbnailWidth="80"
                      :thumbnailHeight="80"
                      :defaultProps="defaultProps"
                    >
                    </picture-view>
                  </div>
                </div>
                <p v-if="isEdit" class="no-back-ground">第一张为主图，最多可上传5张</p>
              </template>
            </el-form-item>
            <el-form-item label="短描述" prop="short_description">
              <tinymce
                v-if="isEdit"
                @set-content="setContentShort"
                v-model="cloneData.desc.short_description"
                :height="200"
                class="no-back-ground"
              />
              <div v-else v-html="cloneData.desc.short_description" class="description"></div>
            </el-form-item>
            <el-form-item label="长描述" prop="description">
              <tinymce
                v-if="isEdit"
                @set-content="setContent"
                v-model="cloneData.desc.description"
                :height="400"
                class="no-back-ground"
              />
              <div v-else v-html="cloneData.desc.description" class="description"></div>
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
  import Tinymce from '@/components/Tinymce'
  import { saveDetail,fetchDetail } from '@/api/ruedu'

  export default {
    name: 'SingleDetails',
    components: { Tinymce },
    data() {
      return {
        permissions:{
          single_edit:"rueducommerce.advt.advt.edit",//广告编辑
        },//权限
        activeName: 'first',
        activeNames: ['1', '2'],
        labelWidth: '220px',
        pictureList: [],
        defaultProps: {
          originalKey: 'original',
          thumbnailKey: 'thumbnail'
        },
        // 当前广告是否可编辑(仅activing状态可编辑)
        canEdit: false,
        // 是否已经在编辑状态
        isEdit: false,
        // copy源数据
        cloneData: {},
        // 添加图片url
        add_url: '',
        pic_list: []
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
      // 缩略图处理
      thumbnail() {
        this.cloneData.img.forEach((v) => {
          this.pictureList.push({
            original: v.image_path,
            thumbnail: v.thumb_image_path
          })
        })
        this.pic_list = this._.cloneDeep(this.pictureList)
      },
      // 编辑
      editAdvt() {
        this.isEdit = true
      },
      // 取消编辑，页面重载
      cancelEdit() {
        window.location.reload()
      },
      // 没有发生任何更改
      noUpdate() {
        const copyData = JSON.parse(sessionStorage.getItem('copyData'))
        if (this._.isEqual(copyData, this.cloneData) && this._.isEqual(this.pictureList,this.pic_list)) {
          this.$confirm('广告没有发生任何更改,请重新编辑', '提示', {
            confirmButtonText: '重新编辑',
            cancelButtonText: '放弃修改',
            type: 'warning'
          }).then(() => {
            document.querySelector('.el-input__inner').focus()
          }).catch(() => {
            this.isEdit = false
          })
        }
        return this._.isEqual(copyData, this.cloneData) && this._.isEqual(this.pictureList,this.pic_list)
      },
      // 编辑保存
      saveAdvt() {
        // 无空值且已修改
        if(this.checkEmpty() && !this.noUpdate()) {
          const loading = this.$loading({
            lock: true,
            text: '努力加载中',
            background: 'rgba(0, 0, 0, 0.5)'
          })
          const obj = {
            id: this.$route.params.id,
            imageList: this.pictureList,
            name: this.cloneData.desc.name,
            short_name: this.cloneData.desc.short_name,
            description: this.cloneData.desc.description,
            short_description: this.cloneData.desc.short_description
          }
          // const obj = this.formatParams()
          saveDetail(obj).then(() => {
            this.reload()
            this.isEdit = false
          }).catch(() => {
            this.cloneData = JSON.parse(sessionStorage.getItem('copyData'))
          }).finally(() => {
            loading.close()
          })
        }
      },
      reload() {
        const obj = {
          id: this.$route.params.id,
          not_show_message: true
        }
        fetchDetail(obj).then(res => {
          this.cloneData = res.data
        })
      },
      formatParams() {
        const copyData = JSON.parse(sessionStorage.getItem('copyData'))
        const obj = {}
        obj.id = this.$route.params.id
        if (!this._.isEqual(this.pic_list,this.pictureList)) {
          obj.imageList = this.pictureList
        }
        if (copyData.desc.name !== this.cloneData.desc.name ) {
          obj.name = this.cloneData.desc.name
        }
        if (copyData.desc.short_name !== this.cloneData.desc.short_name) {
          obj.short_name = this.cloneData.desc.short_name
        }
        if (copyData.desc.description !== this.cloneData.desc.description) {
          obj.description = this.cloneData.desc.description
        }
        if (copyData.desc.short_description !== this.cloneData.desc.short_description) {
          obj.short_description = this.cloneData.desc.short_description
        }
        return obj
      },
      setContent(content) {
        this.data.desc.description = content
        sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
      },
      setContentShort(content) {
        this.data.desc.short_description = content
        sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
      },
      // 添加图片
      addImg() {
        const imageList = this.pictureList
        if (!this.add_url) {
          this.$message.warning('请输入图片地址')
        } else if (this._.find(imageList, (item) => {
          return item.original === this.add_url
        })) {
          this.$message.warning('图片已存在，不能重复添加')
        } else {
          imageList.unshift({ original: this.add_url, thumbnail: this.add_url })
          this.pictureList = []
          this.$nextTick(() => {
            this.pictureList = imageList
          })
        }
      },
      updateImages(list) {
        this.pictureList = list
      },
      // 非空检测
      checkEmpty() {
        if (!this.cloneData.desc.name.trim()) {
          this.$message.warning('长标题不能为空')
          return false
        }
        if (!this.cloneData.desc.short_name.trim()) {
          this.$message.warning('短标题不能为空')
          return false
        }
        if (!this.cloneData.desc.description.trim()) {
          this.$message.warning('描述不能为空')
          return false
        }
        if (!this.cloneData.desc.short_description.trim()) {
          this.$message.warning('短描述不能为空')
          return false
        }
        return true
      },
    },
    created() {
      // 是否activing状态
      this.canEdit = Number(this.$route.params.status) === 40
      this.cloneData = this._.cloneDeep(this.data)
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
    top: 76px;
    z-index: 999;
    right: 22px;
  }
  .edit-div{
    float: right;
  }
</style>
<style rel="stylesheet/scss" lang="scss">

  .el-tabs__content {
    position: unset;
  }
  .el-form-item__error{
    background: #fff !important;
  }
</style>
