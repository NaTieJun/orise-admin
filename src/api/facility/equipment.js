import request from "@/utils/request";
import { praseStrEmpty } from "@/utils/common";
const service = window.lwConfig.services.system;

// 查询所有充电桩列表
export function listEquipment(params) {
  return request({
    url: service + "/userplat/omind/v1/equipment/list/" + praseStrEmpty(params.stationId),
    method: "get",
    params: params,
  });
}

// 查询充电桩详细
export function getEquipment(stationId, equipmentId) {
  return request({
    url: service + "/userplat/omind/v1/equipment/" + praseStrEmpty(equipmentId),
    method: "get",
  });
}

// 查询充电桩扩展信息
export function getEquipmentExt(stationId, equipmentId) {
  return request({
    url:
      service + "/userplat/omind/v1/equipment/ext/" + praseStrEmpty(equipmentId),
    method: "get",
  });
}

// 新增充电桩
export function addEquipment(data) {
  return request({
    url: service + "/userplat/omind/v1/equipment",
    method: "post",
    data: data,
  });
}

// 修改充电桩
export function updateEquipment(data) {
  return request({
    url: service + "/userplat/omind/v1/equipment",
    method: "put",
    data: data,
  });
}

// 修改充电桩扩展信息
export function updateEquipmentExt(data) {
  return request({
    url: service + "/userplat/omind/v1/equipment/ext/optEquipPrice",
    method: "put",
    data: data,
  });
}

// 删除充电桩
export function delEquipment(equipmentId) {
  return request({
    url: service + "/userplat/omind/v1/equipment/" + equipmentId,
    method: "delete",
  });
}
