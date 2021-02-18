const advertStatic = {
  PRODUCT_STATUS_CODE: {
    'DRAPT_CODE': 100,
    'NORMAL': 110,
    'SHELVED': 'shelved',
    'WAIT_SHELVE': 120,
    'UPLOAD_ERROR': 140,
    'MANUAL_CANCELLED': 160,
    'CANCEL_ERROR': 170,
    'PENDING': 999,
    'OUT_OF_STOCK': 130
  },
  permissions: {
    info: 'priceminister.advt.advt.info', // 详情
    soldOut: 'priceminister.advt.delete-platform-advt.execute', // 下架
    upperShelf: 'priceminister.advt.advt.upper-shelf', // 上架
    sendToDraft: 'priceminister.advt.advt.pending-to-draft',
    edits: 'priceminister.advt.advt.edit',
    pendingList: 'priceminister.advt.advt.pending-list',
    customSetPrice: 'priceminister.advt.advt.custom-price',
    customSetStock: 'priceminister.advt.advt.custom-stock',
    log: 'priceminister.advt.advt.change-log',
      //跟卖
    advtPriceManage_followAdd:"priceminister.advt.follow.add",//添加任务
    advtPriceManage_followEnable:"priceminister.advt.follow.enable",//启用禁用
    advtPriceManage_followUpdate:"priceminister.advt.follow.update",//编辑
    advtPriceManage_followLog:"priceminister.advt.follow.log",//日志
  }
}

module.exports = advertStatic
