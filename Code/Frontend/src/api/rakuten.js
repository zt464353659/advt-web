import request from '@/utils/request'
const platform='/rakuten-new'
// 获取列表数据
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

/**
 * 获取select选项数据全部
 */
export function getSelectAll(query) {
  return request({
    url: `${platform}/advt/select/list`,
    method: 'get',
    query
  })
}

// 广告下架
export function batchSoldOut(data) {
  return request({
    url: `${platform}/advt/advt/delete`,
    method: 'post',
    data
  })
}


// 产品计划列表
export function fetchPlanList(query) {
  return request({
    url: `${platform}/schedule/product-schedule/list`,
    method: 'get',
    params: query
  })
}

// 添加计划
export function addPlan(data) {
  return request({
    url: `${platform}/schedule/product-schedule/add`,
    method: 'post',
    data
  })
}

// 计划详情
export function fetchDetails(query) {
  return request({
    url: `${platform}/schedule/product-schedule/info`,
    method: 'get',
    params: query
  })
}

// 计划详情
export function getChangeLog(query) {
  return request({
    url: `${platform}/advt/advt/change-log`,
    method: 'get',
    params: query
  })
}

// 广告更新设置列表
export function noUpdateList(params) {
  return request({
    url: `${platform}/advt/update-rule/list`,
    method: 'get',
    params
  })
}

// 广告更新设置添加/取消
export function setNoUpdate(data) {
  return request({
    url: `${ platform }/advt/update-rule/set`,
    method: 'post',
    data
  })
}

// 设置指定价、毛利率
export function updateCustomerPrice(data) {
  return request({
    url: `${platform}/advt/custom-price/set`,
    method: 'post',
    data
  })
}

// 取消指定价
export function cancelCustomPrice(data) {
  return request({
    url: `${platform}/advt/custom-price/cancel`,
    method: 'post',
    data
  })
}

// 设置指定库存
export function setCustomStock(data) {
  return request({
    url: `${platform}/advt/custom-quantity/set`,
    method: 'post',
    data
  })
}

// 取消指定库存
export function cancleStock(data) {
  return request({
    url: `${platform}/advt/custom-quantity/cancel`,
    method: 'post',
    data
  })
}

//产品计划信息导出选项
export function exportPlanOptions(data) {
  return request({
    url: `${platform}/schedule/product-schedule/select-list`,
    method: 'post',
    data
  })
}

// 产品计划信息导出
export function exportPlanInfo(data) {
  return request({
    url: `${platform}/schedule/product-schedule/export-list`,
    method: 'post',
    data
  })
}

// 广告详情编辑
export function editDetail(data) {
  return request({
    url: `${platform}/advt/advt/edit`,
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

// 广告详情编辑
export function getEditData(params) {
  return request({
    url: `${platform}/advt/edit/filler-data`,
    method: 'get',
    params
  })
}

// 获取指定不更新可选类型
export function getNoUpdateType() {
  return request({
    url: `${platform}/advt/no-update/type/list`,
    method: 'get'
  })
}

// 批量取消指定不更新
export function cancleProductNoUpdate(data) {
  return request({
    url: `${platform}/advt/update-rule/cancel`,
    method: 'post',
    data
  })
}

// 批量更新列表
export function getMoreUpdateList(params) {
  return request({
    url: `${platform}/schedule/update-schedule/list`,
    method: 'get',
    params
  })
}

// 批量更新详情
export function getMoreUpdateDetail(params) {
  return request({
    url: `${platform}/schedule/update-schedule/info`,
    method: 'get',
    params
  })
}
// 添加批量更新
export function addMoreUpdate(data) {
  return request({
    url: `${platform}/schedule/update-schedule/import`,
    method: 'post',
    data
  })
}
