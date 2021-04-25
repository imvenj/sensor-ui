<script>
import { defineComponent } from 'vue'
import { Line } from 'vue3-chart-v2'

export default defineComponent({
  name: 'LineChart',
  extends: Line,
  props: {
    chartData: {
      type: Object,
      required: true,
      default: () => ({})
    },
    chartOptions: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  methods: {
    reRender() {
      this.renderChart(this.chartData, this.chartOptions)
    }
   },
  watch: {
    chartData() {
      console.log('render')
      this.reRender()
    },
    chartOptions() {
      this.reRender()
    }
  },
  mounted() {
    this.reRender()
  }
})
</script>
