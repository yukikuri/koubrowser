<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, computed, watch, toRaw, Ref } from 'vue'
import { Const } from '@common/const'
import { DispSeikuText, getFormationText, TacticsText } from '@common/locale'
import { Env } from '@common/env'
import { replaceArray } from '@common/ts'
import { gameSetting } from '@renderer/store/gamesetting'
import MapInOutImage from '@assets/img/titlebar/map-in-out.svg'
import TimelineImage from '@assets/img/titlebar/timeline.svg'
import ShowAssistImage from '@assets/img/titlebar/show-assist.svg'
import RecImage from '@assets/img/titlebar/rec.svg'
import RefreshAssistImage from '@assets/img/titlebar/refresh-assist.svg'
import OpenCaptureFolderImage from '@assets/img/titlebar/open-capture-folder.svg'
import CaptureImage from '@assets/img/titlebar/capture.svg'
import ReloadImage from '@assets/img/titlebar/reload.svg'
import DevToolImage from '@assets/img/titlebar/devtool.svg'
import GameDevToolImage from '@assets/img/titlebar/game-devtool.svg'
import OpenAssistImage from '@assets/img/titlebar/open-assist.svg'
import TopMostImage from '@assets/img/titlebar/topmost.svg'
import SoundOnImage from '@assets/img/titlebar/sound-on.svg'
import SoundOffImage from '@assets/img/titlebar/sound-off.svg'
import { gameState } from '@renderer/store/gamestate'
import { svdata } from '@renderer/store/svdata'
import {
  ApiBattleNormal,
  ApiBattleStartType,
  ApiCallback,
  ApiDeckPortId,
  ApiDispSeiku,
  ApiFormation,
  ApiTactics,
  KcsUtil,
  ApiEventId,
  ShipHpState,
  ApiMissionId,
  AirBaseActionKind,
  ApiItemId
} from '@common/kcs'
import { Api } from '@common/kcsapi'
import * as kcs_stuff from '@renderer/stuff/kcs_stuff'
import { DbName, PortRecord, PortRecordQueryProjection, toRecordDate } from '@common/record'
import { EnvRenderer } from '@renderer/common/env-renderer'
import { hasStartupUpdateAvailable, startupUpdateVersion } from '@renderer/stuff/update'
import { AssistUIState } from '@renderer/store/ui_state'

/////////////////////////////////////////////////////////////////////////////////////
// デバッグログ
const DEBUG = false;

const debug = (...args: any[]) => {
  if (DEBUG) console.debug("[TitleBar]", ...args);
};

/////////////////////////////////////////////////////////////////////////////////////
// battle score
const todayBattleScore = ref(0);
const todayExpFetched = ref<boolean>(false);
const todayStartExp = ref(0);
let todayBattleScoreAnimTimer: ReturnType<typeof setTimeout> | null = null
const SCORE_DIAL_REEL_LENGTH = 2000
const scoreDialReel = Array.from({ length: SCORE_DIAL_REEL_LENGTH }, (_v, i) => i % 10)
const todayBattleScoreDialDigits = ref<number[]>([])
const todayBattleScoreDialOffsets = ref<number[]>([])

/////////////////////////////////////////////////////////////////////////////////////
// 
const titlebarEl = ref<HTMLElement | null>(null)

const props = defineProps<{
  timeline_pressed: boolean
}>()

let cb_port: number = 0
let cb_map_start = 0
let cb_map_next: number = 0
let cb_battle_start = 0
const taiha_singeki = ref(false)
const mapcell_labels = reactive<string[]>([])
const disp_seiku = ref<ApiDispSeiku | null>(null)
const deck_formation = ref<ApiFormation | null>(null)
const enemy_formation = ref<ApiFormation | null>(null)
const tactics = ref<ApiTactics | null>(null)

const title = computed((): string => {
  if (taiha_singeki.value) {
    return '！大破進撃です！'
  }

  if (gameSetting.assistInGame) {
    return '甲ブラウザ'
  }
  // 画面サイズにより表示しきれないことから空表示
  return ''
})

const isDevelopment = computed((): boolean => {
  return Env.isDevelopment
})

const inAssistMain = computed((): boolean => {
  return gameSetting.assistInGame
})

const kouNum = computed((): string => {
  const medals = svdata.basic.api_medals
  return medals ? medals.toString() : ''
})

const isMaterialOk = computed((): boolean => {
  return svdata.isShipDataOk
})

const fual = computed((): number => {
  return svdata.fual
})

const bull = computed((): number => {
  return svdata.bull
})

const steel = computed((): number => {
  return svdata.steel
})

const buxite = computed((): number => {
  return svdata.buxite
})

const fastRepair = computed((): number => {
  const ret = svdata.fastRepair
  return ret > 3000 ? 3000 : ret
})

const buildKit = computed((): number => {
  const ret = svdata.buildKit
  return ret > 3000 ? 3000 : ret
})

const fastBuild = computed((): number => {
  return svdata.fastBuild
})

const remodelKit = computed((): number => {
  return svdata.remodelKit
})

const ship_count = computed((): number => {
  return svdata.ships.length
})

