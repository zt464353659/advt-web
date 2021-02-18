import { logout, getUserInfo, newlogin } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { getUrlKey } from '@/utils/help'
import { MessageBox, Message } from 'element-ui'
import router from '../../router'
import Cookies from 'js-cookie'
const Base64 = require('js-base64').Base64
const state = {
  userId: '',
  userIp: '',
  status: '',
  systemCode: '',
  token: getToken(),
  name: '',
  nameEn: '',
  avatar: '',
  introduction: '',
  roles: [],
  setting: {
    articlePlatform: []
  },
  actionUrl: [],
  info: null,
  permissions: []
}
const mutations = {
  SET_USERID: (state, userId) => {
    state.userId = userId
  },
  SET_USERIP: (state, userIp) => {
    state.userIp = userIp
  },
  SET_SYSTEM_CODE: (state, code) => {
    state.systemCode = code
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_SETTING: (state, setting) => {
    state.setting = setting
  },
  SET_STATUS: (state, status) => {
    state.status = status
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_NAME_EN: (state, name) => {
    state.nameEn = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_ACTIVE: (state, urlList) => {
    state.actionUrl = urlList
  },
  SET_INFO: (state, info) => {
    state.info = info
  },
  SET_PERMISSIONS: (state, permissions) => {
    state.permissions = permissions
  }
}
const actions = {
  // 获取URL信息
  LoginByUsername({ commit }) {
    const code = getUrlKey('code')
    if (!code) {
      Message.error('token 不可用，请关闭页面重新登录')
      setTimeout(() => {
        window.close()
      }, 2000)
    }
    const urlInfo = JSON.parse(Base64.decode(code))
    return new Promise((resolve, reject) => {
      setToken(urlInfo.token)
      Cookies.set('urlInfo', urlInfo)
      resolve(urlInfo)
    })
  },
  // 有 token 和 code 时获取URL信息
  LoginByUsername1({ commit }) {
    const code = getUrlKey('code')
    return new Promise((resolve, reject) => {
      const urlInfo = JSON.parse(Base64.decode(code))
      setToken(urlInfo.token)
      Cookies.set('urlInfo', urlInfo)
      resolve('reload')
    })
  },
  Login({ commit }, userInfos) {
    const username = userInfos.username.trim()
    return new Promise((resolve, reject) => {
      newlogin(username, userInfos.password).then(response => {
        setToken(response.data.token)
        commit('SET_TOKEN', response.data.token)
        if (response.data.userInfo) {
          // 把登录信息存起来，防止用户手动刷新之后state丢失
          const urlInfo = response.data.userInfo
          urlInfo.token = response.data.token
          urlInfo.systemCode = userInfos.systemCode
          Cookies.set('urlInfo', urlInfo)
          router.push({ path: router.history.current.path })
          location.reload()
        } else {
          reject('loginInfo: is Null !')
        }
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取用户信息
  GetUserInfo({ commit }) {
    return new Promise((resolve, reject) => {
      getUserInfo().then(response => {
        if (!response.data) {
          MessageBox.prompt('您的登陆已过期请重新输入密码', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '关闭',
            inputType: 'password',
            inputPattern: /\S/,
            inputErrorMessage: '密码不能为空',
            showClose: false,
            closeOnClickModal: false,
            closeOnHashChange: false
          }).then(({ value }) => {
            const loginForm = {
              username: urlInfo.username,
              password: value,
              systemCode: urlInfo.systemCode
            }
            store.dispatch('user/Login', loginForm)
          }).catch((err) => {
            window.close()
          })
        }
        const data = response.data
        const urlInfo = Cookies.get('urlInfo') ? JSON.parse(Cookies.get('urlInfo')) : ''
        if (!urlInfo) {
          reject()
        }
        commit('SET_USERID', urlInfo.userId)
        commit('SET_USERIP', urlInfo.ip)
        commit('SET_SYSTEM_CODE', urlInfo.systemCode)
        commit('SET_TOKEN', urlInfo.token)
        commit('SET_NAME', data.name)
        commit('SET_NAME_EN', data.username)
        commit('SET_ACTIVE', data.actionUrl ? data.actionUrl : [])
        commit('SET_INFO', urlInfo)
        const action_url = data.actionUrl ? data.actionUrl : []
        const tag_permission = action_url.map(item => {
          return {
            ...item,
            tag: item.url.substr(1).replace(/\//g, '.')
          }

        })
        commit('SET_PERMISSIONS', tag_permission)
        // if (data.roles && data.roles.length > 0) { // 验证返回的roles是否是一个非空数组
        //   commit('SET_ROLES', data.roles)
        // } else {
        //   reject('getInfo: roles must be a non-null array!')
        // }

        // commit('SET_AVATAR', data.avatar)
        // commit('SET_INTRODUCTION', data.introduction)
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 登出
  LogOut({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_USERID', '')
        commit('SET_USERIP', '')
        commit('SET_SYSTEM_CODE', '')
        commit('SET_TOKEN', '')
        commit('SET_NAME', '')
        commit('SET_NAME_EN', '')
        // Cookies.remove('urlInfo')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 前端 登出
  FedLogOut({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      Cookies.remove('urlInfo')
      removeToken()
      resolve()
    })
  },

  // 动态修改权限
  ChangeRoles({ commit, dispatch }, role) {
    return new Promise(resolve => {
      commit('SET_TOKEN', role)
      setToken(role)
      getUserInfo(role).then(response => {
        const data = response.data
        commit('SET_ROLES', data.roles)
        commit('SET_NAME', data.name)
        commit('SET_AVATAR', data.avatar)
        commit('SET_INTRODUCTION', data.introduction)
        dispatch('GenerateRoutes', data) // 动态修改权限后 重绘侧边菜单
        resolve()
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
