import axios from "axios";
import { Notification, MessageBox, Message } from "element-ui";
import store from "@/store";
import { getToken, setToken } from "@/utils/auth";
import errorCode from "@/utils/errorCode";
import { encryptBase64, encryptWithAes, generateAesKey, decryptWithAes, decryptBase64 } from '@/utils/crypto';
import { encrypt, decrypt } from '@/utils/jsencrypt';
import env from "../../env";

const urlMap = {};
//同一个接口，最短请求间隔
const minDuration = 300;
const tooManyRequest = "TooManyRequest";

const encryptHeader = 'encrypt-key';
axios.defaults.headers["Content-Type"] = "application/json;charset=utf-8";
axios.defaults.headers['clientid'] = env.APP_CLIENT_ID;

// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL:
    process.env.NODE_ENV === "development" ? "/api" : window.lwConfig.DOMAIN,
  // 超时
  timeout: 100000,
  //解决params中,中括号不自动进行url编码的问题
  paramsSerializer: params => {
    const parts = []
    for (let key in params) {
      const value = params[key]
      if (Array.isArray(value)) {
        for (let val of value) {
          parts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(val)}`)
        }
      } else if(value != null) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      }
    }
    return parts.join('&')
  }
});

// request拦截器
service.interceptors.request.use(
  (config) => {
    //对post和delete做限制，对同一个请求，请求间隔小于minDuration，做拦截
    if (["delete", "post"].includes(config.method)) {
      let now = Date.now();
      if (urlMap[config.url]) {
        let last = urlMap[config.url];
        if (now - last < minDuration) {
          config.url = tooManyRequest;
          return config;
        }
      }
      urlMap[config.url] = now;
    }
    // 是否需要设置 token
    const isToken = (config.headers || {}).isToken === false;
    if (getToken() && !isToken) {
      config.headers = Object.assign(config.headers, window.lwConfig.headers); // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    // 是否需要加密
    const isEncrypt = (config.headers || {}).isEncrypt === true;
    // 当开启参数加密
    if (isEncrypt && (config.method === 'post' || config.method === 'put')) {
      // 生成一个 AES 密钥
      const aesKey = generateAesKey();
      config.headers[encryptHeader] = encrypt(encryptBase64(aesKey));
      config.data = typeof config.data === 'object' ? encryptWithAes(JSON.stringify(config.data), aesKey) : encryptWithAes(config.data, aesKey);
    }
    // FormData数据去请求头Content-Type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    config.headers.clientid = env.APP_CLIENT_ID;
    return config;
  },
  (error) => {
    console.log(error);
    Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (res) => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode["default"];
    if (code === 200 || code === 433 || code === 226) {
      return res.data;
    } else if (code === 401) {
      MessageBox.confirm(
        "登录状态已过期，您可以继续留在该页面，或者重新登录",
        "系统提示",
        {
          confirmButtonText: "重新登录",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        store.dispatch("LogOut").then(() => {
          location.href = window.lwConfig.BASE_URL;
        });
      });
    } else {
      if (process.env.NODE_ENV === "development") {
        Message({
          message: `后端错误：接口：${res.config.url}，${code}错误：${msg}`,
          type: "error",
        });
      } else if ([40029, -10002].includes(code)) {
        // 不合法的oauth_code,租户未授权等
        MessageBox.confirm(msg, "系统提示", {
          confirmButtonText: "重新登录",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          store.dispatch("LogOut").then(() => {
            location.href = window.lwConfig.BASE_URL;
          });
        });
      } else {
        Notification.error({
          title: msg,
        });
      }
      return Promise.reject(res.data);
    }
  },
  (error) => {
    console.log("err: " + error);
    let { message: msg, response, config } = error;
    if (msg == "Network Error") {
      msg = "后端接口连接异常";
    } else if (msg.includes("timeout")) {
      msg = "系统接口请求超时";
    } else if (config.url == tooManyRequest) {
      msg = "请勿点击太快";
      config.url = "";
    } else if (response) {
      let status = response.status;
      msg = "系统接口:" + status + "异常";
    }
    Message({
      message: `${msg}:${config.url}`,
      type: "error",
      duration: 5 * 1000,
    });
    return Promise.reject();
  }
);

export default service;
