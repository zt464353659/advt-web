import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import Cookies from 'js-cookie'
// create an axios instance
const service = axios.create({
  baseURL: 'http://120.234.18.30:19000/',
  timeout: 600000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    const urlInfo = JSON.parse(Cookies.get('urlInfo'))
    config.headers['Authorization'] = `Bearer ${config.token || urlInfo.token}`
    config.headers['systemCode'] = urlInfo.systemCode
    config['show_message'] = !(config.data && config.data.not_show_message)
    // config.headers['hostIp'] = urlInfo.ip
    if (config.publish) {
      const urlInfo = JSON.parse(Cookies.get('urlInfo'))
      config['token'] = urlInfo.token
    }
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)
let isPrompt = false
// response interceptor
service.interceptors.response.use(
  response => {
    const res = response.data
    if (!['000005', '000000'].includes(res.code)) {
      if (res.message.indexOf('不可用') > -1 || res.message.indexOf('密码错误') > -1) {
        if (res.message.indexOf('密码错误') > -1) {
          Message.error('密码错误')
        }
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
            window.close()
          })
        }
      } else {
        // 401:token过期或者校验不通过; 403:token校验成功,但是无权限访问;
        if (res.code === 401 || res.code === 403) {
          MessageBox.confirm(
            '你已被登出，可以取消继续留在该页面，或者重新登录',
            '确定登出', {
              confirmButtonText: '重新登录',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            store.dispatch('LogOut').then(() => {
              window.close()
            })
          })
        }
        return Promise.reject('error')
      }
    } else {
      return response.data
    }
  },
  error => {
    console.log('err' + error) // for debug
    return Promise.reject(error)
  }
)

export default service
