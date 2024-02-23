<script>
import { listTag, addTag, updateTag, delTag } from '@/api/facility/tag'
import { MessageBox } from 'element-ui';

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
      default: '选择标签'
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
        tagName: '',
      },
      //tag数据
      tagForm:{
        tagId: undefined,
        tagName: undefined
      },
      list: [], // 列表
      total: 0, // 总条数
      selectedGroup: '',
      multiSelectedGroups: [],
      innerVisible: false,
      rules: {
        tagName: [{ required: true, message: '标签名称不能为空', trigger: 'blur' }],
      },
      tagTitle: "添加标签"
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
      let response = await listTag(this.query);
      this.loading = false
      if(response.code == 200){
        let { rows, total } = response;
        this.list = rows
        this.total = +total
        this.loading = false
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
        tagName: '',
      };
      this.resetForm('form')
      this.toggleSelection(null);
    },

    doOpened(){
      this.toggleSelection(this.selected)
    },

    doClosed(){
      this.reset();
    },

    doSave() {
      this.Pvisible = false
      this.$emit('success', this.multiSelect ? this.multiSelectedGroups : this.selectedGroup)
    },

    setSelected() {
      if (!this.selected.length) return

      this.list.forEach((code) => {
        if (code.tagId == this.selected[0].tagId) {
          this.selectedGroup = code
        }
      })
    },
    /** 新增tag操作 */
    doAdd(row) {
      this.tagTitle = '添加标签'
      this.resetTag();
      this.innerVisible = true
    },

    doDelete(row) {
      MessageBox.alert(`是否确认删除标签[${row.tagName}]？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      .then(() => {
        delTag(row.tagId).then((res) => {
          if (res.code === 200) {
            this.msgSuccess('删除成功')
            this.reloadList()
          }
        })
      })
      .catch(function () { })
    },

    handleEdit(row) {
      this.tagTitle = '编辑标签'
      this.tagForm = row
      this.innerVisible = true
    },

    submitTag(){
      this.$refs['tagForm'].validate((valid) => {
        if (valid) {
          let params = Object.assign({}, { tagId: this.tagForm.tagId, tagName: this.tagForm.tagName })
          if (this.tagForm.tagId != undefined) {
            updateTag(params).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.innerVisible = false
                this.reloadList()
              }
            })
          } else {
            addTag(params).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.innerVisible = false
                this.reloadList()
              }
            })
          }
        }
      })
    },

    // 取消按钮
    handleCancel() {
      this.innerVisible = false
      this.resetTag()
    },

    resetTag(){
      this.tagForm = {
        tagId: undefined,
        tagName: undefined,
      }
      this.resetForm('tagForm')
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
        allRows.push(row.tagId)
      });
      let selectRows = [];
      rows.forEach(row => {
        let indexOf = allRows.indexOf(row.tagId);
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
            v-model="query.tagName"
            class="ml10 mr10"
            style="width: 150px;"
            placeholder="请输入标签名"
            @keydown.enter="reloadList(1)"
            clearable
            @clear="reloadList(1)"
          ></el-input>
          <el-button  icon="el-icon-search" circle @click="reloadList(1)"></el-button>
          <el-button  icon="el-icon-plus" circle @click="doAdd()"></el-button>
        </el-form-item>
      </el-form>

      <el-table ref="table" :data="list" v-loading="loading" @selection-change="doSelectionChange" @row-click="doRowClick" :height="'calc(100vh - 247px)'">
        <el-table-column type="selection" width="50" align="center" v-if="multiSelect" />
        <el-table-column width="30" v-else>
          <template slot-scope="scope">
            <el-radio v-model="selectedGroup" :label="scope.row">'</el-radio>
          </template>
        </el-table-column>

        <el-table-column prop="tagName" label="标签" align="center"></el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-edit" @click.stop="handleEdit(scope.row)" >修改</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" @click.stop="doDelete(scope.row)" >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
            class="fr"
            @current-change="reloadList"
            :current-page="query.pageNum"
            :page-size="query.pageSize"
            layout="prev, pager, next"
            :total="total"
          ></el-pagination>
    </div>
    <div slot="footer">
      <el-button @click="Pvisible = false">取 消</el-button>
      <el-button type="primary" @click="doSave">确 定</el-button>
    </div>
    <el-dialog
      class="dialog-add"
      :title="tagTitle"
      :visible.sync="innerVisible"
      append-to-body
      :close-on-click-modal="false"
      width="600px" top="40vh">
      <el-form ref="tagForm" :model="tagForm" :rules="rules">
        <el-form-item label="标签名称" label-width="100" prop="tagName">
          <el-input v-model="tagForm.tagName" maxLength="32"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="submitTag">确 定</el-button>
      </div>
    </el-dialog>
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
.dialog-add {
  height: 300px;
  // vertical-align:middle;
}
</style>
