/*
 * coupang router配置表
 */
const platform = 'coupang' // coupang
import Layout from '@/layout'

const asyncRouterMapCoupang = [
  {
    path: '/coupang/advertising/detail/:id/:showBtn/:state',
    component: () => import('@/views/coupang/advertising/detail'),
    name: 'coupang.advertising.detail',
    meta: {
      title: '广告详情',
      icon: 'training',
      permission: platform + '.advt.advt.info'
    },
    hidden: true
  }
]
export default asyncRouterMapCoupang
