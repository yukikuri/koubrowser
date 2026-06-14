<script setup lang="ts">
import {
  ApiDeckPort,
  CombinedFlag,
  ApiMapInfo,
  KcsUtil,
  ApiDeckPortId,
  ApiCallback,
  ApiGaugeType,
  GaugeAreaNo,
  ApiAirBase,
  ApiDispSeiku,
  AirBaseActionKind,
  MstSlotitem,
  ApiMap,
  ApiMapNext,
  ApiMapStartReqRes,
  ApiItemGetBase,
  ApiItemId,
  ApiEventId
} from '@common/kcs'
import { Api } from '@common/kcsapi'
import { svdata } from '@renderer/store/svdata'
import { MathUtil } from '@common/math'
import { CellInfo, Spot, Check, CommonMap } from '@common/map'
import CurrentLocationImage from '@renderer/assets/img/current-location.svg'
import DoneImg from '@renderer/assets/img/done-outline.svg'
import MapImg from '@renderer/components/MapImg.vue'
import PassedCellImage from '@renderer/assets/img/passed-cell.svg'
import { AirbaseSpot, AirbaseTargetSpots, MainChannel } from '@common/channel'
import { getAirSearchResultText, MapLvText, StateText } from '@common/locale'
import AirBase from '@renderer/components/AirBase.vue'
import Line from '@renderer/components/area/Line.vue'
import { RUtil, modSpotXY } from '@renderer/util'
import { EnemyEtc } from '@common/enemy_etc'
import type { AreaItemGetInfo } from '@common/record'
import * as place from '@renderer/stuff/place'

import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { mapInfoCache } from '@renderer/common/mapinfo'

/////////////////////////////////////////////////////////////////////////////////////
// デバッグログ
const DEBUG = 0;

const debug = (...args: any[]) => {
  if (DEBUG) console.debug("[Area]", ...args);
};


type FixPosCellMap = Map<number, FixPos>; // cell no -> fix pos
type SpotXYType = Pick<Spot, 'x' | 'y' | 'label' | 'no'> | Check

const SEIKU_UNIT = 200.0
const MAP_RATIO = 0.5
const ratio = (v: number): number => {
  return v * MAP_RATIO
}
const currentPosKey = ref(0)
const lineColor = '#00ffff';

// last: deck seiku
interface AirBaseSeiku {
  name: string
  airbase: ApiAirBase
  seikuText: string
  afterAA: number
}

interface SpotAirBase {
  seikus: AirBaseSeiku[]
}

interface EShipAA {
  readonly ship: EnemyEtc
  mstSlot: (MstSlotitem | undefined)[]
  slot: number[]
  onslot: number[]
  aa: number
}

interface AreaSpot {
  spot: Spot
  seikuClass: string
  seikuStateText: string
  spotXY: string
  seikubarStyle: [string, string]
  cellClass: string
  cellXY: string
  airbase?: AirBaseSeiku[]
}

interface AreaCheck {
  check: Check
  spotXY: string
  stateText: string
  cellClass: string
  cellXY: string
}

interface PassedCell {
  cellXY: any
}

interface AirBaseInfo {
  airbase: ApiAirBase
}

const nos = ['第一', '第二', '第三'] as const

const style = ['kinkou', 'kakuho', 'yuusei', 'ressei', 'sousitu'] as const
const seikuClass = (state: ApiDispSeiku, aa: number, hasAirbase: boolean): string => {
  let ret = 'seiku '
  if (!aa) {
    ret += 'noAA '
  }
  if (hasAirbase) {
    ret += ' hasAirbase '
  }
  return ret + style[state]
}

const seikuStateText = (state: ApiDispSeiku, deck_aa: number, enemy_aa: number, spot: Spot): string => {
  const distabce = spot.distance !== undefined ? `(${spot.distance})` : ''
  if (0 === enemy_aa) {
    return StateText[ApiDispSeiku.kakuho]+distabce
  }
  return `${StateText[state]}${distabce} ${deck_aa}:${enemy_aa}`
}

const seikubarStyle = (deck_aa: number, enemy_aa: number): [string, string] => {
  const total_aa = deck_aa + enemy_aa
  return [`width: ${(deck_aa / total_aa) * 100}%`, `width: ${(enemy_aa / total_aa) * 100}%`]
}

interface AirBaseSpotInfo {
  txt: string
  spots: AirBaseSpot[]
}

interface AirBaseSpot {
  label: string
  txt: string
  disabled: boolean
}

interface AreaItemInfo extends AreaItemGetInfo {
  showAirSearchResult: boolean
  airsearchResult?: number
  cellId: number
  mapIndex: number
  itemsXY: string
  delayedDisplay: boolean
  enter: boolean
}

enum HorizontalAlign {
  Left,
  Right
}

enum VerticalAlign {
  Top,
  Middle,
  Bottom
}

const fromAlignMap: [place.Direction, HorizontalAlign, VerticalAlign][] = [
  [place.Direction.RightDown, HorizontalAlign.Right, VerticalAlign.Middle],
  [place.Direction.RightUp, HorizontalAlign.Right, VerticalAlign.Middle],
  [place.Direction.LeftDown, HorizontalAlign.Left, VerticalAlign.Middle],
  [place.Direction.LeftUp, HorizontalAlign.Left, VerticalAlign.Middle]
]

