<template>
  <div class="login">
    <div class="login-wrap">
      <div class="login-form-wrap">
        <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form">
          <h3 class="title">
            <img v-if="logo" :src="logo" class="sidebar-logo" />
          </h3>
          <template v-if="loginType === 'account'">
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" type="text" auto-complete="off" placeholder="账号">
                <svg-icon style="height: 33px" slot="prefix" icon-class="user" class="el-input__icon input-icon" />
              </el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="loginForm.password" type="password" auto-complete="off" placeholder="密码" @keyup.enter.native="handleLogin">
                <svg-icon style="height: 33px" slot="prefix" icon-class="password" class="el-input__icon input-icon" />
              </el-input>
            </el-form-item>
            <el-form-item prop="code" v-if="captchaEnabled">
              <div style="display: flex">
                <el-input v-model="loginForm.code" auto-complete="off" placeholder="验证码" @keyup.enter.native="handleLogin">
                  <svg-icon slot="prefix" icon-class="validCode" style="height: 33px" class="el-input__icon input-icon" />
                </el-input>
                <div class="login-code" style="margin-left: 10px">
                  <img :src="codeUrl" @click="getCode" class="login-code-img" />
                </div>
              </div>
            </el-form-item>
            <el-checkbox class="fl" v-model="loginForm.rememberMe" style="margin: 0px 0px 25px 10px">记住密码</el-checkbox>
            <el-form-item style="width: 100%">
              <el-button type="primary" :loading="loading" size="medium" style="width: 100%" @click.native.prevent="handleLogin">
                <span v-if="!loading">登 录</span>
                <span v-else>登 录 中...</span>
              </el-button>
            </el-form-item>
          </template>
          <template v-else>
            <img style="height: 180px; width: 180px" :src="wechatCodeUrl" alt />
            <div class="desc al">扫码加入企业，点击企业微信登录，即可扫码登录系统</div>
            <el-form-item class="ac">
              <a :href="authLink">
                <img
                  src="//wwcdn.weixin.qq.com/node/wwopen/wwopenmng/style/images/independent/brand/300x40_white$4dab5411.png"
                  srcset="//wwcdn.weixin.qq.com/node/wwopen/wwopenmng/style/images/independent/brand/300x40_white_2x$6a1f5234.png 2x"
                  alt="点我加入企业微信"
                />
              </a>
            </el-form-item>
          </template>
        </el-form>
      </div>
    </div>

    <!--  底部  -->
    <div class="el-login-footer">
      <span>{{ lwConfig.COPYRIGHT }}</span>
    </div>
  </div>
</template>

<script>
import { getCodeImg, getCodeInSyetem } from '@/api/login'
import Cookies from 'js-cookie'
import { encrypt, decrypt } from '@/utils/jsencrypt'

export default {
  name: 'Login',
  data() {
    return {
      loginType: 'account',
      codeUrl: '',
      wechatCodeUrl: '',
      cookiePassword: '',
      loginForm: {
        username: '',
        password: '',
        rememberMe: false,
        code: '',
        uuid: '',
        tenantId: '000000'
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', message: '用户名不能为空' }],
        password: [{ required: true, trigger: 'blur', message: '密码不能为空' }],
        code: [{ required: true, trigger: 'change', message: '验证码不能为空' }],
      },
      authLink: '',
      loading: false,
      redirect: undefined,
      dialogVisible: true,
      isDemonstrationLogin: false,
      logo: this.lwConfig.LOGO_TEXT_DARK,
      title: this.lwConfig.SYSTEM_NAME_ALL,
      // 验证码开关
      captchaEnabled: true,
    }
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true,
    },
  },
  created() {
    this.getCode()
    this.getCookie()
  },
  methods: {
    changeLoginType(type) {
      this.loginType = type
      if (type === 'account') {
        this.getCode()
        this.getCookie()
      }
    },
    getCode() {
      getCodeImg().then(({ data }) => {
        this.captchaEnabled = data.captchaEnabled === undefined ? true : data.captchaEnabled;
        if (this.captchaEnabled) {
          this.codeUrl = 'data:image/gif;base64,' + data.img
          this.loginForm.uuid = data.uuid
        }
      })
    },
    getCookie() {
      const username = Cookies.get('username')
      const password = Cookies.get('password')
      const rememberMe = Cookies.get('rememberMe')
      this.loginForm = {
        ...this.loginForm,
        username: username === undefined ? this.loginForm.username : username,
        password: password === undefined ? this.loginForm.password : decrypt(password),
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true
          if (this.loginForm.rememberMe) {
            Cookies.set('username', this.loginForm.username, { expires: 30 })
            Cookies.set('password', encrypt(this.loginForm.password), {
              expires: 30,
            })
            Cookies.set('rememberMe', this.loginForm.rememberMe, {
              expires: 30,
            })
          } else {
            Cookies.remove('username')
            Cookies.remove('password')
            Cookies.remove('rememberMe')
          }
          this.$store
            .dispatch('Login', this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || window.lwConfig.BASE_URL })
            })
            .catch((e) => {
              this.loading = false
              this.getCode()
            })
        }
      })
    },
    goVote() {
      window.open('https://www.oschina.net/p/linkwechat')
    },
    changeDemonAccount(val) {
      this.loginForm.username = val ? 'lw' : ''
      this.loginForm.password = val ? '123456' : ''
    },
  },
}
</script>
<style>
.el-popover {
  width: 280px !important;
}
</style>
<style rel="stylesheet/scss" lang="scss" scoped>
.login-form-wrap {
  position: relative;
  background: rgb(255 255 255 / 50%);
  text-align: center;
  border-radius: 2px;
  height: 415px;
  top: 100px;
  left: 0;
  overflow: hidden;
}
.login-wrap {
  position: relative;
  height: 720px;
}
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/image/login-background.jpg");
  background-size: cover;
}
.title {
  font-size: 24px;
  margin: 30px 10px;
  text-align: left;
  color: #0089c9;
  .sidebar-logo {
    width: 300px;
  }
}

.login-form {
  border-radius: 6px;
  width: 400px;
  padding: 25px 25px 5px 25px;
  top: 100px;
  z-index: 10;
  .el-input {
    height: 38px;
    input {
      height: 38px;
    }
  }
  .desc {
    text-align: center;
    color: #aaa;
    font-size: 12px;
    margin-bottom: 50px;
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
  }
}
.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 33%;
  height: 38px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0px;
  width: 100%;
  text-align: center;
  color: #000;
  text-shadow: 0 0 5px #fff;
  font-size: 12px;
  letter-spacing: 1px;
  z-index: 90;
}
.login-code-img {
  height: 30px;
}
.login ::v-deep.el-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 0vh !important;
}
.el-dialog__body {
  padding: 0px 20px;
}
.link {
  color: $blue;
  font-size: 14px;
  float: right;
  padding-right: 25px;
  &:hover {
    text-decoration: underline;
  }
}
.code_con {
  text-align: center;
  margin-top: 20px;
  img {
    height: 200px;
    width: 200px;
  }
}
</style>
