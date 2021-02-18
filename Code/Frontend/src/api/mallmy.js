import request from '@/utils/request'

/**
 * 获取select选项数据全部
 */
export function getSelectAll(keys) {
  return request({
    url: '/mallmy/advt/select/all',
    method: 'get',
    params: { keys }
  })
}

/**
 * 获取广告列表信息
 */
export function fetchList(query) {
  return request({
    url: '/mallmy/advt/advt/list',
    method: 'get',
    params: query
  })
}

/**
 * 获取广告详情
 */
export function fetchDetail(advtId) {
  return request({
    url: '/mallmy/advt/advt/info',
    method: 'get',
    params: { advtId }
  })
}

/**
 * 广告下架
 */
export function deletePlatformAdvt(data) {
  return request({
    url: '/mallmy/advt/delete-platform-advt/execute',
    method: 'post',
    data
  })
}

/**
 * 取消指定价
 */
export function unpricing(data) {
  return request({
    url: '/mallmy/advt/custom-price/cancel-custom-price',
    method: 'post',
    data
  })
}

/**
 * 修改毛利率与指定价
 */
export function updateCustomerPrice(data) {
  return request({
    url: '/mallmy/advt/custom-price/set-custom-price',
    method: 'post',
    data
  })
}

/**
 * 设置指定库存
 */
export function setTheInventory(data) {
  return request({
    url: '/mallmy/advt/custom-quantity/set-custom-quantity',
    method: 'post',
    data
  })
}

/**
 * 取消指定库存
 */
export function cancelTheInventory(data) {
  return request({
    url: '/mallmy/advt/custom-quantity/cancel-custom-quantity',
    method: 'post',
    data
  })
}

/**
 * 设置指定吊牌价
 */
export function updateMsrpPrice(data) {
  return request({
    url: '/mallmy/advt/custom-msrp-price/set-custom-msrp-price',
    method: 'post',
    data
  })
}

/**
 * 取消指定吊牌价
 */
export function cancelTheMsrp(data) {
  return request({
    url: '/mallmy/advt/custom-msrp-price/cancel-custom-msrp-price',
    method: 'post',
    data
  })
}

/**
 * 产品计划列表
 */
export function fetchPlanList(query) {
  return request({
    url: '/mallmy/platform/product-upload-plan/list',
    method: 'get',
    params: query
  })
}

/**
 * 添加产品计划
 */
export function addPlan(param) {
  return request({
    url: '/mallmy/platform/product-upload-plan/add',
    method: 'post',
    data: param
  })
}

/**
 * 产品计划详情
 */
export function fetchDetails(query) {
  return request({
    url: '/mallmy/platform/product-upload-plan/info',
    method: 'get',
    params: query
  })
}

/**
 * 设置产品更新列表
 */
export function productUpdateList(query) {
  return request({
    url: '/mallmy/product-filter/product-filter/product-filter-list',
    method: 'get',
    params: query
  })
}

/**
 * 添加、取消 指定不更新
 */
export function addProductUpdate(data) {
  return request({
    url: '/mallmy/product-filter/product-filter/product-filter-update',
    method: 'post',
    data
  })
}

/**
 * 批量设置取消不更新
 */
export function cancleProductNoUpdate(data) {
  return request({
    url: '/mallmy/product-filter/product-filter/cancel-filter',
    method: 'post',
    data
  })
}

/**
 * 批量设置取消不更新
 */
export function getChangeLog(query) {
  return request({
    url: '/mallmy/advt/advt/change-log',
    method: 'get',
    params: query
  })
}
