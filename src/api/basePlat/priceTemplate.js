import request from '@/utils/request'
import { praseStrEmpty } from '@/utils/common'
const service = window.lwConfig.services.baseFacilityApi

// 查询所有价格模板列表
export function listPriceTemplate(query) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/price/page',
    method: 'get',
    params: query,
  })
}

// 查询价格模板
export function getPriceTemplate(priceCode) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/price/' + encodeURIComponent(priceCode),
    method: 'get',
  })
}

// 根据站点Id查询价格模板
export function getStationPrice(stationId) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/price/getStationPrice',
    method: 'get',
    params: { stationId }
  })
}

// 新增价格模板
export function addPriceTemplate(data) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/price',
    method: 'post',
    data: data,
  })
}

// 修改价格模板
export function updatePriceTemplate(data) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/price/edit',
    method: 'put',
    data: data,
  })
}

// 删除价格模板
export function deletePriceTemplate(priceCode) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/price/' + priceCode,
    method: 'delete',
  })
}

// 批量关联价格模板
export function linkStations(data) {
  return request({
    url: service + '/baseplat/hlht/v1/sys/price/linkStations',
    method: 'put',
    data: data,
  })
}