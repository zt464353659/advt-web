const status_code = {
  'DRAPT_CODE': 100,
  'HANDLING': 110,
  'SUCCESS': 120,
  'FALSE': 130,
  'ONLINE': 150,
  'SAVEFALSE': 160,
  'DELETE': 170
}
const permissions = {
  info: 'shopline.advt.advt.info', // 详情
  soldOut: 'shopline.advt.delete-platform-advt.execute', // 下架
  // upperShelf: 'priceminister.advt.advt.upper-shelf' // 上架
  edit: 'shopline.advt.advt.edit', // 编辑
  customSetPrice: 'shopline.advt.advt.custom-price',
  customSetStock: 'shopline.advt.advt.custom-stock'
}

module.exports = {
  status_code,
  permissions
}
