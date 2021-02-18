<template>
  <div>
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="Basic Information" name="first">
        <div>
          <div class="header-box">
            <label class="title">Basic Information(variation)</label>
            <el-row class="right-row">
              <el-button v-permission="permissions.edit" v-show="!isEdit && canEdit" type="primary" size="mini" @click="toggleEdit(true)">编辑</el-button>
              <el-button v-show="isEdit" type="success" size="mini" @click="saveEdit">保存</el-button>
              <el-button v-show="isEdit" type="secondary" size="mini" @click="toggleEdit(false)">取消保存</el-button>
              <el-button v-debounce type="primary" size="mini" @click="openLog">日志</el-button>
            </el-row>
          </div>
          <!--内容区-->
          <div class="content-box detail-form" style="padding-top: 0">
            <el-collapse v-model="activeNames">
              <el-collapse-item title="错误信息" v-if="cloneData.error_log_message && canEdit" name="0">
                <div class="error-tip" v-if="cloneData.error_log_message && canEdit">
                  错误信息: {{ cloneData.error_log_message }}
                </div>
              </el-collapse-item>
              <el-collapse-item title="Listing Information" name="1">
                <el-form
                  :label-width="labelWidth"
                  size="small"
                  class="information-form"
                  :model="cloneData.product_info.data.description"
                >
                  <el-row>
                    <el-col :xs="24" :sm="24" :md="24" :lg="24">
                      <el-form-item label="英文标题" prop="title">
                        <div class="no-back-ground" v-if="canEditEnglishTitle && isEdit">
                          <el-input size="mini" clearable v-model="cloneData.product_info.data.description.title"></el-input>
                          <div class="tip pt-2"><i class="el-icon-info"></i>请输入英语标题</div>
                        </div>
                        <p v-else>{{ cloneData.product_info.data.description.title.replace(/\s/g, '&nbsp;') }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="24" :lg="24">
                      <el-form-item label="小语种标题" class="is-required-attr">
                        <div class="no-back-ground" v-if="canEditOtherTitle && isEdit">
                          <el-input size="mini" clearable v-model="cloneData.product_info.data.description.small_language_title"></el-input>
                          <div class="tip pt-2"><i class="el-icon-info"></i>请输入小语种标题</div>
                        </div>
                        <p v-else>{{ cloneData.product_info.data.description.small_language_title.replace(/\s/g, '&nbsp;') }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                      <el-form-item label="Site Code">
                        <p>{{ cloneData.account_name }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                      <el-form-item label="广告ID">
                        <p>{{ cloneData.advt_id }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="12" :lg="12">
                      <el-form-item label="Status">
                        <p>{{ cloneData.status_name }}</p>
                      </el-form-item>
                    </el-col>
                    <!--                    <el-col :xs="24" :sm="24" :md="12" :lg="12">-->
                    <!--                      <el-form-item label="库存">-->
                    <!--                        <p>{{ cloneData.product_info.data.quantity }}</p>-->
                    <!--                      </el-form-item>-->
                    <!--                    </el-col>-->
                    <!--                    <el-col :xs="24" :sm="24" :md="12" :lg="12">-->
                    <!--                      <el-form-item label="总重(KG)">-->
                    <!--                        <p>{{ cloneData.product_info.data.total_weight }}</p>-->
                    <!--                      </el-form-item>-->
                    <!--                    </el-col>-->
                    <el-col :xs="24" :sm="24" :md="24" :lg="24">
                      <el-form-item label="目录">
                        <p>{{ `${ cloneData.category_name } [${ cloneData.category_id }]` }}</p>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="24" :lg="24" v-if="canEditEnglishTitle && isEdit">
                      <el-form-item label="选择新目录">
                        <div class="no-back-ground">
                          <el-cascader
                            placeholder="请选择目录"
                            :props="categoryProps"
                            :options="categoryList"
                            :filterable="true"
                            style="width:100%"
                            v-model="category"
                            @change="categoryChange"
                          ></el-cascader>
                        </div>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="24" :lg="24" v-if="showAttr && cloneData.product_info.data.main_attribute && cloneData.product_info.data.main_attribute.length">
                      <el-form-item label="公共属性">
                        <el-form-item label-width="280px" v-for="(spec,specInd) in cloneData.product_info.data.main_attribute" :label="spec.key" :key="specInd" :class="spec.required ? 'is-required-attr': ''">
                          <!--          可输入可选择类型              -->
                          <div v-if="spec.value_type === 'string' && spec.choice_value.length" style="display: inline-block">
                            <el-select
                              :disabled="!isEdit || !canEdit"
                              size="mini"
                              clearable
                              v-model="spec.key_value"
                              @change="attributeSelectChange($event,spec)"
                              style="width:300px;"
                            >
                              <el-option v-for="(option,optInd) in spec.choice_value" :label="option.name" :value="option.name" :key="optInd"></el-option>
                            </el-select>
                            <el-input
                              :disabled="!isEdit || !canEdit"
                              v-if="['string','number','number_unit'].includes(spec.value_type)"
                              size="mini"
                              v-model="spec.unit_value"
                              @change="attributeInputChange($event,spec)"
                              style="width:300px;"
                              clearable
                            ></el-input>
                          </div>
                          <!--                        仅可选择类型-->
                          <div v-if="['list','boolean'].includes(spec.value_type)" style="display: inline-block">
                            <el-select
                              :disabled="!isEdit || !canEdit"
                              size="mini"
                              clearable
                              v-model="spec.key_value"
                              style="width:300px;"
                            >
                              <el-option v-for="(option,optInd) in spec.choice_value" :label="option.name" :value="option.name" :key="optInd"></el-option>
                            </el-select>
                          </div>
                          <!--                        仅可输入类型-->
                          <div v-if="(spec.value_type === 'string' && !spec.choice_value.length) || spec.value_type === 'number'" style="display: inline-block">
                            <el-input
                              :disabled="!isEdit || !canEdit"
                              size="mini"
                              v-model="spec.unit_value"
                              style="width:300px;"
                              clearable
                            ></el-input>
                          </div>
                          <!--                        带单位数值类型-->
                          <div v-if="spec.value_type === 'number_unit'" style="display: inline-block">
                            <el-input
                              :disabled="!isEdit || !canEdit"
                              v-if="['string','number','number_unit'].includes(spec.value_type)"
                              size="mini"
                              v-model="spec.unit_value"
                              style="width:300px;"
                              clearable
                            ></el-input>
                            <el-select
                              :disabled="!isEdit || !canEdit"
                              v-if="spec.value_type === 'number_unit'"
                              size="mini"
                              clearable
                              v-model="spec.key_value"
                              style="width:300px;"
                            >
                              <el-option v-for="(option,optInd) in spec.choice_value" :label="option.name" :value="option.name" :key="optInd"></el-option>
                            </el-select>
                          </div>
                          <span class="tip attr-tip" v-if="isEdit">
                            <span v-if="spec.value_type === 'string' && spec.choice_value && spec.choice_value.length">
                              <i class="el-icon-info"></i>
                              支持选择或自定义输入，自定义输入值优先。输入值类型为任意字符串
                            </span>
                            <span v-if="['number','number_unit'].includes(spec.value_type)">
                              <i class="el-icon-info"></i>
                              支持输入正整数，有单位选项时必须选择单位
                            </span>
                            <!--                            <span v-if="spec.value_type === 'string' && !spec.choice_value.length">支持输入任意字符串</span>-->
                            <!--                            <span v-if="spec.value_type === 'list' || spec.value_type === 'boolean'">仅支持选择</span>-->
                          </span>
                        </el-form-item>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-form-item label="英文描述" class="is-required-attr">
                    <div class="no-back-ground">
                      <el-input
                        :class="(isEdit && canEditEnglishTitle) ? '' : 'hidden-input-style'"
                        :readonly="!isEdit || !canEditEnglishTitle"
                        type="textarea"
                        :autosize="{ minRows: 8, maxRows: 100 }"
                        v-model="cloneData.product_info.data.description.description"
                        class="description"
                      ></el-input>
                      <div class="tip pt-5"><i class="el-icon-info"></i>请输入英语描述</div>
                    </div>
                  </el-form-item>
                  <el-form-item label="小语种描述" class="is-required-attr">
                    <div class="no-back-ground">
                      <el-input
                        :class="(isEdit && canEditOtherTitle) ? '' : 'hidden-input-style'"
                        :readonly="!isEdit || !canEditOtherTitle"
                        type="textarea"
                        :autosize="{ minRows: 8, maxRows: 100 }"
                        v-model="cloneData.product_info.data.description.small_language_description"
                        class="description"
                      ></el-input>
                      <div class="tip pt-5"><i class="el-icon-info"></i>请输入小语种描述</div>
                    </div>
                  </el-form-item>
                </el-form>
              </el-collapse-item>
              <el-collapse-item title="Commodity information" name="2">
                <el-collapse v-model="activeNames2" class="product-collapse">
                  <el-collapse-item
                    :title="`${item.istore_product_id} ${item.description.title? `[${item.description.title}]` : ''}`"
                    :name="index"
                    v-for="(item, index) in cloneData.product_info.list" :key="index"
                  >
                    <el-form
                      label-width="220px"
                      size="small"
                      class="price-form"
                      :model="item"
                      :ref="'priceForm' + index"
                      :rules="priceRules"
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
                      </el-row>
                      <el-row>
                        <el-col :xs="24" :sm="24" :md="12" :lg="12">
                          <el-form-item label="原价(USD)">
                            <p>{{ item.total_price }}</p>
                          </el-form-item>
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="12" :lg="12">
                          <el-form-item label="平台佣金(%)">
                            <p>{{ item.commission }}</p>
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
                          <el-form-item label="运费">
                            <p>{{ item.shipping_costs }}</p>
                          </el-form-item>
                        </el-col>
                      </el-row>
                      <el-row>
                        <el-col :xs="24" :sm="24" :md="12" :lg="12">
                          <el-form-item label="包装费(CNY)">
                            <p>{{ item.parcel_processing_fee }}</p>
                          </el-form-item>
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="12" :lg="12">
                          <el-form-item label="汇率">
                            <p>{{ item.currency_rate }}</p>
                          </el-form-item>
                        </el-col>
                      </el-row>
                      <el-row>
                        <el-col :xs="24" :sm="24" :md="12" :lg="12">
                          <el-form-item label="库存">
                            <p>{{ item.quantity }}</p>
                          </el-form-item>
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="12" :lg="12">
                          <el-form-item label="当前价格类型">
                            <p>{{ price_type[item.price_type] }}</p>
                          </el-form-item>
                        </el-col>
                      </el-row>
                      <el-row>
                        <el-col :xs="24" :sm="24" :md="12" :lg="12">
                          <el-form-item label="iStore价格(USD)">
                            <p>{{ item.discount_price }}</p>
                          </el-form-item>
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="12" :lg="12">
                          <el-form-item label="当前售价(USD)" prop="current_price">
                            <el-input
                              v-if="canEdit && canEditPrice && isEdit"
                              size="mini"
                              clearable
                              v-model="item.current_price"
                            ></el-input>
                            <p v-else>{{ item.current_price }}</p>
                          </el-form-item>
                        </el-col>
                      </el-row>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item label="iStore毛利率(%)">
                          <p>{{ item.gross_margin }}</p>
                        </el-form-item>
                      </el-col>
                      <el-row>
                        <el-col :xs="24" :sm="24" :md="12" :lg="12">
                          <el-form-item label="当前毛利率(%)" prop="current_gross_margin">
                            <el-input v-if="canEdit && canEditPrice && isEdit" size="mini" clearable v-model="item.current_gross_margin"></el-input>
                            <p v-else>{{ item.current_gross_margin }}</p>
                          </el-form-item>
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="24" :lg="24" v-if="showAttr && item.specifics && item.specifics.length">
                          <el-form-item label="区分项">
                            <el-form-item label-width="280px" v-for="(spec,specInd) in item.specifics" :label="spec.key" :key="specInd" :class="spec.required ? 'is-required-attr': ''">
                              <!--          可输入可选择类型              -->
                              <div v-if="spec.value_type === 'string' && spec.choice_value.length" style="display: inline-block">
                                <el-select
                                  :disabled="!isEdit || !canEdit || (isEdit && item.advt_status === 190)"
                                  size="mini"
                                  clearable
                                  v-model="spec.key_value"
                                  @change="attributeSelectChange($event,spec)"
                                  style="width:300px;"
                                >
                                  <el-option v-for="(option,optInd) in spec.choice_value" :label="option.name" :value="option.name" :key="optInd"></el-option>
                                </el-select>
                                <el-input
                                  :disabled="!isEdit || !canEdit || (isEdit && item.advt_status === 190)"
                                  v-if="['string','number','number_unit'].includes(spec.value_type)"
                                  size="mini"
                                  v-model="spec.unit_value"
                                  @change="attributeInputChange($event,spec)"
                                  style="width:300px;"
                                  clearable
                                ></el-input>
                              </div>
                              <!--                        仅可选择类型-->
                              <div v-if="['list','boolean'].includes(spec.value_type)" style="display: inline-block">
                                <el-select
                                  :disabled="!isEdit || !canEdit || (isEdit && item.advt_status === 190)"
                                  size="mini"
                                  clearable
                                  v-model="spec.key_value"
                                  style="width:300px;"
                                >
                                  <el-option v-for="(option,optInd) in spec.choice_value" :label="option.name" :value="option.name" :key="optInd"></el-option>
                                </el-select>
                              </div>
                              <!--                        仅可输入类型-->
                              <div v-if="(spec.value_type === 'string' && !spec.choice_value.length) || spec.value_type === 'number'" style="display: inline-block">
                                <el-input
                                  :disabled="!isEdit || !canEdit || (isEdit && item.advt_status === 190)"
                                  size="mini"
                                  v-model="spec.unit_value"
                                  style="width:300px;"
                                  clearable
                                ></el-input>
                              </div>
                              <!--                        带单位数值类型-->
                              <div v-if="spec.value_type === 'number_unit'" style="display: inline-block">
                                <el-input
                                  :disabled="!isEdit || !canEdit || (isEdit && item.advt_status === 190)"
                                  v-if="['string','number','number_unit'].includes(spec.value_type)"
                                  size="mini"
                                  v-model="spec.unit_value"
                                  style="width:300px;"
                                  clearable
                                ></el-input>
                                <el-select
                                  :disabled="!isEdit || !canEdit || (isEdit && item.advt_status === 190)"
                                  v-if="spec.value_type === 'number_unit'"
                                  size="mini"
                                  clearable
                                  v-model="spec.key_value"
                                  style="width:300px;"
                                >
                                  <el-option v-for="(option,optInd) in spec.choice_value" :label="option.name" :value="option.name" :key="optInd"></el-option>
                                </el-select>
                              </div>
                              <span class="tip attr-tip" v-if="isEdit && item.advt_status !==190">
                                <span v-if="spec.value_type === 'string' && spec.choice_value && spec.choice_value.length">
                                  <i class="el-icon-info"></i>
                                  支持选择或自定义输入，自定义输入值优先。输入值类型为任意字符串
                                </span>
                                <span v-if="['number','number_unit'].includes(spec.value_type)">
                                  <i class="el-icon-info"></i>
                                  支持输入正整数，有单位选项时必须选择单位
                                </span>
                              </span>
                            </el-form-item>
                          </el-form-item>
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="24" :lg="24" v-if="showAttr && item.vary_attribute && item.vary_attribute.length">
                          <el-form-item label="属性">
                            <el-form-item label-width="280px" v-for="(attr,attrInd) in item.vary_attribute" :label="attr.key" :key="attrInd" :class="attr.required ? 'is-required-attr': ''">
                              <!--          可输入可选择类型              -->
                              <div v-if="attr.value_type === 'string' && attr.choice_value.length" style="display: inline-block">
                                <el-select
                                  :disabled="!isEdit || !canEdit || (isEdit && item.advt_status === 190)"
                                  size="mini"
                                  clearable
                                  v-model="attr.key_value"
                                  @change="attributeSelectChange($event,attr)"
                                  style="width:300px;"
                                >
                                  <el-option v-for="(option,optInd) in attr.choice_value" :label="option.name" :value="option.name" :key="optInd"></el-option>
                                </el-select>
                                <el-input
                                  :disabled="!isEdit || !canEdit || (isEdit && item.advt_status === 190)"
                                  v-if="['string','number','number_unit'].includes(attr.value_type)"
                                  size="mini"
                                  v-model="attr.unit_value"
                                  @change="attributeInputChange($event,attr)"
                                  style="width:300px;"
                                  clearable
                                ></el-input>
                              </div>
                              <!--                        仅可选择类型-->
                              <div v-if="['list','boolean'].includes(attr.value_type)" style="display: inline-block">
                                <el-select
                                  :disabled="!isEdit || !canEdit || (isEdit && item.advt_status === 190)"
                                  size="mini"
                                  clearable
                                  v-model="attr.key_value"
                                  style="width:300px;"
                                >
                                  <el-option v-for="(option,optInd) in attr.choice_value" :label="option.name" :value="option.name" :key="optInd"></el-option>
                                </el-select>
                              </div>
                              <!--                        仅可输入类型-->
                              <div v-if="(attr.value_type === 'string' && !attr.choice_value.length) || attr.value_type === 'number'" style="display: inline-block">
                                <el-input
                                  :disabled="!isEdit || !canEdit || (isEdit && item.advt_status === 190)"
                                  size="mini"
                                  v-model="attr.unit_value"
                                  style="width:300px;"
                                  clearable
                                ></el-input>
                              </div>
                              <!--                        带单位数值类型-->
                              <div v-if="attr.value_type === 'number_unit'" style="display: inline-block">
                                <el-input
                                  :disabled="!isEdit || !canEdit || (isEdit && item.advt_status === 190)"
                                  v-if="['string','number','number_unit'].includes(attr.value_type)"
                                  size="mini"
                                  v-model="attr.unit_value"
                                  style="width:300px;"
                                  clearable
                                ></el-input>
                                <el-select
                                  :disabled="!isEdit || !canEdit || (isEdit && item.advt_status === 190)"
                                  v-if="attr.value_type === 'number_unit'"
                                  size="mini"
                                  clearable
                                  v-model="attr.key_value"
                                  style="width:300px;"
                                >
                                  <el-option v-for="(option,optInd) in attr.choice_value" :label="option.name" :value="option.name" :key="optInd"></el-option>
                                </el-select>
                              </div>
                              <span class="tip attr-tip" v-if="isEdit && item.advt_status !==190">
                                <span v-if="attr.value_type === 'string' && attr.choice_value && attr.choice_value.length">
                                  <i class="el-icon-info"></i>
                                  支持选择或自定义输入，自定义输入值优先。输入值类型为任意字符串
                                </span>
                                <span v-if="['number','number_unit'].includes(attr.value_type)">
                                  <i class="el-icon-info"></i>
                                  支持输入正整数，有单位选项时必须选择单位
                                </span>
                              </span>
                            </el-form-item>
                          </el-form-item>
                        </el-col>
                      </el-row>
                      <el-form-item label="图片">
                        <template>
                          <edit-image
                            v-if="item.images && isEdit && activeNames2.includes(index) && item.advt_status !==190"
                            :pictureList="item.images"
                            :is-edit="isEdit && canEdit"
                            :pictures="istorePictures.filter(v => v.istore_product_id === item.istore_product_id)[0].content"
                            :max-length="10"
                            :default-props="defaultProps"
                            :picture-key="'image_path'"
                            :thumb-url="'thumb_image_path'"
                            :is-vari-child="index"
                            @emit-update-pictureList="updateDesImages"
                          ></edit-image>
                          <p v-if="isEdit && canEdit && item.advt_status !== 190" class="no-back-ground tip pt-5"><i class="el-icon-info"></i>第一张为主图，最多上传10张</p>
                          <div v-if="(item.advt_status === 190 || !isEdit)" style="padding-right:50px">
                            <picture-view
                              v-if="(item.advt_status === 190 || !isEdit) && activeNames2.includes(index)"
                              :pictureList="item.images"
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
                      <!--                      <el-form-item label="英文描述" class="is-required-attr">-->
                      <!--                        <el-input-->
                      <!--                          :class="'hidden-input-style'"-->
                      <!--                          :readonly="true" type="textarea"-->
                      <!--                          :autosize="{ minRows: 1, maxRows: 100 }"-->
                      <!--                          v-model="item.description.description"-->
                      <!--                          class="description"-->
                      <!--                        ></el-input>-->
                      <!--                        <div class="tip" v-if="isEdit && canEdit">请输入英语</div>-->
                      <!--                      </el-form-item>-->
                      <!--                      <el-form-item label="小语种描述">-->
                      <!--                        <el-input-->
                      <!--                          :class="'hidden-input-style'"-->
                      <!--                          :readonly="true" type="textarea"-->
                      <!--                          :autosize="{ minRows: 1, maxRows: 100 }"-->
                      <!--                          v-model="item.description.small_language_description"-->
                      <!--                          class="description"-->
                      <!--                        ></el-input>-->
                      <!--                      </el-form-item>-->
                    </el-form>
                  </el-collapse-item>
                </el-collapse>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <istore-log v-bind.sync="logOptions"></istore-log>
  </div>
</template>

<script>
import istoreLog from '../components/istoreLog'
import editImage from './component/editImage'
import { fetchDetail, getEditData, editDetail } from '@/api/mercadolibre.gs'

export default {
  name: 'VariationDetails',
  components: { istoreLog, editImage },
  props: {
    detailData: {
      type: Object,
      required: true,
      default: () => {
      }
    }
  },
  data() {
    const checkName = (rule, value, callback) => {
      if (!value.trim()) {
        callback(new Error('标题不能为空'))
        return
      }
      if (value.trim().length > 140) {
        callback(new Error('标题最多输入140字符'))
        return
      }
      callback()
    }
    const checkShortDescription = (rule, value, callback) => {
      if (!value.trim()) {
        callback(new Error('短描述不能为空'))
        return
      }
      if (value.trim().length > 500) {
        callback(new Error('短描述最多输入500字符'))
        return
      }
      callback()
    }
    const checkPrice = (rule, value, callback) => {
      if (!String(value).trim()) {
        callback(new Error('指定价不能为空'))
        return
      }
      if (!/^\d+(\.\d*)?$/.test(value)) {
        callback(new Error('请输入正确格式的指定价'))
        return
      }
      callback()
    }
    const checkGross = (rule, value, callback) => {
      if (!String(value).trim()) {
        callback(new Error('毛利率不能为空'))
        return
      }
      if (!/^[1-9]\d?$|^100$/.test(value) || Number(value) === 0) {
        callback(new Error('毛利率只能输入1-100之间的正整数'))
        return
      }
      callback()
    }
    return {
      permissions: {
        edit: 'mercadolibre.advt.advt.edit'
      },
      price_type: {
        10: 'iStore价格',
        20: '动态调整价',
        30: '指定价',
        40: '指定毛利率',
        50: '跟卖价'
      },
      showAttr: true,
      category: [],
      categoryProps: {
        value: 'category_id',
        label: 'name',
        children: '_child'
      },
      categoryList: [],
      priceRules: {
        current_price: [{ required: true, validator: checkPrice, trigger: ['blur', 'change'] }],
        current_gross_margin: [{ required: true, validator: checkGross, trigger: ['blur', 'change'] }]
      },
      cloneData: {},
      istorePictures: [],
      canEdit: false,
      canEditOtherTitle: false,
      canEditEnglishTitle: false,
      canEditPrice: false,
      isEdit: false,
      logOptions: {
        open: false,
        advtId: ''
      },
      activeName: 'first',
      advt_id: this.$route.params.id,
      activeNames: ['0', '1', '2'],
      activeNames2: [0],
      labelWidth: '220px',
      pictureList: [],
      priceForm: {
        smallAmount: 'N',
        shippingTableData: [
          {
            elevenStreetShippingPolicy: '测试数据',
            adShippingFee: '测试数据'
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
      defaultProps: {
        originalKey: 'image_path',
        thumbnailKey: 'thumb_image_path'
      }
    }
  },
  created() {
    // 是否是可编辑状态 Active ==130、Paused=140、Upload Error==150、Publish Error == 160 状态产品详情页新增编辑功能
    // active paused uploadError publishError 可编辑图片、属性、区分项字段
    // active paused 状态下可编辑小语种标题、小语种描述、
    // uploadError publishError 状态下可编辑 目录、英语标题、英语描述
    // publishError 状态下可编辑 价格、毛利率
    this.canEdit = [130, 140, 150, 160].includes(Number(this.detailData.status))
    this.canEditOtherTitle = [130, 140].includes(Number(this.detailData.status))
    this.canEditEnglishTitle = [150, 160].includes(Number(this.detailData.status))
    this.canEditPrice = Number(this.detailData.status) === 160
    // 格式化单位属性显示
    this.detailData.product_info.list.forEach(v => {
      v.vary_attribute = this.formatAttr(v.vary_attribute)
      v.specifics = this.formatAttr(v.specifics)
    })
    this.detailData.product_info.data.main_attribute = this.formatAttr(this.detailData.product_info.data.main_attribute)
    this.cloneData = this._.cloneDeep(this.detailData)
    sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
  },
  methods: {
    attributeInputChange(val, attr) {
      let select_value = ''
      if (val) {
        attr.choice_value.map(v => {
          if (v.name.toLowerCase() === val.trim().toLowerCase()) {
            select_value = v.name
          }
        })
        attr.key_value = select_value
      }
    },
    attributeSelectChange(val, attr) {
      if (val) {
        attr.unit_value = val
      }
    },
    categoryChange() {
      if (this.category.length) {
        const loading = this.$loading({
          lock: true,
          text: '努力加载中',
          background: 'rgba(0, 0, 0, 0.5)'
        })
        const params = {
          advt_id: this.detailData.advt_id,
          account_id: this.detailData.account_id,
          istore_product_id: this.detailData.product_info.data.istore_product_id,
          product_id: this.detailData.product_id,
          category_id: this.category[this.category.length - 1],
          type: ['attribute']
        }
        getEditData(params).then(res => {
          // 是否为可以创建vari的目录
          loading.close()
          if (res.data.attribute.category_type.includes('variation')) {
            const attr = this.formatAttr(res.data.attribute.vary_attribute)
            const spec = this.formatAttr(res.data.attribute.specifics)
            this._.forEach(this.cloneData.product_info.list, v => {
              v.vary_attribute = this._.cloneDeep(attr)
              v.specifics = this._.cloneDeep(spec)
            })
            this.cloneData.product_info.data.main_attribute = this.formatAttr(res.data.attribute.main_attribute)
            this.showAttr = false
            this.$nextTick(() => {
              this.showAttr = true
            })
          } else {
            this.$message.warning('该目录无法创建variation类型广告，请重新选择')
            this.category = []
          }
        }).catch(e => {
          this.$message.error(e)
        })
      }
    },
    formatAttr(arr) {
      // number_unit格式处理
      if (arr.length) {
        return arr.map(v => {
          let obj = JSON.parse(JSON.stringify(v))
          if (v.value_type === 'number_unit' && v.key_value) {
            obj.key_value = obj.key_value.split(' ')[1]
            obj.unit_value = v.key_value.split(' ')[0]
          } else if (v.value_type === 'string' && v.choice_value && v.choice_value.length && v.key_value) {
            obj.key_value = ''
            v.choice_value.map(v1 => {
              if (v1.name.toLowerCase() === v.key_value.toLowerCase()) {
                obj.key_value = v.key_value
              }
            })
            obj.unit_value = v.key_value
          } else {
            obj.unit_value = v.key_value ? v.key_value : ''
          }
          return obj
        })
      }
      return []
    },
    refreshDetail() {
      const loading = this.$loading({
        lock: true,
        text: '努力加载中',
        background: 'rgba(0, 0, 0, 0.5)'
      })
      fetchDetail(this.$route.params.id).then(response => {
        const data = res.data
        this.canEdit = [130, 140, 150, 160].includes(Number(data.status))
        this.canEditOtherTitle = [130, 140].includes(Number(data.status))
        this.canEditEnglishTitle = [150, 160].includes(Number(data.status))
        this.canEditPrice = Number(data.status) === 160
        // 格式化单位属性显示
        data.product_info.list.forEach(v => {
          v.vary_attribute = this.formatAttr(v.vary_attribute)
          v.specifics = this.formatAttr(v.specifics)
        })
        data.product_info.data.main_attribute = this._.formatAttr(data.product_info.data.main_attribute)
        this.cloneData = this._.cloneDeep(data)
        sessionStorage.setItem('copyData', JSON.stringify(this.cloneData))
        setTimeout(() => {
          loading.close()
        }, 800)
      }).catch(() => {
        loading.close()
      })
    },
    // 子产品图片更新
    updateDesImages(list, index) {
      if (list) {
        if (index !== undefined) {
          this.cloneData.product_info.list[index].images = list
        }
      }
    },
    // 图片更新
    updateImages(list) {
      this.cloneData.product_info.images = list
    },
    saveEdit() {
      // 保存编辑数据
      // 产品数据是否发生改变
      // 分类目录是否改变
      const categoryChange = () => {
        if (!this.category.length) {
          return false
        } else {
          if (this.category[this.category.length - 1] === this.cloneData.category_id) {
            return false
          }
          return true
        }
      }
      if (this._.isEqual(JSON.stringify(this.cloneData), sessionStorage.getItem('copyData')) && !categoryChange()) {
        this.$message.warning('该广告数据未发生改变！')
      } else {
        const checkOther = new Promise((resolve, reject) => {
          if ((!this.cloneData.product_info.data.description.title.trim().length || this.cloneData.product_info.data.description.title.trim().length > 60) && this.canEditEnglishTitle) {
            reject('英文标题不能为空且最多输入60字符')
          }
          if (!this.cloneData.product_info.data.description.description.trim().length && this.canEditEnglishTitle) {
            reject('英文描述不能为空')
          }
          if ((!this.cloneData.product_info.data.description.small_language_title.trim().length || this.cloneData.product_info.data.description.small_language_title.trim().length > 60) && this.canEditOtherTitle) {
            reject('小语种标题不能为空且最多输入60字符')
          }
          if (!this.cloneData.product_info.data.description.small_language_description.trim().length && this.canEditOtherTitle) {
            reject('小语种描述不能为空')
          }
          this._.forEach(this.cloneData.product_info.list, v => {
            if (v.advt_status !== 190) {
              if (!v.images.length) {
                reject('子产品图片不能为空')
              }
            }
          })
          resolve()
        })

        // 校验属性、区分项
        const checkAttr = new Promise((resolve, reject) => {
          // 区分项必填校验
          this._.forEach(this.cloneData.product_info.list, v => {
            if (v.advt_status !== 190) {
              // 是否无输入、选择区分项
              let allKeysEmpty = true
              this._.forEach(v.specifics, v1 => {
                if (v1.unit_value.trim() || v1.key_value.trim()) {
                  allKeysEmpty = false
                }
              })
              if (allKeysEmpty) {
                reject('Variation类型子产品必须至少有一个区分项')
              }
              this._.forEach(v.specifics, v1 => {
                // 必填验证
                if (v1.required && (!v1.key_value.trim() && !v1.unit_value.trim())) {
                  reject('必填属性不能为空')
                }
                if (['number', 'number_unit'].includes(v1.value_type) && v1.unit_value && !(/^[1-9]\d*$/.test(v1.unit_value))) {
                  reject('数值类型只支持输入正整数')
                }
                if (['number_unit'].includes(v1.value_type) && (!v1.key_value) && (v1.unit_value || v1.key_value)) {
                  reject('数值类型有单位必须选择单位')
                }
              })
            }
          })
          // 属性必填校验
          this._.forEach(this.cloneData.product_info.list, v => {
            if (v.advt_status !== 190) {
              this._.forEach(v.vary_attribute, v1 => {
                // 必填验证
                if (v1.required && (!v1.key_value.trim() && !v1.unit_value.trim())) {
                  reject('必填属性不能为空')
                }
                if (['number', 'number_unit'].includes(v1.value_type) && v1.unit_value && !(/^[1-9]\d*$/.test(v1.unit_value))) {
                  reject('数值类型只支持输入正整数')
                }
                if (['number_unit'].includes(v1.value_type) && !v1.key_value && (v1.unit_value || v1.key_value)) {
                  reject('数值类型有单位必须选择单位')
                }
              })
            }
          })
          this._.forEach(this.cloneData.product_info.data.main_attribute, v1 => {
            // 必填验证
            if (v1.required && (!v1.key_value.trim() && !v1.unit_value.trim())) {
              reject('必填属性不能为空')
            }
            if (['number', 'number_unit'].includes(v1.value_type) && v1.unit_value && !(/^[1-9]\d*$/.test(v1.unit_value))) {
              reject('数值类型只支持输入正整数')
            }
            if (['number_unit'].includes(v1.value_type) && !v1.key_value && (v1.unit_value || v1.key_value)) {
              reject('数值类型有单位必须选择单位')
            }
          })
          // 子产品是否有重复区分项
          const specArr = this.cloneData.product_info.list.map(v => v.specifics)
          let have = false
          for (let i = 0; i < specArr.length; i++) {
            for (let j = specArr.length - 1; j > i; j--) {
              if (this._.isEqual(specArr[i], specArr[j])) {
                have = true
                break
              }
            }
          }
          if (have) {
            reject('子产品区分项不能重复')
          }
          resolve()
        })
        // detailData.product_info.list
        // 子产品信息验证
        const validatePriceArr = []
        this._.forEach(this.cloneData.product_info.list, (v, index) => {
          if (v.advt_status !== 190 && this.canEditPrice) {
            validatePriceArr.push(this.$refs['priceForm' + index][0].validate())
          }
        })
        const validateSize = new Promise((resolve, reject) => {
          Promise.all([...validatePriceArr]).then(() => {
            resolve()
          }).catch(() => {
            reject('请检查子产品信息!')
          })
        })
        Promise.all([checkOther, validateSize, checkAttr]).then(res => {
          const loading = this.$loading({
            lock: true,
            text: '保存中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.5)'
          })
          editDetail(this.formatEditData()).then(() => {
            loading.close()
            this.isEdit = false
            this.refreshDetail()
          }).catch(err => {
            loading.close()
          })
        }).catch(err => {
          this.$message.warning(err)
        })
      }
    },
    formatEditData() {
      const that = this

      function formatAllImages() {
        const arr = []
        that._.forEach(that.cloneData.product_info.list, v => {
          // 非下架状态数据
          if (v.advt_status !== 190) {
            arr.push({
              istore_product_id: v.istore_product_id,
              content: v.images.map(v1 => {
                return {
                  image_path: v1.image_path,
                  thumb_image_path: v1.thumb_image_path ? v1.thumb_image_path : v1.image_path
                }
              })
            })
          }
        })
        return arr
      }

      function formatPrice() {
        const arr = []
        const oldData = JSON.parse(sessionStorage.getItem('copyData'))
        that.cloneData.product_info.list.forEach((v, k) => {
          if (v.advt_status !== 190) {
            if (v.current_price !== oldData.product_info.list[k].current_price || v.current_gross_margin !== oldData.product_info.list[k].current_gross_margin) {
              arr.push({
                istore_product_id: v.istore_product_id,
                content: {
                  custom_price: v.current_price,
                  custom_gross_margin: v.current_gross_margin
                }
              })
            }
          }
        })
        return arr
      }

      function formatSpecs() {
        const arr = []
        // 公共属性
        const obj = {
          istore_product_id: that.cloneData.product_info.data.istore_product_id,
          content: {}
        }
        that.cloneData.product_info.data.main_attribute.forEach(v => {
          if (v.key_value || v.unit_value) {
            if (v.value_type === 'number_unit') {
              obj.content[v.key] = `${ v.unit_value.trim() } ${ v.key_value }`
            } else if (v.value_type === 'string' && v.choice_value.length) {
              obj.content[v.key] = v.unit_value.trim() ? v.unit_value : v.key_value.trim()
            } else if (v.value_type === 'list' || v.value_type === 'boolean') {
              obj.content[v.key] = v.key_value ? v.key_value.trim() : ''
            } else {
              obj.content[v.key] = v.unit_value ? v.unit_value.trim() : ''
            }
          }
        })
        arr.push(obj)
        // 子产品属性值
        that._.forEach(that.cloneData.product_info.list, v => {
          if (v.advt_status !== 190) {
            const obj = {
              istore_product_id: v.istore_product_id,
              content: {}
            }
            v.specifics.forEach(v1 => {
              if (v1.key_value || v1.unit_value) {
                if (v1.value_type === 'number_unit') {
                  obj.content[v1.key] = `${ v1.unit_value.trim() } ${ v1.key_value }`
                } else if (v1.value_type === 'string' && v1.choice_value.length) {
                  obj.content[v1.key] = v1.unit_value ? v1.unit_value.trim() : v1.key_value.trim()
                } else if (v1.value_type === 'list' || v1.value_type === 'boolean') {
                  obj.content[v1.key] = v1.key_value ? v1.key_value.trim() : ''
                } else {
                  obj.content[v1.key] = v1.unit_value ? v1.unit_value.trim() : ''
                }
              }
            })
            v.vary_attribute.forEach(v1 => {
              if (v1.key_value || v1.unit_value) {
                if (v1.value_type === 'number_unit') {
                  obj.content[v1.key] = `${ v1.unit_value.trim() } ${ v1.key_value }`
                } else if (v1.value_type === 'string' && v1.choice_value.length) {
                  obj.content[v1.key] = v1.unit_value ? v1.unit_value.trim() : v1.key_value.trim()
                } else if (v1.value_type === 'list' || v1.value_type === 'boolean') {
                  obj.content[v1.key] = v1.key_value ? v1.key_value.trim() : ''
                } else {
                  obj.content[v1.key] = v1.unit_value ? v1.unit_value.trim() : ''
                }
              }
            })
            arr.push(obj)
          }
        })
        return arr
      }

      const istore_product_id = this.cloneData.product_info.data.istore_product_id
      const obj = {
        advt_id: this.cloneData.advt_id,
        account_id: this.cloneData.account_id,
        data: {
          title: [
            {
              istore_product_id,
              content: {
                en: this.cloneData.product_info.data.description.title.trim(),
                small: this.cloneData.product_info.data.description.small_language_title.trim()
              }
            }
          ],
          description: [
            {
              istore_product_id: istore_product_id,
              content: {
                en: this.cloneData.product_info.data.description.description.trim(),
                small: this.cloneData.product_info.data.description.small_language_description.trim()
              }
            }
          ],
          images: formatAllImages(),
          category: [
            {
              istore_product_id,
              content: this.category.length ? this.category[this.category.length - 1] : this.cloneData.product_info.data.category_id
            }
          ],
          specifics: formatSpecs()
        }
      }
      if (this.canEditPrice) {
        obj.data.price = formatPrice()
      }
      return obj

    },
    // 切换编辑状态
    toggleEdit(val) {
      if (!val) {
        // 清除表单验证
        this._.forEach(this.cloneData.product_info.list, (v, index) => {
          this.$refs['priceForm' + index][0].clearValidate()
        })
        this.cloneData = JSON.parse(sessionStorage.getItem('copyData'))
        this.isEdit = false
      } else {
        // 拉取编辑数据
        this.getEdit()
      }
    },
    getEdit() {
      const loading = this.$loading({
        lock: true,
        text: '努力加载中',
        background: 'rgba(0, 0, 0, 0.5)'
      })
      const params = {
        advt_id: this.detailData.advt_id,
        account_id: this.detailData.account_id,
        istore_product_id: this.detailData.product_info.data.istore_product_id,
        product_id: this.detailData.product_id,
        type: ['images', 'category']
      }
      getEditData(params).then(res => {
        loading.close()
        this.isEdit = true
        this.categoryList = res.data.category
        this.istorePictures = res.data.images
      }).catch(e => {
        loading.close()
        this.$message.error(e)
      })
    },
    openLog() {
      this.logOptions = {
        open: true,
        advtId: this.$route.params.id
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.error-tip {
  color: #F56C6C;
  margin-bottom: 5px;
}

.attr-more-click {
  cursor: pointer;
  font-size: 12px;
  color: #409EFF;
  padding: 5px;
  text-align: center;
}
</style>
<style rel="stylesheet/scss" lang="scss">
.detail-form .hidden-input-style {
  textarea {
    border: 0 !important;
    background: #ebeef5 !important;
  }
}

.detail-form {
  .is-required-attr {
    .el-form-item__label:before {
      content: "*";
      color: #F56C6C;
      margin-right: 4px;
    }
  }
}

.detail-form .tip {
  background: #fff !important;
  font-size: 12px;
  color: #909399;
  min-height: 12px !important;
  line-height: 12px;
}

.detail-form .el-form-item__error {
  background: #fff !important;
}

.detail-form .information-form .el-form-item .el-form-item__content .no-back-ground {
  background: #fff !important;
}

.detail-form .pt-5 {
  padding-top: 5px;
}

.detail-form .pt-2 {
  padding-top: 2px;
}

.detail-form .el-select--mini {
  padding: 0 !important;
}

.detail-form .attr-tip {
  color: #cf9236;
  background: #EBEEF5 !important;
}

.detail-form .el-input.is-disabled .el-input__inner {
  color: #444 !important;
}
</style>
