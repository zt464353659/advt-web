import request from '@/utils/request'
const platform = '/allegro-new'

/**
 * format 导入接口
 */
export function importFormatData(data) {
  return request({
    url: `${platform}/advt/import-advt-title/import-adv-info`,
    method: 'post',
    data
  })
}

/**
 * Long title 和 Long description 导入接口
 */
export function importExcelData(data) {
  return request({
    url: `${platform}/advt/import-advt-title/import`,
    method: 'post',
    data
  })
}

/**
 * 获取select选项数据全部
 */
export function apiGetSelectAll(keys) {
  return request({
    url: `${platform}/advt/select/all`,
    method: 'get',
    params: { keys }
  })
}

/**
 * 获取广告列表信息
 */
export function apiFetchList(params) {
  return request({
    url: `${platform}/advt/advt/list`,
    method: 'get',
    params
  })
}

/**
 * 获取广告详情
 */
export function fetchDetail(params) {
  return request({
    url: `${platform}/advt/advt/info`,
    method: 'get',
    params
  })
}

/**
 * 产品计划详情
 */
export function getPlanDetail(query) {
  return request({
    url: `${platform}/advt/product-upload-plan/info`,
    method: 'get',
    params: query
  })
}

/**
 * 广告详情页编辑获取分类树
 */
export function getCategories(parent_id) {
  return request({
    url: `${platform}/advt/select/get-category?parent_id=${parent_id}`,
    methods: 'get'
  })
}

/**
 * 广告详情页编辑获取图片
 */
export function getPictures(advt_id) {
  return request({
    url: `${platform}/advt/select/images-picker`,
    methods: 'get',
    params: { advt_id }
  })
}

/**
 * 获取分类属性组
 */
export function getAttributes(category_id) {
  return request({
    url: `${platform}/advt/select/get-category-attribute?category_id=${category_id}`,
    method: 'get'
  })
}

/**
 * 获取产品计划列表
 */
export function apiGetPlanList(params) {
  return request({
    url: `${platform}/advt/product-upload-plan/list`,
    method: 'get',
    params
  })
}

/**
 * 添加产品计划
 */
export function addProductPlan(data) {
  return request({
    url: `${platform}/advt/product-upload-plan/add`,
    method: 'post',
    data
  })
}

/* 添加产品计划根据用户角色获取可操作的站点 */
export function addPlanAccount() {
  return request({
    url: `${platform}/advt/select/authorized-accounts`,
    method: 'get'
  })
}

/* 获取istore描述更新日志 */
export function getIstore(params) {
  return request({
    url: `${platform}/advt/logs/notices`,
    method: 'get',
    params
  })
}

/* 审核istore描述更新日志 */
export function notice(data) {
  return request({
    url: `${platform}/advt/logs/close-notice`,
    method: 'post',
    data
  })
}

/* 属性配置列表 */
export function apiGetAttributeList(params) {
  return request({
    url: `${platform}/advt/default-attribute/list`,
    method: 'get',
    params
  })
}

/* 导入配置 */
export function apiImportAttribute(params) {
  return request({
    url: `${platform}/advt/default-attribute/import`,
    method: 'get',
    params
  })
}

/* 导出配置 */
export function apiExportAttribute(params) {
  return request({
    url: `${platform}/advt/default-attribute/export`,
    method: 'get',
    params
  })
}

/* 导出配置 */
export function apiEditAttribute(data) {
  return request({
    url: `${platform}/advt/default-attribute/edit`,
    method: 'post',
    data
  })
}

/* end */
export function apiEndAdvt(data) {
  return request({
    url: `${platform}/advt/mgr-advt/end`,
    method: 'post',
    data
  })
}
/* relist */
export function PostRelist(data) {
  return request({
    url: `${platform}/advt/advt/relisting`,
    method: 'post',
    data
  })
}

/**
 * 导出价格测算
 */
export function fetchExportPriceCalculation(data) {
  return request({
    url: `${platform}/advt/exports/export-by-spu`,
    method: 'post',
    data
  })
}

/**
 * 修改指定价
 */
export function updateCustomerPrice(data) {
  return request({
    url: `${platform}/advt/custom-information/custom-price`,
    method: 'post',
    data
  })
}

/**
 * 取消指定价
 */
export function cancelCustomerPrice(data) {
  return request({
    url: `${platform}/advt/custom-information/cancel-custom-price`,
    method: 'post',
    data
  })
}

/**
 * 指定毛利率
 */
export function setCustomGrossMargin(data) {
  return request({
    url: `${platform}/advt/custom-information/custom-gross-margin`,
    method: 'post',
    data
  })
}

/**
 * 取消指定毛利率
 */
export function cancelCustomGrossMargin(data) {
  return request({
    url: `${platform}/advt/custom-information/cancel-custom-gross-margin`,
    method: 'post',
    data
  })
}

/**
 * 设置指定库存
 */
export function setCustomStock(data) {
  return request({
    url: `${platform}/advt/custom-information/custom-stock`,
    method: 'post',
    data
  })
}

/**
 * 编辑详情
 */
export function saveDetailEdit(data) {
  return request({
    url: `${platform}/advt/advt/edit-advt`,
    method: 'post',
    data
  })
}
/* 获取istore更新日志 */
export function getIstoreLogs(params) {
  return request({
    url: `${platform}/advt/logs/change-log`,
    method: 'get',
    params
  })
}

/**
 *产品推广管理列表
 */
export function getAdvtPromotionPlanList(params) {
  return request({
    url: `${platform}/advt/advt-promotion-plan/list`,
    method: 'get',
    params
  })
}

/**
 *产品推广管理添加促销计划
 */
export function setAdvtPromotionPlanAdd(data) {
  return request({
    url: `${platform}/advt/advt-promotion-plan/add`,
    method: 'post',
    data
  })
}

/**
 *产品推广管理促销计划详情
 */
export function getAdvtPromotionPlanInfo(params) {
  return request({
    url: `${platform}/advt/advt-promotion-plan/info`,
    method: 'get',
    params
  })
}

/**
 *排名推广列表
 */
export function getAdvtPrPlanlist(params) {
  return request({
    url: `${platform}/advt/advt-promotion/list`,
    method: 'get',
    params
  })
}
