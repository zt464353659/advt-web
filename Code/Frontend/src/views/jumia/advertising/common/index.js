import { MessageBox, Message } from 'element-ui'
import Vue from 'vue'
import XLSX from 'xlsx'


/**
 * XLSX 导出
 */
const xlsxExport = (tile, data) => {
  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, tile) // sheetAName is name of Worksheet
  /* generate file and send to client */
  const fileName = tile + Vue.moment().format('YYYYMMDD') + '.csv'
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
 * 导出长标题（错误导出）
 */
export function exportLongTile(data) {
  const sheetData = []
  const sheetHeader = ['site_code', 'istore_product_id', 'push_fail_msg', 'update_time']
  sheetData.push(sheetHeader)
  data.forEach((v, k) => {
    sheetData.push([v.site_code, v.istore_product_id, v.push_fail_msg, v.update_time])
  })
  if (sheetData.length === 0) {
    showError()
    return false
  }
  const sheetTile = 'jumia_parameters_'
  // 导出
  xlsxExport(sheetTile, sheetData)
}


//提示
export function alertMessage(res) {
  if (res.data.fail.length) {
    let str = ''
    res.data.fail.forEach(item => {
      str += `<div>product id: ${item.product_id}: ${item.message}</div>`
    })
    MessageBox({
      title: '提示',
      message: str,
      dangerouslyUseHTMLString: true,
      type: 'error'
    })
  } else {
    Message({
      type: 'success',
      message: res.message
    })
  }
}
//提示
export function resultAlert(res, nextFun) {
  const msg = { text: '', status: false }
  const list = res.length ? res : res.data
  Vue._.forEach(list, item => {
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
    customClass:"resultAlertcss",
    callback: action => {
      if (nextFun) {
        nextFun(msg.status)
      }
      document.body.classList.remove('el-popup-parent--hidden')
    }
  })
}



//在线导出
/**
 * 导出长标题（错误导出）
 */
export function ActiveexportLongTile(data) {
  const sheetData = []
  const sheetHeader = ['Product ID', '产品ID', 'Shop Sku', '产品名称', '一级目录名', '目录树', 'Site Code', '产品线', '7天销量', '30天销量', '60天销量', '刊登时间', '当前销售价', '当前毛利率', '库存']
  sheetData.push(sheetHeader)
  data.forEach((v, k) => {
    sheetData.push([v.parent_istore_product_id, v.istore_product_id, v.shop_sku, v.product_name, v.category_level_1, v.category, v.site_code, v.product_line_name, v.sold_quantity_7, v.sold_quantity_30, v.sold_quantity_60, v.publish_time, v.current_price, v.current_gross_margin, v.current_quantity])
  })
  if (sheetData.length === 0) {
    showError()
    return false
  }
  const sheetTile = 'jumia_Active'
  // 导出
  xlsxExport(sheetTile, sheetData)
}
