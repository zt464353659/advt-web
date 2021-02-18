
import request from '@/utils/request'
const platform='/b2w-new'
/**
 * Long title 和 Long description 导出接口
 */
export function fetchExportData(advtStatus) {
  return request({
    url: `${platform}/advt/export-advt-info/execute`,
    method: 'get',
    params: { advtStatus }
  })
}

/**
 * format 导出接口
 */
export function fetchExportformatData(params) {
  return request({
    url: `${platform}/advt/export-advt-info/export-format-adv`,
    method: 'get',
    params
  })
}

/**
 * format 导入接口
 */
export function importFormatData(data) {
  return request({
    url: `${platform}/advt/import-advt-title/import-adv-info`,
    method: 'post',
    data
  })
}
/**
 * 设置指定价，设置指定毛利率
 */
export function changePrice(data) {
  return request({
    url: `${platform}/advt-management/custom-price/set`,
    method: 'post',
    data
  })
}
/**
 * 取消指定价，取消指定毛利率
 */
export function cancelchangePrice(data) {
  return request({
    url: `${platform}/advt-management/custom-price/cancel`,
    method: 'post',
    data
  })
}

/**
 * 设置指定促销价,指定促销毛利率
 */
export function changeSalePrice(data) {
  return request({
    url: `${platform}/advt-management/custom-price/promote-set`,
    method: 'post',
    data
  })
}

/**
 * 取消指定促销价，指定促销毛利率
 */
export function changeSaleGross(data) {
  return request({
    url: `${platform}/advt-management/custom-price/promote-cancel`,
    method: 'post',
    data
  })
}

/**
 * 获取select选项数据全部
 */
export function getSelectAll(keys) {
  return request({
    url: `${platform}/advt-management/select/all`,
    method: 'get',
    params: { keys }
  })
}

/**
 * 获取广告列表信息
 */
export function fetchList(params) {
  return request({
    url: `${platform}/advt-management/advt-management/advt-list`,
    method: 'get',
    params
  })
}

/**
 * 广告下架
 */
export function deletePlatformAdvt(data) {
  return request({
    url: `${platform}/advt-management/advt-management/delete-advt`,
    method: 'post',
    data
  })
}

/**
 * 获取广告详情
 */
export function fetchDetail(params) {
  return request({
    url: `${platform}/advt-management/advt-management/advt-info`,
    method: 'get',
    params
  })
}

/**
 * 产品计划详情
 */
export function getPlanDetail(params) {
  return request({
    url: `${platform}/product-plan/product-plan/plan-log`,
    method: 'get',
    params
  })
}

/* 广告断开 */
export function disConnect(data) {
  return request({
    url: `${platform}/advt-management/advt-management/sync-b2w-advt`,
    method: 'post',
    data
  })
}

/**
 * 广告审核
 */
export function apiReviewAdvt(data) {
  return request({
    url: `${platform}/advt/advt/check-prohibit-words`,
    method: 'post',
    data
  })
}

/**
 * 获取产品计划列表
 */
export function getPlan(query) {
  return request({
    url: `${platform}/product-plan/product-plan/list`,
    method: 'get',
    params: query
  })
}

/**
 * 添加产品计划
 */
export function addProductPlan(data) {
  return request({
    url: `${platform}/product-plan/product-plan/add`,
    method: 'post',
    data
  })
}

/**
 * 账户select选项
 */
export function userSelect(keys) {
  return request({
    url: `${platform}/shopee/advt/select/all`,
    method: 'get',
    params: { keys }
  })
}

/**
 * 导出价格测算
 */
export function fetchExportPriceCalculation(data) {
  return request({
    url: `${platform}/advt/price-calculation/execute`,
    method: 'post',
    data
  })
}

/**
 * 快捷修改标题
 */
export function editProductName(data) {
  return request({
    url: 'shopee/advt/alters/edit-title',
    method: 'post',
    data
  })
}

/**
 * 广告详情页编辑获取分类树
 */
export function getCategories(params) {
  return request({
    url: `${platform}/advt/components/categories`,
    methods: 'get',
    params
  })
}

/**
 * 广告详情页编辑获取图片
 */
export function getPictures(advt_id) {
  return request({
    url: `${platform}/advt-management/advt-management/images-picker`,
    methods: 'get',
    params: { advt_id }
  })
}

/**
 * 广告详情页编辑保存
 */
export function saveDetailEdit(data) {
  return request({
    url: `${platform}/advt-management/advt-management/advt-edit`,
    method: 'post',
    data
  })
}

/**
 * 设置指定库存
 */
export function setCustomStock(data) {
  return request({
    url: `${platform}/advt-management/custom-quantity/set`,
    method: 'post',
    data
  })
}

/**
 * 取消指定库存
 */
export function cancleCustomStock(data) {
  return request({
    url:  `${platform}/advt-management/custom-quantity/cancel`,
    method: 'post',
    data
  })
}

/* 添加产品计划根据用户角色获取可操作的站点 */
export function addPlanAccount() {
  return request({
    url: `${platform}/product-plan/product-plan/account-list`,
    method: 'get'
  })
}

/* 获取istore描述更新日志 */
export function getIstoreLogs(params) {
  return request({
    url: `${platform}/advt-management/advt-management/daily-record`,
    method: 'get',
    params
  })
}


// 广告列表日志
export function getChangeLog(params) {
  return request({
    url: `${platform}/advt-manager/change-log`,
    method: 'get',
    params
  })
}
