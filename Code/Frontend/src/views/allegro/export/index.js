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
 * 导出长标题
 */
export function exportLongTile(data) {
  const sheetData = []
  const sheetHeader = ['ID', 'Site Code', 'Account', 'Account ID', 'Advt ID', 'Item Line Name', 'Item Line ID', 'Istore Product Id', 'Info', 'Length Limit']
  sheetData.push(sheetHeader)
  data.forEach((v, k) => {
    sheetData.push([v.id, v.site_code, v.account, v.account_id, v.advt_id, v.item_line_name, v.item_line_id, v.istore_product_id, v.info, v.length_limit])
  })
  if (sheetData.length === 0) {
    showError()
    return false
  }
  const sheetTile = 'allrgro_Long_Title'
  // 导出
  xlsxExport(sheetTile, sheetData)
}

/**
 * 导出长描述
 */
export function exportLongDescription(data) {
  const sheetData = []
  const sheetHeader = ['ID', 'Site Code', 'Account', 'Account ID', 'Advt ID', 'Item Line Name', 'Item Line ID', 'Istore Product Id', 'Info', 'Length Limit']
  sheetData.push(sheetHeader)
  data.forEach((v, k) => {
    sheetData.push([v.id, v.site_code, v.account, v.account_id, v.advt_id, v.item_line_name, v.item_line_id, v.istore_product_id, v.info, v.length_limit])
  })
  if (sheetData.length === 0) {
    showError()
    return false
  }
  const sheetTile = 'allrgro_Long_Description'
  // 导出
  xlsxExport(sheetTile, sheetData)
}

/**
 * 导出format
 */
export function exportFormat(data) {
  const sheetData = []
  const forHeader = []
  for (let i = 1; i < 21; i++) {
    forHeader.push(`ps_variation ${i} ps_variation_sku`)
    forHeader.push(`ps_variation ${i} ps_variation_name`)
    forHeader.push(`ps_variation ${i} ps_variation_price`)
    forHeader.push(`ps_variation ${i} ps_variation_stock`)
  }
  for (let i = 1; i < 10; i++) {
    forHeader.push(`ps_img_${i}`)
  }
  const sheetHeader = [
    'ps_category_list_id', 'ps_product_name', 'ps_product_description', 'ps_price', 'ps_stock', 'ps_product_weight', 'ps_days_to_ship', 'ps_sku_ref_no_parent',
    'ps_mass_upload_variation_help'
  ]
  sheetHeader.push(...forHeader, 'fail_message')
  sheetData.push(sheetHeader)
  data.forEach((v, k) => {
    const dataKey = [v.Category_ID, v.Product_Name, v.Product_Description, v.Price, v.Stock, v.Product_Weight, v.Ship_out_in, v.Parent_SKU_Reference_No, v.empty_one]
    for (let i = 1; i < 21; i++) {
      dataKey.push(v[`SKU_Ref_No${i}`])
      dataKey.push(v[`Name${i}`])
      dataKey.push(v[`Price${i}`])
      dataKey.push(v[`Stock${i}`])
    }
    for (let i = 1; i < 10; i++) {
      dataKey.push(v[`image${i}`])
    }
    dataKey.push(v.fail_message)
    sheetData.push(dataKey)
  })
  if (sheetData.length === 0) {
    showError()
    return false
  }
  const sheetTile = 'allrgro_upload_files'
  // 导出
  xlsxExport(sheetTile, sheetData)
}

/**
 * XLSX 多表导出
 */
const xlsxDoubleExport = (tile, data) => {
  const wb = XLSX.utils.book_new()
  data.forEach(item => {
    const ws = XLSX.utils.aoa_to_sheet(item.sheetData)
    XLSX.utils.book_append_sheet(wb, ws, item.sheetName) // sheetAName is name of Worksheet
    /* generate file and send to client */
  })
  const fileName = tile + '_' + Vue.moment().format('YYYYMMDD') + '.xlsx'
  XLSX.writeFile(wb, fileName)
}

/**
 * 导出价格测算
 */
export function exportPriceCalculation(data) {
  data.forEach(item => {
    const sheetData = []
    if (item.sheetName === 'singleSuccess') {
      const sheetHeader = ['店铺', '产品ID', '保本价', '建议价', '是否是清货产品', '运输方式']
      sheetData.push(sheetHeader)
      item.sheetData.forEach((v, k) => {
        sheetData.push([v.site, v.istore_product_id, v.base_price_formula, v.total_price_formula, v.is_clear_stocks, v.shipping_method])
      })
      item.sheetData = sheetData
    } else if (item.sheetName === 'varySuccess') {
      const sheetHeader = ['店铺', 'parent ID', '产品ID', '保本价', '建议价', '是否是清货产品', '运输方式']
      sheetData.push(sheetHeader)
      item.sheetData.forEach((v, k) => {
        sheetData.push([v.site, v.parent_id, v.istore_product_id, v.base_price_formula, v.total_price_formula, v.is_clear_stocks, v.shipping_method])
      })
      item.sheetData = sheetData
    } else {
      const sheetHeader = ['店铺', '产品ID', '失败原因']
      sheetData.push(sheetHeader)
      item.sheetData.forEach((v, k) => {
        sheetData.push([v.site, v.istore_product_id, v.fail_reason])
      })
      item.sheetData = sheetData
    }
  })
  const sheetTile = 'allrgro_Price_Calculation'
  // 导出
  xlsxDoubleExport(sheetTile, data)
}

/**
 * 导出产品id查询结果
 */
export function exportDaySales(data) {
  const sheetData = []
  const sheetHeader = ['Product ID', '平台商品号']
  sheetData.push(sheetHeader)
  data.forEach(item => {
    sheetData.push([item.istore_product_id, item.spu_id])
  })
  if (sheetData.length === 0) {
    showError()
    return false
  }
  const sheetTile = 'allegro_product_id'
  // 导出
  xlsxExport(sheetTile, sheetData)
}

/**
 * 导出热销品format
 */
export function exportFormatHotbrand(data) {
  data.forEach(item => {
    const sheetData = []
    const sheetHeader = ['链接地址', '站点', '类目', '折后价', '主图(图片URL地址)', '标题']
    sheetData.push(sheetHeader)
    item.sheetData.forEach((v, k) => {
      sheetData.push([v.url, v.site, v.categories, v.price, v.image, v.name])
    })
    item.sheetData = sheetData
  })
  const sheetTitle = 'allrgro_hot_product'
  // 导出
  const _data = []
  // xlsxDoubleExport(sheetTitle, data)
  // console.log(data)
  if (data[0].sheetData.length > 1 && data[1].sheetData.length > 1) {
    xlsxDoubleExport(sheetTitle, data)
  } else if (data[1].sheetData.length === 1) {
    _data.push(data[0])
    xlsxDoubleExport(sheetTitle, _data)
  } else if (data[0].sheetData.length === 1) {
    _data.push(data[1])
    xlsxDoubleExport(sheetTitle, _data)
  }
}

// 导出模板
export function exportTemplate() {
  const sheetData = []
  const sheetHeader = ['allrgro目录id', '一级目录', '二级目录', '三级目录', 'LWE是否可运']
  sheetData.push(sheetHeader)
  const sheetTitle = 'allrgro_ban_Category_template'
  xlsxExport(sheetTitle, sheetData, true)
}
