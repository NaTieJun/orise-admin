<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label="用户名" prop="nickName">
        <el-input v-model="queryParams.nickName" placeholder clearable size="small" maxLength="30"/>
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="queryParams.mobile" placeholder="填写完整手机号..." clearable size="small" maxLength="11"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" size="mini" @click="doSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="doReset">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="feedbackList" class="l-panel" border :height="'calc(100vh - 220px)'">
      <el-table-column type="index" width="55" align="center"></el-table-column>
      <el-table-column label="头像" align="center" width="75">
        <template slot-scope="scope">
          <el-avatar :src="scope.row.avatar"></el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="userName" label="用户名" width="150" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="mobile" label="手机号" width="150" align="center"></el-table-column>
      <el-table-column prop="feedbackType" label="问题类型" :formatter="feedbackTypeFormat" width="150" align="center"></el-table-column>
      <el-table-column prop="feedbackContent" label="反馈内容" align="center"></el-table-column>
      <el-table-column label="反馈时间" align="center" width="150" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding" width="150">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="doEdit(scope.row)" >详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="fetchList()" />

    <!-- 意见反馈对话框 -->
    <el-drawer :title="title" :visible.sync="open" size="600px">
      <div class="el-drawer__content" style="calc(100vh - 40px)">
        <el-form ref="form" :model="form" :rules="rules" label-width="120px" size="mini">
          <div class="chunk-bg narrow-row">
            <div class="title">意见内容</div>
            <el-form-item label="反馈人">{{ form.userName }} {{ form.mobile }}</el-form-item>
            <el-form-item label="问题类型" prop="feedbackName">
              {{ feedbackTypeFormat({ feedbackType: form.feedbackType })
              }}
            </el-form-item>
            <el-form-item label="充电枪编号" prop="connectorId" v-if="form.connectorId">{{ form.connectorId }}</el-form-item>
            <el-form-item label="问题描述" prop="feedbackContent">{{ form.feedbackContent }}</el-form-item>
            <el-form-item label="图片" prop="imgs" v-if="form.imgs && form.imgs.length > 0">
              <upload type="0" :fileList.sync="form.imgs" multiple disabled></upload>
            </el-form-item>
          </div>
          <div class="chunk-bg">
            <div class="title">回复</div>
            <el-row v-if="!form.replyFlag">
              <el-col :span="24">
                <el-form-item label="回复内容" prop="replyContent">
                  <el-input type="textarea" v-model="form.replyContent" maxlength="256" placeholder="请输入回复内容" show-word-limit/>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label>
                  <el-button type="primary" @click="doSave">保 存</el-button>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="form.replyFlag">
              <el-col :span="24">
                <el-form-item label="回复内容" prop="replyContent">{{ form.replyContent }}</el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { listFeedback, getFeedback, delFeedback, addFeedback, updateFeedback } from '@/api/customer/userFeedback'

export default {
  name: 'Feedback',
  components: {},
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 企业表格树数据
      feedbackList: [],
      // 总条数
      total: 0,
      feedbackTypeOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      priceOpen: false,
      // 企业状态数据字典
      statusOptions: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        replyContent: [{ required: true, message: '回复内容不能为空', trigger: 'blur' }],
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
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        nickName: "",
        mobile: "",
      },
    }
  },
  created() {
    this.fetchList()
    this.getDicts('feedback_type').then((response) => {
      this.feedbackTypeOptions = response.data
    })
  },
  methods: {
    // 站点状态字典翻译
    feedbackTypeFormat(row, column) {
      return this.selectDictLabel(this.feedbackTypeOptions, row.feedbackType)
    },
    // 选择图标
    selected(name) {
      this.form.icon = name
    },
    /** 查询企业列表 */
    fetchList() {
      this.loading = true
      listFeedback(this.queryParams).then((response) => {
        this.feedbackList = response.rows
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
        id: node.id,
        label: node.feedbackName,
        children: node.children
      }
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        feedbackName: undefined,
        imgs: [],
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    doSearch() {
      this.queryParams.pageNum = 1
      this.fetchList()
    },
    /** 重置按钮操作 */
    doReset() {
      this.resetForm('queryForm')
      this.doSearch()
    },
    /** 修改按钮操作 */
    doEdit(row) {
      this.reset()
      getFeedback(row.id).then((response) => {
        this.form = response.data
        this.form.imgs = []
        try {
          this.form.imgUrls.forEach(e => {
            this.form.imgs.push({ url: e })
          });
        } catch { }
        this.open = true
        this.title = '意见反馈'
      })
    },
    /** 提交按钮 */
    doSave: function () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          let postData = Object.assign({}, this.form)
          delete postData.imgs
          delete postData.imgUrls
          if (postData.id != undefined) {
            postData.replyFlag = 1
            updateFeedback(postData).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.fetchList()
              }
            })
          } else {
            addFeedback(postData).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.fetchList()
              }
            })
          }
        }
      })
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
