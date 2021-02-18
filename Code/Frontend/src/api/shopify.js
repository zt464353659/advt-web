import request from '@/utils/request'
const platform='/shopify-new'
/**
 * 获取下拉选项
 */
export function apiGetAllSelect(query) {
  return request({
    url: `${platform}/advt/select/all`,
    method: 'get',
    params: query
  })
}

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
    params: {
      advtId
    }
  })
}

/**
 * 获取广告图表
 */
export function apiGetChart() {
  return request({
    url: `${platform}/advt/chart/get`,
    method: 'get'
  })
}

/**
 * 获取创建者列表
 */
export function fetchCreateUser() {
  return request({
    url: `${platform}/advt/CreateUserList`,
    method: 'get'
  })
}

/**
 * 广告下架
 */
export function deletePlatformAdvt(advtIds) {
  return request({
    url: `${platform}/advt/delete-platform-advt/execute`,
    method: 'post',
    data: {
      advtIds
    }
  })
}

/**
 * Long title 和 Long description 导出接口
 */
export function fetchExportData(advtStatus) {
  return request({
    url: `${platform}/export-advt-info/execute`,
    method: 'get',
    params: {
      advtStatus
    }
  })
}

/**
 * Long title 和 Long description 导入接口
 */
export function importExcelData(data) {
  return request({
    url: `${platform}/import-advt-title/import`,
    method: 'post',
    data
  })
}

/**
 * 修改毛利率与制定价
 */
export function updateCustomerPrice(data) {
  return request({
    url: `${platform}/custom-price/set-custom-price`,
    method: 'post',
    data
  })
}

/**
 * 取消指定价
 */
export function unpricing(data) {
  return request({
    url: `${platform}/custom-price/cancel-custom-price`,
    method: 'post',
    data
  })
}

/**
 * 产品计划列表
 */
export function getPlan(params) {
  return request({
    url: `${platform}/advt/product-upload-plan/list`,
    method: 'get',
    params
  })
}

/**
 * 产品计划详情
 */
export function planDetail(params) {
  return request({
    url: `${platform}/advt/product-upload-plan/info`,
    method: 'get',
    params
  })
}

/**
 * 添加账户下拉
 */
export function getSelectAll(keys) {
  return request({
    url: `${platform}/advt/select/all`,
    method: 'get',
    params: { keys }
  })
}

/**
 * 产品计划创建
 */
export function createPlan(data) {
  return request({
    url: `${platform}/advt/product-upload-plan/add`,
    method: 'post',
    data
  })
}
