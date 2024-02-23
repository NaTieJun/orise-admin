<template>
  <el-select v-model="selectedId" :multiple="multiple" @change="change" filterable placeholder :clearable="clearable">
    <el-option v-if="showItemAll" label="全部" value />
    <el-option v-for="item in tableData" :key="item.stationId" :label="item.stationName" :value="item.stationId"></el-option>
  </el-select>
</template>

<script>
import { listStation } from "@/api/facility/station";

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
    selectFirst: {
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
      listStation({
        pageNum: 1,
        pageSize: 9999
      })
        .then(res => {
          this.tableData = res.rows;
          this.listLoading = false;
          if (this.selectFirst && this.tableData.length > 0) {
            this.$emit("input", this.tableData[0].stationId);
            this.$emit('change', 'selectFirst')
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    change() {
      this.$emit('change')
    }
  }
};
</script>