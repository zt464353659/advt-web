/*
 * blibli router配置表
 */
import Layout from '@/layout'

const asyncRouterMapblibli = [
  {
    path: '/blibli/advertising/detail/:id',
    component: () => import('@/views/blibli/advertising/detail'),
    name: 'blibli.advertising.detail',
    meta: {
      title: '广告详情',
      icon: 'training',
      permission: 'blibli.advt.advt.info'
    },
    hidden: true
  }
]
export default asyncRouterMapblibli
