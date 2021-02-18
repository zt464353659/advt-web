import request from '@/utils/request'
const platform='/dhgate-new'
// 获取广告列表数据
export function fetchList(params) {
  return request({
    url: `${platform}/advt/advt/list`,
    method: 'get',
    params
  })
}

// 获取广告详情
export function fetchDetail(advtId) {
  return request({
    url: `${platform}/advt/advt/info`,
    method: 'get',
    params: { 'advtId': advtId }
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

// 获取select选项数据全部
export function getSelectAll(params) {
  return request({
    url: `${platform}/advt/select/all`,
    method: 'get',
    params
  })
}

// 产品计划列表
export function fetchPlanList(params) {
  return request({
    url: `${platform}/platform/product-upload-plan/list`,
    method: 'get',
    params
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
export function fetchDetails(params) {
  return request({
    url: `${platform}/platform/product-upload-plan/info`,
    method: 'get',
    params
  })
}

// 详情日志
export function getChangeLog(params) {
  return request({
    url: `${platform}/advt/advt/change-log`,
    method: 'get',
    params
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

// 详情编辑
export function editDetail(data) {
  return request({
    url: `${platform}/advt/advt/edit`,
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

// istore图片及目录树
export function getEditData(params) {
  return request({
    url: `${platform}/advt/edit/filler-data`,
    method: 'get',
    params
  })
}
