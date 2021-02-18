import Vue from 'vue'
import XLSX from 'xlsx'
import { MessageBox, Message } from 'element-ui'

/**
 * 批量处理结果弹出框
 */
export function resultAlert(res, nextFun) {
  const msg = { text: '', status: false }
  Vue._.forEach(res.data, item => {
    if (item.status) {
      msg.text += `<i class="el-icon-success" style="color:#67c23a"></i>`
      msg.status = true
    } else {
      msg.text += `<i class="el-icon-error" style="color:#f56c6c"></i>`
    }
    msg.text += `<span style="padding-left:10px">${item.message}</span><br/>`
  })
  MessageBox.alert(msg.text, '执行结果', {
    confirmButtonText: '确定',
    dangerouslyUseHTMLString: true,
    callback: action => {
      if (nextFun) {
        nextFun(msg.status)
      }
      document.body.classList.remove('el-popup-parent--hidden')
    }
  })
}

/**
 * 统计string中字节数
 */
export function countStrToBit(str) {
  let count = 0
  const arr = str.split('')
  arr.forEach(item => {
    count += Math.ceil(item.charCodeAt().toString(2).length / 8)
  })
  return count
}

/**
 * XLSX 导出
 */
const xlsxExport = (tile, data) => {
  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, tile) // sheetAName is name of Worksheet
  /* generate file and send to client */
  const fileName = tile + '-' + Vue.moment().format('YYYYMMDD') + '.xlsx'
  XLSX.writeFile(wb, fileName)
}

/**
 * 数据异常提示
 */
const showError = () => {
  MessageBox({
    message: '数据异常请重新导出',
    type: 'warning'
  })
}

/**
 * 导出format
 */
export function exportFormat(data) {
  const sheetData = []
  const sheetHeader = ['istore_product_id', 'site_code', 'product_name']
  sheetData.push(sheetHeader)
  data.forEach((v, k) => {
    // const dataKey =
    sheetData.push([v.istore_product_id, v.site_code, v.product_name])
  })
  if (sheetData.length === 0) {
    showError()
    return false
  }
  const sheetTile = '自动下架的广告'
  // 导出
  xlsxExport(sheetTile, sheetData)
}

/**
 * kr11street excel导出后续工作
 */
export function fllowUpExcel(response) {
  if (response.data.length === 0) {
    Message({
      message: '数据异常请重新导出',
      type: 'warning'
    })
  } else {
    Message({
      message: '正在导出请耐心等待',
      type: 'info'
    })
    exportFormat(response.data)
  }
}
