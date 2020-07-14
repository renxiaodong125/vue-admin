import {
  default as request,
  downloadService as downloadRequest,
  downloadFile
} from '@/utils/request'
import qs from 'qs'

export function login(params) {
  return request({
    url: '/admin/sys/login',
    method: 'post',
    data: params
  })
}

export function getInfo(token) {
  return request({
    url: '/admin/sys/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/admin/sys/logout',
    method: 'post'
  })
}
