import { getToken } from "@/utils/auth";
import env from "../env";
// 系统内常量默认配置，只能从外部配置，内部不可修改
const common = {
  SYSTEM_NAME: "Orise", // 系统简称
  SYSTEM_NAME_MOBILE: "Orise", // 移动端应用简称
  SYSTEM_NAME_ALL: 'Orise充电站运营平台', // 系统全称
  COMPANY_NAME: "Omind", // 公司简称
  COMPANY_NAME_ALL: "Omind", // 公司全称
  COPYRIGHT: "Copyright © 2022-2023 Orise Omind All Rights Reserved.", // 版权信息
  LOGO_DARK: env.BASE_URL + "static/LOGO_DARK.png", // 深色logo
  LOGO_LIGHT: env.BASE_URL + "static/LOGO_LIGHT.png", // 淡色logo
  LOGO_TEXT_DARK: env.BASE_URL + "static/LOGO_TEXT_DARK.png", // 深色logo+文字
  LOGO_TEXT_LIGHT: env.BASE_URL + "static/LOGO_TEXT_LIGHT.png", // 淡色logo+文字
  QRCODE_CONTACT_US: env.BASE_URL + "static/QRCODE_CONTACT_US.png", // 联系我们二维码
  QRCODE_CUSTOMER_SERVICE: env.BASE_URL + "static/QRCODE_CUSTOMER_SERVICE.png", // 客服二维码
  POST_QRCODE: env.BASE_URL + "static/POST_QRCODE.png", // 海报占位二维码
  AGREEMENT: env.BASE_URL + "static/AGREEMENT.pdf", // 用户协议pdf
  PRIVACY: env.BASE_URL + "static/PRIVACY.pdf", // 隐私协议pdf
  IS_PUBLISH_DIALOG: false, // 是否显示发布弹窗
  COOKIEEXPIRES: 0.5, // token在Cookie中存储的天数，默认0.5天
  WORKWEIXINPAGENAME: "EnterpriseWechat", // 企业微信设置页面路由name
  WxAppConnectorLink: env.WxAppConnectorLink
};

// 以下仅用于系统信息展示，不作为项目变量使用，请勿在代码中使用
const project = {
  _version: "3.x", // 当前版本信息
  _packageTime: process.env.VUE_APP_PACKETTIME, // 打包时间
  _env: process.env.VUE_APP_ENV, // 前端系统环境模式
};

let init = {
  // 是否系统布局配置
  showSettings: false,

  // 是否显示 tagsView
  tagsView: true,

  // 是否固定头部
  fixedHeader: false,

  // 是否显示logo
  sidebarLogo: true,

  services: {
    wecom: "/open",
    system: env.SYSTEM_API,
    baseFacilityApi: env.BASE_FACILITY_API,
    common: "/common",
  },

  get headers() {
    return { Authorization: "Bearer " + getToken() };
  },
};

const lwConfig = window.lwConfig || {}; // 线上动态配置，用于覆盖系统默认常量的配置信息

// init 含有getter必须放在merge第一位
window.lwConfig = Object.assign(init, env, common, lwConfig, project);
// Object.defineProperties(window.lwConfig, {})


export default init;
