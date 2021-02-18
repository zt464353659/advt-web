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

/**
 * XLSX 多表导出
 */
const xlsxDoubleExport = (title, data) => {
  const wb = XLSX.utils.book_new()
  data.forEach(item => {
    const ws = XLSX.utils.aoa_to_sheet(item.sheetData)
    XLSX.utils.book_append_sheet(wb, ws, item.sheetName) // sheetAName is name of Worksheet
    /* generate file and send to client */
  })
  const fileName = title + '_' + Vue.moment().format('YYYYMMDD') + '.xlsx'
  XLSX.writeFile(wb, fileName)
}

/**
 * 导出价格测算
 */
export function exportPriceCalc(platform,selectItem,data) {
  data.forEach(item => {
    const sheetData = []
    if (item.sheetName === 'success') {

      // 导出成功根据可选项生成表头
      const obj = {
        platform: '平台',
        site: '账号',
        istore_product_id: '产品ID',
        total_price: '价格',
        base_price: '保本价',
        gross_margin: '毛利率(%)',
        commission: '佣金率(%)',
        shipping_costs: `运费(${item.sheetData[0].currency_code})`,
        shipping_method: '运输方式',
        parcel_processing_fee: '打包费(CNY)'
      }

      // 导出成功根据可选项生成表头
      const sheetHeader = []
      selectItem.map(v => {
        if(Object.keys(obj).includes(v)){
          sheetHeader.push(obj[v])
        }
      })
      sheetData.push(sheetHeader)
      item.sheetData.forEach((v, k) => {
          let arr = []
        selectItem.forEach(v1 => {
            arr.push(v[v1])
          })
          sheetData.push(arr)
      })
      item.sheetData = sheetData
    } else {
      const sheetHeader = ['平台','账号', '产品ID', '失败原因']
      sheetData.push(sheetHeader)
      item.sheetData.forEach((v, k) => {
        sheetData.push([v.platform,v.site, v.istore_product_id, v.fail_reason])
      })
      item.sheetData = sheetData
    }
  })
  const sheetTitle = `${platform}_Price_Calculation`
  // 导出
  xlsxDoubleExport(sheetTitle, data, 'date')
}

