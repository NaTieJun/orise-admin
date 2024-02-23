<template>
  <div class="navbar main-size">
    <logo />
    <div class="right-menu">
      <template v-if="device !== 'mobile'">
      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <!-- Omind -->
          <div class="user-avatar">
            <img :src="avatar" class="user-avatar-img" />
          </div>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/user/profile" v-if="hasPermission(['user:profile'])">
            <el-dropdown-item>基本资料</el-dropdown-item>
          </router-link>
          <router-link to="/user/password" v-if="hasPermission(['user:password'])">
            <el-dropdown-item>修改密码</el-dropdown-item>
          </router-link>
          <el-dropdown-item @click.native="logout">
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { isExternal } from '@/utils/validate'
import { mapGetters } from 'vuex'
import Logo from './Logo'
import store from '@/store'


import TopNav from './TopNav'

export default {
  data() {
    return {
      customerServiceQr: "",
    }
  },
  components: {
    Logo,
    TopNav
  },
  computed: {
    ...mapGetters(['avatar', 'device', 'permission_routes']),
    setting: {
      get() {
        return this.$store.state.settings.showSettings
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'showSettings',
          value: val
        })
      }
    },
  },
  mounted() {
  },
  methods: {
    async logout() {
      this.$confirm('确定注销并退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('LogOut').then(() => {
          location.href = window.lwConfig.BASE_URL
        })
      })
    },
    goto(type) {
      window.open(type ? 'https://www.yuque.com/linkwechat/help/dsatfs' : 'https://gitee.com/LinkWeChat/link-wechat')
    },
    goLink2() {
      window.open("https://work.weixin.qq.com/wework_admin/loginpage_wx?from=myhome_baidu", '_blank')
    },
    goLink(path) {
      if (!isExternal(path)) {
        this.$router.push({ path })
      } else {
        window.open(path, '_blank')
      }
    },
    hasPermission (binding) {
      const all_permission = "*:*:*";
      const permissions = store.getters && store.getters.permissions

      if (binding && binding instanceof Array && binding.length > 0) {
        const permissionFlag = binding

        const hasPermissions = permissions.some(permission => {
          return all_permission === permission || permissionFlag.includes(permission)
        })

        return hasPermissions;
      } else {
        return false
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.hover-class {
  display: flex;
  flex-direction: column;
  align-items: center;
  span:nth-child(1) {
    font-size: 18px;
    font-weight: bold;
    line-height: 36px;
    margin-bottom: 10px;
  }
  img {
    width: 160px;
    height: 160px;
  }
  span:nth-child(3) {
    font-size: 14px;
    line-height: 16px;
    margin-top: 20px;
  }
}
.side-box {
  width: 50px;
  height: 50px;
  background-color: #0079de;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  .right-icon {
    font-size: 24px !important;
  }
}
.side-box:hover {
  cursor: pointer;
}
//
.navbar {
  display: flex;
  align-items: center;
  width: 100%;
  height: 58px;
  overflow: hidden;
  position: relative;
  color: #fff;

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    position: absolute;
    right: 12px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      font-size: 18px;
      // color: #5a5e66;
      vertical-align: middle;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }

      .document {
        font-size: 20px;
      }
    }

    .avatar-container {
      // margin-right: 30px;

      .avatar-wrapper {
        position: relative;
        color: #fff;
        .user-avatar {
          display: inline-block;
          position: relative;
          width: 30px;
          height: 30px;
          border-radius: 20%;
          vertical-align: middle;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
          .user-avatar-img {
            width: 100%;
            height: 100%;
          }
        }

        .el-icon-caret-bottom {
          margin-left: 3px;
          font-size: 12px;
        }
      }
    }
  }
}

.nav-scrollbar {
  width: calc(100% - 450px);
  ::v-deep.el-scrollbar__view {
    white-space: nowrap;
    line-height: 58px;
  }
  .nav {
    display: inline-block;
    margin: 0 20px;
    flex: none;
    position: relative;
    cursor: pointer;
    &.active::after {
      content: "";
      display: inline-block;
      position: absolute;
      bottom: 2px;
      width: 42px;
      height: 2px;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 6px;
      background: #fff;
    }
  }
}

.item {
  margin-right: 10px;
}
</style>
