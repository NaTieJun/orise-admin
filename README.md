[🔥 充电平台微服务源码](https://gitee.com/orise001/orise-charge-cloud)

[🔥 充电管理后台源码](https://gitee.com/orise001/orise-admin)

[🔥 充电小程序源码](https://gitee.com/orise001/orise-mp)

## 开发

```bash
# 克隆项目
git clone https://gitee.com/ucode001/omind-charge-admin.git

# 进入项目目录
cd linkwe-ui

# 安装依赖
npm install

# 建议不要直接使用 cnpm 安装依赖，会有各种诡异的 bug。可以通过如下操作解决 npm 下载速度慢的问题
npm install --registry=https://registry.npm.taobao.org

# 启动服务
npm run serve
```

浏览器访问 http://localhost:80

## 发布

```bash
# 构建测试环境（暂未配置）
# npm run build:stage

# 构建生产环境
npm run build
```
