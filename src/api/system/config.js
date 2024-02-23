import request from '@/utils/request'
const service = window.lwConfig.services.system

// 查询参数列表
export function listConfig (query) {
  return request({
    url: service + '/system/config/list',
    method: 'get',
    params: query
  })
}

// 查询参数详细
export function getConfig (configId) {
  return request({
    url: service + '/system/config/' + configId,
    method: 'get'
  })
}

// 根据参数键名查询参数值
export function getConfigKey (configKey) {
  return request({
    url: service + '/system/config/configKey/' + configKey,
    method: 'get'
  })
}

// 新增参数配置
export function addConfig (data) {
  return request({
    url: service + '/system/config',
    method: 'post',
    data: data
  })
}

// 修改参数配置
export function updateConfig (data) {
  return request({
    url: service + '/system/config',
    method: 'put',
    data: data
  })
}

// 删除参数配置
export function delConfig (configId) {
  return request({
    url: service + '/system/config/' + configId,
    method: 'delete'
  })
}

// 清理参数缓存
export function clearCache () {
  return request({
    url: service + '/system/config/refreshCache',
    method: 'delete'
  })
}

// 导出参数
export function exportConfig (query) {
  return request({
    url: service + '/system/config/export',
    method: 'get',
    params: query
  })
}