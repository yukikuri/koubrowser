<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'

const DEBUG = 0;

const debugLog = (...args: any[]) => {
  if (DEBUG) console.debug("[game webview]", ...args);
};

// webview
// https://www.electronjs.org/ja/docs/latest/api/webview-tag
import { WebviewTag, DidFrameFinishLoadEvent, LoadCommitEvent, IpcRendererEvent } from 'electron'
import { gameSetting } from '@renderer/store/gamesetting'
import { GameChannel } from '@common/channel'
import { Const } from '@common/const'
import { gameState } from '@renderer/store/gamestate'
import { EnvRenderer } from '@renderer/common/env-renderer'
const ipcRenderer = window.electron.ipcRenderer
const el = ref<HTMLElement | null>(null)

// mute状態はDOM-READY後ではないと設定できないことに注意
let mutedStateApplied = false

const StageType = {
  None: 0,
  GameStartLoading: 1,
} as const
export type StageType = (typeof StageType)[keyof typeof StageType]

const stage = ref<StageType>(StageType.None)

watch(
  () => gameSetting.zoom_factor,
  (newVal, oldVal) => {
    console.log('zoom factor changed', gameSetting.zoom_factor)
    getWebviewUnsafe().setZoomFactor(gameSetting.zoom_factor)

    console.log('zoom factor changed', newVal, oldVal)
    if (newVal !== oldVal) {
      const webview = getWebview()
      if (webview) {
        webview.setZoomFactor(newVal)
      }
    }
  }
)

function gameUrl(): string {
  // if use test data
  if (EnvRenderer.isTestMode) {
    return 'about:blank'
  }
  return Const.GamePageUrl
}

function getWebview(): WebviewTag | undefined {
  if (el.value === null) {
    return undefined
  }

  const ret = el.value!.querySelector('#kb')
  if (ret) {
    return ret as WebviewTag
  }
  return undefined
}

function getWebviewUnsafe(): WebviewTag {
  return getWebview() as WebviewTag
}

onMounted(() => {
  const webview = getWebview()
  debugLog('game mounted >> webview', webview)
  if (webview) {
    webview.addEventListener('dom-ready', domReady)
    webview.addEventListener('load-commit', loadCommit)
    webview.addEventListener('did-start-loading', didStartLoading)
    webview.addEventListener('did-finish-loading', didFinishLoading)
    webview.addEventListener('did-frame-finish-load', didFrameFinishLoad)
    webview.addEventListener('media-started-playing', mediaStartedPlaying)
    webview.addEventListener('media-paused', mediaPaused)
  }

  ipcRenderer.on(GameChannel.set_zoom_factor, setZoomFactor)
  debugLog('game mounted <<')
})

onUnmounted(() => {
  const webview = getWebview()
  debugLog('game destroyed webview:', webview)
  debugLog('game unmounted >>')
  if (webview) {
    webview.removeEventListener('dom-ready', domReady)
    webview.removeEventListener('load-commit', loadCommit)
    webview.removeEventListener('did-start-loading', didStartLoading)
    webview.removeEventListener('did-finish-loading', didFinishLoading)
    webview.removeEventListener('did-frame-finish-load', didFrameFinishLoad)
    webview.removeEventListener('media-started-playing', mediaStartedPlaying)
    webview.removeEventListener('media-paused', mediaPaused)
  }
  debugLog('game unmounted <<')
})

function setZoomFactor(_event: IpcRendererEvent, factor: number): void {
  debugLog(GameChannel.set_zoom_factor, factor)
  getWebviewUnsafe().setZoomFactor(factor)
}

function domReady(_event: Event): void {
  debugLog('domReady domRady')

  // apply muted state if needed
  if (!mutedStateApplied) {
    mutedStateApplied = true
    debugLog('apply muted state in domReady, muted:', gameState.muted)

    if (EnvRenderer.isInitMuted) {
      // mute状態では無ければmuteに設定
      const wevbview = getWebview()
      if (wevbview) {
        debugLog('initially muted. check webview muted state:', wevbview?.isAudioMuted())
        if (!wevbview.isAudioMuted()) {
          setMute(true, false)
        }
      }
    }
  }

  getWebviewUnsafe().setZoomFactor(gameSetting.zoom_factor)
}

