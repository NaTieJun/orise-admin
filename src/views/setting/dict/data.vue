<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="所属字典" prop="dictType">
        <el-select v-model="queryParams.dictType" size="small">
          <el-option v-for="item in typeOptions" :key="item.dictId" :label="item.dictName" :value="item.dictType" />
        </el-select>
      </el-form-item>
      <el-form-item label="标签名称" prop="dictLabel">
        <el-input v-model="queryParams.dictLabel" placeholder="请输入字典标签" clearable size="small"
          @keyup.enter.native="doSearch" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" size="mini" @click="doSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="doReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="doAdd"
          >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="doEdit"
          >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="doDelete"
          >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport"
          >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="fetchList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="dataList" @selection-change="doSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="标签排序" align="center" prop="dictSort" />
      <el-table-column label="标签名称" align="center" prop="dictLabel" />
      <el-table-column label="标签键值" align="center" prop="dictValue" />
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="doEdit(scope.row)"
            >修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="doDelete(scope.row)"
            >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="fetchList" />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" @submit.native.prevent>
        <el-form-item label="字典编码">
          <el-input v-model="form.dictType" :disabled="true" />
        </el-form-item>
        <el-form-item label="数据标签" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="请输入数据标签" />
        </el-form-item>
        <el-form-item label="数据键值" prop="dictValue">
          <el-input v-model="form.dictValue" placeholder="请输入数据键值" />
        </el-form-item>
        <el-form-item label="显示排序" prop="dictSort">
          <el-input-number v-model="form.dictSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="" prop="remark">
          <el-button type="primary" @click="doSave" native-type="submit">确 定</el-button>
          <el-button @click="doCancel">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { listData, getData, delData, addData, updateData, exportData } from "@/api/system/dict/data";
import { listType, getType } from "@/api/system/dict/type";

export default {
  name: "Data",
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
      // 字典表格数据
      dataList: [],
      // 默认字典编码
      defaultDictType: "",
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      statusOptions: [],
      // 类型数据字典
      typeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        dictName: undefined,
        dictType: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        dictLabel: [
          { required: true, message: "数据标签不能为空", trigger: "blur" }
        ],
        dictValue: [
          { required: true, message: "数据键值不能为空", trigger: "blur" }
        ],
        dictSort: [
          { required: true, message: "数据顺序不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    const dictId = this.$route.query && this.$route.query.dictId;
    this.getType(dictId);
    this.getTypeList();
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data;
    });
  },
  methods: {
    /** 查询字典编码详细 */
    getType(dictId) {
      getType(dictId).then(response => {
        this.queryParams.dictType = response.data.dictType;
        this.defaultDictType = response.data.dictType;
        this.fetchList();
      });
    },
    /** 查询字典编码列表 */
    getTypeList() {
      listType({pageSize: 999}).then(response => {
        this.typeOptions = response.rows;
      });
    },
    /** 查询字典数据列表 */
    fetchList() {
      this.loading = true;
      listData(this.queryParams).then(response => {
        this.dataList = response.rows;
        this.total = Number(response.total);
        this.loading = false;
      });
    },
    // 取消按钮
    doCancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        dictCode: undefined,
        dictLabel: undefined,
        dictValue: undefined,
        dictSort: 0,
        status: "0",
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
      this.resetForm("queryForm");
      this.queryParams.dictType = this.defaultDictType;
      this.doSearch();
    },
    /** 新增按钮操作 */
    doAdd() {
      this.reset();
      this.open = true;
      this.title = "添加字典数据";
      this.form.dictType = this.queryParams.dictType;
    },
    // 多选框选中数据
    doSelectionChange(selection) {
      this.ids = selection.map(item => item.dictCode)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 修改按钮操作 */
    doEdit(row) {
      this.reset();
      const dictCode = row.dictCode || this.ids
      getData(dictCode).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改字典数据";
      });
    },
    /** 提交按钮 */
    doSave: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.dictCode != undefined) {
            updateData(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.fetchList();
              }
            });
          } else {
            addData(this.form).then(response => {
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
    /** 删除按钮操作 */
    doDelete(row) {
      const dictCodes = row.dictCode || this.ids;
      this.$confirm('是否确认删除字典编码为"' + dictCodes + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delData(dictCodes);
      }).then(() => {
        this.fetchList();
        this.msgSuccess("删除成功");
      }).catch(function () { });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      let self = this;
      this.$confirm('是否确认导出所有数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        let index = self.typeOptions.findIndex((i) => i.dictType === queryParams.dictType)
        const fileName = `字典详情-${self.typeOptions[index].dictName}.xlsx`
        return exportData(fileName, queryParams);
      }).catch(function () { });
    }
  }
};
</script>
