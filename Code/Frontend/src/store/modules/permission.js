import { constantRouterMap, routerMap, asyncRouterMap } from '@/router'
import { routerConfig } from '@/router/config'
import { bussinessTree } from "@/api/login";
import Layout from '@/layout/index'
import store from '@/store'

//根据数据装载成路由格式
function formatRoutes(aMenu) {
  const tagRouter = []
  const aRouter = []
  let returnData = {}
  for (let i in aMenu) {
    if (routerConfig[aMenu[i].umUrl.substr(1)] || aMenu[i].umUrl.substr(1) === 'tools') {
      const childrenMenu = aMenu[i].childUserRight;
      let routerItem = {
        path: `/${aMenu[i].umUrl.split('/')[1]}`,
        component: Layout,
        redirect: aMenu[i].umUrl,
        alwaysShow: true,
        meta: {
          title: aMenu[i].umTitle,
          icon: 'advt01',
          breadcrumb: false
        },
      }
      let childRoute = []
      if (childrenMenu.length) {
        for (let j in childrenMenu) {
          let route = {}
          let tagItem = {}
          route = {
            path: childrenMenu[j].urUrl,
            component: routerMap[childrenMenu[j].urEnName],
            name: childrenMenu[j].urEnName,
            meta: {
              title: childrenMenu[j].urName,
              icon: 'ViewGallery'
            }
          }
          tagItem = {
            path: childrenMenu[j].urUrl,
            name: childrenMenu[j].urEnName,
            nameZh: childrenMenu[j].urName
          }
          tagRouter.push(tagItem)
          childRoute.push(route)
          routerItem.children = childRoute
        }
      }
      if (asyncRouterMap[aMenu[i].umUrl.substr(1)] && asyncRouterMap[aMenu[i].umUrl.substr(1)].length) {
        routerItem.children = routerItem.children.concat(asyncRouterMap[aMenu[i].umUrl.substr(1)])
      }
      aRouter.push(routerItem)
    }
  }
  returnData = {
    aRouter: aRouter,
    tagRouter: tagRouter
  }
  console.log(returnData)
  return returnData
}

const permission = {
  state: {
    routers: [],
    addRouters: [],
    tagRouters: [],
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers.aRouter
      state.routers = constantRouterMap.concat(routers.aRouter)
      state.tagRouters = routers.tagRouter.concat([{name:'home', nameZh:'首页', path:'/index'}])
    }
  },
  actions: {
    GenerateRoutes({ commit }) {
      return new Promise((resolve, reject) => {
        bussinessTree(store.getters.systemCode).then(response => {
          let router = formatRoutes(response.data);
          let accessedRouters = router
          commit('SET_ROUTERS', accessedRouters)
          resolve()
        })
          .catch(error => {
            console.log(error);
            reject(error)
          });

        // commit('SET_ROUTERS', asyncRouterMap)
        // resolve()
      })
    }
  }
}
export default permission
