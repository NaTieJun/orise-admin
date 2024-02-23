<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label="所属站点" prop="status">
        <SelectStation v-model="queryParams.stationId" @change="doSearch"/>
      </el-form-item>
    </el-form>
    <div class="f-des">充电桩数据由基础设施平台同步而来，如需创建请联系设备的基础设施运营商。</div>
    <el-table v-loading="loading" :data="list" class="l-panel" border :height="'calc(100vh - 260px)'">
      <el-table-column prop="equipmentId" label="编号" width="250" align="center">
        <template slot-scope="scope">
          <el-link @click="doEdit(scope.row)">
            <span>{{ scope.row.equipmentId }}</span>
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="equipmentName" label="名称" width="250" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <el-link @click="doEdit(scope.row)">
            <span>{{ scope.row.equipmentName }}</span>
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="connectorCount" label="充电枪头" width="80" align="center"></el-table-column>
      <el-table-column label="操作" align="center" width="120" class-name="small-padding">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="doEdit(scope.row)" >查看</el-button>
        </template>
      </el-table-column>
      <el-table-column label align="center" class-name="small-padding"></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="fetchList()" />

    <!-- 添加或修改充电桩对话框 -->
    <el-drawer :title="title" :visible.sync="open" size="900px" class="has-header-tabs no-footer" :wrapperClosable="false">
      <div class="el-drawer__content">
        <el-tabs v-model="activeName" type="card">
          <el-tab-pane name="first" label="基础信息">
            <el-form ref="postForm" :model="form" label-width="120px" disabled>
              <div class="f-des">充电桩数据从基础设施平台同步而来，不可修改</div>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="充电桩编码" prop="equipmentId">
                    <el-input v-model="form.equipmentId" placeholder />
                    <div class="form-tip">设备唯一编码，9位组织机构代码+14位桩编号</div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="所属站点" prop="status">
                    <SelectStation v-model="form.stationId" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="充电桩名称" prop="equipmentName">
                    <el-input v-model="form.equipmentName" placeholder maxLength="30" />
                  </el-form-item>
                </el-col>
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
                <el-col :span="12">
                  <el-form-item label="生产商组织机构代码" prop="manufacturerId" label-width="150px" >
                    <el-input v-model="form.manufacturerId" placeholder />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="经纬度">
                    <el-input-number v-model="form.equipmentLng" :controls="false" :precision="6" placeholder="经度" style="width:85px" />&nbsp;&nbsp;,&nbsp;&nbsp;
                    <el-input-number v-model="form.equipmentLat" :controls="false" :precision="6" placeholder="纬度" style="width:85px" />
                    <div class="form-tip">请输入GCJ-02坐标系，最多保留小数点后6位</div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="设备型号" prop="equipmentModel">
                    <el-input v-model="form.equipmentModel" placeholder maxLength="20" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="总功率" prop="power">
                    <el-input-number v-model="form.power" style="width:120px" :controls="false" class="append_unit" data-unit="kW"/>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="生产日期" prop="productionDate">
                    <el-date-picker v-model="form.productionDate" type="date" placeholder="选择日期" value-format="yyyy-MM-dd"></el-date-picker>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="最大允许输出功率" label-width="150px" prop="maxPower">
                    <el-input-number v-model="form.maxPower" :controls="false" :min="0" :max="100" maxLength="3" class="append_unit" data-unit="%" :precision="0"/>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-tab-pane>
          <el-tab-pane name="second" label="充电接口" v-if="form.equipmentId">
            <div class="f-des">充电接口数据从基础设施平台同步而来，不可修改</div>
            <div v-for="(connector, connectorIndex) in connectorList" :key="connectorIndex" class="chunk-bg">
              <el-form ref="connector" :model="connector" label-width="80px" size="mini" disabled>
                <el-row>
                  <el-col :span="18">
                    <el-row>
                      <el-col :span="12">
                        <el-form-item label="接口ID" prop="connectorId">
                          <el-input v-model="connector.connectorId" placeholder />
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="接口名称" prop="connectorName">
                          <el-input v-model="connector.connectorName" placeholder />
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="12">
                        <el-form-item label="额定电压" prop="menuName">
                          <el-input v-model="connector.voltageLowerLimits" placeholder style="width:100px">
                            <template slot="append">V</template>
                          </el-input>-
                          <el-input v-model="connector.voltageUpperLimits" placeholder style="width:100px">
                            <template slot="append">V</template>
                          </el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="额定电流" prop="current">
                          <el-input v-model="connector.current" placeholder style="width:120px">
                            <template slot="append">A</template>
                          </el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="12">
                        <el-form-item label="接口类型" prop="connectorType">
                          <el-select v-model="connector.connectorType" :popper-append-to-body="false">
                            <el-option
                              v-for="dict in connectorTypeOptions"
                              :key="dict.dictValue"
                              :label="dict.dictLabel"
                              :value="Number(dict.dictValue)"
                            ></el-option>
                          </el-select>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="额定功率" prop="power">
                          <el-input v-model="connector.power" placeholder style="width:120px">
                            <template slot="append">kW</template>
                          </el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row>
                      <el-col :span="12">
                        <el-form-item label="车位号" prop="parkNo">
                          <el-input v-model="connector.parkNo" placeholder />
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="国家标准" prop="nationalStandard">
                          <el-select v-model="connector.nationalStandard" placeholder>
                            <el-option label="未设置" value="0" />
                            <el-option label="2011" value="1" />
                            <el-option label="2015" value="2" />
                          </el-select>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </el-col>
                  <el-col :span="6">
                    <div class="image-preview">
                      <div ref="qrcode" class="qrcode"></div>
                      <div class="form-tip">{{connector.qrLink}}</div>
                      <div class="form-tip">1024x1024，保存图片可用于打印</div>
                    </div>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { listEquipment, getEquipment, delEquipment, addEquipment, updateEquipment, updateEquipmentExt } from '@/api/facility/equipment'
