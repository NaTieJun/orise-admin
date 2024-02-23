import request from "@/utils/request";
import { praseStrEmpty, downloadByParams } from "@/utils/common";
const service = window.lwConfig.services.system;
const baseService = window.lwConfig.services.baseFacilityApi

// 查询所有站点列表
export function connectorStatus(id) {
  return request({
    url: baseService + "/baseplat/hlht/v1/sys/station/gunsShow/" + praseStrEmpty(id),
    method: "get",
  });
}

// 充电订单统计
export function analysisOrder(query, interval = "Hour") {
  return request({
    url: service + "/userplat/omind/v1/analyse/orderStatsListBy" + interval,
    method: "get",
    params: query,
  });
}

// 收益分析
export function analysisIncome(query) {
  return request({
    url: service + "/userplat/omind/v1/analyse/analyseIncome",
    method: "get",
    params: query,
  });
}

// 查询单站点运营统计
export function stationStat(id) {
  return request({
    url: service + "/userplat/omind/v1/analyse/stationStats/" + praseStrEmpty(id),
    method: "get",
  });
}

// 查询区域运营统计
export function regionStat(query) {
  return request({
    url: service + "/userplat/omind/v1/analyse/totalStats/",
    method: "get",
    params: query,
  });
}

