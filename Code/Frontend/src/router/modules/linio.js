/*
 * cdiscount router配置表
 */
//import Layout from '@/layout'

const asyncRouterMapLinio = [

  {
    path: '/linio/advertising/detail/:id',
    component: () => import('@/views/linio/advertising/detail'),
    name: 'linio.advertising.detail',
    meta: {
      title: '广告详情',
      icon: 'training',
      permission: 'linio.advt.advt.info'
    },
    hidden: true
  }
]

export default asyncRouterMapLinio
