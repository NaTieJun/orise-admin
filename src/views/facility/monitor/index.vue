<template>
  <div class="index monitor-bg">
    <div class="index_l whitebg" v-show="sidebarVisible">
      <div class="qy_R">
        <div class="inedx_r_top_t">
          站点列表
          <i class="el-icon-d-arrow-left fr" @click="sidebarVisible=false"></i>
        </div>
        <div class="inedx_r_top_b">
          <StationTree @selectNode="handleSelectNode" :currentNodeKey="$route.query.id" :enableStationOnly="true"></StationTree>
        </div>
      </div>
    </div>
    <div class="left-float" v-show="!sidebarVisible">
      <div @click="sidebarVisible=true">
        <i class="el-icon-d-arrow-right"></i>
      </div>
    </div>
    <div class="index_r">
      <div class="tables">
        <div style="text-align: left" v-if="node.type == 'station'">
          <div class="title_name">
            实时监控
            <el-row>
              <el-col :span="12">
                <span class="col_style">{{ node.name }}</span>
              </el-col>
            </el-row>
          </div>
          <div
            class="card-gun"
            v-for="gunList, index in connectorList"
            :key="index"
            :class="['status-' + gunList.connectorStatus, {'selected': index == selectedGunIndex}]"
            @click="handleClickGunCard(index, gunList.connectorId)"
          >
            <div class="title">
              <div>{{ gunList.connectorId }}</div>
            </div>
            <div class="pt10 pb10">
              <img src="@/assets/gun.png" alt="gun" width="32" />
            </div>
            <el-row class="pt10">
              <el-col :span="8">{{ gunList.currentA }}A</el-col>
              <el-col :span="8">{{ gunList.voltageA }}V</el-col>
              <el-col :span="8">{{ parseInt(gunList.voltageA * gunList.currentA / 1000) }}kW</el-col>
            </el-row>
            <el-row class="pt10 pb10">
              <el-col :span="8">
                <span class="number ar">{{ gunList.chargeCount }}</span>
                <span class="unit">次</span>
              </el-col>
              <el-col :span="8">
                <span class="number ar">{{ gunList.totalChargeDura }}</span>
                <span class="unit">分钟</span>
              </el-col>
              <el-col :span="8">
                <span class="number ar">{{ Number(gunList.totalPower).toFixed(0) }}</span>
                <span class="unit">度</span>
              </el-col>
            </el-row>

            <div class="status">
              <div class="status-text" v-if="gunList.connectorStatus == 0">离线</div>
              <div class="status-text" v-if="gunList.connectorStatus == 1">空闲</div>
              <div class="status-text" v-if="gunList.connectorStatus == 2">已插枪</div>
              <div class="status-text" v-if="gunList.connectorStatus == 3">
                充电中
                <span>{{ (gunList.soc*100).toFixed(0) }}%</span>
              </div>
              <div class="status-text" v-if="gunList.connectorStatus == 4">已锁定</div>
              <div class="status-text" v-if="gunList.connectorStatus == 255">故障</div>
              <div class="bar" :style="{ width: gunList.soc*100 + '%' }" v-if="gunList.connectorStatus == 3"></div>
              <el-dropdown trigger="click" @command="gunMoreClick" class="gun-more">
                <span>
                  <i class="el-icon-more"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item disabled>模拟指令</el-dropdown-item>
                  <el-dropdown-item :command="{action:'start',id:gunList.connectorId}" divided>开启</el-dropdown-item>
                  <el-dropdown-item :command="{action:'link',id:gunList.connectorId}">插枪</el-dropdown-item>
                  <el-dropdown-item :command="{action:'unlink',id:gunList.connectorId}">拔枪</el-dropdown-item>
                  <el-dropdown-item :command="{action:'stop',id:gunList.connectorId}">关闭</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="cc" v-if="!node.id">请从左侧选择站点</div>
  </div>
</template>
<script>
import { connectorStatus } from '@/api/monitor/analysis'
import { startConnector, stopConnector, ulinkConnector, linkConnector } from '@/api/basePlat/connector'
import { repushGunStatus, sendQCode } from "@/api/basePlat/station"
import StationTree from '@/components/StationTree/index'
import { arraySort } from '@/utils/filters'
import merge from 'webpack-merge'

