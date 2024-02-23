<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label prop="OperatorName">
        <el-input v-model="queryParams.OperatorName" placeholder="搜索客户运营商名称" clearable size="small"
          @keyup.enter.native="doSearch" style="width:250px;" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" size="mini" @click="doSearch">搜索</el-button>
      </el-form-item>
    </el-form>

    <div class="mb8">
      <el-button type="primary" icon="el-icon-plus" @click="doAdd"
        >新增</el-button>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="fetchList"></right-toolbar>
    </div>

    <el-table v-loading="loading" :data="OperatorList" class="l-panel" border :height="'calc(100vh - 280px)'">
      <el-table-column type="index" width="55" align="center"></el-table-column>
      <el-table-column prop="operatorId" label="客户运营商ID" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="operatorName" label="客户运营商名称" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="operatorTel1" label="联系电话" width="180" align="center"></el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="doEdit(scope.row)"
            >修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="doDelete(scope.row)"
            >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="fetchList()" />

    <!-- 添加或修改运营商对话框 -->
    <el-drawer :title="title" :visible.sync="open" size="600px" :wrapperClosable="false" >
      <div class="el-drawer__content" style="calc(100vh - 40px)">
        <el-form ref="form" :model="form" :rules="rules" label-width="120px" size="mini">
          <el-row class="chunk-bg">
            <div class="title">基本信息</div>
            <el-col :span="24">
              <el-form-item label="运营商名称" prop="operatorName">
                <el-input v-model="form.operatorName" placeholder maxLength="64"/>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="运营商ID" prop="operatorId">
                <el-input v-model="form.operatorId" placeholder maxLength="9" :disabled="form.id"/>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="运营商电话1" prop="operatorTel1">
                <el-input v-model="form.operatorTel1" placeholder style="width:120px;"/>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="运营商电话2" prop="operatorTel2">
                <el-input v-model="form.operatorTel2" :controls="false" placeholder style="width:120px;"/>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="注册地址" prop="operatorRegAddress">
                <el-input v-model="form.operatorRegAddress" placeholder maxLength="64"/>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="备注" prop="operatorNote">
                <el-input v-model="form.operatorNote" placeholder maxLength="255"/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row class="chunk-bg">
            <div class="title">调用该运营商所需密钥</div>
            <el-col :span="24">
              <el-form-item label="消息密钥" prop="userDataSecret">
                <el-input v-model="form.userDataSecret" placeholder maxLength="64"/>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="消息密钥初始化向量" prop="userDataSecretIv">
                <el-input v-model="form.userDataSecretIv" placeholder maxLength="16"/>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="平台密钥" prop="userOperatorSecret">
                <el-input v-model="form.userOperatorSecret" placeholder maxLength="64"/>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="签名密钥" prop="userSigSecret">
                <el-input v-model="form.userSigSecret" placeholder maxLength="64" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="接口地址" prop="host">
                <el-input v-model="form.host" placeholder maxLength="128"/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row class="chunk-bg">
            <div class="title">上报政府接口</div>
            <el-col :span="24">
              <el-form-item label="上报政府平台" prop="reportGov">
                <el-switch v-model="form.reportGov" :active-value="1" :inactive-value="0" />
              </el-form-item>
            </el-col>
            <el-col :span="24" v-if="form.reportGov">
              <el-form-item label="政府互联平台" prop="reportGovFlag">
                <el-select v-model="form.reportGovFlag" :popper-append-to-body="false">
                  <el-option label="否" value="0"></el-option>
                  <el-option label="上海联联" value="1"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row class="chunk-bg">
            <div class="title">我方（基础平台）供该运营商调用的密钥</div>
            <div v-if="!form.id" class="f-des">创建完成后，自动生成密钥</div>
            <div>
              <el-col :span="24">
                <el-form-item label="基础运营商ID" prop="myOperatorId">
                  <el-input v-model="form.myOperatorId" maxLength="9"/>
                </el-form-item>
              </el-col>
            </div>
            <div v-if="form.id">
              <el-col :span="24">
                <el-form-item label="消息密钥" prop="dataSecret">
                  <el-input v-model="form.dataSecret" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="消息密钥初始化向量" prop="dataSecretIv">
                  <el-input v-model="form.dataSecretIv" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="平台密钥" prop="operatorSecret">
                  <el-input v-model="form.operatorSecret" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="签名密钥" prop="sigSecret">
                  <el-input v-model="form.sigSecret" disabled />
                </el-form-item>
              </el-col>
            </div>
          </el-row>
        </el-form>
        <div class="el-drawer__footer">
          <el-button type="primary" @click="doSave">保 存</el-button>
          <el-button @click="doCancel">取 消</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { listOperator, getBaseFacilityOperator, delOperator, addOperator, updateOperator } from '@/api/basePlat/operator'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import IconSelect from '@/components/IconSelect'
