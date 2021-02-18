/*
 * b2w router配置表
 */
//import Layout from '@/layout'

const asyncRouterMapB2w = [
  {
    path: '/b2w/advertising/detail/:id',
    component: () => import('@/views/b2w/advertising/detail'),
    name: 'b2w.advertising.detail',
    meta: {
      title: '广告详情',
      icon: 'training',
      permission: 'b2w.advt-management.advt-management.advt-info'
    },
    hidden: true
  }
]

export default asyncRouterMapB2w
