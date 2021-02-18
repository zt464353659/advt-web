import request from '@/utils/request'

const platform = '/mercadolibre-new'

/**
 * 获取select选项数据全部
 */
export function getSelectAll(keys) {
  return request({
    url: `${ platform }/advt/select/all`,
    method: 'get',
    params: { keys }
  })
}

/**
 * 获取广告列表信息
 */
export function fetchList(query) {
  return request({
    url: `${ platform }/advt/advt/list`,
    method: 'get',
    params: query
  })
}

/**
 * 获取广告详情
 */
export function fetchDetail(advtId) {
  return request({
    url: `${ platform }/advt/advt/info`,
    method: 'get',
    params: { advt_id: advtId }
  })
}

/**
 * 获取创建者列表
 */
export function fetchCreateUser() {
  return request({
    url: `${ platform }/advt/CreateUserList`,
    method: 'get'
  })
}

/**
 * 广告下架
 */
export function deletePlatformAdvt(data) {
  return request({
    url: `${ platform }/advt/delete-platform-advt/execute`,
    method: 'post',
    data
  })
}

/**
 * Published Status导出接口
 */
export function importPublishStatusData(data) {
  return request({
    url: `${ platform }/advt/advt/export-advt-list`,
    method: 'post',
    data
  })
}

/**
 * Long title 和 Long description 导入接口
 */
export function importExcelData(data) {
  return request({
    url: `${ platform }/import-advt/execute`,
    method: 'post',
    data
  })
}

/**
 * 列表view listing 数据查询
 * @param data
 */
export function getProductSite(data) {
  return request({
    url: `${ platform }/advt/advt/get-view-listing`,
    method: 'post',
    data
  })
}

// 重新上架
export function rePutaway(data) {
  return request({
    url: `${ platform }/advt/back-on-the-shelves/get-back-on`,
    method: 'post',
    data
  })
}

// 设置指定库存
export function setInventory(data) {
  return request({
    url: `${ platform }/advt/custom-quantity/set`,
    method: 'post',
    data
  })
}

// 设置100状态下的指定库存
export function setInventory100(data) {
  return request({
    url: `${ platform }/advt/custom-quantity/set`,
    method: 'post',
    data
  })
}

// 取消指定库存
export function cancelInventory(data) {
  return request({
    url: `${ platform }/advt/custom-quantity/cancel`,
    method: 'post',
    data
  })
}

// 全部激活
export function AllTheactivation(data) {
  return request({
    url: `${ platform }/advt/advt-re-upload/re-update`,
    method: 'post',
    data
  })
}

/**
 * 获取平台分类
 */
export function getCategory(data) {
  return request({
    url: `${ platform }/advt/advt/get-category`,
    method: 'post',
    data
  })
}

/**
 * 获取产品计划列表
 */
export function fetchPlanList(query) {
  return request({
    url: `${ platform }/plan/product-plan/list`,
    method: 'get',
    params: query
  })
}

/**
 * 添加产品计划
 */
export function addPlan(param) {
  return request({
    url: `${ platform }/plan/product-plan/add`,
    method: 'post',
    data: param
  })
}

/**
 * 产品计划详情
 */
export function fetchDetails(query) {
  return request({
    url: `${ platform }/plan/product-plan/info`,
    method: 'get',
    params: query
  })
}

/**
 * 设置产品更新列表
 */
export function productUpdateList(query) {
  return request({
    url: `${ platform }/product/update-rule/list`,
    method: 'get',
    params: query
  })
}

/**
 * 添加、取消 指定不更新
 */
export function addProductUpdate(data) {
  return request({
    url: `${ platform }/product/update-rule/set`,
    method: 'post',
    data
  })
}

/**
 * 批量设置取消不更新
 */
export function cancleProductNoUpdate(data) {
  return request({
    url: `${ platform }/product/update-rule/cancel`,
    method: 'post',
    data
  })
}

/**
 * 获取不更新类型列表
 */
export function getUpdateType(params) {
  return request({
    url: `${ platform }/product/update-rule/types`,
    method: 'get',
    params
  })
}

/**
 * 获取istore更新日志列表
 */
export function getChangeLog(params) {
  return request({
    url: `${ platform }/advt/advt/change-log`,
    method: 'get',
    params
  })
}

/**
 * 批量设置指定价列表接口
 */
export function getCustomPriceList(params) {
  return request({
    url: `${ platform }/advt/batch-custom-price/list`,
    method: 'get',
    params
  })
}

/**
 * 批量设置指定价
 */
export function setCustomPrice(data) {
  return request({
    url: `${ platform }/advt/batch-custom-price/add`,
    method: 'post',
    data
  })
}

/**
 * 批量设置指定价详情
 */
export function customPriceDetail(params) {
  return request({
    url: `${ platform }/advt/batch-custom-price/detail`,
    method: 'get',
    params
  })
}

/**
 *  设置指定价
 */
export function updateCustomPrice(data) {
  return request({
    url: `${ platform }/advt/custom-price/set`,
    method: 'post',
    data
  })
}

/**
 *  取消指定价
 */
export function cancelCustomPrice(data) {
  return request({
    url: `${ platform }/advt/custom-price/cancel`,
    method: 'post',
    data
  })
}

// 属性配置列表
export function attributeConfigList(params) {
  return request({
    url: `${ platform }/category/attribute/list`,
    method: 'get',
    params
  })
}

// 属性配置
export function updateAttributeConfig(data) {
  return request({
    url: `${ platform }/category/attribute/set-default`,
    method: 'post',
    data
  })
}

// 获取编辑数据
export function getEditData(params) {
  return request({
    url: `${ platform }/advt/edit/filler-data`,
    method: 'get',
    params
  })
}

// 详情页编辑
export function editDetail(data) {
  return request({
    url: `${ platform }/advt/advt/edit`,
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

// 同步价格
export function SynchronousPricesApi(data) {
  return request({
    url: `${ platform }/advt/advt/sync-price`,
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

// 同步库存
export function SynchronousStocksApi(data) {
  return request({
    url: `${ platform }/advt/advt/sync-stock`,
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}

// 同步数据
export function SynchronousDatasApi(data) {
  return request({
    url: `${ platform }/advt/advt/sync-advt-data`,
    method: 'post',
    data: Object.assign(data, { isJson: true })
  })
}
