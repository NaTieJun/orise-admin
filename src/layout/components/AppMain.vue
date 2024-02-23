<template>
  <transition name="fade-transform" mode="out-in">
    <router-view class="page app-main" :key="key" />
    <!-- <keep-alive :include="cachedViews">
      </keep-alive> -->
  </transition>
</template>

<script>
  export default {
    name: 'AppMain',
    computed: {
      cachedViews () {
        return this.$store.state.tagsView.cachedViews
      },
      key () {
        return this.$route.path
      }
    }
  }
</script>

<style lang="scss" scoped>
  .app-main {
    width: 100%;
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .fixed-header + .app-main {
    padding-top: 50px;
  }

  .hasTagsView {
    .app-main {
      height: calc(100vh - 84px);
    }

    .fixed-header + .app-main {
      padding-top: 84px;
    }
  }
</style>

<style lang="scss">
  // fix css style bug in open el-dialog
  .el-popup-parent--hidden {
    .fixed-header {
      padding-right: 15px;
    }
  }
</style>
