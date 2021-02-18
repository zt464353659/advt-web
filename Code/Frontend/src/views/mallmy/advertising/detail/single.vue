<template>
  <el-tabs v-model="activeName" type="card">
    <el-tab-pane name="first" label="Basic Infomation">
      <div>
        <div class="header-box">
          <label class="title">Basic Information(Normal)</label>
        </div>
        <!--内容区-->
        <div class="content-box" style="padding-top: 0">
          <el-collapse v-model="activeNames">
            <el-collapse-item title="Listing Information" name="1">
              <el-form :label-width="labelWidth" size="small" class="information-form">
                <el-row>
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
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item label="广告名称">
                      <p>{{ detailData.product_name }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item label="Tags">
                      <p>{{ detailData.product_info.tags }}</p>
                    </el-form-item>
                  </el-col>
                  <!--<el-col :xs="24" :sm="24" :md="24" :lg="24">
                    <el-form-item label="MallMy 分类">
                      <p>{{ detailData.category_name }}</p>
                    </el-form-item>
                  </el-col>-->
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="总重(KG)">
                      <p>{{ detailData.product_info.total_weight }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="库存">
                      <p>{{ detailData.product_info.quantity }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-collapse-item>
            <el-collapse-item title="Price" name="2">
              <el-form label-width="220px" size="small" class="price-form">
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="istore 产品ID">
                      <p>{{ detailData.product_info.istore_product_id }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="account_name">
                      <p>{{ detailData.account_name }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="平台佣金(%)">
                      <p>{{ detailData.product_info.commission }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="毛利率(%)">
                      <p>{{ detailData.product_info.gross_margin }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="'包装费(' + detailData.product_info.currency_code + ')'">
                      <p>{{ detailData.product_info.parcel_processing_fee }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item label="汇率">
                      <p>{{ detailData.product_info.currency_rate }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="'售价(' + detailData.product_info.currency_code + ')'">
                      <p>{{ detailData.product_info.discount_price }}</p>
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :sm="24" :md="12" :lg="12">
                    <el-form-item :label="'原价(' + detailData.product_info.currency_code + ')'">
                      <p>{{ detailData.product_info.total_price }}</p>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="图片">
                  <template>
                    <div style="padding-right: 50px;">
                      <picture-view
                        v-if="pictureList"
                        :pictureList="detailData.product_info.images"
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
                <!--<el-form-item label="短描述">
                  <div>{{ detailData.short_description }}</div>
                </el-form-item>-->
                <el-form-item label="描述">
                  <div v-html="detailData.product_info.description" class="description"></div>
                </el-form-item>
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
    name: 'SingleDetails',
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
        labelWidth: '220px',
        pictureList: [],
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
