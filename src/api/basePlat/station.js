import request from "@/utils/request";
import { praseStrEmpty } from "@/utils/common";
const service = window.lwConfig.services.baseFacilityApi;

// 查询所有运营商列表
export function listStation(query) {
  return request({
    url: service + "/baseplat/hlht/v1/sys/station/page",
    method: "get",
    params: query,
  });
}

// 查询用户详细
export function getStation(stationId) {
  return request({
    url: service + "/baseplat/hlht/v1/sys/station/" + praseStrEmpty(stationId),
    method: "get",
  });
}

// 新增运营商
export function addStation(data) {
  return request({
    url: service + "/baseplat/hlht/v1/sys/station",
    method: "post",
    data: data,
  });
}

// 修改运营商
export function updateStation(data) {
  return request({
    url: service + "/baseplat/hlht/v1/sys/station",
    method: "put",
    data: data,
  });
}

// 删除运营商
export function delStation(stationId) {
  return request({
    url: service + "/baseplat/hlht/v1/sys/station/" + stationId,
    method: "delete",
  });
}

// 根据充电站编号获取运营商列表
export function listStationOperator(stationId) {
  return request({
    url: service + "/baseplat/hlht/v1/sys/station/link/operator/list4StationId/" + praseStrEmpty(stationId),
    method: "get",
  });
}

// 新增充电站与运营商的关联
export function addStationOperator(data) {
  return request({
    url: service + "/baseplat/hlht/v1/sys/station/link/operator/",
    method: "post",
    data: data,
  });
}

// 修改充电站与运营商的关联
export function updateStationOperator(data) {
  return request({
    url: service + "/baseplat/hlht/v1/sys/station/link/operator/",
    method: "put",
    data: data,
  });
}

// 删除充电站与运营商的关联
export function delStationOperator(stationId) {
  return request({
    url: service + "/baseplat/hlht/v1/sys/station/link/operator/" + stationId,
    method: "delete",
  });
}

// 获取光伏发电/储能数据
export function analysisPVStorage(query) {
  return request({
    url: service + "/baseplat/hlht/v1/pvs/pvStorageStat4Station",
    method: "get",
    params: query,
  });
}

// 获取全量订单充电数据
export function stationStats(query) {
  return request({
    url: service + "/baseplat/hlht/v1/stats/stationStats",
    method: "get",
    params: query,
  });
}

// 充电站充电枪状态刷新&推送
export function repushGunStatus(stationId) {
  return request({
    url: service + "/baseplat/hlht/v1/sys/station/repushGunStatus/" + stationId,
    method: "post",
  });
}

// 新增运营商
export function sendQCode(stationId) {
  return request({
    url: service + "/baseplat/hlht/v1/sys/station/sendQCode/" + stationId,
    method: "post",
  });
}
