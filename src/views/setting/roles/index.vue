<template>
  <div>
    <div class>
      <el-row type="flex" justify="space-between">
        <el-col :span="5" class="l-panel left">
          <div class="title">
            <div class="title-name">角色列表</div>
            <el-button plain @click="addFn">新建</el-button>
          </div>
          <div class="item-list">
            <div class="item" :class="{ active: activeIndex == key }" v-for="(role, key) in roles" :key="role.id" @click="switchRole(key, role)">
              <div class="name">
                {{ role.roleName }}
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="19" class="g-pad20">
          <div>
            <div class="title-name">{{ currentStatus === 'detail' ? '角色详情' : currentStatus === 'add' ? '新建角色' : '编辑角色' }}</div>
            <div v-if="currentStatus === 'detail'">
              <div style="margin-top: 20px;">
                <el-form ref="codeForm" label-position="right" label-width="100px">
                  <el-form-item label="权限字符">
                    <el-input disabled style="width: 400px;" v-model="roleObj.roleKey"  maxlength="64" />
                  </el-form-item>
                  <el-form-item label="功能权限">
                    <el-tree :data="menuOptions" show-checkbox ref="menu" node-key="id" disabled empty-text="加载中，请稍后" :props="defaultProps"></el-tree>
                  </el-form-item>
                </el-form>
              </div>
              <div class="bottom" v-if="roles[activeIndex] && roles[activeIndex].roleKey != 'superadmin'">
                <el-button plain type="danger" @click="deleteFn">删除</el-button>
                <el-button type="primary" @click="edtiFn">编辑</el-button>
              </div>
            </div>
            <div v-else-if="currentStatus === 'add'">
              <add-or-edit key="1" :status="currentStatus" @update="updateFn" @cancel="doCancel" :list="menuOptions" :checkedKeys="menuCheckedKeys" :allRoles="roles" />
            </div>
            <div v-else>
              <add-or-edit key="2" :status="currentStatus" :data="roleObj" @update="updateFn" @cancel="doCancel" :list="menuOptions" :checkedKeys="menuCheckedKeys" :allRoles="roles" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
import { getRolesList, getRoleDetail, treeselect, deleteRole, roleMenuTreeselect } from '@/api/organization'
import AddOrEdit from './add.vue'
export default {
  name: 'manage-center-roles',
  data() {
    return {
      roles: [],
      activeIndex: 0,
      roleObj: {
        users: []
      },
      currentStatus: 'detail',
      defaultProps: {
        children: 'children',
        label: 'label',
        disabled: this.isDisabled
      },
      menuOptions: [],
      menuCheckedKeys: [],
      dataScopeOptions: [
        {
          value: '1',
          label: '全部数据权限'
        },
        {
          value: '2',
          label: '自定数据权限'
        },
        {
          value: '3',
          label: '本部门数据权限'
        },
        {
          value: '4',
          label: '本部门及以下数据权限'
        },
        {
          value: '5',
          label: '仅本人数据权限'
        }
      ]
    }
  },
  components: {
    AddOrEdit
  },
  created() {
    this.fetchList()
  },
  methods: {
    isDisabled() {
      return true
    },
    setName() {
      let str = ''
      this.dataScopeOptions.map((data) => {
        if (data.value == this.roleObj.dataScope) {
          str = data.label
        }
      })
      return str
    },
    updateFn() {
      if (this.currentStatus === 'edit') {
        this.currentStatus = 'detail'
        getRolesList().then((res) => {
          this.roles = res.rows
        })
        this.getRoleDetailFn(this.roles[this.activeIndex].roleId)
        this.getMenuTreeselect(this.roles[this.activeIndex].roleId)
      } else {
        this.currentStatus = 'detail'
        this.fetchList()
      }
    },
    doCancel() {
      this.$confirm(`是否确认取消${this.currentStatus === 'add' ? '新建' : '编辑'}角色？取消后不可恢复。`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.currentStatus = 'detail'
          this.getRoleDetailFn(this.roleObj.roleId)
          this.getMenuTreeselect(this.roleObj.roleId)
        })
        .catch(function () { })
    },
    fetchList() {
      getRolesList().then((res) => {
        this.roles = res.rows
        if (this.roles && this.roles.length) {
          this.activeIndex = 0
          this.getRoleDetailFn(this.roles[0].roleId)
          this.getMenuTreeselect(this.roles[0].roleId)
        }
      })
    },
    getRoleDetailFn(id) {
      getRoleDetail(id).then((res) => {
        this.roleObj = res.data
        if (this.roleObj.menus) {
          let arr = this.roleObj.menus.map((data) => {
            return data.menuId
          })
        }
      })
    },
    addFn() {
      if (this.currentStatus !== 'detail') {
        this.$confirm(`是否确认取消${this.currentStatus === 'add' ? '新建' : '编辑'}角色？取消后不可恢复。`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.menuOptions = []
            this.currentStatus = 'add'
          })
          .catch(function () { })
      } else {
        this.currentStatus = 'add'
      }
    },
    switchRole(index, data) {
      if (this.currentStatus !== 'detail') {
        this.$confirm(`是否确认取消${this.currentStatus === 'add' ? '新建' : '编辑'}角色？取消后不可恢复。`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.currentStatus = 'detail'
            this.activeIndex = index
            this.getRoleDetailFn(data.roleId)
            this.getMenuTreeselect(data.roleId)
          })
          .catch(function () { })
      } else {
        this.activeIndex = index
        this.getRoleDetailFn(data.roleId)
        this.getMenuTreeselect(data.roleId)
      }
    },
    edtiFn() {
      this.currentStatus = 'edit'
    },
    deleteFn() {
      this.$confirm('是否确认删除角色？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteRole(this.roleObj.roleId).then((res) => {
            this.fetchList()
          })
        })
        .catch(function () { })
    },
    /** 查询菜单树结构 */
    getMenuTreeselect(id) {
      roleMenuTreeselect(id).then((response) => {
        this.menuOptions = response.data.menus
        this.menuCheckedKeys = response.data.checkedKeys
        this.$refs.menu.setCheckedKeys(response.data.checkedKeys)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.title-name {
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 600;
  color: $text;
  display: flex;
  align-items: center;
}
.bottom {
  display: flex;
  justify-content: flex-end;
  border-radius: 5px;
  padding: 20px;
  background-color: #ffffff10;
}
.left {
  padding: 16px;
  .title {
    color: #3c88f0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title-btn {
      cursor: pointer;
      display: flex;
      align-items: center;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #3c88f0;

      &:hover {
        opacity: 0.7;
      }
    }
  }

  .item-list {
    max-height: calc(100vh - 190px);
    padding-top: 20px;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;

    .item {
      cursor: pointer;
      display: flex;
      align-items: center;
      font-size: 12px;
      color: $text;
      height: 40px;
      line-height: 40px;
      width: 100%;
      padding-left: 20px;
      border: 1px solid #ffffff00;
      border-radius: 5px;
      .name {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .dropdown {
        .dot {
          cursor: pointer;
          width: 14px;
          height: 14px;
          line-height: 14px;
          font-size: 14px;
          font-family: JMT-Font, JMT;
          font-weight: normal;
          color: #3c88f0;
          margin-right: 20px;
          margin-left: 5px;
        }
      }

      &:hover {
        background: rgba(255, 153, 32, 0.1);
      }
    }

    .active {
      background: rgba(255, 153, 32, 0.1);
      border: 0.5px solid #ff9920;
      border-radius: 5px;
    }
  }
}
</style>
