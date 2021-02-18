import request from '@/utils/request'

const platform = '/coupang-new' // coupang
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
export function fetchDetail(advtId) {
  return request({
    url: `${platform}/advt/advt/info`,
    method: 'get',
    params: { advtId }
  })
}

/**
 * 广告详情编辑(名称、19禁、图片、描述)
 */
export function changeDetail(params) {
  return request({
    url: `${platform}/advt/update-advt/update`,
    method: 'post',
    data: params
  })
}

/**
 * send to draft
 */
export function sendToDraft(params) {
  return request({
    url: `${platform}/advt/update-advt/update-state`,
    method: 'post',
    data: params
  })
}

// /**
//  * 批量导出
//  */
// export function exportExcel(params) {
//   return request({
//     url: '/coupang/advt/advt/export-product',
//     method: 'post',
//     data: params
//   })
// }

// /**
//  * 列表广告名称修改
//  */
export function changeDraft(params) {
  return request({
    url: `${platform}/advt/update-advt/update`,
    method: 'post',
    data: params,
    business: 'changeDraft'
  })
}

// /**
//  * 批量normal广告上传
//  */
// export function normalBatch(params) {
//   return request({
//     url: '/coupang/advt/create-advt/create',
//     method: 'post',
//     data: params
//   })
// }

/**
 * 获取下架产品列表（多条）
 */
export function batchSoldOut(advt_id) {
  return request({
    url: `${platform}/advt/delete/delete`,
    method: 'post',
    data: { advt_id }
  })
}

/**
 * 设置指定价
 */
export function appointPrice(params) {
  return request({
    url: `${platform}/advt/update-advt/set-custom-price`,
    method: 'post',
    data: params
  })
}

/**
 * 取消指定价
 */
export function cancelPrice(params) {
  return request({
    url: `${platform}/advt/update-advt/un-set-custom-price`,
    method: 'post',
    data: params
  })
}

/**
 * 设置库存
 */
export function setTheInventory(params) {
  return request({
    url: `${platform}/advt/update-advt/set-custom-quantity`,
    method: 'post',
    data: params
  })
}

/**
 * 取消库存
 */
export function cancelTheInventory(params) {
  return request({
    url: `${platform}/advt/update-advt/un-set-custom-quantity`,
    method: 'post',
    data: params
  })
}

/**
 *  搜索框中产品线
 */
export function getSelectAll(keys) {
  return request({
    url: `${platform}/advt/select/all`,
    method: 'get'
  })
}

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
    url: `${platform}/advt/product-upload-plan/add`,
    method: 'post',
    data: param,
    business: 'changeDraft'
  })
}

/**
 *  产品计划中siteCode
 */
export function fetchSiteCode(keys) {
  return request({
    url: `${platform}/advt/select/site-code`,
    method: 'get'
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
 * 产品详情oss图片上传
 */
export function uploadoss(data) {
  return request({
    url: `${platform}/advt/image/upload-oss`,
    method: 'post',
    data
  })
}
/**
 *详情oss图片上传
 */
export function batchuploadoss(data) {
  return request({
    url: `${platform}/advt/image/batch-upload-oss`,
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取服务器当前时间 advt/select/time
 */
export function selectTime() {
  return request({
    url: `${platform}/advt/select/time`,
    method: 'get',
    business: 'changeDraft'
  })
}

/**
 * 跟卖监控列表
 */
export function apiGetSellList(params) {
  return request({
    url: `${platform}/advt/sell-with/list`,
    method: 'get',
    params
  })
}

/**
 * 手动添加监控
 */
export function apiAddWatch(data) {
  return request({
    url: `${platform}/advt/sell-with/add-sell`,
    method: 'post',
    data
  })
}

/**
 * 查看监控日志
 */
export function apiGetWacthLog(params) {
  return request({
    url: `${platform}/advt/sell-with/get-sell-log`,
    method: 'get',
    params
  })
}

// 后台广告拉取配置列表
export function pullConfigList(params) {
  return request({
    url: `${platform}/advt/get-platform-advt/list`,
    method: 'get',
    params
  })
}

// 添加后台广告拉取配置
export function addPullConfig(data) {
  return request({
    url: `${platform}/advt/get-platform-advt/add`,
    method: 'post',
    data
  })
}


// 后台广告拉取配置详情
export function pullConfigDetails(query) {
  return request({
    url: `${platform}/advt/get-platform-advt/get-task-log`,
    method: 'get',
    params: query
  })
}

// 列表日志
export function getChangeLog(params) {
  return request({
    url: `${platform}/advt/advt/change-log`,
    method: 'get',
    params
  })
}

// 违禁词审核、驳回
export function wordReview(data) {
  return request({
    url: `${platform}/advt/advt/word-review`,
    method: 'post',
    data
  })
}

//店铺配置列表
export function accountList(params) {
  return request({
    url: `${platform}/advt/account/list`,
    method: 'get',
    params
  })
}

//修改店铺自动上传配置
export function accountUpdate(data) {
  return request({
    url: `${platform}/advt/account/update`,
    method: 'post',
    data
  })
}
