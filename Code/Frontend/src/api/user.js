import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/manager/manager/user/list',
    method: 'get',
    params: query
  })
}

/* get roles list */
export function fetchUserRolesList() {
  return request({
    url: '/manager/manager/user/edit-role',
    method: 'get'
  })
}

/* save roles change list */
export function saveUserRolesList(param) {
  return request({
    url: '/manager/manager/user/save-role',
    method: 'post',
    data: param
  })
}

/* delete user for one */
export function delUserRequest(param) {
  return request({
    url: '/manager/manager/user/delete',
    method: 'post',
    data: param
  })
}

/* modify Status Request */
export function modifyStatusRequest(param) {
  return request({
    url: '/manager/manager/user/enable',
    method: 'post',
    data: param
  })
}

export function searchUserRequest(param) {
  return request({
    url: '/manager/manager/user/search',
    method: 'get',
    params: { key: param }
  })
}

export function searchUserInfoRequest(param) {
  return request({
    url: '/manager/manager/user/search-info',
    method: 'get',
    params: { username: param }
  })
}

export function addUserRequest(param) {
  return request({
    url: '/manager/manager/user/add',
    method: 'post',
    data: param
  })
}
