import request from '@/utils/request'

const platform = '/priceminister-new'

// 广告列表
/**
 *  搜索框中产品线
 */
export function getSelectAll(keys) {
  return request({
    url: platform + '/advt/select/all',
    method: 'get'
  })
}

/**
 * 获取广告列表信息
 */
export function fetchList(query) {
  return request({
    url: platform + '/advt/advt/list',
    method: 'get',
    params: query
  })
}

/**
 * 获取广告详情
 */
export function fetchDetail(advtId) {
  return request({
    url: platform + '/advt/advt/info',
    method: 'get',
    params: { advtId }
  })
}

/**
 * 下架（多条）
 */
export function batchSoldOut(params) {
  return request({
    url: platform + '/advt/delete-platform-advt/execute',
    method: 'post',
    data: params

  })
}

/**
 * 上架
 */
export function upperAdvt(params) {
  return request({
    url: platform + '/advt/advt/upper-shelf',
    method: 'post',
    data: params

  })
}

/**
 * 编辑保存
 */
export function editSave(data) {
  return request({
    url: platform + '/advt/advt/edit',
    method: 'post',
    data
  })
}

/**
 * 编辑标题
 */
export function apiUpdateAdvt(data) {
  return request({
    url: platform + '/advt/advt/edit-title',
    method: 'post',
    data
  })
}

/**
 * send to draft 操作
 */
export function apiSendToDraft(data) {
  return request({
    url: platform + '/advt/advt/pending-to-draft',
    method: 'post',
    data
  })
}

// 计划列表
/**
 * 获取产品计划列表
 */
export function fetchPlanList(query) {
  return request({
    url: platform + '/advt/product-upload-plan/list',
    // url: '/platform/product-upload-plan/list',
    method: 'get',
    params: query
  })
}

/**
 * 添加产品计划
 */
export function addPlan(param) {
  return request({
    url: platform + '/advt/product-upload-plan/add-plan',
    method: 'post',
    data: param
  })
}

/**
 * 产品计划详情
 */
export function fetchDetails(query) {
  return request({
    url: platform + '/advt/product-upload-plan/info',
    method: 'get',
    params: query
  })
}

// 账户管理列表
/**
 * 账户管理
 */
export function fetchAccountManager(query) {
  return request({
    url: platform + '/account/account/list',
    method: 'get',
    params: query
  })
}

/**
 * 新增账号
 */
export function fetchAddAccount(param) {
  return request({
    url: platform + '/account/account/create',
    method: 'post',
    data: param
  })
}

/**
 * 新增账号
 */
export function fetchEditAccount(param) {
  return request({
    url: platform + '/account/account/edit',
    method: 'post',
    data: param
  })
}

/**
 * 修改毛利率与指定价，取消指定价
 */
export function updateCustomerPrice(data) {
  return request({
    url: platform + '/advt/advt/custom-price',
    method: 'post',
    data
  })
}

/**
 * 设置指定库存
 */
export function setCustomStock(data) {
  return request({
    url: platform + '/advt/advt/custom-stock ',
    method: 'post',
    data
  })
}


/**
 * @description: 跟卖列表
 */
export function followUpPriceMonitorList(query) {
  return request({
    url: platform + '/advt/follow/list',
    method: 'get',
    params: query
  })
}

/**
 * @description: 更卖添加任务
 */
export function createFollowAdd(data) {
  return request({
    url: platform + '/advt/follow/add',
    method: 'post',
    data
  })
}
/**
 * @description: 跟卖日志
 */
export function createFollowLog(params) {
  return request({
    url: platform + '/advt/follow/log',
    method: 'get',
    params
  })
}
/**
 * @description: 跟卖启用禁用
 */
export function createFollowEnable(data) {
  return request({
    url: platform + '/advt/follow/enable',
    method: 'post',
    data
  })
}
/**
 * @description: 跟卖更新编辑
 */
export function createFollowUpdate(data) {
  return request({
    url: platform + '/advt/follow/update',
    method: 'post',
    data
  })
}

// 列表日志
export function getChangeLog(params) {
  return request({
    url: platform + '/advt/advt/change-log',
    method: 'get',
    params
  })
}