const shipCountClass = computed((): object => {
  return {
    'ship-count-over': svdata.basic.api_max_chara - 5 <= svdata.ship.length
  }
})

const slotitemCount = computed((): number => {
  return svdata.slotitemCountForTitle
})

const slotitemCountClass = computed((): object => {
  const slotitem_count = svdata.slotitemCountForTitle
  const max_count = svdata.basic.api_max_slotitem + 3
  const over1 = max_count - 20 < slotitem_count
  const over2 = max_count - 3 <= slotitem_count

  return {
    'slotitem-count-over1': over1 && !over2,
    'slotitem-count-over2': over2
  }
})

const isKouMax = computed((): boolean => {
  return svdata.basic.api_medals === Const.MaxMedals
})

const iconContainerStyle = computed(() => {
  const medals = svdata.basic.api_medals
  let v = medals ? medals.toString() : ''
  const width = [34, 34, 36][v.length] ?? 34
  return {
    '--width': `${width}px`
  }
})

const inMap = (): boolean => {
  return svdata.inMap
}

const mapAreaText = computed((): string => {
  const mapinfo = svdata.mstBattleMapInfo
  if (!mapinfo) {
    return '出撃情報がありません'
  }

  const s1 = svdata.inMap ? '出撃中' : '出撃帰'
  return `${s1}: ${mapinfo.api_maparea_id > 10 ? 'E' : mapinfo.api_maparea_id}-${mapinfo.api_no} ${mapinfo.api_name}`
})

const mapCellText = computed((): string => {
  return mapcell_labels.join('-')
})

const formationText = computed((): string => {
  if (!deck_formation.value || !enemy_formation.value) {
    return ''
  }

  const deck_txt = getFormationText(deck_formation.value, '?')
  const enemy_txt = getFormationText(enemy_formation.value, '?')
  return deck_txt + '-' + enemy_txt
})

const dispSeikuText = computed((): string => {
  debug('dispSeikuText', disp_seiku.value)
  if (disp_seiku.value !== null) {
    return DispSeikuText[disp_seiku.value] ?? ''
  }
  return ''
})

const tacticsText = computed((): string => {
  debug('tacticsText', tactics.value)
  if (tactics.value !== null) {
    return TacticsText[tactics.value] ?? ''
  }
  return ''
})

let onTimelineHandler: ((_event: Event) => void) | null = null

function styleWidthHolder() {
  const width = ref(0);
  const getStyle = computed(() => `--width: ${width.value}px`);
  return { width, getStyle };
}

const { width: updateAvailableContentWidth, getStyle: updateAvailableContentStyle } = styleWidthHolder();
const { width: gimmickClearWidth, getStyle: gimmickClearStyle } = styleWidthHolder();
const { width: notSupplyWidth, getStyle: notSupplyStyle } = styleWidthHolder();
const { width: notSupplyDeck1Width, getStyle: notSupplyDeck1Style } = styleWidthHolder();
const { width: notSupplyDeck2Width, getStyle: notSupplyDeck2Style } = styleWidthHolder();
const { width: notSupplyDeck3Width, getStyle: notSupplyDeck3Style } = styleWidthHolder();
const { width: notSupplyDeck4Width, getStyle: notSupplyDeck4Style } = styleWidthHolder();
const { width: notSupplyAirBaseWidth, getStyle: notSupplyAirBaseStyle } = styleWidthHolder();
const { width: waySupportWidth, getStyle: waySupportStyle } = styleWidthHolder();
const { width: bossSupportWidth, getStyle: bossSupportStyle } = styleWidthHolder();

const setSlideEffectElementSize = (selector: string, holder: Ref<number>) => {
  if(titlebarEl.value) {
    const el = titlebarEl.value.querySelector(selector) as HTMLElement;
    if (el) {
      //const style = getComputedStyle(el)
      // debug(selector, {
      //   className: el.className,
      //   inlineStyle: el.getAttribute('style'),
      //   display: style.display,
      //   position: style.position,
      //   width: style.width,
      //   height: style.height,
      //   rect: el.getBoundingClientRect()
      // })

      const rect = el.getBoundingClientRect();
      holder.value = rect.width;
      //debug(`${selector} set to`, holder.value, rect);
      el.classList.remove('for-calc-size');
    }
  }
}

onMounted(() => {
  debug('titlebar mounted', taiha_singeki.value)
  setTimelineClickEvent(true)

  //
  cb_port = ApiCallback.set([Api.PORT_PORT, () => onPort()])
  cb_map_start = ApiCallback.set([Api.REQ_MAP_START, () => onMapStart()])
  cb_map_next = ApiCallback.set([Api.REQ_MAP_NEXT, () => onMapNext()])
  cb_battle_start = ApiCallback.set([
    'battle-start',
    (arg: ApiBattleStartType) => onApiBattleStart(arg)
  ])

  // initialize slide effect parameter
  setSlideEffectElementSize('.update-available-content', updateAvailableContentWidth);
  setSlideEffectElementSize('.gimmick-clear-content', gimmickClearWidth);
  setSlideEffectElementSize('.not-supply-content', notSupplyWidth);
  setSlideEffectElementSize('.not-supply-deck1', notSupplyDeck1Width);
  setSlideEffectElementSize('.not-supply-deck2', notSupplyDeck2Width);
  setSlideEffectElementSize('.not-supply-deck3', notSupplyDeck3Width);
  setSlideEffectElementSize('.not-supply-deck4', notSupplyDeck4Width);
  setSlideEffectElementSize('.not-supply-airbase-content', notSupplyAirBaseWidth);
  setSlideEffectElementSize('.way-support-content', waySupportWidth);
  setSlideEffectElementSize('.boss-support-content', bossSupportWidth);
})

