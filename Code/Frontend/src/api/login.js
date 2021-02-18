import request from '@/utils/login-request'

export function logout() {
  return request({
    url: '/user-service/logout',
    method: 'post'
  })
}

export function getUserInfo() {
  return request({
    url: '/user-service/user/get/getuserAndAction',
    method: 'get'
  })
}

// 获取业务系统树形菜单
export function bussinessTree(reqParams) {
  return request({
    url: `/user-service/usermenu/get/bussinesstree/${reqParams}`,
    method: 'get'
    // params: reqParams
  })
}

export function newlogin(username, password) {
  return request({
    url: '/user-service/login',
    method: 'post',
    data: {
      username: username,
      password: password
    }
  })
}

// 权限系统
export function sysTree() {
  return request({
    url: `/user-service/userSystemMap/get/userId/forlogin`,
    method: 'get'
    // params: reqParams
  })
}

