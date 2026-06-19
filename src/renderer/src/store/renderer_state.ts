import { EnvRenderer } from '@renderer/common/env-renderer'
import { getLocalStoragePrefixKey, LocalStorageKeyName } from '@renderer/store/storage_key';

/////////////////////////////////////////////////////////////////////////////////////
// デバッグログ
const DEBUG = 0;

const debug = (...args: any[]) => {
  if (DEBUG) console.debug("[renderer-state]", ...args);
};

/////////////////////////////////////////////////////////////////////////////////////
// renderer state
interface RendererState {
  appLaunchId: string
  muted: boolean
}

const defaultState = (): RendererState => {
  return {
    appLaunchId: EnvRenderer.appLaunchId ?? '',
    muted: EnvRenderer.isInitMuted,
  }
}

const LocalStorageKey = ((): string => 
  getLocalStoragePrefixKey(LocalStorageKeyName.prefix.rendererStatePrefix)
)();

function load(): RendererState {
  debug('loading state')

  // assistはロードしない、デフォルトを返却する
  const def = defaultState()
  if (EnvRenderer.isAssist) {
    return def
  }

  const json = localStorage.getItem(LocalStorageKey)
  if (! json) {
    return def
  }
  try {
    const obj = JSON.parse(json)
    debug('loaded renderer state:', obj)
    Object.assign(def, obj)
    debug('state after assign:', def)
  } catch {
  }
  return def
}
const rendererState = load()

let delaySaveRequested = false;
function delaySave() {
  if (! delaySaveRequested) {
    delaySaveRequested = true
    setTimeout(() => {
      delaySaveRequested = false
      if (! EnvRenderer.isAssist) {
        localStorage.setItem(LocalStorageKey, JSON.stringify(rendererState))
        debug('saved (delayed):', rendererState)
      }
    }, 0)
  }
}

/////////////////////////////////////////////////////////////////////////////////////
// main component
export namespace MainRendererState {

  export function isCurrentAppLaunch(): boolean {
    return !!EnvRenderer.appLaunchId && (rendererState.appLaunchId === EnvRenderer.appLaunchId)
  }

  export function updateRendererState(muted: boolean): void {
    if (EnvRenderer.isAssist) {
      return ;
    }

    rendererState.appLaunchId = EnvRenderer.appLaunchId ?? ''
    rendererState.muted = muted
    delaySave()
  }

  export function getMuted(): boolean {
    return rendererState.muted
  }
}