function onPort(): void {
  taiha_singeki.value = false
  disp_seiku.value = null
  deck_formation.value = null
  enemy_formation.value = null
  tactics.value = null

  if (todayExpFetched.value) {
    updateTodayBattleScore()
  } else {
    fetchTodayExp()    
  }
}

function onMapStart(): void {
  replaceArray(mapcell_labels, [])
  taiha_singeki.value = checkTaihaSingeki()
  mapPushCell()
}

function onMapNext(): void {
  taiha_singeki.value = checkTaihaSingeki()
  disp_seiku.value = null
  deck_formation.value = null
  enemy_formation.value = null
  tactics.value = null
  mapPushCell()
}

function onApiBattleStart(arg: ApiBattleStartType): void {
  deck_formation.value = arg.api_formation[0]
  enemy_formation.value = arg.api_formation[1]
  tactics.value = arg.api_formation[2]
  if (KcsUtil.isBattleNormal(arg)) {
    disp_seiku.value = (arg as ApiBattleNormal).api_kouku.api_stage1.api_disp_seiku
  } else {
    disp_seiku.value = null
  }
}

function mapPushCell(): void {
  const mapinfo = svdata.mstBattleMapInfo
  if (mapinfo) {
    const api_map = svdata.lastMap
    if (api_map) {
      // set battle result
      const battle_result = svdata.lastBattle
      if (battle_result && mapcell_labels.length > 0) {
        const last_index = mapcell_labels.length - 1
        const txt = mapcell_labels[last_index]
        mapcell_labels[last_index] = txt + '(' + (battle_result.result?.api_win_rank ?? '?') + ')'
      }

      // set map label
      if (ApiEventId.eoMaterialGet === api_map.api_event_id) {
        mapcell_labels.push('Goal')
      } else {
        window.api.findSpotForLabel(toRaw(mapinfo), toRaw(api_map), (spot) => {
          mapcell_labels.push(spot?.label ?? '?')
        })
      }
    }
  }
}

function setTimelineClickEvent(set: boolean): void {
  const setted = onTimelineHandler !== null
  if (setted !== set) {
    const btn = titlebarEl.value!.querySelector('.timeline-button')! as HTMLElement
    if (set) {
      onTimelineHandler = onTimeline
      btn.addEventListener('click', onTimelineHandler!)
    } else {
      btn.removeEventListener('click', onTimelineHandler!)
      onTimelineHandler = null
    }
  }
}

watch(
  () => props.timeline_pressed,
  (newVal: boolean) => {
    // prevent show timeline tip
    debug(
      'timeline pressed changed. new value:',
      newVal,
      'TimelineHandler:',
      !!onTimelineHandler
    )
    if (!newVal) {
      window.setTimeout(() => setTimelineClickEvent(true), 200)
    }
  }
)

const emit = defineEmits<{
  (e: 'timeline'): void
  (e: 'rec'): void
  (e: 'recStop'): void
  (e: 'screenshot'): void
  (e: 'gameDevtool'): void
  (e: 'mute'): void
}>()

function onTimeline(event: Event): void {
  debug('on timeline timeline_pressed', props.timeline_pressed, event)
  setTimelineClickEvent(false)
  event.stopPropagation()
  emit('timeline')
}

const isDragable = (): boolean => {
  //debug('isDragable', this.timeline_pressed);
  return !props.timeline_pressed
}

const isAssistShown = computed((): boolean => {
  return gameSetting.assistInGame
})

const isAssistOk = computed((): boolean => {
  return gameSetting.assist_ok
})

const onAssist = (): void => {
  if (!gameSetting.assist_ok) {
    return
  }
  if (gameSetting.assistInGame) {
    window.api.hideAssist()
  } else {
    window.api.showAssist()
  }
}

const isRecording = computed((): boolean => {
  if (gameState.record_ready === 'not_initialized') {
    return false
  }
  if (gameState.record_ready === 'in_initialize') {
    return true
  }

  let ret = false
  if (gameState.record_ready === 'initialized') {
    ret = gameState.recording_state === 'recording'
  }
  debug('isRecording', ret)
  return ret
})

const onRec = (): void => {
  if (isRecording.value) {
    emit('recStop')
  } else {
    emit('rec')
  }
}

const onRefreshAssist = (): void => {
  window.api.refreshAssist()
}

const onOpenCaptureFolder = (): void => {
  window.api.openCaptureFolder()
}

const onScreenshot = (): void => {
  emit('screenshot')
}

const onReload = (): void => {
  window.api.reload()
}

const onDevTool = (): void => {
  window.api.devtool()
}

const onGameDevTool = (): void => {
  emit('gameDevtool')
}

