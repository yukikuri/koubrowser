<script setup lang="ts">
import { KcsUtil } from '@common/kcs'
import DropArea from '@renderer/components/DropArea.vue'
import DropHistoryCell from '@renderer/components/DropHistoryCell.vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Spot } from '@common/map'
import { areaNames } from '@common/area_name'

const props = defineProps<{
  areaId: number
}>()

const area_index = ref(0)
const selected_spot = ref<Spot | null>(null)

const areaNos = computed<number[]>(() => {
  const areas = areaNames.filter(
    (el) => el.areaId === props.areaId
  );
  return areas.map((el) => el.areaNo)
})
const areaNo = computed<number>(() => areaNos.value[area_index.value])
const isEventMap = computed<boolean>(() => KcsUtil.isEventAreaId(props.areaId))

onMounted(() => {
  console.log('drop areas mounted area', props.areaId, area_index.value)
})

onUnmounted(() => {
  console.log('drop areas destroyed', props.areaId, area_index.value)
})

function onChange(value: number): void {
  console.log(
    'drop area change old value',
    props.areaId,
    area_index.value,
    value,
    'event-map',
    isEventMap.value
  )
  selected_spot.value = null
}

function areaNoText(index: number): string {
  if (isEventMap.value) return `E-${index + 1}`
  return `${props.areaId}-${index + 1}`
}

function indicatorClick(event: Event): void {
  if ((event.target as HTMLElement).classList.contains('is-locked')) {
    event.stopPropagation()
  }
  selected_spot.value = null
}

</script>

<template>
  <div class="drop-areas-root">
    <b-carousel
      v-model="area_index"
      class="areas"
      :arrow="false"
      :autoplay="false"
      @change="onChange"
    >
      <b-carousel-item v-for="(area_no, index) in areaNos" :key="index">
        <DropArea
          v-if="area_index === index"
          v-model:selected-spot="selected_spot"
          :area-id="areaId"
          :area-no="area_no"
        />
      </b-carousel-item>
      <template #indicators="slotProps">
        <span
          class="areas-indicator"
          @click="indicatorClick"
        >
          {{ areaNoText(slotProps.i) }}
        </span>
      </template>
    </b-carousel>
    <div class="drop-history-cell-container">
      <DropHistoryCell :area-id="areaId" :area-no="areaNo" :selected-spot="selected_spot" />
    </div>
  </div>
</template>