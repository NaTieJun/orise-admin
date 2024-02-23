import request from '@/utils/request'
import { praseStrEmpty } from '@/utils/common'
const service = window.lwConfig.services.baseFacilityApi

// 查询所有运营商列表
export function listConnector(query) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/connector/page',
    method: 'get',
    params: query,
  })
}

// 查询用户详细
export function getConnector(connectorId) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/connector/' + praseStrEmpty(connectorId),
    method: 'get',
  })
}

// 新增运营商
export function addConnector(data) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/connector',
    method: 'post',
    data: data,
  })
}

// 修改运营商
export function updateConnector(data) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/connector',
    method: 'put',
    data: data,
  })
}

// 删除运营商
export function delConnector(connectorId) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/connector/' + connectorId,
    method: 'delete',
  })
}

// 充电状态记录分页列表
export function statusRecordPage(query) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/connector/statusRecordPage',
    method: 'get',
    params: query,
  })
}

// 拔枪
export function ulinkConnector(query) {
  return request({
    url: service + '/deviceplat/evcs/sim/v1/unlink',
    method: 'get',
    params: query,
  })
}

// 拔枪
export function linkConnector(query) {
  return request({
    url: service + '/deviceplat/evcs/sim/v1/link',
    method: 'get',
    params: query,
  })
}

// 启动模拟枪
export function startConnector(query) {
  return request({
    url: service + '/deviceplat/evcs/sim/v1/start',
    method: 'get',
    params: query,
  })
}

// 停止模拟枪
export function stopConnector(query) {
  return request({
    url: service + '/deviceplat/evcs/sim/v1/stop',
    method: 'get',
    params: query,
  })
}