const isMute = computed((): boolean => {
  //debug('is mute:', gameState.muted)
  return gameState.muted
})

const muteTitle = computed((): string => {
  return gameState.muted ? 'サウンドはオフ状態' : 'サウンドはオン状態'
})

const onOpenAssist = (): void => {
  window.api.openAssist()
}

const updateAvailableTitle = computed((): string => {
  const version = startupUpdateVersion.value
  return version ? `更新があります。バージョン ${version} が利用可能です。` : '更新があります。'
})

const onUpdateAvailableClick = (event: MouseEvent): void => {
  event.stopPropagation()
  if (gameSetting.assist_ok && !gameSetting.assistInGame) {
    window.api.showAssist()
  }
  AssistUIState.requestTab('about')
}

const onTopMost = (): void => {
  window.api.topmost()
}

const isTopMost = computed((): boolean => {
  //debug('titlebar is topmost', gameSetting.topmost)
  return gameSetting.topmost
})

const onMute = (): void => {
  emit('mute')
}

const onMinimize = (): void => {
  window.api.minimize()
}

const onClose = (): void => {
  window.api.close()
}

const checkTaihaSingeki = (): boolean => {
  if (!svdata.inMap) {
    return false
  }

  const battleDeck = svdata.battleDeck
  if (!battleDeck) {
    return false
  }

  if (
    battleDeck.api_ship.some((el) => {
      const ship = svdata.ship(el)
      if (!ship) {
        return false
      }

      return KcsUtil.shipHpState(ship) == ShipHpState.taiha
    })
  ) {
    return true
  }

  if (!svdata.isCombined) {
    return false
  }

  const deck2 = svdata.deckPort(ApiDeckPortId.deck2st)
  if (!deck2) {
    return false
  }

  if (
    deck2.api_ship.some((el, index) => {
      // 第2旗艦は判定しない
      if (0 === index) {
        return false
      }

      const ship = svdata.ship(el)
      if (!ship) {
        return false
      }
      return KcsUtil.shipHpState(ship) == ShipHpState.taiha
    })
  ) {
    return true
  }

  return false
}

const isStartupUpdateAvailable = computed((): boolean => {
  if (updateAvailableContentWidth.value === 0) {
    //debug('isStartupUpdateAvailable called before initialized');
    return false;
  }
  return hasStartupUpdateAvailable.value
})

const { computed: isGimmickFlagDetected  } = kcs_stuff.isGimmickFlagDetected()
const { computed: isMapChangeDetected  } = kcs_stuff.isMapChangeDetected()

const isGimmickClear = computed((): boolean => {
  if (gimmickClearWidth.value === 0) {
    //debug('isGimmickClear called before initialized');
    return false;
  }
  return isGimmickFlagDetected.value || isMapChangeDetected.value
})


const isNotSupplyDeckCheck = (deckId: ApiDeckPortId) : boolean => {
  if (svdata.inMap) {
    return false
  }

  const deck = svdata.deckPorts.find((d) => d.api_id === deckId)
  if (! deck) {
    return false
  }

  return deck.api_ship.some((shipId) => {
    const api = svdata.ship(shipId)
    if (!api) {
      return false
    }
    const mst = svdata.mstShip(api.api_ship_id)
    if (!mst) {
      return false
    }
    return (mst.api_fuel_max !== api.api_fuel) ||
      mst.api_bull_max !== api.api_bull
  })
}

const isNotSupplyDeck = computed((): boolean => {
  if (notSupplyWidth.value === 0) {
    //debug('isNotSupplyDeck called before initialized');
    return false;
  }

  const ids: ApiDeckPortId[] = [
    ApiDeckPortId.deck1st,
    ApiDeckPortId.deck2st,
    ApiDeckPortId.deck3st,
    ApiDeckPortId.deck4st
  ]
  return ids.some((id) => isNotSupplyDeckCheck(id))
})

const isNotSupplyDeck1 = computed((): boolean => {
  if (notSupplyDeck1Width.value === 0) {
    //debug('isNotSupplyDeck1 called before initialized');
    return false;
  }
  return isNotSupplyDeckCheck(ApiDeckPortId.deck1st);
})
const isNotSupplyDeck2 = computed((): boolean => {
  if (notSupplyDeck2Width.value === 0) {
    //debug('isNotSupplyDeck2 called before initialized');
    return false;
  }
  return isNotSupplyDeckCheck(ApiDeckPortId.deck2st);
})
const isNotSupplyDeck3 = computed((): boolean => {
  if (notSupplyDeck3Width.value === 0) {
    //debug('isNotSupplyDeck3 called before initialized');
    return false;
  }
  return isNotSupplyDeckCheck(ApiDeckPortId.deck3st);
})
const isNotSupplyDeck4 = computed((): boolean => {
  if (notSupplyDeck4Width.value === 0) {
    //debug('isNotSupplyDeck4 called before initialized');
    return false;
  }
  return isNotSupplyDeckCheck(ApiDeckPortId.deck4st);
})