const fromToAlignMap: [place.Direction, place.Direction, HorizontalAlign, VerticalAlign][] = [
  [place.Direction.RightDown, place.Direction.RightDown, HorizontalAlign.Right, VerticalAlign.Bottom],
  [place.Direction.RightDown, place.Direction.RightUp, HorizontalAlign.Left, VerticalAlign.Top],
  [place.Direction.RightDown, place.Direction.LeftDown, HorizontalAlign.Right, VerticalAlign.Middle],
  [place.Direction.RightDown, place.Direction.LeftUp, HorizontalAlign.Right, VerticalAlign.Middle],
  [place.Direction.RightUp, place.Direction.RightDown, HorizontalAlign.Left, VerticalAlign.Bottom],
  [place.Direction.RightUp, place.Direction.RightUp, HorizontalAlign.Right, VerticalAlign.Top],
  [place.Direction.RightUp, place.Direction.LeftDown, HorizontalAlign.Right, VerticalAlign.Middle],
  [place.Direction.RightUp, place.Direction.LeftUp, HorizontalAlign.Right, VerticalAlign.Middle],
  [place.Direction.LeftDown, place.Direction.RightDown, HorizontalAlign.Left, VerticalAlign.Middle],
  [place.Direction.LeftDown, place.Direction.RightUp, HorizontalAlign.Left, VerticalAlign.Top],
  [place.Direction.LeftDown, place.Direction.LeftDown, HorizontalAlign.Right, VerticalAlign.Top],
  [place.Direction.LeftDown, place.Direction.LeftUp, HorizontalAlign.Right, VerticalAlign.Top],
  [place.Direction.LeftUp, place.Direction.RightDown, HorizontalAlign.Left, VerticalAlign.Bottom],
  [place.Direction.LeftUp, place.Direction.RightUp, HorizontalAlign.Left, VerticalAlign.Middle],
  [place.Direction.LeftUp, place.Direction.LeftDown, HorizontalAlign.Right, VerticalAlign.Bottom],
  [place.Direction.LeftUp, place.Direction.LeftUp, HorizontalAlign.Right, VerticalAlign.Top]
]

// props & emits (v-model:selected_label)
const props = defineProps<{ area_id: number; area_no: number; selected_label: string }>()
const emit = defineEmits<{ (e: 'update:selected_label', value: string): void }>()

const selected_spot_label = computed<string>({
  get: () => props.selected_label,
  set: (val) => emit('update:selected_label', val)
})

// state
const cell_info = reactive<CellInfo>({ spots: [], checks: [] })
const active_cell = ref<HTMLElement | null>(null)
const mapEl = ref<HTMLElement | null>(null)
let cb_port = 0
let cb_mapNext = 0
let cb_mapStart = 0;
const home_location_setted = ref(false)
const target_label = ref<[string, string, string]>(['-', '-', '-'])
const target_spot_loaded = ref(false)
const target_spot_invoked = ref(false)
const areaGetItems = ref<AreaItemInfo[]>([])

const area_id_no = computed(
  () => props.area_id.toString().padStart(3, '0') + '_' + props.area_no.toString().padStart(2, '0')
)

onMounted(() => {
  debug('area mounted1', area_id_no.value, 'set home', home_location_setted.value)
})

onUnmounted(() => {
  debug('area destroyed', area_id_no.value)
  ApiCallback.unset(cb_port)
  ApiCallback.unset(cb_mapStart);
  ApiCallback.unset(cb_mapNext)
})

const inArea = computed<boolean>(() => {
  if (!svdata.inMap) return false
  const map = svdata.mapStart
  return map?.api_maparea_id === props.area_id && map.api_mapinfo_no === props.area_no
})

const isEventMap = computed<boolean>(() => KcsUtil.isEventAreaId(props.area_id))
const isStarted = computed<boolean>(() => home_location_setted.value)

const airbaseDecks = computed<number>(
  () => svdata.mapinfoFrom(props.area_id, props.area_no)?.api_air_base_decks ?? 0
)

const airbases = computed<ApiAirBase[]>(() => {
  const airbaseDeckCount = airbaseDecks.value
  debug(
    'airbases for area', props.area_id, props.area_no, svdata.airbase(props.area_id),
    'airbaseDecks:', airbaseDeckCount
 )
  //return svdata.airbase(props.area_id) ?? []
  const ret = svdata.airbase(props.area_id)?.filter((el) => 
    el.api_action_kind === AirBaseActionKind.syutugeki
  )  ?? []
  return ret.slice(0, airbaseDeckCount)
})

const enemySpots = computed<AreaSpot[]>(() => {
  const spots = CommonMap.spotsFromLevel(cell_info, svdata.mapLevel(props.area_id, props.area_no))
  const filtered = spots.filter((spot) => spot.type === 'enemy' || spot.type === 'boss')
  const deckSeiku = currentSeikuu.value
  const ret = filtered.map((el) => {
    const airb = spotAirBase(el)
    let aa = el.maxAa
    let hasAirbase = false
    if (airb && airb.length) {
      aa = airb[airb.length - 1].afterAA
      hasAirbase = true
    }
    const state = KcsUtil.seikuState(deckSeiku, aa)
    return {
      spot: el,
      seikuClass: seikuClass(state, aa, hasAirbase),
      seikuStateText: seikuStateText(state, deckSeiku, aa, el),
      spotXY: spotXY(el),
      seikubarStyle: seikubarStyle(deckSeiku, aa),
      cellClass: cellClass(el.type),
      cellXY: cellXY(el, el.type),
      airbase: airb
    }
  })
  debug('enemy spots', ret)
  return ret
})

