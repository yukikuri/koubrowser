<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, computed } from 'vue'
// webview
// https://www.electronjs.org/ja/docs/latest/api/webview-tag
import { WebviewTag, DidFrameFinishLoadEvent, LoadCommitEvent, IpcRendererEvent } from 'electron'
import { gameSetting } from '@renderer/store/gamesetting'
import { GameChannel, TaihaSingekiBlockState } from '@common/channel'
import { Const } from '@common/const'
import { gameState } from '@renderer/store/gamestate'
import { EnvRenderer } from '@renderer/common/env-renderer'
import { MainRendererState } from '@renderer/store/renderer_state'
import * as kcs_stuff from '@renderer/stuff/kcs_stuff'
import WarningIcon from '@assets/img/warning.svg'
import { ApiCallback } from '@common/kcs'
import { Api } from '@common/kcsapi'
import { svdata } from '@renderer/store/svdata'
const ipcRenderer = window.electron.ipcRenderer
const el = ref<HTMLElement | null>(null)

/////////////////////////////////////////////////////////////////////////////////////
// デバッグログ
const DEBUG = 0;

const debug = (...args: any[]) => {
  if (DEBUG) console.debug("[game webview]", ...args);
};

/////////////////////////////////////////////////////////////////////////////////////
// 大破進撃防止関連
let cb_port = 0;
let cb_battle_result = 0;
let cb_combined_battle_result = 0;
let cb_map_next = 0;
const taihaSingekiResult = ref<kcs_stuff.CheckTaihaSingekiResult | null>(null)
let blockShieldVisibleTimer: ReturnType<typeof setTimeout> | null = null
const isBlockShieldEnabled = ref<boolean>(true)

// アニメーション完了後に要素を削除するための判定に使用
const isTaihaWarningInAnimation = ref(false)

const clearBlockShieldVisibleTimer = () => {
  if (blockShieldVisibleTimer) {
    clearTimeout(blockShieldVisibleTimer)
    blockShieldVisibleTimer = null
  }
}

const isFlagshipTaiha = computed<boolean>(() => {
  if (! taihaSingekiResult.value || !taihaSingekiResult.value.isTaihaSingeki) {
    return false
  }

  return taihaSingekiResult.value.infos.some((info) => {
    const equips = info.equips
    return equips.includes(kcs_stuff.EquipType.flagship_megami) ||
           equips.includes(kcs_stuff.EquipType.flagship_repair)
  })
})

/////////////////////////////////////////////////////////////////////////////////////
// 

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
    debug('zoom factor changed', gameSetting.zoom_factor)
    getWebviewUnsafe().setZoomFactor(gameSetting.zoom_factor)

    debug('zoom factor changed', newVal, oldVal)
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
  debug('game mounted >> webview', webview, 'appLaunchId:', EnvRenderer.appLaunchId)
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
  ipcRenderer.on(GameChannel.guard_hit_effect, guardHitEffect)

  // 大破進撃防止関連
  cb_port = ApiCallback.set([Api.PORT_PORT, () => onPort()])
  cb_battle_result = ApiCallback.set(
    [Api.REQ_SORTIE_BATTLERESULT, () => onBattleResult()]
  )
  cb_combined_battle_result = ApiCallback.set(
    [Api.REQ_COMBINED_BATTLE_BATTLERESULT, () => onBattleResult()]
  )
  cb_map_next = ApiCallback.set(
    [Api.REQ_MAP_NEXT, () => onMapNext()]
  )

  debug('game mounted <<')
})

