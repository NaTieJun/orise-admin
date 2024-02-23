import request from '@/utils/request'
import { praseStrEmpty } from '@/utils/common'
const service = window.lwConfig.services.baseFacilityApi

// 查询所有运营商列表
export function listOperator(query) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/operator/page',
    method: 'get',
    params: query,
  })
}

// 查询用户详细
export function getBaseFacilityOperator(operatorId) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/operator/' + praseStrEmpty(operatorId),
    method: 'get',
  })
}

// 新增运营商
export function addOperator(data) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/operator',
    method: 'post',
    data: data,
  })
}

// 修改运营商
export function updateOperator(data) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/operator',
    method: 'put',
    data: data,
  })
}

// 删除运营商
export function delOperator(operatorId) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/operator/' + operatorId,
    method: 'delete',
  })
}