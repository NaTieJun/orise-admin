<template>
  <el-select v-model="selectedId" :multiple="multiple" filterable placeholder :clearable="clearable" @change="change">
    <el-option v-if="showItemAll" label="全部运营商" value />
    <el-option v-for="item in tableData" :key="item.id" :label="item.operatorName" :value="item.operatorId"></el-option>
  </el-select>
</template>

<script>
import { listOperator } from "@/api/basePlat/operator";

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
      listOperator({
        pageIndex: 1,
        pageSize: 9999
      })
        .then(res => {
          this.tableData = []
          res.rows.forEach(r => {
            r.userOperatorSecret && r.operatorSecret && this.tableData.push(r)
          });
          this.listLoading = false;
        })
        .catch(err => {
          console.log(err);
        });
    },
    change() {
      this.$emit('change')
    },
  }
};
</script>