const isOrigin = (url: string, checkOrigin: string): boolean => {
  try {
    const u = new URL(url)
    return u.origin === checkOrigin
  } catch (e) {
    console.error('invalid url', url, e)
    return false
  }
}

function loadCommit(event: LoadCommitEvent): void {
  if (!event.isMainFrame) {
    debugLog('loadCommit', 'mainframe:', event.isMainFrame, 'url:', event.url, event);
  }
  if (
    isStage(StageType.GameStartLoading) &&
    !event.isMainFrame &&
    isOrigin(event.url, 'https://osapi.dmm.com')
  ) {
    debugLog('loadCommit: game start loading detected', event.url)
    insertModCss()
    gameFrameScrollOff()
  }
}

function didStartLoading(_event: Event): void {
  debugLog('did-start-loading')
}

function didFinishLoading(_event: Event): void {
  debugLog('did-finish-loading')
}

function didFrameFinishLoad(event: DidFrameFinishLoadEvent): void {

  if (event.isMainFrame) {
    const url = getWebviewUnsafe().getURL()
    debugLog('didFrameFinishLoad', event, url);
    if (url !== Const.GamePageUrl) {
      return 
    }

    debugLog('didFrameFinishLoad game top loaded, try click sortie button')
    stage.value = StageType.GameStartLoading

    const code = `(function(){
      let a = document.querySelector('.fn-rollover.btn a');
      if (a) {
        a.click();
        return true;
      }
      return false;
    })()`
    getWebviewUnsafe().executeJavaScript(code).then((any) => {
      console.log('clicked', any)
    })
  }
}

function insertModCss() {
  const css = `
body {
overflow: hidden;
}
#root > div > main {
padding-top: 0 !important;
}
#root > div.gamesResetStyle > header > nav > div:nth-of-type(1) {
justify-content: flex-start !important;
}
#game_frame {
height: 736px !important;
width: 1200px !important;
}
`
  getWebviewUnsafe().insertCSS(css).then((key) => {
    debugLog('css inserted', key)
  })
}

function gameFrameScrollOff() {
  const code = `(function(){
    let a = document.querySelector('#game_frame');
    if (a) {
      a.scrolling = 'no';
      return true;
    }
      return false;
  })()`
  getWebviewUnsafe()
    .executeJavaScript(code)
    .then((any) => {
      debugLog('scrolling set:', any)
    })
}

function mediaStartedPlaying(_event: Event): void {
  debugLog('mediaStartedPlaying')
}

function mediaPaused(_event: Event): void {
  debugLog('mediaPaused')
}

function setMute(mute: boolean, notifyCheck: boolean): void {
  const webview = getWebview()
  if (webview) {
    const oldMuted = gameState.muted
    debugLog('now webview muted:', webview.isAudioMuted(), 'muted state:', oldMuted, 'notifyCheck:', notifyCheck)
    webview.setAudioMuted(mute)
    gameState.muted = webview.isAudioMuted()
    debugLog('set muted:', gameState.muted)
    if (notifyCheck && oldMuted !== gameState.muted) {
      debugLog('notify mute state changed:', gameState.muted)
      window.api.notifyMuteState(gameState.muted)
    }
  }
}

function isStage(check: StageType): boolean {
  return stage.value === check
}

// exports
defineExpose({
  getWebview,
  setMute
})
</script>
<template>
  <div class="game-container" ref="el">
    <webview
      id="kb"
      class="kb"
      :src="gameUrl()"
      allowpopups
      enableremotemodule="false"
      nodeintegration="false"
      nodeIntegrationInSubFrames="true"
      webPreferences="contextIsolation=no, sandbox=no"
    ></webview>
  </div>
</template>