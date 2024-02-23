import request from '@/utils/request'
import { praseStrEmpty } from '@/utils/common'
const service = window.lwConfig.services.system

// 查询所有站点列表
export function listFeedback(query) {
  return request({
    url: service + '/userplat/omind/v1/feedback/list',
    method: 'get',
    params: query,
  })
}

// 查询站点详情
export function getFeedback(id) {
  return request({
    url: service + '/userplat/omind/v1/feedback/' + praseStrEmpty(id),
    method: 'get',
  })
}

// 新增站点
export function addFeedback(data) {
  return request({
    url: service + '/userplat/omind/v1/feedback',
    method: 'post',
    data: data,
  })
}

// 修改站点
export function updateFeedback(data) {
  return request({
    url: service + '/userplat/omind/v1/feedback',
    method: 'put',
    data: data,
  })
}

// 删除站点
export function delFeedback(id) {
  return request({
    url: service + '/userplat/omind/v1/feedback/' + id,
    method: 'delete',
  })
}