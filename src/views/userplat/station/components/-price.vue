<template>
  <div>
    <el-row class="chunk-bg">
      <div class="title">充电价格档</div>
      <div v-for="(price, priceIndex) in form.priceList" :key="priceIndex">
        <el-form ref="price" :model="price" label-width="120px" label-position="top" size="mini" disabled>
          <el-row>
            <el-col :span="4" class="time-str">
              <el-form-item prop="startTimeStr">
                <el-time-select
                  v-model="price.startTimeStr"
                  :picker-options="{start:'00:00',end:'24:00',step: '01:00'}"
                  placeholder="开始时间"
                  style="width:110px;"
                ></el-time-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item prop="priceType">
                <el-radio-group v-model="price.PriceType">
                  <el-radio-button v-for="dict in chargingPriceTypeOptions" :key="dict.dictValue" :label="Number(dict.dictValue)">
                    {{
                    dict.dictLabel
                    }}
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item prop="elecPrice">
                <el-input-number
                  v-model="price.ElecPrice"
                  placeholder="电费"
                  :controls="false"
                  :precision="2"
                  :min="0"
                  :max="9999"
                  style="width:100px"
                  class="append_unit"
                  data-unit="元"
                />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item prop="servicePrice">
                <el-input-number
                  v-model="price.ServicePrice"
                  placeholder="服务费"
                  :controls="false"
                  :precision="2"
                  :min="0"
                  :max="9999"
                  style="width:100px"
                  class="append_unit"
                  data-unit="元"
                />
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item>共 {{calc('accAdd',price.ElecPrice,price.ServicePrice) | unitPrice}}元</el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-row>
  </div>
</template>

<script>
import { getStationPrice } from '@/api/facility/station'
import calculation from '@/utils/calculation'

export default {
  name: "PriceForm",
  props: {
    stationId: [Number, String],
  },
  data() {
    return {
      form: { 
        priceList: []
      },
      loading: false,
      chargingPriceTypeOptions: [], //价格档
    };
  },
  watch: {
    stationId: {
      handler(val) {
        if (val) {
          this.getPrice();
        }
      }
    },
  },
  created() {
    this.getPrice();
    this.getDicts("charging_price_type").then(response => {
      this.chargingPriceTypeOptions = response.data;
    });
  },
  mounted: function () {

  },
  methods: {
    reloadData() {
      this.getPrice();
    },
    reset() {
      this.form = {
        priceCode: undefined,
        remark: undefined,
        priceList: []
      }
    },
    calc(type, num1, num2) {
      return calculation[type](num1, num2)
    },
    compare(key) {
      return function (value1, value2) {
        var val1 = value1[key];
        var val2 = value2[key];
        return val1 - val2;
      }
    },
    /** 查询价格档列表 */
    async getPrice() {
      this.loading = true
      if(this.stationId == null) return

      try {
        let response = await getStationPrice(this.stationId);
        if(response && response.code === 200){
          this.form.priceList = response.data
          // 价格档按开始时间 排序
          this.form.priceList.sort(this.compare('StartTime'))
          this.form.priceList.forEach(price => {
            price.startTimeStr =  String(price.StartTime).padStart(2, '0') + ':00'
          })
        }
      }catch (error) {
        this.loading = false
      }
    },
  }
};
</script>

<style lang="scss" scoped>
.time-str {
  margin-right: 10px;
}
.form-alert{
  margin-top: 5px;
}
</style>