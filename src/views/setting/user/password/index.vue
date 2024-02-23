<template>
  <div class="app-container">
    <el-row type="flex" justify="center" :gutter="20">
      <el-col :span="10" :xs="24">
        <el-card>
          <div slot="header" class="clearfix">
            <span>修改密码</span>
          </div>
          <resetPwd :user="user" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import resetPwd from './resetPwd'
  import { getUserProfile } from '@/api/system/user'

  export default {
    name: 'Password',
    components: { resetPwd },
    data () {
      return {
        user: {},
        roleGroup: {},
        postGroup: {},
      }
    },
    created () {
      this.getUser()
    },
    methods: {
      getUser () {
        getUserProfile().then((response) => {
          this.user = response.data
          this.roleGroup = response.roleGroup
          this.postGroup = response.postGroup
        })
      },
    },
  }
</script>
<style lang="scss" scoped>
  ::v-deep .svg-icon {
    margin-right: 5px;
  }
</style>
