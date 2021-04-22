<script>
import { defineComponent } from 'vue'
import { Line } from 'vue3-chart-v2'

export default defineComponent({
  name: 'LineChart',
  extends: Line,
  props: {
    chartData: {
      type: Object,
      required: true
    },
    chartOptions: {
      type: Object,
      required: false
    }
  },
  methods: {
    reRender() {
      this.renderChart(this.chartData, this.chartOptions)
    }
   },
  watch: {
    chartData() {
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
