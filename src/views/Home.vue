<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>实时数据</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">实时数据</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        <ion-card v-if="current">
          <ion-card-content>
            <div>气温：{{ current.temperature }} ℃</div>
            <div>湿度：{{ current.humidity }} %</div>
            <div>气压：{{ current.pressure }} hPa</div>
            <div>海拔：{{ current.pressure > 1013.25 && current.altitude > 0 ? '-' : '' }}{{ current.altitude }} M</div>
            <div>照度：{{ current.luminocity }} lux</div>
            <div class="updated-at">
              更新于：{{ currentDate }}
            </div>
          </ion-card-content>
        </ion-card>
        <ion-card>
          <ion-card-content>
            <line-chart :chartData="temperatureData" :chartOptions="chartOptions" v-if="today.length > 0"></line-chart>
            <div v-else>加载中...</div>
          </ion-card-content>
        </ion-card>
        <ion-card>
          <ion-card-content>
            <line-chart :chartData="humidityData" :chartOptions="chartOptions" v-if="today.length > 0"></line-chart>
            <div v-else>加载中...</div>
          </ion-card-content>
        </ion-card>
        <ion-card>
          <ion-card-content>
            <line-chart :chartData="pressureData" :chartOptions="chartOptions" v-if="today.length > 0"></line-chart>
            <div v-else>加载中...</div>
          </ion-card-content>
        </ion-card>
        <ion-card>
          <ion-card-content>
            <line-chart :chartData="luminocityData" :chartOptions="chartOptions" v-if="today.length > 0"></line-chart>
            <div v-else>加载中...</div>
          </ion-card-content>
        </ion-card>
      </div>
      <div class="ion-padding">
        <ion-button expand="block" color="primary" @click="fetchToday">
          刷新图表
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonButton,
  IonCardContent
} from '@ionic/vue';
import { defineComponent, onMounted, computed, toRefs, reactive } from 'vue';
import { getCurrent, getToday } from '@/api/index'
import LineChart from '@/components/LineChart.vue'
import { formatDate } from '@/utils/index'

export default defineComponent({
  name: 'Home',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonButton,
    LineChart
  },
  setup() {
    const defaultDataConfig = {
      cubicInterpolationMode: 'monotone',
      tension: 0.4
    }
    const data: any = reactive({
      current: {},
      today: [],
      currentDate: computed(() => {
        const latest: Date = new Date((data.current as any).timestamp)
        return formatDate(latest)
      }),
      timeLabels: computed(() => data.today.map((d: any) => d.tick)),
      chartOptions: {
        radius: 0,
        scales: {
          y: {
            display: true,
            title: {
              display: true,
              text: 'Value'
            },
            suggestedMin: -10,
            suggestedMax: 200
          }
        }
      },
      temperatureData: computed(() => {
        const temperatures: any = data.today.map((d: any) => d.temperature)
        return {
          labels: data.timeLabels,
          datasets: [
            {
              label: '温度',
              backgroundColor: '#6CB33F',
              data: temperatures,
              ...defaultDataConfig
            }
          ]
        }
      }),
      humidityData: computed(() => {
        const humidity: any = data.today.map((d: any) => d.humidity)
        return {
          labels: data.timeLabels,
          datasets: [
            {
              label: '湿度',
              backgroundColor: '#009DDC',
              data: humidity,
              ...defaultDataConfig
            }
          ]
        }
      }),
      pressureData: computed(() => {
        const pressure: any = data.today.map((d: any) => d.pressure)
        return {
          labels: data.timeLabels,
          datasets: [
            {
              label: '气压',
              backgroundColor: '#FDBB30',
              data: pressure,
              ...defaultDataConfig
            }
          ]
        }
      }),
      luminocityData: computed(() => {
        const luminocity: any = data.today.map((d: any) => d.luminocity)
        return {
          labels: data.timeLabels,
          datasets: [
            {
              label: '照度',
              backgroundColor: '#FB89F0',
              data: luminocity,
              ...defaultDataConfig
            }
          ]
        }
      })
    })

    const fetchCurrent = async () => {
      try {
        data.current = await getCurrent()
      } catch (error) {
        console.log(error)
      }
    }

    const fetchToday = async () => {
      try {
        const today = await getToday()
        let average: any = {}
        let currentKey = ''
        const total = []
        let groupCounter = 0
        for (const t of today) {
          const tick = formatDate(new Date(t.timestamp), true)
          const parts = tick.split(':')
          const key = `${parts[0]}:${Math.floor(Number(parts[1]) / 10)}`
          if (!currentKey || currentKey !== key) {
            currentKey = key
            if (Object.keys(average).length > 0) {
              average = Object.fromEntries(Object.entries(average).map(([k, v]: Array<any>) => {
                return typeof(v) === 'number' ? [k, v / groupCounter] : [k, v]
              }))
              total.push(average)
            }
            average = t
            groupCounter = 1
          } else {
            average = {
              temperature: average.temperature + t.temperature,
              humidity: average.humidity + t.humidity,
              pressure: average.pressure + t.pressure,
              altitude: average.altitude + t.altitude,
              luminocity: average.luminocity + t.luminocity,
              tick: key + '0'
            }
            groupCounter++
          }
        }
        console.log('total: ', total)
        data.today = total
      } catch (error) {
        console.log(error)
      }
    }

    onMounted(async () => {
      await fetchCurrent()
      await fetchToday()
      setInterval(async () => {
        await fetchCurrent()
      }, 30000)
    })

    return { ...toRefs(data), fetchToday }
  }
});
</script>

<style scoped>
</style>