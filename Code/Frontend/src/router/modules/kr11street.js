/*
 * kr11street router配置表
 */
import Layout from '@/layout'

const asyncRouterMapKr11street = [
  {
    path: '/kr11street/advertising/detail/:id',
    component: () => import('@/views/kr11street/advertising/detail'),
    name: 'kr11street.advertising.detail',
    meta: {
      title: '广告详情',
      icon: 'training',
      permission: 'kr11street.advt.advt.info'
    },
    hidden: true
  }
]
export default asyncRouterMapKr11street
