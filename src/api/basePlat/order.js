import request from "@/utils/request";
import { praseStrEmpty, encodeURL } from "@/utils/common";
const service = window.lwConfig.services.baseFacilityApi;

// 查询所有运营商列表
export function listOrder(query) {
  return request({
    url: service + "/baseplat/hlht/v1/sys/charge/order/page",
    method: "get",
    params: query,
  });
}

