<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label="所属站点" prop="status">
        <SelectStation v-model="queryParams.stationId" @change="doSearch" :showItemAll="true" :clearable="true"/>
      </el-form-item>
    </el-form>

    <div class="mb8">
      <el-button type="primary" icon="el-icon-plus" @click="doAdd" >新增</el-button>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="fetchList"></right-toolbar>
    </div>

    <el-table v-loading="loading" :data="list" class="l-panel" border :height="'calc(100vh - 260px)'">
      <el-table-column prop="equipmentId" label="编号" width="250" align="center"></el-table-column>
      <el-table-column prop="equipmentName" label="名称" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <el-link @click="doEdit(scope.row)">
            <span>{{ scope.row.equipmentName }}</span>
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="gunNum" label="充电枪头" width="80" align="center"></el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="doEdit(scope.row)" >修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="doDelete(scope.row)" >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="fetchList()" />

    <!-- 添加或修改充电桩对话框 -->
    <el-drawer
      :title="title"
      :visible.sync="open"
      size="900px"
      class="has-header-tabs no-footer"
      :wrapperClosable="false"
      :before-close="handleClose"
    >
      <div class="el-drawer__content">
        <el-tabs v-model="activeName" type="card">
          <el-tab-pane name="first" label="基础信息">
            <el-form ref="postForm" :model="form" :rules="rules" label-width="120px" size="mini">
              <el-row>
                <el-col :span="12">
                  <el-form-item label="充电桩唯一编码" prop="equipmentId">
                    <el-input v-model="form.equipmentId" placeholder :disabled="form.id != null" maxLength="14"/>
                    <div class="form-tip">设备唯一编码，14位编号</div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="充电桩编号" prop="pileNo">
                    <el-input v-model="form.pileNo" placeholder maxLength="14"/>
                    <div class="form-tip">桩设备硬件本身的编号。正常情况下，与充电桩唯一编码一致。</div>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="所属站点" prop="stationId">
                    <SelectStation v-model="form.stationId" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="充电桩名称" prop="equipmentName">
                    <el-input v-model="form.equipmentName" placeholder maxLength="30" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="充电桩类型" prop="equipmentType">
                    <el-select v-model="form.equipmentType" :popper-append-to-body="false">
                      <el-option v-for="dict in equipmentTypeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="Number(dict.dictValue)"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="生产商名称" prop="manufacturerName">
                    <el-input v-model="form.manufacturerName" placeholder maxLength="30" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="生产商组织机构代码" prop="manufacturerId" label-width="150px" maxLength="9">
                    <el-input v-model="form.manufacturerId" maxlength="9" placeholder />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="经纬度">
                    <el-input-number v-model="form.equipmentLng" :controls="false" :precision="6" :max="999" placeholder="经度" style="width:85px" />&nbsp;&nbsp;,&nbsp;&nbsp;
                    <el-input-number v-model="form.equipmentLat" :controls="false" :precision="6" :max="999" placeholder="纬度" style="width:85px" />
                    <div class="form-tip">请输入GCJ-02坐标系，最多保留小数点后6位</div>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="设备型号" prop="equipmentModel">
                    <el-input v-model="form.equipmentModel" placeholder maxLength="20" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="总功率" prop="power">
                    <el-input-number v-model="form.power" style="width:120px" :controls="false" :precision="1" :min="0" :max="999999999" class="append_unit" data-unit="kW"/>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="生产日期" prop="productionDate">
                    <el-date-picker v-model="form.productionDate" type="date" placeholder="选择日期" value-format="yyyy-MM-dd"></el-date-picker>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="最大允许输出功率" label-width="150px" prop="maxPower">
                    <el-input-number v-model="form.maxPower" :controls="false" :min="1" :max="100" maxLength="3" class="append_unit" data-unit="%" :precision="0"/>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label prop="remark">
                    <el-button type="primary" @click="doSave" native-type="submit" style="width:120px">
                      保
                      存
                    </el-button>
                    <el-button @click="doCancel">取 消</el-button>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-tab-pane>
          <el-tab-pane name="second" label="充电接口" v-if="form.id != null">
            <div v-for="(connector, connectorIndex) in connectorList" :key="connectorIndex" class="chunk-bg">
              <el-form ref="connector" :model="connector" :rules="connectorRules" label-width="120px" size="mini">
                <el-row>
                  <el-col :span="12">
                    <el-form-item label="接口ID" prop="gunNo">
                      <div style="display: inline;">{{ connector.equipmentId }}</div>
                      <el-input v-model="connector.gunNo" @input="gunNoChange(connector)" style="width:80px" :disabled="connector.id != null" maxLength="3" :controls="false"></el-input>
                      <div class="form-tip">接口ID为所属桩号+枪号，枪号应为1-255的整数</div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="额定电压" prop="voltageLowerLimits">
                      <el-input-number v-model="connector.voltageLowerLimits" placeholder style="width:110px" :min="0" :precision="0" :max="999999999" :controls="false" class="append_unit"
                      data-unit="V"/> -
                      <el-input-number v-model="connector.voltageUpperLimits" placeholder style="width:110px" :min="0" :precision="0" :max="999999999" :controls="false" class="append_unit"
                      data-unit="V"/>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="12">
                    <el-form-item label="接口名称" prop="connectorName">
                      <el-input v-model="connector.connectorName" placeholder maxLength="30"/>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="额定电流" prop="currentValue">
                      <el-input-number v-model="connector.currentValue" placeholder style="width:110px" :min="0" :precision="0" :max="999999999" :controls="false" class="append_unit" data-unit="A"/>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="12">
                    <el-form-item label="接口类型" prop="connectorType">
                      <el-select v-model="connector.connectorType" :popper-append-to-body="false">
                        <el-option v-for="dict in connectorTypeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="Number(dict.dictValue)"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="额定功率" prop="power">
                      <el-input-number v-model="connector.power" placeholder style="width:110px" :min="0" :precision="1" :max="999999999" :controls="false" class="append_unit" data-unit="KW"/>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="12">
                    <el-form-item label="车位号" prop="parkNo">
                      <el-input v-model="connector.parkNo" placeholder  maxLength="10"/>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="国家标准" prop="nationalStandard">
                      <el-select v-model="connector.nationalStandard" size="small">
                        <el-option label="2011" value="1" />
                        <el-option label="2015" value="2" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="24">
                    <el-form-item label prop="remark">
                      <el-button type="primary" @click="submitConnector(connectorIndex)" style="width:120px">
                        保
                        存
                      </el-button>
                      <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDeleteConnector(connectorIndex)">删除</el-button>
                      <el-button type="" @click="doStartConnector(connectorIndex)" style="width:100px" v-if="connector.id != null">启动模拟枪</el-button>
                      <el-button type="" @click="doStopConnector(connectorIndex)" style="width:100px" v-if="connector.id != null">停止模拟枪</el-button>
                      <el-button type="" @click="doLinkConnector(connectorIndex)" style="width:100px" v-if="connector.id != null">插枪</el-button>
                      <el-button type="" @click="doUlinkConnector(connectorIndex)" style="width:100px" v-if="connector.id != null">拔枪</el-button>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
            <el-button @click="addConnectorRow()" style="width:120px">添加充电接口</el-button>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { listEquipment, getEquipment, delEquipment, addEquipment, updateEquipment } from '@/api/basePlat/equipment'
