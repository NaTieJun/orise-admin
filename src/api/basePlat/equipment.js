import request from '@/utils/request'
import { praseStrEmpty } from '@/utils/common'
const service = window.lwConfig.services.baseFacilityApi

// 查询所有运营商列表
export function listEquipment(query) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/equipment/page',
    method: 'get',
    params: query,
  })
}

// 查询用户详细
export function getEquipment(equipmentId) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/equipment/' + encodeURIComponent(equipmentId),
    method: 'get',
  })
}

// 新增运营商
export function addEquipment(data) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/equipment',
    method: 'post',
    data: data,
  })
}

// 修改运营商
export function updateEquipment(data) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/equipment',
    method: 'put',
    data: data,
  })
}

// 删除运营商
export function delEquipment(equipmentId) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/equipment/' + equipmentId,
    method: 'delete',
  })
}