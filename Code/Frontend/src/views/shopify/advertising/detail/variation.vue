<template>
  <div>
    <div class="header-box">
      <label class="title">Basic Information(variation)</label>
      <!--<el-row class="right-row">
        <el-button type="primary" size="mini" icon="el-icon-refresh" @click="">update</el-button>
      </el-row>-->
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
                <el-form-item label="Shopify account">
                  <p>{{ data.account_name }}</p>
                </el-form-item>
              </el-col>
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
                <el-form-item label="库存">
                  <p>{{ data.product_info.data.quantity }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="24">
                <el-form-item label="广告名称">
                  <p>{{ data.product_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="12">
                <el-form-item label="Shopify 分类">
                  <p>{{ data.category_name }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="总重(KG)">
                  <p>{{ data.product_info.data.total_weight }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="售价(RM)">
                  <p>{{ data.product_info.data.discount_price }}</p>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12">
                <el-form-item label="原价(RM)">
                  <p>{{ data.product_info.data.total_price }}</p>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="主图">
              <template>
                <picture-view v-if="data.product_info.data.image_path" :pictureList="data.product_info.data.image_path"></picture-view>
              </template>
            </el-form-item>
            <el-form-item label="描述">
              <div v-html="data.product_info.data.description" class="description"></div>
            </el-form-item>
          </el-form>
        </el-collapse-item>
        <el-collapse-item title="Commodity information" name="2">
          <el-form
            ref="form"
            :model="priceForm"
            label-width="220px"
            size="small"
            class="price-form"
          >
            <el-collapse v-model="activeNames2" class="product-collapse">
              <el-collapse-item :title="item.name" :name="index" v-for="(item, index) in data.product_info.list" :key="index">
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="istore 产品ID">
                      <p>{{ item.istore_product_id }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="售价(RM)">
                      <p>{{ item.discount_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="原价(RM)">
                      <p>{{ item.total_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="总重(KG)">
                      <p>{{ item.total_weight }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="库存">
                      <p>{{ item.quantity }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12" v-for="(v,k) in item.attrbutes" :key="k">
                    <el-form-item :label="v.key">
                      <p>{{ v.value }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="图片">
                  <template>
                    <picture-view v-if="item.image_path && activeNames2.includes(index)" :pictureList="item.image_path"></picture-view>
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
  </div>
</template>

<script>
  import PictureView from 'vue-simple-picture-preview'

  export default {
    components: {
      PictureView
    },
    props: {
      data: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        activeNames: ['1', '2'],
        activeNames2: ['1'],
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
        }
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .description {
    line-height: 18px !important;
    padding-top: 7px;
  }
</style>
