<template>
  <el-tabs v-model="activeName" type="card">
    <el-tab-pane name="first" label="Basic Information">
      <div>
        <div class="header-box">
          <label class="title">Basic Information(variation)</label>
        </div>
        <!--内容区-->
        <div class="content-box" style="padding-top: 0">
          <el-collapse v-model="activeNames">
            <el-collapse-item title="Listing Information" name="1">
              <el-form :label-width="labelWidth" size="small" class="information-form">
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="MallMy account">
                      <p>{{ detailData.account_name }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="广告ID">
                      <p>{{ detailData.id }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="Status">
                      <p>{{ detailData.status_name }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="库存">
                      <p>{{ detailData.product_info.data.quantity }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item label="广告名称">
                      <p>{{ detailData.product_name }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item label="Tags">
                      <p>{{ detailData.product_info.data.tags }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="总重(KG)">
                      <p>{{ detailData.product_info.data.total_weight }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="'售价(' + detailData.product_info.data.currency_code + ')'">
                      <p>{{ detailData.product_info.data.discount_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="'原价(' + detailData.product_info.data.currency_code + ')'">
                      <p>{{ detailData.product_info.data.total_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="平台佣金(%)">
                      <p>{{ detailData.product_info.data.commission }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="毛利率(%)">
                      <p>{{ detailData.product_info.data.gross_margin }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="'包装费(' + detailData.product_info.data.currency_code + ')'">
                      <p>{{ detailData.product_info.data.parcel_processing_fee }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="汇率">
                      <p>{{ detailData.product_info.data.currency_rate }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="主图">
                  <template>
                    <div style="padding-right: 50px;">
                      <picture-view
                        v-if="detailData.product_info.data.first_name"
                        :pictureList="detailData.product_info.data.first_name"
                        :defaultProps="defaultProps"
                        :width="100"
                        :height="100"
                        :thumbnailWidth="80"
                        :thumbnailHeight="80"
                        :spaceBetween="6"
                      >
                      </picture-view>
                    </div>
                  </template>
                </el-form-item>
                <el-form-item label="描述">
                  <div v-html="detailData.product_info.data.first_description" class="description"></div>
                </el-form-item>
              </el-form>
            </el-collapse-item>
            <el-collapse-item title="Price" name="2">
              <el-form ref="form" :model="priceForm" label-width="220px" size="small" class="price-form">
                <el-form-item label="Shipping">
                  <el-table :data="priceForm.shippingTableData" border size="mini" style="width: 100%" class="table-gray">
                    <el-table-column prop="mallMyShippingPolicy" label="MallMy Shipping Policy"></el-table-column>
                    <el-table-column prop="adShippingFee" label="Ad Shipping Fee"></el-table-column>
                  </el-table>
                </el-form-item>
                <el-collapse v-model="activeNames2" class="product-collapse">
                  <el-collapse-item :title="item.name" :name="index" v-for="(item, index) in detailData.product_info.list" :key="index">
                    <el-row>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item label="istore 产品ID">
                          <p>{{ item.istore_product_id }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item :label="'售价(' + detailData.product_info.data.currency_code + ')'">
                          <p>{{ item.discount_price }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item :label="'原价(' + detailData.product_info.data.currency_code + ')'">
                          <p>{{ item.total_price }}</p>
                        </el-form-item>
                      </el-col>
                      <el-col :xs="24" :sm="24" :md="12" :lg="12">
                        <el-form-item :label="'运费(' + detailData.product_info.data.currency_code + ')'">
                          <p>{{ item.shipping_costs }}</p>
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
                      <el-col :xs="24" :sm="24" :md="12" :lg="12" v-for="(v, k) in item.attrbutes" :key="k">
                        <el-form-item :label="v.key">
                          <p>{{ v.value }}</p>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-form-item label="图片">
                      <template>
                        <div style="padding-right: 50px;">
                          <picture-view
                            v-if="item.images && activeNames2.includes(index)"
                            :pictureList="item.images"
                            :defaultProps="defaultProps"
                            :width="100"
                            :height="100"
                            :thumbnailWidth="50"
                            :thumbnailHeight="20"
                            :spaceBetween="10"
                          >
                          </picture-view>
                        </div>
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
    </el-tab-pane>
    <el-tab-pane name="second" label="日志">
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
        default: () => {}
      }
    },
    data() {
      return {
        advt_id: this.$route.params.id,
        activeName: 'first',
        activeNames: ['1', '2'],
        activeNames2: [],
        labelWidth: '220px',
        pictureList: [],
        priceForm: {
          smallAmount: 'N',
          shippingTableData: [
            {
              mallMyShippingPolicy: '测试数据',
              adShippingFee: '测试数据'
            }
          ]
        },
        defaultProps: {
          originalKey: 'image_path',
          thumbnailKey: 'product_image_thumb'
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