const airbaseSpots = computed<AirBaseSpotInfo[]>(() => {
  const enemy = enemySpots.value
  const bases = svdata.airbase(props.area_id)
  if (!bases) return []
  return bases.map((airbase, index) => {
    const range = airbase.api_distance.api_base + airbase.api_distance.api_bonus
    let spots: AirBaseSpot[] = [
      { label: '-', txt: 'なし', disabled: target_spot_loaded.value ? false : true } as any
    ]
    spots = spots.concat(
      enemy.map((spot) => ({
        label: spot.spot.label,
        txt: spot.spot.label + '(' + spot.spot.distance + ')',
        disabled: target_spot_loaded.value ? range < (spot.spot?.distance ?? 0) : true
      }))
    )
    return {
      txt: `${nos[index]}航空隊(半径:${range})`,
      spots
    }
  })
})

function updateCurrentPos(): void {
  if (!svdata.inMap) return
}

const passedCells = computed<PassedCell[]>(() => {
  if (!inArea.value) return []
  const ret: PassedCell[] = []
  const home_spot = homeSpot.value
  if (home_spot) ret.push({ cellXY: locationXY(home_spot) })
  const battleMap = svdata.battleMap
  for (let i = 0; i < battleMap.length - 1; ++i) {
    const map = battleMap[i]
    const cell = cell_info.spots.find((el) => el.no === map.api_no)
    if (cell) ret.push({ cellXY: locationXY(cell) })
  }
  debug('passed celld', JSON.stringify(ret))
  return ret
})

interface LineInfo {
  x1: number
  y1: number
  x2: number
  y2: number
}
const passedLines = computed<LineInfo[]>(() => {
  currentPosKey.value; // depend on key

  if (!inArea.value) return []
  const battleMap = svdata.battleMap
  if (battleMap.length <= 1) return []

  const ret: LineInfo[] = []  
  let startPos = homeSpot.value;
  let endPos;
  for (let i = 0; i < battleMap.length - 1; ++i) {
    const battleSpot = battleMap[i]
    endPos = cell_info.spots.find((el) => el.no === battleSpot.api_no)
    if (startPos && endPos) {
      const passedLine: LineInfo = {
        x1: ratio(startPos.x),
        y1: ratio(startPos.y),
        x2: ratio(endPos.x),
        y2: ratio(endPos.y)
      }
      ret.push(passedLine)
      startPos = endPos;
    }
  }
  return ret;
})
const currentLine = computed<LineInfo | undefined>(() => {
  currentPosKey.value; // depend on key

  debug('currentline called. inArea:', inArea.value, 'battleMap:', svdata.battleMap)
  const battleMap = svdata.battleMap
  if (battleMap.length <= 0) {
    debug('currentline: no battleMap')
    return undefined
  }

  const cur_cell_no = battleMap[battleMap.length-1].api_no
  const endPos = cell_info.spots.find((spot) => spot.no === cur_cell_no)
  if (! endPos) {
    debug('currentline: no endPos for cell no', cur_cell_no)    
    return undefined
  }

  let startPos;
  if (battleMap.length === 1) {
     startPos = homeSpot.value;
  } else {
    const prev_cell_no = battleMap[battleMap.length-2].api_no
    startPos = cell_info.spots.find((spot) => spot.no === prev_cell_no)
  }
  if (! startPos) {
    debug('currentline: no startPos')
    return undefined
  }
  debug('currentline: startPos:', startPos.no, 'endPos:', endPos.no, 'key:', currentPosKey.value)
  const line: LineInfo =  {
    x1: ratio(startPos.x),
    y1: ratio(startPos.y),
    x2: ratio(endPos.x),
    y2: ratio(endPos.y)
  }
  debug('currentline:', line)
  return line;
})

function locationXY(spot: Spot): object {
  let mod_y = 2
  if (spot.no > 0) mod_y = 12
  return {
    '--left': ratio(spot.x) - 12 + 'px',
    '--top': ratio(spot.y) - mod_y + 'px'
  } as any
}

const homeSpot = computed<Spot | undefined>(() => {
  const mapStart = svdata.mapStart
  if (!mapStart) return undefined
  return cell_info.spots.find((spot) => spot.no === mapStart.api_from_no)
})

const currentPosStyle = computed<any>(() => {
  currentPosKey.value; // depend on key
  
  const battleMap = svdata.battleMap
  const lastMapPos = (map_index: number): object => {
    const cur_cell_no = battleMap[map_index].api_no
    const cell = cell_info.spots.find((spot) => spot.no === cur_cell_no)
    debug(
      'area current cell',
      JSON.stringify(cell),
      'cur no:',
      cur_cell_no,
      'battleMapLen',
      battleMap.length
    )
    if (cell) return locationXY(cell)
    return {}
  }
  if (!home_location_setted.value && cell_info.spots.length) {
    setTimeout(() => {
      home_location_setted.value = true
    }, 100)
    if (svdata.battleMap.length > 1) {
      return lastMapPos(battleMap.length - 2)
    }
    const hs = homeSpot.value
    if (hs) return locationXY(hs)
    return {}
  }
  if (battleMap.length > 0) return lastMapPos(battleMap.length - 1)
  return {}
})

function onPort(): void {
  home_location_setted.value = false
  areaGetItems.value = []
}

function onMapStart(arg?: ApiMapStartReqRes): void {
  debug('area onMapStart invoked');
  currentPosKey.value += 1;
  areaGetItems.value = []
  const map = arg?.res ?? svdata.mapStart
  if (map) {
    addAreaGetItems(map, 0, false)
  }
}