onUnmounted(() => {
  const webview = getWebview()
  debug('game destroyed webview:', webview)
  debug('game unmounted >>')
  if (webview) {
    webview.removeEventListener('dom-ready', domReady)
    webview.removeEventListener('load-commit', loadCommit)
    webview.removeEventListener('did-start-loading', didStartLoading)
    webview.removeEventListener('did-finish-loading', didFinishLoading)
    webview.removeEventListener('did-frame-finish-load', didFrameFinishLoad)
    webview.removeEventListener('media-started-playing', mediaStartedPlaying)
    webview.removeEventListener('media-paused', mediaPaused)
  }

  if (cb_port) {
    ApiCallback.unset(cb_port)
    cb_port = 0
  }
  if (cb_battle_result) {
    ApiCallback.unset(cb_battle_result)
    cb_battle_result = 0
  }
  if (cb_combined_battle_result) {
    ApiCallback.unset(cb_combined_battle_result)
    cb_combined_battle_result = 0
  }
  if (cb_map_next) {
    ApiCallback.unset(cb_map_next)
    cb_map_next = 0
  }
  clearBlockShieldVisibleTimer()

  debug('game unmounted <<')
})

function setZoomFactor(_event: IpcRendererEvent, factor: number): void {
  debug(GameChannel.set_zoom_factor, factor)
  getWebviewUnsafe().setZoomFactor(factor)
}

