import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getBaseApi } from '@/utils/auth'
import qs from 'qs'
import Cookies from 'js-cookie'

const BASE_API = process.env.NODE_ENV === 'production' ? localStorage.getItem('BASE_API') : process.env.VUE_APP_BASE_API
// create an axios instance
const service = axios.create({
  baseURL: BASE_API,
  timeout: 600000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  async config => {
    if (process.env.NODE_ENV === 'production' && (!service.defaults.baseURL || service.defaults.baseURL === 'undefined')) {
      await getBaseApi()
      service.defaults.baseURL = localStorage.getItem('BASE_API')
      config.baseURL = localStorage.getItem('BASE_API')
    }
    const urlInfo = JSON.parse(Cookies.get('urlInfo'))
    config.headers['Authorization'] = `Bearer ${urlInfo.token}`
    config.headers['systemCode'] = urlInfo.systemCode
    // do something before request is sent
    config.headers['Content-Type'] = config.data && config.data.isJson ? 'application/json' : (config.headers['Content-Type'] ? config.headers['Content-Type'] : 'application/x-www-form-urlencoded')
    config['show_message'] = !(config.data && config.data.not_show_message)
    if (config.data instanceof FormData) {
      config['show_message'] = false
    }
    if (config.method === 'post') { // post请求时，处理数据
      if ('application/x-www-form-urlencoded' === config.headers['Content-Type']) {
        config.data = qs.stringify(config.data)
      }
    }
    return config
  }, error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  })
let isPrompt = false
// respone拦截器
service.interceptors.response.use(
  response => {
    /**
     * code为非200是抛错 可结合自己业务进行修改
     */
    const res = response.data
    if (res.code && res.code !== 200) {
      // if (res.message.indexOf('token不可用') > -1) {
      //   res.message += '，请关闭页面重新登录'
      // }
      // token过期
      // if (res.code === '000008') {
      if (res.message.indexOf('token不可用') > -1) {
        const urlInfo = JSON.parse(Cookies.get('urlInfo'))
        if (!isPrompt) {
          isPrompt = true
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
            isPrompt = false
            const loginForm = {
              username: urlInfo.username,
              password: value,
              systemCode: urlInfo.systemCode
            }
            store.dispatch('user/Login', loginForm)
          }).catch((err) => {
            isPrompt = false
            console.log(err)
            window.close()
          })
        }
      } else {
        if (response.config.url.includes('/coupang/advt/update-advt/update')) {
          return Promise.reject(res)
        } else {
          if (res.message && response.config.show_message) {
            Message({
              dangerouslyUseHTMLString: true,
              message: res.message,
              type: 'error',
              duration: 5000
            })
          } else {
            return Promise.reject(res.message)
          }
        }
        return Promise.reject('error')
      }
    } else {
      if (response.config.method === 'post') {
        // 屏蔽message
        if (response.config.show_message) {
          Message({
            message: response.data.message,
            type: 'success',
            duration: 5 * 1000
          })
        }
      }
      return response.data
    }
  },
  error => {
    console.log('err' + error) // for debug
    if (error.message) {
      Message({
        message: error.message,
        type: 'error',
        duration: 5000
      })
    }
    return Promise.reject(error)
  }
)

export default service
