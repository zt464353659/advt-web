import Vue from 'vue'
import XLSX from 'xlsx'
import { Message } from 'element-ui'

/**
 * XLSX 导出
 */
const xlsxExport = (tile, data, noDate) => {
  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, tile) // sheetAName is name of Worksheet
  /* generate file and send to client */
  let fileName
  if (!noDate) {
    fileName = tile + '_' + Vue.moment().format('YYYYMMDD') + '.xlsx'
  } else {
    fileName = tile + '.xlsx'
  }
  XLSX.writeFile(wb, fileName)
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

/* 下载模板 */
export function downloadTemplate() {
  const sheetData = []
  const sheetHeader = ['product_id', 'total_price', 'discount']
  sheetData.push(sheetHeader)
  const sheetTitle = 'cdiscount_product_template'
  xlsxExport(sheetTitle, sheetData, true)
}

/* 导出执行错误信息 */
export function exportErrorMessgae(info, data) {
  const sheetData = []
  const sheetHeader = ['product_id', '原价', '折扣率(%)', '折后价', '执行结果', '失败原因']
  sheetData.push(sheetHeader)
  data.forEach((v, k) => {
    sheetData.push([
      v.product_id,
      v.total_price,
      v.discount,
      v.discount_price,
      v.status,
      v.message])
  })
  if (sheetData.length === 0) {
    showError()
    return false
  }
  // 文件命名取促销活动名称+账号+下载日期
  const sheetTile = info.sale_name + '_' + info.account
  console.log(sheetTile, sheetData)
  // 导出
  xlsxExport(sheetTile, sheetData)
}
