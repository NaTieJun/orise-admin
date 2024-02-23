<template>
  <div class="app-container">
    <el-row type="flex" justify="center" :gutter="20">
      <el-col :span="10" :xs="24">
        <el-card>
          <div slot="header" class="clearfix">
            <span>基本资料</span>
          </div>
          <userInfo :user="user" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import userInfo from './userInfo'
  import { getUserProfile } from '@/api/system/user'

  export default {
    name: 'Profile',
    components: {userInfo },
    data () {
      return {
        user: {},
      }
    },
    created () {
      this.getUser()
    },
    methods: {
      getUser () {
        getUserProfile().then((response) => {
          this.user = response.data.user
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
