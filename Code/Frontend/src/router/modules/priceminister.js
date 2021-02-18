/*
 * Priceminister router配置表
 */
// const _import = require('./_import_' + process.env.NODE_ENV)
import Layout from '@/layout'

const asyncRouterMapPriceminister = [
  {
    path: '/priceminister/advertising/detail/:id',
    // component: _import('priceminister/advertising/detail'),
    component: () => import('@/views/priceminister/advertising/detail'),
    name: 'priceminister.advertising.detail',
    meta: {
      title: '广告详情',
      icon: 'training',
      permission: 'priceminister.advt.advt.info'
    },
    hidden: true
  }
]

export default asyncRouterMapPriceminister
