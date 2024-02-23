import request from '@/utils/request'
import { praseStrEmpty } from '@/utils/common'
const service = window.lwConfig.services.system

// 查询所有站点列表
export function listRecharge(query) {
  return request({
    url: service + '/userplat/omind/v1/recharge/package/list',
    method: 'get',
    params: query,
  })
}

// 查询站点详情
export function getRecharge(packageId) {
  return request({
    url: service + '/userplat/omind/v1/recharge/package/' + praseStrEmpty(packageId),
    method: 'get',
  })
}

// 新增站点
export function addRecharge(data) {
  return request({
    url: service + '/userplat/omind/v1/recharge/package',
    method: 'post',
    data: data,
  })
}

// 修改站点
export function updateRecharge(data) {
  return request({
    url: service + '/userplat/omind/v1/recharge/package',
    method: 'put',
    data: data,
  })
}

// 删除站点
export function delRecharge(packageId) {
  return request({
    url: service + '/userplat/omind/v1/recharge/package/' + packageId,
    method: 'delete',
  })
}