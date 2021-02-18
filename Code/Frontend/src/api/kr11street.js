import request from '@/utils/request'

const platform = '/kr11street-new'

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
 * 获取创建人列表信息
 */
export function founder(query) {
  return request({
    url: `${platform}/advt/select/get-create-man`,
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
export function changeDetail(data) {
  return request({
    url: `${platform}/advt/advt/update-title`,
    method: 'post',
    data
  })
}

/**
 * send to draft
 */
export function sendToDraft(params) {
  return request({
    url: `${platform}/advt/create-advt/update-state`,
    method: 'post',
    data: params
  })
}

/**
 * 批量导出
 */
export function exportExcel(params) {
  return request({
    url: `${platform}/advt/advt/export-product`,
    method: 'post',
    data: params
  })
}

/**
 * 列表广告名称修改
 */
export function changeDraft(params) {
  return request({
    url: `${platform}/advt/advt/update-title`,
    method: 'post',
    data: params,
    business: 'changeDraft'
  })
}

/**
 * 批量normal广告上传
 */
export function normalBatch(params) {
  return request({
    url: `${platform}/advt/create-advt/create`,
    method: 'post',
    data: params
  })
}

/**
 * 获取下架产品列表（多条）
 */
export function batchSoldOut(advt_id) {
  return request({
    url: `${platform}/advt/delete-platform-advt/sold-out`,
    method: 'post',
    data: { advt_id, not_show_message: true }
  })
}

/**
 * 获取刪除产品列表（多条）
 */
export function batchDelete(advt_id) {
  return request({
    url: `${platform}/advt/advt/advt-delete`,
    method: 'post',
    data: { advt_id }
  })
}

/**
 * 设置吊牌指定价
 */
export function appointDrop(params) {
  return request({
    url: `${platform}/advt/tag-price/set-tag-price`,
    method: 'post',
    data: params
  })
}

/**
 * 取消吊牌指定价
 */
export function cancelDrop(params) {
  return request({
    url: `${platform}/advt/tag-price/cancel-tag-price`,
    method: 'post',
    data: params
  })
}

/**
 * 设置库存
 */
export function setTheInventory(params) {
  return request({
    url: `${platform}/advt/custom-stock/set-custom-stock`,
    method: 'post',
    data: params
  })
}

/**
 * 取消库存
 */
export function cancelTheInventory(params) {
  return request({
    url: `${platform}/advt/custom-stock/cancel-custom-stock`,
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
 * 产品计划详情富文本图片上传
 */
export function uploadoss(data) {
  return request({
    url: `${platform}/advt/image/upload-oss`,
    method: 'post',
    data
  })
}

/**
 * 获取服务器当前时间 advt/select/time
 */
export function selectTime() {
  return request({
    url: `${platform}/advt/select/time`,
    method: 'get'
  })
}

/**
 * 全量删除
 */
export function deleteAdvt(params) {
  return request({
    url: `${platform}/advt/delete-status-all/delete`,
    method: 'post',
    data: params
  })
}

/**
 * 设置指定价
 */
export function setProductPrice(data) {
  return request({
    url: `${platform}/advt/tag-price/set-custom-price`,
    method: 'post',
    data
  })
}

/**
 * 取消指定价
 */
export function cancleProductPrice(data) {
  return request({
    url: `${platform}/advt/tag-price/un-set-custom-price`,
    method: 'post',
    data
  })
}

/**
 * 不更新广告列表
 */
export function noUpdateList(params) {
  return request({
    url: `${platform}/advt/set-update/not-update-list`,
    method: 'get',
    params
  })
}

/**
 * 添加不更新广告
 */
export function setNoUpdate(data) {
  return request({
    url: `${platform}/advt/set-update/set-not-update`,
    method: 'post',
    data
  })
}

/**
 * 取消不更新广告
 */
export function cancleNoUpdate(data) {
  return request({
    url: `${platform}/advt/set-update/un-set-not-update`,
    method: 'post',
    data
  })
}

/**
 * 优先推送
 */
export function priorityPush(data) {
  return request({
    url: `${platform}/advt/advt/priority-push`,
    method: 'post',
    data
  })
}

/**
 * 广告拉取列表
 */
export function apiPullAdvtList(params) {
  return request({
    url: `${platform}/advt/platform-advt/list`,
    method: 'get',
    params
  })
}

/**
 * 广告拉取添加
 */
export function apiAddPullAdvt(data) {
  return request({
    url: `${platform}/advt/platform-advt/add`,
    method: 'post',
    data
  })
}

/**
 * 广告拉取详情
 */
export function apiPullAdvtDetail(params) {
  return request({
    url: `${platform}/advt/platform-advt/get-task-log`,
    method: 'get',
    params
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

/**
 * 热销竞品页面
 */
//列表获取
export function followList(params) {
  return request({
    url: `${platform}/advt/follow/follow-list`,
    method: 'get',
    params
  })
}

//添加任务
export function setFellow(data) {
  return request({
    url: `${platform}/advt/follow/set-fellow`,
    method: 'post',
    data
  })
}

//修改任务
export function updateFellow(data) {
  return request({
    url: `${platform}/advt/follow/update-fellow`,
    method: 'post',
    data
  })
}

//开关任务
export function onOffFellow(data) {
  return request({
    url: `${platform}/advt/follow/on-off-fellow`,
    method: 'post',
    data
  })
}

//日志
export function fellowlog(params) {
  return request({
    url: `${platform}/advt/follow/follow-log`,
    method: 'get',
    params
  })
}
