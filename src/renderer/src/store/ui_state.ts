import { EnvRenderer } from '@renderer/common/env-renderer'
import { ref } from 'vue'

/////////////////////////////////////////////////////////////////////////////////////
// デバッグログ
const DEBUG = 0;

const debug = (...args: any[]) => {
  if (DEBUG) console.debug("[ui-state]", ...args);
};

/////////////////////////////////////////////////////////////////////////////////////
// 
export type AssistTabName =
  | 'deckport'
  | 'missioncheck'
  | 'battletab'
  | 'shipitems'
  | 'dropbymap'
  | 'dropbyship'
  | 'dockquestlist'
  | 'chart'
  | 'about'

export type BattleTabName =
  | 'score'
  | 'history'

export type ShipItemsTabName =
  | 'shiplist'
  | 'slotitemlist'
  | 'itemlist'

export type DropByShipTabName =
  | 'senkan'
  | 'kubo'
  | 'jyujyun'
  | 'keijyun'
  | 'kutikukan'
  | 'kaiboukan'
  | 'sensuikan'
  | 'hojo'

/////////////////////////////////////////////////////////////////////////////////////
// UI state
interface UIState {
  tabName : AssistTabName

  // battletab
  battletab: {
    tabName: BattleTabName
  }

  // shipitems
  shipitems: {
    tabName: ShipItemsTabName
  }

  // dropbyship
  dropbyship: {
    tabName: DropByShipTabName
  }
}

const defaultUIState = (): UIState => {
  return {
    tabName: 'deckport',
    battletab: {
      tabName: 'score'
    },
    shipitems: {
      tabName: 'shiplist'
    },
    dropbyship: {
      tabName: 'senkan'
    }
  }
}

const LocalStorageKey = ((): string => {
  const subkey = EnvRenderer.isAssist ? 'assist' : 'main'
  return 'uiState:' + subkey
})();

function load(): UIState {
  debug('loading state')

  // mainはロードしない、デフォルトを返却する
  const def = defaultUIState()
  if (! EnvRenderer.isAssist) {
    return def
  }

  const json = localStorage.getItem(LocalStorageKey)
  if (! json) {
    return def
  }
  try {
    const obj = JSON.parse(json)
    debug('loaded ui state:', obj)
    Object.assign(def, obj)
    debug('state after assign:', def)
  } catch {
  }
  return def
}
const uiState = load()

let delaySaveRequested = false;
function delaySave() {
  if (! delaySaveRequested) {
    delaySaveRequested = true
    setTimeout(() => {
      delaySaveRequested = false
      if (EnvRenderer.isAssist) {
        localStorage.setItem(LocalStorageKey, JSON.stringify(uiState))
        debug('saved (delayed):', uiState)
      }
    }, 0)
  }
}

/////////////////////////////////////////////////////////////////////////////////////
// assist component
export namespace AssistUIState {

  export const tabOrder: AssistTabName[] = (() => {
    const ret: AssistTabName[] = []
    ret.push('deckport')
    ret.push('missioncheck')
    ret.push('battletab')
    ret.push('shipitems')
    ret.push('dropbymap')
    ret.push('dropbyship')
    if (EnvRenderer.isAssist) {
      ret.push('dockquestlist')
    }
    ret.push('chart')
    ret.push('about')
    return ret
  })()

  export const tabIndex = ref(getTabIndex(uiState.tabName))
  export const tabRequest = ref<AssistTabName | null>(null)

  export function requestTab(tabName: AssistTabName): void {
    tabRequest.value = tabName
  }

  function getTabIndex(tabName: string): number {
    const index = tabOrder.findIndex((el) => el === tabName)
    debug('getting tab index for tab name:', tabName, 'tab order:', tabOrder, 'index:', index)
    return index >= 0 ? index : 0
  }

