import request from '@/utils/request'
import { praseStrEmpty } from '@/utils/common'
const service = window.lwConfig.services.system

// 查询所有充电枪列表
export function listConnector(query) {
  return request({
    url: service + '/userplat/omind/v1/connector/list',
    method: 'get',
    params: query,
  })
}

// 查询用户详细
export function getConnector(connectorId) {
  return request({
    url: service + '/userplat/omind/v1/connector/' + praseStrEmpty(connectorId),
    method: 'get',
  })
}

// 新增充电枪
export function addConnector(data) {
  return request({
    url: service + '/userplat/omind/v1/connector',
    method: 'post',
    data: data,
  })
}

// 修改充电枪
export function updateConnector(data) {
  return request({
    url: service + '/userplat/omind/v1/connector',
    method: 'put',
    data: data,
  })
}

// 删除充电枪
export function delConnector(connectorId) {
  return request({
    url: service + '/userplat/omind/v1/connector/' + connectorId,
    method: 'delete',
  })
}