export default {
  name: 'Index',
  components: { StationTree },
  data() {
    return {
      erchatsTable: {},
      chartData: {},
      pieData: {},
      allData: {},
      time: '昨天',
      uptime: '',
      timeType: 'today',
      durationCount: 2600,
      animationDuration: 1000,
      node: {},
      connectorList: [],
      connectorIdList: [],
      sidebarVisible: true,
      q: {},
      stationId: null,
      areaCode: null,
      operatorId: null,
      activeName: 'first',
      loadingGunStatus: false,
      //刷新枪状态倒计时
      loadingCountdown: 0,
      refreshGunTimer: null,
      //更新枪状态冷却时间
      refreshCountdown: 0,
      refreshGetTimer: null,
      countdownStr: '更新全部枪状态',
      connectorId: null,
      loadingSendQCode: false,
      selectedGunIndex: -1
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {          //  这里的vm指的就是vue实例，可以用来当做this使用
      // console.log(from)
      // 修改原有参数
      vm.$router.push({
        query: merge({}, from.query)
      })
    })
  },
  mounted() {
  },
  computed: {
  },
  methods: {
    countdownText: function () {
      let text = ''
      if (this.loadingCountdown > 0) {
        text = `${this.loadingCountdown}秒后获取枪状态`
      } else if (this.refreshCountdown > 0) {
        text = `更新全部枪状态（${this.refreshCountdown}）`
      } else {
        text = '更新全部枪状态'
      }
      this.countdownStr = text
    },
    handleSelectNode(node) {
      this.selectedGunIndex = -1
      this.node = node
      this.connectorList = []
      if (node.type == 'station') {
        this.operatorId = null;
        this.areaCode = null;
        this.stationId = node.id;
        this.refreshConnectorList(this.stationId);
      } else if (node.type == 'operator') {
        this.operatorId = node.id;
        this.areaCode = null;
        this.stationId = null;
      } else {
        this.operatorId = null;
        this.areaCode = node.id;
        this.stationId = null;
      }
    },
    refreshConnectorList(stationId) {
      connectorStatus(stationId).then(res => {
        this.connectorList = res.data.connectorList
        arraySort(this.connectorList, 'connectorId')
        this.connectorIdList = this.connectorList.map(i => i.connectorId)
      })
    },
    gunMoreClick(command) {
      switch (command.action) {
        case 'start':
          this.doStartConnector(command.id)
          break
        case 'link':
          this.doLinkConnector(command.id)
          break
        case 'unlink':
          this.doUlinkConnector(command.id)
          break
        case 'stop':
          this.doStopConnector(command.id)
          break
      }
      // 枪状态更新需要等设备平台返回，有延迟，所以2秒后再更新状态
      setTimeout(() => {
        this.refreshConnectorList(this.stationId);
      }, 3000);
    },
    doStartConnector(connectorId) {
      startConnector({
        connectorId
      })
        .then(res => {
          this.msgSuccess('启动成功')
        })
        .catch(err => {
          console.log(err);
        });
    },
    doStopConnector(connectorId) {
      stopConnector({
        connectorId
      })
        .then(res => {
          this.msgSuccess('停止成功')
        })
        .catch(err => {
          console.log(err);
        });
    },
    doLinkConnector(connectorId) {
      linkConnector({
        connectorId
      })
        .then(res => {
          this.msgSuccess('插枪成功')
        })
        .catch(err => {
          console.log(err);

        });
    },
    doUlinkConnector(connectorId) {
      ulinkConnector({
        connectorId
      })
        .then(res => {
          this.msgSuccess('拔枪成功')
        })
        .catch(err => {
          console.log(err);

        });
    },
    handleTabsClick(tab, event) {
    },
    handleClickGunCard(index, cId) {
      this.selectedGunIndex = index;
      this.connectorId = cId;
      this.activeName = 'third';
    },
    timeTypeCheck(type) {
      switch (type) {
        case 'today':
        case 'week':
        case 'month':
          let json = {
            today: '昨天',
            week: '上周',
            month: '上月',
          }
          this.time = json[type]
          this.erchatsTable = this.allData[type]
          this.serErchat()
          break

        default:
          this.time = '昨天'
          this.timeType = 'today'
          this.refresh()
          break
      }
    },
    erchatInfo() {
      let animationDuration = this.animationDuration
      this.chartData = {
        color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        legend: {},
        grid: {
          top: 50,
          left: '2%',
          right: '2%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
            axisTick: {
              alignWithLabel: true
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            axisTick: {
              show: false
            }
          }
        ],
        series: [
          {
            name: '电费',
            type: 'bar',
            stack: 'vistors',
            barWidth: '60%',
            data: [79, 52, 200, 334, 390, 330, 220],
            animationDuration
          },
          {
            name: '服务费',
            type: 'bar',
            stack: 'vistors',
            barWidth: '60%',
            data: [80, 52, 200, 334, 390, 330, 220],
            animationDuration
          },
          {
            name: '政策补贴',
            type: 'bar',
            stack: 'vistors',
            barWidth: '60%',
            data: [30, 52, 200, 334, 390, 330, 220],
            animationDuration
          },
          {
            name: '储能收益',
            type: 'bar',
            stack: 'vistors',
            barWidth: '60%',
            data: [-30, -52, -200, -334, -390, -330, -220],
            animationDuration
          }
        ]
      }
      this.pieData = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          bottom: 10,
          data: ['<10元', '10-20元', '20-30元', '30-40元', '40-50元', '>50元']
        },
        series: [
          {
            name: '订单金额',
            type: 'pie',
            radius: [15, 55],
            label: {
              position: 'outer',
              alignTo: 'labelLine',
              bleedMargin: 5
            },
            data: [
              { value: 102, name: '<10元' },
              { value: 240, name: '10-20元' },
              { value: 349, name: '20-30元' },
              { value: 300, name: '30-40元' },
              { value: 59, name: '40-50元' },
              { value: 19, name: '>50元' },
            ],
            animationEasing: 'cubicInOut',
            animationDuration: 1500
          }
        ]
      }
    },
    refresh() {
      api.refresh().then((res) => {
        this.erchatInfo()
      })
    },
    getClass(key) {
      let val = Number(this.erchatsTable[key])
      if (val > 0) {
        return 'ascend'
      } else if (val < 0) {
        return 'descend'
      }
    },
    getArrow(key) {
      let val = Number(this.erchatsTable[key])
      if (val > 0) {
        return '↑'
      } else if (val < 0) {
        return '↓'
      } else {
        return '-'
      }
    },
    updateRefreshCountdown() {
      this.refreshCountdown = 30
      this.countdownText()
      if (this.refreshGetTimer !== null) {
        clearInterval(this.refreshGetTimer)
        this.refreshGetTimer = null
      }
      this.refreshGetTimer = setInterval(() => {
        this.refreshCountdown--
        if (this.refreshCountdown <= 0) {
          this.refreshCountdown = 0
          clearInterval(this.refreshGetTimer)
          this.refreshGetTimer = null
        }
        this.countdownText()
      }, 1000)
    },
    handleRepushGunStatus() {
      this.loadingGunStatus = true;
      repushGunStatus(this.stationId).then(res => {
        console.log(res)
      })
      this.loadingCountdown = 10
      this.countdownText()
      if (this.refreshGunTimer !== null) {
        clearInterval(this.refreshGunTimer)
        this.refreshGunTimer = null
      }
      this.refreshGunTimer = setInterval(() => {
        this.loadingCountdown--
        if (this.loadingCountdown <= 0) {
          this.loadingCountdown = 0
          this.updateRefreshCountdown()
          clearInterval(this.refreshGunTimer)
          this.refreshGunTimer = null
          this.refreshConnectorList(this.stationId);
        }
        this.countdownText()
      }, 1000)
    },
    handleSendQCode() {
      this.loadingSendQCode = true;
      sendQCode(this.stationId).then(res => {
        this.loadingSendQCode = false;
        if (res.code === 200) {
          this.msgSuccess(res.data)
        }
      })
    },
    handleSelectedConnect(connectorId) {
      this.connectorList.forEach((c, index) => {
        if (connectorId == c.connectorId) {
          this.selectedGunIndex = index
          return
        }
      })
    }
  },
}
</script>
<style lang="scss" scoped>
.index {
  margin: 0;
  width: 100%;
  background: #f1f1f1;
  display: flex;
}

