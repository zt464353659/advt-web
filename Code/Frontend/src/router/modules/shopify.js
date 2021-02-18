/*
 * shopify router配置表
 */
import Layout from '@/layout'

const asyncRouterMapShopify = [
  {
    path: '/shopify/advertising/detail/:id',
    component: () => import('@/views/shopify/advertising/detail'),
    name: 'shopify.advertising.detail',
    meta: {
      title: '广告详情',
      icon: 'training',
      permission: 'shopify.advt.advt.info'
    },
    hidden: true
  }
]

export default asyncRouterMapShopify
