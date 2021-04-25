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
            <div>气温：{{ current.temperature || '...' }} ℃</div>
            <div>湿度：{{ current.humidity || '...' }} %</div>
            <div>气压：{{ current.pressure || '...' }} hPa</div>
            <div>海拔：{{ current.pressure > 1013.25 && current.altitude > 0 ? '-' : '' }}{{ current.altitude || '...' }} M</div>
            <div>照度：{{ current.luminocity || '...' }} lux</div>
            <div class="updated-at">
              更新于：{{ currentDate }}
            </div>
          </ion-card-content>
        </ion-card>
        <ion-card>
          <ion-card-content>
            <apexchart
              width="100%"
              :options="temperatureOptions"
              :series="temperatureSeries"
               v-if="temperatureSeries.length > 0"
            ></apexchart>
            <div v-else>加载中...</div>
          </ion-card-content>
        </ion-card>
        <ion-card>
          <ion-card-content>
            <apexchart
              width="100%"
              :options="humidityOptions"
              :series="humiditySeries"
               v-if="humiditySeries.length > 0"
            ></apexchart>
            <div v-else>加载中...</div>
          </ion-card-content>
        </ion-card>
        <ion-card>
          <ion-card-content>
            <apexchart
              width="100%"
              :options="pressureOptions"
              :series="pressureSeries"
               v-if="pressureSeries.length > 0"
            ></apexchart>
            <div v-else>加载中...</div>
          </ion-card-content>
        </ion-card>
        <ion-card>
          <ion-card-content>
            <apexchart
              width="100%"
              :options="luminocityOptions"
              :series="luminocitySeries"
               v-if="luminocitySeries.length > 0"
            ></apexchart>
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
import { formatDate, startOfDate } from '@/utils/index'

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
    IonButton
  },
  setup() {
    const chartOptions = {
      stroke: {
        curve: 'smooth',
        width: 2
      },
      dataLabels: {
        enabled: false
      },
      chart: {
        height: 40,
        type: 'area',
        toolbar: {
          show: false
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1500,
          animateGradually: {
              enabled: false,
              delay: 100
          },
          dynamicAnimation: {
              enabled: false,
              speed: 150
          }
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 90, 100]
        }
      },
      xaxis: {
        type: 'datetime',
        tickAmount: 10,
        labels: {
          datetimeUTC: false
        },
        format: 'HH:mm'
      },
      yaxis: {
        decimalsInFloat: 1
      },
      annotations: {
        xaxis: [
          {
            x: startOfDate(new Date()).getTime(),
            borderColor: '#CC0000'
          }
        ]
      },
      tooltip: {
        x: {
          format: 'HH:mm'
        }
      }
    }
    const data: any = reactive({
      current: {},
      currentDate: computed(() => {
        const ts = (data.current as any).timestamp
        if (!ts) { return '...' }
        const latest: Date = new Date(ts)
        return formatDate(latest)
      }),
      timeLabels: [],
      temperatureSeries: [],
      temperatureOptions: {
        ... chartOptions,
        colors: ['#6CB33F'],
        title: {text: '气温'}
      },
      humiditySeries: [],
      humidityOptions: {
        ... chartOptions,
        colors: ['#009DDC'],
        title: {text: '湿度'}
      },
      pressureSeries: [],
      pressureOptions: {
        ... chartOptions,
        colors: ['#FDBB30'],
        title: {text: '气压'}
      },
      luminocitySeries: [],
      luminocityOptions: {
        ... chartOptions,
        colors: ['#FB89F0'],
        title: {text: '照度'}
      }
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
          const tick = formatDate(new Date(t.timestamp), false)
          const parts = tick.split(/[-: ]/)
          const minute = Math.floor(Number(parts[4]) / 10) * 10
          const averageTimestamp = new Date(Number(parts[0]), Number(parts[1]), Number(parts[2]), Number(parts[3]), minute, 0).valueOf()
          const key = `${parts[3]}:${minute}`
          if (!currentKey || currentKey !== key) {
            currentKey = key
            if (Object.keys(average).length > 0) {
              average = Object.fromEntries(Object.entries(average).map(([k, v]: Array<any>) => {
                return k !== 'timestamp' ? [k, v / groupCounter] : [k, v]
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
              timestamp: averageTimestamp
            }
            groupCounter++
          }
        }

        data.timeLabels = total.map((d: any) => d.tick)
        const temperatures: any = total.map((d: any) => [d.timestamp, d.temperature])
        data.temperatureSeries =  [{
          name: '气温',
          data: temperatures
        }]
        const humidities: any = total.map((d: any) => [d.timestamp, d.humidity])
        data.humiditySeries =  [{
          name: '湿度',
          data: humidities
        }]
        const pressures: any = total.map((d: any) => [d.timestamp, d.pressure])
        data.pressureSeries =  [{
          name: '气压',
          data: pressures
        }]
        const luminicities: any = total.map((d: any) => [d.timestamp, d.luminocity])
        data.luminocitySeries =  [{
          name: '照度',
          data: luminicities
        }]
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