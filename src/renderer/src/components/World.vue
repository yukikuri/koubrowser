<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ApiCallback, ApiMapAreaType } from '@common/kcs'
import { Api } from '@common/kcsapi'
import Areas from '@renderer/components/Areas.vue'
import { svdata } from '@renderer/store/svdata'
import * as mapInfoStore from '@renderer/store/mapinfo'
import LockImage from '@renderer/assets/img/lock.svg'

type Props = { deck_index?: number }
const props = withDefaults(defineProps<Props>(), { deck_index: 0 })

/////////////////////////////////////////////////////////////////////////////////////
// デバッグログ
const DEBUG = 0;

const debug = (...args: any[]) => {
  if (DEBUG) console.debug("[World]", ...args);
};

/////////////////////////////////////////////////////////////////////////////////////
//
const getBattleTabIndex = (): number => {
  if (!svdata.inMap) return 0
  const map_start = svdata.mapStart
  if (!map_start) return 0

  const indexs = [1, 2, 3, 7, 4, 5, 6]
  if (svdata.inEvent) indexs.push(eventAreaId.value)
  const i = indexs.findIndex((el) => el === map_start.api_maparea_id)
  if (i === -1) {
    return 0
  }
  return i;
}

const index = ref(getBattleTabIndex())
let cb_map_start = 0

const onMapStart = (): void => {
  selectBattleTab()
}

const selectBattleTab = (): void => {
  if (!svdata.inMap) return
  const map_start = svdata.mapStart
  if (!map_start) return

  const indexs = [1, 2, 3, 7, 4, 5, 6]
  if (svdata.inEvent) indexs.push(eventAreaId.value)
  const i = indexs.findIndex((el) => el === map_start.api_maparea_id)
  if (i !== -1) index.value = i
  debug('world selectBattleTab set index:', index.value)
}

const onChange = (valueNew: number): void => {
  // debug log if needed
  debug('world tab changed', 'old world:', index.value, 'new world:', valueNew)
}

const inEvent = (): boolean => {
  return svdata.inEvent
}

const isWorldBattle = (areaId: number): boolean => {
  debug('call is world', areaId, svdata.inMap, svdata.mapStart?.api_maparea_id)
  if (!svdata.inMap) return false
  return svdata.mapStart?.api_maparea_id === areaId
}

const getTabClass = (areaId: number): object => {
  return {
    'world-tab': true,
    'is-battle': isWorldBattle(areaId)
  }
}

const classWorld1 = computed((): object => {
  return getTabClass(1)
})

const classWorld2 = computed((): object => {
  return getTabClass(2)
})

const classWorld3 = computed((): object => {
  return getTabClass(3)
})

const classWorld4 = computed((): object => {
  return getTabClass(4)
})

const classWorld5 = computed((): object => {
  return getTabClass(5)
})

const classWorld6 = computed((): object => {
  return getTabClass(6)
})

const classWorld7 = computed((): object => {
  return getTabClass(7)
})

const classWorldEvent = computed((): object => {
  return {
    'is-battle': isWorldBattle(svdata.mstMapareaType(ApiMapAreaType.event)?.api_id ?? 0),
    'is-event': true
  }
})

const eventName = computed<string>(
  () => svdata.mstMapareaType(ApiMapAreaType.event)?.api_name ?? '????'
)
const eventAreaId = computed<number>(() => svdata.mstMapareaType(ApiMapAreaType.event)?.api_id ?? 0)

onMounted(() => {
  debug('world mounted')
  cb_map_start = ApiCallback.set([Api.REQ_MAP_START, () => onMapStart()])
})

onUnmounted(() => {
  ApiCallback.unset(cb_map_start)
})

function isWorldLocked(id: number): boolean {
  const mapinfos = svdata.mapinfos.length > 0 ? svdata.mapinfos : mapInfoStore.mapInfo.api_map_info
  return !mapinfos.some((el) => el.api_id === id)
}

const worldsLocked = computed(() => ({
  2: isWorldLocked(21),
  3: isWorldLocked(31),
  4: isWorldLocked(41),
  5: isWorldLocked(51),
  6: isWorldLocked(61),
  7: isWorldLocked(71)
}))

</script>
<template>
  <div class="world-root">
    <b-tabs
      type="is-toggle"
      size="is-small"
      expanded
      class="world-tabs"
      v-model="index"
      @update:modelValue="onChange"
    >
      <b-tab-item :headerClass="classWorld1">
        <template #header>
          <img class="world-img" title="1: 鎮守府海域" src="../assets/img/world/world1.png" />
        </template>
        <Areas v-if="index === 0" :area_id="1" :deck_index="deck_index" :single_row="true" />
      </b-tab-item>
      <b-tab-item :headerClass="classWorld2" :disabled="worldsLocked[2]">
        <template #header>
          <LockImage v-if="worldsLocked[2]" />
          <img class="world-img" title="2: 南西諸島海域" src="../assets/img/world/world2.png" />
        </template>
        <Areas v-if="index === 1" :area_id="2" :deck_index="deck_index" :single_row="true" />
      </b-tab-item>
      <b-tab-item :headerClass="classWorld3" :disabled="worldsLocked[3]">
        <template #header>
          <LockImage v-if="worldsLocked[3]" />
          <img class="world-img" title="3: 北方海域" src="../assets/img/world/world3.png" />
        </template>
        <Areas v-if="index === 2" :area_id="3" :deck_index="deck_index" :single_row="true" />
      </b-tab-item>
      <b-tab-item :headerClass="classWorld7" :disabled="worldsLocked[7]">
        <template #header>
          <LockImage v-if="worldsLocked[7]" />
          <img class="world-img" title="7: 南西海域" src="../assets/img/world/world7.png" />
        </template>
        <Areas v-if="index === 3" :area_id="7" :deck_index="deck_index" :single_row="true" />
      </b-tab-item>
      <b-tab-item :headerClass="classWorld4" :disabled="worldsLocked[4]">
        <template #header>
          <LockImage v-if="worldsLocked[4]" />
          <img class="world-img" title="4: 西方海域" src="../assets/img/world/world4.png" />
        </template>
        <Areas v-if="index === 4" :area_id="4" :deck_index="deck_index" :single_row="true" />
      </b-tab-item>
      <b-tab-item :headerClass="classWorld5" :disabled="worldsLocked[5]">
        <template #header>
          <LockImage v-if="worldsLocked[5]" />
          <img class="world-img" title="5: 南方海域" src="../assets/img/world/world5.png" />
        </template>
        <Areas v-if="index === 5" :area_id="5" :deck_index="deck_index" :single_row="true" />
      </b-tab-item>
      <b-tab-item :headerClass="classWorld6" :disabled="worldsLocked[6]">
        <template #header>
          <LockImage v-if="worldsLocked[6]" />
          <img class="world-img" title="6: 中部海域" src="../assets/img/world/world6.png" />
        </template>
        <Areas v-if="index === 6" :area_id="6" :deck_index="deck_index" :single_row="true" />
      </b-tab-item>
      <b-tab-item v-if="inEvent()" :headerClass="classWorldEvent">
        <template #header>
          <span class="world-event" :title="eventName">{{ eventName }}</span>
        </template>
        <Areas
          v-if="index === 7"
          :area_id="eventAreaId"
          :deck_index="deck_index"
          :single_row="true"
        />
      </b-tab-item>
    </b-tabs>
  </div>
</template>