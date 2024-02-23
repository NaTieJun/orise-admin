import request from '@/utils/request'
import {downloadByParams } from "@/utils/common";
const service = window.lwConfig.services.system
// 查询字典数据列表
export function listData (query) {
  return request({
    url: service + '/system/dict/data/list',
    method: 'get',
    params: query
  })
}

// 查询字典数据详细
export function getData (dictCode) {
  return request({
    url: service + '/system/dict/data/' + dictCode,
    method: 'get'
  })
}

// 根据字典编码查询字典数据信息
export function getDicts (dictType) {
  return request({
    url: service + '/system/dict/data/type/' + dictType,
    method: 'get'
  })
}

// 新增字典数据
export function addData (data) {
  return request({
    url: service + '/system/dict/data',
    method: 'post',
    data: data
  })
}

// 修改字典数据
export function updateData (data) {
  return request({
    url: service + '/system/dict/data',
    method: 'put',
    data: data
  })
}

// 删除字典数据
export function delData (dictCode) {
  return request({
    url: service + '/system/dict/data/' + dictCode,
    method: 'delete'
  })
}

// 导出字典数据
export function exportData (fileName, data) {
  return downloadByParams('/system/dict/data/export', {}, fileName, data)
}