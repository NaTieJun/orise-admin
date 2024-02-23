<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label="站点名称" prop="stationName">
        <el-input v-model="queryParams.stationName" placeholder="请输入站点名称" clearable size="small" @keyup.enter.native="doSearch" maxlength="50" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" size="mini" @click="doSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="doReset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb8">
      <el-button type="primary" icon="el-icon-plus" @click="doAdd" >新增</el-button>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="fetchList"></right-toolbar>
    </div>
    <el-table v-loading="loading" :data="stationList" class="l-panel" border :height="'calc(100vh - 260px)'">
      <el-table-column prop="stationId" label="站点ID" width="180" align="center"></el-table-column>
      <el-table-column prop="stationName" label="站点名称" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <el-link @click="doEdit(scope.row)">
            <span>{{ scope.row.stationName }}</span>
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="pileNum" label="充电桩" width="80" align="center">
        <template slot-scope="scope">
          <router-link :to="'/facility/baseEquipment?sId=' + scope.row.stationId" class="link-type">
            <span>{{ scope.row.pileNum }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column prop="gunNum" label="充电枪头" width="80" align="center"></el-table-column>
      <el-table-column prop="areaCode" label="所属地区" width="150" align="center">
        <template slot-scope="scope">{{ scope.row.areaCode | queryCityCode }}</template>
      </el-table-column>
      <el-table-column prop="stationStatus" label="状态" :formatter="stationStatusFormat" width="80" align="center"></el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding" width="120">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="doEdit(scope.row)" >修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="doDelete(scope.row)" >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="fetchList()" />

    <!-- 添加或修改站点对话框 -->
    <el-drawer :title="title" :visible.sync="open" size="900px" :wrapperClosable="false" class="has-header-tabs no-footer">
      <div class="el-drawer__content">
        <el-tabs v-model="activeName" type="card">
          <el-tab-pane name="first" label="站点信息">
            <el-form ref="form" :model="form" :rules="rules" label-width="130px" size="mini">
              <el-row>
                <el-col :span="12">
                  <el-form-item label="站点ID" prop="stationId">
                    <el-input v-model="form.stationId" maxlength="20" placeholder :disabled="form.id != null" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="运营商ID" prop="operatorId">
                    <el-input v-model="form.operatorId" placeholder maxlength="9" />
                    <div class="form-tip">设备所属基础设施运营商的组织机构代码</div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="站点名称" prop="stationName">
                    <el-input v-model="form.stationName" maxlength="50" placeholder />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="设备所属方ID" prop="equipmentOwnerId">
                    <el-input v-model="form.equipmentOwnerId" placeholder maxlength="9" />
                    <div class="form-tip">设备归属机构的组织机构代码</div>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="独立报桩" prop="isAloneApply">
                    <el-radio-group v-model="form.isAloneApply">
                      <el-radio :label="0">否</el-radio>
                      <el-radio :label="1">是</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="12" v-if="form.isAloneApply == 1">
                  <el-form-item label="户号" prop="accountNumber">
                    <el-input v-model="form.accountNumber" maxlength="20" placeholder />
                    <div class="form-tip">国网电费账单户号</div>
                  </el-form-item>
                </el-col>
                <el-col :span="12" v-if="form.isAloneApply == 1">
                  <el-form-item label="容量" prop="capacity">
                    <el-input-number
                      v-model="form.capacity"
                      placeholder
                      :precision="4"
                      style="width:180px"
                      :min="0"
                      :max="999999999"
                      :controls="false"
                      class="append_unit"
                      data-unit="KW"
                    />
                    <div class="form-tip">独立电表申请的功率</div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="公共停车场库" prop="isPublicParkingLot">
                    <el-radio-group v-model="form.isPublicParkingLot">
                      <el-radio :label="0">否</el-radio>
                      <el-radio :label="1">是</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="12" v-if="form.isPublicParkingLot == 1">
                  <el-form-item label="公共停车场库编号" prop="parkingLotNumber">
                    <el-input v-model="form.parkingLotNumber" maxlength="20" placeholder />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="国家地区" prop="countryCode">
                    <SelectCountry
                      v-model="form.countryCode"
                      :defaultValue="form.countryCode"
                      style="width:100px;display: inline-block;margin-right:10px;"
                    />
                    <SelectCity v-model="form.areaCode" class="select-city" :defaultValue="form.areaCode" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="详细地址" prop="address">
                    <el-input v-model="form.address" maxlength="50" placeholder />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="站点电话" prop="stationTel">
                    <el-input v-model="form.stationTel" placeholder maxlength="30" style="width:120px;" />
                    <div class="form-tip">场站工作人员的联系电话</div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="服务电话" prop="serviceTel">
                    <el-input v-model="form.serviceTel" placeholder maxlength="30" style="width:120px;" />
                    <div class="form-tip">平台客服电话</div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="站点类型" prop="stationType">
                    <el-select v-model="form.stationType" :popper-append-to-body="false">
                      <el-option v-for="dict in stationTypeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="Number(dict.dictValue)"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="站点状态" prop="stationStatus">
                    <el-select v-model="form.stationStatus" :popper-append-to-body="false">
                      <el-option v-for="dict in stationStatusOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="Number(dict.dictValue)"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="建设场所" prop="construction">
                    <el-select v-model="form.construction" :popper-append-to-body="false">
                      <el-option
                        v-for="dict in stationConstructionOptions"
                        :key="dict.dictValue"
                        :label="dict.dictLabel"
                        :value="Number(dict.dictValue)"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="车位数量" prop="parkNums">
                    <el-input-number :controls="false" v-model="form.parkNums" :min="0" placeholder :precision="0" :max="999999999" />
                    <div class="form-tip">可停放充电车辆的车位总数，未知填0</div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="全天开放" prop="openAllDay">
                    <el-radio-group v-model="form.openAllDay">
                      <el-radio :label="0">否</el-radio>
                      <el-radio :label="1">是</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="24" v-if="form.openAllDay == 0">
                  <el-form-item label="营业时间" prop="businessHours">
                    <el-input v-model="form.businessHours" placeholder maxlength="100" show-word-limit type="textarea" :rows="2" />
                    <div class="form-tip">推荐格式：周一至周日 00:00-24:00</div>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="经纬度" prop="stationLng">
                    <el-input-number
                      @change="onChange"
                      v-model="form.stationLng"
                      :controls="false"
                      :precision="6"
                      placeholder="经度"
                      style="width:85px"
                      :max="999"
                    />&nbsp;&nbsp;,&nbsp;&nbsp;
                    <el-input-number
                      @change="onChange"
                      v-model="form.stationLat"
                      :controls="false"
                      :precision="6"
                      placeholder="纬度"
                      style="width:85px"
                      :max="999"
                    />
                    <div class="form-tip">点击下方地图可以自动填写地点信息</div>
                    <div class="amap-page-container">
                      <div class="search-box">
                        <el-amap-search-box :search-option="searchOption" :on-search-result="onSearchResult"></el-amap-search-box>
                      </div>
                      <el-amap ref="amap" vid="amapDemo" :center="mapCenter" :zoom="12" :plugin="amapPlugins" class="amap-demo" :events="mapEvents">
                        <el-amap-marker
                          v-for="(marker, index) in markers"
                          :key="index"
                          :position="marker.position"
                          :events="marker.events"
                          :visible="marker.visible"
                          :draggable="marker.draggable"
                          :vid="index"
                        ></el-amap-marker>
                      </el-amap>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="站点引导" prop="siteGuide">
                    <el-input v-model="form.siteGuide" placeholder maxlength="100" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="站点图片" prop="pictures">
                    <upload type="0" :fileList.sync="imageFileList" multiple></upload>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="使用车型描述" prop="matchCars">
                    <el-input v-model="form.matchCars" placeholder maxlength="100" show-word-limit type="textarea" :rows="2" />
                    <div class="form-tip">描述站点接受的车辆大小及类型，如大巴、物流车、私家车、出租车等</div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="最低充电费率" prop="minElectricityPrice">
                    <el-input-number
                      v-model="form.minElectricityPrice"
                      placeholder
                      :precision="2"
                      style="width:180px"
                      :min="0"
                      :max="999999999"
                      :controls="false"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="充电费率" prop="electricityFee">
                    <el-input v-model="form.electricityFee" maxlength="255" placeholder />
                    <div class="form-tip">充电费率描述，推荐格式：XX 元/度</div>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="服务费率" prop="serviceFee">
                    <el-input v-model="form.serviceFee" maxlength="255" placeholder />
                    <div class="form-tip">服务费率描述，推荐格式：XX 元/度</div>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="免费停车" prop="parkFree">
                    <el-radio-group v-model="form.parkFree">
                      <el-radio :label="0">否</el-radio>
                      <el-radio :label="1">是</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="24" v-if="form.parkFree == 0">
                  <el-form-item label="停车费" prop="parkFee">
                    <el-input v-model="form.parkFee" placeholder maxlength="100" />
                    <div class="form-tip">停车费描述，推荐格式：XX 元/小时</div>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="支付方式" prop="payment">
                    <el-input v-model="form.payment" maxlength="20" placeholder />
                    <div class="form-tip">刷卡、线上、现金(其中电子钱包类卡为刷卡，身份鉴权卡、微信/支付宝、APP 为线上)</div>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="停车收费类型" prop="parkFeeType">
                    <el-select v-model="form.parkFeeType" size="small">
                      <el-option label="停车收费" value="0" />
                      <el-option label="停车免费" value="1" />
                      <el-option label="限时免费" value="2" />
                      <el-option label="充电限免" value="3" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="是否支持预约" prop="supportOrder">
                    <el-radio-group v-model="form.supportOrder">
                      <el-radio :label="0">不支持</el-radio>
                      <el-radio :label="1">支持</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="靠近卫生间" prop="toiletFlag">
                    <el-radio-group v-model="form.toiletFlag">
                      <el-radio :label="0">否</el-radio>
                      <el-radio :label="1">是</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="靠近便利店" prop="storeFlag">
                    <el-radio-group v-model="form.storeFlag">
                      <el-radio :label="0">否</el-radio>
                      <el-radio :label="1">是</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="靠近餐厅" prop="restaurantFlag">
                    <el-radio-group v-model="form.restaurantFlag">
                      <el-radio :label="0">否</el-radio>
                      <el-radio :label="1">是</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="靠近休息室" prop="loungeFlag">
                    <el-radio-group v-model="form.loungeFlag">
                      <el-radio :label="0">否</el-radio>
                      <el-radio :label="1">是</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="雨棚" prop="canopyFlag">
                    <el-radio-group v-model="form.canopyFlag">
                      <el-radio :label="0">无</el-radio>
                      <el-radio :label="1">有</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="小票机" prop="printerFlag">
                    <el-radio-group v-model="form.printerFlag">
                      <el-radio :label="0">无</el-radio>
                      <el-radio :label="1">有</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="道闸" prop="barrierFlag">
                    <el-radio-group v-model="form.barrierFlag">
                      <el-radio :label="0">无</el-radio>
                      <el-radio :label="1">有</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="地锁" prop="parkingLockFlag">
                    <el-radio-group v-model="form.parkingLockFlag">
                      <el-radio :label="0">无</el-radio>
                      <el-radio :label="1">有</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="备注" prop="remark">
                    <el-input v-model="form.remark" placeholder maxlength="100" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
            <div class="el-drawer__footer">
              <el-button type="primary" @click="doSave">保 存</el-button>
              <el-button @click="doCancel">取 消</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane name="second" label="充电价格"  v-if="form.id">
            <PriceForm :stationId="form.stationId" />
          </el-tab-pane>
          <el-tab-pane name="third" label="同步配置" v-if="form.id">
            <div class="form-tip">管理本站点可同步给哪些客户运营商平台。</div>
            <PlatformTable :stationId="form.stationId"/>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { listStation, getStation, delStation, addStation, updateStation } from '@/api/basePlat/station'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import IconSelect from '@/components/IconSelect'
import SelectCity from '@/components/common/SelectCity'
import SelectCountry from '@/components/common/SelectCountry'
import { isMobile, isFixedPhone, isCountryCode } from '@/utils/validate'
import { transPhoneNumber } from '@/utils/filters'
import { organizationNo } from '@/utils/validator'
import { clone } from '@/utils'
import PlatformTable from './components/PlatformTable'
import PriceForm from './components/-price'

export default {
  name: 'Station',
  components: { Treeselect, IconSelect, SelectCity, SelectCountry, PlatformTable, PriceForm },
  data() {
    let self = this;
    var validatePhone = (rule, value, callback) => {
      if (value != null && value != '' && !isMobile(value) && !isFixedPhone(value)) {
        callback(new Error('电话格式不正确'))
      } else {
        callback()
      }
    }
    var validateCountryCode = (rule, value, callback) => {
      if (!isCountryCode(self.form.areaCode)) {
        callback(new Error("请选择完整的省市县"))
      } else {
        callback()
      }
    }
    var validateLatAndLong = (rule, value, callback) => {
      if (self.form.stationLng == null || self.form.stationLat == null) {
        callback(new Error("请填写经纬度"))
      } else {
        callback()
      }
    }
    var validateConstruction = (rule, value, callback) => {
      if (value == null || value == 0) {
        callback(new Error("请选择建设场所"))
      } else {
        callback()
      }
    }
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 站点表格树数据
      stationList: [],
      total: 0,
      // 站点树选项
      stationOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      priceOpen: false,
      stationTypeOptions: [], //站点类型
      stationStatusOptions: [], //站点状态
      stationConstructionOptions: [], //站点类型
      // 查询参数
      queryParams: {
        stationName: undefined,
        pageNum: 1,
        pageSize: 20,
      },
      // 表单参数
      form: {
        countryCode: 'CN',
        supportOrder: 0,
        parkFeeType: "0",
        parkingLockFlag: 0,
      },
      // 表单默认数据
      defaultForm: {
        stationId: undefined,
        stationName: undefined,
        isAloneApply: 0,
        isPublicParkingLot: 0,
        countryCode: 'CN',
        supportOrder: 0,
        parkNums: 0,
        openAllDay: 1,
        minElectricityPrice: 0,
        parkFree: 0,
        parkFeeType: "0",
        toiletFlag: 0,
        storeFlag: 0,
        restaurantFlag: 0,
        loungeFlag: 0,
        canopyFlag: 0,
        printerFlag: 0,
        barrierFlag: 0,
        parkingLockFlag: 0,
      },
      imageFileList: [],
      // 表单校验
      rules: {
        stationId: [{ required: true, message: '站点ID不能为空', trigger: 'blur' }],
        stationName: [{ required: true, message: '站点名称不能为空', trigger: 'blur' }],
        operatorId: [{ required: true, message: '运营商ID不能为空', trigger: 'blur' }, { validator: organizationNo, message: '运营商ID为9位', trigger: 'blur' }],
        equipmentOwnerId: [{ required: true, message: '设备所属方ID不能为空', trigger: 'blur' }, { validator: organizationNo, message: '设备所属方ID为9位', trigger: 'blur' }],
        isAloneApply: [{ required: true, message: '请选择是否独立报桩', trigger: 'blur' }],
        isPublicParkingLot: [{ required: true, message: '请选择是否是公共停车场库', trigger: 'blur' }],
        countryCode: [{ required: true, message: '请选择国家', trigger: 'blur' }, { validator: validateCountryCode, trigger: 'blur' }],
        address: [{ required: true, message: '详细地址不能为空', trigger: 'blur' }],
        stationTel: [{ validator: validatePhone, trigger: 'blur' }],
        serviceTel: [{ required: true, message: '服务电话不能为空', trigger: 'blur' }, { validator: validatePhone, trigger: 'blur' }],
        stationType: [{ required: true, message: '请选择站点类型', trigger: 'blur' }],
        stationStatus: [{ required: true, message: '请选择站点状态', trigger: 'blur' }],
        stationLng: [{ required: true, message: '请填写经纬度', trigger: 'blur' }, { validator: validateLatAndLong, trigger: 'blur' }],
        construction: [{ required: true, message: '请选择建设场所', trigger: 'blur' }, { validator: validateConstruction, trigger: 'blur' }],
        parkNums: [{ required: true, message: '车位数量不能为空', trigger: 'blur' }],
        openAllDay: [{ required: true, message: '请选是否全天开放', trigger: 'blur' }],
        businessHours: [{ required: true, message: '营业时间不能为空', trigger: 'blur' }],
        minElectricityPrice: [{ required: true, message: '最低充电费率不能为空', trigger: 'blur' }],
        electricityFee: [{ required: true, message: '充电费率不能为空', trigger: 'blur' }],
        serviceFee: [{ required: true, message: '服务费率率不能为空', trigger: 'blur' }],
        parkFree: [{ required: true, message: '请选择是否免费停车', trigger: 'blur' }],
        payment: [{ required: true, message: '支付方式不能为空', trigger: 'blur' }],
        parkFeeType: [{ required: true, message: '请选择停车收费类型', trigger: 'blur' }],
        toiletFlag: [{ required: true, message: '请选择是否靠近卫生间', trigger: 'blur' }],
        storeFlag: [{ required: true, message: '请选择是否靠近便利店', trigger: 'blur' }],
        restaurantFlag: [{ required: true, message: '请选择是否靠近餐厅', trigger: 'blur' }],
        loungeFlag: [{ required: true, message: '请选择是否靠近休息室', trigger: 'blur' }],
        canopyFlag: [{ required: true, message: '请选择是否有雨棚', trigger: 'blur' }],
        printerFlag: [{ required: true, message: '请选择是否有小票机', trigger: 'blur' }],
        barrierFlag: [{ required: true, message: '请选择是否有道闸', trigger: 'blur' }],
        parkingLockFlag: [{ required: true, message: '请选择是否有地锁', trigger: 'blur' }],
      },
      activeName: 'first',
      mapCenter: [121.59996, 31.197646],
      searchOption: {
        city: "全国",   //范围
        citylimit: false, //是否限制城市内搜索
      },
      amapPlugins: [
        "AMap.PlaceSearch",
        {
          pName: "Geolocation",
          events: {
            init(o) {
              // o 是高德地图定位插件实例
              o.getCurrentPosition((status, result) => {
                if (result && result.position) {
                  self.lng = result.position.lng;
                  self.lat = result.position.lat;
                  self.mapCenter = [self.lng, self.lat];
                  self.loaded = true;
                  self.$nextTick();
                }
              });
            },
          },
        },
      ],
      mapEvents: {
        click(e) {
          let { lng, lat } = e.lnglat;
          self.form.stationLng = lng;
          self.form.stationLat = lat;

          self.markers[0].position = [e.lnglat.lng, e.lnglat.lat];

          // 这里通过高德 SDK 完成。
          var geocoder = new AMap.Geocoder({
            radius: 1000,
            extensions: "all",
          });
          geocoder.getAddress([lng, lat], function (status, result) {
            if (status === "complete" && result.info === "OK") {
              if (result && result.regeocode) {
                console.log('address:', result.regeocode.formattedAddress);
                console.log('name:', result.regeocode.pois[0].name);
                self.$nextTick();
              }
            }
          });
        },
      },
      markers: [
        {
          position: [116.453905, 39.928821],
          events: {
            click: (e) => {
              let { lng, lat } = e.lnglat;
              self.form.stationLng = lng;
              self.form.stationLat = lat;

              // 这里通过高德 SDK 完成。
              var geocoder = new AMap.Geocoder({
                radius: 1000,
                extensions: "all",
              });
              geocoder.getAddress([lng, lat], function (status, result) {
                if (status === "complete" && result.info === "OK") {
                  if (result && result.regeocode) {
                    console.log('address:', result.regeocode.formattedAddress);
                    console.log('name:', result.regeocode.pois[0].name);
                    self.$nextTick();
                  }
                }
              });
            },
            dragend: (e) => {
              console.log("---event---: dragend");
              this.markers[0].position = [e.lnglat.lng, e.lnglat.lat];
              let { lng, lat } = e.lnglat;
              self.form.stationLng = lng;
              self.form.stationLat = lat;

              // 这里通过高德 SDK 完成。
              var geocoder = new AMap.Geocoder({
                radius: 1000,
                extensions: "all",
              });
              geocoder.getAddress([lng, lat], function (status, result) {
                if (status === "complete" && result.info === "OK") {
                  if (result && result.regeocode) {
                    console.log('address:', result.regeocode.formattedAddress);
                    console.log('name:', result.regeocode.pois[0].name);
                    self.$nextTick();
                  }
                }
              });
            },
          },
          visible: true,
          draggable: true,
          template: "<span>1</span>",
        },
      ],
    }
  },
  created() {
    this.fetchList();
    this.getDicts("station_status").then(response => {
      this.stationStatusOptions = response.data;
    });
    this.getDicts("station_type").then(response => {
      this.stationTypeOptions = response.data;
    });
    this.getDicts("station_construction").then(response => {
      this.stationConstructionOptions = response.data;
    });
  },
  methods: {
    /** 查询站点列表 */
    fetchList() {
      this.loading = true
      listStation(this.queryParams).then((response) => {
        this.stationList = response.rows
        this.total = Number(response.total)
        this.loading = false
      })
    },
    // 站点状态字典翻译
    stationStatusFormat(row, column) {
      if (row.stationType == 'F') {
        return ''
      }
      return this.selectDictLabel(this.stationStatusOptions, row.stationStatus)
    },
    // 站点类型字典翻译
    stationTypeFormat(row, column) {
      return this.selectDictLabel(this.stationTypeOptions, row.stationType)
    },
    // 站点建筑场所字典翻译
    stationConstructionFormat(row, column) {
      return this.selectDictLabel(this.stationConstructionOptions, row.construction)
    },
    // 取消按钮
    doCancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = clone(this.defaultForm)
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    doSearch() {
      this.queryParams.pageNum = 1
      this.fetchList()
    },
    /** 重置按钮操作 */
    doReset() {
      this.resetForm('queryForm')
      this.doSearch()
    },
    /** 新增按钮操作 */
    doAdd(row) {
      this.reset()
      this.open = true
      this.title = '添加站点'
    },
    /** 修改按钮操作 */
    doEdit(row) {
      this.reset()
      let self = this
      getStation(row.stationId).then((response) => {
        this.form = response.data
        this.form.stationTel = transPhoneNumber(this.form.stationTel)
        this.form.serviceTel = transPhoneNumber(this.form.serviceTel)
        this.form.parkFeeType = String(this.form.parkFeeType)
        this.handleUnitFlag(this.form.unitFlag)
        // this.$set(this.form,'areaCode',this.form.areaCode.substring(0, 2) + ',' + this.form.areaCode.substring(0, 4) + ',' + this.form.areaCode.substring(0, 6))
        this.open = true
        this.title = '修改站点'
        // 显示图片
        this.imageFileList = []
        const imageUrlAddJson = JSON.parse(this.form.pictures) || []
        imageUrlAddJson.forEach((item, index) => {
          this.imageFileList.push({ url: item, name: imageUrlAddJson[index] })
        });
        // 地图处理
        const stationLng = this.form.stationLng
        const stationLat = this.form.stationLat
        if (stationLng > 0 && stationLat > 0) {
          //地图跳到该地点
          self.mapCenter = [stationLng, stationLat];
          // 图钉移到该地点
          self.markers[0].position = [stationLng, stationLat];
        }
      })
    },
    onChange(value) {
      const pos = [this.form.stationLng, this.form.stationLat]
      //this.markers.push(pos);
      this.mapCenter = pos;
      // 图钉移到该地点
      this.markers[0].position = pos;
      // this.amap.setFitView(null, false, [150, 60, 100, 60])
    },
    /** 提交按钮 */
    doSave: function () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          let postData = Object.assign({}, this.form)
          postData.parkFeeType = Number(postData.parkFeeType)
          this.calculateUnitFlag(postData);
          postData.pictures = JSON.stringify(this.imageFileList.map(i => i.url))
          if (postData.id != undefined) {
            updateStation(postData).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.fetchList()
              }
            })
          } else {
            addStation(postData).then((response) => {
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
      this.$confirm('是否确认删除名称为"' + row.stationName + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function () {
          return delStation(row.stationId)
        })
        .then(() => {
          this.fetchList()
          this.msgSuccess('删除成功')
        })
        .catch(function () { })
    },
    onSearchResult(pois) {
      if (pois.length > 0) {
        let pos = [pois[0].lng, pois[0].lat]
        // 地图跳到该地点
        this.mapCenter = pos;
        // 图钉移到该地点
        this.markers[0].position = pos;
        // 表单自动填写该坐标
        this.form.stationLng = pos[0];
        this.form.stationLat = pos[1];
      }
    },
    calculateUnitFlag(postData) {
      let unitFlag = 0;
      unitFlag += postData.toiletFlag << 0;
      unitFlag += postData.storeFlag << 1;
      unitFlag += postData.restaurantFlag << 2;
      unitFlag += postData.loungeFlag << 3;
      unitFlag += postData.canopyFlag << 4;
      unitFlag += postData.printerFlag << 5;
      unitFlag += postData.barrierFlag << 6;
      unitFlag += postData.parkingLockFlag << 7;
      postData.unitFlag = unitFlag
      delete postData.toiletFlag;
      delete postData.storeFlag;
      delete postData.restaurantFlag;
      delete postData.loungeFlag;
      delete postData.canopyFlag;
      delete postData.printerFlag;
      delete postData.barrierFlag;
      delete postData.parkingLockFlag;
    },
    handleUnitFlag(unitFlag) {
      this.$set(this.form, "toiletFlag", unitFlag & 0b00000001)
      this.$set(this.form, "storeFlag", (unitFlag & 0b00000010) >> 1)
      this.$set(this.form, "restaurantFlag", (unitFlag & 0b00000100) >> 2)
      this.$set(this.form, "loungeFlag", (unitFlag & 0b00001000) >> 3)
      this.$set(this.form, "canopyFlag", (unitFlag & 0b00010000) >> 4)
      this.$set(this.form, "printerFlag", (unitFlag & 0b00100000) >> 5)
      this.$set(this.form, "barrierFlag", (unitFlag & 0b01000000) >> 6)
      this.$set(this.form, "parkingLockFlag", (unitFlag & 0b10000000) >> 7)
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
.search-box {
  position: absolute;
  top: 20px;
  left: 20px;
}
.amap-page-container {
  position: relative;
  height: 330px;
  margin-top: 5px;
  .amap-geolocation-con {
    z-index: 99 !important;
  }
}
</style>
