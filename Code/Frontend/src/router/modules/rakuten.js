/* rakuten router config */
//import Layout from '@/layout'

const asyncRouterMapRakuten = [
  {
    path: '/rakuten/advertising/detail/:id',
    component: () => import('@/views/rakuten/advertising/detail'),
    name: 'rakuten.advertising.detail',
    meta: {
      title: '广告详情',
      icon: 'training',
      permission: 'rakuten.advt.advt.info'
    },
    hidden: true
  }
]

export default asyncRouterMapRakuten
