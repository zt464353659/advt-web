import request from '@/utils/request'
const platform='/cdiscount-new'
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
export function fetchDetail(params) {
  return request({
    url: `${platform}/advt/advt/detail`,
    method: 'get',
    params
  })
}

/**
 * 获取目录分类
 */
export function getAllowedCategory() {
  return request({
    url: `${platform}/product/get-allowed-category/list`,
    method: 'get'
  })
}

/**
 * 获取产品计划列表信息
 */
export function fetchPlanList(query) {
  return request({
    url: `${platform}/advt/product-upload-plan/list`,
    method: 'get',
    params: query
  })
}

/**
 * 获取产品计划列表信息
 */
export function addPlan(query) {
  return request({
    url: `${platform}/product/upload-plan/add`,
    method: 'get',
    params: query
  })
}

/**
 * 获取产品计划详细信息
 */

export function fetchDetails(query) {
  return request({
    url: `${platform}/product/upload-plan/info`,
    method: 'get',
    params: query
  })
}

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
 * 添加计划任务
 */
export function addProductPlan(data) {
  return request({
    url: `${platform}/advt/product-upload-plan/add`,
    method: 'post',
    data: data
  })
}

/**
 * 计划任务详情
 */
export function productInfo(data) {
  return request({
    url: `${platform}/advt/product-upload-plan/info`,
    method: 'get',
    params: data
  })
}

/**
 * 广告详情编辑
 */
export function changeDetail(params) {
  return request({
    url: `${platform}/advt/advt/edit`,
    method: 'post',
    data: params
  })
}

/**
 * 广告下架
 */
export function soldOut(params) {
  return request({
    url: `${platform}/advt/advt/sales-off`,
    method: 'post',
    data: params
  })
}

/**
 * send for draft
 */
export function updateState(params) {
  return request({
    url: `${platform}/advt/advt/update-state`,
    method: 'post',
    data: params
  })
}

/**
 * 设置价格
 */
export function setPrice(params) {
  return request({
    url: `${platform}/advt/advt/set-price`,
    method: 'post',
    data: params
  })
}

/**
 * 设置库存
 */
export function setStock(params) {
  return request({
    url: `${platform}/advt/advt/set-stock`,
    method: 'post',
    data: params
  })
}

/**
 * 设置指定价
 */
export function setCustomPrice(data) {
  return request({
    url: `${platform}/advt/custom-price/set-custom-price`,
    method: 'post',
    data
  })
}

/**
 * 设置指定库存
 */
export function setCustomStock(data) {
  return request({
    url: `${platform}/advt/custom-stock/set-custom-stock`,
    method: 'post',
    data
  })
}

/**
 * 取消指定价
 */
export function cancleCustomPrice(data) {
  return request({
    url: `${platform}/advt/custom-price/cancel-custom-price`,
    method: 'post',
    data
  })
}

/**
 * 取消指定库存
 */
export function cancleCustomStock(data) {
  return request({
    url: `${platform}/advt/custom-stock/cancel-custom-stock`,
    method: 'post',
    data
  })
}

/**
 * 取消指定库存
 */
export function getOperationLog(params) {
  return request({
    url: `${platform}/advt/advt/get-custom-log`,
    method: 'get',
    params
  })
}
/**
 * 导出刊登失败表格
 */
export function errorExport(params) {
  return request({
    url: `${platform}/advt/advt/error-export`,
    method: 'get',
    params
  })
}

/**
 * 获取广告促销活动列表信息
 */
export function fetchPromoList(query) {
  return request({
    url: `${platform}/advt/sale/get-sale-list`,
    method: 'get',
    params: query
  })
}

/**
 * 添加广告促销活动
 */
export function addPromo(data) {
  return request({
    url: `${platform}/advt/sale/add-sale`,
    method: 'post',
    data
  })
}

/**
 * 删除广告促销活动
 */
export function delPromo(query) {
  return request({
    url: `${platform}/advt/sale/del-sale`,
    method: 'get',
    params: query
  })
}

/**
 * 编辑广告促销活动
 */
export function editPromo(data) {
  return request({
    url: `${platform}/advt/sale/do-edit`,
    method: 'post',
    data
  })
}

/**
 * copy广告促销活动
 */
export function copyPromo(data) {
  return request({
    url: `${platform}/advt/sale/do-copy`,
    method: 'post',
    data
  })
}


/**
 * @description: 获取广告促销广告列表
 */
export function fetchSaleInfoList(params) {
  return request({
    url: `${platform}/advt/sale/sale-info`,
    method: 'get',
    params
  })
}

/**
 * @description: 添加广告
 */
export function fetchAddProduct(data) {
  return request({
    url: `${platform}/advt/sale/add-product`,
    method: 'post',
    data
  })
}

/**
 * @description: 删除
 */
export function fetchAdvtSaleDelProduct(data) {
  return request({
    url: `${platform}/advt/sale/del-product`,
    method: 'post',
    data
  })
}

/**
 * @description: 取消不更新
 */
export function fetchEndSale(data) {
  return request({
    url: `${platform}/advt/sale/end-sale`,
    method: 'post',
    data
  })
}

/**
 * @description: 设置不更新
 */
export function fetchOpenSale(data) {
  return request({
    url: `${platform}/advt/sale/open-sale`,
    method: 'post',
    data
  })
}

/**
 * @description:文件上传
 */
export function fetchAdvtSaleUpload(data) {
  return request({
    url : `${platform}/advt/upload`,
    method: 'post',
    data
  })
}


/**
 * @description: 下载执行结果
 */
export function fetchadvtSaleDownload(params) {
  return request({
    url: `${platform}/advt/sale/download`,
    method: 'get',
    params
  })
}
/**
 * @description: 跟卖列表
 */
export function followUpPriceMonitorList(query) {
  return request({
    url: platform + '/advt/follow/follow-list',
    method: 'get',
    params: query
  })
}

/**
 * @description: 更卖添加任务
 */
export function createFollowAdd(data) {
  return request({
    url: platform + '/advt/follow/set-fellow',
    method: 'post',
    data
  })
}
/**
 * @description: 跟卖日志
 */
export function createFollowLog(params) {
  return request({
    url: platform + '/advt/follow/follow-log',
    method: 'get',
    params
  })
}
/**
 * @description: 跟卖启用禁用
 */
export function createFollowEnable(data) {
  return request({
    url: platform + '/advt/follow/on-off-fellow',
    method: 'post',
    data
  })
}
/**
 * @description: 跟卖更新编辑
 */
export function createFollowUpdate(data) {
  return request({
    url: platform + '/advt/follow/update-fellow',
    method: 'post',
    data
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