.title_name {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10px;

  .button-right {
    margin-right: 30px;
  }
}

.col_style {
  font-size: 18px;
  font-weight: 500;
  color: #ffffffe0;
}

.fontgay {
  text-indent: 4em;
  color: #999;
  font-size: 14px;
  font-weight: 200;
}

#fatherbox {
  padding-top: 30px;
  overflow-y: scroll;
  overflow: hidden;
  border-radius: 5px;
  font-size: 16px;
  background: #fff;
}

#echart {
  width: 100%;
  height: 100%;
}

.fr {
  float: right;
}

.descend {
  color: #ff0000;
}

.ascend {
  color: green;
}

.tables {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  padding: 20px;
  font-size: 16px;
  overflow: auto;
}

.whitebg {
  float: left;
  background-image: linear-gradient(230deg, #38e1ac 7%, #27c0bd 100%);
}

.monitor-bg {
  background-image: radial-gradient(
    ellipse at 50% 50%,
    #1769a6 0%,
    #275794 52%,
    #195e81 90%
  );
  background-repeat: no-repeat;
}

.index_r {
  margin-left: 10px;
  flex: 1;
  height: calc(100vh - 114px);
  overflow-y: scroll;
}

.circle {
  width: 80px;
  height: 80px;
  background: #999;
  border-radius: 50%;
  margin: 0 auto;

  img {
    border-radius: 50%;
    width: 80px;
    height: 80px;
  }
}

.index_l {
  width: 300px;
  height: calc(100vh - 114px);

  .qy_R {
    background: #fff;
    height: 100%;

    .inedx_r_top_t {
      border-radius: 5px 5px 0 0;
      height: 50px;
      background-size: 100% 100%;
      background-size: cover;
      padding: 20px 10px 10px 10px;
      border-bottom: 1px solid #ececec;

      .flexspan {
        height: 40px;
        line-height: 40px;
        background: #fff;
        color: #0079de;
        border-radius: 4px;
        margin-top: 30px;
      }

      .margint20 {
        margin-top: 31px;
      }

      p {
        padding-top: 9px;
      }

      .p1 {
        font-size: 16px;
        font-weight: 500;
        color: #ffffff;
      }

      .p2 {
        font-size: 14px;
        font-weight: 400;
        color: #d3e8ff;
      }

      .p3 {
        font-size: 18px;
      }

      .p4 {
        color: #ffffff;
        padding-top: 10px;
      }
    }

    .inedx_r_top_b {
      height: calc(100vh - 164px);
      overflow: auto;
      padding: 10px 0;
    }

    .img {
      margin: 30px;
      width: 175px;
      height: 175px;
    }

    .inedx_r_top_bottom {
      padding: 10px 30px;
      margin-top: 29px;

      .inedx_r_top_bottomp1 {
        font-size: 16px;
        color: #333333;
      }

      ul {
        margin-top: 20px;
      }

      ul li {
        font-size: 14px;
        line-height: 35px;
        font-weight: 500;
        color: #666;

        span {
          color: #999999;
        }
      }
    }
  }
}

.left-float {
  position: fixed;
  left: 0px;
  background-color: #fff;
  box-shadow: 2px 3px 4px 2px rgba(0, 0, 0, 0.1);
  width: 25px;
  height: 100px;
  text-align: center;
  line-height: 100px;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}
.box {
  width: 100%;
}

.titlebox {
  height: 80px;
  padding: 10px 0;
  background: #f1f1f1;

  p {
    line-height: 30px;
    margin: 0;
    padding: 0;
  }
}

.adminname {
  font-size: 20px;
  font-weight: bold;
}

.dataall {
  width: 100%;
  background: #fff;
  border-radius: 5px;
  padding: 20px;
  font-size: 16px;
}

.card-gun {
  display: block;
  font-size: 12px;
  text-align: center;
  line-height: 1.5;
  width: 140px;
  float: left;
  color: #fff;
  background-color: rgba(0, 51, 72, 0.8);
  box-shadow: 2px 3px 4px 2px rgba(0, 0, 0, 0.1);
  margin: 0 16px 16px 0;

  .title {
    padding: 12px 0;
    text-align: center;
  }
  .status {
    width: 100%;
    position: relative;
    .status-text {
      text-align: center;
      height: 36px;
      line-height: 36px;
      font-size: 14px;
    }
    &::before {
      content: "";
      position: absolute;
      width: 100%;
      height: 4px;
      bottom: 0px;
      left: 0;
    }
    .bar {
      content: " ";
      height: 4px;
      position: absolute;
      bottom: 0;
      background: #77cdff;
      box-shadow: 0 0 7px 2px rgba(72, 189, 255, 0.42);
      border-radius: 1px;
      display: block;
      transform: rotate(180deg);
    }
  }
  &.status-0 {
    box-shadow: none;
    opacity: 0.6;
  }
  &.status-0 > .status::before {
    background: #c9c9c9;
  }
  &.status-1 > .status::before {
    background: #079142;
  }

  &.status-2 > .status::before,
  &.status-4 > .status::before {
    background: #239ad8;
  }

  &.status-3 > .status::before {
    background: #239ad8;
  }
  &.status-255 > .status::before {
    background: #f24242;
  }

  &.selected {
    // box-shadow: 2px 3px 4px 2px rgba(8, 130, 20, 0.776);
    box-shadow: 0px 1px 2px 2px rgba(40, 40, 40, 0.5);
  }
  .gun-more {
    cursor: pointer;
    color: #fff;
    position: absolute;
    bottom: 6px;
    right: 4px;
  }
}

.alarm-tabs {
  // background: #ffffff;
  // border-radius: 8px;
  margin: 0px 0px 5px;
}
::v-deep .el-tabs__item.is-active {
  color: #1f1f1f;
  background-color: #edf3f3;
}
::v-deep .el-tabs__item {
  color: $text;
  padding: 0 60px !important;
}
</style>
