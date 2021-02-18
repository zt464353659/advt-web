//import Layout from '@/layout'

const asyncRouterMapTiki = [
  {
    path: '/tiki/advertising/detail/:id',
    component: () => import('@/views/tiki/advertising/detail'),
    name: 'tiki.advertising.detail',
    meta: {
      title: '广告详情',
      icon: 'training',
      permission: 'tiki.advt.advt.info'
    },
    hidden: true
  }
]
export default asyncRouterMapTiki
