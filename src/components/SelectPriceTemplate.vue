<template>
  <el-select v-model="selectedId" :multiple="multiple" @change="change" filterable placeholder :clearable="clearable">
    <el-option v-for="item in tableData" :key="item.priceCode" :label="item.remark" :value="item.priceCode"></el-option>
  </el-select>
</template>

<script>
import { listPriceTemplate } from '@/api/basePlat/priceTemplate'

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
      listPriceTemplate({
        pageNum: 1,
        pageSize: 9999
      })
      .then(res => {
        this.tableData = res.data.rows;
        this.listLoading = false;
      })
      .catch(err => {
        console.log(err);
      });
    },
    change(val) {
      const index = this.tableData.findIndex((price) => price.priceCode == val)
      this.$emit('change', this.tableData[index])
    }
  }
};
</script>