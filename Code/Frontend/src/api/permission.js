import request from '@/utils/request'

export function fetchTreeList() {
  return request({
    url: '/manager/manager/permission/list',
    method: 'get'
  })
}

export function addPermission(data) {
  return request({
    url: '/manager/manager/permission/add',
    method: 'post',
    data: data
  })
}

export function editPermission(data) {
  return request({
    url: '/manager/manager/permission/edit',
    method: 'post',
    data: data
  })
}

export function deletePermission(data) {
  return request({
    url: '/manager/manager/permission/delete',
    method: 'post',
    data: data
  })
}
