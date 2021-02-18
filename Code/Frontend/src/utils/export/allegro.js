import Vue from 'vue'
import XLSX from 'xlsx'
import { Message } from 'element-ui'

/**
 * XLSX 导出
 */
const xlsxExport = (tile, data) => {
  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, tile) // sheetAName is name of Worksheet
  /* generate file and send to client */
  const fileName = tile + Vue.moment().format('YYYYMMDD') + '.xlsx'
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

/**
 * 导出长标题
 */
export function exportLongTile(data) {
  const sheetData = []
  const sheetHeader = ['category_id', 'category_full_name', 'attribute_id', 'attribute_name', 'attribute_type', 'attribute_value_id', 'attribute_value']
  sheetData.push(sheetHeader)
  data.forEach((v, k) => {
    sheetData.push([v.category_id, v.category_full_name, v.attribute_id, v.attribute_name, v.attribute_type, v.attribute_value_id, v.attribute_value])
  })
  if (sheetData.length === 0) {
    showError()
    return false
  }
  const sheetTile = 'allegro_parameters_'
  // 导出
  xlsxExport(sheetTile, sheetData)
}
