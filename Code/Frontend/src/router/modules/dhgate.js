/*
 * cdiscount router配置表
 */
//import Layout from '@/layout'

const asyncRouterMapDhgate = [
  {
    path: '/dhgate/advertising/detail/:id',
    component: () => import('@/views/dhgate/advertising/detail'),
    name: 'dhgate.advertising.detail',
    meta: {
      title: '广告详情',
      icon: 'training',
      permission: 'dhgate.advt.advt.info'
    },
    hidden: true
  }
]
export default asyncRouterMapDhgate