function onMapNext(arg?: ApiMapNext): void {
  debug('area onMapNext invoked');
  currentPosKey.value += 1;
  const map = arg ?? svdata.lastMap
  if (map) {
    addAreaGetItems(map, svdata.battleMap.length - 1, true)
  }
  updateAreaGetItemPositions()
}

const isDataOk = computed<boolean>(() => svdata.isShipDataOk)
const spots = computed<Spot[]>(() => cell_info.spots)

const isAreaItemGetVisibleMap = computed<boolean>(() => props.area_id === 6 && props.area_no === 3)

function reloadAreaGetItems(): void {
  areaGetItems.value = []
  if (!isAreaItemGetVisibleMap.value) {
    return
  }
  svdata.battleMap.forEach((map, mapIndex) => addAreaGetItems(map, mapIndex, false))
  updateAreaGetItemPositions()
}

function addAreaGetItems(map: ApiMap, mapIndex: number, delayedDisplay: boolean): void {
  if (!isAreaItemGetVisibleMap.value) {
    return
  }
  if (map.api_maparea_id !== props.area_id || map.api_mapinfo_no !== props.area_no) {
    return
  }

  const items = getAreaItemGetInfos(map, mapIndex, delayedDisplay)
  if (items.length > 0) {
    const startIndex = areaGetItems.value.length
    areaGetItems.value = areaGetItems.value.concat(items)
    updateAreaGetItemPositions()
    if (delayedDisplay) {
      startAreaGetItemAnimation(startIndex, items.length)
    }
  }
}

function getAreaItemGetInfos(
  map: ApiMap | ApiMapNext,
  mapIndex: number,
  delayedDisplay: boolean
): AreaItemInfo[] {
  const ret: AreaItemInfo[] = []
  const appendItem = (item: ApiItemGetBase, eoRate?: number): void => {
    const itemId = KcsUtil.toItemGetId(item)
    if (!itemId.valid || itemId.id === ApiItemId.present_box) {
      return
    }

    ret.push({
      itemId: itemId.id!,
      itemCount: item.api_getcount,
      eoRate,
      showAirSearchResult: map.api_event_id === ApiEventId.airBattleOrAirSsearch,
      airsearchResult: map.api_airsearch?.api_result,
      cellId: map.api_no,
      mapIndex,
      itemsXY: areaItemBaseXY(map.api_no),
      delayedDisplay,
      enter: !delayedDisplay
    })
  }

  const eoResult = (map as ApiMapNext).api_itemget_eo_result
  if (eoResult) {
    appendItem(eoResult, (map as ApiMapNext).api_get_eo_rate)
  }

  if (map.api_itemget_eo_comment) {
    appendItem(map.api_itemget_eo_comment)
  }

  if (eoResult || map.api_itemget_eo_comment) {
    return ret
  }

  if (map.api_itemget) {
    map.api_itemget.forEach((item) => appendItem(item))
  }

  return ret
}

function getFromAlign(
  directionFrom: place.Direction
): { hor: HorizontalAlign; ver: VerticalAlign } | undefined {
  for (const [from, hor, ver] of fromAlignMap) {
    if (from === directionFrom) {
      return { hor, ver }
    }
  }
  return
}

function getFromToAlign(
  directionFrom: place.Direction,
  directionTo: place.Direction
): { hor: HorizontalAlign; ver: VerticalAlign } | undefined {
  for (const [from, to, hor, ver] of fromToAlignMap) {
    if (from === directionFrom && to === directionTo) {
      return { hor, ver }
    }
  }
  return
}

function areaItemBaseXY(cellId: number): string {
  const spot = cell_info.spots.find((el) => el.no === cellId)
  if (!spot) {
    return ''
  }
  const diff = 14
  return `--left: ${ratio(spot.x) - diff}px; --top:${ratio(spot.y) - diff}px;`
}

function spotFromMapIndex(mapIndex: number): Spot | undefined {
  const map = svdata.battleMap[mapIndex]
  if (!map) {
    return
  }
  return cell_info.spots.find((spot) => spot.no === map.api_no)
}

function directionFromMapIndex(mapIndex: number): place.Direction | null {
  const spot = spotFromMapIndex(mapIndex)
  if (!spot) {
    return null
  }

  const prevSpot = mapIndex === 0 ? homeSpot.value : spotFromMapIndex(mapIndex - 1)
  if (!prevSpot) {
    return null
  }
  return place.getDirection(prevSpot.x, prevSpot.y, spot.x, spot.y)
}

function directionToMapIndex(mapIndex: number): place.Direction | null {
  const spot = spotFromMapIndex(mapIndex)
  const nextSpot = spotFromMapIndex(mapIndex + 1)
  if (!spot || !nextSpot) {
    return null
  }
  return place.getDirection(spot.x, spot.y, nextSpot.x, nextSpot.y)
}

function areaItemXY(item: AreaItemInfo, el: HTMLElement): string {

  const spot = spotFromMapIndex(item.mapIndex)
  if (!spot) {
    return item.itemsXY || areaItemBaseXY(item.cellId)
  }

  /*
  const directionFrom = directionFromMapIndex(item.mapIndex)
  const directionTo = directionToMapIndex(item.mapIndex)
  if (directionFrom === null) {
    return areaItemBaseXY(item.cellId)
  }

  const align =
    directionTo === null ? getFromAlign(directionFrom) : getFromToAlign(directionFrom, directionTo)
  if (!align) {
    return areaItemBaseXY(item.cellId)
  }
  */

  const align: {ver: VerticalAlign } = { ver: item.cellId === 7 ? VerticalAlign.Bottom : VerticalAlign.Top }
  const diff = 14
  const elRect = el.getBoundingClientRect()
  const leftDiff = -elRect.width / 2
  let topDiff = 0
  if (align.ver === VerticalAlign.Top) {
    topDiff = diff * 1.5
  } else {
    topDiff = -(elRect.height + diff * 1.5)
  }

  return `--left: ${ratio(spot.x) + leftDiff}px; --top:${ratio(spot.y) + topDiff}px;`
}

