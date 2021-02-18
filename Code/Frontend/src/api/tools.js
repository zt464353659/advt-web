import request from '@/utils/request'

const platform = '/tools-new'

// 获取所有平台
export function fetchPlatform() {
  return request({
    url: platform + `/price-tools/price-calculation/platform-list`,
    method: 'get'
  })
}

// 获取平台账号
export function getPlatformAccount(name) {
  return request({
    url: `${platform}/price-tools/price-calculation/account-list?platform=${name}`,
    method: 'get'
  })
}

// 获取价格测算数据
export function fetchExportPriceCalc(data) {
  return request({
    url: platform + `/price-tools/price-calculation/do-calculation`,
    method: 'post',
    data
  })
}
