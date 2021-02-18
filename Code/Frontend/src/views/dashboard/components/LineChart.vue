<template>
  <div
    :class="className"
    :style="{height:height,width:width}"
  />
</template>

<script>
  import echarts from 'echarts'
  import { debounce } from '@/utils'
  require('echarts/theme/macarons')

  export default {
    data() {
      return {
        chart: null
      }
    },
    props: {
      className: {
        type: String,
        default: 'chart'
      },
      width: {
        type: String,
        default: '100%'
      },
      height: {
        type: String,
        default: '350px'
      },
      autoResize: {
        type: Boolean,
        default: true
      },
      chartData: {
        type: Object,
        default: () => {}
      }
    },
    mounted() {
      this.initChart()
      if (this.autoResize) {
        this.__resizeHanlder = debounce(() => {
          if (this.chart) {
            this.chart.resize()
          }
        }, 100)
        window.addEventListener('resize', this.__resizeHanlder)
      }
      // 监听侧边栏的变化
      const sidebarElm = document.getElementsByClassName('sidebar-container')[0]
      sidebarElm.addEventListener('transitionend', this.__resizeHanlder)
    },
    beforeDestroy() {
      if (!this.chart) {
        return
      }
      if (this.autoResize) {
        window.removeEventListener('resize', this.__resizeHanlder)
      }

      const sidebarElm = document.getElementsByClassName('sidebar-container')[0]
      sidebarElm.removeEventListener('transitionend', this.__resizeHanlder)

      this.chart.dispose()
      this.chart = null
    },
    watch: {
      chartData: {
        deep: true,
        handler(val) {
          this.setOptions(val)
        }
      }
    },
    methods: {
      setOptions({ title, series, xAxisData, legendData, toolbox } = {}) {
        const seriesData = []
        let toolBox = {}
        if (toolbox) {
          toolBox = {
            right: 26,
            feature: {
              magicType: {
                type: ['line', 'bar']
              },
              dataView: {
                readOnly: true
              },
              // dataZoom: {},
              restore: {},
              saveAsImage: {}
            }
          }
        }
        this._.map(legendData, (val, index) => {
          seriesData.push({
            name: val,
            smooth: 0,
            type: 'line',
            barMaxWidth: '66px',
            data: series[index]
          })
        })
        this.chart.setOption({
          title: {
            text: title,
            textStyle: {
              color: '#0789CF',
              fontSize: '12px'
            },
            left: 24
          },
          color: ['#F56C6C', '#0789CF', '#67C23A', '#ff6600'],
          grid: {
            left: 48,
            right: 30,
            bottom: 20,
            top: 50,
            containLabel: true
          },
          toolbox: toolBox,
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            },
            padding: [5, 10]
          },
          xAxis: {
            type: 'category',
            axisLabel: {
              interval: 0,
              rotate: 30
            },
            boundaryGap: false,
            data: xAxisData
          },
          yAxis: {
            type: 'value',
            axisTick: {
              show: false
            }
          },
          legend: {
            left: 'center',
            bottom: '2',
            data: legendData
          },
          series: seriesData
        })
      },
      initChart() {
        this.chart = echarts.init(this.$el, 'macarons')
        this.setOptions(this.chartData)
      }
    }
  }
</script>
