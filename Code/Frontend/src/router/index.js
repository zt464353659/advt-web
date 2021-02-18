import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'
import Layout from '@/layout'
import { routerConfig } from './config'
import asyncRouterMapKr11street from './modules/kr11street'
import asyncRouterMapCoupang from './modules/coupang'
import asyncRouterMapPriceminister from './modules/priceminister'
import asyncRouterMapCdiscount from './modules/cdiscount'
import asyncRouterMapReal from './modules/real'
import asyncRouterMapDaraz from './modules/daraz'
import asyncRouterMapDhgate from './modules/dhgate'
import asyncRouterMapLinio from './modules/linio'
import asyncRouterMapMercadolibre from './modules/mercadolibre.gs'
import asyncRouterMapNewegg from './modules/newegg'
import asyncRouterMapRakuten from './modules/rakuten'
import asyncRouterMapTiki from './modules/tiki'
import asyncRouterMapShopee from './modules/shopee'
import asyncRouterMapB2w from './modules/b2w'
import asyncRouterMapAllegro from './modules/allegro'
import asyncRouterMapblibli from './modules/blibli'
import asyncRouterMapJumia from './modules/jumia'
import asyncRouterMapRuedu from './modules/ruedu'
import asyncRouterMapShopify from './modules/shopify'


Vue.use(Router)

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRouterMap
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const routerMap = {
  'tools': () => import('@/views/tools/calcPrice')
}
export const constantRouterMap = [
  {
    path: '/login',
    component: () => import('@/views/login'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/errorPage/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/errorPage/401'),
    hidden: true
  },
  {
    path: '/system',
    component: Layout,
    // alwaysShow: false,
    children: [
      {
        path: 'system',
        name: 'system',
        // component: () => import('@/views/dashboard'),
        meta: {
          title: '系统导航',
          icon: 'router',
          affix: true,
          click: true,
        }
      }]
  },
  {
    path: '/',
    component: Layout,
    alwaysShow: false,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard'),
        meta: {
          title: '首页',
          icon: 'dashboard',
          affix: true
        }
      }]
  }
  // 404 page must be placed at the end !!!
]