const isNotSupplyAirBaseCheck = (checkEvent: boolean): boolean => {
  if (notSupplyAirBaseWidth.value === 0) {
    //debug('isNotSupplyAirBase called before initialized');
    return false;
  }

  if (svdata.inMap) {
    return false
  }

  const airbases = svdata.airbases
  //debug('isNotSupplyAirBase called', toRaw(airbases));
  return !!airbases.some((base) => {
    const planes = base.api_plane_info
    const isEventAirBase = KcsUtil.isEventAreaId(base.api_area_id)

    if (checkEvent !== isEventAirBase) {
      return false
    }

    // イベントエリアではなく出撃以外は未補給判定しない
    if (! isEventAirBase) {
      if (base.api_action_kind !== AirBaseActionKind.syutugeki) {
        return false
      }
    }

    // イベントエリアで出撃・防空以外は未補給判定しない
    if (isEventAirBase) {
      const checks: AirBaseActionKind[] = [AirBaseActionKind.syutugeki, AirBaseActionKind.bouku];
      if(!checks.includes(base.api_action_kind)) {
          return false
        }
    }
    
    return !!planes.some((plane) => plane.api_count !== plane.api_max_count)
  })
}

const isNotSupplyAirBaseExist = computed((): boolean => {
  return isNotSupplyAirBaseCheck(false) || isNotSupplyAirBaseCheck(true);
})

const isNotSupplyAirBase = computed((): boolean => {
  return isNotSupplyAirBaseCheck(false);
})

const isNotSupplyAirBaseEvent = computed((): boolean => {
  return isNotSupplyAirBaseCheck(true);
})

const eventSupportMissionIds = computed((): number[] =>  {
  if (! svdata.inEvent) {
    return []
  }

  const missions = svdata.missions
  if (missions.length === 0) {
    return []
  }

  // イベントIDの最大値と次に少ないIDを取得
  const missionIds = missions.filter((m) => m.api_mission_id > ApiMissionId.強行鼠輸送作戦).map((m) => m.api_mission_id)
  const maxMissionIdBoss = missionIds.length > 0 ?  Math.max(...missionIds) : 0;
  const maxMissionIdSupport = missionIds.length > 1 ? Math.max(...missionIds.filter(id => id !== maxMissionIdBoss)) : 0
  if (maxMissionIdSupport > 0 && maxMissionIdBoss > 0) {
    return [maxMissionIdSupport, maxMissionIdBoss]
  }
  return []
})


const isWaySupport = computed((): boolean => {
  if (waySupportWidth.value === 0) {
    //debug('isWaySupport called before initialized');
    return false;
  }

  const checkIds: number[] = [
    ApiMissionId.前衛支援任務_南方,
  ]
  const eventIds = eventSupportMissionIds.value
  if (eventIds.length > 0) {
    checkIds.push(eventIds[0])
  }

  const decks = svdata.deckPorts
  return decks.some((deck) => {
    const missionId = KcsUtil.getDeckProgressMissionId(deck)
    return checkIds.includes(missionId)
  })
})

const isBossSupport = computed((): boolean => {
  if (bossSupportWidth.value === 0) {
    //debug('isBossSupport called before initialized');
    return false;
  }

  const checkIds: number[] = [
    ApiMissionId.決戦支援任務_南方,
  ]
  const eventIds = eventSupportMissionIds.value
  if (eventIds.length > 1) {
    checkIds.push(eventIds[1])
  }

  const decks = svdata.deckPorts
  return decks.some((deck) => {
    const missionId = KcsUtil.getDeckProgressMissionId(deck)
    return checkIds.includes(missionId)
  })
})

const isEventWaySupport = computed((): boolean => {
  const checkIds: number[] = []
  const eventIds = eventSupportMissionIds.value
  if (eventIds.length > 0) {
    checkIds.push(eventIds[0])
  }
  if (checkIds.length === 0) {
    return false
  }
  const decks = svdata.deckPorts
  return decks.some((deck) => {
    const missionId = KcsUtil.getDeckProgressMissionId(deck)
    return checkIds.includes(missionId)
  })
})



// todo: title属性はdragルールがあると機能しない、hoverも効かない
// const waySupportTitle = computed((): string => {
//   if (isEventWaySupport.value) {
//     return 'イベント前衛支援任務出撃中'
//   }
//   return '通常前衛支援任務出撃中'
// })

const isEventBossSupport = computed((): boolean => {
  const checkIds: number[] = []
  const eventIds = eventSupportMissionIds.value
  if (eventIds.length > 1) {
    checkIds.push(eventIds[1])
  }
  if (checkIds.length === 0) {
    return false
  }
  const decks = svdata.deckPorts
  return decks.some((deck) => {
    const missionId = KcsUtil.getDeckProgressMissionId(deck)
    return checkIds.includes(missionId)
  })
})

// todo: title属性はdragルールがあると機能しない、hoverも効かない
// const bossSupportTitle = computed((): string => {
//   if (isEventBossSupport.value) {
//     return 'イベント決戦支援任務出撃中'
//   }
//   return '通常決戦支援任務出撃中'
// })


const isTodayBattleScoreCalced = computed((): boolean => {
  return todayExpFetched.value && todayBattleScore.value > 0
})

