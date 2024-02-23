import { getProCityList } from '@/api/common'

const state = {
  areaObject: {},
  areaArray: [],
  dict: {},
  queue: []
}

const mutations = {
  SET_AREA: (state, { type, list }) => {
    // 设置值：注意得用Vue.set方法
    Vue.set(state.dict, 'area', list)
  },
  SET_DICT: (state, { type, list }) => {
    // 设置值：注意得用Vue.set方法
    Vue.set(state.dict, type, list)
  },
  SET_QUEUE: (state, type) => {
    state.queue.push(type)
  },
  DEL_QUEUE: (state, type) => {
    // 找到并删除
    for (let i = 0; i < state.queue.length; i++) {
      const item = state.queue[i]
      if (item === type) {
        state.queue.splice(i, 1)
        break
      }
    }
  }
}

const actions = {
  // 缓存字典内容
  dict({ commit, state }, type) {
    // 判断是否已经缓存过，缓存过后将不再获取数据
    const isExistence = state.queue.some((item) => {
      return item === 'dict/' + type
    })
    // 没有缓存则请求数据
    if (!isExistence) {
      // 在异步请求之前将该任务标记为已缓存（存入队列）
      commit('SET_QUEUE', 'dict/' + type)
      return new Promise((resolve, reject) => {
        return getProCityList()
          .then((res) => {
            const { code, data } = res
            if (code && code !== 200) {
              // 获取失败移除缓存队列
              commit('DEL_QUEUE', 'dict/' + type)
              reject(res)
            } else {
              // 获取到的值存入字典
              commit('SET_AREA', { type: type, list: data })
              resolve(res)
            }
          })
          .catch((error) => {
            // 获取失败移除缓存队列
            commit('DEL_QUEUE', 'dict/' + type)
            reject(error)
          })
      })
    } else {
      return state.dict[type]
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

