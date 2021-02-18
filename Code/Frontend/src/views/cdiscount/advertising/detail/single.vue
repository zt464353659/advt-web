<template>
  <div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="Basic Information(Normal)" name="first">
        <div class="header-box">
          <label class="title">Basic Information(Normal)</label>
          <el-row class="right-row" v-if="editStatus === 120 || editStatus===160">
            <el-button v-debounce type="primary"
                       size="mini"
                       @click="handleButtonChange"
                       v-permission="permissions.single_editAll"
            >
              {{ button_inner }}
            </el-button>
          </el-row>
        </div>
        <!--内容区-->
        <div class="content-box" style="padding-top: 0">
          <el-collapse v-model="activeNames">
            <el-collapse-item title="Listing Information" name="1">
              <el-form
                :label-width="labelWidth"
                size="small"
                :model="editForm"
                class="information-form"
              >
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="广告ID">
                      <p>{{ editForm.id }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="Status">
                      <p>{{ editForm.status_name }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item label="广告名称" :required="true">
                      <div v-if="(editStatus === 120 || editStatus===160) && is_edit" class="noBg">
                        <el-input v-model="editForm.product_name"
                                  type="text"
                                  size="mini"
                                  clearable
                                  placeholder="请输入广告名称"
                                  style="width: calc(98% - 150px);min-width: 200px;"
                        >
                        </el-input>
                        <el-tag size="small" :type="editForm.product_name.length > 132 ? 'danger' : 'success'">{{ editForm.product_name.length }}/132（限制字符数132）</el-tag>
                      </div>
                      <p v-else>{{ editForm.product_name }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item label="短标题" :required="true">
                      <div v-if="(editStatus === 120 || editStatus===160) && is_edit" class="noBg">
                        <el-input v-model="editForm.product_info.description.short_name"
                                  type="text"
                                  size="mini"
                                  clearable
                                  placeholder="请输入短标题"
                                  style="width: calc(98% - 150px);min-width: 200px;"
                        >
                        </el-input>
                        <el-tag size="small" :type="editForm.product_info.description.short_name.length > 30 ? 'danger' : 'success'">
                          {{ editForm.product_info.description.short_name.length }}/30（限制字符数30）
                        </el-tag>
                      </div>
                      <p v-else>{{ editForm.product_info.description.short_name }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="品牌" class="category">
                      <el-input v-if="editStatus === 160 && is_edit"
                                type="text"
                                size="mini"
                                clearable
                                placeholder="请输入内容"
                                v-model="editForm.product_info.brand"
                      >
                      </el-input>
                      <p v-else>{{ editForm.product_info.brand }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="库存" :required="true">
                      <p>{{ editForm.product_info.quantity }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item label="目录分类" class="category" :required="true">
                      <el-cascader
                        style="width: 100%"
                        size="mini"
                        v-model="category"
                        :options="options"
                        popper-class="popperClass"
                        clearable
                        filterable
                        @change="handleItemChange"
                        :props="props"
                        v-if="editStatus === 160 && is_edit"
                      ></el-cascader>
                      <p>{{ editForm.category_name }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="目录编号" class="category" :required="true">
                      <el-input v-if="editStatus === 160 && is_edit"
                                type="text"
                                size="mini"
                                clearable
                                placeholder="请输入内容"
                                @change="setCategoryId"
                                v-model="editForm.category_id"
                      >
                      </el-input>
                      <p v-else>{{ editForm.category_id }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="EAN" class="category">
                      <!--                      <el-input v-if="editStatus === 160 && is_edit"-->
                      <!--                                type="text"-->
                      <!--                                size="mini"-->
                      <!--                                clearable-->
                      <!--                                placeholder="请输入内容"-->
                      <!--                                v-model="editForm.product_info.ean"-->
                      <!--                      >-->
                      <!--                      </el-input>-->
                      <p>{{ editForm.product_info.ean }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <!-- <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="Couleur principale">
                      <p>{{ editForm.product_info.props[0].value }}</p>
                    </el-form-item>
                  </el-col> -->
                  <el-col :xs="24" :sm="24" :md="12" :lg="12" v-for="(item, index) in editForm.product_info.props" :key="index">
                    <el-form-item :label="item.display_name">
                      <div class="noBg" v-if="editStatus === 160 && is_edit">
                        <el-input v-if="item.type === 'input'"
                                  type="text"
                                  size="mini"
                                  clearable
                                  placeholder="请输入内容"
                                  v-model="item.value"
                        >
                        </el-input>
                        <el-select v-else-if="item.type === 'select'" size="small" v-model="item.value" clearable style="width:100%">
                          <el-option v-for="(option, key) in item.options" :key="key" :label="option" :value="option"></el-option>
                        </el-select>
                      </div>
                      <p v-else>{{ item.value }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-collapse-item>
            <el-collapse-item title="Price" name="2">
              <el-form
                label-width="220px"
                size="small"
                :model="editForm"
                class="price-form"
              >
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="istore 产品ID">
                      <p>{{ editForm.product_info.istore_product_id }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="SKU">
                      <p>{{ editForm.product_info.sku }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="account_name">
                      <p>{{ editForm.account_name }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="平台佣金(%)">
                      <p>{{ editForm.product_info.commission }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="毛利率(%)">
                      <p>{{ editForm.product_info.gross_margin }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="包装费(CNY)">
                      <p>{{ editForm.product_info.parcel_processing_fee }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="运输方式">
                      <p>{{ editForm.product_info.shipping_method }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="运费(CNY)">
                      <p>{{ editForm.product_info.shipping_costs }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="汇率">
                      <p>{{ editForm.product_info.currency_rate }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="产品成本(CNY)">
                      <p>{{ editForm.product_info.product_base_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="`保本价(${editForm.product_info.currency_code})`">
                      <p>{{ editForm.product_info.base_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="`原价(${editForm.product_info.currency_code})`">
                      <p>{{ editForm.product_info.total_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="`iStore价格(${editForm.product_info.currency_code})`" :required="true">
                      <!--售价仅草稿状态或未确认状态下可编辑，editStatu===1/2 可进行编辑 is_edit 当前处于编辑状态-->
                      <!--                      <el-input v-if="(editStatus === 1 || editStatus === 2) && is_edit"-->
                      <!--                                type="text"-->
                      <!--                                size="mini"-->
                      <!--                                clearable-->
                      <!--                                placeholder="请输入内容"-->
                      <!--                                v-model="editForm.product_info.discount_price"-->
                      <!--                      >-->
                      <!--                      </el-input>-->
                      <p>{{ editForm.product_info.discount_price }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="图片" :required="true">
                  <template>
                    <div :class="{'no-back-ground' : (editStatus === 120 || editStatus === 160) && is_edit}">
                      <div v-if="(editStatus === 120 || editStatus === 160) && is_edit">
                        <el-input v-model.trim="increased" style="margin-top: 12px">
                          <el-button slot="append" v-debounce @click="addImg(editForm.product_info.images)">添加</el-button>
                        </el-input>
                      </div>
                      <div style="padding-right: 50px;">
                        <PictureView
                          class="no_picture_delete"
                          :pictureList="editForm.product_info.images"
                          :isEdit="(editStatus === 120 || editStatus === 160) && is_edit"
                          @updateList="updateImages"
                          :width="100"
                          :height="100"
                          :spaceBetween="6"
                          menuType="all"
                          :thumbnailWidth="80"
                          :thumbnailHeight="80"
                          :defaultProps="defaultProps"
                        >
                        </PictureView>
                      </div>
                    </div>
                    <div class="tip-color">
                      <i class="el-icon-warning"></i>
                      第一张为主图，最多可上传4张，一行填写一个图片url (仅允许添加jpg、jpeg、png、gif类型图片url)
                    </div>
                  </template>
                </el-form-item>
                <el-form-item label="短描述" :required="true">
                  <div v-if="(editStatus === 120 || editStatus === 160) && is_edit" :class="{'no-back-ground' : (editStatus === 120 || editStatus === 160) && is_edit}">
                    <el-input
                      class="short_description"
                      type="textarea"
                      size="mini"
                      clearable
                      :rows="6"
                      placeholder="请输入内容"
                      v-model="editForm.product_info.description.short_description"
                    >
                    </el-input>
                    <el-tag style="position: absolute;bottom: 8px;right: 8px;" size="small"
                            :type="editForm.product_info.description.short_description.length > 410 ? 'danger' : 'success'"
                    >
                      {{ editForm.product_info.description.short_description.length }}/410（限制字符数410）
                    </el-tag>
                  </div>
                  <p v-else>{{ editForm.product_info.description.short_description }}</p>
                </el-form-item>
                <el-form-item label="描述" :required="true">
                  <div v-if="editStatus === 120 || editStatus === 160" style="padding-left: 0!important;">
                    <tinymce v-if="is_edit" style="padding-left: 0" class="no-back-ground" v-model="editForm.product_info.description.description" :height="400" />
                    <div v-if="is_edit" style="height:28px;position: absolute;bottom:3px;right: 15px;z-index: 10;width:380px;background-color:#ffffff ">
                      <el-tag size="mini"
                              style="float: right;margin:5px 10px 0px 0px;"
                              :type="getLength(editForm.product_info.description.description) > 5000 ? 'danger' : 'info'"
                      >
                        {{ getLength(editForm.product_info.description.description) }}/5000（限制字符数5000,包含详情中图片）
                      </el-tag>
                    </div>
                    <div v-else style="padding-left: 8px">
                      <div v-html="editForm.product_info.description.description" class="description"></div>
                      <ul class="discriptionImage">
                        <li v-show="pic.is_description_picture" v-for="(pic,index) in editForm.product_info.images" :key="index">
                          <img :src="pic.product_image_url" alt="加载失败">
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div v-else style="padding-left: 8px">
                    <div v-html="editForm.product_info.description.description" class="description"></div>
                    <ul class="discriptionImage">
                      <li v-show="pic.is_description_picture" v-for="(pic,index) in editForm.product_info.images" :key="index">
                        <img :src="pic.product_image_url" alt="加载失败">
                      </li>
                    </ul>
                  </div>
                </el-form-item>
              </el-form>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-tab-pane>
      <!--      <el-tab-pane label="指定价/指定库存日志" name="second">-->
      <!--        <operation-log :advtId="advtId" :status="advt_status" :showVaryId="false"></operation-log>-->
      <!--      </el-tab-pane>-->
    </el-tabs>
  </div>
</template>

<script>
import { changeDetail, getAllowedCategory, fetchDetail } from '@/api/cdiscount'
import Tinymce from '@/components/Tinymce'
//import OperationLog from './components/OperationLog'

export default {
  name: 'SingleDetails',
  components: {
    Tinymce
    //OperationLog
  },
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      permissions: {
        single_editAll: 'cdiscount.advt.advt.edit'//广告详情编辑
      },//权限
      // 当前广告的状态
      advtId: '',
      advt_status: '',
      activeNames: ['1', '2'],
      labelWidth: '220px',
      pictureList: [],
      button_inner: '编辑',
      is_edit: false,//路由传入的编辑判断
      switch: false,//提交按钮的文字切换
      product_name: '',
      options: [],//目录分类选择器
      props: {
        value: 'code',
        label: 'label',
        children: 'children'
      },
      category: [],//目录分类值
      categoryCode: '',
      initData: {},
      increased: '',
      editForm: {},
      editStatus: '',
      activeName: 'first',
      // 缩略图使用
      defaultProps: {
        originalKey: 'product_image_url',
        thumbnailKey: 'product_thumb_image_url'
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.getClassify()
    },
    getClassify() {//获取目录分类
      getAllowedCategory().then(res => {
        if (res.data) {
          this.options = res.data
          let arr = []
          // arr保存当前遍历寻找的结果，未找到输入id则arr无length
          this._.forEach(this.options, v => {
            this._.forEach(v.children, c => {
              this._.forEach(c.children, d => {
                if (d.children) {
                  this._.forEach(d.children, j => {
                    if (j.code === this.editForm.category_id) {
                      arr = [v.id, c.id, d.id, j.code]
                    }
                  })
                } else {
                  if (d.code === this.editForm.category_id) {
                    arr = [v.id, c.id, d.code]
                  }
                }
              })
            })
          })
          this.category = arr
        }
      })
    },
    // button
    async handleButtonChange() {
      if (this.is_edit) {
        if (this.verify()) {
          if (this.noUpdate()) {
            const params = {
              'id': this.editForm.id,
              'name': this.editForm.product_name,
              'advt_status': this.advt_status,
              'category_id': this.editForm.category_id,
              'specific': this.getAttribute(this.editForm.product_info.props),
              'product_id': this.editForm.product_info.istore_product_id, // id
              'quantity': this.editForm.product_info.quantity, // 库存
              'price': this.editForm.product_info.discount_price, // iStore价格
              'brand': this.editForm.product_info.brand,
              'ean': this.editForm.product_info.ean,
              'short_description': this.editForm.product_info.description.short_description,
              'description': this.editForm.product_info.description.description,
              'images': this.editForm.product_info.images,
              'short_name': this.editForm.product_info.description.short_name,
              'sku': this.editForm.product_info.sku
            }
            // 保存
            const loading = this.$loading({
              lock: true,
              text: '努力加载中',
              background: 'rgba(0, 0, 0, 0.5)'
            })
            changeDetail(params).then(() => {
              //提交完成后，重新获取广告详情
              fetchDetail({ advtId: this.$route.params.id, status: this.$route.params.status }).then(response => {
                this.editForm = response.data
                // this.editForm.product_info.images = this.editForm.product_info.images.map(v => v.product_image_url)
                // console.log(this.editForm.product_info)
                this.increased = ''
                this.editStatus = response.data.status//更新页面可编辑状态
                this.initData = this._.cloneDeep(this.editForm)
                this.is_edit = false
                this.button_inner = '编辑'
              })
            }).finally(_ => {
              loading.close()
            })
          }
        }
      } else {
        // 切换为可提交状态
        this.initData = this._.cloneDeep(this.editForm)
        this.is_edit = true
        this.button_inner = '保存并更新'
      }
    },
    setCategoryId(val) {
      let arr = []
      // arr保存当前遍历寻找的结果，未找到输入id则arr无length
      this._.forEach(this.options, v => {
        this._.forEach(v.children, c => {
          this._.forEach(c.children, d => {
            if (d.children) {
              this._.forEach(d.children, j => {
                if (j.code === this.editForm.category_id) {
                  arr = [v.id, c.id, d.id, j.code]
                }
              })
            } else {
              if (d.code === this.editForm.category_id) {
                arr = [v.id, c.id, d.code]
              }
            }
          })
        })
      })
      this.category = arr
      if (!arr.length) {
        this.editForm.category_id = ''
        this.$message.warning('输入的分类ID不存在，请重新输入')
      }
    },
    verify() {//保存数据，验证方法
      const integer = /^[0-9]\d*$/ // 库存
      const figure = /(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,3})?$)/ // 价格
      const eanReg = /^\d{13}$/ // ean验证13位数字
      let inputLimit = ''
      if (!this.editForm.product_name) {
        this.$message.warning('广告名称不能为空')
        return false
      }
      //目录分类验证,只在刊登失败状态下，可编辑
      if ((!this.category.length && !this.editForm.category_name) && this.editStatus === 160) {
        this.$message.warning('目录分类不能为空')
        return false
      }
      // 目录编号验证,只在刊登失败状态下，可编辑
      if (!this.editForm.category_id && this.editStatus === 160) {
        this.$message.warning('目录编号不能为空')
        return false
      }
      // 短标题验证
      if (!this.editForm.product_info.description.short_name) {
        this.$message.warning('短标题不能为空')
        return false
      }
      if (this.editForm.product_name.length > 132 || !this.editForm.product_name.length) {
        inputLimit += '标题名称不能为空且不能超过132个字符'
      }
      if (this.editForm.product_info.description.short_description.length > 410 || !this.editForm.product_info.description.short_description.length) {
        inputLimit ? inputLimit += ',短描述不能为空且不能超过410个字符' : inputLimit += '短描述不能为空且不能超过410个字符'
      }
      if (this.getLength(this.editForm.product_info.description.description) > 5000 || !this.getLength(this.editForm.product_info.description.description)) {
        inputLimit ? inputLimit += ',描述不能为空且不能超过5000个字符' : inputLimit += '描述不能为空且不能超过5000个字符'
      }
      if (this.editForm.product_info.description.short_name.length > 30 || !this.editForm.product_info.description.short_name.length) {
        inputLimit ? inputLimit += ',短标题不能为空且不能超过30个字符' : inputLimit += '短标题不能为空且不能超过30个字符'
      }
      if (inputLimit) {
        this.$message.warning(inputLimit)
        return false
      }
      if (this.editForm.product_info.ean && !eanReg.test(this.editForm.product_info.ean)) {
        this.$message.warning('请输入正确格式的EAN')
        return false
      }
      // if (!this.editForm.product_info.quantity) {
      //   this.$message.warning('库存不能为空')
      //   return false
      // } else if (!integer.test(this.editForm.product_info.quantity)) {
      //   this.$message.warning('库存只能输入整数')
      //   return false
      // } else if (!this.editForm.product_info.discount_price) {
      //   this.$message.warning('售价不能为空')
      //   return false
      // } else if (!figure.test(this.editForm.product_info.discount_price)) {
      //   this.$message.warning('售价只能为数字格式，最多保留小数点后两位')
      //   return false
      // }
      const info = this.editForm.product_info
      if (Number(info.base_price) - Number(info.discount_price) >= 0) {
        this.$message.warning('售价必须大于保本价，请重新输入')
        return false
      }
      return true
    },
    // 没有发生任何更改
    noUpdate() {
      let isSame = false
      let detal = this._.cloneDeep(this.initData)
      isSame = this._.isEqual(detal, this.editForm)
      if (isSame) {
        this.$confirm('该广告没有发生任何更改', '提示', {
          confirmButtonText: '重新编辑',
          cancelButtonText: '放弃修改',
          type: 'warning',
          closeOnClickModal: false,
          closeOnPressEscape: false
        }).then(() => {
        }).catch(() => {
          this.button_inner = '编辑'
          this.is_edit = false
        }).finally(() => {
          this.increased = ''
        })
      }
      return !isSame
    },
    handleItemChange(val) {
      this.editForm.category_id = val[val.length - 1]
    },
    // 组装属性值
    getAttribute(props) {
      const attrBute = []
      this._.forEach(props, v => {
        attrBute.push({ 'name': v.name, 'value': v.value })
      })
      return attrBute
    },

    // 添加图片
    addImg() {
      const imageList = this.editForm.product_info.images
      const reg = /^((http:\/\/|https:\/\/))[^\s]*(\.png|\.jpg|\.gif|\.jpeg)$/
      if (!this.increased) {
        this.$message.warning('请输入图片地址')
      } else if (this._.find(imageList, (item) => {
        return item.product_image_url === this.increased
      })) {
        this.$message.warning('图片已存在，不能重复添加')
      } else if (!reg.test(this.increased)) {
        this.$message.warning('请输入正确的url')
      } else {
        imageList.unshift({ product_image_url: this.increased, product_thumb_image_url: this.increased })
        this.editForm.product_info.images = []
        this.increased = ''
        this.$nextTick(() => {
          this.editForm.product_info.images = imageList
        })
      }
    },
    // 计算字符长度
    getLength(value) {
      let url
      let textLength = 0
      const data = this.editForm.product_info.images
      this._.forEach(data, (v, i) => {
        if (v.is_description_picture) {
          url += '<p><img src="' + v.product_image_url + '"</p>'
        }
      })
      if (url) {
        textLength += url.length
      }
      textLength += value.length
      return textLength
    },
    updateImages(list) {
      this.editForm.product_info.images = list
    }
  },
  watch: {
    data: {
      deep: true,
      immediate: true,
      handler(val) {
        if (val) {

          const data = this._.cloneDeep(this.data)
          // 区分详情页人口为编辑还是详情 路由传参edit 为 '0'/'1'详情/编辑 showEditButton 控制编辑按钮是否显示
          this.is_edit = Boolean(Number(this.$route.params.edit))
          // 保存当前广告状态
          this.advt_status = this.$route.params.status
          this.advtId = this.$route.params.id
          // 已上架、已下架 状态取消指定价、库存编辑
          if (this.is_edit) {//通过路由传递的参数来控制提交按钮的显示
            this.button_inner = '编辑'
            this.is_edit = false
          }
          this.initData = this._.cloneDeep(this.data)
          //获取本条数据的状态码只有120，160运行编辑
          this.editStatus = this._.cloneDeep(this.data.status)
          this.editForm = this._.cloneDeep(data)
          // this.editForm.product_info.images = this.editForm.product_info.images.map(v => v.product_image_url)
        }
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.tip-color {
  color: #E6A23C;
  line-height: 30px;
  font-size: 14px;
  background-color: transparent !important;
  display: inline-block
}

.popperClass {
  width: 600px !important;
  height: 500px !important;

  .el-cascader-menu {
    height: 100% !important
  }
}

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

.category {
  position: relative;

  .categoryCode {
    position: absolute;
    top: 0;
    right: -80px;
  }
}

.noBg {
  background-color: #ffffff !important;
  padding: 0 !important;
}

.el-form-item .el-form-item__content .short_description {
  background: #fff;
  padding-left: 0;
}

@media (max-width: 1058px) {
  .discriptionImage > li > img {
    width: 100%;
  }
}
</style>
<style rel="stylesheet/scss" lang="scss">
.popperClass {
  height: 450px !important;

  .el-cascader-menu {
    height: 100% !important;
    width: 300px !important;

    li {
      word-wrap: break-word !important;
      white-space: pre-wrap !important;
      word-break: break-all !important;
      height: auto !important;
    }
  }
}
</style>