import { listConnector, getConnector, delConnector, addConnector, updateConnector } from '@/api/facility/connector'
import SelectStation from '@/components/SelectStation/FacilityStation'
import QRCode from "qrcodejs2";

export default {
  name: 'Equipment',
  components: { SelectStation, QRCode,},
  data() {
    return {
      // 遮罩层
      loading: false,
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
        equipmentId: [{ required: true, message: '充电桩Id不能为空', trigger: 'blur' }],
        equipmentName: [{ required: true, message: '充电桩名称不能为空', trigger: 'blur' }],
      },
      // 表单校验
      connectorRules: {
        gunNo: [{ required: true, message: '充电接口Id不能为空', trigger: 'blur' }],
        connectorName: [{ required: true, message: '充电桩接口不能为空', trigger: 'blur' }],
      },
      activeName: 'first',
      customPrice: false,
      equipmentDataExt: {},
    }
  },
  created() {
    this.queryParams.stationId = this.$route.query && this.$route.query.sId;
    this.queryParams.stationId && this.fetchList()
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
      listConnector({ stationId: this.queryParams.stationId, equipmentId: this.form.equipmentId }).then((response) => {
        this.connectorList = response.rows
        this.connectorList.forEach(connector => {
          connector.nationalStandard = String(connector.nationalStandard)
        })
        this.loading = false
        // 生成二维码
        this.connectorList.forEach((item, index) => {
          item.qrLink = decodeURIComponent(`${this.lwConfig.WxAppConnectorLink}${item.connectorId}`)
          this.$nextTick(() => {
            this.qrcode(index);
          });
        });
      })
    },
    qrcode(index) {
      let _this = this;
      _this.$refs.qrcode[index].innerHTML = "";
      new QRCode(_this.$refs.qrcode[index], {
        text: decodeURIComponent(`${this.lwConfig.WxAppConnectorLink}${_this.connectorList[index].connectorId}`),
        width: 1024,
        height: 1024,
      });
    },
    // 表单重置
    reset() {
      this.form = {
        equipmentId: undefined,
        equipmentName: undefined,
      }
      this.resetForm('postForm')
    },
    /** 搜索按钮操作 */
    doSearch() {
      this.queryParams.pageNum = 1
      this.fetchList()
    },
    /** 修改按钮操作 */
    async doEdit(row) {
      this.reset()
      getEquipment(this.queryParams.stationId, row.equipmentId).then((response) => {
        this.form = response.data
        this.form.maxPower = this.form.maxPower * 100
        this.open = true
        this.title = '修改充电桩'
        // 获取其下的充电接口
        this.getConnectorList()
      })
    },
    /** 提交充电枪按钮 */
    submitConnector: function (index) {
      this.$refs.connector[index].validate((valid) => {
        let connectorForm = this.connectorList[index]
        if (valid) {
          if (connectorForm.id != undefined) {
            updateConnector(connectorForm).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.fetchList()
              }
            })
          } else {
            addConnector(connectorForm).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.fetchList()
              }
            })
          }
        }
      })
    },
    /** 删除充电枪操作 */
    handleDeleteConnector(index) {
      this.$confirm('确认删除吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(
          function () {
            return delConnector(this.connectorList[index].connectorId)
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
      })
    },
    gunNoChange(connector) {
      connector.connectorId = connector.equipmentId + connector.gunNo.toString().padStart(3, '0')
    },
  }
}
</script>

<style lang="scss" scoped>
.image-preview {
  width: 100%;
  color: #1569f5;
  font-size: 3em;
  text-align: center;
  display: inline-block;
  &.hover:hover {
    cursor: pointer;
  }
}
::v-deep .qrcode {
  text-align: center;
  padding: 0 8px;
  img {
    width: 140px;
    height: 100%;
    margin: 0 auto;
  }
}
</style>
