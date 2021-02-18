//import Layout from '@/layout'

const asyncRouterMapNewegg = [
        {
          path: '/newegg/advertising/detail/:id',
          component: () => import('@/views/newegg/advertising/detail'),
          name: 'newegg.advertising.detail',
          meta: {
            title: '广告详情',
            icon: 'training',
            permission: 'newegg.advt.advt.info'
          },
          hidden: true
        }
]
export default asyncRouterMapNewegg