const isTodayBattleScoreZero = computed((): boolean => {
  return todayExpFetched.value && todayBattleScore.value <= 0
})

function clearTodayBattleScoreAnimTimer(): void {
  if (todayBattleScoreAnimTimer !== null) {
    clearTimeout(todayBattleScoreAnimTimer)
    todayBattleScoreAnimTimer = null
  }
}

function syncTodayBattleScoreDial(next: number, prev?: number): void {
  if (! todayExpFetched.value) {
    todayBattleScoreDialDigits.value = []
    todayBattleScoreDialOffsets.value = []
    return
  }

  const nextText = next.toString()
  const prevText = prev !== undefined ? prev.toString() : undefined
  const nextDigits = nextText.split('').map((d) => Number(d))
  const hasPrev = prevText !== undefined && /^\d+$/.test(prevText)
  if (!hasPrev) {
    todayBattleScoreDialDigits.value = [...nextDigits]
    todayBattleScoreDialOffsets.value = [...nextDigits]
    return
  }

  const prevDigits = prevText!.split('').map((d) => Number(d))
  const direction = Number(nextText) >= Number(prevText) ? 1 : -1
  if (prevDigits.length !== nextDigits.length || todayBattleScoreDialOffsets.value.length !== prevDigits.length) {
    const nextOffsets = Array.from(nextDigits)
    for (let nextIndex = nextDigits.length - 1, prevIndex = prevDigits.length - 1; nextIndex >= 0 && prevIndex >= 0; nextIndex -= 1, prevIndex -= 1) {
      const digit = nextDigits[nextIndex]
      const prevDigit = prevDigits[prevIndex]
      let delta = digit - prevDigit
      if (direction > 0 && delta < 0) {
        delta += 10
      }
      if (direction < 0 && delta > 0) {
        delta -= 10
      }
      const prevOffset = todayBattleScoreDialOffsets.value[prevIndex] ?? prevDigit
      nextOffsets[nextIndex] = prevOffset + delta
    }
    todayBattleScoreDialDigits.value = [...nextDigits]
    todayBattleScoreDialOffsets.value = nextOffsets
    return
  }

  nextDigits.forEach((digit, i) => {
    const prev = prevDigits[i]
    let delta = digit - prev
    if (direction > 0 && delta < 0) {
      delta += 10
    }
    if (direction < 0 && delta > 0) {
      delta -= 10
    }
    todayBattleScoreDialOffsets.value[i] += delta
    todayBattleScoreDialDigits.value[i] = digit
  })
}

function animateTodayBattleScore(target: number): void {
  clearTodayBattleScoreAnimTimer()
  const current = todayBattleScore.value
  if (current === target) {
    return
  }

  const step = target > current ? 1 : -1
  const tick = () => {
    const currentValue = todayBattleScore.value

    const next = currentValue + step
    todayBattleScore.value = next
    if (next === target) {
      clearTodayBattleScoreAnimTimer()
      return
    }
    todayBattleScoreAnimTimer = setTimeout(tick, 70)
  }
  todayBattleScoreAnimTimer = setTimeout(tick, 70)
}

let v = 95;
function updateTodayBattleScore() {
  if (! todayExpFetched) {
    debug('today exp updated before fetched')
    return
  }
  const score = (svdata.basic.api_experience - todayStartExp.value) * 7.0 / 10000
  debug('updateTodayBattleScore', {
    todayStartExp: todayStartExp.value,
    currentExp: svdata.basic.api_experience,
    score: Math.trunc(score)
  })

  animateTodayBattleScore(Math.trunc(score))  

  // test code
  // setInterval(() => {
  //   animateTodayBattleScore(v)
  //   v+= 2;
  // }, 4000)
}

function fetchTodayExp() {
  if (todayExpFetched.value) {
    return
  }

  const fromDate = new Date();
  if (fromDate.getHours() < 2) {
    fromDate.setDate(fromDate.getDate() - 1);
  }
  fromDate.setHours(2, 0, 0, 0);

  const projection: PortRecordQueryProjection = {};
  projection.date = 1
  projection[ApiItemId.teitoku_exp] = 1

  const query = { 
    dbName: DbName.port, 
    find: { 
      date: { 
        $gte: toRecordDate(fromDate),
      } 
    },
    sort: { date: 1 },
    limit: 1,
    projection
  }
  debug('fetching today exp with query', query)
  window.api.queryDb(query).then((queryReturn) => {
    const records = queryReturn as PortRecord[]
    todayExpFetched.value = true
    debug('fetched port records:', records.length);
    debug(records);

    if (records.length === 0) {
      debug('no records found');
      // レコード無しの場合は、現expを使用する
     todayStartExp.value =  svdata.basic.api_experience
    } else {
      const exp = records[0][ApiItemId.teitoku_exp]
      if (! exp) {
        debug('exp not found in record', records[0]);
        todayStartExp.value =  svdata.basic.api_experience
      } else {
        debug('today start exp', exp);
        todayStartExp.value = exp
      }
    }
    updateTodayBattleScore()

    // set battle score reset timer
    setDailyBattleScoreResetTimer()

  }).catch((err) => {
    console.error('failed to fetch today exp', err)
    clearTodayBattleScoreAnimTimer()
  })
}