function domReady(_event: Event): void {
  debug('domReady')

  // apply muted state if needed
  if (!mutedStateApplied) {
    mutedStateApplied = true
    debug('apply muted state in domReady, muted:', gameState.muted)

    if (gameState.muted) {
      // mute状態では無ければmuteに設定
      const webview = getWebview()
      if (webview) {
        debug('initially muted. check webview muted state:', webview.isAudioMuted())
        if (!webview.isAudioMuted()) {
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
    debug('loadCommit', 'mainframe:', event.isMainFrame, 'url:', event.url, event);
  }
  if (
    isStage(StageType.GameStartLoading) &&
    !event.isMainFrame &&
    isOrigin(event.url, 'https://osapi.dmm.com')
  ) {
    debug('loadCommit: game start loading detected', event.url)
    insertModCss()
    gameFrameScrollOff()
  }
}

function didStartLoading(_event: Event): void {
  debug('did-start-loading')
}

function didFinishLoading(_event: Event): void {
  debug('did-finish-loading')
}

function didFrameFinishLoad(event: DidFrameFinishLoadEvent): void {

  if (event.isMainFrame) {
    const url = getWebviewUnsafe().getURL()
    debug('didFrameFinishLoad', event, url);
    if (url !== Const.GamePageUrl) {
      return 
    }

    debug('didFrameFinishLoad game top loaded, try click sortie button')
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
      debug('clicked', any)
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
    debug('css inserted', key)
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
      debug('scrolling set:', any)
    })
}

function mediaStartedPlaying(_event: Event): void {
  debug('mediaStartedPlaying')
}

function mediaPaused(_event: Event): void {
  debug('mediaPaused')
}

function setMute(mute: boolean, notifyCheck: boolean): void {
  const webview = getWebview()
  if (webview) {
    const oldMuted = gameState.muted
    debug('now webview muted:', webview.isAudioMuted(), 'muted state:', oldMuted, 'notifyCheck:', notifyCheck)
    webview.setAudioMuted(mute)
    gameState.muted = webview.isAudioMuted()
    MainRendererState.updateRendererState(gameState.muted)
    debug('set muted:', gameState.muted)
    if (notifyCheck && oldMuted !== gameState.muted) {
      debug('notify mute state changed:', gameState.muted)
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

/////////////////////////////////////////////////////////////////////////////////////
// 大破進撃関連
function onPort(): void {
  debug('onPort')
  taihaSingekiResult.value = null
  window.api.setTaihaSingekiBlockState(TaihaSingekiBlockState.noState)
  isBlockShieldEnabled.value = true
  clearBlockShieldVisibleTimer()
  gameState.ctrl_pressed = false
}

function onBattleResult(): void {

  clearBlockShieldVisibleTimer()
  isTaihaWarningInAnimation.value = false

  // todo
  // 大破進撃防止の判定は、艦隊HP更新後に行う必要があることの改善
  // 艦隊HP更新はcallback呼び出し後に行われることからsettimeoutで遅延判定する
  setTimeout(() => {
    const result = kcs_stuff.checkTaihaSingeki()
    debug('onBattleResult', result)

    if (! result.isTaihaSingeki) {
      debug('onBattleResult: no taiha singeki')
      taihaSingekiResult.value = null
      return
    }

    // 大破判定となった場合、戦闘結果画面が表示される約9秒後に表示する
    const delaySec = 9000;
    blockShieldVisibleTimer = setTimeout(() => {
      taihaSingekiResult.value = result
      window.api.setTaihaSingekiBlockState(
        isFlagshipTaiha.value ? TaihaSingekiBlockState.flagshipBlock : TaihaSingekiBlockState.normalBlock)
      isTaihaWarningInAnimation.value = true
      blockShieldVisibleTimer = null
    }, delaySec)

  }, 0)
}

function onMapNext(): void {
  debug('onMapNext')
  taihaSingekiResult.value = null
  window.api.setTaihaSingekiBlockState(TaihaSingekiBlockState.noState)
  isBlockShieldEnabled.value = true
  gameState.ctrl_pressed = false
}

const isTaihaAdvanceBlockerVisible = computed<boolean>(() => {
  const result = taihaSingekiResult.value
  if (!result) {
    debug('isTaihaAdvanceBlockerVisible: no result')
    return false
  }
  debug('isTaihaAdvanceBlockerVisible: result', result)
  return result.isTaihaSingeki
})

type TaihaShipInfo = {
  // Lv.xx艦名(修理,女神)
  // Lv.xx艦名(ダメコンなし)
  shipText: string
  dameconText: string
  noDamageControl: boolean
}

const taihaShipInfos = computed<TaihaShipInfo[]>(() => {
  const result = taihaSingekiResult.value
  if (!result || !result.isTaihaSingeki) {
    debug('taihaShipInfos: no result')
    return []
  }
  return result.infos.map((info) => {
    let dameconTexts: string[] = []
    if (info.equips.includes(kcs_stuff.EquipType.flagship_megami) ||
        info.equips.includes(kcs_stuff.EquipType.megami)) {
      dameconTexts.push('女神')
    }
    if (info.equips.includes(kcs_stuff.EquipType.flagship_repair) ||
        info.equips.includes(kcs_stuff.EquipType.repair)) {
      dameconTexts.push('修理')
    }
    if (dameconTexts.length === 0) {
      dameconTexts.push('ダメコンなし')
    }

    const api = info.api_ship
    const mst = svdata.mstShip(api.api_ship_id)
    const shipText = `Lv.${api.api_lv}${mst?.api_name ?? ''}`
    const dameconText = dameconTexts.join(',')

    return {
      shipText,
      dameconText,
      noDamageControl: !info.equips.length
    }
  })
})

const toPercent = (value: number): string => `${value * 100}%`
const buttonCoverStyle = computed(() => {

  const result = taihaSingekiResult.value
  if (!result || !result.isTaihaSingeki) {
    debug('isFlagshipTaiha: no result')
    return {}
  }

  const rectRate = isFlagshipTaiha.value ? Const.TaihaSingeki.flagshipBlockRect : Const.TaihaSingeki.normalBlockRect
  const outline = EnvRenderer.isTestMode ? '1px solid red' : undefined
  const opacity = EnvRenderer.isTestMode ? 1.0 : undefined
  return {
    '--left': toPercent(rectRate.left),
    '--top': toPercent(rectRate.top),
    '--width': toPercent(rectRate.width),
    '--height': toPercent(rectRate.height),
    outline,
    opacity
  }
})

const isBlockShieldVisible = computed<boolean>(() => {

  // 大破判定無しでは非表示
  // ボタンを押して進撃、もしくはポートに戻った場合
  if (!isTaihaAdvanceBlockerVisible.value) {
    debug('isBlockShieldVisible: no taiha, shield hidden')
    return false
  }

  // Ctrlキー押下時ならシールド無効
  if (gameState.ctrl_pressed) {
    debug('isBlockShieldVisible: ctrl pressed, shield hidden')
    return false
  }

  debug('isBlockShieldVisible: shield visible', isBlockShieldEnabled.value)
  return isBlockShieldEnabled.value
})

const isGuardHit = ref(false)

function doGuardHitEffect(): void {
  
  // シールドアニメーション表示開始
  isGuardHit.value = false
  requestAnimationFrame(() => {
    isGuardHit.value = true
  })
  setTimeout(() => {
    isGuardHit.value = false
  }, 450)
}

function guardHitEffect(_event: IpcRendererEvent): void {
  debug('guardHitEffect')
  doGuardHitEffect()
}

const onButtonCoverClick = (_event: MouseEvent): void => {
  doGuardHitEffect()
}

// 全体のオーバレイはアニメーション完了で要素を削除する
const isTaihaOverlayVisible = computed<boolean>(() => {
  debug('isTaihaOverlayVisible',
  'isTaihaAdvanceBlockerVisible:', isTaihaAdvanceBlockerVisible.value, 
  'isTaihaWarningInAnimation:', isTaihaWarningInAnimation.value)
  
  if(isTaihaAdvanceBlockerVisible.value) {
    return true
  }

  return isTaihaWarningInAnimation.value
})

const onTaihaWarningAfterLeave = (): void => {
  debug('onTaihaWarningAfterLeave')
  isTaihaWarningInAnimation.value = false
}

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

    <div
      v-if="isTaihaOverlayVisible"
      class="taiha-overlay"
    >
      <transition name="slide-effect" appear @after-leave="onTaihaWarningAfterLeave">
        <div 
          v-if="isTaihaAdvanceBlockerVisible"
          class="taiha-warning-banner">
          <div class="banner-title"><WarningIcon />大破艦を検知しました</div>
          <div class="banner-text">
            轟沈防止で進撃操作を制限しています。シールドOFFにより操作可能です。
          </div>
          <div class="banner-text">
            大破艦：<template v-for="(info, index) in taihaShipInfos" 
              :key="`${index}-${info.shipText}-${info.dameconText}`"><span 
              class="taiha-info">{{ info.shipText }}(<WarningIcon v-if="info.noDamageControl" />{{ info.dameconText }})</span><template v-if="index < taihaShipInfos.length - 1">, </template>
            </template>
          </div>
        </div>
      </transition>

      <transition name="slide-effect" appear>
        <b-switch
          v-if="isTaihaAdvanceBlockerVisible"
          v-model="isBlockShieldEnabled"
          type="is-danger"
          class="block-shield-toggle"
          :left-label="true"
        ><span class="switch-text">{{ isBlockShieldEnabled ? 'シールドON' : 'シールドOFF' }}</span></b-switch>
      </transition>

      <div class="button-cover" 
        v-if="isBlockShieldVisible"
        title="大破進撃防止" 
        :class="{ 'is-guard-hit': isGuardHit }"
        :style="buttonCoverStyle"
        @click.prevent.stop="onButtonCoverClick">
        <svg
          class="button-cover-shield"
          :class="{ 'is-guard-hit': isGuardHit }"
          viewBox="0 0 220 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <filter id="shieldCyanGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood flood-color="#56f6ff" flood-opacity="0.85" result="glowColor" />
              <feComposite in="glowColor" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <polygon
            class="shield-fill"
            points="38,2 182,2 218,60 182,118 38,118 2,60"
            vector-effect="non-scaling-stroke"
          />

          <polygon
            class="shield-border-outer"
            points="38,2 182,2 218,60 182,118 38,118 2,60"
            vector-effect="non-scaling-stroke"
          />

          <polygon
            class="shield-border-inner"
            points="45,12 175,12 205,60 175,108 45,108 15,60"
            vector-effect="non-scaling-stroke"
          />
        </svg>
      </div>

    </div>

  </div>
</template>
