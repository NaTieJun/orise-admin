<script>
import { treeStation } from '@/api/facility/station'

export default {
  components: {},
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '选择优惠券'
    },
    currentNodeKey: {
      type: String,
      default: ''
    },
    // 多选
    multiSelect: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default: () => []
    },
    showAllNode: {
      type: Boolean,
      default: false
    },
    enableStationOnly: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      loading: true, // 遮罩层
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      query: {
        pageNum: 1,
        pageSize: 20,
        groupLeader: '',
        groupName: '',
        beginTime: '',
        endTime: ''
      },
      tree: [],
      total: 0, // 总条数
      selectedGroup: '',
      multiSelectedGroups: [],
      selectedNodeKey: undefined
    }
  },
  computed: {
    Pvisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    // 获取树
    fetchList() {
      this.loading = true
      treeStation()
        .then(({ data }) => {
          let t = data
          let firstStation = {
            name: "",
            id: "",
            type: ""
          }
          t.forEach(province => {
            province.children = province.stationList
            province.name = province.areaVo.name
            province.id = province.areaCode
            province.type = "province"
            province.children.forEach(station => {
              station.name = station.stationName
              station.id = station.stationId
              station.type = "station"
              if (!firstStation.name) {
                firstStation.name = station.name
                firstStation.id = station.id
                firstStation.type = station.type
              }
            })
          })

          let treeData = [];
          const nodeAll = {
            name: "全部",
            id: "",
            type: ""
          }
          if (this.showAllNode) {
            treeData.push(nodeAll);
          }
          treeData = treeData.concat(t)
          this.tree = treeData
          this.loading = false
          if (this.showAllNode && t && t.length > 0) {
            this.$emit('selectNode', nodeAll)
          }
          if (firstStation.name) { //选择第一个站
            this.$nextTick(() => {
              this.$refs.tree.setCurrentKey(firstStation.id)
              this.handleNodeClick(firstStation)
            })
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    handleNodeClick(data, node) {
      if (this.enableStationOnly && data.type != "station") {
        this.$refs.tree.setCurrentKey(this.selectedNodeKey)
      } else {
        this.selectedNodeKey = data.id;
        this.$emit('selectNode', data)
      }
    },
  }
}
</script>

<template>
  <div>
    <el-tree
      :data="tree"
      :props="defaultProps"
      @node-click="handleNodeClick"
      node-key="id"
      highlight-current
      :current-node-key="currentNodeKey"
      default-expand-all
      label-class-name="hover-style"
      :expand-on-click-node="false"
      ref="tree"
    ></el-tree>
  </div>
</template>

<style lang="scss" scoped>
::v-deep .el-tree-node > .el-tree-node__content {
  padding: 3px 0;
  height: auto;
}

::v-deep
  .el-tree--highlight-current
  .el-tree-node.is-current
  > .el-tree-node__content {
  // 设置颜色
  background-color: #0089c9;
  color: #fff;
}
.hover-style:hover {
  background-color: #e6f3fa;
}
.not-clickable {
  cursor: not-allowed;
  pointer-events: none;
}
</style>