function updateAreaGetItemPositions(): void {
  nextTick(() => {
    const container = mapEl.value
    if (!container) {
      return
    }

    areaGetItems.value.forEach((item, index) => {
      const el = container.querySelector<HTMLElement>(`#area-get-item-${index}`)
      if (el) {
        item.itemsXY = areaItemXY(item, el)
      }
    })

    nextTick(() => {
      const reports = container.querySelectorAll<HTMLElement>('.map-area-get-item')
      place.ensureWithinContainer(
        container,
        reports,
        { top: '--top', left: '--left' },
        { top: 15, bottom: 15, left: 5, right: 5 }
      )
    })
  })
}

function startAreaGetItemAnimation(startIndex: number, count: number): void {
  nextTick(() => {
    window.requestAnimationFrame(() => {
      for (let i = startIndex; i < startIndex + count; ++i) {
        const item = areaGetItems.value[i]
        if (item) {
          item.enter = true
        }
      }
    })
  })
}

function itemSrc(item: AreaItemInfo): string {
  return RUtil.itemImg(item.itemId)
}

watch(
  () => [props.area_id, props.area_no],
  () => reloadAreaGetItems()
)

function spotAirBase(spot: Spot): AirBaseSeiku[] | undefined {
  if (!hasAirbase.value) return undefined
  const bases = airbases.value
    .filter((airbase, index) => {
      if (airbase.api_action_kind !== AirBaseActionKind.syutugeki) return false
      return target_label.value[index] === spot.label
    })
    .slice(0, airbaseDecks.value)
  if (bases.length === 0) return undefined

  let enemy_aa = spot.maxAa
  debug('spotAirBase called for spot', spot.label, 'enemy aa:', enemy_aa, 'bases:', bases)
  const enemy_index = spot.aa.findIndex((el) => el === spot.maxAa)
  const enemys = RUtil.eshipInfos(spot.enemy[enemy_index], false).map<EShipAA>((eship) => {
    const mstSlot = eship.status.api_slot.map((slotitem_id, index) => {
      if (eship.status.api_onslot[index]) {
        return svdata.mstSlotitem(slotitem_id)
      }
      return
    })
    return {
      ship: eship.status,
      mstSlot,
      slot: eship.status.api_slot.slice(),
      onslot: eship.status.api_onslot.slice(),
      aa: RUtil.eshipSeiku(eship.status, mstSlot)
    }
  })

  const ret = bases.reduce<AirBaseSeiku[]>((acc, airbase) => {
    if (airbase.api_action_kind === AirBaseActionKind.syutugeki) {
      let name_added = false
      for (let i = 0; i < 2; ++i) {
        const airbase_aa = svdata.airbaseSeiku(airbase)
        const sstate = KcsUtil.seikuState(airbase_aa, enemy_aa)
        const rate_max = [0.6, 1.0, 0.8, 0.4, 0.1][sstate]
        enemys.forEach((eship) => {
          eship.onslot = eship.onslot.map((onslot) => {
            if (onslot === 0) return 0
            const rate_rand = ((Math.floor(Math.random() * 100.0) + 1) / 100.0) * rate_max
            return onslot - Math.floor(onslot * rate_rand)
          })
        })
        enemy_aa = enemys.reduce(
          (acc2, eship) =>
            acc2 + RUtil.eshipSeiku({ api_onslot: eship.onslot } as any, eship.mstSlot),
          0
        )
        acc.push({
          name: name_added ? '' : nos[airbase.api_rid - 1] + ' ',
          airbase,
          seikuText: StateText[sstate],
          afterAA: enemy_aa
        })
        name_added = true
      }
    }
    return acc
  }, [])
  return ret
}

const airsearchSpots = computed<AreaCheck[]>(() => {
  const filtered = cell_info.checks.filter((check) => check.type === 'airsearch')
  return filtered.map((el) => ({
    check: el,
    spotXY: spotXY(el),
    stateText: airsearchStateText(el),
    cellClass: cellClass(el.type),
    cellXY: cellXY(el, el.type)
  }))
})

const maplosSpots = computed<AreaCheck[]>(() => {
  const filtered = cell_info.checks.filter((check) => check.type === 'maplos')
  return filtered.map((el) => ({
    check: el,
    spotXY: spotXY(el),
    stateText: maplosStateText(el),
    cellClass: cellClass(el.type),
    cellXY: maplosXY(el)
  }))
})

function airsearchStateText(check: Check): string {
  const los = check.info.value ?? 0
  const deck = svdata.deckPort(ApiDeckPortId.deck1st)
  let deckLos = 0
  if (deck) deckLos = svdata.deckGetItemLos(deck)
  return [
    '偵察',
    los,
    MathUtil.floor((los * 16) / 10, 2),
    MathUtil.floor((los * 22) / 10, 2),
    MathUtil.floor(deckLos, 2)
  ].join('/')
}

function maplosStateText(check: Check): string {
  const deck = svdata.deckPort(ApiDeckPortId.deck1st)
  let maplos = 0
  if (deck) maplos = MathUtil.floor(svdata.deckMapLos(deck, check.info.value ?? 0), 2)
  return [`係数:${check.info.value ?? 0}`, check.info.min ?? 0, check.info.max ?? 0, maplos].join(
    ' / '
  )
}

