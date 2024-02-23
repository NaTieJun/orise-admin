import request from "@/utils/request";
const service = window.lwConfig.services.baseFacilityApi;

// 获取停车系统列表
export function getParkingTypeList() {
  return request({
    url: service + "/baseplat/hlht/v1/sys/parking/free/getParkingTypeList",
    method: "get",
  });
}

// 获取站点停车信息
export function getStationParkingInfo(stationId) {
  return request({
    url: service + "/baseplat/hlht/v1/sys/parking/free/getStationParkingLinkInfo",
    method: "get",
    params: {stationId: stationId},
  });
}


// 新增充电站与运营商的关联
export function setStationParkingInfo(data) {
  return request({
    url: service + "/baseplat/hlht/v1/sys/parking/free/setStationParkingLinkInfo",
    method: "post",
    data: data,
  });
}