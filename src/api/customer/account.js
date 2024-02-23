import request from '@/utils/request'
import { praseStrEmpty } from '@/utils/common'
const service = window.lwConfig.services.system

// 查询所有站点列表
export function listAccount(query) {
  return request({
    url: service + '/userplat/omind/v1/user/account/list',
    method: 'get',
    params: query,
  })
}

// 查询站点详情
export function getAccount(id) {
  return request({
    url: service + '/userplat/omind/v1/user/account/' + praseStrEmpty(id),
    method: 'get',
  })
}

// 新增站点
export function addAccount(data) {
  return request({
    url: service + '/userplat/omind/v1/user/account',
    method: 'post',
    data: data,
  })
}

// 修改站点
export function updateAccount(data) {
  return request({
    url: service + '/userplat/omind/v1/user/account',
    method: 'put',
    data: data,
  })
}

// 删除站点
export function delAccount(id) {
  return request({
    url: service + '/userplat/omind/v1/user/account/' + id,
    method: 'delete',
  })
}