<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="日志时间">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" size="mini" @click="doSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="doReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="configList"
      @selection-change="doSelectionChange"
      :height="`calc(100vh - ${showSearch?'216px':'166px'})`"
    >
      <el-table-column type="index" width="55" align="center" />
      <el-table-column label="服务" align="center" prop="serveName" width="100" />
      <el-table-column label="风险等级" align="center" prop="riskLevel" width="100" />
      <el-table-column label="日志内容" prop="riskMsg">
        <template slot-scope="scope">
          <JsonViewer
            :value="JSON.parse(scope.row.riskMsg)"
            sort
            :expand-depth="0"
            :show-array-index="false"
            v-if="scope.row.riskMsg!='' && scope.row.riskMsg!='{}'"
          />
        </template>
      </el-table-column>
      <el-table-column label="日志时间" align="center" prop="createTime" width="180"></el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="fetchList" />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入参数键名" />
        </el-form-item>
        <el-form-item label="参数键值" prop="configValue">
          <el-input v-model="form.configValue" placeholder="请输入参数键值" />
        </el-form-item>
        <el-form-item label="系统内置" prop="configType">
          <el-radio-group v-model="form.configType">
            <el-radio v-for="dict in typeOptions" :key="dict.dictValue" :label="dict.dictValue">{{dict.dictLabel}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="doSave">确 定</el-button>
        <el-button @click="doCancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSystemLog } from "@/api/system/log";
import JsonViewer from 'vue-json-viewer'

export default {
  name: "Config",
  components: { JsonViewer },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 参数表格数据
      configList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 类型数据字典
      typeOptions: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        configName: undefined,
        configKey: undefined,
        configType: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        configName: [
          { required: true, message: "参数名称不能为空", trigger: "blur" }
        ],
        configKey: [
          { required: true, message: "参数键名不能为空", trigger: "blur" }
        ],
        configValue: [
          { required: true, message: "参数键值不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.fetchList();
    this.getDicts("sys_yes_no").then(response => {
      this.typeOptions = response.data;
    });
  },
  methods: {
    /** 查询参数列表 */
    fetchList() {
      this.loading = true;
      listSystemLog(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.configList = response.rows;
        this.total = Number(response.total);
        this.loading = false;
      }
      );
    },
    // 参数系统内置字典翻译
    typeFormat(row, column) {
      let businessTypeText = ["其它", "新增", "修改", "删除", "授权", "导出", "导入", "强退", "生成代码", "清空数据"]
      return businessTypeText[row.businessType];
    },
    // 取消按钮
    doCancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        configId: undefined,
        configName: undefined,
        configKey: undefined,
        configValue: undefined,
        configType: "Y",
        remark: undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    doSearch() {
      this.queryParams.pageNum = 1;
      this.fetchList();
    },
    /** 重置按钮操作 */
    doReset() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.doSearch();
    },
    // 多选框选中数据
    doSelectionChange(selection) {
      this.ids = selection.map(item => item.configId)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 提交按钮 */
    doSave: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.configId != undefined) {
            updateConfig(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.fetchList();
              }
            });
          } else {
            addConfig(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("新增成功");
                this.open = false;
                this.fetchList();
              }
            });
          }
        }
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有参数数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportConfig(queryParams);
      }).then(response => {
        this.download(response.data);
      }).catch(function () { });
    },
    /** 清理缓存按钮操作 */
    handleClearCache() {
      clearCache().then(response => {
        if (response.code === 200) {
          this.msgSuccess("清理成功");
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep .jv-container .jv-code {
  padding: 0;
}
</style>