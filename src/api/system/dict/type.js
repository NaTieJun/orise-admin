import request from '@/utils/request'
const service = window.lwConfig.services.system
import {downloadByParams } from "@/utils/common";

// 查询字典编码列表
export function listType (query) {
  return request({
    url: service + '/system/dict/type/list',
    method: 'get',
    params: query
  })
}

// 查询字典编码详细
export function getType (dictId) {
  return request({
    url: service + '/system/dict/type/' + dictId,
    method: 'get'
  })
}

// 新增字典编码
export function addType (data) {
  return request({
    url: service + '/system/dict/type',
    method: 'post',
    data: data
  })
}

// 修改字典编码
export function updateType (data) {
  return request({
    url: service + '/system/dict/type',
    method: 'put',
    data: data
  })
}

// 删除字典编码
export function delType (dictId) {
  return request({
    url: service + '/system/dict/type/' + dictId,
    method: 'delete'
  })
}

// 清理参数缓存
export function clearCache () {
  return request({
    url: service + '/system/dict/type/refreshCache',
    method: 'delete'
  })
}

// 导出字典编码
export function exportType (fileName, data) {
  return downloadByParams('/system/dict/type/export', {}, fileName, data)
}

// 获取字典选择框列表
export function optionselect () {
  return request({
    url: service + '/system/dict/type/optionselect',
    method: 'get'
  })
}