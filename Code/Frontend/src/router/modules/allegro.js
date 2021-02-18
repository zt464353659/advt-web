/*
 * allegro router配置表
 */
import Layout from '@/layout'

const asyncRouterMapAllegro = [
  {
    path: '/allegro/advertising/detail/:id/:status',
    component: () => import('@/views/allegro/advertising/detail'),
    name: 'allegro.advertising.detail',
    meta: {
      title: '广告详情',
      icon: 'training',
      permission: 'allegro.advt.advt.info'
    },
    hidden: true
  }
]
export default asyncRouterMapAllegro
