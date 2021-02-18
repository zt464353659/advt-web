import request from '@/utils/request'
const platform='/real-new'
/**
 *  搜索框中产品线
 */
export function getSelectAll(keys) {
  return request({
    url: `${platform}/advt/select/search-condition`,
    method: 'get'
  })
}

/**
 * 获取广告列表信息
 */
export function fetchList(query) {
  return request({
    url: `${platform}/advt/advt/list`,
    method: 'get',
    params: query
  })
}

/**
 * 获取广告详情
 */
export function fetchDetail(id) {
  return request({
    url: `${platform}/advt/advt/info`,
    method: 'get',
    params: { id }
  })
}

/**
 * 下架（多条）
 */
export function batchSoldOut(params) {
  return request({
    url: `${platform}/advt/delete-platform-advt/execute`,
    method: 'post',
    data: params
  })
}

/**
 * 广告编辑
 */
export function editAdvt(params) {
  return request({
    url: `${platform}/advt/advt/edit`,
    method: 'post',
    data: params
  })
}

// 计划列表
/**
 * 获取产品计划列表
 */
export function fetchPlanList(query) {
  return request({
    url: `${platform}/advt/product-upload-plan/list`,
    method: 'get',
    params: query
  })
}

/**
 * 添加产品计划
 */
export function addPlan(param) {
  return request({
    url: `${platform}/advt/product-upload-plan/create`,
    method: 'post',
    data: param
  })
}

/**
 * 产品计划详情
 */
export function fetchDetails(query) {
  return request({
    url: `${platform}/advt/product-upload-plan/info`,
    method: 'get',
    params: query
  })
}

/**
 * 线上异常广告列表
 */
export function onlineErrorList(params) {
  return request({
    url: `${platform}/advt/online-error-unit/list`,
    method: 'get',
    params
  })
}

/**
 * 线上异常广告详情
 */
export function onlineErrorDetail(params) {
  return request({
    url: `${platform}/advt/online-error-unit/info`,
    method: 'get',
    params
  })
}

/**
 * 添加线上异常广告
 */
export function createOnlineError(data) {
  return request({
    url: `${platform}/advt/online-error-unit/create`,
    method: 'post',
    data
  })
}

/**
 * 修改毛利率与指定价，取消指定价
 */
export function updateCustomerPrice(data) {
  return request({
    url: `${platform}/advt/advt/custom-price`,
    method: 'post',
    data
  })
}

/**
 * 设置指定库存
 */
export function setCustomStock(data) {
  return request({
    url: `${platform}/advt/advt/custom-stock`,
    method: 'post',
    data
  })
}

/**
 *列表日志
 */
export function getChangeLog(params) {
  return request({
    url: `${platform}/advt/advt/change-log`,
    method: 'get',
    params
  })
}
