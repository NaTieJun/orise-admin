<template>
  <div class="app-container">
    <el-form class="queryForm" :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" :rules="rules">
      <el-row>
        <!-- <el-form-item label="审核状态" prop="checkState">
          <el-select v-model="queryParams.checkState" clearable size="small">
            <el-option label="全部" value />
            <el-option label="待审核" value="0" />
            <el-option label="审核通过" value="1" />
            <el-option label="审核不通过" value="2" />
          </el-select>
        </el-form-item> -->
        <el-form-item label="所属用户" prop="nickName">
          <el-input v-model="queryParams.nickName" placeholder clearable size="small" maxlength="50" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="queryParams.mobile" placeholder="填写完整手机号" clearable size="small" maxlength="11" />
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="车牌号" prop="plateNo">
          <el-input v-model="queryParams.plateNo" placeholder="车牌号" clearable size="small" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain icon="el-icon-search" size="mini" @click="doSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="doReset">重置</el-button>
        </el-form-item>
      </el-row>
      <el-row>&nbsp; &nbsp;</el-row>
    </el-form>
    <el-row>&nbsp;</el-row>
    <el-table v-loading="loading" :data="orderList" class="l-panel" border :height="'calc(100vh - 278px)'" @selection-change="doSelectionChange">
      <el-table-column type="index" width="55" align="center"></el-table-column>
      <el-table-column prop="plateNo" label="车辆号码" align="center"></el-table-column>
      <el-table-column prop="nickName" label="所属用户" align="center" show-overflow-tooltip></el-table-column>
      <el-table-column prop="mobile" label="手机号" align="center"></el-table-column>
      <!-- <el-table-column label="审核状态" align="center" prop="reviewStatus">
        <template slot-scope="scope" v-if="scope.row.licenseImgs!='[]' && scope.row.licenseImgs!=''">
          <el-tag type="info" v-if="scope.row.checkState == 0">待审核</el-tag>
          <el-tag type="success" v-if="scope.row.checkState == 1">审核通过</el-tag>
          <el-tag type="danger" v-if="scope.row.checkState == 2">审核不通过</el-tag>
        </template>
      </el-table-column> -->
      <el-table-column label="创建时间" align="center" prop="createTime" >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120" class-name="small-padding">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="doEdit(scope.row)"
            v-if="scope.row.licenseImgs!='[]' && scope.row.licenseImgs!=''"
          >{{scope.row.checkState==0?'查看':'查看'}}</el-button>
          <el-button size="mini" type="text" icon="el-icon-view" @click="doEdit(scope.row)" v-else>查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="fetchList()" />

    <!-- 审核对话框 -->
    <el-drawer :title="title" :visible.sync="open" size="500px">
      <div class="el-drawer__content" style="calc(100vh - 40px)">
        <el-form ref="form" :model="form" :rules="rules" label-width="100px" size="mini">
          <!-- <div class="chunk-bg narrow-row" v-if="form.imgs && form.imgs.length > 0">
            <div class="title">
              审核状态
              <el-tag type="info" v-if="form.checkState == 0">待审核</el-tag>
              <el-tag type="success" v-if="form.checkState == 1">审核通过</el-tag>
              <el-tag type="danger" v-if="form.checkState == 2">审核不通过</el-tag>
            </div>
          </div> -->
          <div class="chunk-bg narrow-row" style="overflow: scroll;">
            <div class="title">车辆信息</div>
            <el-form-item label="车辆号码" prop="plateNo">{{ form.plateNo }}</el-form-item>
            <el-form-item label="所属用户" prop="nickName">{{ form.nickName }}</el-form-item>
            <el-form-item label="手机号" prop="mobile">{{ form.mobile }}</el-form-item>
            <el-form-item label="车辆行驶证" prop="imgs" v-if="form.imgs && form.imgs.length > 0">
              <upload type="0" :fileList.sync="form.imgs" multiple disabled></upload>
            </el-form-item>
          </div>
          <!-- <div class="chunk-bg narrow-row" style="overflow: scroll;" v-if="form.checkState == 0 && form.imgs && form.imgs.length > 0">
            <div class="title">审核</div>
            <el-form-item>
              <el-button type="primary" @click="approve(1)">通过</el-button>
              <el-button type="danger" @click="approve(2)">不通过</el-button>
            </el-form-item>
          </div> -->
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { listCar, getCar, approveCar, updateCar } from '@/api/customer/car'

export default {
  name: 'Order',
  components: {},
  data() {
    let self = this;
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 选中Id数组
      ids: [],
      // 订单表格树数据
      orderList: [],
      // 总条数
      total: 0,
      // 订单树选项
      orderOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      priceOpen: false,
      // 订单状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        checkState: '',
        plateNo: "",
        nickName: "",
        mobile: "",
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
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
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    /** 查询车辆列表 */
    fetchList() {
      this.loading = true
      let params = Object.assign({}, this.queryParams)
      listCar(params).then((response) => {
        this.orderList = response.rows
        this.total = Number(response.total)
        this.loading = false
      }).catch(err => {
        this.loading = false
      })
    },
    // 表单重置
    reset() {
      this.form = {
        imgs: [],
      }
      this.resetForm('form')
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
      getCar(row.id).then((response) => {
        this.form = response.data
        this.form.imgs = []
        try {
          this.form.licenseImgsShow.forEach(e => {
            this.form.imgs.push({ url: e })
          });
        } catch { }
        this.open = true
        this.title = '车辆详情'
      })
    },
    /** 提交按钮 */
    async approve(result) {
      this.$refs['form'].validate(async (valid) => {
        if (valid) {
          // updateCar(this.form)
          let postData = {
            id: this.form.id,
            checkState: result,
          }
          const response = await approveCar(postData)
          if (response.code === 200) {
            this.msgSuccess('审核成功')
            this.open = false
            this.fetchList()
          }
        }
      })
    },
    // 多选框选中数据
    doSelectionChange(selection) {
      this.ids = selection.map(item => item.refundId)
    },
  }
}
</script>

<style lang="scss" scoped>
.queryForm {
  padding-bottom: 8px;
}
.select-city {
  // display: flex !important;
  ::v-deep .el-form-item {
    display: inline-block;
    padding: 0 8px 0 0;
  }
}
</style>