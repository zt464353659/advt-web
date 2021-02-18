import Vue from 'vue'
import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import permission from '@/directive/permission'
import getPageTitle from '@/utils/get-page-title'
import debounce from '@/directive/debounce'
import dragMove from '@/directive/dragMove'
import Cookies from 'js-cookie'
import { getUrlKey } from '@/utils/help'
NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()
  const NProgressInfo = Cookies.get('urlInfo') ? JSON.parse(Cookies.get('urlInfo')) : ''
  // set page title
  document.title = getPageTitle(to.meta.title)
  if (NProgressInfo) {
    if (!store.getters.userId) {
      // 如果有 code 就解析 code
      if (getUrlKey('code')) {
        store.dispatch('user/LoginByUsername1').then(res => {
          store.dispatch('user/GetUserInfo').then(() => { // 拉取user_info
            store.dispatch('GenerateRoutes', {}).then(() => { // 根据roles权限生成可访问的路由表
              router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
              to.query.userId = store.getters.userId
              next({ ...to, replace: true }) // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
              router.push({ path: '/' })
            })
          }).catch((err) => {
            console.log(err)
            store.dispatch('user/LogOut').then(() => {
              Message.error(err)
              NProgress.done()
              // window.close()
            })
          })
        })
      } else {
        store.dispatch('user/GetUserInfo').then(() => { // 拉取user_info
          store.dispatch('GenerateRoutes', {}).then(() => { // 根据roles权限生成可访问的路由表
            router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
            to.query.userId = store.getters.userId
            next({ ...to, replace: true }) // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
          })
        }).catch((err) => {
          console.log(err)
          store.dispatch('user/LogOut').then(() => {
            Message.error(err)
            NProgress.done()
            // window.close()
          })
        })
      }
    } else {
      if (to.query.userId) {
        next()
      } else {
        to.query.userId = store.getters.userId
        // 一级面包屑返回首页，解决首页重复重定向
        if (to.fullPath === '/dashboard') {
          next()
        } else {
          next({ ...to, replace: true })
        }
      }
    }
  } else {
    store.dispatch('user/LoginByUsername').then(res => {
      router.push({ path: '/' })
    }).catch(err => {
      Message.error(err)
    })
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})

Vue.directive('permission', permission)
Vue.directive('debounce', debounce)
Vue.directive('dragMove', dragMove)
