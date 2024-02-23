import request from "@/utils/request";
import { praseStrEmpty } from "@/utils/common";
const service = window.lwConfig.services.system;

// 查询所有站点列表
export function listStation(query) {
  return request({
    url: service + "/userplat/omind/v1/station/page",
    method: "get",
    params: query,
  });
}

// 查询所有站点列表
export function listSimpleStation(query) {
  return request({
    url: service + "/userplat/omind/v1/station/simplelist",
    method: "get",
    params: query,
  });
}

// 获取区域列表信息
export function getArealist() {
  return request({
    url: service + "/userplat/omind/v1/menu/arealist",
    method: "get",
  });
}

// 查询所有站点树
export function treeStation(query) {
  return request({
    url: service + "/baseplat/hlht/v1/sys/station/tree",
    method: "get",
    params: query,
  });
}

// 查询站点详情
export function getStation(stationId) {
  return request({
    url: service + "/userplat/omind/v1/station/" + praseStrEmpty(stationId),
    method: "get",
  });
}

// 查询站点详情
export function getStationPrice(stationId) {
  return request({
    url: service + "/userplat/omind/v1/station/price/" + stationId,
    method: "get",
  });
}

// 新增站点
export function addStation(data) {
  return request({
    url: service + "/userplat/omind/v1/station",
    method: "post",
    data: data,
  });
}

// 修改站点
export function updateStation(data) {
  return request({
    url: service + "/userplat/omind/v1/station",
    method: "put",
    data: data,
  });
}

// 删除站点
export function delStation(stationId) {
  return request({
    url: service + "/userplat/omind/v1/station/" + praseStrEmpty(stationId),
    method: "delete",
  });
}

export function addStationExtend(data) {
  return request({
    url: service + "/userplat/omind/v1/station/local",
    method: "post",
    data: data,
  });
}

// 修改站点
export function updateStationExtend(data) {
  return request({
    url: service + "/userplat/omind/v1/station/local",
    method: "put",
    data: data,
  });
}

// 查询停车时段列表
export function listParkingPeriod(query) {
  return request({
    url: service + "/userplat/omind/v1/station/park/list",
    method: "get",
    params: query,
  });
}

// 查询停车时段详情
export function getParkingPeriod(periodId) {
  return request({
    url: service + "/userplat/omind/v1/station/park/" + praseStrEmpty(periodId),
    method: "get",
  });
}

// 新增停车时段
export function addParkingPeriod(data) {
  return request({
    url: service + "/userplat/omind/v1/station/park",
    method: "post",
    data: data,
  });
}

// 修改停车时段
export function updateParkingPeriod(data) {
  return request({
    url: service + "/userplat/omind/v1/station/park",
    method: "put",
    data: data,
  });
}

// 删除停车时段
export function delParkingPeriod(periodId) {
  return request({
    url: service + "/userplat/omind/v1/station/park/" + praseStrEmpty(periodId),
    method: "delete",
  });
}


// 查询充电价格档列表
export function listPrice(query) {
  return request({
    url: service + "/userplat/omind/v1/price/list",
    method: "get",
    params: query,
  });
}

// 查询充电价格档详情
export function getPrice(priceId) {
  return request({
    url: service + "/userplat/omind/v1/price/" + praseStrEmpty(priceId),
    method: "get",
  });
}

// 新增充电价格档
export function addPrice(data) {
  return request({
    url: service + "/userplat/omind/v1/price",
    method: "post",
    data: data,
  });
}

// 批量新增充电价格档
export function addPriceArr(data) {
  return request({
    url: service + "/userplat/omind/v1/price/mulAdd",
    method: "post",
    data: data,
  });
}

// 修改充电价格档
export function updatePrice(data) {
  return request({
    url: service + "/userplat/omind/v1/price",
    method: "put",
    data: data,
  });
}

// 删除充电价格档
export function delPrice(priceId) {
  return request({
    url: service + "/userplat/omind/v1/price/" + praseStrEmpty(priceId),
    method: "delete",
  });
}

// 查询充电时段列表
export function listPricePeriod(query) {
  return request({
    url: service + "/userplat/omind/v1/price/relate/list",
    method: "get",
    params: query,
  });
}

// 查询充电时段详情
export function getPricePeriod(relateId) {
  return request({
    url: service + "/userplat/omind/v1/price/relate/" + praseStrEmpty(relateId),
    method: "get",
  });
}

// 新增充电时段
export function addPricePeriod(data) {
  return request({
    url: service + "/userplat/omind/v1/price/relate",
    method: "post",
    data: data,
  });
}

// 修改充电价格档
export function updatePriceAndPeriod(data) {
  return request({
    url: service + "/userplat/omind/v1/price/priceOption",
    method: "post",
    data: data,
  });
}

// 批量新增充电时段
export function addPricePeriodArr(data) {
  return request({
    url: service + "/userplat/omind/v1/price/relate/mulAdd",
    method: "post",
    data: data,
  });
}

// 修改充电时段
export function updatePricePeriod(data) {
  return request({
    url: service + "/userplat/omind/v1/price/relate",
    method: "put",
    data: data,
  });
}

// 删除充电时段
export function delPricePeriod(relateId) {
  return request({
    url: service + "/userplat/omind/v1/price/relate/" + praseStrEmpty(relateId),
    method: "delete",
  });
}

// 查询优惠充电时段列表
export function listDiscountPeriod(query) {
  return request({
    url: service + "/userplat/omind/v1/price/preferential/list",
    method: "get",
    params: query,
  });
}

// 查询优惠充电时段详情
export function getDiscountPeriod(id) {
  return request({
    url: service + "/userplat/omind/v1/price/preferential/" + praseStrEmpty(id),
    method: "get",
  });
}

// 新增优惠充电时段
export function addDiscountPeriod(data) {
  return request({
    url: service + "/userplat/omind/v1/price/preferential",
    method: "post",
    data: data,
  });
}

// 新增优惠充电时段
export function addDiscountPeriodArr(data) {
  return request({
    url: service + "/userplat/omind/v1/price/preferential/batchAdd",
    method: "post",
    data: data,
  });
}

// 修改优惠充电时段
export function updateDiscountPeriod(data) {
  return request({
    url: service + "/userplat/omind/v1/price/preferential",
    method: "put",
    data: data,
  });
}

// 删除优惠充电时段
export function delDiscountPeriod(id) {
  return request({
    url: service + "/userplat/omind/v1/price/preferential/" + praseStrEmpty(id),
    method: "delete",
  });
}

// 更新站级告警配置
export function updateAlarmCfg(data) {
  return request({
    url: service + "/userplat/omind/v1/station/alarmCfg",
    method: "post",
    data: data,
  });
}

// 获取站级告警配置
export function getAlarmCfg(id) {
  return request({
    url: service + "/userplat/omind/v1/station/alarmCfg/" + praseStrEmpty(id),
    method: "get",
  });
}
