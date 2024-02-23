<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label prop="remark">
        <el-input v-model="queryParams.keyword" placeholder="搜索名称" clearable size="small"
          @keyup.enter.native="doSearch" style="width:250px;" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="doSearch">搜索</el-button>
      </el-form-item>
    </el-form>

    <div class="mb8">
      <el-button type="primary" icon="el-icon-plus" @click="doAdd"
        >新增</el-button>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="fetchList"></right-toolbar>
    </div>

    <el-table v-loading="loading" :data="templateList" class="l-panel" border :height="'calc(100vh - 280px)'">
      <el-table-column type="index" width="55" align="center"></el-table-column>
      <el-table-column prop="remark" label="模板名称" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="创建时间" align="center" prop="time">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.time) }}</span>
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
      @pagination="fetchList()" />

    <!-- 添加编辑对话框 -->
    <el-drawer :title="title" :visible.sync="open" size="900px">
      <div class="el-drawer__content">
        <PriceInfoForm :priceCode="priceCode" ref='priceInfoForm' @success="onEditTemplateSuccess"/>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { listPriceTemplate, deletePriceTemplate } from '@/api/basePlat/priceTemplate'
import PriceInfoForm from './components/-price-info'

export default {
  name: 'PriceTemplate',
  components: { PriceInfoForm },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 运营商表格树数据
      templateList: [],
      // 总条数
      total: 0,
      // 运营商树选项
      OperatorOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      priceOpen: false,
      // 查询参数
      queryParams: {
        keyword: undefined,
        pageNum: 1,
        pageSize: 20,
      },
      // 表单参数
      form: {},
      priceCode: undefined
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    /** 查询运营商列表 */
    fetchList() {
      this.loading = true
      listPriceTemplate(this.queryParams).then((response) => {
        this.templateList = response.data.rows
        this.total = Number(response.data.total)
        this.loading = false
      })
    },
    // 表单重置
    reset() {
      this.$nextTick(() => {;
        this.$refs.priceInfoForm?.reset();
      })
    },
    /** 搜索按钮操作 */
    doSearch() {
      this.queryParams.pageNum = 1
      this.fetchList()
    },
    /** 新增按钮操作 */
    doAdd(row) {
      this.reset()
      this.open = true
      this.title = '添加价格模板'
    },
    /** 修改按钮操作 */
    doEdit(row) {
      this.reset()
      this.priceCode = row.priceCode
      this.title = '修改价格模板'
      this.open = true
      this.$nextTick(() => {
        this.$refs.priceInfoForm.reloadData();
      })
    },
    /** 删除按钮操作 */
    doDelete(row) {
      this.$confirm('是否确认删除名称为"' + row.remark + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      .then(function () {
        return deletePriceTemplate(row.priceCode)
      })
      .then(() => {
        this.fetchList()
        this.msgSuccess('删除成功')
      })
      .catch(function () { })
    },
    onEditTemplateSuccess(){
      this.open = false
      this.fetchList()
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

.chunk-bg {
  background-color: #fff;
}
</style>