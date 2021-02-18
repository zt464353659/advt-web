<template>
  <el-table
    :data="list"
    style="width: 100%;"
  >
    <!--<el-table-column type="index"></el-table-column>-->
    <el-table-column
      prop="name"
      min-width="200"
      :render-header="renderHeader"
    />
    <el-table-column
      prop="date"
      width="200"
      align="right"
    />
  </el-table>
</template>

<script>
  export default {
    name: 'ListingTable',
    data() {
      return {
        title: ' 系统公告',
        list: [{
          name: '首页统计图表上线了。。。',
          date: '2018-06-19 12:00:00'
        }, {
          name: '广告列表上线了。。。',
          date: '2018-06-14 12:00:00'
        }, {
          name: '广告管理系统上线了。。。',
          date: '2018-06-01 12:00:00'
        }]
      }
    },
    methods: {
      renderHeader(h, { column, $index }) {
        return h('span', [
          h('svg-icon', { 'attrs': { 'icon-class': 'remind2' }}),
          h('span', this.title)
        ])
      }
    }
  }
</script>
