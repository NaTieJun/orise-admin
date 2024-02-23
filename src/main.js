import Vue from 'vue'
import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets
import 'video.js/dist/video-js.css'

// 该插件局部引入有bug
import SuperFlow from 'vue-super-flow'
import 'vue-super-flow/lib/index.css'
Vue.use(SuperFlow)

import Element from 'element-ui'
import './styles/element-variables.scss'
Vue.use(Element, {
  size: Cookies.get('size') || 'small', // set element-ui default size
})

//基于高德地图的amap组件
import VueAMap from 'vue-amap';
Vue.use(VueAMap);
VueAMap.initAMapApiLoader({
  key: '95c618d3cfd88b118d2d1b77fea5b807',
  plugin: ['AMap.Autocomplete', 'AMap.PlaceSearch', 'AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'Geocoder', 'AMap.PolyEditor', 'AMap.CircleEditor', 'Geolocation'],
  // 默认高德 sdk 版本为 1.4.4
  v: '1.4.4'
});

import '@/styles/index.scss' // global css
import './config'
import App from './App'
import store from './store'
import router from './router'
import './assets/icons' // icon
import './permission' // permission control

// 全局组件挂载
Vue.component('Pagination', () => import('@/components/Pagination'))
Vue.component('RightToolbar', () => import('@/components/RightToolbar'))
Vue.component('Upload', () => import('@/components/Upload'))

import { getDicts } from '@/api/system/dict/data'
import { getConfigKey } from '@/api/system/config'
// 全局方法挂载
Vue.prototype.getDicts = getDicts
Vue.prototype.getConfigKey = getConfigKey
import ClipboardJS from 'clipboard'

ClipboardJS.prototype.e = {
  success: [
    {
      fn() {
        Element.Notification.success({
          title: '成功',
          message: '链接已复制到剪切板，可粘贴。',
        })
      },
    },
  ],
  error: [
    {
      fn() {
        Element.Notification.error({
          title: '成功',
          message: '链接复制失败',
        })
      },
    },
  ],
}
import * as methods from '@/utils/common'
import { pickerOptions } from '@/utils/index'
Object.assign(Vue.prototype, methods, {
  // 动态配置
  lwConfig: window.lwConfig,
  // 日期时间控件快捷配置
  pickerOptions,
  ClipboardJS,
  msgSuccess(msg) {
    this.$message({
      showClose: true,
      message: msg,
      type: 'success',
    })
  },
  msgError(msg) {
    this.$message({ showClose: true, message: msg, type: 'error' })
  },
  msgInfo(msg) {
    this.$message.info(msg)
  },
})

import * as filters from "./utils/filters.js"; // global filter
/**
 * 全局filters
 */

Object.keys(filters).forEach((key) => {
  Vue.filter(key, filters[key]);
});

import Driver from 'driver.js'
import 'driver.js/dist/driver.min.css'
Vue.prototype.$driver = new Driver({
  className: 'scoped-class',
  allowClose: false, //禁止点击外部关闭
  doneBtnText: '完成', // 完成按钮标题
  closeBtnText: '关闭', // 关闭按钮标题
  stageBackground: '#fff', // 引导对话的背景色
  nextBtnText: '下一步', // 下一步按钮标题
  prevBtnText: '上一步', // 上一步按钮标题
  keyboardControl: false, // 禁止键盘控制
  // showButtons:false
})

import directive from './directive'
Vue.use(directive)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App),
})
