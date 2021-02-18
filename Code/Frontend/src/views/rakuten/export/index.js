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
 * 产品计划导出
 */

export function exportPlanList(data) {
  const sheetData = []
  // 账号、创建时间、istore product ID、执行状态、执行结果
  const sheetHeader = ['账号', 'iStore Product ID', 'vary ID', '执行状态', '执行结果','操作人', '创建时间']
  sheetData.push(sheetHeader)
  data.forEach((v, k) => {
    sheetData.push([v.account_name, v.istore_product_id, v.vary_id, v.status_label, v.result, v.name, v.create_time])
  })
  if (sheetData.length === 0) {
    showError()
    return false
  }
  const sheetTile = 'rakuten-plan'
  // 导出
  xlsxExport(sheetTile, sheetData)
}
// 根据表头生成模板
export function downloadExcelTemplate(title,sheetHeader) {
  const sheetData = [sheetHeader]
  xlsxExport(title, sheetData)
}
