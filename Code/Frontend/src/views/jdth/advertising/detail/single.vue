<template>
  <el-tabs v-model="activeName" type="card">
    <el-tab-pane label="Basic Information" name="first">
      <div>
        <div class="header-box">
          <label class="title">Basic Information(Normal)</label>
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
                  <!--
                  1）Listing Information：account_name、广告ID、status、广告名称、产品分类、属性、库存、总重量。

                  2）price：istore 产品ID、平台佣金（%）、售价、毛利率（%）、包装费（RMB）、汇率、原价、图片、短描述、长描述。
-->
                  <!-- 广告ID、状态、广告名称、重量（kg）、库存、Site Code。-->
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
              </el-form>
            </el-collapse-item>
            <el-collapse-item title="Commodity information" name="2">
              <el-form
                label-width="220px"
                size="small"
                class="price-form"
              >
                <!-- istore 产品ID、运费（USD）、售价（USD）、原价（USD）、毛利率（%）、平台佣金率（%）、分类目录、分类目录ID、属性、包装尺寸（长cm、宽cm、高cm）、图片、描述 -->
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="istore Product ID">
                      <p>{{ detailData.istore_product_id }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="运输方式">
                      <p>{{ detailData.shipping_method }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <!--<el-form-item :label="`运费(${detailData.currency_code})`">-->
                    <el-form-item :label="`运费(CNY)`">
                      <p>{{ detailData.shipping_costs }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="`保本价(${detailData.currency_code})`">
                      <p>{{ detailData.base_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="`售价(${detailData.currency_code})`">
                      <p>{{ detailData.discount_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="`原价(${detailData.currency_code})`">
                      <p>{{ detailData.discount_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="毛利率(%)">
                      <p>{{ detailData.gross_margin }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="打包费(CNY)">
                      <p>{{ detailData.parcel_processing_fee }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="汇率">
                      <p>{{ detailData.currency_rate }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="平台佣金率(%)">
                      <p>{{ detailData.commission }}</p>
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
                      <template v-if="detailData.attributes && detailData.attributes.length > 0">
                        <el-row class="attr-row" v-for="(it, ind) in detailData.attributes" :key="ind">
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
                  </el-col>
                </el-row>
                <el-form-item label="图片">
                  <template>
                    <div style="padding-right:50px;">
                      <picture-view
                        v-if="detailData.images.length > 0 && checkPickShow"
                        :pictureList="detailData.images"
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
                <el-form-item label="短描述">
                  <div v-html="detailData.short_description" class="description"></div>
                </el-form-item>
                <el-form-item label="描述">
                  <div v-html="detailData.description" class="description"></div>
                </el-form-item>
              </el-form>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="日志" name="second">
      <istore-logs :advtId="advt_id"></istore-logs>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
  import istoreLogs from './component/istoreLogs'

  export default {
    name: 'SingleDetails',
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
        activeNames: ['1', '2'],
        activeName: 'first',
        labelWidth: '220px',
        pictureList: [],
        button_inner: '编辑',
        is_edit: false,
        product_name: '',
        checkPickShow: true,
        defaultProps: {
          originalKey: 'image_path',
          thumbnailKey: 'product_image_thumb'
        }
      }
    },
    created() {
      this.product_name = this.detailData.title
      this.checkPickShow = false
      this.$nextTick(() => {
        this.checkPickShow = true
      })
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

  @media (max-width: 1058px) {
    .discriptionImage > li > img {
      width: 100%;
    }
  }

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
