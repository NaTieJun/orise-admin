import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'

const user = {
  state: {
    token: getToken(),
    name: '',
    userType: '',
    companyName: '',
    avatar: require('@/assets/image/profile.jpg'),
    roles: [],
    permissions: [],
    configParamInfo: {},
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      avatar && (state.avatar = avatar)
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions
    },
    SET_INFO: (state, configParamInfo) => {
      state.configParamInfo = configParamInfo
    },
    SET_USER_TYPE: (state, userType) => {
      state.userType = userType
    },
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      const password = userInfo.password
      const code = userInfo.code
      const uuid = userInfo.uuid
      const tenantId = userInfo.tenantId
      const data = {
        username,
        password,
        code,
        uuid,
        tenantId
      }
      return new Promise((resolve, reject) => {
        login(data)
          .then(({data}) => {
            setToken(data.access_token)
            commit('SET_TOKEN', data.access_token)
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo(state.token).then((res) => {
          try {
            const data = res.data
            const user = data.user
            //
            //const avatar = user.avatar
            // : window.lwConfig.BASE_API + user.avatar
            if (data.roles && data.roles.length > 0) {
              // 验证返回的roles是否是一个非空数组
              commit(
                'SET_ROLES',
                data.roles
              )
              commit('SET_PERMISSIONS', data.permissions)
            } else {
              commit('SET_ROLES', ['ROLE_DEFAULT'])
            }
            commit('SET_NAME', user.nickName)
            // commit('SET_AVATAR', avatar)
            commit('SET_USER_TYPE', user.userType)
            commit('SET_INFO', data.configParamInfo)
            state.companyName = user.companyName
            resolve(data)
          } catch (error) {
            reject(error)
          }
        })
      })
    },

    // 退出系统
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        commit('SET_PERMISSIONS', [])
        removeToken()
        resolve()
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise((resolve) => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    },
  },
}

export default user
