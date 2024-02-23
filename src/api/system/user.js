import request from "@/utils/request";
import { praseStrEmpty } from "@/utils/common";
const service = window.lwConfig.services.system;

// 查询用户列表
export function listUser(query) {
  return request({
    url: service + "/system/user/list",
    method: "get",
    params: query,
  });
}

// 查询所有管理员列表
export function listUserPage(query) {
  return request({
    url: service + "/system/user/list",
    method: "get",
    params: query,
  });
}

// 查询所有管理员列表
export function listAllUser(query) {
  return request({
    url: service + "/system/user/listAll",
    method: "get",
    params: query,
  });
}

// 查询管理员详细
export function getSystemUser(userId) {
  return request({
    url: service + "/system/user/" + praseStrEmpty(userId),
    method: "get",
  });
}

// 查询用户详细
export function getUser(userId) {
  return request({
    url: service + "/system/user/" + praseStrEmpty(userId),
    method: "get",
  });
}

/**
 * 新增管理员用户
 * @param {Object} data
 */
export function addUser(data) {
  return request({
    url: service + "/system/user",
    method: "post",
    data,
  });
}

// 修改用户
export function updateUser(data) {
  return request({
    url: service + "/system/user",
    method: "put",
    data: data,
  });
}

// 删除用户
export function delUser(userId) {
  return request({
    url: service + "/system/user/" + userId,
    method: "delete",
  });
}

// 变更用户状态
export function dealUserState(userId, action = "disable") {
  return request({
    url: `${service}/system/user/${action}User/${userId}`,
    method: "post",
  });
}

/**
 * 用户状态修改
 * @param userId 用户ID
 * @param status 用户状态
 */
export function changeUserStatus (userId, status) {
  const data = {
    userId,
    status
  };
  return request({
    url: service + '/system/user/changeStatus',
    method: 'put',
    data: data
  });
};

// 导出用户
export function exportUser(query) {
  return request({
    url: service + "/system/user/export",
    method: "get",
    params: query,
  });
}

// 用户密码重置
export function resetUserPwd(userId, password) {
  const data = {
    userId,
    password,
  };
  return request({
    url: service + "/system/user/resetPwd",
    headers: {
      isEncrypt: true
    },
    method: "put",
    data: data,
  });
}

// 查询用户个人信息
export function getUserProfile() {
  return request({
    url: service + "/system/user/profile",
    method: "get",
  });
}

// 修改用户个人信息
export function updateUserProfile(data) {
  return request({
    url: service + "/system/user/profile",
    method: "put",
    data: data,
  });
}

// 用户密码重置
export function updateUserPwd(oldPassword, newPassword) {
  const data = {
    oldPassword,
    newPassword,
  };
  return request({
    url: service + "/system/user/profile/updatePwd",
    method: "put",
    headers: {
      isEncrypt: true
    },
    data: data,
  });
}

// 用户头像上传
export function uploadAvatar(data) {
  return request({
    url: service + "/system/user/profile/avatar",
    method: "post",
    data: data,
  });
}

// 下载用户导入模板
export function importTemplate() {
  return request({
    url: service + "/system/user/importTemplate",
    method: "get",
  });
}

// 修改用户角色与代理商
export function editUserRole(params) {
  return request({
    url: service + "/system/user/editUserRole",
    data: params,
    method: "put",
  });
}