export const asyncRouterMap = {}
const createRouter = () => new Router({
  mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

if (routerConfig) {
  setTimeout(() => {
    if (routerConfig['kr11street']) {
      store.dispatch('platform/addPlatform', 'kr11street')
      asyncRouterMap['kr11street'] = asyncRouterMapKr11street
      routerMap['kr11street.advertising'] = () => import('@/views/kr11street/advertising')
      routerMap['kr11street.plan'] = () => import('@/views/kr11street/plan')
      routerMap['kr11street.pullConfig'] = () => import('@/views/kr11street/pullConfig')
      routerMap['kr11street.noUpdate'] = () => import('@/views/kr11street/noUpdate')
      routerMap['kr11street.advtPriceManage'] = () => import('@/views/kr11street/advtPriceManage')
    }
    if (routerConfig['coupang']) {
      store.dispatch('platform/addPlatform', 'coupang')
      asyncRouterMap['coupang'] = asyncRouterMapCoupang
      routerMap['coupang.advertising'] = () => import('@/views/coupang/advertising')
      routerMap['coupang.plan'] = () => import('@/views/coupang/plan')
      routerMap['coupang.watchFollow'] = () => import('@/views/coupang/watchFollow')
      routerMap['coupang.adPullConfiguration'] = () => import('@/views/coupang/adPullConfiguration')
      routerMap['coupang.advtConfiguration'] = () => import('@/views/coupang/advtConfiguration')
    }
    if (routerConfig['priceminister']) {
      // store.dispatch('platform/addPlatform', 'priceminister')
      asyncRouterMap['priceminister'] = asyncRouterMapPriceminister
      routerMap['priceminister.advertising'] = () => import('@/views/priceminister/advertising')
      routerMap['priceminister.plan'] = () => import('@/views/priceminister/plan')
      routerMap['priceminister.account'] = () => import('@/views/priceminister/account')
      //routerMap['priceminister.price.monitor'] = () => import('@/views/priceminister/priceMonitor')
      routerMap['priceminister.follow.list'] = () => import('@/views/priceminister/advtPriceManage')
    }
    if (routerConfig['cdiscount']) {
      // store.dispatch('platform/addPlatform', 'cdiscount')
      asyncRouterMap['cdiscount'] = asyncRouterMapCdiscount
      routerMap['cdiscount.advertising'] = () => import('@/views/cdiscount/advertising')
      routerMap['cdiscount.plan'] = () => import('@/views/cdiscount/plan')
      routerMap['cdiscount.promotion'] = () => import('@/views/cdiscount/promotion')
      routerMap['cdiscount.followList'] = () => import('@/views/cdiscount/advtPriceManage')
    }
    if (routerConfig['real']) {
      // store.dispatch('platform/addPlatform', 'real')
      asyncRouterMap['real'] = asyncRouterMapReal
      routerMap['real.advertising'] = () => import('@/views/real/advertising')
      routerMap['real.plan'] = () => import('@/views/real/plan')
      routerMap['real.onlineError'] = () => import('@/views/real/onlineError')
    }
    if (routerConfig['daraz']) {
      // store.dispatch('platform/addPlatform', 'daraz')
      asyncRouterMap['daraz'] = asyncRouterMapDaraz
      routerMap['daraz.advertising'] = () => import('@/views/daraz/advertising')
      routerMap['daraz.plan'] = () => import('@/views/daraz/plan')
    }
    if (routerConfig['dhgate']) {
      // store.dispatch('platform/addPlatform', 'dhgate')
      asyncRouterMap['dhgate'] = asyncRouterMapDhgate
      routerMap['dhgate.advertising'] = () => import('@/views/dhgate/advertising')
      routerMap['dhgate.plan'] = () => import('@/views/dhgate/plan')
    }
    if (routerConfig['linio']) {
      // store.dispatch('platform/addPlatform', 'linio')
      asyncRouterMap["linio"]=(asyncRouterMapLinio)
      routerMap['linio.advertising'] = () => import('@/views/linio/advertising')
      routerMap['linio.plan'] = () => import('@/views/linio/plan')
      routerMap['linio.product-filter'] = () => import('@/views/linio/noUpdate')
    }
    if (routerConfig['mercadolibre']) {
      // store.dispatch('platform/addPlatform', 'mercadolibre')
      asyncRouterMap['mercadolibre'] = asyncRouterMapMercadolibre
      routerMap['mercadolibre.advertising'] = () => import('@/views/mercadolibre.gs/advertising')
      routerMap['mercadolibre.plan'] = () => import('@/views/mercadolibre.gs/plan')
      routerMap['mercadolibre.customPrice'] = () => import('@/views/mercadolibre.gs/customPrice')
      routerMap['mercadolibre.attributeSet'] = () => import('@/views/mercadolibre.gs/attributeSet')
      routerMap['mercadolibre.noUpdate'] = () => import('@/views/mercadolibre.gs/noUpdate')
    }
    if (routerConfig['newegg']) {
      // store.dispatch('platform/addPlatform', 'newegg')
      asyncRouterMap['newegg']= asyncRouterMapNewegg
      routerMap['newegg.advertising'] = () => import('@/views/newegg/advertising')
      routerMap['newegg.plan'] = () => import('@/views/newegg/plan')
      routerMap['newegg.properties'] = () => import('@/views/newegg/properties')
    }
    if (routerConfig['rakuten']) {
      // store.dispatch('platform/addPlatform', 'rakuten')
      asyncRouterMap['rakuten'] = asyncRouterMapRakuten
      routerMap['rakuten.advertising'] = () => import('@/views/rakuten/advertising')
      routerMap['rakuten.plan'] = () => import('@/views/rakuten/plan')
      routerMap['rakuten.noUpdate'] = () => import('@/views/rakuten/noUpdate')
      routerMap['rakuten.bulkUpdate'] = () => import('@/views/rakuten/bulkUpdate')
    }
    if (routerConfig['tiki']) {
      // store.dispatch('platform/addPlatform', 'tiki')
      asyncRouterMap['tiki'] = asyncRouterMapTiki
      routerMap['tiki.advertising'] = () => import('@/views/tiki/advertising')
      routerMap['tiki.plan'] = () => import('@/views/tiki/plan')
      routerMap['tiki.noUpdate'] = () => import('@/views/tiki/noUpdate')
    }
    if (routerConfig['shopee']) {
      store.dispatch('platform/addPlatform', 'shopee')
      asyncRouterMap['shopee'] = asyncRouterMapShopee
      routerMap['shopee.advertising'] = () => import('@/views/shopee/advertising')
      routerMap['shopee.plan'] = () => import('@/views/shopee/plan')
      routerMap['shopee.calculation'] = () => import('@/views/shopee/calculation')
      routerMap['shopee.discountPlain'] = () => import('@/views/shopee/discountPlain')
      routerMap['shopee.automaticUpload'] = () => import('@/views/shopee/automaticUpload')
      routerMap['shopee.instrument'] = () => import('@/views/shopee/instrument')
      routerMap['shopee.exportShelvesAdvt'] = () => import('@/views/shopee/exportShelvesAdvt')
    }
    if (routerConfig['b2w']) {
      // store.dispatch('platform/addPlatform', 'b2w')
      asyncRouterMap["b2w"]=asyncRouterMapB2w
      routerMap['b2w.advertising'] = () => import('@/views/b2w/advertising')
      routerMap['b2w.plan'] = () => import('@/views/b2w/plan')
    }
    if (routerConfig['allegro']) {
      // store.dispatch('platform/addPlatform', 'allegro')
      asyncRouterMap["allegro"]=asyncRouterMapAllegro
      routerMap['allegro.advertising'] = () => import('@/views/allegro/advertising')
      routerMap['allegro.attributeSet'] = () => import('@/views/allegro/attributeSet')
      routerMap['allegro.plan'] = () => import('@/views/allegro/plan')
      routerMap['allegro.inquire'] = () => import('@/views/allegro/inquire')
      routerMap['allegro.advtPushManage'] = () => import('@/views/allegro/advtPushManage')
      routerMap['allegro.rankingPushList'] = () => import('@/views/allegro/rankingPushList')
    }
    if (routerConfig['blibli']) {
      // store.dispatch('platform/addPlatform', 'blibli')
      asyncRouterMap["blibli"]= asyncRouterMapblibli
      routerMap['blibli.advertising'] = () => import('@/views/blibli/advertising')
      routerMap['blibli.plan'] = () => import('@/views/blibli/plan')
    }
    if (routerConfig['jumia']) {
      // store.dispatch('platform/addPlatform', 'jumia')
      asyncRouterMap['jumia'] = asyncRouterMapJumia
      routerMap['jumia.advertising'] = () => import('@/views/jumia/advertising')
      routerMap['jumia.plan'] = () => import('@/views/jumia/plan')
      routerMap['jumia.noUpdate'] = () => import('@/views/jumia/noUpdate')
    }
    if (routerConfig['rueducommerce']) {
      // store.dispatch('platform/addPlatform', 'Rueducommerce')
      asyncRouterMap['rueducommerce'] = asyncRouterMapRuedu
      routerMap['ruedu.advertising'] = () => import('@/views/ruedu/advertising')
      routerMap['ruedu.plan'] = () => import('@/views/ruedu/plan')
      routerMap['ruedu.attribute'] = () => import('@/views/ruedu/attribute')
      routerMap['ruedu.noUpdate'] = () => import('@/views/ruedu/noUpdate')
    }
    if (routerConfig['shopify']) {
      // store.dispatch('platform/addPlatform', 'shopify')
      asyncRouterMap['shopify'] = asyncRouterMapShopify
      routerMap['shopify.advertising'] = () => import('@/views/shopify/advertising')
      routerMap['shopify.plan'] = () => import('@/views/shopify/plan')
    }
  }, 10)
}

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
