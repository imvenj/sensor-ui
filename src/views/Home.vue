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
            <div>海拔：{{ current.altitude }} M</div>
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
      chartOptions: computed(() => {
        return {
          element: {
            point: {
              hoverRadius: 1
            }
          }
        }
      }),
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
        for (const t of today) {
          const tick = formatDate(new Date(t.timestamp), true)
          const parts = tick.split(':')
          const tickMini = `${parts[0]}:${parts[1]}`
          const key = `${parts[0]} + ${Math.floor(Number(parts[1]) / 10)}`
          if (!currentKey || currentKey !== key) {
            currentKey = key
            if (Object.keys(average).length > 0) { total.push(average) }
            average = t
          } else {
            average = {
              temperature: (average.temperature + t.temperature) / 2,
              humidity: (average.humidity + t.humidity) / 2,
              pressure: (average.pressure + t.pressure) / 2,
              altitude: (average.altitude + t.altitude) / 2,
              luminocity: (average.luminocity + t.luminocity) / 2,
              tick: tickMini
            }
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