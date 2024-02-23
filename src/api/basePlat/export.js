import request from "@/utils/request";
import { praseStrEmpty, encodeURL } from "@/utils/common";
const service = window.lwConfig.services.baseFacilityApi;

// 根据任务号获取详情
export function getExportTaskBase(taskId) {
  return request({
    url: service + "/baseplat/hlht/v1/sys/export/" + taskId,
    method: "get",
  });
}

// 获取任务分页列表
export function listExportTaskBase(params) {
  return request({
    url: service + "/baseplat/hlht/v1/sys/export/page",
    method: "get",
    params: params,
  });
}