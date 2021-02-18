import request from '@/utils/request'
const platform='/blibli-new'

/**
 * 获取select选项数据全部
 */
export function getSelectAll(keys) {
  return request({
    url: `${platform}/advt/select/all`,
    method: 'get',
    params: { keys }
  })
}

/**
 * 获取广告列表信息
 */
export function fetchList(params) {
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
export function getPlanDetail(params) {
  return request({
    url: `${platform}/advt/product-upload-plan/info`,
    method: 'get',
    params
  })
}

/**
 * 获取产品计划列表
 */
export function getPlan(query) {
  return request({
    url: `${platform}/advt/product-upload-plan/list`,
    method: 'get',
    params: query
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

/**
 * 修改毛利率与指定价，取消指定价
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
 * 设置/取消 指定库存
 */
export function setCustomStock(data) {
  return request({
    url: `${platform}/advt/custom-information/custom-stock`,
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
 * 获取分类目录
 */
export function getCategoryList() {
  return request({
    url: `${platform}/advt/components/categories`,
    method: 'get'
  })
}

/**
 * 获取分类目录
 */
export function getAttributes(category_id) {
  return request({
    url: `${platform}/advt/components/attributes?category_id=${category_id}`,
    method: 'get'
  })
}

/**
 * 获取分类目录
 */
export function getIstorePictures(advt_id) {
  return request({
    url: `${platform}/advt/components/image-picker?advt_id=${advt_id}`,
    method: 'get'
  })
}

/**
 * 编辑
 */
export function saveDetailEdit(data) {
  return request({
    url: `${platform}/advt/alters/edit-all`,
    method: 'post',
    data
  })
}

/**
 * 获取istore更新日志
 */
export function getIstoreLogs(params) {
  return request({
    url: `${platform}/advt/logs/change-log`,
    method: 'get',
    params
  })
}

