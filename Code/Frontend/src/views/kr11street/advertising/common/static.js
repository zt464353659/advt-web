const advertStatic = {
  // 广告状态
  productStatusCode: {
    'BEFORE_DRAPT_CODE': 90, // before draft状态
    'DRAPT_CODE': 100, // draft状态
    'UPLOAD_ERROR_CODE': 1004, // upload error
    'BEFORE_AUTHORIAZATION_CODE': 102, // before authoriazation状态
    'ONSALE_CODE': 103, // on sale状态
    'UPDATE_ERROR_CODE': 1003, // updadt error状态
    'TITLE_REPETITION_CODE': 1001, // title repetition状态
    'STOP_DISPLAY_CODE': 105, // Stop Display状态
    'LIVEN_CODE': 1002 // liveN状态
  },
  // 权限
  permissions: {
    soldOut: 'kr11street.advt.delete-platform-advt.sold-out', // 下架
    advtDelete: 'kr11street.advt.advt.advt-delete', // 删除
    info: 'kr11street.advt.advt.info', // 详情
    setTagPrice: 'kr11street.advt.tag-price.set-tag-price', // 设置指定吊牌价
    cancelTagPrice: 'kr11street.advt.tag-price.cancel-tag-price', // 取消指定吊牌价
    setStock: 'kr11street.advt.custom-stock.set-custom-stock', // 设置指定库存
    stockOut: 'kr11street.advt.custom-stock.cancel-custom-stock', // 取消指定库存
    updateTitle: 'kr11street.advt.advt.update-title', // 广告编辑
    sendToDraft: 'kr11street.advt.create-advt.update-state', // send to draft
    exportPart: 'kr11street.advt.advt.export-product', // 导出
    deleteAll: 'kr11street.advt.delete-status-all.delete', // 全量删除广告
    setProductPrice: 'kr11street.advt.tag-price.set-custom-price', // 设置指定价
    cancleProductPrice: 'kr11street.advt.tag-price.un-set-custom-price', // 取消指定价
    draft: 'kr11street.advt.advt.priority-push', // 优先推送
    // 跟卖监控
    setFellow: 'kr11street.advt.follow.set-fellow', // 添加任务
    updateFellow: 'kr11street.advt.follow.update-fellow', // 修改任务
    onOffFellow: 'kr11street.advt.follow.on-off-fellow', // 跟卖开关（是否启用）
    followLog: 'kr11street.advt.follow.follow-log' // 日志按钮
  }
}

module.exports = advertStatic
