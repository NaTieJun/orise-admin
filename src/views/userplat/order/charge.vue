<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" :rules="rules">
      <el-row>
        <el-form-item label="订单状态" prop="startChargeSeqStat">
          <el-select v-model="queryParams.startChargeSeqStat" clearable size="small">
            <el-option label="全部" value />
            <!-- <el-option label="启动中" value="1" /> -->
            <el-option label="充电中" value="2" />
            <!-- <el-option label="停止中" value="3" /> -->
            <el-option label="充电结束" value="4" />
            <el-option label="异常订单" value="8" />
            <el-option label="异常已处理" value="20" />
            <el-option label="未知" value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="占位状态" prop="occupyState" v-if="queryParams.startChargeSeqStat==4">
          <el-select v-model="queryParams.occupyState" clearable size="small">
            <el-option label="全部" value />
            <el-option label="占位" value="1" />
            <el-option label="未占位" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单时间">
          <el-form-item prop="startTime">
            <el-date-picker v-model="queryParams.startTime" type="date" value-format="yyyy-MM-dd" placeholder="开始日期" style="width:130px;"></el-date-picker>
            <span class="ml5 mr5">-</span>
          </el-form-item>
          <el-form-item prop="endTime">
            <el-date-picker
              v-model="queryParams.endTime"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="结束日期"
              style="width:130px;"
              @change="onChangeEndTime"
            ></el-date-picker>
          </el-form-item>
        </el-form-item>
        <el-form-item label="充电站点" prop="stationId">
          <SelectStation v-model="queryParams.stationId" :showItemAll="true" :clearable="true" />
        </el-form-item>
        <el-form-item label="所属代理商" prop="agentId">
          <SelectAgent v-model="queryParams.agentId" :showItemAll="true" :clearable="true" />
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="订单号" prop="startChargeSeq">
          <el-input v-model="queryParams.startChargeSeq" placeholder="完整订单号" clearable size="small" maxlength="32" />
        </el-form-item>
        <el-form-item label="充电用户名" prop="nickName">
          <el-input v-model="queryParams.nickName" placeholder clearable size="small" maxlength="50" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="queryParams.mobile" placeholder="填写完整手机号" clearable size="small" maxlength="11" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain icon="el-icon-search" size="mini" @click="doSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="doReset">重置</el-button>
        </el-form-item>
      </el-row>
    </el-form>
    <el-table v-loading="loading" :data="orderList" class="l-panel" border height="calc(100vh - 270px)" @selection-change="doSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="startChargeSeq" width="220" label="订单号" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <el-link @click="doEdit(scope.row)">
            <span>{{ scope.row.startChargeSeq }}</span>
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="nickName" label="用户" width="150" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <div>{{ scope.row.mobile}}</div>
          <div>{{ scope.row.nickName}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="stationName" label="充电站" align="center" width="200" show-overflow-tooltip>
        <template slot-scope="scope">
          <div>{{ scope.row.stationName}}</div>
          <div v-if="scope.row.agentName">代理商：{{ scope.row.agentName}}</div>
        </template>
      </el-table-column>
      <el-table-column prop label="车辆" align="center" width="180" show-overflow-tooltip>
        <template slot-scope="scope">
          <div>{{ scope.row.plateNo}}</div>
          <div>{{ scope.row.carVin}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="totalPower" label="充电量(度)" width="80" align="right"></el-table-column>
      <el-table-column prop="totalMoney" label="金额" width="80" align="right">
        <template slot-scope="scope">{{ scope.row.totalPrice + scope.row.seatPayPrice | unitPrice}}</template>
      </el-table-column>
      <el-table-column prop="couponMoney" label="优惠金额" width="80" align="right">
        <template slot-scope="scope">
          <span style="color:#ff9920" v-if="scope.row.couponMoney>0">- {{ scope.row.couponMoney | unitPrice}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="payPrice" label="实付金额" width="80" align="right">
        <template slot-scope="scope">{{ scope.row.payPrice+ scope.row.seatPayPrice | unitPrice}}</template>
      </el-table-column>
      <el-table-column label="订单状态" align="center" width="160" prop="startChargeSeqStat">
        <template slot-scope="scope">
          <el-tag type="info" v-if="scope.row.startChargeSeqStat == 1">启动中</el-tag>
          <el-tag type="warning" v-if="scope.row.startChargeSeqStat == 2">充电中</el-tag>
          <el-tag type="warning" v-if="scope.row.startChargeSeqStat == 3">停止中</el-tag>
          <el-tag type="success" v-if="scope.row.startChargeSeqStat == 4">充电结束</el-tag>
          <el-tag type="danger" v-if="scope.row.startChargeSeqStat == 5">未知</el-tag>
          <el-tag type="danger" v-if="scope.row.startChargeSeqStat == 8">异常订单</el-tag>
          <el-tag type="warning" v-if="scope.row.startChargeSeqStat == 20">异常已处理</el-tag>
          <el-tag type="warning" v-if="scope.row.startChargeSeqStat == 4 && scope.row.occupyFlag == 1">占位中</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="alarmLevelVo.des" label="充电停止描述" align="left"></el-table-column>
      <el-table-column label="订单时间" align="center" width="150" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120" class-name="small-padding">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="doEdit(scope.row)" >查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="fetchList()" />

    <!-- 订单详情对话框 -->
    <el-drawer :title="title" :visible.sync="open" size="400px">
      <div class="el-drawer__content" style="calc(100vh - 40px)">
        <OrderDetail :info="form" class="chunk-bg narrow-row" style="height: calc(100vh - 71px);overflow: scroll;"></OrderDetail>
        <el-button type="danger" size="mini" icon="el-icon-warning-outline" @click="handleStopCharge" v-if="form.startChargeSeqStat == 2">结束充电</el-button>
        <el-button type="danger" size="mini" icon="el-icon-warning-outline" @click="showForceStopOrder" v-if="form.startChargeSeqStat == 8">处理异常</el-button>
        <!-- 处理异常对话框 -->
        <el-dialog title="处理异常订单" :visible.sync="forceStopOrderOpen" width="500px" append-to-body>
          <el-form ref="forceStopForm" :model="forceStopForm" :rules="forceStopRules" label-width="120px">
            <el-form-item label="最终结算金额" prop="settleMoney">
              <el-input-number v-model="forceStopForm.settleMoney" :controls="false" :precision="2" style="width:85px" />
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="forceStopOrder">确 定</el-button>
            <el-button @click="doCancel">取 消</el-button>
          </div>
        </el-dialog>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { listOrder, getOrder, delOrder, addOrder, updateOrder, stopOrder, stopCharge } from '@/api/order/order'
import OrderDetail from '@/components/OrderDetail'
import SelectAgent from '@/components/SelectAgent'
import SelectStation from '@/components/SelectStation/FacilityStation'

export default {
  name: 'chargeOrderList',
  components: { OrderDetail, SelectAgent, SelectStation },
  data() {
    let self = this;
    var validateStartTime = (rule, value, callback) => {
      const startTime = value;
      const endTime = self.queryParams.endTime;
      if (startTime == null && endTime != null) {
        callback(new Error('请选择开始日期'));
      } else if (startTime != null && endTime != null && startTime > endTime) {
        callback(new Error('开始日期必须小于结束日期'));
      } else {
        callback();
      }
    };
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 订单表格树数据
      orderList: [],
      // 总条数
      total: 0,
      // 订单树选项
      orderOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 选中Id数组
      ids: [],
      forceStopOrderOpen: false,
      // 订单状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        startChargeSeqStat: "",
        startTime: undefined,
        endTime: undefined,
        startChargeSeq: "",
        nickName: "",
        agentId: "",
        stationId: "",
        pageNum: 1,
        pageSize: 20,
      },
      // 表单参数
      form: {},
      forceStopForm: {},
      // 表单校验
      rules: {
        orderName: [{ required: true, message: '订单名称不能为空', trigger: 'blur' }],
        orderNum: [{ required: true, message: '订单顺序不能为空', trigger: 'blur' }],
        path: [{ required: true, message: '路由地址不能为空', trigger: 'blur' }],
        startTime: [{ validator: validateStartTime, trigger: 'blur' }],
      },
      // 表单校验
      forceStopRules: {
        settleMoney: [{ required: true, message: '请填写结算金额', trigger: 'blur' }],
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
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    onChangeEndTime() {
      this.$refs['queryForm'].validate((valid) => { })
    },
    // 选择图标
    selected(name) {
      this.form.icon = name
    },
    /** 查询订单列表 */
    fetchList() {
      this.loading = true
      // 日期加上时分秒
      let params = Object.assign({}, this.queryParams)
      params.startTime && (params.startTime += " 00:00:00")
      params.endTime && (params.endTime += " 23:59:59")
      listOrder(params).then((response) => {
        this.orderList = response.rows
        this.total = Number(response.total)
        this.loading = false
      }).catch(err => {
        this.loading = false
      })
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        orderName: undefined,
        actState: 0,
        stationId: "",
        agentId: ""
      }
      this.resetForm('form')
    },
    // 删除
    handleStopCharge() {
      this.$confirm('确定要结束用户的充电吗？请在用户知情的情况下操作。', '强制结束充电', {
        confirmButtonText: '结束充电',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          stopCharge(this.form.billId).then((response) => {
            if (response.code === 200) {
              this.msgSuccess('充电已结束')
              // 处理表单
              getOrder(this.form.billId).then((response) => {
                this.form = response.data
                //服务器结算订单需要时间，前端不等待，强制修改订单状态
                this.form.startChargeSeqStat = 4
              })
              // 本地处理列表中的订单状态
              this.orderList.forEach(o => {
                o.billId == this.form.billId && this.$set(o, 'startChargeSeqStat', 4)
              })
            }
          })
        })
        .catch(() => { })
    },
    // 显示异常订单处理对话框
    showForceStopOrder() {
      this.forceStopOrderOpen = true
      this.forceStopForm = {
        settleMoney: this.form.totalElecMoney + this.form.totalServiceMoney
      }
    },
    /** 提交按钮 */
    forceStopOrder() {
      let postData = {
        billId: this.form.billId,
        settleMoney: this.forceStopForm.settleMoney
      }
      stopOrder(postData).then((response) => {
        if (response.code === 200) {
          this.forceStopOrderOpen = false
          getOrder(this.form.billId).then((response) => {
            this.form = response.data
            this.$set(this.form, 'startChargeSeqStat', 20)
          })
          this.msgSuccess('异常订单已处理')
          // 本地处理列表中的订单状态
          this.orderList.forEach(o => {
            o.billId == this.form.billId && this.$set(o, 'startChargeSeqStat', 20)
          })
        }
      })
    },
    // 取消异常订单处理对话框
    doCancel() {
      this.forceStopOrderOpen = false
      this.forceStopForm = {
        settleMoney: 0
      }
      this.resetForm('forceStopForm')
    },
    /** 搜索按钮操作 */
    doSearch() {
      this.$refs['queryForm'].validate((valid) => {
        if (valid) {
          this.queryParams.pageNum = 1
          this.fetchList()
        }
      })
    },
    /** 重置按钮操作 */
    doReset() {
      this.resetForm('queryForm')
      this.doSearch()
    },
    /** 修改按钮操作 */
    doEdit(row) {
      this.reset()
      getOrder(row.billId).then((response) => {
        this.form = response.data
        this.open = true
        this.title = '订单详情'
      })
    },
    // 多选框选中数据
    doSelectionChange(selection) {
      this.ids = selection.map(item => item.billId)
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