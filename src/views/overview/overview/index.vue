<template>
  <div class="index">
    <div class="index_l whitebg" v-show="sidebarVisible">
      <div class="qy_R">
        <div class="inedx_r_top_t">
          站点列表
          <i class="el-icon-d-arrow-left fr" @click="toggleSidebar"></i>
        </div>
        <div class="inedx_r_top_b">
          <StationTree @selectNode="handleSelectNode" :enableStationOnly="true"></StationTree>
        </div>
      </div>
    </div>
    <div class="left-float" v-show="!sidebarVisible">
      <div @click="toggleSidebar">
        <i class="el-icon-d-arrow-right"></i>
      </div>
    </div>
    <div class="index_r whitebg" v-if="node.name" v-loading="loading">
      <div class="tables">
        <div class="station_name mr10">{{node.name}}</div>
        <div style="text-align: left" class="price-info">
          <el-row class="price-type mt5">
            <el-col :span="3" :offset="8">
              <div class="price-info-title">充电价格</div>
            </el-col>
            <el-col :span="3" v-for="(item, index) in priceTypes" :key="index" :value="item" class="type-item">
              <el-popover placement="top-start" title="电费与服务费" trigger="hover">
                <div>￥{{ Number(item.elecPrice) | unitPrice }} + ￥{{ Number(item.servicePrice) | unitPrice }}</div>
                <div slot="reference">
                  <span :style="{background:item.color}" class="type-colum type-label mr5">{{ item.label }}</span>
                  <span class="type-description">￥{{ (Number(item.elecPrice) + Number(item.servicePrice))| unitPrice }}</span>
                </div>
              </el-popover>
            </el-col>
          </el-row>
          <div class="price-preriod">
            <el-row class="price-row">
              <el-col
                :span="1"
                v-for="(item, index) in preriodItems"
                :key="index"
                :value="item"
                :class="['preriod-item',{'show-hour':index%2==0}]"
                :style="{background:preriodColor(item)}"
                :data-attr="index+':00'"
              ></el-col>
            </el-row>
          </div>
        </div>
      </div>
      <div class="tables mt10">
        <div class="pb20 bb">
          <el-radio-group v-model="timeType" @change="timeTypeCheck" class="mr10">
            <el-radio-button label="day">日</el-radio-button>
            <el-radio-button label="month">月</el-radio-button>
            <el-radio-button label="year">年</el-radio-button>
            <el-radio-button label="custom">自定义</el-radio-button>
          </el-radio-group>
          <el-date-picker
            align="right"
            v-model="dateSelect"
            key="pickerSingle"
            :type="timeType=='day'?'date':timeType"
            style="width:130px;"
            @change="erchatInfo"
            v-if="timeType!='custom'"
            append-to-body
            :clearable="false"
          ></el-date-picker>
          <el-date-picker
            v-model="dateRange"
            key="pickerRange"
            type="daterange"
            align="right"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
            style="width:250px;"
            @change="erchatInfo"
            append-to-body
            unlink-panels
            :clearable="false"
            v-if="timeType=='custom'"
          ></el-date-picker>
          <SelectUserOperator v-model="query.operatorId" @change="erchatInfo" :showItemAll="true" :clearable="true" class="ml10" style="width:120px" />
          <el-popover placement="top-start" title="客户运营商" trigger="hover">
            <div>订单数据包含各个客户运营商的用户平台所产生的订单，可筛选只看某一运营商的订单。</div>
            <i class="el-icon-question ml5" slot="reference" style="color:#abaeb4"></i>
          </el-popover>
          <el-button circle class="el-icon-refresh ml5" @click="erchatInfo"></el-button>
        </div>
        <el-row type="flex" class="ac count-label mt20" justify="space-between" v-if="incomeInfo">
          <el-col :span="3">充电电量</el-col>
          <el-col :span="3">订单总额</el-col>
          <el-col :span="3">电费总额</el-col>
          <el-col :span="3">服务费总额</el-col>
          <el-col :span="3">订单数</el-col>
          <el-col :span="3">
            平均客单价
            <el-popover placement="top" trigger="hover" theme="dark">
              <div>平均客单价为订单总额/订单数。</div>
              <i class="el-icon-question" slot="reference" style="color:#abaeb4"></i>
            </el-popover>
          </el-col>
          <el-col :span="3">充电时长</el-col>
        </el-row>
        <el-row type="flex" class="ac count-number pb20 bb" justify="space-between" v-if="incomeInfo">
          <el-col :span="3">
            <count-to
              v-if="Number(overviewInfo.totalPower)"
              :start-val="0"
              :end-val="Number(incomeInfo.totalPower)||0"
              :duration="durationCount"
              :decimals="2"
            />
            <span v-else>-</span>
            <span class="unit" v-if="Number(incomeInfo.totalPower)">度</span>
          </el-col>
          <el-col :span="3">
            <count-to
              v-if="incomeInfo.totalMoney"
              :start-val="0"
              :end-val="Number(incomeInfo.totalMoney)||0"
              :duration="durationCount"
              :decimals="2"
            />
            <span v-if="!incomeInfo.totalMoney">-</span>
            <span class="unit" v-if="incomeInfo.totalMoney">元</span>
          </el-col>
          <el-col :span="3">
            <count-to
              v-if="incomeInfo.totalEMoney"
              :start-val="0"
              :end-val="Number(incomeInfo.totalEMoney)||0"
              :duration="durationCount"
              :decimals="2"
            />
            <span v-if="!incomeInfo.totalEMoney">-</span>
            <span class="unit" v-if="incomeInfo.totalEMoney">元</span>
          </el-col>
          <el-col :span="3">
            <count-to
              v-if="incomeInfo.totalSMoney"
              :start-val="0"
              :end-val="Number(incomeInfo.totalSMoney)||0"
              :duration="durationCount"
              :decimals="2"
            />
            <span v-if="!incomeInfo.totalSMoney">-</span>
            <span class="unit" v-if="incomeInfo.totalSMoney">元</span>
          </el-col>
          <el-col :span="3">
            <count-to v-if="incomeInfo.orderCount" :start-val="0" :end-val="Number(incomeInfo.orderCount)||0" :duration="durationCount" />
            <span v-if="!incomeInfo.orderCount">-</span>
            <span class="unit" v-if="incomeInfo.orderCount">单</span>
          </el-col>
          <el-col :span="3">
            <count-to
              v-if="incomeInfo.totalMoney"
              :start-val="0"
              :end-val="incomeInfo.totalMoney/incomeInfo.orderCount||0"
              :duration="durationCount"
              :decimals="2"
            />
            <span v-if="!incomeInfo.totalMoney">-</span>
            <span class="unit" v-if="incomeInfo.totalMoney">元</span>
          </el-col>
          <el-col :span="3">
            <count-to
              v-if="incomeInfo.totalDurant"
              :start-val="0"
              :end-val="Number(incomeInfo.totalDurant)||0"
              :duration="durationCount"
              :decimals="0"
            />
            <span v-if="!incomeInfo.totalDurant">-</span>
            <span class="unit" v-if="incomeInfo.totalDurant">分钟</span>
          </el-col>
        </el-row>

        <div class="mt20">
          <!-- 充电分析 -->
          <el-row :gutter="20">
            <el-col :span="18" class="br">
              <div class="title_name">
                <span class="title_name">收益分析</span>
                <el-radio-group v-model="statsType" @change="statsTypeCheck" class="ml10">
                  <el-radio-button label="money">订单金额</el-radio-button>
                  <el-radio-button label="order">订单数</el-radio-button>
                  <el-radio-button label="power">充电量</el-radio-button>
                </el-radio-group>
              </div>
              <BarChart ref="orderChart" :chart-data="chartData" height="400px" class="mt10" />
            </el-col>
            <el-col :span="6">
              <div class="title_name">客单价占比</div>
              <PieChart :chart-data="pieData" height="400px" />
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <div class="cc" v-if="!node.name">请从左侧选择站点</div>
  </div>
