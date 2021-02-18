import Vue from 'vue'
import XLSX from 'xlsx'
import { Message } from 'element-ui'

/**
 * XLSX 导出
 */
const xlsxExport = (tile, data) => {
  try {
    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, tile) // sheetAName is name of Worksheet
    /* generate file and send to client */
    const fileName = tile + '-' + Vue.moment().format('YYYYMMDDHHmm') + '.xlsx'
    XLSX.writeFile(wb, fileName)
    Message({
      message: '导出成功',
      type: 'success'
    })
  } catch (err) {
    Message({
      message: '导出失败',
      type: 'warning'
    })
  }
}

/**
 * 数据异常提示
 */
const showError = () => {
  Message({
    message: '数据异常请重新导出',
    type: 'warning'
  })
}

/**
 * 导出 published status
 */

export function exportPublishedStatus(data) {
  const sheetData = []
  const sheetHeader = ['Site Code', '国家', 'Product ID', 'Vary ID', '目录ID', '平台商品号', '前台编码', '广告状态', '价格类型', '当前销售价', '当前毛利率', 'iStore价格', '指定价', '指定毛利率', '库存', '是否指定库存', '指定库存', '最近7天销量', '最近30天销量', '最近60天销量']
  sheetData.push(sheetHeader)
  data.forEach((v, k) => {
    sheetData.push([v.account_name, v.site_id, v.istore_product_id, v.istore_parent_product_id, v.category_id, v.cbt_id, v.platform_item_id, v.status, v.price_type, v.current_price, v.current_gross_margin, v.discount_price, v.custom_price, v.custom_gross_margin, v.quantity, v.is_custom_quantity, v.custom_quantity, v.sold_quantity_7, v.sold_quantity_30, v.sold_quantity_60])
  })
  if (sheetData.length === 0) {
    showError()
    return false
  }
  const sheetTile = 'Mercadolibre'
  // 导出
  xlsxExport(sheetTile, sheetData)
}

/**
 * 设置、取消 指定价模板
 */
export function downloadCustomPriceTemplate(title, sheetTitle) {
  const sheetData = []
  sheetData.push(sheetTitle)
  try {
    const ws = XLSX.utils.aoa_to_sheet(sheetData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, fileName)
    const fileName = title + '.xlsx'
    XLSX.writeFile(wb, fileName)
    Message({
      message: '下载模板成功',
      type: 'success'
    })
  } catch (err) {
    Message({
      message: '下载模板失败',
      type: 'warning'
    })
  }
}
