<script setup lang="ts">
import { ref, computed } from 'vue'
import { svdata } from '@renderer/store/svdata'
import { ShipEtcs } from '@common/kcsetc'
import { Env } from '@common/env'
import { globalSetting } from '@renderer/store/global_setting'
import {
  clickUpdateButton,
  isUadeteAvailable,
  isUadeteCheckError,
  isUadeteChecking,
  isUadeteDownloading,
  isUadeteIdle,
  isUadeteReady,
  isVersionLatest,
  updateButtonDisable,
  updateButtonText,
  updateStateSubText,
  updateStateText
} from '@renderer/stuff/update'
import ClearCacheImage from '@renderer/assets/img/clear-cache.svg'
import CheckUpdateImage from '@renderer/assets/img/check-update.svg'
import VersionLatestImage from '@renderer/assets/img/version-latest.svg'
import DownloadUpdateImage from '@renderer/assets/img/download-update.svg'
import RestartImage from '@renderer/assets/img/restart.svg'
import UpdateCheckErrorImage from '@renderer/assets/img/update-check-error.svg'
import AppDevToolImage from '@renderer/assets/img/app-devtool.svg'
import ShowLicenseImage from '@renderer/assets/img/show-license.svg'
import { bundledLicenses } from '@renderer/generated/bundled-licenses'

const version = ref('')
const clearState = ref<'noop' | 'in_clear' | 'cleared'>('noop')
const isLicenseOverlayVisible = ref(false)

window.api.getVersion().then((v: string) => {
  version.value = v
})

if (Env.isDevelopment) {
  if (svdata.isMstDataOk) {
    const msts = svdata.mstShips
    let ngCount = 0
    msts.forEach((el) => {
      if (el.api_sort_id) {
        const etc = ShipEtcs.find((etc) => etc.api_id === el.api_id)
        if (!etc) {
          console.debug('check etc data ng:', el.api_id, el.api_name)
          ngCount++
        }
      }
    })
    console.info('check etc data done. ng count:', ngCount)
  }
}

function openExternalUrl(ev: Event) {
  console.log(ev)
  ev.preventDefault()
  const href = (ev.currentTarget as HTMLAnchorElement).href
  window.api.openExternalUrl(href)
}

const versionTxt = computed(() => (version.value ? 'ver ' + version.value : ''))

function clearSessionCache(): void {
  clearState.value = 'in_clear'
  window.api.clearSessionCache().then(() => {
    clearState.value = 'cleared'
  })
}

function openKoubrowserDevTool(): void {
  window.api.devtool()
}

function openLicenseOverlay(): void {
  isLicenseOverlayVisible.value = true
}

function closeLicenseOverlay(): void {
  isLicenseOverlayVisible.value = false
}

const clearSessionCacheStateText = computed(() => {
  switch (clearState.value) {
    case 'noop':
      return ''
    case 'in_clear':
      return 'キャッシュをクリア中...'
    case 'cleared':
      return 'キャッシュをクリアしました'
  }
})

const clearCacheButtonDisable = computed(() => clearState.value === 'in_clear')
const appUrl = 'https://koubrowser.app'
const kanlogUrl = 'https://kanlog.info'
</script>

