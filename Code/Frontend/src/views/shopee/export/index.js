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
  const sheetTile = 'shopee_Long_Title'
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
  const sheetTile = 'shopee_Long_Description'
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
  const sheetTile = 'shopee_upload_files'
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
      const sheetHeader = ['店铺', '产品ID', '保本价', '建议价', '毛利率(%)', '是否是清货产品', '运输方式']
      sheetData.push(sheetHeader)
      item.sheetData.forEach((v, k) => {
        sheetData.push([v.site, v.istore_product_id, v.base_price_formula, v.total_price_formula, v.gross_margin, v.is_clear_stocks, v.shipping_method])
      })
      item.sheetData = sheetData
    } else if (item.sheetName === 'varySuccess') {
      const sheetHeader = ['店铺', 'parent ID', '产品ID', '保本价', '建议价', '毛利率(%)', '是否是清货产品', '运输方式']
      sheetData.push(sheetHeader)
      item.sheetData.forEach((v, k) => {
        sheetData.push([v.site, v.parent_id, v.istore_product_id, v.base_price_formula, v.total_price_formula, v.gross_margin, v.is_clear_stocks, v.shipping_method])
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
  const sheetTile = 'shopee_Price_Calculation'
  // 导出
  xlsxDoubleExport(sheetTile, data)
}

// 数据转换格式导出
export function exportJsonData(istoreData, jsonData) {
  const sheetData = []
  const sheetHeader = [
    '分类ID',
    '产品属性',
    'Parent SKU',
    '*产品标题（必填）',
    '*产品描述（必填）',
    'SKU',
    '变种名称',
    '变种属性名称一',
    '变种属性名称二',
    '变种属性值一',
    '变种属性值二',
    '*价格（必填）',
    '促销价',
    '折扣活动ID',
    '*库存（必填）',
    '*重量(kg)(必填）',
    '*主图（URL）地址（必填）',
    '附图1',
    '附图2',
    '附图3',
    '附图4',
    '附图5',
    '附图6',
    '附图7',
    '附图8',
    '变种图',
    '长(cm)',
    '宽(cm)',
    '高(cm)',
    '发货期',
    '来源URL',
    '尺码图'
  ]
  sheetData.push(sheetHeader)
  let arr = []
  jsonData.forEach((item) => {
    let isVariation = false
    for (let key in item) {
      // 当前json是一个单品
      if (key.indexOf('ps_variation') !== -1) {
        isVariation = true
      }
    }
    // vary
    if (isVariation) {
      const ps_variation = []
      let publicProperty = {}
      let count = 0
      for (let key in item) {
        //属性名中含有variation说明这是一个vari子产品特有属性
        if (key.indexOf('ps_variation') !== -1) {
          count++
        } else {
          //  这是这个vary产品的共有属性
          publicProperty[key] = item[key]
        }
      }
      let varyChild = Math.ceil(count / 4)
      for (let i = 1; i <= varyChild; i++) {
        let varyChildProperty = {}
        for (let key in item) {
          if (key.indexOf(i) !== -1 && key.indexOf('ps_variation ') !== -1) {
            varyChildProperty[key] = item[key]
          }
        }
        ps_variation.push(varyChildProperty) // vary数组
      }
      ps_variation.forEach((item) => {
        const array = Object.assign(item, publicProperty)
        for (let key in item) {
          if (key.indexOf('ps_variation_name') !== -1) {
            item['ps_variation_name'] = item[key]
          }
          if (key.indexOf('ps_variation_price') !== -1) {
            item['ps_price'] = item[key]
          }
          if (key.indexOf('ps_variation_sku') !== -1) {
            item['ps_variation_sku'] = item[key]
          }
          if (key.indexOf('ps_variation_stock') !== -1) {
            item['ps_stock'] = item[key]
          }
        }
        arr.push(item)
        return array
      })
    } else {
      arr.push(item)
    }
  })
  arr.forEach(item => {
    sheetData.push([
      item.ps_category_list_id,
      '',
      item.ps_sku_ref_no_parent,
      item.ps_product_name,
      item.ps_product_description,
      item.ps_variation_sku,
      '',
      '',
      '',
      item.ps_variation_name,
      '',
      item.ps_price,
      '',
      '',
      item.ps_stock,
      item.ps_product_weight,
      item.ps_img_1,
      item.ps_img_2,
      item.ps_img_3,
      item.ps_img_4,
      item.ps_img_5,
      item.ps_img_6,
      item.ps_img_7,
      item.ps_img_8,
      item.ps_img_9,
      '',
      '',
      '',
      '',
      item.ps_days_to_ship,
      '',
      ''
    ])
  })
  const time = new Date()
  const date = time.getFullYear() + '-' + (time.getMonth()+1) + '-' + time.getDate()
  const ws = XLSX.utils.aoa_to_sheet(sheetData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, istoreData.Sheets[istoreData.SheetNames[0]], istoreData.SheetNames[0])
  XLSX.utils.book_append_sheet(wb, ws, '第三方工具模板')
  XLSX.writeFile(wb, `istore数据转换-${date}.xlsx`)
}

/**
 * 导出日销售统计
 */
export function exportDaySales(data) {
  const sheetData = []
  const sheetHeader = ['Product ID', '日期', '平台商品号', '店铺', '浏览量', '点赞量', '销量']
  sheetData.push(sheetHeader)
  data.forEach(item => {
    sheetData.push([item.istore_product_id, item.census_time, item.spu_id, item.account, item.views, item.likes, item.sales])
  })
  if (sheetData.length === 0) {
    showError()
    return false
  }
  const sheetTile = 'shopee_daily_sales_statistics'
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
  const sheetTitle = 'shopee_hot_product'
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
  const sheetHeader = ['shopee目录id', '一级目录', '二级目录', '三级目录', 'LWE是否可运']
  sheetData.push(sheetHeader)
  const sheetTitle = 'shopee_ban_Category_template'
  xlsxExport(sheetTitle, sheetData, true)
}
