import router from './router'
import store from './store'
import { Message } from 'element-ui'
// import NProgress from 'nprogress'
// import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'

// NProgress.configure({ showSpinner: false })

const whiteList = ['/authRedirect', '/bind', '/test'] // 不管有没有token都可直接进入的页面路径
const noLoginList = ['/login', '/register'] // 没有token才能进入的页面
router.beforeEach((to, from, next) => {
  // NProgress.start()
  // 无需检测token的， 不管有没有token都可直接进入
  if (whiteList.includes(to.path) || to.meta.isNoLogin) {
    next()
  } else if (getToken()) {
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      // NProgress.done()
    } else {
      if (store.getters.roles.length === 0) {
        // 判断当前用户是否已拉取完user_info信息
        store.dispatch('GetInfo').then((res) => {
          // 拉取user_info
          const roles = res.roles
          store.dispatch('GenerateRoutes', { roles }).then((accessRoutes) => {
            // 测试 默认静态页面
            next({ ...to, replace: true })
            // store.dispatch('permission/generateRoutes', { roles }).then(accessRoutes => {F
          })
        })
        // .catch((err) => {
        //   store.dispatch('LogOut').then(() => {
        //     Message.error(err)
        //     next({ path: '/' })
        //   })
        // })
      } else {
        next()
      }
    }
  } else if (noLoginList.includes(to.path)) {
    // 没有token才能进入的页面
    next()
  } else {
    next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
    // NProgress.done()
  }
})

router.afterEach(() => {
  // NProgress.done()
})