<template>
  <section class="about-root hero is-dark is-fullheight">
    <div class="hero-body">
      <div class="container about-container">
        <img class="app-img" src="../assets/img/app/app.png" alt="甲ブラウザロゴ" />
        <h2 class="subtitle">艦隊運用支援</h2>
        <h1 class="title">
          甲ブラウザ<span class="version">{{ versionTxt }}</span>
        </h1>
        <p>ゲーム関連画像の権利は各権利者に帰属します。</p>
        <p class="about-lead">
          配布ページ：<a
            class="has-text-success"
            rel="noreferrer"
            @click="openExternalUrl"
            target="_blank"
            :href="appUrl"
            >{{ appUrl }}</a
          >
        </p>
        <div class="about-sections">
          <section
            class="about-block update-check-block"
            :class="{ 'is-update-available-block': isUadeteAvailable || isUadeteReady }"
          >
            <h3 class="about-heading">更新チェック</h3>
            <p>
              <label>
                <input v-model="globalSetting.checkUpdateOnStartup" type="checkbox" />
                起動時に更新チェックを行う
              </label>
            </p>
            <p>
              <label>
                <input v-model="globalSetting.checkBetaUpdate" type="checkbox" />
                Beta版(開発版)を更新チェック対象に含める
              </label>
            </p>
            <p>
              <label class="button-in-about">
                <button @click="clickUpdateButton()" class="button" :disabled="updateButtonDisable">
                  <CheckUpdateImage v-if="isUadeteIdle" />
                  <CheckUpdateImage v-if="isUadeteChecking" />
                  <DownloadUpdateImage v-if="isUadeteAvailable" />
                  <DownloadUpdateImage v-if="isUadeteDownloading" />
                  <CheckUpdateImage v-if="isVersionLatest" />
                  <RestartImage v-if="isUadeteReady" />
                  <UpdateCheckErrorImage v-if="isUadeteCheckError" />
                  {{ updateButtonText }}
                </button>
              </label>
            </p>
            <p v-if="updateStateText.length > 0" class="update-state-text">
              <span
                class="update-state-line"
                :class="{
                  'is-update-available': isUadeteAvailable || isUadeteReady,
                  'is-update-error': isUadeteCheckError,
                }"
              >
                <VersionLatestImage v-if="isVersionLatest" class="update-state-icon" />
                <span>{{ updateStateText }}</span>
              </span>
            </p>
            <p v-if="updateStateSubText" class="is-update-available">{{ updateStateSubText }}</p>
          </section>

          <section class="about-block">
            <h3 class="about-heading">キャッシュ</h3>
            <p>ゲーム画面が表示されない場合、キャッシュクリアで改善が期待できます。</p>
            <p>
              <label class="button-in-about">
                <button
                  @click="clearSessionCache()"
                  class="button"
                  :disabled="clearCacheButtonDisable"
                >
                  <ClearCacheImage />ブラウザのキャッシュをクリア
                </button>
              </label>
            </p>
            <p class="about-note">{{ clearSessionCacheStateText }}</p>
          </section>

          <section class="about-block">
            <h3 class="about-heading">ゲーム情報提供</h3>
            <p>ドロップ情報の集計向上のため、情報提供にご協力ください。</p>
            <p>
              <label>
                <input v-model="globalSetting.enableIntake" type="checkbox" />
                ドロップ情報を提供する
              </label>
            </p>
            <p class="about-link-title">艦ログ - 艦これドロップ情報集計サイト</p>
            <p class="about-kanlog-link">
              <a
                class="has-text-success"
                rel="noreferrer"
                @click="openExternalUrl"
                target="_blank"
                :href="kanlogUrl"
                ><img class="kanlog-img" src="../assets/img/app/kanlog.png" alt="艦ログロゴ" /><span 
                  class="link-text">{{ kanlogUrl }}</span></a
              >
            </p>
          </section>

          <section class="about-block">
            <h3 class="about-heading">開発者向け</h3>
            <p>甲ブラウザ側の開発者ツールを表示します。</p>
            <p>
              <label class="button-in-about">
                <button @click="openKoubrowserDevTool()" class="button">
                  <AppDevToolImage />
                  甲ブラウザ側開発者ツール表示
                </button>
              </label>
            </p>
          </section>

          <section class="about-block">
            <h3 class="about-heading">ライセンス</h3>
            <p>同梱しているライブラリのライセンスを表示します。</p>
            <p>
              <label class="button-in-about">
                <button @click="openLicenseOverlay()" class="button">
                  <ShowLicenseImage />ライセンス...
                </button>
              </label>
            </p>
          </section>
        </div>
      </div>
    </div>
    <div
      v-if="isLicenseOverlayVisible"
      class="license-overlay"
      role="region"
      aria-labelledby="license-title"
    >
      <div class="license-dialog">
        <h3 id="license-title" class="about-heading">使用コンポーネントとライセンス</h3>
        <div class="license-table-scroll">
          <table class="license-table">
            <thead>
              <tr>
                <th>ライブラリ</th>
                <th>バージョン</th>
                <th>ライセンス</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="license in bundledLicenses" :key="license.name">
                <td>{{ license.name }}</td>
                <td>{{ license.version }}</td>
                <td>{{ license.license }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="license-actions">
          <label class="button-in-about">
            <button @click="closeLicenseOverlay()" class="button">OK</button>
          </label>
        </div>
      </div>
    </div>
  </section>
</template>
