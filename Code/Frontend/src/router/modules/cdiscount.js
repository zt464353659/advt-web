/*
 * cdiscount router配置表
 */
import Layout from '@/layout'

const asyncRouterMapCdiscount = [
  {
    path: '/cdiscount/advertising/detail/:id/:edit/:status',
    component: () => import('@/views/cdiscount/advertising/detail'),
    name: 'cdiscount.advertising.detail',
    meta: {
      title: '广告详情',
      icon: 'training',
      permission: 'cdiscount.advt.advt.detail'
    },
    hidden: true
  },
  {
    path: '/cdiscount/promotion/detail/:salename/:saleId/:status/:time',
    component: () => import('@/views/cdiscount/promotion/detail'),
    name: 'cdiscount.promotion.detail',
    meta: {
      title: '活动广告列表',
      icon: 'training',
      permission: 'cdiscount.advt.advt.detail'
    },
    hidden: true
  }
]


export default asyncRouterMapCdiscount
