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
  mounted() {
    this.renderChart(this.chartData,
    {
      responsive: true,
      ...this.chartOptions
    })
  }
})
</script>
