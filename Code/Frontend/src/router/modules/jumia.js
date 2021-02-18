/*
 * cdiscount router配置表
 */
import Layout from '@/layout'

const asyncRouterMapJumia = [
  {
    path: '/jumia/advertising/detail/:id',
    component: () => import('@/views/jumia/advertising/detail'),
    name: 'jumia.advertising.detail',
    meta: {
      title: '广告详情',
      icon: 'training',
      permission: 'jumia.advt.advt.info'
    },
    hidden: true
  }
]
export default asyncRouterMapJumia
