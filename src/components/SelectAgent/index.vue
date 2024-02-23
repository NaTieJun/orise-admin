<template>
  <el-select v-model="selectedId" :multiple="multiple" filterable placeholder :clearable="clearable">
    <el-option v-if="showItemAll" label="全部" value />
    <el-option v-for="item in tableData" :key="item.agentId" :label="item.agentName" :value="Number(item.agentId)"></el-option>
  </el-select>
</template>

<script>
import { listAgent } from "@/api/operateCenter/agent";

export default {
  name: "TeachTaskListMulti",
  props: {
    value: [Number, String, Array],
    multiple: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    showItemAll: {
      type: Boolean,
      default: false
    },
    planId: [Number, String],
  },
  computed: {
    selectedId: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    }
  },
  data() {
    return {
      tableData: []
    };
  },
  created() {
    this.getData();
  },
  methods: {
    getData() {
      this.listLoading = true;
      listAgent({
        pageIndex: 1,
        pageSize: 9999
      })
        .then(res => {
          this.tableData = res.rows;
          this.listLoading = false;
        })
        .catch(err => {
          console.log(err);
        });
    },
  }
};
</script>