import { listConnector, getConnector, delConnector, addConnector, updateConnector } from '@/api/basePlat/connector'
import { startConnector, stopConnector, ulinkConnector, linkConnector } from '@/api/basePlat/connector'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import IconSelect from '@/components/IconSelect'
import SelectStation from '@/components/SelectStation/BaseFacilityStation'
import { isOrganizationNo, isEmpty } from '@/utils/validate'

export default {
  name: 'Equipment',
  components: { Treeselect, IconSelect, SelectStation },
  data() {
    let self = this;
    var validateConnectorId = (rule, value, callback) => {
      //接口ID判重
      if (self.curConnectorIndex == null) {
        callback();
        return;
      }
      let curConnector = self.connectorList[self.curConnectorIndex];
      if (curConnector.id != null) {
        callback();
        return;
      }
      const curGunNo = value;
      const curGunNoNum = parseInt(curGunNo);
      if(isNaN(curGunNoNum) || curGunNoNum < 1 || curGunNoNum > 255){
        callback(new Error('枪号应为1-255的整数'));
        return;
      }
      for (let index = 0; index < self.connectorList.length; index++) {
        if (self.connectorList[index].id != null && curGunNo == self.connectorList[index].gunNo) {
          callback(new Error('充电接口已经存在'));
          return;
        }
      }
      callback();
    }
    var validateManufacturerId = (rule, value, callback) => {
      if (value != null && value != "" && !isOrganizationNo(value)) {
        callback(new Error("生产商组织机构代码为9位"))
      } else {
        callback()
      }
    }
    var validateValidateLimits = (rule, value, callback) => {
      if (self.curConnectorIndex == null) {
        callback();
        return;
      }
      let curConnector = self.connectorList[self.curConnectorIndex];
      if (curConnector.voltageLowerLimits == undefined || curConnector.voltageUpperLimits == undefined) {
        callback(new Error("请填写额定电压"))
      } else if(curConnector.voltageLowerLimits > curConnector.voltageUpperLimits){
        callback(new Error("额定电压上限不能小于额定电压下限"))
      } else {
        callback()
      }
    }
    var validateNationalStandard = (rule, value, callback) => {
      if (value == null || value == 0) {
        callback(new Error("请选择国家标准"))
      } else {
        callback()
      }
    }
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 充电桩表格树数据
      list: [],
      total: 0,
      connectorList: [],
      // 充电桩树选项
      menuOptions: [],
      equipmentTypeOptions: [], //站点类型
      connectorTypeOptions: [], //充电接口类型
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 充电桩状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        stationId: "",
        pageNum: 1,
        pageSize: 20,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        equipmentId: [{ required: true, message: '充电桩唯一编码不能为空', trigger: 'blur' }],
        stationId: [{ required: true, message: '所属站点不能为空', trigger: 'blur' }],
        equipmentName: [{ required: true, message: '充电桩名称不能为空', trigger: 'blur' }],
        equipmentType: [{ required: true, message: '充电桩类型不能为空', trigger: 'blur' }],
        manufacturerId: [{ required: true, message: '生产商组织机构代码不能为空', trigger: 'blur' }, { validator: validateManufacturerId, trigger: 'blur' }],
        power: [{ required: true, message: '总功率不能为空', trigger: 'blur' }],
      },
      // 表单校验
      connectorRules: {
        gunNo: [{ required: true, message: '充电接口Id不能为空', trigger: 'blur' },
        { validator: validateConnectorId, trigger: 'blur' }],
        connectorName: [{ required: true, message: '充电桩接口不能为空', trigger: 'blur' }],
        connectorType: [{ required: true, message: '接口类型不能为空', trigger: 'blur' }],
        voltageLowerLimits: [{ required: true, message: '请填写额定电压', trigger: 'blur' }, { validator: validateValidateLimits, trigger: 'blur' }],
        currentValue: [{ required: true, message: '额定电流不能为空', trigger: 'blur' }],
        power: [{ required: true, message: '额定功率不能为空', trigger: 'blur' }],
        nationalStandard: [{ required: true, message: '请选择国家标准', trigger: 'blur' }, {validator: validateNationalStandard, trigger: 'blur' }],
      },
      activeName: 'first',
      customPrice: false,
      curConnectorIndex: null,
    }
  },
  created() {
    this.queryParams.stationId = this.$route.query && this.$route.query.sId;
    this.fetchList()
    this.getDicts("equipment_type").then(response => {
      this.equipmentTypeOptions = response.data;
    });
    this.getDicts("connector_type").then(response => {
      this.connectorTypeOptions = response.data;
    });
  },
  methods: {
    // 选择图标
    selected(name) {
      this.form.icon = name
    },
    /** 查询充电桩列表 */
    fetchList() {
      this.loading = true
      listEquipment(this.queryParams).then((response) => {
        this.list = response.rows
        this.total = Number(response.total)
        this.loading = false
      })
    },
    /** 查询充电枪列表 */
    getConnectorList() {
      this.loading = true
      listConnector({ equipmentId: this.form.equipmentId }).then((response) => {
        this.connectorList = response.rows
        this.connectorList.forEach(g => {
          g.gunNo = g.connectorId.slice(g.equipmentId.length)
          g.nationalStandard = String(g.nationalStandard)
        })
        this.loading = false
      })
    },
    // 取消按钮
    doCancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        equipmentId: undefined,
        equipmentName: undefined,
        stationId:""
      }
      this.resetForm('postForm')
    },
    /** 搜索按钮操作 */
    doSearch() {
      this.queryParams.pageNum = 1
      this.fetchList()
    },
    /** 新增按钮操作 */
    doAdd(row) {
      this.reset()
      this.form.stationId = this.queryParams.stationId
      this.open = true
      this.title = '添加充电桩'
    },
    /** 修改按钮操作 */
    doEdit(row) {
      this.reset()
      getEquipment(row.equipmentId).then((response) => {
        this.form = response.data
        this.form.maxPower = this.form.maxPower * 100
        this.open = true
        this.title = '修改充电桩'
        // 获取其下的充电接口
        this.getConnectorList()
      })
    },
    /** 提交按钮 */
    doSave: function () {
      this.$refs['postForm'].validate((valid) => {
        if (valid) {
          let params = Object.assign({}, this.form)
          params.maxPower = params.maxPower / 100
          if (this.form.id != undefined) {
            updateEquipment(params).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.fetchList()
              }
            })
          } else {
            addEquipment(params).then((response) => {
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
    /** 提交充电枪按钮 */
    submitConnector: function (index) {
      this.curConnectorIndex = index;
      this.$refs.connector[index].validate((valid) => {
        let connectorForm = this.connectorList[index]
        if (valid) {
          if (connectorForm.id != undefined) {
            updateConnector(connectorForm).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
              }
            })
          } else {
            addConnector(connectorForm).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.connectorList[index] = response.data
              }
            })
          }
        }
        this.curConnectorIndex = null;
      })
    },
    /** 删除按钮操作 */
    doDelete(row) {
      this.$confirm('确认删除吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function () {
          return delEquipment(row.equipmentId)
        })
        .then(() => {
          this.fetchList()
          this.msgSuccess('删除成功')
        })
        .catch(function () { })
    },
    /** 删除充电枪操作 */
    handleDeleteConnector(index) {
      let _this = this
      this.$confirm('确认删除吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(
          function () {
            if (_this.connectorList[index].id != null) {
              return delConnector(_this.connectorList[index].connectorId)
            } else {
              return;
            }
          }
        )
        .then(() => {
          this.connectorList.splice(index, 1)
          this.msgSuccess('删除成功')
        })
        .catch(function () { })
    },
    addConnectorRow() {
      this.connectorList.push({
        equipmentId: this.form.equipmentId,
        connectorId: undefined,
        gunNo: undefined,
        connectorName: undefined,
        nationalStandard: "2",
      })
    },
    doStartConnector(connectorIndex){
      let connector = this.connectorList[connectorIndex];
      const connectorId = connector.connectorId
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
    doStopConnector(connectorIndex){
      let connector = this.connectorList[connectorIndex];
      const connectorId = connector.connectorId
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
    doLinkConnector(connectorIndex){
      let connector = this.connectorList[connectorIndex];
      const connectorId = connector.connectorId
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
    doUlinkConnector(connectorIndex){
      let connector = this.connectorList[connectorIndex];
      const connectorId = connector.connectorId
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
    gunNoChange(connector) {
      // connector.connectorId = connector.equipmentId + connector.gunNo.toString().padStart(3, '0')
      connector.connectorId = connector.equipmentId + connector.gunNo
    },
    handleClose(done) {
      this.fetchList()
      done()
    }
  }
}
</script>
