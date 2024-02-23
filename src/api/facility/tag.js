import request from "@/utils/request";
import { praseStrEmpty } from "@/utils/common";
const service = window.lwConfig.services.system;

// 查询所有tag列表
export function listTag(query) {
  return request({
    url: service + "/userplat/omind/v1/tag/list",
    method: "get",
    params: query,
  });
}

// 查询用户详细
export function getTag(tagId) {
  return request({
    url: service + "/userplat/omind/v1/tag/" + praseStrEmpty(tagId),
    method: "get",
  });
}

// 新增tag
export function addTag(data) {
  return request({
    url: service + "/userplat/omind/v1/tag",
    method: "post",
    data: data,
  });
}

// 修改tag
export function updateTag(data) {
  return request({
    url: service + "/userplat/omind/v1/tag",
    method: "put",
    data: data,
  });
}

// 删除tag
export function delTag(tagId) {
  return request({
    url: service + "/userplat/omind/v1/tag/" + tagId,
    method: "delete",
  });
}
