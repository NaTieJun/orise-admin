<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" :rules="rules">
      <el-row>
        <el-form-item label="充电站点" prop="stationId">
          <SelectStation
            v-model="queryParams.stationId"
            :showItemAll="true"
            :clearable="true"
          />
        </el-form-item>
        <el-form-item label="订单时间">
          <span slot="label">
            订单时间
            <el-popover placement="top" trigger="hover" theme="dark">
              <div>输入开始时间和结束时间，可统计订单优惠金额</div>
              <i class="el-icon-question" slot="reference" style="color:#abaeb4"></i>
            </el-popover>
          </span>
          <el-form-item prop="startTm">
            <el-date-picker v-model="queryParams.startTm" type="date" value-format="yyyy-MM-dd" placeholder="开始日期" style="width:130px;"></el-date-picker>
            <span class="ml5 mr5">-</span>
          </el-form-item>
          <el-form-item prop="endTm">
            <el-date-picker
              v-model="queryParams.endTm"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="结束日期"
              style="width:130px;"
              @change="onChangeEndTime"
            ></el-date-picker>
          </el-form-item>
        </el-form-item>
        <el-form-item label="客户运营商" prop="operatorId">
          <SelectUserOperator v-model="queryParams.operatorId" :showItemAll="true" :clearable="true" />
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="订单号" prop="startChargeSeq">
          <el-input v-model="queryParams.startChargeSeq" placeholder="完整订单号" clearable size="small" maxlength="32" />
        </el-form-item>
        <el-form-item label="充电枪" prop="connectorId">
          <el-input v-model="queryParams.connectorId" placeholder clearable size="small" maxlength="50" />
        </el-form-item>
        <el-form-item label="VIN码" prop="carVin">
          <el-input v-model="queryParams.carVin" placeholder clearable size="small" maxlength="50" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain icon="el-icon-search" size="mini" @click="doSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="doReset">重置</el-button>
        </el-form-item>
      </el-row>
    </el-form>

    <div class="mb8 whitebg chunk-bg" v-if="statisticsData != null">
      <div class="title">优惠金额统计</div>
      <el-form class="statistics-form" :model="statisticsData" ref="statisticsForm" :inline="true" v-show="showSearch" style="margin-inline: 10px;">
        <el-row justify="center">
          <el-col :span="6">
            <el-form-item label="订单总数">
              {{ statisticsData.totalOrderCount }}
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="充电量">
              {{ statisticsData.totalPower }}
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="电费">
              ￥{{ statisticsData.totalElecMoney | unitPrice }}
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="服务费">
              ￥{{ statisticsData.totalServiceMoney | unitPrice }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row justify="space-around">
          <el-col :span="6">
            <el-form-item label="订单总金额">
              ￥{{ statisticsData.totalMoney | unitPrice }}
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="优惠减免金额">
              ￥{{ statisticsData.couponTotalMoney | unitPrice }}
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="企业折扣金额">
              ￥{{ statisticsData.discountTotalMoney | unitPrice }}
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="实收金额">
              <span slot="label">
                实收金额
                <el-popover placement="top" trigger="hover" theme="dark">
                  <div>非奥升平台的用户订单，实收金额为原始订单金额</div>
                  <i class="el-icon-question" slot="reference" style="color:#abaeb4"></i>
                </el-popover>
              </span>
              ￥{{ statisticsData.totalRealMoney | unitPrice }}
            </el-form-item>
          </el-col>
        </el-row>
        <div v-if="statisticsData.agentList && statisticsData.agentList.length > 0">
          <el-divider></el-divider>
          <el-row  justify="space-around">
            <el-col :span="6">
              <el-form-item label="" >
                代理商的收入分成金额
                <el-popover placement="top" trigger="hover" theme="dark">
                  <div>此为估算参考值，未计算其它平台的优惠金额及损耗</div>
                  <i class="el-icon-question" slot="reference" style="color:#abaeb4"></i>
                </el-popover>
              </el-form-item>
            </el-col>
            <el-col :span="18">
              <div v-for="(item) in statisticsData.agentList" :key="item.agentId">
                <el-col :span="8">
                  <el-form-item :label="item.agentName">
                    {{ item.rate * 100 }}%分成
                  </el-form-item>
                </el-col>
                <el-col :span="16">
                  <el-form-item label="收入分成金额">
                    {{ item.gainMoney | unitPrice }}
                  </el-form-item>
                </el-col>
              </div >
            </el-col>
          </el-row>
        </div>
      </el-form>
    </div>
    <el-table
      v-loading="loading"
      :data="orderList"
      class="l-panel"
      border
      :height="tableHeight"
      @selection-change="doSelectionChange"
      empty-text="暂无数据"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" width="55" align="center" />
      <el-table-column prop="startChargeSeq" width="220" label="订单号" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <el-link @click="doEdit(scope.row)">
            <span>{{ scope.row.startChargeSeq }}</span>
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="stationName" label="充电站" align="center" show-overflow-tooltip></el-table-column>
      <el-table-column prop="connectorId" label="充电枪" align="center" width="150"></el-table-column>
      <el-table-column prop="phoneNum" label="用户手机号" align="center" width="120"></el-table-column>
      <el-table-column prop="plateNum" label="车牌号" align="center" width="120"></el-table-column>
      <el-table-column prop="carVin" label="VIN码" align="center" width="170" show-overflow-tooltip></el-table-column>
      <el-table-column prop="operatorName" label="客户运营商" width="150" align="center" show-overflow-tooltip></el-table-column>
      <el-table-column prop="totalPower" label="充电量(度)" width="80" align="right"></el-table-column>
      <el-table-column prop="elecMoney" label="充电费" width="80" align="right">
        <template slot-scope="scope">{{ scope.row.elecMoney | unitPrice}}</template>
      </el-table-column>
      <el-table-column prop="serviceMoney" label="服务费" width="80" align="right">
        <template slot-scope="scope">{{ scope.row.serviceMoney | unitPrice}}</template>
      </el-table-column>
      <el-table-column prop="totalMoney" label="金额" width="80" align="right">
        <template slot-scope="scope">{{ scope.row.totalMoney | unitPrice}}</template>
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
          <el-tag type="danger" v-if="scope.row.refundFlag == 1">已退款</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="订单时间" align="center" width="150" prop="startTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.startTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="doEdit(scope.row)" >查看</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="doDelete(scope.row)" >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="fetchList()" />

    <!-- 订单详情对话框 -->
    <el-drawer :title="title" :visible.sync="open" size="400px">
      <div class="el-drawer__content" style="calc(100vh - 40px)">
        <OrderDetail :info="form" class="chunk-bg narrow-row" style="height: calc(100vh - 71px);overflow: scroll;"></OrderDetail>
        <el-button type="danger" size="mini" icon="el-icon-warning-outline" @click="showForceStopOrder" v-if="form.startChargeSeqStat == 2">结束充电</el-button>
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
import { getOrder, delOrder, addOrder, updateOrder, stopOrder, stopCharge, orderStatistics } from '@/api/order/order'
import { listOrder } from '@/api/basePlat/order'
import OrderDetail from '@/components/OrderDetail'
import SelectUserOperator from '@/components/SelectUserOperator'
import SelectStation from '@/components/SelectStation/BaseFacilityStation'

export default {
  name: 'chargeOrderList',
  components: { OrderDetail, SelectUserOperator, SelectStation },
  data() {
    let self = this;
    var validateStartTime = (rule, value, callback) => {
      const startTm = value;
      const endTm = self.queryParams.endTm;
      if (startTm == null && endTm != null) {
        callback(new Error('请选择开始日期'));
      } else if (startTm != null && endTm != null && startTm > endTm) {
        callback(new Error('开始日期必须小于结束日期'));
      } else {
        callback();
      }
    };
    return {
      // 遮罩层
      loading: false,
      // 显示搜索条件
      showSearch: true,
      // 订单表格树数据
      orderList: [],
      //优惠金额统计数据
      statisticsData: null,
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
        couponType: "1",
        startTm: undefined,
        endTm: undefined,
        startChargeSeq: "",
        operatorId: "",
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
        startTm: [{ validator: validateStartTime, trigger: 'blur' }],
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
      tableHeight: 0,
    }
  },
  watch: {
    statisticsData(val) {
      this.getTableHeight()
    },
  },
  mounted() {
    let self = this
    // window.onresize:浏览器尺寸变化响应事件
    window.onresize = () => {
      return (() => {
        self.getTableHeight()
      })();
    };
  },
  created() {
    this.fetchList()
    this.getTableHeight()
  },
  computed: {

  },
  methods: {
    getTableHeight() {
      let hetght = window.innerHeight - 270
      if(this.statisticsData != null){
        hetght -= 105
      }
      if(this.statisticsData?.agentList && this.statisticsData?.agentList.length > 0){
        hetght -= 17
        hetght -= this.statisticsData.agentList.length * 32
      }
      this.tableHeight = hetght
    },
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
      params.startTm && (params.startTm += " 00:00:00")
      params.endTm && (params.endTm += " 23:59:59")
      listOrder(params).then((response) => {
        this.orderList = response.rows
        this.total = Number(response.total)
        this.loading = false
      }).catch(err => {
        this.loading = false
      })
      if(params.startTm == null || params.endTm == null){
        this.statisticsData = null
      }else{
        let statisticsParams = Object.assign({}, params)
        delete statisticsParams.pageNum
        delete statisticsParams.pageSize
        this.statisticsData = null
        orderStatistics(statisticsParams).then((response) => {
          this.statisticsData = response.data
        }).catch(err => {
        })
      }
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
        id: this.form.id,
        elecFee: this.form.elecMoney,
        serviceFee: this.form.serviceMoney
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
      this.form = row
      this.open = true
      this.title = '订单详情'
    },
    /** 删除按钮操作 */
    doDelete(row) {
      this.$confirm('确认删除吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function () {
          return delOrder(row.billId)
        })
        .then(() => {
          this.fetchList()
          this.msgSuccess('删除成功')
        })
        .catch(function () { })
    },
    // 多选框选中数据
    doSelectionChange(selection) {
      this.ids = selection.map(item => item.billId)
    },
  }
}
</script>

<style lang="scss" scoped>
.statistics-form {
  ::v-deep .el-form-item {
    display: inline-block;
    padding: 0 0 0 0;
  }

  .-tip {
    font-size: 12px;
    line-height: 16px;
    color: #797979;
  }
}
</style>