  export const isTabVisibleByName = (tabName: AssistTabName): boolean => {
    const index = tabOrder.indexOf(tabName)
    return tabIndex.value === index
  }

  export function getTabName(index: number): AssistTabName | undefined {
    return tabOrder[index]
  }

  export function saveTabName(tabName: AssistTabName): void {
    uiState.tabName = tabName
    if (EnvRenderer.isAssist) {
      delaySave()
    }
  }
}

/////////////////////////////////////////////////////////////////////////////////////
// battletab component
export namespace BattleTabUIState {

  export const tabOrder: BattleTabName[] = (() => {
    const ret: BattleTabName[] = []
    ret.push('score')
    ret.push('history')
    return ret
  })()

  export const tabIndex = ref(getTabIndex(uiState.battletab.tabName))

  function getTabIndex(tabName: string): number {
    const index = tabOrder.findIndex((el) => el === tabName)
    debug('getting tab index for tab name:', tabName, 'tab order:', tabOrder, 'index:', index)
    return index >= 0 ? index : 0
  }

  export const isTabVisibleByName = (tabName: BattleTabName): boolean => {
    const index = tabOrder.indexOf(tabName)
    return tabIndex.value === index
  }

  export function getTabName(index: number): BattleTabName | undefined {
    return tabOrder[index]
  }

  export function saveTabName(tabName: BattleTabName): void {
    uiState.battletab.tabName = tabName
    if (EnvRenderer.isAssist) {
      delaySave()
    }
  }
}

/////////////////////////////////////////////////////////////////////////////////////
// shipitems component
export namespace ShipItemsTabUIState {

  export const tabOrder: ShipItemsTabName[] = (() => {
    const ret: ShipItemsTabName[] = []
    ret.push('shiplist')
    ret.push('slotitemlist')
    ret.push('itemlist')
    return ret
  })()

  export const tabIndex = ref(getTabIndex(uiState.shipitems.tabName))

  function getTabIndex(tabName: string): number {
    const index = tabOrder.findIndex((el) => el === tabName)
    debug('getting tab index for tab name:', tabName, 'tab order:', tabOrder, 'index:', index)
    return index >= 0 ? index : 0
  }

  export const isTabVisibleByName = (tabName: ShipItemsTabName): boolean => {
    const index = tabOrder.indexOf(tabName)
    return tabIndex.value === index
  }

  export function getTabName(index: number): ShipItemsTabName | undefined {
    return tabOrder[index]
  }

  export function saveTabName(tabName: ShipItemsTabName): void {
    uiState.shipitems.tabName = tabName
    if (EnvRenderer.isAssist) {
      delaySave()
    }
  }
}

/////////////////////////////////////////////////////////////////////////////////////
// dropbyship component
export namespace DropByShipTabUIState {

  export const tabOrder: DropByShipTabName[] = (() => {
    const ret: DropByShipTabName[] = []
    ret.push('senkan')
    ret.push('kubo')
    ret.push('jyujyun')
    ret.push('keijyun')
    ret.push('kutikukan')
    ret.push('kaiboukan')
    ret.push('sensuikan')
    ret.push('hojo')
    return ret
  })()

  export const tabIndex = ref(getTabIndex(uiState.dropbyship.tabName))

  function getTabIndex(tabName: string): number {
    const index = tabOrder.findIndex((el) => el === tabName)
    debug('getting tab index for tab name:', tabName, 'tab order:', tabOrder, 'index:', index)
    return index >= 0 ? index : 0
  }

  export const isTabVisibleByName = (tabName: DropByShipTabName): boolean => {
    const index = tabOrder.indexOf(tabName)
    return tabIndex.value === index
  }

  export function getTabName(index: number): DropByShipTabName | undefined {
    return tabOrder[index]
  }

  export function saveTabName(tabName: DropByShipTabName): void {
    uiState.dropbyship.tabName = tabName
    if (EnvRenderer.isAssist) {
      delaySave()
    }
  }
}
