import request from '@/utils/request'

// 获取广告列表数据
export function fetchList(query) {
  return request({
    url: '/jdth/advt/advt/list',
    method: 'get',
    params: query
  })
}

// 获取广告详情
export function fetchDetail(advtId) {
  return request({
    url: '/jdth/advt/advt/info',
    method: 'get',
    params: { 'advt_id': advtId }
  })
}

// 广告下架
export function batchSoldOut(query) {
  return request({
    url: '/jdth/advt/advt/sales-off',
    method: 'get',
    params: query
  })
}

// 获取select选项数据全部
export function getSelectAll(query) {
  return request({
    url: '/jdth/advt/select/all',
    method: 'get',
    params: query
  })
}

// 产品计划列表
export function fetchPlanList(query) {
  return request({
    url: '/jdth/platform/product-upload-plan/list',
    method: 'get',
    params: query
  })
}

// 添加计划
export function addPlan(data) {
  return request({
    url: 'jdth/platform/product-upload-plan/add',
    method: 'post',
    data
  })
}

// 计划详情
export function fetchDetails(query) {
  return request({
    url: '/jdth/platform/product-upload-plan/info',
    method: 'get',
    params: query
  })
}

// 详情日志
export function getChangeLog(query) {
  return request({
    url: '/jdth/advt/advt/change-log',
    method: 'get',
    params: query
  })
}
