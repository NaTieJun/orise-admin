import request from "@/utils/request";
import qs from "qs";
const service = window.lwConfig.services.system;

export function initData(url, params) {
  return request({
    url: service + url + "?" + qs.stringify(params, { indices: false }),
    method: "get",
  });
}

export function download(url, params) {
  return request({
    url: service + url + "?" + qs.stringify(params, { indices: false }),
    method: "get",
    responseType: "blob",
  });
}
