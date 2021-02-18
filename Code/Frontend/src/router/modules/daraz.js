/*
 * cdiscount router配置表
 */
//import Layout from '@/layout'

const asyncRouterMapDhgate = [
  {
    path: '/daraz/advertising/detail/:id',
    component: () => import('@/views/daraz/advertising/detail'),
    name: 'daraz.advertising.detail',
    meta: {
      title: '广告详情',
      icon: 'training',
      permission: 'daraz.advt.advt.info'
    },
    hidden: true
  }
]

export default asyncRouterMapDhgate
