/*
 * shopee router配置表
 */
//import Layout from '@/layout'

const asyncRouterMapShopee = [
  {
    path: '/shopee/advertising/detail/:id/:status',
    component: () => import('@/views/shopee/advertising/detail'),
    name: 'shopee.advertising.detail',
    meta: {
      title: '广告详情',
      icon: 'training',
    },
    hidden: true
  },
  {
    path: '/shopee/instrument/outLineDetail',
    component: () => import('@/views/shopee/instrument/outLineDetail'),
    name: 'shopee.instrument.outLineDetail',
    meta: {
      title: '广告下架',
      icon: 'training',
    },
    hidden: true
  },
  {
    path: '/shopee/instrument/vouchersDetail',
    component: () => import('@/views/shopee/instrument/vouchersDetail'),
    name: 'shopee.instrument.vouchersDetail',
    meta: {
      title: '优惠券',
      icon: 'discount',
    },
    hidden: true
  },
  {
    path: '/shopee/instrument/ActivitiesSelect',
    component: () => import('@/views/shopee/instrument/ActivitiesSelect'),
    name: 'shopee.instrument.ActivitiesSelect',
    meta: {
      title: '活动选品',
      icon: 'discount',
    },
    hidden: true
  }
]
export default asyncRouterMapShopee
