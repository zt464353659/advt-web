/*
 * b2w router配置表
 */
import Layout from '@/layout'
const asyncRouterMapRuedu = [
  {
    path: '/ruedu/advertising/detail/:id/:status',
    component: () => import('@/views/ruedu/advertising/detail'),
    name: 'ruedu.advertising.detail',
    meta: {
      title: '广告详情',
      icon: 'training',
      permission: 'ruedu.advt.advt.info'
    },
    hidden: true
  },
  {
    path: '/ruedu/noUpdate/detail/:id/:end_time',
    component: () => import('@/views/ruedu/noUpdate/detail'),
    name: 'ruedu.noUpdate.detail',
    meta: {
      title: '更新设置详情',
      icon: 'training',
      permission: 'ruedu.advt.advt.info'
    },
    hidden: true
  }
]
export default asyncRouterMapRuedu