const decks = computed<ApiDeckPort[]>(() => svdata.deckPorts)
const combinedSeiku = computed<number>(
  () => svdata.deckSeiku(decks.value[0]) + svdata.deckSeiku(decks.value[1])
)
const currentSeikuu = computed<number>(() => {
  if (svdata.isCombined) return combinedSeiku.value
  const deck = svdata.battleDeck
  if (deck) return svdata.deckSeiku(deck)
  return svdata.deckSeiku(decks.value[0])
})
const deckSeikus = computed<number[]>(() => decks.value.map((deck) => svdata.deckSeiku(deck)))

function enemySpotClick(event: MouseEvent): void {
  event.preventDefault()
  if (event.isTrusted) {
    const label = (event.target as HTMLElement).dataset.label
    if (active_cell.value) active_cell.value.classList.remove('active')
    active_cell.value = event.target as HTMLElement
    active_cell.value.classList.add('active')
    if (label) selected_spot_label.value = label
  }
}

function cellClass(type?: string): string {
  let ret = 'cellarea'
  if (type) ret += ' ' + type
  return ret
}

function cellXY(spot: Pick<Spot, 'x' | 'y'>, type?: string): string {
  const diff = type === 'boss' ? 26 : 15
  return `left: ${ratio(spot.x) - diff}px; top:${ratio(spot.y) - diff}px`
}


function spotXY(spot: SpotXYType): string {
  let x = ratio(spot.x)
  let y = ratio(spot.y)
  let label = spot.label
  if (label) {
    const mod = modSpotXY(props.area_id, props.area_no, label)
    if (mod) {
      x += mod.x
      y += mod.y
    }
  }
  return `left: ${x + 12}px; top: ${y - 15}px`
}

interface MapLosXYMod {
  [key: string]: { x: number; y: number }
}

interface FixPos {
  modX: number;
  modY: number;
}

type FixMapLosPosAreaMap = Map<number, FixPosCellMap>; // area_id * 10 + area_no -> FixPosCellMap

const fixMapLosPosAreaMap: FixMapLosPosAreaMap = new Map([
  [16, new Map([
    [7, { modX: 10, modY: -20 }],
  ])],
  [25, new Map([
    [9, { modX: -10, modY: -10 }],
    [10, { modX: 3, modY: -2 }],
  ])],
  [45, new Map([
    [11, { modX: -10, modY: -20 }],
    [17, { modX: -15, modY: 25 }],
  ])],
  [54, new Map([
    [12, { modX: -50, modY: -50 }],
    [13, { modX: 20, modY: -120 }],
  ])],
  [55, new Map([
    [15, { modX: 10, modY: -5 }],
    [16, { modX: 15, modY: -5 }],
  ])],
  [56, new Map([
    [9, { modX: -20, modY: 45 }],
    [27, { modX: 20, modY: -18 }],
    [43, { modX: -45, modY: -2 }],
  ])],
  [61, new Map([
    [6, { modX: -20, modY: -5 }],
    [8, { modX: 20, modY: -60 }],
  ])],
  [62, new Map([
    [6, { modX: -0, modY: 25 }],
    [7, { modX: 15, modY: -0 }],
    [9, { modX: -35, modY: 25 }],
  ])],
  [65, new Map([
    [7, { modX: -5, modY: 6 }],
    [10, { modX: 1, modY: -10 }],
  ])],
  [72, new Map([
    [5, { modX: -90, modY: -20 }],
    [11, { modX: 0, modY: -7 }],
  ])],
  [74, new Map([
    [10, { modX: 7, modY: -47 }],
    [13, { modX: 12, modY: -15 }],
  ])],
  [75, new Map([
    [9, { modX: -70, modY: 15 }],
    [24, { modX: -40, modY: -33 }],
  ])],
])

const getFixMapLosPos = (area_id: number, area_no: number, cell_no: number): FixPos | undefined => {
  const areaKey = area_id * 10 + area_no
  const cellMap = fixMapLosPosAreaMap.get(areaKey)
  if (cellMap) {
    return cellMap.get(cell_no)
  }
  return
}


function maplosXY(check: Check): string {
  debug('maplosXY', check)
  let diffX = 0;
  let diffY = 0;
  const fixPos = getFixMapLosPos(props.area_id, props.area_no, check.no)
  if (fixPos) {
    diffX = fixPos.modX;
    diffY = fixPos.modY;
  }


  let x = ratio(check.x)+diffX
  let y = ratio(check.y)+diffY
  return `left: ${x}px; top: ${y}px`
}

function seikubarText(spot: Spot): string {
  return `${currentSeikuu.value}/${spot.maxAa}`
}

function seikuText(spot: Spot): string {
  if (!spot.maxAa) return 'なし'
  return spot.maxAa.toString()
}

function seikuStyle(spot: Spot): string {
  const style: string[] = []
  if (!spot.maxAa) {
    style.push('display: none')
  } else {
    const per = (Math.floor(((spot.maxAa * 100) / SEIKU_UNIT) * 100) / 100).toString()
    style.push(`width: ${per}%`)
  }
  return style.join(';')
}

const seikuStyleDeck = computed<string>(() => {
  const style: string[] = []
  const seiku = currentSeikuu.value
  if (!seiku) {
    style.push('display: none')
  } else {
    const per = (Math.floor(((seiku * 100) / SEIKU_UNIT) * 100) / 100).toString()
    style.push('width:' + per + '%')
  }
  return style.join(';')
})

