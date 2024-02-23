<template>
  <div class="app-container">
    <el-form :model="query" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label="用户名" prop="nickName">
        <el-input v-model="query.nickName" placeholder clearable size="small" maxLength="80"/>
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="query.mobile" placeholder="填写完整手机号..." clearable size="small" maxLength="11"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" size="mini" @click="doSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="doReset">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="userList" class="l-panel" border :height="'calc(100vh - 220px)'">
      <el-table-column type="index" width="55" align="center"></el-table-column>
      <el-table-column label="头像" align="center" width="75">
        <template slot-scope="scope">
          <el-avatar :src="scope.row.avatar"></el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="nickName" label="用户名" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="mobile" label="手机号" width="150" align="center"></el-table-column>
      <el-table-column prop="platform" label="登录端" width="150" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.platform==0">小程序</span>
        </template>
      </el-table-column>
      <el-table-column prop="lastVisitIp" label="上次登录IP" width="150" align="center"></el-table-column>
      <el-table-column label="上次登陆时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.lastVisitTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            :icon="scope.row.disableFlag==0?'el-icon-circle-close':'el-icon-refresh-left'"
            @click="handleDeal(scope.row)"
            
          >{{scope.row.disableFlag==0?'禁用':'恢复'}}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="query.pageNum" :limit.sync="query.pageSize" @pagination="fetchList()" />

    <!-- 充值对话框 -->
    <el-drawer :title="title" :visible.sync="open" size="600px">
      <div class="el-drawer__content" style="calc(100vh - 40px)">
        <el-form ref="form" :model="form" :rules="rules" label-width="120px" size="mini">
          <el-row>
            <el-col :span="24">
              <el-form-item label="企业名称" prop="userName">
                <el-input v-model="form.userName" placeholder />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="企业统一社会信用代码" prop="userName" label-width="180px">
                <el-input v-model="form.userName" placeholder />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="充值金额" prop="userName">
                <el-input v-model="form.userName" placeholder style="width:150px">
                  <template slot="append">元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="备注" prop="userName">
                <el-input v-model="form.userName" placeholder />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label>
                <el-button type="primary" @click="doSave">保 存</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { listUser, getUser, addUser, dealUserState } from '@/api/customer/user'

export default {
  name: 'User',
  components: {},
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 企业表格树数据
      userList: [],
      // 总条数
      total: 0,
      // 企业树选项
      userOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      priceOpen: false,
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
      // 企业状态数据字典
      statusOptions: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        userName: [{ required: true, message: '企业名称不能为空', trigger: 'blur' }],
        orderNum: [{ required: true, message: '企业顺序不能为空', trigger: 'blur' }],
        path: [{ required: true, message: '路由地址不能为空', trigger: 'blur' }]
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
      query: {
        pageNum: 1,
        pageSize: 20,
        nickName: "",
        mobile: "",
      },
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
    // 选择图标
    selected(name) {
      this.form.icon = name
    },
    /** 查询企业列表 */
    fetchList() {
      this.loading = true
      listUser(this.query).then((response) => {
        this.userList = response.rows
        this.total = Number(response.total)
        this.loading = false
      })
    },
    /** 转换企业数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.userId,
        label: node.userName,
        children: node.children
      }
    },
    // 显示状态字典翻译
    visibleFormat(row, column) {
      if (row.userType == 'F') {
        return ''
      }
      return this.selectDictLabel(this.visibleOptions, row.visible)
    },
    // 表单重置
    reset() {
      this.form = {
        userId: undefined,
        parentId: 0,
        userName: undefined,
        icon: undefined,
        userType: 'M',
        orderNum: undefined,
        isFrame: '1',
        visible: '0',
        status: '0'
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    doSearch() {
      this.query.pageNum = 1
      this.fetchList()
    },
    /** 重置按钮操作 */
    doReset() {
      this.resetForm('queryForm')
      this.doSearch()
    },
    /** 提交按钮 */
    doSave: function () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.userId != undefined) {
            updateUser(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.fetchList()
              }
            })
          } else {
            addUser(this.form).then((response) => {
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
      this.$confirm(`确认${row.disableFlag == 0 ? '禁用' : '恢复'}吗?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function () {
          return dealUserState({ userId: row.uid, disableFlag: Number(!row.disableFlag) })
        })
        .then(() => {
          this.fetchList()
          this.msgSuccess(`${row.disableFlag == 0 ? '禁用' : '恢复'}成功`)
        })
        .catch(function () { })
    }
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