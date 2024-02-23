import request from "@/utils/request";
const service = window.lwConfig.services.system;

// 查询操作日志
export function listOperatorLog(query) {
  return request({
    url: service + "/monitor/operlog/list",
    method: "get",
    params: query,
  });
}

// 查询系统日志
export function listSystemLog(query) {
  return request({
    url: service + "/monitor/serve/health/page",
    method: "get",
    params: query,
  });
}

// 查询用户登录日志
export function listLoginLog(query) {
  return request({
    url: service + "/monitor/logininfor/list",
    method: "get",
    params: query,
  });
}
