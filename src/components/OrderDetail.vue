<template>
  <el-form ref="info" :model="info" label-width="120px" size="mini">
    <el-row v-if="info">
      <el-col :span="24">
        <el-form-item label="订单状态" prop="startChargeSeq">
          <el-tag type="info" v-if="info.startChargeSeqStat == 1">启动中</el-tag>
          <el-tag type="warning" v-if="info.startChargeSeqStat == 2">充电中</el-tag>
          <el-tag type="warning" v-if="info.startChargeSeqStat == 3">停止中</el-tag>
          <el-tag type="success" v-if="info.startChargeSeqStat == 4">充电结束</el-tag>
          <el-tag type="danger" v-if="info.startChargeSeqStat == 5">未知</el-tag>
          <el-tag type="danger" v-if="info.startChargeSeqStat == 8">异常订单</el-tag>
          <el-tag type="warning" v-if="info.startChargeSeqStat == 20">异常已处理</el-tag>
          <el-tag type="warning" v-if="info.startChargeSeqStat == 4 && info.occupyFlag == 1">占位中</el-tag>
        </el-form-item>
        <el-divider></el-divider>
      </el-col>
      <el-col :span="24">
        <el-form-item label="订单号" prop="startChargeSeq">{{ info.startChargeSeq }}</el-form-item>
        <el-form-item label="充电站点" prop="stationName">{{ info.stationName }}</el-form-item>
        <el-form-item label="枪号" prop="connectorId">{{ info.connectorId }}</el-form-item>
        <el-form-item label="充电用户" prop="userInfo">{{ info.nickName }} {{ info.phoneNum }}</el-form-item>
        <el-form-item label="车牌号" prop="plateNo" v-if="info.plateNo">
          {{ info.plateNo }}
          <span>（限免{{info.freeParkInfo && JSON.parse(info.freeParkInfo).parkFreeTime}}分钟）</span>
        </el-form-item>
        <el-form-item label="VIN码" prop="carVin" v-if="info.carVin">{{ info.carVin }}</el-form-item>
        <el-form-item label="充电电量" prop="totalPower">{{ info.totalPower }}度</el-form-item>
        <el-form-item label="启动时间" prop="startTime">{{ parseTime(info.startTime) }}</el-form-item>
        <el-form-item label="停止时间" prop="endTime">{{ parseTime(info.endTime) }}</el-form-item>
        <el-form-item label="充电停止描述" v-if="info.alarmLevelVo">{{ info.alarmLevelVo.des }}</el-form-item>
        <el-form-item label="订单创建时间" prop="createTime">{{ parseTime(info.createTime) }}</el-form-item>
        <el-divider></el-divider>
      </el-col>
      <el-col :span="24">
        <el-form-item label="充电费" prop="elecMoney" align="right">
          {{ info.elecMoney |
          unitPrice }}
        </el-form-item>
        <el-form-item label="服务费" prop="serviceMoney" align="right">
          {{ info.serviceMoney |
          unitPrice }}
        </el-form-item>
        <el-form-item label="充电消费合计" prop="totalMoney" align="right">
          {{ info.totalMoney |
          unitPrice }}
        </el-form-item>
        <el-form-item label="优惠" prop="couponMoney" align="right">
          <span style="color:#ff9920">
            <span v-if="info.couponMoney > 0">-</span>
            {{ info.couponMoney | unitPrice }}
          </span>
        </el-form-item>
        <el-form-item label="实际支付" prop="totalMoney" align="right">
          {{ (info.payPrice + info.seatPayPrice) |
          unitPrice }}
        </el-form-item>
        <el-divider></el-divider>
        <el-form-item label="超时占位费" prop="totalMoney" align="right">
          {{ info.seatPayPrice |
          unitPrice }}
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
export default {
  name: "OrderDetail",
  props: ['info'],
  methods: {
    getAccountTypeText(payAccountType) {
      let text = ''
      switch(payAccountType){
        case 0: 
          text = '未知'
          break;
        case 1:
          text = '个人账户'
          break;
        case 2:
          text = '家庭账户'
          break;
        case 3:
          text = '企业账户'
          break;
        default:
          text = '未知' 
          break;
      }
      return text;
    },
  }
}
</script>