<template>
  <div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="Basic Information(variation)" name="first">
        <div class="header-box">
          <label class="title">Basic Information(variation)</label>
          <el-row class="right-row" v-if="editStatus === 120 || editStatus===160">
            <el-button v-debounce type="primary" size="mini" @click="handleButtonChange" v-permission="permissions.single_editAll">
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
                class="information-form"
                :model="editForm"
              >
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="account">
                      <p>{{ editForm.account_name }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="广告ID">
                      <p>{{ editForm.id }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
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
                        <el-input v-model="editForm.product_info.data.description.short_name"
                                  type="text"
                                  size="mini"
                                  clearable
                                  placeholder="请输入短标题"
                                  style="width: calc(98% - 150px);min-width: 200px;"
                        >
                        </el-input>
                        <el-tag size="small" :type="editForm.product_info.data.description.short_name.length > 30 ? 'danger' : 'success'">
                          {{ editForm.product_info.data.description.short_name.length }}/30（限制字符数30）
                        </el-tag>
                      </div>
                      <p v-else>{{ editForm.product_info.data.description.short_name }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item label="目录编号" class="category" required>
                      <div class="noBg">
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
                      </div>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-col :xs="24" :sm="24" :md="24" :lg="24">
                  <el-form-item label="目录分类" class="category" required>
                    <!-- <el-cascader style="width: 100%"
                                 v-model="category"
                                 :options="options"
                                 clearable
                                 filterable
                                 popper-class="popperClass"
                                 size="mini"
                                 @change="handleItemChange"
                                 :props="props"
                                 v-if="editStatus === 160 && is_edit"
                    >
                    </el-cascader> -->
                    <p>{{ editForm.category_name }}</p>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="12" :lg="12" v-for="(v,k) in editForm.product_info.data.attribute" :key="k">
                  <el-form-item :label="v.key">
                    <div v-if="editStatus === 1" class="noBg">
                      <el-input v-if="is_edit"
                                type="text"
                                size="mini"
                                clearable
                                placeholder="请输入内容"
                                v-model="v.value"
                      >
                      </el-input>
                      <p v-else>{{ v.value }}</p>
                    </div>
                    <p v-else>{{ v.value }}</p>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="24" :lg="24">
                  <el-form-item label="短描述" required>
                    <div v-if="(editStatus === 120 || editStatus === 160) && is_edit" class="noBg">
                      <div v-if="is_edit">
                        <el-input
                          class="short_description"
                          type="textarea"
                          size="mini"
                          clearable
                          :rows="6"
                          placeholder="请输入内容"
                          v-model="editForm.product_info.data.description.short_description"
                        >
                        </el-input>
                        <el-tag style="position: absolute;bottom: 8px;right: 8px;" size="small"
                                :type="editForm.product_info.data.description.short_description.length > 410 ? 'danger' : 'success'"
                        >
                          {{ editForm.product_info.data.description.short_description.length }}/410（限制字符数410）
                        </el-tag>
                      </div>
                      <p v-else>{{ editForm.product_info.data.description.short_description }}</p>
                    </div>
                    <p v-else>{{ editForm.product_info.data.description.short_description }}</p>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="24" :md="24" :lg="24">
                  <!-- <el-form-item label="描述">
                    <div v-html="editForm.product_info.data.description.description" class="description"></div>
                  </el-form-item> -->
                  <el-form-item label="描述" required>
                    <div v-if="(editStatus === 120 || editStatus === 160) && is_edit" style="position: relative">
                      <tinymce class="no-back-ground" v-model="editForm.product_info.data.description.description" :height="400" />
                      <div v-if="is_edit" style="height:28px;position: absolute;bottom:3px;right: 15px;z-index: 10;width:380px;background-color:#ffffff ">
                        <el-tag size="mini"
                                style="float: right;margin:5px 10px 0px 0px;"
                                :type="getLength(editForm.product_info.data.description.description, editForm.product_info.data.images) > 5000 ? 'danger' : 'info'"
                        >
                          {{ getLength(editForm.product_info.data.description.description, editForm.product_info.data.images) }}/5000（限制字符数5000,包含详情中图片）
                        </el-tag>
                      </div>
                      <div style="padding-left: 10px!important;" v-else class="description">
                        <div v-html="editForm.product_info.data.description.description"></div>
                        <ul class="discriptionImage">
                          <li v-show="pic.is_description_picture"
                              v-for="(pic,key) in editForm.product_info.data.images"
                              :key="key"
                          >
                            <img :src="pic.product_image_url" alt="加载失败">
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div style="padding-left: 10px!important;" v-else class="description">
                      <div v-html="editForm.product_info.data.description.description"></div>
                      <ul class="discriptionImage">
                        <li v-show="pic.is_description_picture"
                            v-for="(pic,key) in editForm.product_info.data.images"
                            :key="key"
                        >
                          <img :src="pic.product_image_url" alt="加载失败">
                        </li>
                      </ul>
                    </div>
                  </el-form-item>
                </el-col>
                <!-- <el-col :xs="24" :sm="24" :md="24" :lg="24">
                  <el-form-item label="图片" required>
                    <template>
                      <div style="padding-right: 50px;">
                        <transition name="fade">
                          <picture-view
                            class="no_picture_delete"
                            :class="{ 'no-back-ground' : is_edit }"
                            v-if="editForm.product_info.data.images"
                            :pictureList="editForm.product_info.data.images"
                            :isEdit="is_edit"
                            @updateList="updateImagesMain($event)"
                            :width="100"
                            :height="100"
                            :spaceBetween="6"
                            menuType="all"
                            :thumbnailWidth="80"
                            :thumbnailHeight="80"
                            :defaultProps="defaultProps"
                          >
                          </picture-view>
                        </transition>
                      </div>
                      <p class="no-back-ground">最多上传10张图片，默认第一张为主图。</p>
                    </template>
                  </el-form-item>
                </el-col> -->
              </el-form>
            </el-collapse-item>
            <el-collapse-item title="Price" name="2">
              <el-form
                ref="form"
                :model="priceForm"
                label-width="220px"
                size="small"
                class="price-form"
              >
                <el-row v-for="(item, index) in priceForm.specifics" :key="index">
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="'Specifics Name' + (index + 1)">
                      <p></p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-collapse v-model="activeNames2" class="product-collapse">
                  <el-collapse-item :name="index" v-for="(item, index) in editForm.product_info.list" :key="index">
                    <template slot="title">
                      <div class="product-title">{{ item.istore_product_id }}</div>
                    </template>
                    <el-row>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item label="istore 产品ID">
                          <p>{{ item.istore_product_id }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item label="SKU">
                          <p>{{ item.sku }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item label="Status">
                          <p>{{ item.advt_status_name }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item label="品牌" class="category">
                          <div v-if="editStatus === 160 && is_edit" class="noBg">
                            <el-input v-if="is_edit"
                                      type="text"
                                      size="mini"
                                      clearable
                                      placeholder="请输入内容"
                                      v-model="item.brand"
                            >
                            </el-input>
                            <p v-else>{{ item.brand }}</p>
                          </div>
                          <p v-else>{{ item.brand }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item label="总重(KG)">
                          <p>{{ item.total_weight }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item label="包装费(CNY)">
                          <p>{{ item.parcel_processing_fee }}</p>
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
                        <el-form-item label="平台佣金(%)">
                          <p>{{ item.commission }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item label="汇率">
                          <p>{{ item.currency_rate }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item label="产品成本(CNY)">
                          <p>{{ item.product_base_price }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item :label="`保本价(${item.currency_code})`">
                          <p>{{ item.base_price }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item :label="`原价(${item.currency_code})`">
                          <p>{{ item.total_price }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item :label="`iStore价格(${item.currency_code})`" required>
                          <!-- <el-input v-if="(editStatus === 120 || editStatus === 160) && is_edit"
                                    type="text"
                                    size="mini"
                                    clearable
                                    placeholder="请输入内容"
                                    v-model="item.discount_price"
                          >
                          </el-input> -->
                          <p>{{ item.discount_price }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item label="库存" required>
                          <!-- <el-input v-if="(editStatus === 120 || editStatus === 160) && is_edit"
                                    type="text"
                                    size="mini"
                                    clearable
                                    placeholder="请输入内容"
                                    v-model="item.quantity"
                          >
                          </el-input> -->
                          <p>{{ item.quantity }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item label="EAN">
                          <!--                          <el-input v-if="item.editStatus === 1 && is_edit"-->
                          <!--                                    type="text"-->
                          <!--                                    size="mini"-->
                          <!--                                    clearable-->
                          <!--                                    placeholder="请输入内容"-->
                          <!--                                    v-model="item.ean"-->
                          <!--                          >-->
                          <!--                          </el-input>-->
                          <p>{{ item.ean }}</p>
                        </el-form-item>
                      </el-col>
                      <!-- <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item label="Couleur principale">
                          <p>{{ item.props[0].value }}</p>
                        </el-form-item>
                      </el-col> -->
                    </el-row>
                    <el-row>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12" v-for="(obj, index1) in item.props" :key="index1">
                        <el-form-item :label="obj.display_name">
                          <div class="noBg" v-if="editStatus === 160 && is_edit">
                            <el-input v-if="obj.type === 'input'"
                                      type="text"
                                      size="mini"
                                      clearable
                                      placeholder="请输入内容"
                                      v-model="obj.value"
                            >
                            </el-input>
                            <el-select v-else-if="obj.type === 'select'" size="small" v-model="obj.value" clearable style="width:100%">
                              <el-option v-for="(option, key) in obj.options" :key="key" :label="option" :value="option"></el-option>
                            </el-select>
                          </div>
                          <p v-else>{{ obj.value }}</p>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-form-item label="图片" required>
                      <template>
                        <div style="padding-right: 50px;">
                          <transition name="fade">
                            <picture-view
                              class="no_picture_delete"
                              :class="{ 'no-back-ground' : is_edit }"
                              v-if="item.images && activeNames2.includes(index)"
                              :pictureList="item.images"
                              :isEdit="is_edit"
                              @updateList="updateImages($event, index)"
                              :width="100"
                              :height="100"
                              :spaceBetween="6"
                              menuType="all"
                              :thumbnailWidth="80"
                              :thumbnailHeight="80"
                              :defaultProps="defaultProps"
                            >
                            </picture-view>
                          </transition>
                          <!-- </div> -->
                        </div>
                        <p class="no-back-ground">最多上传4张图片，默认第一张为主图。</p>
                      </template>
                    </el-form-item>
                    <!-- <el-form-item label="标题" required>
                      <div v-if="(editStatus === 120 || editStatus === 160) && is_edit" class="noBg">
                        <el-input v-model="item.product_name"
                                  type="text"
                                  size="mini"
                                  clearable
                                  placeholder="请输入广告名称"
                                  style="width: calc(98% - 150px);min-width: 200px;"
                        >
                        </el-input>
                        <el-tag size="small" :type="item.product_name.length > 132 ? 'danger' : 'info'">{{ item.product_name.length }}/132（限制字符数132）</el-tag>
                      </div>
                      <p v-else>{{ item.product_name }}</p>
                    </el-form-item> -->
                    <!-- <el-form-item label="短标题" required>
                      <div v-if="(editStatus === 120 || editStatus === 160) && is_edit" class="noBg">
                        <el-input v-model="item.description.short_name"
                                  type="text"
                                  size="mini"
                                  clearable
                                  placeholder="请输入广告名称"
                                  style="width: calc(98% - 150px);min-width: 200px;"
                        >
                        </el-input>
                        <el-tag size="small" :type="item.description.short_name.length > 30 ? 'danger' : 'info'">{{ item.description.short_name.length }}/30（限制字符数30）</el-tag>
                      </div>
                      <p v-else>{{ item.description.short_name }}</p>
                    </el-form-item>
                    <el-form-item label="短描述" required>
                      <div v-if="(editStatus === 120 || editStatus === 160) && is_edit" class="noBg">
                        <div v-if="is_edit">
                          <el-input
                            class="short_description"
                            type="textarea"
                            size="mini"
                            clearable
                            :rows="6"
                            placeholder="请输入内容"
                            v-model="item.description.short_description"
                          >
                          </el-input>
                          <el-tag style="position: absolute;bottom: 8px;right: 8px;" size="small"
                                  :type="item.description.short_description.length > 410 ? 'danger' : 'info'"
                          >
                            {{ item.description.short_description.length }}/410（限制字符数410）
                          </el-tag>
                        </div>
                        <p v-else>{{ item.description.short_description }}</p>
                      </div>
                      <p v-else>{{ item.description.short_description }}</p>
                    </el-form-item> -->
                    <!-- <el-form-item label="描述" required>
                      <div v-if="(editStatus === 120 || editStatus === 160) && is_edit" style="position: relative">
                        <tinymce class="no-back-ground" v-model="item.description.description" :height="400" />
                        <div v-if="is_edit" style="height:28px;position: absolute;bottom:3px;right: 15px;z-index: 10;width:380px;background-color:#ffffff ">
                          <el-tag size="mini"
                                  style="float: right;margin:5px 10px 0px 0px;"
                                  :type="getLength(item.description.description, item.images) > 5000 ? 'danger' : 'info'"
                          >
                            {{ getLength(item.description.description, item.images) }}/5000（限制字符数5000,包含详情中图片）
                          </el-tag>
                        </div>
                        <div style="padding-left: 10px!important;" v-else class="description">
                          <div v-html="item.description.description"></div>
                          <ul class="discriptionImage">
                            <li v-show="pic.is_description_picture"
                                v-for="(pic,key) in item.images"
                                :key="key"
                            >
                              <img :src="pic.product_image_url" alt="加载失败">
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div style="padding-left: 10px!important;" v-else class="description">
                        <div v-html="item.description.description"></div>
                        <ul class="discriptionImage">
                          <li v-show="pic.is_description_picture"
                              v-for="(pic,key) in item.images"
                              :key="key"
                          >
                            <img :src="pic.product_image_url" alt="加载失败">
                          </li>
                        </ul>
                      </div>
                    </el-form-item> -->
                  </el-collapse-item>
                </el-collapse>
              </el-form>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { getAllowedCategory, changeDetail, fetchDetail } from '@/api/cdiscount'
import Tinymce from '@/components/Tinymce'
import OperationLog from './components/OperationLog'

export default {
  name: 'VariationDetails',
  components: {
    Tinymce
  },
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      permissions:{
        single_editAll:"cdiscount.advt.advt.edit",//广告详情编辑
      },//权限
      button_inner: '保存',
      category: [],
      options: [],
      categoryCode: '',
      is_edit: false,
      is_editImg: false, // 图片暂不编辑
      props: {
        value: 'code',
        label: 'label',
        children: 'children'
      },
      activeNames: ['1', '2'],
      activeNames2: ['1'],
      labelWidth: '220px',
      pictureList: [],
      priceForm: {},
      showEditButton: false,
      initData: {},
      editForm: {},
      increased: [],
      editStatus: '',
      activeName: 'first',
      defaultProps: {
        originalKey: 'product_image_url',
        thumbnailKey: 'product_thumb_image_url'
      }
    }
  },
  created() {
    this.init()
  },
  mounted() {
    console.log('edit', this.editForm)
  },
  methods: {
    init() {
      this.getClassify()
    },
    getClassify() {
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
    handleButtonChange() {
      if (this.is_edit) {
        if (this.noUpdate()) {
          const params = {
            'id': this.editForm.id,
            'name': this.editForm.product_name,
            'advt_status': this.advt_status,
            'product_id': this.editForm.product_info.data.istore_product_id, // id
            'images': this.editForm.product_info.data.images, // id
            'category_id': this.editForm.category_id,
            'description': this.editForm.product_info.data.description.description,
            'short_description': this.editForm.product_info.data.description.short_description,
            'short_name': this.editForm.product_info.data.description.short_name,
            'sub_advt': this.getSubAdvt(this.editForm.product_info.list),
            'brand': this.editForm.product_info.data.brand,
            'sku': this.editForm.product_info.data.sku
          }
          if (this.verify()) {
            // 保存
            const loading = this.$loading({
              lock: true,
              text: '努力加载中',
              background: 'rgba(0, 0, 0, 0.5)'
            })
            console.log('params',params)
            changeDetail(params).then(() => {
              fetchDetail({ advtId: this.$route.params.id, status: this.$route.params.status }).then(response => {
                this.editForm = response.data
                this.initData = this._.cloneDeep(this.editForm)
                // this._.forEach(this.editForm.product_info.list, v => {
                //   const images = v.images.map(item => item.product_image_url)
                //   v.images = images
                // })
                this.is_edit = false
                this.button_inner = '编辑'
              })
            }).finally(_ => {
              loading.close()
            })
          }
        }
      } else {
        // 编辑
        this.is_edit = true
        this.button_inner = '保存'
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
    verify() {
      // 规则验证
      const data = this.getSubAdvt(this.editForm.product_info.list)
      console.log('data',data)
      const integer = /^[0-9]\d*$/ // 库存
      const figure = /(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,3})?$)/ // 价格
      const eanReg = /^\d{13}$/ // ean验证==13位数字
      let inputLimit = ''
      // const shortNameCheck = data.every(item => item.short_name.length <= 30 && item.short_name.length > 0)
      const shortNameCheck = this.editForm.product_info.data.description.short_name.length <= 30 && this.editForm.product_info.data.description.short_name.length > 0
      // const discriptionCheck = this._.every(data, item => {
      //   return this.getLength(item.description, item.images) <= 5000 && this.getLength(item.description, item.images) > 0
      // })
      // const shortDiscriptionCheck = data.every(item => item.short_description.length <= 410 && item.short_description.length > 0)
      const discriptionCheck = this.getLength(this.editForm.product_info.data.description.description, this.editForm.product_info.data.images) <= 5000 && this.getLength(this.editForm.product_info.data.description.description, this.editForm.product_info.data.images) > 0
      const shortDiscriptionCheck = this.editForm.product_info.data.description.short_description.length <= 410 && this.editForm.product_info.data.description.short_description.length > 0
      // const nameCheck = data.every(item => item.name.length <= 132 && item.name.length > 0)
      const eanArr = this._.compact(data.map(item => item.ean))
      // if (!nameCheck) {
      //   inputLimit += '标题名称不能为空且不能超过132个字符'
      // }
      if(this.editForm.product_name.length === 0) {
        inputLimit = '广告名称不能为空'
      }
      if(this.editForm.category_id.length === 0) {
        inputLimit = '目录编号不能为空'
      }
      if (!shortDiscriptionCheck) {
        inputLimit += inputLimit ? ',短描述不能为空且不能超过410个字符' : '短描述不能为空且不能超过410个字符'
      }
      if (!discriptionCheck) {
        inputLimit += inputLimit ? ',描述不能为空且不能超过5000个字符' : '描述不能为空且不能超过5000个字符'
      }
      console.log('shortNameCheck',shortNameCheck,this.editForm.product_info.data.description.short_name)
      if (!shortNameCheck) {
        inputLimit += inputLimit ? ',短标题不能为空且不能超过30个字符' : '短标题不能为空且不能超过30个字符'
      }
      // item type 1 库存为空 2 库存错误 3 价格为空 4 价格错误
      // const verify = this._.filter(data, item => {
      //   if (!item.quantity) {
      //     item.type = 1
      //     return item
      //   } else if (!integer.test(item.quantity) && this.editStatus !== 120) {
      //     item.type = 2
      //     return item
      //   } else if (!item.price) {
      //     item.type = 3
      //     return item
      //   } else if (!figure.test(item.price)) {
      //     item.type = 4
      //     return item
      //   }
      // })
      // 目录分类验证
      // if (!this.category.length) {
      //   this.$message.warning('目录分类不能为空')
      //   return
      // }
      // // 目录编号验证
      // if (!this.editForm.category_id) {
      //   this.$message.warning('目录编号不能为空')
      //   return
      // }
      // 属性
      // if (verify.length) {
      //   if (verify[0].type === 1) {
      //     this.$message.warning('库存不能为空')
      //     return false
      //   } else if (verify[0].type === 2) {
      //     this.$message.warning('库存只能输入整数')
      //     return false
      //   } else if (verify[0].type === 3) {
      //     this.$message.warning('售价不能为空')
      //     return false
      //   } else if (verify[0].type === 4) {
      //     this.$message.warning('售价只能为数字格式，最多保留小数点后两位')
      //     return false
      //   }
      // }
      // 未通过字数限制验证
      if (inputLimit) {
        this.$message.warning(inputLimit)
        return false
      }
      // ean验证
      // if (!eanArr.every(item => eanReg.test(item))) {
      //   this.$message.warning('请输入正确格式的EAN')
      //   return
      // }
      // if (eanArr.length !== this._.uniq(eanArr).length) {
      //   this.$message.warning('出现重复EAN编码')
      //   return
      // }
      // 保本价判断
      // let price = false
      // const dataInfo = this.editForm.product_info.list
      // this._.forEach(dataInfo, item => {
      //   if (Number(item.base_price) - Number(item.discount_price) >= 0) {
      //     price = true
      //   }
      // })
      // if (price) {
      //   this.$message.warning('售价必须大于保本价，请重新输入')
      //   return false
      // }
      return true
    },
    // 没有发生任何更改
    noUpdate() {
      let isSame = false
      const detal = this.initData
      isSame = this._.isEqual(detal, this.editForm)
      if (isSame) {
        this.$confirm('广告没有发生任何更改,请重新编辑', '提示', {
          confirmButtonText: '重新编辑',
          cancelButtonText: '放弃修改',
          type: 'warning'
        }).then(() => {
          document.querySelector('.el-input__inner').focus()
        }).catch(() => {
          this.initData = this._.cloneDeep(this.editForm)
          this.editForm = this._.cloneDeep(this.editForm)
          this.button_inner = '编辑'
          this.is_edit = false
        })
      }
      return !isSame
    },
    handleItemChange(val) {
      this.editForm.category_id = val[val.length - 1]
    },
    getSubAdvt(subAdvt) {
      const setSubAdvt = []
      this._.forEach(subAdvt, (v, index) => {
        const obj = {}
        obj.product_id = v.istore_product_id
        obj.specific = this.getAttribute(v.props)
        obj.quantity = v.quantity
        obj.price = v.discount_price
        obj.ean = v.ean
        obj.short_description = v.description.short_description
        obj.description = v.description.description
        obj.name = v.product_name
        obj.images = v.images
        obj.advt_status = this.advt_status
        obj.short_name = v.description.short_name
        obj.sku = v.sku
        obj.brand = v.brand
        setSubAdvt.push(obj)
      })
      return setSubAdvt
    },
    // 组装属性值
    getAttribute(attr) {
      const attrBute = []
      this._.forEach(attr, v => {
        attrBute.push({ 'name': v.name, 'value': v.value })
      })
      return attrBute
    },
    // 图片添加
    addImg(index) {
      const imageList = this.editForm.product_info.list[index].images
      if (!this.increased[index].newImg) {
        this.$message.warning('请输入图片地址')
      } else if (this._.find(imageList, (item) => {
        return item.product_image_url === this.increased[index].newImg
      })) {
        this.$message.warning('图片已存在，不能重复添加')
      } else {
        imageList.unshift({ product_image_url: this.increased[index].newImg, product_thumb_image_url: this.increased[index].newImg })
        this.editForm.product_info.list[index].images = []
        this.$nextTick(() => {
          this.editForm.product_info.list[index].images = imageList
        })
      }
    },
    // 计算字符长度
    getLength(value, data) {
      let url
      let textLength = 0
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
    updateImagesMain(list) {
      this.editForm.product_info.data.images = list
    },
    updateImages(list, index) {
      this.editForm.product_info.list[index].images = list
    },
    format_images(index) {
      const arr = []
      this._.map(this.editForm.product_info.list[index].images, val => {
        this._.map(this.initData.product_info.list[index].images, item => {
          if (val === item.product_image_url) {
            arr.push({ product_image_url: val, image_id: item.image_id })
          }
        })
      })
      return arr
    }
  },
  watch: {
    data: {
      deep: true,
      immediate: true,
      handler(val) {
        if (val) {
          const data = this._.cloneDeep(this.data)
          const child = data.product_info.list
          this.increased = []
          this._.forEach(child, (v) => {
            this.increased.push({ newImg: '' })
          })
          // 区分详情页人口为编辑还是详情 路由传参edit 为 '0'/'1'详情/编辑 showEditButton 控制编辑按钮是否显示
          this.is_edit = Boolean(Number(this.$route.params.edit))
          if (this.is_edit) {
            this.button_inner = '编辑'
            this.is_edit = false
          }
          // 保存当前广告状态
          this.advt_status = this.$route.params.status
          this.advtId = this.$route.params.id
          this.initData = this._.cloneDeep(data)
          this.editStatus = this._.cloneDeep(this.data.status)
          this.editForm = this._.cloneDeep(data)
        }
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.product-collapse {
  .product-title {
    text-align: center !important;
    width: 100%;
  }
}

.noBg {
  background-color: #ffffff !important;
  padding: 0 !important;

  p {
    margin-block-start: 0;
    background-color: #ebeef5;
    text-indent: 5px;
    width: 100%;
    height: 32px;
  }
}

.el-form-item .el-form-item__content .no-back-ground {
  background: #fff;
}

.price-form .el-form-item .el-form-item__content > div {
  padding-left: 0 !important;
  /*background:#fff;*/
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
