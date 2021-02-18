<template>
  <el-tabs v-model="activeName" type="card">
    <el-tab-pane label="Basic Information" name="first">
      <div>
        <div class="header-box">
          <label class="title">Basic Information(variation)</label>
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
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item label="广告名称">
                      <p>{{ detailData.name }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="广告ID">
                      <p>{{ detailData.advt_id }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="广告类型">
                      <p>{{ detailData.type_name }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="总重量(kg)">
                      <p>{{ detailData.total_weight }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="Account Name">
                      <p>{{ detailData.account_name }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="Status">
                      <p>{{ detailData.status_name }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="Category">
                      <p>{{ detailData.category_name }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="Category ID">
                      <p>{{ detailData.category_id }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="包装尺寸(长*宽*高 cm)">
                      <p>{{ `${detailData.length} * ${detailData.width} * ${detailData.height}` }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <!--<el-form-item label="主图">-->
                <!--<template>-->
                <!--<div style="padding-right:50px;">-->
                <!--<picture-view-->
                <!--v-if="detailData.images.length > 0"-->
                <!--:pictureList="detailData.images"-->
                <!--:width="100"-->
                <!--:height="100"-->
                <!--:spaceBetween="6"-->
                <!--:defaultProps="defaultProps"-->
                <!--:thumbnailWidth="80"-->
                <!--:thumbnailHeight="80"-->
                <!--&gt;</picture-view>-->
                <!--</div>-->
                <!--</template>-->
                <!--</el-form-item>-->
                <!--<el-form-item label="短描述">-->
                <!--<div v-html="detailData.short_description"></div>-->
                <!--</el-form-item>-->
                <!--<el-form-item label="描述">-->
                <!--<div v-html="detailData.description" class="description"></div>-->
                <!--</el-form-item>-->
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
                <el-row v-for="(item, index) in priceForm.specifics" :key="index">
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="'Specifics Name' + (index + 1)">
                      <p></p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-collapse v-model="activeNames2" class="product-collapse">
                  <el-collapse-item :title="String(item.istore_product_id)" :name="index" v-for="(item, index) in detailData.product_info" :key="index">
                    <el-row>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item label="istore Product ID">
                          <p>{{ item.istore_product_id }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item label="库存">
                          <p>{{ item.quantity }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item label="运输方式">
                          <p>{{ item.shipping_method }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <!--<el-form-item :label="`运费(${item.currency_code})`">-->
                        <el-form-item :label="`运费(CNY)`">
                          <p>{{ item.shipping_costs }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item :label="`保本价(${item.currency_code})`">
                          <p>{{ item.base_price }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item :label="`售价(${item.currency_code})`">
                          <p>{{ item.discount_price }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item :label="`原价(${item.currency_code})`">
                          <p>{{ item.discount_price }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item label="毛利率(%)">
                          <p>{{ item.gross_margin }}</p>
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
                        <el-form-item label="平台佣金率(%)">
                          <p>{{ item.commission }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="24" :lg="24">
                        <el-form-item label="属性">
                          <el-row class="attr-row">
                            <el-col :xs="12" :sm="12" :md="12" :lg="12" style="border:none;">
                              <div class="grid-content bg-purple bg-border">属性名</div>
                            </el-col>
                            <el-col :xs="12" :sm="12" :md="12" :lg="12">
                              <div class="grid-content bg-purple">属性值</div>
                            </el-col>
                          </el-row>
                          <template v-if="item.attributes && item.attributes.length > 0">
                            <el-row class="attr-row" v-for="(it, ind) in item.attributes" :key="ind">
                              <el-col :xs="12" :sm="12" :md="12" :lg="12">
                                <div class="grid-content bg-purple bg-border">{{ it.istore_attribute_name }}</div>
                              </el-col>
                              <el-col :xs="12" :sm="12" :md="12" :lg="12">
                                <div class="grid-content bg-purple">{{ it.istore_attribute_value }}</div>
                              </el-col>
                            </el-row>
                          </template>
                          <p v-else style="text-align: center;">无</p>
                        </el-form-item>
                        <el-form-item label="图片">
                          <template>
                            <div style="padding-right:50px;">
                              <picture-view
                                v-if="item.images.length > 0 && activeNames2.includes(index)"
                                :pictureList="item.images"
                                :width="100"
                                :height="100"
                                :spaceBetween="6"
                                :defaultProps="defaultProps"
                                :thumbnailWidth="80"
                                :thumbnailHeight="80"
                              ></picture-view>
                            </div>
                          </template>
                        </el-form-item>
                        <el-form-item label="短描述">
                          <div v-html="item.short_description" class="description"></div>
                        </el-form-item>
                        <el-form-item label="描述">
                          <div v-html="item.description" class="description"></div>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </el-collapse-item>
                </el-collapse>
              </el-form>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="日志">
      <istore-logs :advtId="advt_id"></istore-logs>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
  import istoreLogs from './component/istoreLogs'

  export default {
    name: 'VariationDetails',
    components: { istoreLogs },
    props: {
      detailData: {
        type: Object,
        required: true,
        default: () => {
        }
      }
    },
    data() {
      return {
        not_show_spu: [100, 110, 140],
        advt_id: this.$route.params.id,
        activeName: 'first',
        activeNames: ['1', '2'],
        activeNames2: ['1'],
        labelWidth: '220px',
        pictureList: (() => {
          return this.detailData.images.map(V => {
            return V
          })
        })(),
        defaultProps: {
          originalKey: 'image_path',
          thumbnailKey: 'product_image_thumb'
        },
        priceForm: {
          smallAmount: 'N',
          shippingTableData: [
            {
              elevenStreetShippingPolicy: '暂无数据',
              adShippingFee: '暂无数据'
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
    },
    mounted() {
      this.setImageWidth()
    },
    methods: {
      setImageWidth() {
        const imgArr = (document.querySelectorAll('.description>img'))
        imgArr.forEach(item => {
          item.setAttribute('width', '50%')
        })
      }
    }
  }
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .attr-row {
    div {
      text-align: center;
      &.bg-border {
        border-right: 1px solid #fff;
      }
    }
  }

  .attr-row.el-row {
    border-bottom: 1px solid #fff;
    &:last-child {
      border: none;
    }
  }
</style>