watch(
  () => todayBattleScore.value,
  (next, prev) => {
    syncTodayBattleScoreDial(next, prev)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  clearTodayBattleScoreAnimTimer()
  clearDailyBattleScoreResetTimer()
})

/////////////////////////////////////////////////////////////////////////////////////
// battle score reset timer
let bsResetTimerId :undefined | number = undefined
function clearDailyBattleScoreResetTimer() {
  if (bsResetTimerId !== undefined) {
    clearTimeout(bsResetTimerId)
    bsResetTimerId = undefined
  }
}

function setDailyBattleScoreResetTimer() {
  clearDailyBattleScoreResetTimer()

  const now = new Date()
  const nextReset = new Date()
  nextReset.setDate(now.getDate() + (now.getHours() < 2 ? 0 : 1))
  nextReset.setHours(2, 0, 1, 0) // 1sec: for recursive call
  const durMs = nextReset.getTime() - now.getTime()
  debug('setting daily battle score reset timer. now:', now, 'next reset:', nextReset, 'duration ms:', durMs)
  bsResetTimerId = window.setTimeout(() => {
    todayStartExp.value = svdata.basic.api_experience
    todayBattleScore.value = 0
    bsResetTimerId = undefined
    debug('daily battle score reset')

    // recursive call
    setDailyBattleScoreResetTimer()
  }, durMs)
}

// test mode
if (EnvRenderer.isTestMode) {
  fetchTodayExp()
}

</script>

