import request from '@/utils/request'
const platform='/shopee-new'
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
 * Long title 和 Long description 导入接口
 */
export function importExcelData(data) {
  return request({
    url: `${platform}/advt/import-advt-title/import`,
    method: 'post',
    data
  })
}

/**
 * 修改毛利率与指定价
 */
export function updateCustomerPrice(data) {
  return request({
    url: `${platform}/advt/custom-price/set-custom-price`,
    method: 'post',
    data
  })
}

/**
 * 取消指定价
 */
export function unpricing(data) {
  return request({
    url: `${platform}/advt/custom-price/cancel-custom-price`,
    method: 'post',
    data
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
 * 广告删除
 */
export function deletePlatformAdvt(advtIds) {
  return request({
    url: `${platform}/advt/delete-platform-advt/execute`,
    method: 'post',
    data: { advtIds }
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
export function getPlanDetail(query) {
  return request({
    url: `${platform}/advt/product-upload-plan/info`,
    method: 'get',
    params: query
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
    url: `${platform}/advt/product-upload-plan/list`,
    method: 'get',
    params: query
  })
}

/**
 * 添加产品计划
 */
export function addProductPlan(data) {
  return request({
    url: `${platform}/advt/product-upload-plan/add`,
    method: 'post',
    data
  })
}

/**
 * 账户select选项
 */
export function userSelect(keys) {
  return request({
    url: `${platform}/advt/select/all`,
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
    url: `${platform}/advt/alters/edit-title`,
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
    url: `${platform}/advt/components/image-picker`,
    methods: 'get',
    params: { advt_id }
  })
}

/**
 * 广告详情页编辑保存
 */
export function saveDetailEdit(data) {
  return request({
    url: `${platform}/advt/alters/edit-all`,
    method: 'post',
    data
  })
}

/**
 * 获取分类属性组
 */
export function getAttributes(params) {
  return request({
    url: `${platform}/advt/components/attributes`,
    method: 'get',
    params
  })
}

/**
 * 添加折扣
 */
export function addDiscount(data) {
  return request({
    url: `${platform}/discount/discount/add`,
    method: 'post',
    data
  })
}

/**
 * 删除折扣
 */
export function deleteDiscount(data) {
  return request({
    url: `${platform}/discount/discount/delete`,
    method: 'post',
    data
  })
}

/**
 * 折扣管理列表
 */
export function getDiscountList(params) {
  return request({
    url: `${platform}/discount/discount/list`,
    method: 'get',
    params
  })
}

/**
 * 折扣活动详情头部
 */
export function getDiscountTop(params) {
  return request({
    url: `${platform}/discount/discount/detail`,
    method: 'get',
    params
  })
}

/**
 * 折扣活动详情列表
 */
export function getDiscountDetailList(params) {
  return request({
    url: `${platform}/discount/discount-advt/list`,
    method: 'get',
    params
  })
}

/**
 * 折扣活动详情新增折扣广告
 */
export function addDiscountDetailAdvt(data) {
  return request({
    url: `${platform}/discount/discount-advt/add`,
    method: 'post',
    data
  })
}

/**
 * 折扣活动详情移除广告
 */
export function deleteDiscountDetailAdvt(data) {
  return request({
    url: `${platform}/discount/discount-advt/delete`,
    method: 'post',
    data
  })
}

/**
 * 折扣活动详情新增活动弹窗列表
 */
export function addActivationAdvt(params) {
  return request({
    url: `${platform}/discount/discount-advt/get-advt-list`,
    method: 'get',
    params
  })
}

/**
 * 折扣活动详情头部编辑
 */
export function editDiscountTop(data) {
  return request({
    url: `${platform}/discount/discount/edit`,
    method: 'post',
    data
  })
}

/**
 * 折扣活动详情头部更新折扣活动
 */
export function updateAll(data) {
  return request({
    url: `${platform}/discount/discount-advt/batch-edit`,
    method: 'post',
    data
  })
}

/**
 * 折扣活动详情头部更新折扣活动
 */
export function updateSingle(data) {
  return request({
    url: `${platform}/discount/discount-advt/single-edit`,
    method: 'post',
    data
  })
}

/**
 * 设置指定库存
 */
export function setInventory(data) {
  return request({
    url: `${platform}/advt/custom-stock/set-custom-stock`,
    method: 'post',
    data
  })
}

/**
 * 取消指定库存
 */
export function unInventory(data) {
  return request({
    url: `${platform}/advt/custom-stock/cancel-custom-stock`,
    method: 'post',
    data
  })
}

/**
 * 设置店铺指定库存
 */
export function setStoreInventory(data) {
  return request({
    url: `${platform}/advt/custom-stock/set-shop-custom-stock`,
    method: 'post',
    data
  })
}

/**
 * 取消店铺指定库存
 */
export function unStoreInventory(data) {
  return request({
    url: `${platform}/advt/custom-stock/cancel-shop-custom-stock`,
    method: 'post',
    data
  })
}

/**
 * 取消店铺指定库存列表
 */
export function unStoreInventoryList(params) {
  return request({
    url: `${platform}/advt/custom-stock/get-shop-custom-stock`,
    method: 'get',
    params
  })
}

/*
 * 热销品列表
 */
export function getHotbrandList(params) {
  return request({
    url: `${platform}/hotsale/hotsale/list`,
    method: 'get',
    params
  })
}

/* 获取热销品信息列表 */
export function addhotbrandInfo(data) {
  return request({
    url: `${platform}/hotsale/hotsale/add`,
    method: 'post',
    data
  })
}

/* 热销品信息详情 */
export function queryHotbrandDetail(params) {
  return request({
    url: `${platform}/hotsale/hotsale/info`,
    method: 'get',
    params
  })
}

/* 热销品信息下载 */
export function downloadhotbrand(params) {
  return request({
    url: `${platform}/hotsale/hotsale/download`,
    method: 'get',
    params
  })
}

/* 获取销售报表任务列表 */
export function getSalesReport(params) {
  return request({
    url: `${platform}/report/sales/list`,
    method: 'get',
    params
  })
}

/* 添加销售报表计划 */
export function addSalesReport(data) {
  return request({
    url: `${platform}/report/sales/add`,
    method: 'post',
    data
  })
}

/* 获取禁售目录列表 */
export function getProhibitedCatalogue(params) {
  return request({
    url: `${platform}/prohibitedcatalogue/prohibited-catalogue/list`,
    method: 'get',
    params
  })
}

/* 添加禁售目录 */
export function addProhibitedCatalogue(data) {
  return request({
    url: `${platform}/prohibitedcatalogue/prohibited-catalogue/add`,
    method: 'post',
    data
  })
}

/*产品下架 */
export function shelves(data) {
  return request({
    url: `${platform}/advt/advt/unlist-item-online`,
    method: 'post',
    data
  })
}

/* 添加产品计划根据用户角色获取可操作的站点 */
export function addPlanAccount(params) {
  return request({
    url: `${platform}/advt/select/authorized-accounts`,
    method: 'get',
    params
  })
}

/* 获取istore描述更新日志 */
export function getIstore(params) {
  return request({
    url: `${platform}/advt/logs/notices`,
    method: 'get',
    params
  })
}

/* 审核istore描述更新日志 */
export function notice(data) {
  return request({
    url: `${platform}/advt/logs/close-notice`,
    method: 'post',
    data
  })
}

/* 违禁词判断 */
export function prohibitedJudgment(data) {
  return request({
    url: `${platform}/advt/advt/detect-prohibited-words`,
    method: 'post',
    data
  })
}

/* 店铺配置列表 */
export function automatic(params) {
  return request({
    url: `${platform}/account/automatic-upload/list`,
    method: 'get',
    params
  })
}




/* 开启或禁用店铺自动上传接口/修改店铺配置 */
export function storeDisabled(data) {
  return request({
    url: `${platform}/account/automatic-upload/do-auto-upload`,
    method: 'post',
    data
  })
}

/* copy广告 */
export function copyAdvt(data) {
  return request({
    url: `${platform}/advt/copy-advt/reproduce`,
    method: 'post',
    data
  })
}

/* 日销售报表列表 */
export function salesList(params) {
  return request({
    url: `${platform}/daycensus/day-sales-census/day-sales-list`,
    method: 'get',
    params
  })
}

/* 日销售报表新增产品 */
export function salesAdd(data) {
  return request({
    url: `${platform}/daycensus/day-sales-census/day-sales-add`,
    method: 'post',
    data
  })
}

/* 日销售报表批量删除、删除 */
export function salesDelete(data) {
  return request({
    url: `${platform}/daycensus/day-sales-census/day-sales-delete`,
    method: 'post',
    data
  })
}

/* 日销售报表导出 */
export function salesExcel(params) {
  return request({
    url: `${platform}/daycensus/day-sales-census/excel-data`,
    method: 'get',
    params
  })
}

/* 推送失败删除 */
export function delPushFailed(data) {
  return request({
    url: `${platform}/advt/alters/delete-product`,
    method: 'post',
    data
  })
}

/* 重新推送失败的广告 */
export function rePush(data) {
  return request({
    url: `${platform}/advt/advt/repush`,
    method: 'post',
    data
  })
}

/* 折扣计划相关接口 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/* 折扣计划列表 */
export function apiGetDiscountPlainList(params) {
  return request({
    url: `${platform}/discount/discount-plan/list`,
    method: 'get',
    params
  })
}

/* 添加折扣计划 */
export function apiAddDiscountPlain(data) {
  return request({
    url: `${platform}/discount/discount-plan/add`,
    method: 'post',
    data
  })
}

/* 折扣计划详情 */
export function apiDiscountPlainInfo(params) {
  return request({
    url: `${platform}/discount/discount-plan/info`,
    method: 'get',
    params
  })
}

/* 店铺库存配置 */
export function InventoryConfiguration(data) {
  return request({
    url: `${platform}/account/automatic-upload/do-custom-stock`,
    method: 'post',
    data
  })
}
/* shopee工具异仓下架列表 */
export function toolOffLineList(data) {
  return request({
    url: `${platform}/tools/offline/list`,
    method: 'post',
    data
  })
}

/* shopee工具异仓下架添加 */
export function addToolOffLine(data) {
  return request({
    url: `${platform}/tools/offline/add`,
    method: 'post',
    data
  })
}
/* shopee工具下架详情日志 */
export function offlineInfo(params) {
  return request({
    url: `${platform}/tools/offline/info`,
    method: 'get',
    params
  })
}

/* shopee工具优惠券列表 */
export function getVoucherList(params) {
  return request({
    url: `${platform}/tools/coupon/list`,
    method: 'get',
    params
  })
}

/* shopee工具优惠券详情 */
export function getVoucherDetail(params) {
  return request({
    url: `${platform}/tools/coupon/detail`,
    method: 'get',
    params
  })
}

/* shopee工具优惠券创建保存 */
export function voucherAdd(data) {
  return request({
    url: `${platform}/tools/coupon/add`,
    method: 'post',
    data
  })
}

/* shopee工具优惠券创建保存 */
export function voucherAccount(params) {
  return request({
    url: `${platform}/advt/select/authorized-accounts`,
    method: 'get',
    params
  })
}

/* shopee工具优惠券复制保存 */
export function voucherCopy(data) {
  return request({
    url: `${platform}/tools/coupon/copy`,
    method: 'post',
    data
  })
}

/* shopee工具优惠券结束 */
export function voucherEnd(data) {
  return request({
    url: `${platform}/tools/coupon/end`,
    method: 'post',
    data
  })
}

/* shopee工具优惠券结束 */
export function voucherDel(data) {
  return request({
    url: `${platform}/tools/coupon/delete`,
    method: 'post',
    data
  })
}

/* shopee工具优惠券日志 */
export function getVoucherLog(params) {
  return request({
    url: `${platform}/tools/coupon/log`,
    method: 'get',
    params
  })
}
//选品任务列表
export function selectionList(params) {
  return request({
    url: `${platform}/export/selection/list`,
    method: 'get',
    params
  })
}
//选品任务添加
export function selectionAdd(data) {
  return request({
    url: `${platform}/export/selection/add`,
    method: 'post',
    data
  })
}
//错误导出页面列表
export function getadvtList(params) {
  return request({
    url: `${platform}export/advt/list`,
    method: 'get',
    params
  })
}
//错误导出页面添加任务
export function getadvtAdd(data) {
  return request({
    url: `${platform}export/advt/add`,
    method: 'post',
    data
  })
}
