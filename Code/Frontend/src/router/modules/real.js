/*
 * Real router配置表
 */
// import Layout from '@/layout'
const asyncRouterMapReal = [
  {
    path: '/real/advertising/detail/:id',
    component: () => import('@/views/real/advertising/detail'),
    name: 'real.advertising.detail',
    meta: {
      title: '广告详情',
      icon: 'training',
      permission: 'real.advt.advt.info'
    },
    hidden: true
  }
]
export default asyncRouterMapReal
