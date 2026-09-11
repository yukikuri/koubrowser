import { EnvRenderer } from '@renderer/common/env-renderer'
import { ref } from 'vue'
import { getLocalStoragePrefixKey, LocalStorageKeyName } from '@renderer/store/storage_key';

/////////////////////////////////////////////////////////////////////////////////////
// デバッグログ
const DEBUG = 0;

const debug = (...args: unknown[]): void => {
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

const LocalStorageKey = ((): string => 
  getLocalStoragePrefixKey(LocalStorageKeyName.prefix.uiStatePrefix)
)();

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
    // ignore
  }
  return def
}
const uiState = load()

let delaySaveRequested = false;
function delaySave(): void {
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
const assistTabOrder: AssistTabName[] = (() => {
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

function getAssistTabIndex(tabName: string): number {
  const index = assistTabOrder.findIndex((el) => el === tabName)
  debug('getting tab index for tab name:', tabName, 'tab order:', assistTabOrder, 'index:', index)
  return index >= 0 ? index : 0
}

const assistTabIndex = ref(getAssistTabIndex(uiState.tabName))
const assistTabRequest = ref<AssistTabName | null>(null)

export const AssistUIState = {
  tabOrder: assistTabOrder,
  tabIndex: assistTabIndex,
  tabRequest: assistTabRequest,

  requestTab(tabName: AssistTabName): void {
    assistTabRequest.value = tabName
  },

  isTabVisibleByName(tabName: AssistTabName): boolean {
    const index = assistTabOrder.indexOf(tabName)
    return assistTabIndex.value === index
  },

  getTabName(index: number): AssistTabName | undefined {
    return assistTabOrder[index]
  },

  saveTabName(tabName: AssistTabName): void {
    uiState.tabName = tabName

    if (EnvRenderer.isAssist) {
      delaySave()
    }
  },
}

/////////////////////////////////////////////////////////////////////////////////////
// battletab component
export const BattleTabUIState = (() => {

  const tabOrder: BattleTabName[] = (() => {
    const ret: BattleTabName[] = []
    ret.push('score')
    ret.push('history')
    return ret
  })()

  const tabIndex = ref(getTabIndex(uiState.battletab.tabName))

  function getTabIndex(tabName: string): number {
    const index = tabOrder.findIndex((el) => el === tabName)
    debug('getting tab index for tab name:', tabName, 'tab order:', tabOrder, 'index:', index)
    return index >= 0 ? index : 0
  }

  const isTabVisibleByName = (tabName: BattleTabName): boolean => {
    const index = tabOrder.indexOf(tabName)
    return tabIndex.value === index
  }

  function getTabName(index: number): BattleTabName | undefined {
    return tabOrder[index]
  }

  function saveTabName(tabName: BattleTabName): void {
    uiState.battletab.tabName = tabName
    if (EnvRenderer.isAssist) {
      delaySave()
    }
  }
  return { tabOrder, tabIndex, isTabVisibleByName, getTabName, saveTabName }
})()

/////////////////////////////////////////////////////////////////////////////////////
// shipitems component
export const ShipItemsTabUIState = (() => {

  const tabOrder: ShipItemsTabName[] = (() => {
    const ret: ShipItemsTabName[] = []
    ret.push('shiplist')
    ret.push('slotitemlist')
    ret.push('itemlist')
    return ret
  })()

  const tabIndex = ref(getTabIndex(uiState.shipitems.tabName))

  function getTabIndex(tabName: string): number {
    const index = tabOrder.findIndex((el) => el === tabName)
    debug('getting tab index for tab name:', tabName, 'tab order:', tabOrder, 'index:', index)
    return index >= 0 ? index : 0
  }

  const isTabVisibleByName = (tabName: ShipItemsTabName): boolean => {
    const index = tabOrder.indexOf(tabName)
    return tabIndex.value === index
  }

  function getTabName(index: number): ShipItemsTabName | undefined {
    return tabOrder[index]
  }

  function saveTabName(tabName: ShipItemsTabName): void {
    uiState.shipitems.tabName = tabName
    if (EnvRenderer.isAssist) {
      delaySave()
    }
  }
  return { tabOrder, tabIndex, isTabVisibleByName, getTabName, saveTabName }
})()

/////////////////////////////////////////////////////////////////////////////////////
// dropbyship component
export const DropByShipTabUIState = (() => {

  const tabOrder: DropByShipTabName[] = (() => {
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

  const tabIndex = ref(getTabIndex(uiState.dropbyship.tabName))

  function getTabIndex(tabName: string): number {
    const index = tabOrder.findIndex((el) => el === tabName)
    debug('getting tab index for tab name:', tabName, 'tab order:', tabOrder, 'index:', index)
    return index >= 0 ? index : 0
  }

  const isTabVisibleByName = (tabName: DropByShipTabName): boolean => {
    const index = tabOrder.indexOf(tabName)
    return tabIndex.value === index
  }

  function getTabName(index: number): DropByShipTabName | undefined {
    return tabOrder[index]
  }

  function saveTabName(tabName: DropByShipTabName): void {
    uiState.dropbyship.tabName = tabName
    if (EnvRenderer.isAssist) {
      delaySave()
    }
  }
  return { tabOrder, tabIndex, isTabVisibleByName, getTabName, saveTabName }
})()
