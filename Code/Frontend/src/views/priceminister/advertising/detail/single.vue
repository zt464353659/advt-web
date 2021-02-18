<template>
  <div>
    <div class="header-box" style="position: relative;">
      <label class="title">Basic Information(Normal)</label>
      <el-row class="right-row">
        <el-button v-permission="permissions.edits" v-if="!isEdit && editForm.status_name === 'Normal' || !isEdit && editForm.status === 140" class="editBtn" type="primary" size="mini"
                   @click="isEdit = true"
        >
          编辑
        </el-button>
        <el-button v-if="isEdit" type="primary" size="mini" @click="handleUpdate">
          保存
        </el-button>
        <el-button v-if="isEdit" size="mini" @click="handleCancelUpdate">
          取消编辑
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
                <el-form-item label="广告名称" prop="product_name">
                  <p v-if="!isEdit" style="word-break: break-all;">{{ editForm.product_name }}</p>
                  <el-input type="textarea" v-else size="mini" class="custom-edit-input" style="padding-left: 0" v-model="editForm.product_name"></el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="priceminister 分类">
                  <p>{{ editForm.category_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="总重(g)">
                  <p>{{ editForm.product_info.total_weight }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="库存">
                  <p>{{ editForm.product_info.quantity }}</p>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-collapse-item>
        <el-collapse-item title="Attrbutes" name="2">
          <el-form
            :label-width="labelWidth"
            size="small"
            class="information-form"
          >
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12" v-for="(attr, key) in editForm.product_info.attributes" :key="key">
                <el-form-item :label="attr.key">
                  <p>{{ attr.value }}</p>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-collapse-item>
        <el-collapse-item title="Price" name="3">
          <el-form
            label-width="220px"
            size="small"
            class="price-form"
          >
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="istore 产品ID">
                  <p>{{ editForm.product_info.istore_product_id }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="account_name">
                  <p>{{ editForm.account_name }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
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
            </el-row>
            <el-row>
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
                <el-form-item label="包装费(CNY)">
                  <p>{{ editForm.product_info.parcel_processing_fee }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="汇率">
                  <p>{{ editForm.product_info.currency_rate }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="`保本价(${editForm.product_info.currency_code})`">
                  <p>{{ editForm.product_info.base_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="`iStore价格(${editForm.product_info.currency_code})`">
                  <p>{{ editForm.product_info.discount_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item :label="`原价(${editForm.product_info.currency_code})`">
                  <p>{{ editForm.product_info.total_price }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="关键词">
                  <el-input
                    v-if="isEdit && editForm.status !== 140"
                    type="textarea"
                    style="width: 90%;padding-left: 0"
                    :autosize="{ minRows: 4, maxRows: 8}"
                    placeholder="请输入内容，一行填写一个关键词"
                    v-model="editForm.clone_key_word"
                  >
                  </el-input>

                  <p v-if="isEdit && editForm.status !== 140" class="tip-color">
                    <svg-icon icon-class="bug" />
                    一行填写一个关键词
                  </p>
                  <div v-else class="attribute_box">
                    <span class="attribute_item" v-for="(key_word, key) in editForm.key_word" :key="key">{{ key_word.replace(/\\/g, '') }}</span>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="图片">
              <el-input v-if="isEdit && editForm.status !== 140" :disabled="editForm.product_info.images.length >= 10" v-model="increased" style="margin: 12px 0 10px;">
                <el-button slot="append" :disabled="editForm.product_info.images.length >= 10" v-debounce @click="addImg">添加</el-button>
              </el-input>
              <template>
                <edit-image
                  v-if="isEdit && editForm.status !== 140"
                  :pictureList="editForm.product_info.images"
                  :is-edit="isEdit && editForm.status !== 140"
                  :pictures="editForm.product_info.istore_image"
                  :max-length="10"
                  :default-props="defaultProps"
                  :picture-key="'image_path'"
                  :thumb-url="'thumb_image_path'"
                  @emit-update-pictureList="updateImages"
                  ref="editImage"
                >
                </edit-image>
                <picture-view
                  ref="pictureview"
                  :pictureList="editForm.product_info.images"
                  :width="100"
                  :height="100"
                  v-else
                  :class="{ 'no-background': isEdit }"
                  :isEdit="isEdit && editForm.status !== 140"
                  :spaceBetween="6"
                  :thumbnailWidth="80"
                  :thumbnailHeight="80"
                  :defaultProps="defaultProps"
                >
                </picture-view>
              </template>
            </el-form-item>
            <el-form-item label="描述">
              <div v-if="!isEdit" v-html="editForm.product_info.description" class="description"></div>
              <tinymce v-else style="padding-left: 0" @set-content="setContent" class="no-back-ground" v-model="editForm.product_info.description" :height="400" />
              <ul class="discriptionImage" v-if="!isEdit">
                <li v-for="(pic,index) in editForm.product_info.images" :key="index">
                  <img :src="pic.image_path" alt="加载失败">
                </li>
              </ul>
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import PictureView from 'vue-simple-picture-preview'
import { editSave } from '@/api/priceminister'
import Tinymce from '@/components/Tinymce'
import editImage from '../components/editImage'
import advertStatic from '../common/static'

export default {
  components: { PictureView, Tinymce, editImage },
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      permissions: advertStatic.permissions,
      activeNames: ['1', '2', '3'],
      labelWidth: '220px',
      pictureList: [],
      defaultProps: {
        originalKey: 'image_path',
        thumbnailKey: 'thumb_image_path'
      },
      editForm: {},
      resetForm: {},
      isEdit: false,
      increased: ''
    }
  },
  methods: {
    htmlspecialchars(str) {
      str = str.replace(/&/g, '&amp;')
      str = str.replace(/</g, '&lt;')
      str = str.replace(/>/g, '&gt;')
      str = str.replace(/"/g, '&quot;')
      return str.length
    },
    handleUpdate() {
      if (!this.checkSubmit()) {
        return
      }
      if (this._.isEqual(this.editForm, this.resetForm)) {
        this.$confirm('该广告没有发生任何更改', '提示', {
          confirmButtonText: '放弃修改',
          cancelButtonText: '重新编辑',
          closeOnClickModal: false,
          closeOnPressEscape: false,
          type: 'warning'
        }).then(() => {
          this.isEdit = false
        }).catch(() => {
        })
      } else {
        let images = []
        this._.forEach(this.editForm.product_info.images, v => {
          images.push({ image_path: v.image_path, thumb_image_path: v.thumb_image_path })
        })
        const obj = {
          id: this.editForm.id,
          title: this.editForm.product_name.trim(),
          description: this.editForm.product_info.description.trim(),
          key_word: this.editForm.clone_key_word ? this._.compact(this.editForm.clone_key_word.split('\n').map(v => v.trim())) : [],
          images
        }
        editSave(obj).then(res => {
          this.$emit('emit-reload')
        })
      }
    },
    checkSubmit() {
      if (!this.editForm.product_name) {
        this.$message.error('标题不能为空')
        return false
      }
      if (!this.editForm.product_info.description) {
        this.$message.error('描述不能为空')
        return false
      }
      if (this.htmlspecialchars(this.editForm.product_name) > 200) {
        this.$message.error('标题最多可输入200个字符')
        return false
      }
      if (this.htmlspecialchars(this.editForm.product_info.description) > 4000) {
        this.$message.error('描述最多可输入4000个字符')
        return false
      }
      if (!this.editForm.product_info.images.length) {
        this.$message.error('至少选择1张图片')
        return false
      }
      return true
    },
    handleCancelUpdate() {
      this.isEdit = false
      this.editForm = this._.cloneDeep(this.resetForm)
    },
    setContent(content) {
      this.resetForm.product_info.description = content
      this.editForm.product_info.description = content
    },
    /**
     * @description: 接收子组件返回数据
     */
    updateImages(list) {
      this.editForm.product_info.images = list
    },
    addImg() {
      const imageList = this.editForm.product_info.images
      if (!this.increased) {
        this.$message.warning('请输入图片地址')
      } else if (this._.some(imageList, (item) => item.image_path === this.increased)) {
        this.$message.warning('图片已存在，不能重复添加')
      } else {
        this.editForm.product_info.images = []
        this.$nextTick(() => {
          this.$refs['editImage'].updateList({ image_path: this.increased, thumb_image_path: this.increased, is_add: true }, 'add')
          this.increased = ''
        })
      }
    }
  },
  watch: {
    data: {
      deep: true,
      immediate: true,
      handler(val) {
        this.isEdit = false
        this.editForm = this._.cloneDeep(this.data)
        this.resetForm = this._.cloneDeep(this.data)
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
::v-deep .tip-color {
  color: #E6A23C;
  line-height: 30px;
  font-size: 14px;
  background-color: transparent !important;
}

.el-form-item {
  ::v-deep.el-form-item__error {
    background-color: transparent !important;
  }
}

.attribute_box {
  .attribute_item {
    display: inline-block;
    width: 25%;
  }
}

@media (max-width: 1620px) {
  .attribute_box {
    .attribute_item {
      display: inline-block;
      width: 33.3%;
    }
  }
}

@media (max-width: 1250px) {
  .attribute_box {
    .attribute_item {
      display: inline-block;
      width: 50%;
    }
  }
}

@media (max-width: 990px) {
  .attribute_box {
    .attribute_item {
      display: inline-block;
      width: 100%;
    }
  }
}
</style>
<style rel="stylesheet/scss" lang="scss">
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

@media (max-width: 1110px) {
  .discriptionImage > li > img {
    width: 95%;
  }
}
</style>
