<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label prop="userName">
        <el-input v-model="queryParams.name" placeholder="搜索管理员名称" clearable size="small" @keyup.enter.native="doSearch" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" size="mini" @click="doSearch">搜索</el-button>
      </el-form-item>
    </el-form>

    <div class="mb8">
      <el-button type="primary" icon="el-icon-plus" @click="doAdd" >新增</el-button>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="fetchList"></right-toolbar>
    </div>

    <el-table v-loading="loading" :data="menuList" class="l-panel" border :height="`calc(100vh - ${showSearch?'250px':'203px'})`">
      <el-table-column type="index" width="55" align="center"></el-table-column>
      <el-table-column prop="userName" label="管理员" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="nickName" label="用户昵称" width="200" align="center"></el-table-column>
      <el-table-column prop="phonenumber" label="手机号" width="150" align="center"></el-table-column>
      <el-table-column prop="orderNum" label="状态" width="150" align="center">
        <template slot-scope="scope">
          <el-tag type="danger" v-if="scope.row.status==1">禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="200">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding">
        <template slot-scope="scope">
          <el-button v-if="scope.row.userId != 1" size="mini" type="text" icon="el-icon-edit" @click="doEdit(scope.row)">修改</el-button>
          <el-button v-if="scope.row.userId != 1" size="mini" type="text" icon="el-icon-lock" @click="handleResetPwd(scope.row)">修改密码</el-button>
          <el-button
            size="mini"
            type="text"
            :icon="scope.row.status==0?'el-icon-circle-close':'el-icon-refresh-left'"
            @click="handleDeal(scope.row)"
            v-if="scope.row.userId != 1"
          >{{scope.row.status==0?'禁用':'恢复'}}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="fetchList()" />

    <!-- 添加或修改管理员对话框 -->
    <el-drawer :title="title" :visible.sync="open" size="600px">
      <div class="el-drawer__content">
        <el-form ref="form" :model="form.user" :rules="rules" label-width="120px" size="mini">
          <el-row>
            <el-col :span="24">
              <el-form-item label="用户名" prop="userName">
                <el-input v-model="form.user.userName" placeholder :disabled="disableUserName" maxlength="30" />
              </el-form-item>
            </el-col>
            <el-col :span="24" v-if="!form.user.userId">
              <el-form-item label="密码" prop="password">
                <el-input v-model="form.user.password" show-password maxlength="100" />
              </el-form-item>
            </el-col>
            <el-col :span="24" >
              <el-form-item label="用户昵称" prop="nickName">
                <el-input v-model="form.user.nickName"  maxlength="100" />
              </el-form-item>
            </el-col>
            <el-col :span="24" >
              <el-form-item label="手机号" prop="phonenumber">
                <el-input v-model="form.user.phonenumber"  maxlength="100" />
              </el-form-item>
            </el-col>
            <el-col :span="24" >
              <el-form-item label="角色" prop="roleId">
                <SelectRole :visible.sync="dialogVisibleSelectRole" @success="submitSelectRole" :selected="form.user.roles" :multiSelect="true" />
                <el-tag type="info" size="medium" v-for="(role, index) in form.user.roles" :key="index">{{ role.roleName}}</el-tag>
                <el-button
                  type
                  plain
                  class="ml10"
                  icon="el-icon-edit"
                  size="mini"
                  @click="dialogVisibleSelectRole = true"
                >{{ form.user.roles.length ? '编辑' : '添加' }}</el-button>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="form.user.remark" placeholder maxlength="500" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div class="el-drawer__footer">
          <el-button type="primary" @click="doSave">保 存</el-button>
          <el-button @click="doCancel">取 消</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 添加或修改密码对话框 -->
    <el-drawer title="修改密码" :visible.sync="openPwd" size="600px">
      <div class="el-drawer__content">
        <el-form ref="formPwd" :model="formPwd" :rules="rulesPwd" label-width="120px" size="mini">
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="formPwd.newPassword" placeholder="请输入新密码" type="password" />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="formPwd.confirmPassword" placeholder="请确认密码" type="password" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="mini" @click="submitResetPwd">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { listUserPage, getSystemUser, addUser, updateUser, editUserRole, resetUserPwd, changeUserStatus } from '@/api/system/user'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import IconSelect from '@/components/IconSelect'
import SelectCity from '@/components/common/SelectCity'
import SelectRole from '@/components/SelectRole'
import SelectAgent from '@/components/SelectAgent'

