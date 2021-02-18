import axios from 'axios'
import qs from 'qs'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'

// create an axios instance
const service = axios.create({
  baseURL: '',
  timeout: 600000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // config.headers['hostIp'] = urlInfo.ip
    if (config.method === 'get') {
      config.headers['Content-Type'] = 'application/json'
    } else {
      if (config.data.is_json) {
        config.headers['Content-Type'] = 'application/json'
      } else {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        if (config.method === 'post') { // post请求时，处理数据
          config.data = qs.stringify(config.data)
        }
      }
    }
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.log('err' + error) // for debug
    return Promise.reject(error)
  }
)

export default service
