<template>
  <div>
    <div class="mt10 mb10">
      <el-button type="primary" plain @click="doAdd()" style="width:120px">添加运营商</el-button>
    </div>
    <el-table v-loading="loading" :data="stuffList" :height="'calc(100vh - 180px)'" border>
      <el-table-column prop="operatorId" label="编号" align="center" width="120"></el-table-column>
      <el-table-column prop="operatorInfo.operatorName" label="运营商名称" align="center"></el-table-column>
      <el-table-column prop="isEnable" label="启用" width="100" align="center">
        <template slot-scope="scope">
          <el-tag size="medium" v-if="scope.row.isEnable==1">启用</el-tag>
          <el-tag size="medium" v-if="scope.row.isEnable==0" type="info">不启用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120" class-name="small-padding">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="doEdit(scope.row)">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="doDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="fetchList()" />

    <!-- 添加或修改站点对话框 -->
    <el-drawer :title="title" :visible.sync="open" size="500px" class="no-footer" :wrapperClosable="false" :append-to-body="true">
      <div class="el-drawer__content">
        <el-form ref="form" :model="form" label-width="100px" size="mini">
          <el-row>
            <el-col :span="24">
              <el-form-item label="客户运营商" prop="userId">
                <OperatorSelect
                  ref="operatorSelect"
                  :visible.sync="dialogVisibleSelectCustomer"
                  @success="submitSelectCustomer"
                  :selected="[operator]"
                ></OperatorSelect>
                <el-tag size="medium" v-if="operator.operatorId" type="info">{{ operator.operatorInfo.operatorName }} （{{ operator.operatorInfo.operatorId }}）</el-tag>
                <el-button type="primary" plain @click="onSelectUser" style="width:120px" v-else>添加</el-button>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="启用" prop="isEnable">
                <el-radio-group v-model="form.isEnable">
                  <el-radio :label="0">否</el-radio>
                  <el-radio :label="1">是</el-radio>
                </el-radio-group>
                <div class="form-tip">不启用时，站点不会与该运营商同步数据。</div>
              </el-form-item>
              <el-form-item label="上传订单" prop="isSyncTrade">
                <el-radio-group v-model="form.isSyncTrade">
                  <el-radio :label="0">否</el-radio>
                  <el-radio :label="1">是</el-radio>
                </el-radio-group>
                <div class="form-tip">上报订单至政府平台，如联联平台。</div>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item>
                <el-button type="primary" plain @click="doSave()">保存</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { listStationOperator, getStationOperator, addStationOperator, updateStationOperator, delStationOperator } from '@/api/basePlat/station'
import OperatorSelect from '@/components/SelectUserOperator'

export default {
  name: "StationOperatorTable",
  components: { OperatorSelect },
  props: {
    stationId: [Number, String],
  },
  data() {
    return {
      form: {},
      priceList: [],
      periodList: [],
      stuffList: [],
      loading: false,
      // 表单校验
      rules: {
        stationId: [{ required: true, message: '站点Id不能为空', trigger: 'blur' }],
        stationName: [{ required: true, message: '站点名称不能为空', trigger: 'blur' }],
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        stationId: null,
        orgType: 3,
      },
      total: 0,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      currentDate: "",
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() <= Date.now();
        }
      },
      operator: {},
      dialogVisibleSelectCustomer: false,
    };
  },
  watch: {
    stationId: {
      handler(val) {
        if (val) {
          this.queryParams.stationId = val;
          this.fetchList();
        }
      },
      immediate: true,
    }
  },
  created() {

  },
  mounted() {
    // 获取当前日期
    let myDate = new Date();
    this.currentDate = this.parseTime(myDate, '{y}{m}{d}');
    console.log(this.currentDate)
  },
  methods: {

    // 选择客户群聊确认
    submitSelectCustomer(groups) {
      console.log(groups);
      this.operator = groups
      this.$set(this.operator, 'operatorInfo', { operatorId: groups.operatorId, operatorName: groups.operatorName })
    },
    compare(key) {
      return function (value1, value2) {
        var val1 = value1[key];
        var val2 = value2[key];
        return val1 - val2;
      }
    },
    /** 查询运营商列表 */
    fetchList() {
      this.loading = true
      listStationOperator(this.queryParams.stationId).then((response) => {
        this.stuffList = response.data
        // this.total = Number(response.total)
        this.loading = false
      })
    },
    /** 新增按钮操作 */
    doAdd(row) {
      this.reset()
      this.open = true
      this.title = '添加运营商'
    },
    /** 修改按钮操作 */
    doEdit(row) {
      this.reset()
      this.form = row
      this.$set(this.operator, 'operatorId', row.operatorInfo.operatorId)
      this.$set(this.operator, 'operatorInfo', { operatorId: row.operatorInfo.operatorId, operatorName: row.operatorInfo.operatorName })
      this.title = '修改'
      this.open = true
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        isEnable: 1,
        isSyncTrade: 0,
        stationId: this.stationId,
        operatorId: undefined,
      }
      this.operator = {}
      this.resetForm('form')
    },

    /** 提交运营商 */
    doSave: function () {
      this.$refs['form'].validate((valid) => {
        this.form.operatorId = this.operator.operatorId
        if (valid && this.form.operatorId) {
          if (this.form.id != undefined) {
            updateStationOperator(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.fetchList()
              }
            })
          } else {
            addStationOperator(this.form).then((response) => {
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
    /** 删除运营商操作 */
    doDelete(row) {
      this.$confirm('确认删除吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(
          function () {
            return delStationOperator(row.id)
          }
        )
        .then(() => {
          this.fetchList()
          _his.msgSuccess('删除成功')
        })
        .catch(function () { })
    },
    onSelectUser() {
      this.dialogVisibleSelectCustomer = true;
      this.$refs.operatorSelect.reloadData();
    }
  }
};
</script>