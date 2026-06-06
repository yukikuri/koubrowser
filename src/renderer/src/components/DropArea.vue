<script setup lang="ts">
import { CellInfo, Spot } from '@common/map'
import MapImg from '@renderer/components/MapImg.vue'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { mapInfoCache } from '@renderer/common/mapinfo'
import RankPie from '@renderer/components/chart/RankPie.vue'
import { AggregatedCellRank, CellRankCountIndex } from '@common/calc_record'
import { PieData } from '@renderer/components/chart/types'
import LocationImage from '@assets/img/location.svg'
import * as PiePosUtil from '@renderer/components/chart/PiePosUtil'

const isLocatonVisible = ref(false)

/////////////////////////////////////////////////////////////////////////////////////
// props & emits (v-model:selected_spot)
const props = defineProps<{ area_id: number; area_no: number; selected_spot: Spot | null }>()
const emit = defineEmits<{ (e: 'update:selected_spot', value: Spot | null): void }>()

const selected_spot = computed<Spot | null>({
  get: () => props.selected_spot,
  set: (val) => emit('update:selected_spot', val)
})

/////////////////////////////////////////////////////////////////////////////////////
//
interface AreaSpot {
  spot: Spot
  cellClass: string
  cellXY: string
}

interface SpotPie {
  cell_no: number
  pieXYWH: string
  datas: PieData[]
}

const spotPies = ref<SpotPie[]>([])
const pieHeight = ref(90)
const pieIsSmall = PiePosUtil.isSmallPie(props.area_id, props.area_no)

const MAP_RATIO = 0.5
const ratio = (v: number): number => {
  return v * MAP_RATIO
}

// state
const cell_info = reactive<CellInfo>({ spots: [], checks: [] })
const active_cell = ref<HTMLElement | null>(null)

const isEventMap = computed<boolean>(() => props.area_id > 40)

const dropSpots = ref<AreaSpot[]>([])

function dropSpotClick(event: MouseEvent): void {
  event.preventDefault()
  if (event.isTrusted) {
    const no = (event.target as HTMLElement).dataset.no
    if (active_cell.value) {
      //active_cell.value.classList.remove('active')
    }
    active_cell.value = event.target as HTMLElement
    //active_cell.value.classList.add('active')
    if (no) {
      const noAsNumber = Number(no)
      const spot = dropSpots.value.find((el) => el.spot.no === noAsNumber)?.spot
      console.log('drop spot clicked:', no, spot)
      if (spot) {
        selected_spot.value = spot
        isLocatonVisible.value = true
      }
    }
  }
}

function cellClass(type?: string): string {
  let ret = 'cellarea'
  if (type) ret += ' ' + type
  return ret
}

function cellXY(spot: Spot): string {
  const diff = spot.type === 'boss' ? 26 : 15
  return `left: ${ratio(spot.x) - diff}px; top:${ratio(spot.y) - diff}px; z-index: 50;`
}

computed<string>(() => {
  return isEventMap.value ? 'bottom: 20px; right: 20px;' : 'top: 20px; right: 20px;'
})

function pieXYWH(spot: Spot): string {
  const diff = spot.type === 'boss' ? -70 : -70
  let diffX = 0
  let diffY = 0
  const fixPos = PiePosUtil.getFixPiePos(props.area_id, props.area_no, spot.no)
  if (fixPos) {
    diffX = fixPos.modX
    diffY = fixPos.modY
  }
  return (
    `left: ${ratio(spot.x) + diff + diffX}px;` +
    `top:${ratio(spot.y) + diff + diffY}px;` +
    `width: ${pieHeight.value}px;` +
    `height: ${pieHeight.value}px;`
  )
}

function setPies(datas: AggregatedCellRank[]) {
  const localDropSpots: AreaSpot[] = []
  const pies: SpotPie[] = []
  const spots = cell_info.spots
  const ranks: {
    index: CellRankCountIndex
    text: string
  }[] = [
    { index: CellRankCountIndex.S, text: 'S' },
    { index: CellRankCountIndex.A, text: 'A' },
    { index: CellRankCountIndex.B, text: 'B' },
    { index: CellRankCountIndex.C, text: 'C' },
    { index: CellRankCountIndex.D, text: 'D' },
    { index: CellRankCountIndex.E, text: 'E' }
  ]
  datas.forEach((data) => {
    const spot = spots.find((el) => el.no === data.cell_no)
    if (spot) {
      const pieDatas: PieData[] = []
      ranks.forEach((rank) => {
        const count = data.counts[rank.index]
        if (count > 0) {
          pieDatas.push({ name: rank.text, y: count })
        }
      })
      pies.push({
        cell_no: data.cell_no,
        pieXYWH: pieXYWH(spot),
        datas: pieDatas,
      })
      localDropSpots.push({
        spot,
        cellClass: cellClass(spot.type),
        cellXY: cellXY(spot)
      })
    }
  })
  spotPies.value = pies
  console.log('spot pies set:', spotPies.value)

  // set drop spots
  dropSpots.value = localDropSpots
  console.log('drop spots', localDropSpots)
}

/////////////////////////////////////////////////////////////////////////////////////
// location image
const locationStyle = computed<string>(() => {
  const spot = selected_spot.value
  if (!spot) {
    return 'display: none;'
  }
  const left = ratio(spot.x)
  const top = ratio(spot.y)
  return `left: ${left - 21}px; top:${top - 36}px;`
})

/////////////////////////////////////////////////////////////////////////////////////
//
onMounted(() => {
  console.log('drop area mounted', props.area_id, props.area_no)
})

onUnmounted(() => {
  console.log('drop area destroyed', props.area_id, props.area_no)
})

// -----------------------------------------------------------------
// initialize
;(() => {
  mapInfoCache
    .get(props.area_id, props.area_no)
    .then((info) => {
      console.log('cell info async returned', info)
      Object.assign(cell_info, info)

      window.api
        .aggregateCellRank(props.area_id, props.area_no)
        .then((datas) => {
          console.log('aggregate drop by area returned:', datas)
          setPies(datas)
        })
        .catch((err) => console.log(err))
    })
    .catch((err) => console.log(err))
})()
</script>
<style scoped></style>
<template>
  <div class="drop-area map">
    <MapImg :area_id="area_id" :area_no="area_no" />
    <a
      v-for="(spot, index) in dropSpots"
      :key="`enemy${index}`"
      :class="spot.cellClass"
      :style="spot.cellXY"
      href="#"
      :data-no="spot.spot.no"
      @click="dropSpotClick"
    ></a>
    <div
      class="rankpie-container"
      v-for="(spotPie, index) in spotPies"
      :key="`spotpie${index}`"
      :style="spotPie.pieXYWH"
    >
      <RankPie :seriesData="spotPie.datas" :height="pieHeight" :isSmall="pieIsSmall" />
    </div>
    <transition name="scale-effect" appear>
      <div class="location-image" v-if="isLocatonVisible" :style="locationStyle">
        <LocationImage />
      </div>
    </transition>
  </div>
</template>
