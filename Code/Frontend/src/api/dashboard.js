import request from '@/utils/request'
const newPlatform = '-new'

export function getStatisticDataRequest(query) {
  return request({
    url: '/eleven-street/advt/TotalDataCount',
    method: 'get',
    params: {}
  })
}

export function getChartsData(platform) {
  return request({
    url: '/' + platform.toLowerCase() + newPlatform + '/advt/chart/get',
    method: 'get'
  })
}
