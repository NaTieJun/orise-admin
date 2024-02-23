<template>
  <div style="display:inline;">
    <!-- <el-form :inline="true" label-width="0" label-position="left"> -->
    <el-form-item prop="value">
      <el-select :disabled="detail" @change="setCityList" v-model="selectPro" placeholder="请选择省">
        <el-option v-for="(item, key) in proList" :key="key" :label="item.label" :value="item.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-select :disabled="detail" @change="setAreaList" v-model="selectCity" placeholder="请选择市">
        <el-option v-for="(item, index) in cityList" :key="index" :label="item.label" :value="item.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-select :disabled="detail" v-model="selectArea" @change="setData" placeholder="请选择区（县）">
        <el-option v-for="(item, index) in areaList" :key="index" :label="item.label" :value="item.id"></el-option>
      </el-select>
    </el-form-item>
    <!-- </el-form> -->
  </div>
</template>
<script>
import { getProCityList } from '@/api/common'
export default {
  name: 'select-pro-city',
  data() {
    return {
      proList: [],
      cityList: [],
      areaList: [],
      selectPro: '',
      selectCity: '',
      selectArea: ''
    }
  },
  props: {
    value: String,
    detail: {
      type: Boolean,
      defalut: false
    },
    defaultValue: {
      type: String,
      default: undefined
    }
  },
  watch: {
    defaultValue(val) {
      this.initData()
    }
  },
  methods: {
    setCityList(data, state) {
      if (!state) {
        this.selectCity = ''
        this.selectArea = ''
        this.cityList = []
        this.areaList = []
        this.setData()
      }
      this.proList.forEach(dd => {
        if (dd.id === data) {
          this.cityList = dd.children
        }
      })

    },
    setAreaList(data, state) {
      if (!state) {
        this.selectArea = ''
        this.areaList = []
        this.setData()
      }
      this.cityList.forEach(dd => {
        if (dd.id === data) {
          this.areaList = dd.children
        }
      })
    },
    setData() {
      let arr = [this.selectPro, this.selectCity, this.selectArea]
      this.$emit('input', String(this.selectArea))
    },
    initData() {
      if (this.defaultValue) {
        if (this.defaultValue.substring(0, 2)) {
          this.selectPro = Number(this.defaultValue.substring(0, 2))
          this.setCityList(this.selectPro, 'first')
        }
        if (this.defaultValue.substring(0, 4)) {
          this.selectCity = Number(this.defaultValue.substring(0, 4))
          this.setAreaList(this.selectCity, 'first')
        }
        if (this.defaultValue.substring(0, 6)) {
          this.selectArea = Number(this.defaultValue.substring(0, 6))
        }
      } else if(this.defaultValue == null){
        // 外部设置为null，置空选择框, 内部置空时，不重置
        this.selectPro = ""
        this.setCityList()
      }
    }
  },
  mounted() {

  },
  created() {
    getProCityList().then(res => {
      if (res.code === 200) {
        this.proList = res.data
        this.initData()
      }
    })
  },
}
</script>
<style lang="scss" scoped>

</style>
