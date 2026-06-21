<script setup lang="ts">
import { ApiBattleStartType, ApiCallback, MapAreaId } from '@common/kcs'
import EnemyList from '@renderer/components/EnemyList.vue'
import { EnemyInfo } from '@renderer/util'
import { replaceArray } from '@common/ts'
import { svdata } from '@renderer/store/svdata'
import { CellInfo, CommonMap } from '@common/map'
import {
  computed,
  onBeforeMount,
  onBeforeUpdate,
  onMounted,
  onUnmounted,
  onUpdated,
  ref,
  toRaw,
  watch
} from 'vue'
import { mapInfoCache } from '@renderer/common/mapinfo'

/////////////////////////////////////////////////////////////////////////////////////
// 
const DEBUG = 0;

const debug = (...args: any[]) => {
  if (DEBUG) console.debug("[CellEnemy]", ...args);
};

/////////////////////////////////////////////////////////////////////////////////////
// 
const props = withDefaults(
  defineProps<{
    area_id: number
    area_no: number
    cell_no: number
    deck_index?: number
  }>(),
  {
    deck_index: 0
  }
)

let cb_battle_start = 0
const ship_ke = ref<number[]>([])
const items_ = ref<EnemyInfo[]>([])
const index = ref(0)
const battle_index = ref(-1)
const cell_info = ref<CellInfo>({ spots: [], checks: [] })

const isCellInfoOk = computed<boolean>(() => {
  return items.value.length > 0
})

const prefixText = computed<string>(() => {
  return items_.value.length < 9 ? '構成' : ''
})

watch(
  () => [props.area_id, props.area_no],
  ([area_id, area_no]) => {
    mapInfoCache.get(area_id, area_no).then((info) => {
      cell_info.value = info
      debug(
        'cell enemy watch area_no change. cell info updated.',
        area_id,
        area_no,
        toRaw(cell_info.value)
      )
      setShipKe()
      selectBattleTab()
      updateItems()
    }).catch(() => {
      debug(
        'cell enemy watch area_no change. cell info not found.',
        area_id,
        area_no,
        toRaw(cell_info.value)
      )
    })
  },
  { immediate: true }
)

watch(
  () => svdata.inMap,
  (inMap) => {
    debug('cell enemy watch inMap change', inMap)
    if (!inMap) {
      battle_index.value = -1
    }
  },
  { immediate: true }
)

const inMap = computed<boolean>(() => svdata.inMap)

const items = computed<EnemyInfo[]>(() => {
  debug(
    'cell enemy compute items',
    'battle_index:',
    battle_index.value,
    toRaw(items_.value),
    items_.value
  )
  return items_.value
})

function updateItems() {
  battle_index.value = -1
  const spots = CommonMap.spotsFromLevel(
    cell_info.value,
    svdata.mapLevel(props.area_id, props.area_no)
  )
  const cell = spots.find((spot) => spot.no === props.cell_no)
  if (!cell) {
    replaceArray(items_.value, [])
    return
  }

  let inBattle = false
  const battle = svdata.lastBattle
  if (battle) {
    if (
      battle.map.api_maparea_id === props.area_id &&
      battle.map.api_mapinfo_no === props.area_no
    ) {
      const spot = CommonMap.findSpotForLabel(spots, battle.cell_no)
      inBattle = spot?.no === props.cell_no
    }
  }
  const sk = toRaw(ship_ke.value)
  const list = cell.enemy.map((el, i) => {
    const info: EnemyInfo = {
      area_id: props.area_id as MapAreaId,
      area_no: props.area_no,
      cell_no: props.cell_no,
      enemy: el,
      aa: cell.aa[i]
    }
    const isBattle =
      inBattle && sk.length === el.length && sk.every((enemy_id, idx) => el[idx] === enemy_id)
    if (isBattle) {
      battle_index.value = i
    }
    return info
  })
  replaceArray(items_.value, list)
  debug(
    'cell enemy update items. inBattle:',
    inBattle,
    'battle_index:',
    battle_index.value,
    'items:',
    toRaw(items_.value),
    'ke:',
    toRaw(ship_ke.value)
  )
}

