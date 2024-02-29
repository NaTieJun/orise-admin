# 前端-运营管理后台

[🔥 充电管理后台源码](https://gitee.com/orise001/orise-admin)(当前）

[🔥 充电小程序源码](https://gitee.com/orise001/orise-mp)

[🔥 充电平台微服务源码](https://gitee.com/orise001/orise-charge-cloud)

## 技术栈

本项目技术栈为 `vue2` + `element-ui`。

## 安装

::: warning
Nodejs 版本要求`v14.18.0`
:::

```bash
# 克隆项目
git clone https://gitee.com/orise001/orise-admin.git

# 进入项目目录
cd orise-admin

# 安装依赖
npm install --registry=https://registry.npmmirror.com/
# 使用上述的registry.npmmirror.com源，保证第三方库的顺利安装（特别是 node-sass库）
# 建议不要直接使用 cnpm 安装依赖，会有各种诡异的 bug。
```

## 启动与发布

### 启动服务

```bash
npm run serve
```

### 发布

```bash
# 构建生产环境
npm run build
```

## 配置

### api

在根目录下的`env.js` 文件里设置api接口调用路径

```js
const envs = {
  development: {
    DOMAIN: 'http://plat.trytowish.cn',
    BASE_URL: './', // 路由基础路径
    BASE_API: 'http://plat.trytowish.cn/prod-api',
    SYSTEM_API: 'http://plat.trytowish.cn/prod-api', // 接口基础路径/nginx接口转发路径
    BASE_FACILITY_API: 'http://plat.trytowish.cn/prod-api', // 基础设施运营平台的api
    WxAppConnectorLink: 'http://plat.trytowish.cn/c?n=', // 充电枪二维码生成前缀
  },
  test: {
    ...
  },
  production: {
    ...
  },
}
```

### config

在根目录`src`下的`config.js`设置中配置系统项，可以根据自己的需求进行修改

```js
const common = {
  SYSTEM_NAME: 'Orise', // 系统简称
  SYSTEM_NAME_MOBILE: 'Orise', // 移动端应用简称
  SYSTEM_NAME_ALL: 'Orise充电站运营平台', // 系统全称
  COMPANY_NAME: 'Omind', // 公司简称
  COMPANY_NAME_ALL: 'Omind', // 公司全称
  COPYRIGHT: 'Copyright © 2022-2023 Orise Omind All Rights Reserved.', // 版权信息
  LOGO_DARK: env.BASE_URL + 'static/LOGO_DARK.png', // 深色logo
  LOGO_LIGHT: env.BASE_URL + 'static/LOGO_LIGHT.png', // 淡色logo
  LOGO_TEXT_DARK: env.BASE_URL + 'static/LOGO_TEXT_DARK.png', // 深色logo+文字
  LOGO_TEXT_LIGHT: env.BASE_URL + 'static/LOGO_TEXT_LIGHT.png', // 淡色logo+文字
  QRCODE_CONTACT_US: env.BASE_URL + 'static/QRCODE_CONTACT_US.png', // 联系我们二维码
  QRCODE_CUSTOMER_SERVICE: env.BASE_URL + 'static/QRCODE_CUSTOMER_SERVICE.png', // 客服二维码
  POST_QRCODE: env.BASE_URL + 'static/POST_QRCODE.png', // 海报占位二维码
  AGREEMENT: env.BASE_URL + 'static/AGREEMENT.pdf', // 用户协议pdf
  PRIVACY: env.BASE_URL + 'static/PRIVACY.pdf', // 隐私协议pdf
  IS_PUBLISH_DIALOG: false, // 是否显示发布弹窗
  COOKIEEXPIRES: 0.5, // token在Cookie中存储的天数，默认0.5天
  WORKWEIXINPAGENAME: 'EnterpriseWechat', // 企业微信设置页面路由name
  WxAppConnectorLink: env.WxAppConnectorLink,
}

// 以下仅用于系统信息展示，不作为项目变量使用，请勿在代码中使用
const project = {
  _version: '1.0', // 当前版本信息
  _packageTime: process.env.VUE_APP_PACKETTIME, // 打包时间
  _env: process.env.VUE_APP_ENV, // 前端系统环境模式
}
...
```

## 目录结构

```
├── public  // 静态文件
├── src  // 组件
    ├── api  // 接口
    ├── assets  // 资源（图片）
    ├── components  // 公用组件
    ├── directive  // 公用指令
    ├── layout  // 布局，页面布局，页面组件
    ├── mixins  // 公用混入
    ├── router  // 路由
    ├── store  // 存储
    ├── styles  // 样式
    ├── utils  // 公用方法
    ├── views  // 页面
    ├── App.vue  // 入口页面
    ├── config.js  // 配置文件
    ├── main.js  // main 入口
    └── permission.js  // 权限
├── env.js // 环境变量配置
└── vue.config.js  // vue配置文件
```

## 常见问题

### node-sass 相关库安装报错

node-sass 是一个让人头痛的库，目前本项目的解决方案是通过根目录下的.npmrc来指定该库的安装源。
如果安装时，报`node-gyp` `node-pre-gyp`相关的错误，可能是这个库的错误导致，请确认.npmrc文件下该源是否配置正确。

```bash
registry=https://registry.npm.taobao.org
sass_binary_site=https://npmmirror.com/mirrors/node-sass/
```
