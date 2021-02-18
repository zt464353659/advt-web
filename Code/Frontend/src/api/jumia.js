import request from '@/utils/request'
const platform='/jumia-new'
// 获取广告列表数据
export function fetchList(query) {
  return request({
    url: `${platform}/advt/advt/list`,
    method: 'get',
    params: query
  })
}

// 获取广告详情
export function fetchDetail(advtId) {
  return request({
    url: `${platform}/advt/advt/info`,
    method: 'get',
    params: { 'advt_id': advtId }
  })
}
// 广告详情编辑
export function advtEdit(data) {
  return request({
    url: `${platform}/advt/advt/edit`,
    method: 'post',
    data
  })
}
// 详情页目录/属性/图片获取
export function editFillerData(params) {
  return request({
    url: `${platform}/advt/edit/filler-data`,
    method: 'get',
    params
  })
}

// 广告下架
export function batchSoldOut(data) {
  return request({
    url: `${platform}/advt/manage/offline`,
    method: 'post',
    data
  })
}

// 获取select选项数据全部
export function getSelectAll(query) {
  return request({
    url: `${platform}/advt/select/all`,
    method: 'get',
    params: query
  })
}

// 产品计划列表
export function fetchPlanList(query) {
  return request({
    url: `${platform}/platform/product-upload-plan/list`,
    method: 'get',
    params: query
  })
}

// 添加计划
export function addPlan(data) {
  return request({
    url: `${platform}/platform/product-upload-plan/add`,
    method: 'post',
    data
  })
}

// 计划详情
export function fetchDetails(query) {
  return request({
    url: `${platform}/platform/product-upload-plan/info`,
    method: 'get',
    params: query
  })
}

// 详情日志
export function getChangeLog(query) {
  return request({
    url: `${platform}/advt/advt/change-log`,
    method: 'get',
    params: query
  })
}

// 设置指定库存
export function setQuantity(data) {
  return request({
    url: `${platform}/advt/custom-quantity/set`,
    method: 'post',
    data
  })
}

// 取消指定库存
export function cancelQuantity(data) {
  return request({
    url: `${platform}/advt/custom-quantity/cancel`,
    method: 'post',
    data
  })
}

// 设置指定价
export function setPrice(data) {
  return request({
    url: `${platform}/advt/custom-price/set`,
    method: 'post',
    data
  })
}

// 取消指定价
export function cancelPrice(data) {
  return request({
    url: `${platform}/advt/custom-price/cancel`,
    method: 'post',
    data
  })
}

/**
 * 指定毛利率
 */
export function setCustomGrossMargin(data) {
  return request({
    url: `${platform}/advt/custom-gross-margin/set`,
    method: 'post',
    data
  })
}

/**
 * 取消指定毛利率
 */
export function cancelCustomGrossMargin(data) {
  return request({
    url: `${platform}/advt/custom-gross-margin/cancel`,
    method: 'post',
    data
  })
}
/**
 * 错误导出
 */
export function uploadError(query) {
  return request({
    url: `${platform}/advt/export/upload-error`,
    method: 'get',
    params: query
  })
}
/**
 * 在线导出
 */
export function exportProduct(query) {
  return request({
    url: `${platform}/advt/export/product`,
    method: 'get',
    params: query
  })
}
//POST advt/update-rule/set   设置
// POST advt/update-rule/cancel 取消
// GET advt/update-rule/list 列表

//产品更新列表
export function updateRuleList(query) {
  return request({
    url: `${platform}/advt/update-rule/list`,
    method: 'get',
    params: query
  })
}
//产品更新设置
export function updateRuleSet(data) {
  return request({
    url: `${platform}/advt/update-rule/set`,
    method: 'post',
    data
  })
}
//产品更新取消
export function updateRuleCancel(data) {
  return request({
    url: `${platform}/advt/update-rule/cancel`,
    method: 'post',
    data
  })
}
