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
            <apexchart
              width="100%"
              :options="{...chartOptions, colors: ['#6CB33F'], title: {text: '气温'}}"
              :series="temperatureSeries"
               v-if="today.length > 0"
            ></apexchart>
            <div v-else>加载中...</div>
          </ion-card-content>
        </ion-card>
        <ion-card>
          <ion-card-content>
            <apexchart
              width="100%"
              :options="{...chartOptions, colors: ['#009DDC'], title: {text: '湿度'}}"
              :series="humiditySeries"
               v-if="today.length > 0"
            ></apexchart>
            <div v-else>加载中...</div>
          </ion-card-content>
        </ion-card>
        <ion-card>
          <ion-card-content>
            <apexchart
              width="100%"
              :options="{...chartOptions, colors: ['#FDBB30'], title: {text: '气压'}}"
              :series="pressureSeries"
               v-if="today.length > 0"
            ></apexchart>
            <div v-else>加载中...</div>
          </ion-card-content>
        </ion-card>
        <ion-card>
          <ion-card-content>
            <apexchart
              width="100%"
              :options="{...chartOptions, colors: ['#FB89F0'], title: {text: '照度'}}"
              :series="luminocitySeries"
               v-if="today.length > 0"
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
    IonButton
  },
  setup() {
    const data: any = reactive({
      current: {},
      today: [],
      currentDate: computed(() => {
        const latest: Date = new Date((data.current as any).timestamp)
        return formatDate(latest)
      }),
      timeLabels: computed(() => data.today.map((d: any) => d.tick)),
      chartOptions: {
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
          categories: computed(() => data.today.map((d: any) => d.tick)),
          tickAmount: 10,
        },
        yaxis: {
          decimalsInFloat: 1
        },
        annotations: {
          xaxis: [
            {
              x: '00:00',
              borderColor: '#CC0000'
            }
          ]
        }
      },
      temperatureSeries: computed(() => {
        const temperatures: any = data.today.map((d: any) => d.temperature)
        return [{
          name: '气温',
          type: 'line',
          data: temperatures
        }]
      }),
      humiditySeries: computed(() => {
        const humidities: any = data.today.map((d: any) => d.humidity)
        return [{
          name: '气温',
          type: 'line',
          data: humidities
        }]
      }),
      pressureSeries: computed(() => {
        const pressures: any = data.today.map((d: any) => d.pressure)
        return [{
          name: '气温',
          type: 'line',
          data: pressures
        }]
      }),
      luminocitySeries: computed(() => {
        const luminocities: any = data.today.map((d: any) => d.luminocity)
        return [{
          name: '气温',
          type: 'line',
          data: luminocities
        }]
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