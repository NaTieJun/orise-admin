<template>
  <div>
    <el-row class="chunk-bg">
      <div class="title">
        模板信息
        <el-form ref="form" :model="form" :rules="rules" label-width="120px" size="mini">
          <el-row>
            <el-col :span="12">
              <el-form-item label="价格模板" prop="priceCode">
                <SelectPriceTemplate v-model="form.priceCode" @change="doChangePrice"/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div style="margin-bottom: 5px;"></div>
    </el-row>
    <el-row class="chunk-bg">
      <div class="title">充电价格档</div>
      <div v-for="(price, priceIndex) in form.priceList" :key="priceIndex">
        <el-form ref="price" :model="price" label-width="120px" label-position="top" size="mini" :rules="priceRules" :disabled="form.priceCode != null">
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
                <el-radio-group v-model="price.priceType">
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
                  v-model="price.elecPrice"
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
                  v-model="price.servicePrice"
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
              <el-form-item>共 {{calc('accAdd',price.elecPrice,price.servicePrice) | unitPrice}}元</el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-row>
    <el-button type="primary" @click="doSave()" style="width:120px">保存</el-button>
  </div>
</template>

<script>
import { getStationPrice, getPriceTemplate, linkStations } from '@/api/basePlat/priceTemplate'
import SelectPriceTemplate from '@/components/SelectPriceTemplate'
import calculation from '@/utils/calculation'
import { clone } from '@/utils'

export default {
  name: "PriceForm",
  components: { SelectPriceTemplate },
  props: {
    stationId: [Number, String],
  },
  data() {
    var self = this;
    var validatePriceId = (rule, value, callback) => {
        if(value == null){
          callback(new Error('请选择价格档'));
        }else {
          let selectIndex = this.form.priceList.findIndex(item => { return value == item.priceId })
          if(selectIndex == -1){
            callback(new Error('请选择价格档'));
            return;
          }
          callback();
        }
    };
    return {
      form: { 
        priceCode: undefined,
        remark: undefined,
        priceList: []
      },
      loading: false,
      // 表单校验
      rules: {
        priceCode: [{ required: true, message: '请选择价格模板', trigger: 'blur' }]
      },
      priceRules: {
        startTime: [{ required: true, message: '请选择价开始时间', trigger: 'blur' }],
        priceType: [{ required: true, message: '请选择价格档', trigger: 'blur' }],
        elecPrice: [{ required: true, message: '请输入电费', trigger: 'blur' }],
        servicePrice: [{ required: true, message: '请输入服务费', trigger: 'blur' }]
      },
      chargingPriceTypeOptions: [], //价格档
      equipmentDataExt: {},
      resultArr: [], //接受验证返回结果数组
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
    async getPrice(priceCode) {
      this.loading = true
      if(priceCode == null && this.stationId == null) return

      try {
        let response
        if(priceCode != null){
          response = await getPriceTemplate(priceCode);
        }else{
          response = await getStationPrice(this.stationId);
        }
        
        if(response && response.code === 200){
          this.form.priceList = response.data.priceList
          this.form.remark = response.data.remark
          this.form.priceCode = response.data.priceCode
          // 价格档按开始时间 排序
          this.form.priceList.sort(this.compare('startTime'))
          this.form.priceList.forEach(price => {
            price.startTimeStr =  String(price.startTime).padStart(2, '0') + ':00'
          })
        }
      }catch (error) {
        this.loading = false
      }
    },
    /** 删除价格档 */
    handleDeletePrice(index) {
      let _this = this
      this.$confirm('确认删除吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        _this.form.priceList.splice(index, 1)
        _this.msgSuccess('删除成功')
      }).catch(function () { })
    },
    addPriceRow() {
      let price = {
        startTimeStr: undefined,
        elecPrice: undefined,
        servicePrice: undefined,
        priceType: undefined
      }
      this.form.priceList.push(price)
    },
    /** 提交按钮 */
    async doSave() {
      try {
        //更新价格模板
        let data = {
            "priceCode": this.form.priceCode,
            "stationIds": [
              this.stationId
            ],
            "remark": this.form.remark
          }
        let response =  await linkStations(data);
        if(response && response.code === 200){
          this.msgSuccess('保存成功')
          this.$emit('success')
        }
      } catch (e) {
        console.error(e)
      }
    },
    doChangePrice(val){
      this.form.remark = val.remark
      this.getPrice(val.priceCode)
    }
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