export default {
  name: 'Menu',
  components: { Treeselect, IconSelect, SelectCity, SelectRole, SelectAgent },
  data() {
    const equalToPassword = (rule, value, callback) => {
      if (this.formPwd.newPassword !== value) {
        callback(new Error("两次输入的密码不一致"));
      } else {
        callback();
      }
    };
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 管理员表格树数据
      menuList: [],
      // 管理员树选项
      menuOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      openPwd: false,
      // 显示状态数据字典
      visibleOptions: [
        {
          dictValue: '0',
          dictLabel: '显示'
        },
        {
          dictValue: '1',
          dictLabel: '隐藏'
        }
      ],
      // 管理员状态数据字典
      statusOptions: [],
      total: 0,
      // 查询参数
      queryParams: {
        userName: undefined,
        visible: undefined,
        pageNum: 1,
        pageSize: 20,
      },
      // 表单参数
      form: {
        user: {
          roles: [],
          userId: undefined,
          userName: undefined,
          password: undefined,
          deptId: undefined,
          remark: undefined,

        },
      },
      formPwd: {},
      // 表单校验
      rules: {
        userName: [{ required: true, message: '管理员名称不能为空', trigger: 'blur' }],
        orderNum: [{ required: true, message: '管理员顺序不能为空', trigger: 'blur' }],
        nickName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
        password: [{ required: true, message: '密码不能为空', trigger: 'blur' }, { min: 6, message: '密码不能少于6位', trigger: 'blur' }]
      },
      // 表单校验
      rulesPwd: {
        newPassword: [
          { required: true, message: "新密码不能为空", trigger: "blur" },
          { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" }
        ],
        confirmPassword: [
          { required: true, message: "确认密码不能为空", trigger: "blur" },
          { required: true, validator: equalToPassword, trigger: "blur" }
        ]
      },
      activeName: 'first',
      serviceTagOptions: [{
        value: 'HTML',
        label: 'HTML'
      }, {
        value: 'CSS',
        label: 'CSS'
      }, {
        value: 'JavaScript',
        label: 'JavaScript'
      }],
      dialogVisibleSelectRole: false,
      disableUserName: false
    }
  },
  created() {
    this.fetchList()
    this.getDicts('sys_show_hide').then((response) => {
      this.visibleOptions = response.data
    })
    this.getDicts('sys_normal_disable').then((response) => {
      this.statusOptions = response.data
    })
  },
  methods: {
    // 选择
    submitSelectRole(item) {
      this.form.user.roles = item
    },
    /** 查询管理员列表 */
    fetchList() {
      this.loading = true
      listUserPage(this.queryParams).then((response) => {
        this.menuList = response.rows
        this.total = Number(response.total)
        this.loading = false
      })
    },
    // 取消按钮
    doCancel() {
      this.open = false
      this.reset()
    },
    // 取消按钮
    pwdCancel() {
      this.openPwd = false
      // this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        user: {
          userId: undefined,
          userName: undefined,
          password: undefined,
          deptId: undefined,
          remark: undefined,
          roles: [],
        },
      }
      this.resetForm('form')
    },
    // 表单重置
    resetPwd() {
      this.formPwd = {
        password: undefined,
        passwordConfirm: undefined,
      }
      this.resetForm('formPwd')
    },
    /** 搜索按钮操作 */
    doSearch() {
      this.queryParams.pageNum = 1
      this.fetchList()
    },
    /** 新增按钮操作 */
    doAdd(row) {
      this.reset()
      this.open = true
      this.disableUserName = false;
      this.title = '添加管理员'
    },
    /** 修改按钮操作 */
    doEdit(row) {
      this.reset()
      this.disableUserName = true;
      getSystemUser(row.userId).then((response) => {
        this.form = response.data
        this.open = true
        this.title = '修改管理员'
      })
    },
    /** 修改密码操作 */
    handleResetPwd(row) {
      this.resetPwd()
      this.formPwd.userId = row.userId
      this.openPwd = true
    },
    /** 提交按钮 */
    doSave: function () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          let params = Object.assign({}, this.form.user)
          params.roleIds = this.form.user.roles.map(c => { return c.roleId })
          if (this.form.user.userId != undefined) {
            updateUser(params).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.fetchList()
              }
            })
          } else {
            addUser(params).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.fetchList()
              }
            })
          }
        }
      })
    },
    /** 切换用户状态操作 */
    handleDeal(row) {
      let text = row.status === "0" ? "禁用" : "恢复"
      this.$confirm('确认要"' + text + '""' + row.userName + '"用户吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      .then(function () {
        let status = row.status == "0" ? "1" : "0"; 
        return changeUserStatus(row.userId, status)
      })
      .then(() => {
        row.status = row.status == "0" ? "1" : "0"; 
        this.msgSuccess(`${text}成功`)
      })
      .catch(function (e) { 
        
      })
    },
    // 修改密码
    submitResetPwd() {
      this.$refs["formPwd"].validate(valid => {
        if (valid) {
          resetUserPwd(this.formPwd.userId, this.formPwd.newPassword).then(
            response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
              }
              this.openPwd = false
            }
          );
        }
      });
    },
  }
}
</script>

<style lang="scss" scoped>
.select-city {
  // display: flex !important;
  ::v-deep .el-form-item {
    display: inline-block;
    padding: 0 8px 0 0;
  }
}
</style>
