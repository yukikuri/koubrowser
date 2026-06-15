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


/////////////////////////////////////////////////////////////////////////////////////
// UI state
interface UIState {
  tabName : AssistTabName
}

const defaultUIState = (): UIState => {
  return {
    tabName: 'deckport',
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

  function getTabIndex(tabName: string): number {
    const index = tabOrder.findIndex((el) => el === tabName)
    debug('getting tab index for tab name:', tabName, 'tab order:', tabOrder, 'index:', index)
    return index >= 0 ? index : 0
  }

  export const isTabVisibleByName = (tabName: AssistTabName): boolean => {
    const tabIndex = tabOrder.indexOf(tabName)
    return assistTabIndex.value === tabIndex
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

  export const assistTabIndex = ref(getTabIndex(uiState.tabName))
  export const assistTabRequest = ref<AssistTabName | null>(null)

  export function requestAssistTab(tabName: AssistTabName): void {
    assistTabRequest.value = tabName
  }
}