import SelectCity from '@/components/common/SelectCity'
import { isMobile, isFixedPhone } from '@/utils/validate'
import { transPhoneNumber } from '@/utils/filters'
import { organizationNo } from '@/utils/validator'

export default {
  name: 'Operator',
  components: { Treeselect, IconSelect, SelectCity },
  data() {
    var validatePhone = (rule, value, callback) => {
      if (value != null && value != '' && !isMobile(value) && !isFixedPhone(value)) {
        callback(new Error('电话格式不正确'))
      } else {
        callback()
      }
    }
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 运营商表格树数据
      OperatorList: [],
      // 总条数
      total: 0,
      // 运营商树选项
      OperatorOptions: [],
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
      // 运营商状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        OperatorName: undefined,
        visible: undefined,
        page: 1,
        pageSize: 20,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        operatorId: [{ required: true, message: '运营商ID不能为空', trigger: 'blur' },{ validator: organizationNo, message: '运营商ID为9位', trigger: 'blur' }],
        operatorName: [{ required: true, message: '运营商名称不能为空', trigger: 'blur' }],
        operatorTel1: [{ required: true, message: '运营商电话不能为空', trigger: 'blur' }, { validator: validatePhone, trigger: 'blur' }],
        operatorTel2: [{ validator: validatePhone, trigger: 'blur' }],
        myOperatorId: [{ required: true, message: '基础运营商ID不能为空', trigger: 'blur' },{ validator: organizationNo, message: '基础运营商ID为9位', trigger: 'blur' }],
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
        groupTagType: this.type
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
    /** 查询运营商列表 */
    fetchList() {
      this.loading = true
      listOperator(this.queryParams).then((response) => {
        this.OperatorList = response.rows
        this.total = Number(response.total)
        this.loading = false
      })
    },
    // 显示状态字典翻译
    visibleFormat(row, column) {
      if (row.OperatorType == 'F') {
        return ''
      }
      return this.selectDictLabel(this.visibleOptions, row.visible)
    },
    // 取消按钮
    doCancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        operatorId: undefined,
        OperatorName: undefined,
      }
      this.resetForm('form')
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
      this.title = '添加客户归属运营商'
      this.rules.operatorId = [{ required: true, message: '运营商ID不能为空', trigger: 'blur' },{ validator: organizationNo, message: '运营商ID为9位', trigger: 'blur' }]
    },
    /** 修改按钮操作 */
    doEdit(row) {
      this.reset()
      getBaseFacilityOperator(row.operatorId).then((response) => {
        this.form = response.data
        this.form.reportGovFlag = String(this.form.reportGovFlag)
        this.form.operatorTel1 = transPhoneNumber(this.form.operatorTel1)
        this.form.operatorTel2 = transPhoneNumber(this.form.operatorTel2)
        this.open = true
        this.title = '修改客户归属运营商'
      })
      this.rules.operatorId = [{ required: true, message: '运营商ID不能为空', trigger: 'blur' }]
    },
    /** 提交按钮 */
    doSave: function () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id != undefined) {
            updateOperator(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.fetchList()
              }
            })
          } else {
            addOperator(this.form).then((response) => {
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
    /** 删除按钮操作 */
    doDelete(row) {
      this.$confirm('是否确认删除名称为"' + row.operatorName + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function () {
          return delOperator(row.operatorId)
        })
        .then(() => {
          this.fetchList()
          this.msgSuccess('删除成功')
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

.chunk-bg {
  background-color: #fff;
}
</style>