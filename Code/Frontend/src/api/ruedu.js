import request from '@/utils/request'
const platform='/rueducommerce-new'
/**
 * 获取select选项数据全部
 */
export function getSelectAll(keys) {
  return request({
    url: `${platform}/advt/select/all`,
    method: 'get',
    params: { keys }
  })
}

/**
 * 获取广告列表信息
 */
export function fetchList(data) {
  return request({
    url: `${platform}/advt/advt/list`,
    method: 'post',
    data
  })
}

/**
 * 获取广告详情
 */
export function fetchDetail(params) {
  return request({
    url: `${platform}/advt/advt/info`,
    method: 'get',
    params
  })
}

/**
 * 产品计划详情
 */
export function getPlanDetail(params) {
  return request({
    url: `${platform}/advt/plan/info`,
    method: 'get',
    params
  })
}

/**
 * 获取产品计划列表
 */
export function getPlan(query) {
  return request({
    url: `${platform}/advt/plan/list`,
    method: 'get',
    params: query
  })
}

/**
 * 添加产品计划
 */
export function addProductPlan(data) {
  return request({
    url: `${platform}/advt/plan/add`,
    method: 'post',
    data
  })
}

/* 属性列表 */
export function attrList(data) {
  return request({
    url: `${platform}/advt/attr/list`,
    method: 'post',
    data
  })
}

/* 属性详情 */
export function attrInfo(params) {
  return request({
    url: `${platform}/advt/attr/info`,
    method: 'get',
    params
  })
}

/* 属性编辑 */
export function attrEdit(data) {
  return request({
    url: `${platform}/advt/attr/edit`,
    method: 'post',
    data
  })
}

/* list属性值 */
export function listAttrEdit(data) {
  return request({
    url: `${platform}/advt/attr/attr-value`,
    method: 'post',
    data
  })
}

/**
 * 修改毛利率与指定价，取消指定价
 */
export function updateCustomerPrice(data) {
  return request({
    url: `${platform}/advt/custom/custom-price`,
    method: 'post',
    data
  })
}

/**
 * 设置指定库存
 */
export function setCustomStock(data) {
  return request({
    url: `${platform}/advt/custom/custom-stock`,
    method: 'post',
    data
  })
}

// 详情编辑
export function saveDetail(data) {
  return request({
    url: `${platform}/advt/advt/edit`,
    method: 'post',
    data
  })
}

// 不更新设置列表
export function updateSettingList(params) {
  return request({
    url: `${platform}/advt/setting/list`,
    method: 'get',
    params
  })
}

// 不更新设置详情
export function updateSettingDetail(params) {
  return request({
    url: `${platform}/advt/setting/info`,
    method: 'get',
    params
  })
}

// 不更新设置添加任务
export function addUpdateTask(data) {
  return request({
    url: `${platform}/advt/setting/add-task`,
    method: 'post',
    data
  })
}

// 不更新设置添加任务产品
export function addUpdateProduct(data) {
  return request({
    url: `${platform}/advt/setting/add-product`,
    method: 'post',
    data
  })
}

// 不更新设置任务产品状态修改
export function addUpdateProductUpdate(data) {
  return request({
    url: `${platform}/advt/setting/set-update`,
    method: 'post',
    data
  })
}

// 获取列表日志
export function getChangeLog(params) {
  return request({
    url: `${platform}/advt/logs/change-log`,
    method: 'get',
    params
  })
}
