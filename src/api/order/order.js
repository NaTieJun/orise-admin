import request from "@/utils/request";
import { praseStrEmpty, encodeURL } from "@/utils/common";
const service = window.lwConfig.services.system;

// 查询所有订单列表
export function listOrder(query) {
  return request({
    url: service + "/userplat/omind/v1/bill/page",
    method: "get",
    params: query,
  });
}

// 查询订单详情
export function getOrder(id) {
  return request({
    url: service + "/userplat/omind/v1/bill/" + praseStrEmpty(id),
    method: "get",
  });
}

// 根据订单号查询订单详情
export function getOrderByStartChargeSeq(startChargeSeq) {
  return request({
    url: service + "/userplat/omind/v1/bill/seq/" + praseStrEmpty(startChargeSeq),
    method: "get",
  });
}

// 新增订单
export function addOrder(data) {
  return request({
    url: service + "/userplat/omind/v1/order",
    method: "post",
    data: data,
  });
}

// 修改订单
export function updateOrder(data) {
  return request({
    url: service + "/userplat/omind/v1/order",
    method: "put",
    data: data,
  });
}

// 后台结束充电
export function stopCharge(billId) {
  return request({
    url: service + "/userplat/omind/v1/bill/stopCharge/" + praseStrEmpty(billId),
    method: "post",
  });
}

// 处理异常订单
export function stopOrder(data) {
  return request({
    url: service + "/userplat/omind/v1/bill/forceStopBill",
    method: "post",
    data: data,
  });
}

// 删除订单
export function delOrder(id) {
  return request({
    url: service + "/userplat/omind/v1/order/" + id,
    method: "delete",
  });
}

// 查询所有企业充值订单列表
export function listOrderRecharge(query) {
  return request({
    url: service + "/userplat/omind/v1/recharge/order/list",
    method: "get",
    params: query,
  });
}

// 查询企业充值订单详情
export function getOrderRecharge(id) {
  return request({
    url: service + "/userplat/omind/v1/recharge/order/" + praseStrEmpty(id),
    method: "get",
  });
}

// 新增企业充值订单
export function addOrderRecharge(data) {
  return request({
    url: service + "/userplat/omind/v1/recharge/order",
    method: "post",
    data: data,
  });
}

// 修改企业充值订单
export function updateOrderRecharge(data) {
  return request({
    url: service + "/userplat/omind/v1/recharge/order",
    method: "put",
    data: data,
  });
}

// 删除企业充值订单
export function delOrderRecharge(id) {
  return request({
    url: service + "/userplat/omind/v1/recharge/order/" + id,
    method: "delete",
  });
}

// 修改企业充值审核状态
export function approveOrderRecharge(data, rechargeId) {
  return request({
    url: service + "/userplat/omind/v1/recharge/order/" + praseStrEmpty(rechargeId),
    method: "put",
    data: data,
  });
}

// 查询充值退款订单详情
export function getWalletRefund(id) {
  return request({
    url: service + "/userplat/omind/v1/recharge/refund/" + praseStrEmpty(id),
    method: "get",
  });
}

/**
 * 退款申请关联的充值订单
 */
export function listRefundRelated(query) {
  return request({
    url: service + "/userplat/omind/v1/recharge/refund/related/list",
    method: "get",
    params: query,
  });
}

// 查询充值退款列表
export function listWalletRefund(query) {
  return request({
    url: service + "/userplat/omind/v1/recharge/refund/list",
    method: "get",
    params: query,
  });
}

// 审核充值退款
export function approveWalletRefund(data, id) {
  return request({
    url: service + "/userplat/omind/v1/recharge/refund/pass/" + praseStrEmpty(id),
    method: "put",
    data: data,
  });
}

// 查询充值退款关联信息
export function listWalletRefundRelated(query) {
  return request({
    url: service + "/userplat/omind/v1/recharge/refund/related/list",
    method: "get",
    params: query,
  });
}

// 体验金充值
export function addTrialRecharge(data) {
  return request({
    url: service + "/userplat/omind/v1/user/tryaccount",
    method: "post",
    data: data,
  });
}

// 查询所有企业充值订单列表
export function listTrialRecharge(query) {
  return request({
    url: service + "/userplat/omind/v1/user/tryaccount/list",
    method: "get",
    params: query,
  });
}

// 查询企业充值订单详情
export function getTrialRecharge(id) {
  return request({
    url: service + "/userplat/omind/v1/user/tryaccount/" + praseStrEmpty(id),
    method: "get",
  });
}

// 审核体验金充值
export function approveTrialRecharge(data, rechargeId) {
  return request({
    url: service + "/userplat/omind/v1/user/tryaccount/" + praseStrEmpty(rechargeId),
    method: "put",
    data: data,
  });
}

// 查询所有发票列表
export function listFapiao(query) {
  return request({
    url: service + "/userplat/omind/v1/invoice/list",
    method: "get",
    params: query,
  });
}

// 查询发票
export function getFapiao(id) {
  return request({
    url: service + "/userplat/omind/v1/invoice/" + praseStrEmpty(id),
    method: "get",
  });
}

// 新增发票
export function addFapiao(data) {
  return request({
    url: service + "/userplat/omind/v1/invoice",
    method: "post",
    data: data,
  });
}

// 登记发票信息
export function updateFapiao(data, id) {
  return request({
    url: service + "/userplat/omind/v1/invoice/note/" + praseStrEmpty(id),
    method: "put",
    data: data,
  });
}

// 删除发票
export function delFapiao(id) {
  return request({
    url: service + "/userplat/omind/v1/invoice/" + id,
    method: "delete",
  });
}

/**
 * 退款订单
 */
export function listRefund(query) {
  return request({
    url: service + "/userplat/omind/v1/order/refund/list",
    method: "get",
    params: query,
  });
}

// 查询退款订单
export function getRefund(id) {
  return request({
    url: service + "/userplat/omind/v1/order/refund/" + praseStrEmpty(id),
    method: "get",
  });
}

// 审核
export function approveRefund(data, id, step) {
  // step=1 运营审核
  if (step == 1) {
    return request({
      url: service + "/userplat/omind/v1/order/refund/check/" + praseStrEmpty(id),
      method: "put",
      data: data,
    });
  } else if (step == 2) {
    return request({
      url: service + "/userplat/omind/v1/order/refund/pass/" + praseStrEmpty(id),
      method: "put",
      data: data,
    });
  }
}

// 查询全量订单
export function listAllOrder(query) {
  return request({
    url: service + "/userplat/omind/v1/order/all/list",
    method: "get",
    params: query,
  });
}

// 全量订单统计
export function orderStatistics(data) {
  return request({
    url: service + "/userplat/omind/v1/order/all/statistics",
    method: "get",
    params: data,
  });
}
