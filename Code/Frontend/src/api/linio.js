import request from '@/utils/request'

const platform = '/linio-new'

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
    params: { 'advt_id': advtId }
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

// 详情日志
export function getChangeLog(query) {
  return request({
    url: `${ platform }/advt/advt/change-log`,
    method: 'get',
    params: query
  })
}

// 取消指定库存
export function quantityCancel(data) {
  return request({
    url: `${ platform }/advt/custom-quantity/cancel`,
    method: 'post',
    data
  })
}

// 指定库存
export function quantitySet(data) {
  return request({
    url: `${ platform }/advt/custom-quantity/set`,
    method: 'post',
    data
  })
}

// 广告下架
export function quantityDelete(data) {
  return request({
    url: `${ platform }/advt/advt/delete`,
    method: 'post',
    data
  })
}

// 设置指定价/指定毛利率
export function setCustomPrice(data) {
  return request({
    url: `${ platform }/advt/custom-price/set`,
    method: 'post',
    data
  })
}

// 取消指定价/指定毛利率
export function cancleCustomPrice(data) {
  return request({
    url: `${ platform }/advt/custom-price/cancel`,
    method: 'post',
    data
  })
}

// 广告详情编辑
export function editDetail(data) {
  return request({
    url: `${ platform }/advt/advt/edit`,
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

// 广告详情编辑数据
export function getEditData(params) {
  return request({
    url: `${ platform }/advt/edit/filler-data`,
    method: 'get',
    params
  })
}

/**
 * 设置产品更新列表
 */
export function productUpdateList(query) {
  return request({
    url: `${ platform }/advt/update-rule/list`,
    method: 'get',
    params: query
  })
}

/**
 * 添加、取消 指定不更新
 */
export function addProductUpdate(data) {
  return request({
    url: `${ platform }/advt/update-rule/set`,
    method: 'post',
    data
  })
}

/**
 * 批量设置取消不更新
 */
export function cancleProductNoUpdate(data) {
  return request({
    url: `${ platform }/advt/update-rule/cancel`,
    method: 'post',
    data
  })
}

// active状态导出数据
export function exportActive(data) {
  return request({
    url: `${ platform }/advt/advt/active-export`,
    method: 'post',
    data
  })
}
