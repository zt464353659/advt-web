import request from '@/utils/request'

const platform = '/newegg-new'

// 获取广告列表数据
export function fetchList(query) {
  return request({
    url: `${ platform }/advt/advt/list`,
    method: 'get',
    params: query
  })
}

// 获取广告详情
export function fetchDetail(advtId) {
  return request({
    url: `${ platform }/advt/advt/info`,
    method: 'get',
    params: { 'advtId': advtId }
  })
}

// 广告下架
export function batchSoldOut(query) {
  return request({
    url: `${ platform }/advt/advt/sales-off`,
    method: 'get',
    params: query
  })
}

// 获取select选项数据全部
export function getSelectAll(query) {
  return request({
    url: `${ platform }/advt/select/all`,
    method: 'get',
    params: query
  })
}

// 产品计划列表
export function fetchPlanList(query) {
  return request({
    url: `${ platform }/platform/product-upload-plan/list`,
    method: 'get',
    params: query
  })
}

// 添加计划
export function addPlan(data) {
  return request({
    url: `${ platform }/platform/product-upload-plan/add`,
    method: 'post',
    data
  })
}

// 计划详情
export function fetchDetails(query) {
  return request({
    url: `${ platform }/platform/product-upload-plan/info`,
    method: 'get',
    params: query
  })
}

// 属性列表
export function getAttributeList(query) {
  return request({
    url: `${ platform }/category/attribute/list`,
    method: 'get',
    params: query
  })
}

// 搜索条件列表
export function getSearchList(query) {
  return request({
    url: `${ platform }/category/attribute/base-data`,
    method: 'get',
    params: query
  })
}

// 属性值列表
export function getAttributeValueList(query) {
  return request({
    url: `${ platform }/category/attribute-value/list`,
    method: 'get',
    params: query
  })
}

// 设置属性值
export function setAttributeValue(data) {
  return request({
    url: `${ platform }/category/attribute-value/set-default`,
    method: 'post',
    data
  })
}

// 属性值列表
export function getChangeLog(query) {
  return request({
    url: `${ platform }/advt/advt/change-log`,
    method: 'get',
    params: query
  })
}

// 设置指定价、毛利率
export function updateCustomerPrice(data) {
  return request({
    url: `${ platform }/advt/custom-price/set`,
    method: 'post',
    data
  })
}

// 取消指定价
export function cancelCustomPrice(data) {
  return request({
    url: `${ platform }/advt/custom-price/cancel`,
    method: 'post',
    data
  })
}

// 设置指定库存
export function setCustomStock(data) {
  return request({
    url: `${ platform }/advt/custom-quantity/set`,
    method: 'post',
    data
  })
}

// 取消指定库存
export function cancleStock(data) {
  return request({
    url: `${ platform }/advt/custom-quantity/cancel`,
    method: 'post',
    data
  })
}

// 激活广告
export function addActiveAdvt(data) {
  return request({
    url: `${ platform }/platform/product-upload-plan/add-active`,
    method: 'post',
    data
  })
}

// 详情编辑
export function editDetail(data) {
  return request({
    url: `${ platform }/advt/advt/edit`,
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

// 详情编辑数据
export function getEditData(params) {
  return request({
    url: `${ platform }/advt/edit/filler-data`,
    method: 'get',
    params
  })
}