<template>
  <div class="titlebar" :class="{ 'is-taiha-singeki': taiha_singeki }" ref="titlebarEl">
    <div>
      <div class="icon-container" :style="iconContainerStyle">
        <img class="icon app" src="../assets/img/titlebar/app-icon.png" />
        <span class="kou-num" :class="{ 'is-kou-max': isKouMax }">{{ kouNum }}</span>
      </div>
    </div>
    <div class="titlebar-buttons head" :class="{ dragable: isDragable }">
      <div>
        <div
          class="titlebar-button assist"
          :class="{ checked: isAssistShown, disabled: !isAssistOk }"
          title="アシストを表示"
          @click="onAssist"
        >
          <ShowAssistImage />
        </div>
      </div>
    </div>
    <div class="title-content" :class="{ dragable: isDragable }">
      <span class="main-text">{{ title }}</span>
      <transition name="slide-effect" appear>
        <button
          v-show="isStartupUpdateAvailable"
          class="caption-content for-calc-size update-available-content"
          :style="updateAvailableContentStyle"
          :title="updateAvailableTitle"
          @click="onUpdateAvailableClick"
        >
          New !
        </button>
      </transition>
      <transition name="slide-effect" appear>
        <span class="caption-content for-calc-size gimmick-clear-content" 
          v-show="isGimmickClear"
          :style="gimmickClearStyle">&nbsp;&nbsp;<span 
            class="g">ギミック</span>解除音<span 
              v-if="isGimmickFlagDetected" class="tag-circle yellow">有</span><span 
              v-if="isMapChangeDetected" class="tag-circle yellow">有<span 
                class="is-map">MAP</span></span></span>
      </transition>
      <transition name="slide-effect" appear>
        <span class="caption-content for-calc-size not-supply-content" 
          v-show="isNotSupplyDeck"
          :style="notSupplyStyle">&nbsp;&nbsp;未補給</span>
      </transition>
      <transition name="slide-effect" appear>
         <span class="caption-content for-calc-size not-supply-deck1"
           v-show="isNotSupplyDeck1"
           :style="notSupplyDeck1Style"><span class="tag-circle yellow deck">第一</span></span>
      </transition>
      <transition name="slide-effect" appear>
         <span class="caption-content for-calc-size not-supply-deck2"
           v-show="isNotSupplyDeck2"
           :style="notSupplyDeck2Style"><span class="tag-circle yellow deck">第二</span></span>
      </transition>
      <transition name="slide-effect" appear>
         <span class="caption-content for-calc-size not-supply-deck3"
           v-show="isNotSupplyDeck3"
           :style="notSupplyDeck3Style"><span class="tag-circle yellow deck">第三</span></span>
      </transition>
      <transition name="slide-effect" appear>
         <span class="caption-content for-calc-size not-supply-deck4"
           v-show="isNotSupplyDeck4"
           :style="notSupplyDeck4Style"><span class="tag-circle yellow deck">第四</span></span>
      </transition>
      <transition name="slide-effect" appear>
        <span class="caption-content for-calc-size not-supply-airbase-content" 
          v-show="isNotSupplyAirBaseExist"
          :style="notSupplyAirBaseStyle">&nbsp;&nbsp;基地未補給<span 
            v-if="isNotSupplyAirBase" class="tag-circle yellow">有</span><span 
            v-if="isNotSupplyAirBaseEvent" class="tag-circle yellow">有<span class="is-event">E</span></span></span>
      </transition>
      <transition name="slide-effect" appear>
        <span class="caption-content for-calc-size way-support-content" 
          v-show="isWaySupport"
          :style="waySupportStyle">&nbsp;&nbsp;前衛支援<span 
            class="tag-circle red">出<span 
            v-if="isEventWaySupport" class="is-event">E</span></span></span>
      </transition>
      <transition name="slide-effect" appear>
        <span class="caption-content for-calc-size boss-support-content" 
          v-show="isBossSupport"
          :style="bossSupportStyle">&nbsp;&nbsp;決戦支援<span 
            class="tag-circle red">出<span 
          v-if="isEventBossSupport" class="is-event">E</span></span></span>
      </transition>
    </div>
    <div class="mapinfo" :class="{ dragable: isDragable }">
      <div class="mapinfo-content">
        <div class="map-in-out-img" :class="{ 'in-map': inMap }"><MapInOutImage /></div>
        <div>{{ mapAreaText }}</div>
        <div class="timeline-button" :class="{ press: timeline_pressed }" title="タイムライン">
          <div class="battle-score-text">
            <div>戦果</div>
            <div class="score">
              <template v-if="isTodayBattleScoreCalced">
                <span class="score-dial-digit" v-for="(offset, index) in todayBattleScoreDialOffsets" :key="todayBattleScoreDialOffsets.length - index - 1">
                  <span class="score-dial-reel" :style="{ transform: `translateY(-${offset}em)` }">
                    <span class="score-dial-char" v-for="(num, numIndex) in scoreDialReel" :key="numIndex">{{ num }}</span>
                  </span>
                </span>
              </template>
              <template v-else-if="isTodayBattleScoreZero">0</template>
              <template v-else>--</template>
            </div>
          </div>
          <TimelineImage class="timeline-img" /><span class="dropdown-char">&#x25BC;</span>
        </div>
        <div>{{ mapCellText }} {{ formationText }} {{ dispSeikuText }} {{ tacticsText }}</div>
      </div>
    </div>
    <div class="materials" :class="{ dragable: isDragable }">
      <div v-if="isMaterialOk" class="material-content">
        <div class="s-icon titlebar-fuel">
          <span>{{ fual }}</span>
        </div>
        <div class="s-icon titlebar-steel">
          <span>{{ steel }}</span>
        </div>
        <div class="s-icon titlebar-fast-repair">
          <span>{{ fastRepair }}</span>
        </div>
        <div class="s-icon titlebar-build-kit">
          <span>{{ buildKit }}</span>
        </div>
        <div class="s-icon titlebar-ship" :class="shipCountClass">
          <span>{{ ship_count }}</span>
        </div>
        <div class="s-icon titlebar-bull">
          <span>{{ bull }}</span>
        </div>
        <div class="s-icon titlebar-buxite">
          <span>{{ buxite }}</span>
        </div>
        <div class="s-icon titlebar-fast-build">
          <span>{{ fastBuild }}</span>
        </div>
        <div class="s-icon titlebar-remodel-kit">
          <span>{{ remodelKit }}</span>
        </div>
        <div class="s-icon titlebar-slotitem" :class="slotitemCountClass">
          <span>{{ slotitemCount }}</span>
        </div>
      </div>
    </div>
    <div class="titlebar-buttons" :class="{ dragable: isDragable, 'in-assist-main': inAssistMain }">
      <div>
        <div
          class="titlebar-button rec"
          :class="{ checked: isRecording }"
          title="録画を開始"
          @click="onRec"
        >
          <RecImage />
        </div>
        <!-- todo refresh tool. reload vue component by key -->
        <!-- <div class="titlebar-button" title="ツールを再読み込みします" @click="onRefreshAssist">
          <RefreshAssistImage />
        </div> -->
        <div
          class="titlebar-button"
          title="スクリーンショット・録画フォルダを開く"
          @click="onOpenCaptureFolder"
        >
          <OpenCaptureFolderImage />
        </div>
        <div class="titlebar-button" title="スクリーンショット" @click="onScreenshot">
          <CaptureImage />
        </div>
        <div class="titlebar-button" :title="muteTitle" @click="onMute">
          <SoundOffImage v-if="isMute" /><SoundOnImage v-if="!isMute" />
        </div>
        <div class="titlebar-button" title="ページを再読み込みします" @click="onReload">
          <ReloadImage />
        </div>
        <div
          v-if="isDevelopment"
          class="titlebar-button"
          title="デベロッパー ツール"
          @click="onDevTool"
        >
          <DevToolImage />
        </div>
        <div
          class="titlebar-button"
          title="Game側デベロッパー ツール"
          @click="onGameDevTool"
        >
          <GameDevToolImage />
        </div>
        <div class="titlebar-button" title="新しいアシストウインドウを表示" @click="onOpenAssist">
          <OpenAssistImage />
        </div>
        <div
          class="titlebar-button"
          :class="{ checked: isTopMost }"
          title="常に最前面に表示する"
          @click="onTopMost"
        >
          <TopMostImage />
        </div>
        <div class="titlebar-button" title="最小化" @click="onMinimize"><span>&#x2014;</span></div>
        <!--<div class="button" @click="onMaximize"><span>&#9744;</span></div>-->
        <div class="titlebar-button close" title="閉じる" @click="onClose">
          <span>&#10005;</span>
        </div>
      </div>
    </div>
  </div>
</template>