</template>
<script>
import { stationStats } from '@/api/basePlat/station'
import { getStationPrice } from '@/api/basePlat/priceTemplate'
import CountTo from 'vue-count-to'
import BarChart from '@/components/Chart/BarChart'
import PieChart from '@/components/Chart/PieChart'
import StationTree from '@/components/StationTree/index'
import SelectUserOperator from '@/components/SelectUserOperator'
import { parseTime } from '@/utils/common.js'
import { clone } from '@/utils'
import moment from 'moment'

export default {
  name: 'Index',
  components: { CountTo, BarChart, PieChart, StationTree, SelectUserOperator },
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    },
    key() {
      return this.$route.path
    }
  },
  computed: {
  },
  data() {
    return {
      sidebarVisible: true,
      table: {
        userCount: 2,
        customerCount: 100,
        groupCount: 200,
        groupMemberCount: 200,
      },
      erchatsTable: {},
      chartData: {},
      pvData: {},
      pvTotal: null,
      inoutData: {},
      inDataTotal: null,
      outDataTotal: null,
      inoutIncomeTotal: null,
      pvIncomeTotal: null,
      subsidyTotal: null,
      stationTypeOptions: [],
      chartDataCollection: {},
      defaultChartData: {
        color: ['#00C9A4', '#00A4FF', '#ff8386', '#9ac87c', '#fac858', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
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
            data: [],
            axisTick: {
              alignWithLabel: true,
            },
            axisLabel: {
              rotate: 45, // 设置旋转角度
              interval: 0, // 强制显示所有标签
              textStyle: {
                fontSize: 12 // 设置字体大小
              }
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            minInterval: 0,
            name: "",
            nameTextStyle: { textAlign: "left", padding: [0, 0, 10, 20] },
            axisTick: {
              show: false
            }
          }
        ],
        series: []
      },
      pieData: {},
      pieOperatorData: {},
      allData: {},
      time: '昨天',
      uptime: '',
      timeType: 'day',
      interval: "Hour",
      durationCount: 1500,
      node: {},
      overviewInfo: {},
      incomeInfo: {},
      query: {
        operatorId: "",
        startTm: parseTime(new Date(), '{y}-{m}-{d}'),
        endTm: parseTime(new Date(), '{y}-{m}-{d}'),
      },
      dateRange: [],
      dateSelect: "",
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      preriodItems: [],
      preriodTimes: ["0:00", "2:00", "4:00", "6:00", "8:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "24:00"],
      priceTypes: [],
      preriodColors: { 0: "#ffae30", 1: "#ff8386", 2: "#4dadff", 3: "#9ac87c" },
      chargingPriceTypeOptions: [], //价格档
      stationInfo: {},
      statsType: 'money',
      loading: false,
    }
  },
  async mounted() {
    this.getDicts("charging_price_type").then(response => {
      this.chargingPriceTypeOptions = response.data;
    });
    this.getDicts("station_type").then(response => {
      this.stationTypeOptions = response.data;
    });
    for (let index = 0; index < 24; index++) {
      this.preriodItems.push(-1)
    }
    this.dateSelect = new Date();
  },
  methods: {
    toggleSidebar() {
      this.sidebarVisible = !this.sidebarVisible
      // 触发窗口调整大小事件
      window.dispatchEvent(new Event('resize'));
    },
    preriodColor(priceType) {
      let color = this.preriodColors[priceType];
      if (color == null) color = "#b2b2b2";
      return color;
    },
    handleOverviewInfo(info, keys) {
      keys.forEach((key) => {
        const showKey = 'show' + key.slice(0, 1).toUpperCase() + key.slice(1)
        const dataValue = info[key];
        if (dataValue != null && dataValue > 0) {
          info[showKey] = true;
        } else {
          info[showKey] = false;
        }
      });
    },
    // 站点价格
    getStationPriceInfo(sId) {
      getStationPrice(sId).then(res => {
        let priceInfo = res.data
        this.handlePriceInfo(priceInfo)
      })
    },
    //组装充电价格显示数据
    handlePriceInfo(priceInfo) {
      for (let index = 0; index < 24; index++) {
        this.preriodItems[index] = -1
      }
      this.priceTypes = [];
      if (priceInfo == null ||
        priceInfo.priceList == null || priceInfo.priceList.length == 0) {
        return;
      }
      let priceList = priceInfo.priceList;
      let priceTypeList = priceInfo.priceTypeList;
      priceList.forEach((p, index) => {
        let start = p.startTime
        if (start >= 0 && start < 24) {
          for (let index = start; index < 24; index++) {
            this.preriodItems[index] = p.priceType;
          }
        }
      })
      priceTypeList.forEach((price, index) => {
        if (price.priceType >= 0 && price.priceType <= 3) {
          const label = this.selectDictLabel(this.chargingPriceTypeOptions, price.priceType) + '时'
          const color = this.preriodColor(price.priceType)
          if ((Number(price.elecPrice) + Number(price.servicePrice)) > 0)
            this.priceTypes.push({ color: color, label: label, elecPrice: price.elecPrice, servicePrice: price.servicePrice })
        }
      })
    },
    handleSelectNode(node) {
      this.node = node
      // 单站点概览信息
      if (node.type == 'station') {
        this.query.stationId = node.id;
      }
      // 修改原有参数
      let q = {}
      q.type = node.type
      q.id = node.id
      this.$router.push({
        query: q
      })
      // 站点信息
      this.getStationPriceInfo(q.id)
      // 充电分析
      this.erchatInfo()
    },
    timeTypeCheck(type) {
      let date = new Date();
      this.query.startTm = ""
      this.query.endTm = ""
      switch (type) {
        case 'day':
          this.dateSelect = date
          break
        case 'month':
          this.dateSelect = new Date(date.getFullYear(), date.getMonth() + 1, 0)
          break
        case 'year':
          this.dateSelect = new Date(date.getFullYear(), 1, 0)
          break
      }
      type != 'custom' && this.erchatInfo()
    },
    statsTypeCheck(type) {
      this.chartData = this.chartDataCollection[type]
    },
    erchatInfo() {
      switch (this.timeType) {
        case 'day':
          this.interval = "Hour"
          this.query.startTm = parseTime(this.dateSelect, '{y}-{m}-{d}')
          this.query.type = 0
          break
        case 'month':
          this.interval = "Day"
          this.query.startTm = parseTime(this.dateSelect, '{y}-{m}-01')
          this.query.endTm = parseTime(new Date(this.dateSelect.getFullYear(), this.dateSelect.getMonth() + 1, 0), '{y}-{m}-{d}')
          this.query.type = 1
          break
        case 'year':
          this.interval = "Month"
          this.query.startTm = parseTime(this.dateSelect, '{y}-01-01')
          this.query.endTm = parseTime(this.dateSelect, '{y}-12-31')
          this.query.type = 2
          break
        case 'custom':
          this.interval = "Day"
          this.query.startTm = parseTime(this.dateRange[0], '{y}-{m}-{d}')
          this.query.endTm = parseTime(this.dateRange[1], '{y}-{m}-{d}')
          this.query.type = 3
          break
      }
      if (this.query.startTm) {
        this.loading = true
        // 充电订单分析
        stationStats(this.query).then(res => {
          if (res.code == 200) {

            this.overviewInfo = res.data
            const handlekeys = ['equipmentCount', 'connectorCount', 'totalOrderMoney', 'orderCount', 'totalUserCount', 'totalChargeDura', 'totalOrderPower']
            this.handleOverviewInfo(this.overviewInfo, handlekeys);

            let durationCount = this.durationCount
            // 数据集
            let intervalArray = res.data.chargeCountList
            // 显示时段
            let xArray = (this.interval == "Hour") ? intervalArray.map((i, index) => `${index}点-${index + 1}点`) : intervalArray.map((i, index) => (this.interval == "Day") ? `${parseTime(i.tm, '{m}-{d}')}` : `${parseTime(i.tm, '{y}-{m}')}`)
            // 电费
            let elecArray = res.data.eleMoneyList.map(i => Number(i.value).toFixed(2))
            // 服务费
            let serviceArray = res.data.serMoneyList.map(i => Number(i.value).toFixed(2))
            // 订单数
            let orderCountArray = res.data.chargeCountList.map(i => i.value)
            // 充电量
            let powerArray = res.data.chargePowerList.map(i => i.value)

            let moneyData = clone(this.defaultChartData)
            moneyData.xAxis[0].data = xArray
            moneyData.yAxis[0].name = "订单金额（元）"
            moneyData.series = [
              {
                name: '电费',
                type: 'bar',
                stack: 'vistors',
                barWidth: '30%',
                data: elecArray,
                durationCount
              },
              {
                name: '服务费',
                type: 'bar',
                stack: 'vistors',
                barWidth: '30%',
                data: serviceArray,
                durationCount,
              },
            ]

            let orderData = clone(this.defaultChartData)
            orderData.xAxis[0].data = xArray
            orderData.yAxis[0].minInterval = 1
            orderData.yAxis[0].name = "订单数（单）"
            orderData.series = [
              {
                name: '订单数',
                type: 'bar',
                stack: 'vistors',
                barWidth: '60%',
                data: orderCountArray,
                durationCount,
                label: {
                  show: true,
                  position: 'top',
                  formatter: function (params) {
                    if (params.value > 0) {
                      return Number(params.value).toFixed(0);
                    } else {
                      return '';
                    }
                  }
                }
              }
            ]
            let powerData = clone(this.defaultChartData)
            powerData.xAxis[0].data = xArray
            powerData.yAxis[0].name = "充电量（度）"
            powerData.series = [
              {
                name: '充电量',
                type: 'bar',
                stack: 'vistors',
                barWidth: '60%',
                data: powerArray,
                durationCount,
                label: {
                  show: true,
                  position: 'top',
                  formatter: function (params) {
                    if (params.value > 0) {
                      return Number(params.value).toFixed(0);
                    } else {
                      return '';
                    }
                  }
                }
              }
            ]
            this.chartDataCollection.money = moneyData;
            this.chartDataCollection.order = orderData;
            this.chartDataCollection.power = powerData;
            this.chartData = this.chartDataCollection[this.statsType]

            // 客单分析
            this.incomeInfo = res.data
            // 客单分段
            let amountArray = res.data.chargeMoneyPieList.map(i => { return parseInt(i.value) ? { value: i.value, name: i.unit } : null })

            this.pieData = {
              tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b} : {c}单 ({d}%)'
              },
              legend: {
                top: 30,
                data: res.data.chargeMoneyPieList.map(i => i.unit)
              },
              series: [
                {
                  name: '订单数',
                  type: 'pie',
                  center: ['50%', '60%'],
                  radius: ['30%', '50%'],
                  label: {
                    bleedMargin: 5
                  },
                  data: amountArray,
                  animationEasing: 'cubicInOut',
                  durationCount: this.durationCount
                }
              ]
            }
          }
          this.loading = false
        })
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
  },
}
</script>
<style lang="scss" scoped>
.index {
  margin: 0;
  width: 100%;
  background: #f1f1f1;
  display: flex;

  .station_name {
    font-size: 24px;
    font-weight: bold;
    color: #333333;
    display: flex;
    .date {
      font-size: 16px;
      font-weight: 400;
      color: #666;
    }
  }
  .title_name {
    font-size: 20px;
    color: #333333;
  }

  .col_style {
    font-size: 16px;
    font-weight: 500;
    color: #666;
  }

  .fontgay {
    text-indent: 4em;
    color: #999;
    font-size: 14px;
    font-weight: 200;
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
    background: #fff;
    border-radius: 5px;
    padding: 20px;
    font-size: 16px;
  }

  .whitebg {
    float: left;
    border-radius: 5px;
  }

  .index_r {
    overflow-y: auto;
    margin-left: 10px;
    flex: 1;
    height: calc(100vh - 114px);
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
    overflow-y: auto;

    .qy_R {
      background: #fff;
      height: 100%;
      border-radius: 5px;

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

  .station-data {
    width: 100%;
    background: #fff;
    border-radius: 5px;
    padding: 20px 20px 7px;
    // min-height: 300px;
    margin-top: 10px;
    .station-info {
      border-radius: 5px;
      .station-info-title {
        font-size: 20px;
      }
      .station-info-content {
        height: 140px;
        .station-name {
          font-size: 20px;
        }
        .station-info-item {
          padding: 3px;
          margin-bottom: 3px;
        }
      }
    }
  }
}

.price-info {
  border-radius: 5px;
  .price-info-title {
    font-size: 14px;
    text-align: right;
    color: #333;
  }
  .price-preriod {
    height: 30px;
    padding: 10px 45px 5px;
    .price-row {
      position: relative;
      width: 100%;
      height: 100%;
      &::before {
        content: "24:00";
        position: absolute;
        right: -12px;
        top: 21px;
        color: #9b9b9b;
        font-size: 12px;
      }
    }
    .preriod-item {
      position: relative;
      height: 100%;
      border-color: #fff;
      border-width: 1px;
      border-style: solid;
      border-radius: 2px;
    }
    .show-hour::before {
      content: attr(data-attr);
      position: absolute;
      left: -12px;
      top: 20px;
      color: #9b9b9b;
      font-size: 12px;
    }
  }
  .price-type {
    // height: 70px;
    // padding: 10px 30px;
    .type-row {
      width: 100%;
      height: 100%;
    }
    .type-item {
      height: 100%;
      color: #9a9a9a;
      text-align: center;
      .type-container {
        height: 100%;
      }
      .type-colum {
        height: 100%;
        width: 15px;
        border-radius: 2px;
        font-size: 12px;
        padding: 2px 5px;
      }
      .type-detail {
        height: 100%;
      }
      .type-label {
        text-align: left;
        color: #000000;
      }
      .type-description {
        vertical-align: bottom;
        font-size: 12px;
        text-align: left;
        color: #9b9b9b;
        margin-bottom: 2px;
      }
    }
  }
}
.card {
  margin-top: 10px;
  background: #fff;
  border-radius: 5px;
  padding: 20px;
  font-size: 16px;
}

.count-number {
  margin-top: 10px;
  font-size: 24px;
  font-weight: bold;
  color: #0089c9;
  text-align: center;
}

.count-label {
  font-size: 13px;
}

.count-number-small {
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #0089c9;
  text-align: center;
}
.unit {
  font-size: 12px;
}
</style>