function onBattleStart(arg: ApiBattleStartType) {
  debug(
    'cell enemy on battle start',
    props.area_id,
    props.area_no,
    props.cell_no,
    JSON.stringify(arg.api_ship_ke)
  )
  setShipKe()
  selectBattleTab()
  updateItems()
}

function setShipKe() {
  const battle = svdata.lastBattle
  debug('cell enemy set ship ke. battle:', toRaw(battle))

  if (battle) {
    if (
      battle.map.api_maparea_id === props.area_id &&
      battle.map.api_mapinfo_no === props.area_no
    ) {
      const spots = CommonMap.spotsFromLevel(
        cell_info.value,
        svdata.mapLevel(props.area_id, props.area_no)
      )
      const spot = CommonMap.findSpotForLabel(spots, battle.cell_no)
      if (spot?.no === props.cell_no) {
        if (battle.midday) {
          replaceArray(ship_ke.value, battle.midday.api_ship_ke)
        } else if (battle.midnight) {
          replaceArray(ship_ke.value, battle.midnight.api_ship_ke)
        }
        console.log('cell enemy set ship ke', toRaw(ship_ke.value))
        return
      }
    }
  }
}

function selectBattleTab() {
  if (!svdata.inMap) {
    return
  }
  const battle = svdata.lastBattle
  if (!battle) {
    return
  }
  if (battle.map.api_maparea_id !== props.area_id || battle.map.api_mapinfo_no !== props.area_no) {
    return
  }
  if (ship_ke.value.length === 0) {
    return
  }
  const spots = CommonMap.spotsFromLevel(
    cell_info.value,
    svdata.mapLevel(props.area_id, props.area_no)
  )
  const spot = CommonMap.findSpotForLabel(spots, battle.cell_no)
  if (spot?.no !== props.cell_no) return
  const sk = ship_ke.value
  const i = spot.enemy.findIndex((el) => {
    if (el.length !== sk.length) return false
    return sk.every((enemy_id, idx) => el[idx] === enemy_id)
  })
  if (i === -1) {
    return
  }
  index.value = i
  debug('select battle tab index:', index.value)
}

onBeforeMount(() => {
  debug('cell enemy before mount. ship ke set.', props.area_id, props.area_no, ship_ke.value)
})

onMounted(() => {
  debug('cell enemy mounted', props.area_id, props.area_no, 'deck_index:', props.deck_index)
  cb_battle_start = ApiCallback.set([
    'battle-start',
    (arg: ApiBattleStartType) => onBattleStart(arg)
  ])
  setShipKe()
  selectBattleTab()
  updateItems()
})

onUnmounted(() => {
  debug('cell enemy destroyed', props.area_id, props.area_no, props.cell_no)
  ApiCallback.unset(cb_battle_start)
})

onBeforeUpdate(() => {
  debug(
    'cell enemy before update',
    props.area_id,
    props.area_no,
    'deck_index:',
    props.deck_index,
    'battle_index:',
    battle_index.value,
    'items:',
    toRaw(items_.value),
    toRaw(ship_ke.value)
  )
})

onUpdated(() => {
  debug(
    'cell enemy updated',
    props.area_id,
    props.area_no,
    'deck_index:',
    props.deck_index,
    'battle_index:',
    battle_index.value,
    'items:',
    toRaw(items_.value),
    toRaw(ship_ke.value)
  )
})
</script>

<template>
  <div>
    <b-tabs v-if="isCellInfoOk" size="is-small" expanded class="enemy-list-tabs" v-model="index">
      <b-tab-item
        v-for="(item, item_index) in items"
        :key="item_index"
        headerClass="enemy-list-tab"
      >
        <template #header>
          <span
            :class="{
              'no-padding': item.aa > 0,
              'is-battle': inMap && item_index === battle_index
            }"
            >{{prefixText}}{{ item_index + 1 }}</span
          >
          <div class="seiku-wrapper">
            <div v-if="item.aa > 0" class="seiku">
              <span class="s-icon seiku"></span>
              <span class="txt">{{ item.aa }}</span>
            </div>
          </div>
        </template>
        <div v-if="index === item_index">
          <EnemyList :info="item" :deck_index="deck_index" />
        </div>
      </b-tab-item>
    </b-tabs>
  </div>
</template>