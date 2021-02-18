import XLSX from 'xlsx'
import { Message } from 'element-ui'

/**
 * 下载模板
 */
export function downloadTemplate(title, sheetTitle) {
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

