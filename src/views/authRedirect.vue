<script>
  import { wxQrLogin } from '@/api/login'
  import { getQueryValue } from '@/utils/index'
  import { setToken } from '@/utils/auth'
  export default {
    components: {},
    props: {},
    data() {
      return {}
    },
    watch: {},
    computed: {},
    async beforeCreate() {
      let auth_code = getQueryValue('code')
      try {
        let { data } = await wxQrLogin(auth_code)
        setToken(data.access_token)
        // 用以重置浏览器回调的url
        history.replaceState({}, 'page', window.lwConfig.BASE_URL)
        this.$router.replace('/')
      } catch (error) {
        console.log(error)
      }
    },
    mounted() {},
    methods: {}
  }
</script>

<template>
  <div></div>
</template>
