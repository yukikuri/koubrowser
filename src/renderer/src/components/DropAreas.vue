<script setup lang="ts">
import { KcsUtil } from '@common/kcs'
import DropArea from '@renderer/components/DropArea.vue'
import DropHistoryCell from '@renderer/components/DropHistoryCell.vue'
import { svdata } from '@renderer/store/svdata'
import LockImage from '@renderer/assets/img/lock.svg'
import { Env } from '@common/env'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Spot } from '@common/map'
import { areaNames } from '@common/area_name'
import { mapInfo as storeMapInfo } from '@renderer/store/mapinfo'

const props = defineProps<{
  area_id: number
}>()

const area_index = ref(0)
const selected_spot = ref<Spot | null>(null)

const areaNos = computed<number[]>(() => {
  const areas = areaNames.filter(
    (el) => el.areaId === props.area_id
  );
  return areas.map((el) => el.areaNo)
})
const areaNo = computed<number>(() => areaNos.value[area_index.value])
const isEventMap = computed<boolean>(() => KcsUtil.isEventAreaId(props.area_id))

onMounted(() => {
  console.log('drop areas mounted area', props.area_id, area_index.value)
})

onUnmounted(() => {
  console.log('drop areas destroyed', props.area_id, area_index.value)
})

function onChange(value: number) {
  console.log(
    'drop area change old value',
    props.area_id,
    area_index.value,
    value,
    'event-map',
    isEventMap.value
  )
  selected_spot.value = null
}

function areaNoText(index: number): string {
  if (isEventMap.value) return `E-${index + 1}`
  return `${props.area_id}-${index + 1}`
}

function isAreaLocked(index: number): boolean {
  if (!isEventMap.value) {
    return false
  }
  if (0 === index) {
    return false
  }
  if (Env.isDevelopment) {
    return false
  }

  const id = props.area_id * 10 + areaNos.value[index]
  const mapInfos = svdata.mapinfos.length ? svdata.mapinfos : storeMapInfo.api_map_info
  console.log(areaNos.value)
  console.log(
    'area locked',
    props.area_id,
    areaNo,
    mapInfos.some((el) => el.api_id === id)
  )
  return !mapInfos.some((el) => el.api_id === id)
}

function indicatorClick(event: Event): void {
  if ((event.target as HTMLElement).classList.contains('is-locked')) {
    event.stopPropagation()
  }
  selected_spot.value = null
}

function lockClick(event: Event): void {
  event.stopPropagation()
}
</script>

<template>
  <div class="drop-areas-root">
    <b-carousel
      class="areas"
      :arrow="false"
      :autoplay="false"
      @change="onChange"
      v-model="area_index"
    >
      <b-carousel-item v-for="(area_no, index) in areaNos" :key="index">
        <DropArea
          v-if="area_index === index"
          :area_id="area_id"
          :area_no="area_no"
          v-model:selected_spot="selected_spot"
        />
      </b-carousel-item>
      <template #indicators="props">
        <span
          class="areas-indicator"
          @click="indicatorClick"
          :class="{ 'is-locked': isAreaLocked(props.i) }"
        >
          <LockImage v-if="isAreaLocked(props.i)" @click="lockClick" />
          {{ areaNoText(props.i) }}
        </span>
      </template>
    </b-carousel>
    <div class="drop-history-cell-container">
      <DropHistoryCell :area_id="area_id" :area_no="areaNo" :selected_spot="selected_spot" />
    </div>
  </div>
</template>