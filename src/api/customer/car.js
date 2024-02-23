import request from '@/utils/request'
import { praseStrEmpty } from '@/utils/common'
const service = window.lwConfig.services.system

// 查询车辆列表
export function listCar(query) {
  return request({
    url: service + '/userplat/omind/v1/user/car/list',
    method: 'get',
    params: query,
  })
}

// 查询车辆详情
export function getCar(id) {
  return request({
    url: service + '/userplat/omind/v1/user/car/' + praseStrEmpty(id),
    method: 'get',
  })
}

// 新增车辆
export function addCar(data) {
  return request({
    url: service + '/userplat/omind/v1/user/car',
    method: 'post',
    data: data,
  })
}

// 修改车辆
export function updateCar(data) {
  return request({
    url: service + '/userplat/omind/v1/user/car',
    method: 'put',
    data: data,
  })
}

// 删除车辆
export function delFeedback(id) {
  return request({
    url: service + '/userplat/omind/v1/user/car/' + id,
    method: 'delete',
  })
}
// 审核车辆
export function approveCar(data) {
  return request({
    url: service + '/userplat/omind/v1/user/car/check',
    method: 'put',
    data: data,
  })
}