const isCombined = computed<boolean>(() => svdata.isCombined)
const combinedFlag = computed<CombinedFlag>(() => svdata.combinedFlag)

const hasAirbase = computed<boolean>(() => {
  const ret = svdata.hasAirbase(props.area_id, props.area_no)
  debug(
    'hasAirbase:',
    props.area_id,
    props.area_no,
    ret,
    'spot loaded:',
    target_spot_loaded.value,
    target_spot_invoked.value
  )
  if (ret && !target_spot_loaded.value) {
    if (!target_spot_invoked.value) {
      target_spot_invoked.value = true
      window.api.getAirbaseSpots(props.area_id, props.area_no).then((spots: AirbaseTargetSpots) => {
        debug(MainChannel.get_airbase_spots, area_id_no.value, spots)
        target_label.value = [spots[0][0], spots[1][0], spots[2][0]] as [string, string, string]
        target_spot_loaded.value = true
      }).catch(() => {
        //target_spot_loaded.value = true
        debug(
          MainChannel.get_airbase_spots,
          area_id_no.value,
          'failed to get airbase spots'
        )
      })
    }
  }
  return ret
})

const mapinfo = computed<ApiMapInfo | undefined>(() =>
  svdata.mapinfoFrom(props.area_id, props.area_no)
)

const hasGauge = computed<boolean>(() => {
  if (isEventMap.value) return true
  if (mapinfo.value) return typeof mapinfo.value.api_cleared === 'number'
  return GaugeAreaNo[props.area_id].includes(props.area_no)
})

const isCleared = computed<boolean>(() => {
  const mi = mapinfo.value
  if (!mi) return false
  if (!mi.api_defeat_count && !mi.api_required_defeat_count && mi.api_cleared) return true
  if (mi.api_gauge_type === ApiGaugeType.event) {
    const eventmap = mi.api_eventmap
    if (eventmap) return 0 === eventmap.api_now_maphp
  }
  return false
})

const mepGaugeText = computed<string>(() => {
  const mi = mapinfo.value
  if (!mi) return 'ゲージ情報が未取得です。出撃画面を開いてください。'
  if (mi.api_gauge_type === ApiGaugeType.event || mi.api_gauge_type === ApiGaugeType.yusou) {
    const eventmap = mi.api_eventmap
    if (eventmap) {
      const remainingLimit = mi.api_gauge_type === ApiGaugeType.event ? 1000 : 250
      let rank = '';
      if (MapLvText[eventmap.api_selected_rank]) {
        rank = MapLvText[eventmap.api_selected_rank] + ' ';
      }
      if (0 === eventmap.api_now_maphp || mi.api_cleared) return 'クリア ' + rank
      const gauge_name = mi.api_gauge_type === ApiGaugeType.event ? '戦力' : '輸送'
      const remainingValue = eventmap.api_max_maphp - eventmap.api_now_maphp
      const remainingValueText = remainingValue < remainingLimit ? ` 残: ${remainingValue} ` : ''
      return `${rank}${gauge_name}: ${eventmap.api_now_maphp}/${eventmap.api_max_maphp}${remainingValueText}`
    } else {
      // 5-6-1
      if (mi.api_gauge_type === ApiGaugeType.yusou && 
        (typeof mi.api_defeat_count === 'number' && typeof mi.api_required_defeat_count === 'number')) {
        const remainingLimit = 100
        const gauge_name = '輸送'
        const remainingValue = mi.api_required_defeat_count - mi.api_defeat_count
        const remainingValueText = remainingValue < remainingLimit ? ` 残: ${remainingValue} ` : ''
        return `${gauge_name}: ${mi.api_defeat_count}/${mi.api_required_defeat_count}${remainingValueText}`
      } else {
        return '';
      }
    }
  }
  if (!mi.api_defeat_count && !mi.api_required_defeat_count && mi.api_cleared) return 'クリア'
  if (mi.api_gauge_type === ApiGaugeType.counter)
    return `${mi.api_defeat_count}/${mi.api_required_defeat_count} クリア`
  return '未クリア'
})

const mapAirBaseStyle = computed<string>(() => {
  if (props.area_id === 7 && props.area_no === 4) {
    return `--left: 10px; --top: 170px;`
  }
  return ''
})

const isShowDebugCellInfo = computed<boolean>(() => {
  return false;
  //return Env.isDevelopment
})

function onChangeAirbaseSpot(value: boolean): void {
  debug('onChangeAirbaseSpot', value, target_label.value)
  const arg: AirbaseSpot = {
    area_id: props.area_id,
    area_no: props.area_no,
    spots: [
      [target_label.value[0], target_label.value[0]],
      [target_label.value[1], target_label.value[1]],
      [target_label.value[2], target_label.value[2]]
    ]
  } as any
  window.api.setAirbaseSpots(arg)
}

// ----------------------------------------------------------------------------------
// initialize
(() => {
  mapInfoCache.get(props.area_id, props.area_no)
    .then((info) => {
      debug('cell info async returned', info)
      Object.assign(cell_info, info)
      currentPosKey.value += 1;
      reloadAreaGetItems()
    })
    .catch((err) => debug(err))
  cb_port = ApiCallback.set([Api.PORT_PORT, () => onPort()])
  cb_mapStart = ApiCallback.set([Api.REQ_MAP_START, (arg: ApiMapStartReqRes) => onMapStart(arg)])
  cb_mapNext = ApiCallback.set([Api.REQ_MAP_NEXT, (arg: ApiMapNext) => onMapNext(arg)])
  reloadAreaGetItems()
})();

