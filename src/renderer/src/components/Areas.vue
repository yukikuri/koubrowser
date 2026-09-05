<script setup lang="ts">
import { ApiCallback, MstMapinfo } from '@common/kcs'
import { Api } from '@common/kcsapi'
import Area from '@renderer/components/Area.vue'
import CellEnemies from '@renderer/components/CellEnemies.vue'
import { svdata } from '@renderer/store/svdata'
import * as mapInfoStore from '@renderer/store/mapinfo'
import LockImage from '@renderer/assets/img/lock.svg'
import { computed, onMounted, onUnmounted, ref, toRaw } from 'vue'
import { Env } from '@common/env'

/////////////////////////////////////////////////////////////////////////////////////
// debug
const DEBUG = false;

const debug = (...args: unknown[]): void => {
  if (DEBUG) console.info("[Areas]", ...args);
};

/////////////////////////////////////////////////////////////////////////////////////
// 
const props = withDefaults(
  defineProps<{
    areaId: number
    deckIndex?: number
    singleRow?: boolean
  }>(),
  {
    deckIndex: 0,
    singleRow: false
  }
)

const area_index = ref(getBattleTabIndex())
const selected_label = ref('')
let cb_map_start = 0

const areas = computed<MstMapinfo[]>(() =>
  svdata.mstMapInfos.filter((el) => el.api_maparea_id === props.areaId)
)
const areaNos = computed<number[]>(() => areas.value.map((el) => el.api_no).sort())
const areaNo = computed<number>(() => areaNos.value[area_index.value])
const isEventMap = computed<boolean>(() => props.areaId > 40)

function getBattleTabIndex(): number {
  if (!svdata.inMap) {
    debug('areas select tab: not in map')
    return 0
  }

  const map_start = svdata.mapStart
  if (! map_start) {
    debug('areas select tab: no map start data')
    return 0
  }

  if (map_start.api_maparea_id !== props.areaId) {
    debug('areas select tab: map start area id mismatch', map_start.api_maparea_id, props.areaId)
    return 0
  }  

  const ret = map_start.api_mapinfo_no - 1
  if (ret < 0) {
    return 0
  }
  return ret
}


function selectBattleTab(): void {
  debug(
    'areas select tab.',
    'in map:', svdata.inMap,
    'area id:', svdata.mapStart?.api_maparea_id,
    'area no:', svdata.mapStart?.api_mapinfo_no,
    'props:', toRaw(props)
  )
  area_index.value = getBattleTabIndex()
  debug('areas selected tab index:', area_index.value)
}

function onMapStart(): void {
  debug('area map start')
  selectBattleTab()
}

onMounted(() => {
  debug('areas mounted area', props.areaId, area_index.value)
  cb_map_start = ApiCallback.set([Api.REQ_MAP_START, () => onMapStart()])
})

onUnmounted(() => {
  debug('areas destroyed', props.areaId, area_index.value)
  ApiCallback.unset(cb_map_start)
})

function onChange(value: number): void {
  debug(
    'area change old value',
    props.areaId,
    area_index.value,
    value,
    'event-map',
    isEventMap.value
  )
  selected_label.value = ''
}

function areaNoText(index: number): string {
  if (isEventMap.value) return `E-${index + 1}`
  return `${props.areaId}-${index + 1}`
}

function isBattleArea(index: number): boolean {
  if (!svdata.inMap) return false
  const map_start = svdata.mapStart
  if (map_start?.api_maparea_id !== props.areaId) return false
  return index === map_start.api_mapinfo_no - 1
}

function isAreaLocked(index: number): boolean {
  if (Env.isTestMode) {
    return false
  }

  if (props.areaId === 1 && index === 0) {
    return false
  }

  const mapinfos = svdata.mapinfos.length > 0 ? svdata.mapinfos : mapInfoStore.mapInfo.api_map_info
  const id = areas.value[index].api_id
  debug(areas.value)
  debug(
    'area locked area_id:' ,props.areaId, 'api_id:', id, 'exist:', 
    mapinfos.some((el) => el.api_id === id)
  )
  return !mapinfos.some((el) => el.api_id === id)
}

function indicatorClick(event: Event): void {
  if ((event.target as HTMLElement).classList.contains('is-locked')) {
    event.stopPropagation()
  }
}

function lockClick(event: Event): void {
  event.stopPropagation()
}

</script>
<template>
  <div class="areas-root">
    <b-carousel
      v-model="area_index"
      class="areas"
      :arrow="false"
      :autoplay="false"
      @change="onChange"
    >
      <b-carousel-item v-for="(area_no, index) in areaNos" :key="index">
        <Area
          v-if="area_index === index"
          v-model:selected-label="selected_label"
          :area-id="areaId"
          :area-no="area_no"
        />
      </b-carousel-item>
      <template #indicators="slotProps">
        <span
          class="areas-indicator"
          :class="{ 'is-battle': isBattleArea(slotProps.i), 'is-locked': isAreaLocked(slotProps.i) }"
          @click="indicatorClick"
        >
          <LockImage v-if="isAreaLocked(slotProps.i)" @click="lockClick" />
          {{ areaNoText(slotProps.i) }}
        </span>
      </template>
    </b-carousel>
    <div class="areas-cell-enemies">
      <CellEnemies
        :area_id="areaId"
        :area_no="areaNo"
        :selected_label="selected_label"
        :deck_index="deckIndex"
        :single_row="singleRow"
      />
    </div>
  </div>
</template>