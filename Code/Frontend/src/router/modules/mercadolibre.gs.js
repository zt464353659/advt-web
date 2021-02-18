/*
 * mercadolibre router配置表
 */

const asyncRouterMapMercadolibreGS = [
  {
    path: '/mercadolibre/advertising/detail/:id',
    component: () => import('@/views/mercadolibre.gs/advertising/detail'),
    name: 'mercadolibre.advertising.detail',
    meta: {
      title: '广告详情',
      icon: 'training',
      permission: 'mercadolibre.advt.advt.info'
    },
    hidden: true
  }
]
export default asyncRouterMapMercadolibreGS
