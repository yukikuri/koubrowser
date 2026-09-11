<script setup lang="ts">
import { svdata } from '@renderer/store/svdata'
import { ApiCallback } from '@common/kcs'
import { Api } from '@common/kcsapi'
import CellEnemy from '@renderer/components/CellEnemy.vue'
import { Spot, CellInfo, CommonMap } from '@common/map'
import { computed, onBeforeMount, onMounted, onUnmounted, ref, watch } from 'vue'
import { replaceArray } from '@common/ts'
import { mapInfoCache } from '@renderer/common/mapinfo'

const DEBUG = 0;

const debug = (...args: unknown[]): void => {
  if (DEBUG) console.debug("[CellEnemies]", ...args);
};

interface EnemyTabItem {
  label: string
  maxAA: number
  no: number
}

const props = withDefaults(
  defineProps<{
    areaId: number
    areaNo: number
    selectedLabel: string
    deckIndex?: number
    singleRow?: boolean
  }>(),
  {
    deckIndex: 0,
    singleRow: false
  }
)

let cb_map_start = 0
let cb_map_next = 0
const index = ref(0)
const items_ = ref<EnemyTabItem[]>([])
const cell_info = ref<CellInfo>({ spots: [], checks: [] })

const isCellInfoOk = computed<boolean>(() => {
  return items.value.length > 0
})

watch(
  () => [props.areaId, props.areaNo],
  ([area_id, area_no]) => {
     mapInfoCache.get(area_id, area_no).then((info) => {
       cell_info.value = info
       debug(
         'cell enemy watch area no change. cell info updated.',
         area_id,
         area_no,
         cell_info.value
       )
       selectBattleTab()
    }).catch((e) => {
      cell_info.value = { spots: [], checks: [] }
      debug(
        'cell enemy watch area no change. cell info not found.',
        area_id,
        area_no,
        e,
        cell_info.value
      )
      selectBattleTab()
    });

  },
  { immediate: true }
)

const spots = computed<Spot[]>(() => {
  const s = CommonMap.spotsFromLevel(
    cell_info.value, svdata.mapLevel(props.areaId, props.areaNo))
  const cells = s.filter((spot) => spot.type === 'enemy' || spot.type === 'boss')
  cells.sort((a, b) => {
    try {
      return a.label.localeCompare(b.label)
    } catch (e) {
      debug('cell enemies spots sort error', a, b, e)
      return 0
    }
  })
  return cells
})

const isSingleRow = computed<boolean>(() => props.singleRow)

const battleTabIndex = computed<number>(() => {
  if (!svdata.inMap) {
    return -1
  }
  const maps = svdata.battleMap
  if (maps.length === 0) {
    return -1
  }
  const map = maps[maps.length - 1]
  if (map.api_maparea_id !== props.areaId) {
    return -1
  }
  if (map.api_mapinfo_no !== props.areaNo) {
    return -1
  }
  const spot = CommonMap.findSpotForLabel(cell_info.value.spots, map.api_no)
  if (!spot?.label) {
    return -1
  }
  return spots.value.findIndex((el) => el.label === spot.label)
})

const items = computed<EnemyTabItem[]>(() => {
  debug('cell enemies items computed >>', props.areaId, props.areaNo, items_.value)
  return items_.value
})

function updateItems(): void {
  const s = spots.value
  const showAA = isSingleRow.value ? s.length <= 16 : true
  const items = s.map((el, _i) => ({
    label: el.label ?? '?',
    maxAA: showAA ? (el.maxAa ?? 0) : 0,
    no: el.no
  }))
  replaceArray(items_.value, items)
}

function selectBattleTab(): void {
  const i = battleTabIndex.value
  if (i !== -1) {
    index.value = i
  }
  updateItems()
}

function onMapStart(): void {
  selectBattleTab()
}

function onMapNext(): void {
  selectBattleTab()
}

debug('cell enemies setup >>', props.areaId, props.areaNo)

onBeforeMount(() => {
  debug('cell enemies before mount', props.areaId, props.areaNo)
})

onMounted(() => {
  debug('cell enemies mounted', props.areaId, props.areaNo)
  cb_map_start = ApiCallback.set([Api.REQ_MAP_START, () => onMapStart()])
  cb_map_next = ApiCallback.set([Api.REQ_MAP_NEXT, () => onMapNext()])
  selectBattleTab()
})

onUnmounted(() => {
  debug('cell enemies destroyed', props.areaId, props.areaNo)
  ApiCallback.unset(cb_map_start)
  ApiCallback.unset(cb_map_next)
})

watch(
  () => props.areaNo,
  () => {
    debug(
      'cell enemies on area no changed',
      props.areaId,
      props.areaNo,
      'index:',
      index.value
    )
    index.value = 0 // reset index
    selectBattleTab()
  }
)

watch(
  () => props.selectedLabel,
  () => {
    debug(
      'cell enemies selected_label changed',
      props.areaId,
      props.areaNo,
      props.selectedLabel,
      'deck_index:',
      props.deckIndex
    )
    const i = spots.value.findIndex((el) => el.label === props.selectedLabel)
    if (i >= 0) {
      index.value = i
    }
  }
)
</script>

<template>
  <div class="cell-enemies">
    <b-tabs 
      v-if="isCellInfoOk" 
      v-model="index"
      size="is-small" expanded class="cell-enemy-tabs">
      <b-tab-item
        v-for="(item, item_index) in items"
        :key="item_index"
        header-class="cell-enemy-tab"
      >
        <template #header>
          <span
            :class="{
              'cell-enemy-tab-item': true,
              'no-padding': item.maxAA > 0,
              'is-battle': item_index === battleTabIndex
            }"
            >{{ item.label }}</span
          >
          <div class="seiku-wrapper">
            <div v-if="item.maxAA > 0" class="seiku">
              <span class="s-icon seiku"></span>
              <div class="txt">{{ item.maxAA }}</div>
            </div>
          </div>
        </template>
        <div v-if="index === item_index">
          <CellEnemy
            :area-id="areaId"
            :area-no="areaNo"
            :cell-no="item.no"
            :deck-index="deckIndex"
          />
        </div>
      </b-tab-item>
    </b-tabs>
  </div>
</template>