</script>

<template>
  <div v-if="isDataOk">
    <div class="map" ref="mapEl">
      <MapImg :area_id="area_id" :area_no="area_no" />
      <div v-for="(spot, index) in enemySpots" :key="index">
        <div :class="spot.seikuClass" :style="spot.spotXY">
          <div v-if="spot.airbase !== undefined" class="spot-airbases">
            <div v-for="(result, index) in spot.airbase" :key="index" class="spot-airbase">
              {{ result.name }}{{ result.seikuText }}: {{ result.afterAA }}
            </div>
          </div>
          <span class="state">{{ spot.seikuStateText }}</span>
          <span v-if="spot.spot.maxAa > 0" class="seikubar">
            <span :style="spot.seikubarStyle[0]" class="seikubar-s"></span>
            <span :style="spot.seikubarStyle[1]" class="seikubar-e"></span>
          </span>
        </div>
      </div>
      <div v-for="(spot, index) in airsearchSpots" :key="`airspot${index}`">
        <div class="airsearch" :style="spot.spotXY">
          <span class="state">{{ spot.stateText }}</span>
        </div>
      </div>
      <div v-for="(spot, index) in maplosSpots" :key="`maplosspot${index}`">
        <div :style="spot.cellXY" class="maplos">
          <span class="state">{{ spot.stateText }}</span>
        </div>
      </div>
      <a
        v-for="(spot, index) in enemySpots"
        :key="`enemy${index}`"
        :class="spot.cellClass"
        :style="spot.cellXY"
        href="#"
        :data-label="spot.spot.label"
        @click="enemySpotClick"
      ></a>
      <!--
      <a v-for="(spot, index) in airsearchSpots" :key="index"
        :class="spot.cellClass"
        :style="spot.cellXY"
        href="#" 
        :title="spot.no"
        :data-no="spot.no"
        ></a>
      -->
      <div v-if="hasGauge" class="map-gauge"><DoneImg v-if="isCleared" /> {{ mepGaugeText }}</div>
      <!-- item取得結果 -->
      <div
        v-for="(item, itemIndex) in areaGetItems"
        v-show="isAreaItemGetVisibleMap"
        :id="`area-get-item-${itemIndex}`"
        :key="`area-get-item-${itemIndex}`"
        class="map-area-get-item"
        :class="{ ready: item.delayedDisplay, enter: item.enter }"
        :style="item.itemsXY"
      >
        <div
          v-if="item.showAirSearchResult"
          class="air-search-result"
          :class="{
            'is-failed': item.airsearchResult === 0,
            'is-success': item.airsearchResult === 1,
            'is-great-success': item.airsearchResult === 2
          }"
        >
          {{ getAirSearchResultText(item.airsearchResult ?? -1) }}
        </div>
        <div class="item-info">
          <img class="item-img" :src="itemSrc(item)" />
          <span class="count">+{{ item.itemCount }}</span>
        </div>
      </div>
      <div v-if="hasAirbase" class="map-airbase" :style="mapAirBaseStyle">
        <div class="map-airbase-decks">出撃可能 x {{ airbaseDecks }} 飛行隊</div>
        <AirBase
          v-for="(airbase, index) in airbases"
          :key="`airbase${index}`"
          :airbase="airbase"
          :index="index"
          :target_label="target_label[index]"
        />
      </div>
      <!-- todo 基地航空隊のマップ表示がに見くいため要見直し -->
     <!--
      <div v-if="hasAirbase" class="map-airbase-spots">
        <b-field v-for="(info, airbase_index) in airbaseSpots" :key="airbase_index">
          <span class="map-airbase-spots-name">{{ info.txt }}</span>
          <b-radio-button
            v-for="(spot, spot_index) in info.spots"
            :key="spot_index"
            :native-value="spot.label"
            :disabled="spot.disabled"
            @input="onChangeAirbaseSpot"
            v-model="target_label[airbase_index]"
          >
            {{ spot.txt }}
          </b-radio-button>
        </b-field>
      </div>
      -->
      <div
        v-for="(passed, index) in passedCells"
        class="current-cell is-passed"
        :style="passed.cellXY"
        :key="`passed${index}`"
      >
        <PassedCellImage />
      </div>
      <Line v-for="(line, index) in passedLines" 
        :key="`passedLine${index}`"        
        :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2" :is-animate="false"
        :color="lineColor" :dashed="false"
      />
      <div
        v-if="inArea"
        class="current-cell active"
        :class="{ 'is-started': isStarted }"
        :style="currentPosStyle"
      >
        <CurrentLocationImage />
      </div>
      <Line v-if="inArea && currentLine" 
        :key="`$currentLine${currentPosKey}`"
        :x1="currentLine.x1" :y1="currentLine.y1" :x2="currentLine.x2" :y2="currentLine.y2" :is-animate="true"
        :color="lineColor" :dashed="false"
      />
      <div v-if="isShowDebugCellInfo" class="debug-info">
        <span>cell count:{{ spots.length }}</span>
        <div>
          <div class="deckport" v-for="(seiku, index) in deckSeikus" :key="`seiku${index}`">
            <div>{{ index }}:{{ seiku }}</div>
          </div>
          <div v-if="isCombined">
            <div>連合艦隊:{{ combinedFlag }}</div>
            <div>連合艦隊制空値:{{ combinedSeiku }}</div>
          </div>
          <div v-if="mapinfo && mapinfo.api_air_base_decks">
            <div>airbase有: {{ mapinfo.api_air_base_decks }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
