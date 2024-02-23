<script>
import { getRolesList } from '@/api/organization'

export default {
  components: {},
  props: {
    // 选择客户群聊显隐
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '选择角色'
    },
    // 多选
    multiSelect: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: true, // 遮罩层
      query: {
        pageNum: 1,
        pageSize: 20,
        roleName: '',
      },
      list: [], // 列表
      total: 0, // 总条数
      selectedGroup: '',
      multiSelectedGroups: []
    }
  },
  watch: {
    selected(val) {
      this.setSelected()
    },
    list(val) {
      this.setSelected()
    }
  },
  computed: {
    Pvisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  created() {
    this.fetchList()
  },
  mounted() { },
  methods: {
    // 获取列表
    async fetchList(page) {
      page && (this.query.pageNum = page)
      this.loading = true
      let response = await getRolesList(this.query);
      this.loading = false
      if(response.code == 200){
        let { rows, total } = response;
        this.list = rows
        this.total = +total
      }
    },
    async reloadList(page){
      await this.fetchList(page);
      this.$nextTick(() => {
        this.toggleSelection(this.selected)
      })
    },
    reset(){
      this.query = {
        pageNum: 1,
        pageSize: 20,
        roleName: '',
      };
      this.resetForm('form')
      this.toggleSelection(null);
    },
    doSave() {
      this.Pvisible = false
      this.$emit('success', this.multiSelect ? this.multiSelectedGroups : this.selectedGroup)
    },

    setSelected() {
      if (!this.selected.length) return

      this.list.forEach((code) => {
        if (code.userId == this.selected[0].userId) {
          this.selectedGroup = code
        }
      })
    },
    doCancel(){
      this.Pvisible = false
    },
    doOpened(){
      this.reloadList(1)
    },
    doClosed(){
      this.reset();
    },
    doSelectionChange(val) {
      this.multiSelectedGroups = val
    },
    doRowClick(row, column, event) {
      this.$refs.table.toggleRowSelection(row);
    },
    toggleSelection(rows) {
      if(rows == null || rows.length == 0){
        this.$refs.table.clearSelection();
        return;
      }
      let allRows = [];
      this.list.forEach(row => {
        allRows.push(row.roleId)
      });
      let selectRows = [];
      rows.forEach(row => {
        let indexOf = allRows.indexOf(row.roleId);
        if(indexOf != -1){
          selectRows.push(this.list[indexOf]);
        }
      });
      selectRows.forEach(row => {
        this.$refs.table.toggleRowSelection(row);
      });
    },
  }
}
</script>

<template>
  <el-dialog :title="title" :visible.sync="Pvisible" width="650px" append-to-body :close-on-click-modal="false" @opened="doOpened" @closed="doClosed">
    <div>
      <el-form ref="form" :model="query" label-width>
        <el-form-item label>
          <el-input
            v-model="query.roleName"
            class="mr10"
            style="width: 250px;"
            placeholder="请输入角色名"
            @keydown.enter="fetchList(1)"
            clearable
            @clear="fetchList(1)"
          ></el-input>
          <el-button  icon="el-icon-search" circle @click="fetchList(1)"></el-button>
        </el-form-item>
      </el-form>

      <el-table ref="table" :data="list" v-loading="loading" @selection-change="doSelectionChange" @row-click="doRowClick" :height="'calc(100vh - 245px)'">
        <el-table-column type="selection" width="50" align="center" v-if="multiSelect" />
        <el-table-column width="30" v-else>
          <template slot-scope="scope">
            <el-radio v-model="selectedGroup" :label="scope.row">'</el-radio>
          </template>
        </el-table-column>
        <el-table-column prop="roleId" label="id" align="center"></el-table-column>
        <el-table-column prop="roleName" label="角色名" align="center"></el-table-column>
      </el-table>
      <el-pagination
            class="fr"
            @current-change="fetchList"
            :current-page="query.pageNum"
            :page-size="query.pageSize"
            layout="prev, pager, next"
            :total="total"
          ></el-pagination>
    </div>
    <div slot="footer">
      <el-button @click="doCancel">取 消</el-button>
      <el-button type="primary" @click="doSave">确 定</el-button>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.code-image {
  width: 200px;
  height: 200px;
}

.code-image--small {
  width: 50px;
  height: 50px;
}

.expire-icon {
  color: red;
}
</style>
