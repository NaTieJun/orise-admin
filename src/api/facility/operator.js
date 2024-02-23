import request from '@/utils/request'
import { praseStrEmpty } from '@/utils/common'
const service = window.lwConfig.services.system

// 查询所有运营商列表
export function listOperator(query) {
  return request({
    url: service + '/userplat/omind/v1/operator/page',
    method: 'get',
    params: query,
  })
}

// 查询用户详细
export function getOperator(operatorId) {
  return request({
    url: service + '/userplat/omind/v1/operator/' + praseStrEmpty(operatorId),
    method: 'get',
  })
}

// 新增运营商
export function addOperator(data) {
  return request({
    url: service + '/userplat/omind/v1/operator',
    method: 'post',
    data: data,
  })
}

// 修改运营商
export function updateOperator(data) {
  return request({
    url: service + '/userplat/omind/v1/operator',
    method: 'put',
    data: data,
  })
}

// 删除运营商
export function delOperator(operatorId) {
  return request({
    url: service + '/userplat/omind/v1/operator/' + operatorId,
    method: 'delete',
  })
}