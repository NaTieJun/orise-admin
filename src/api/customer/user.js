import request from "@/utils/request";
import { praseStrEmpty } from "@/utils/common";
const service = window.lwConfig.services.system;

// 查询所有用户列表
export function listUser(query) {
  return request({
    url: service + "/userplat/omind/v1/user/page",
    method: "get",
    params: query,
  });
}

// 查询用户详情
export function getUser(userId) {
  return request({
    url: service + "/userplat/omind/v1/user/" + praseStrEmpty(userId),
    method: "get",
  });
}

// 新增用户
export function addUser(data) {
  return request({
    url: service + "/userplat/omind/v1/user",
    method: "post",
    data: data,
  });
}

// 修改用户
export function updateUser(data) {
  return request({
    url: service + "/userplat/omind/v1/user",
    method: "put",
    data: data,
  });
}

// 删除用户
export function delUser(userId) {
  return request({
    url: service + "/userplat/omind/v1/user/" + userId,
    method: "delete",
  });
}

// 变更用户状态
export function dealUserState(data) {
  return request({
    url: service + "/userplat/omind/v1/user/opt",
    method: "put",
    data,
  });
}
