import request from '@/utils/request'
import { praseStrEmpty } from '@/utils/common'
const service = window.lwConfig.services.system

// 查询所有站点列表
export function listAgent(query) {
  return request({
    url: service + '/userplat/omind/v1/agent/list',
    method: 'get',
    params: query,
  })
}

// 查询站点详情
export function getAgent(packageId) {
  return request({
    url: service + '/userplat/omind/v1/agent/' + praseStrEmpty(packageId),
    method: 'get',
  })
}

// 新增站点
export function addAgent(data) {
  return request({
    url: service + '/userplat/omind/v1/agent',
    method: 'post',
    data: data,
  })
}

// 修改站点
export function updateAgent(data) {
  return request({
    url: service + '/userplat/omind/v1/agent',
    method: 'put',
    data: data,
  })
}

// 删除站点
export function delAgent(packageId) {
  return request({
    url: service + '/userplat/omind/v1/agent/' + packageId,
    method: 'delete',
  })
}