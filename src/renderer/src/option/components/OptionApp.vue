<script setup lang="ts">
import { t } from '../../i18n'

import { computed, nextTick, onMounted, onUnmounted, ref, watch, WritableComputedRef } from 'vue'
import OptionTitleBar from './OptionTitleBar.vue'
import QuestSchemaInfo from './QuestSchemaInfo.vue'
import { optionSetting, optionViewInfo, setQuestSchemaCheckState } from '@option/store/optionSetting'
import type { NullableStringOptionKey } from '@common/option'

// 何らかの要因で設定が読み取れないときはエラー状態とし閉じるのみ可能とする
const props = withDefaults(
  defineProps<{
    isError?: boolean
  }>(),
  {
    isError: false
  }
)

type CategoryKey = 'general' | 'quest' | 'network' | 'extension';
interface CategoryInfo {
  readonly key: CategoryKey
  readonly title: string
  readonly description: string
}

const categories: CategoryInfo[] = [
  {
    key: 'general',
    title: t('一般'),
    description: t('基本的な動作に関する設定')
  },
  {
    key: 'quest',
    title: t('任務データ'),
    description: t('任務データに関する設定')
  },
  {
    key: 'network',
    title: t('通信設定'),
    description: t('プロキシや通信動作に関する設定')
  },
  {
    key: 'extension',
    title: t('拡張機能'),
    description: t('拡張機能に関する設定')
  },
  // {
  //   key: 'assist',
  //   title: 'アシスト',
  //   description: 'ゲーム内アシスト表示とアシストウインドウに関する設定'
  // },
  // {
  //   key: 'record',
  //   title: '記録',
  //   description: 'スクリーンショット、録画、ローカル記録に関する設定'
  // }
]

///////////////////////////////////////////////////////////////
// option stuff
const selectedCategoryKey = ref<CategoryKey>('general')
const currentCategory = computed(
  () => categories.find((category) => category.key === selectedCategoryKey.value) ?? categories[0]
)

const isCurrentCategory = (key: CategoryKey): boolean => {
  return selectedCategoryKey.value === key
}

const close = (): void => {
  window.optionApi.close()
}

const questCheckPending = ref(false)
let stopQuestSchemaListener: (() => void) | undefined
let disposed = false

onMounted(async () => {
  if (props.isError) return
  let receivedState = false
  stopQuestSchemaListener = window.optionApi.onQuestSchemaStateChanged((state) => {
    receivedState = true
    setQuestSchemaCheckState(state)
  })
  try {
    const state = await window.optionApi.getQuestSchemaState()
    // 初期情報取得中に届いた新しい通知を、古いスナップショットで上書きしない。
    if (!disposed && !receivedState) setQuestSchemaCheckState(state)
  } catch {
    if (!disposed && !receivedState) {
      optionViewInfo.questSchemaCheckStatus = 'error'
      optionViewInfo.questSchemaError = t('任務データの確認状態を取得できませんでした。')
    }
  }
})

onUnmounted(() => {
  disposed = true
  stopQuestSchemaListener?.()
})

async function checkQuestSchemaNow(applyPending = false): Promise<void> {
  if (questCheckPending.value || optionViewInfo.questSchemaCheckStatus === 'checking') return
  questCheckPending.value = true
  try {
    // 確認結果は状態通知で反映する。起動時確認の結果も同じ経路で受け取る。
    if (applyPending) await window.optionApi.applyQuestSchema()
    else await window.optionApi.checkQuestSchema()
  } catch {
    if (!disposed) {
      optionViewInfo.questSchemaCheckStatus = 'error'
      optionViewInfo.questSchemaError = t('任務データの更新確認を要求できませんでした。')
    }
  } finally {
    questCheckPending.value = false
  }
}

///////////////////////////////////////////////////////////////
// option - path
const selectCaptureSavePath = (): void => {
  window.optionApi.selectCaptureSavePath().then((path => {
    if (path) {
      optionSetting.captureSavePath = path
    }
  }))
}

const resetCaptureSavePath = (): void => {
  optionSetting.captureSavePath = null
}

const isCaptureSavePathDefault = computed(() => {
  return ! optionSetting.captureSavePath
})

///////////////////////////////////////////////////////////////
// option - extension
const extensionPath = computed(() => optionSetting.extensions[0]?.path ?? '')

const selectExtensionPath = (): void => {
  window.optionApi.selectExtensionPath().then((path => {
    if (path) {
      optionSetting.extensions = [{ path }]
    }
  }))
}

const resetExtensionPath = (): void => {
  optionSetting.extensions = []
}

const isExtensionPathDefault = computed(() => {
  return optionSetting.extensions.length === 0
})

///////////////////////////////////////////////////////////////
// option - proxy
function nullableStringInput(key: NullableStringOptionKey): WritableComputedRef<string> {
  return computed({
    get: () => optionSetting[key] ?? '',
    set: (value: string) => {
      const trimmed = value.trim()
      optionSetting[key] = trimmed === '' ? null : trimmed
    }
  })
}
const proxyPacScriptInput = nullableStringInput('proxyPacScript')
const proxyFixedServersInput = nullableStringInput('proxyFixedServers')
const proxyPacScriptInputRef = ref<HTMLInputElement | null>(null)
const proxyFixedServersInputRef = ref<HTMLInputElement | null>(null)

watch(
  () => optionSetting.proxyMode,
  async (mode) => {
    await nextTick()

    if (mode === 'pac_script') {
      proxyPacScriptInputRef.value?.focus()
    } else if (mode === 'fixed_servers') {
      proxyFixedServersInputRef.value?.focus()
    }
  }
)

const hasProxyPacScriptInput = ref(Boolean(optionSetting.proxyPacScript))
const hasProxyFixedServersInput = ref(Boolean(optionSetting.proxyFixedServers))

const onProxyPacScriptInput = (event: Event): void => {
  hasProxyPacScriptInput.value = (event.target as HTMLInputElement).value !== ''
}

const clearProxyPacScriptInput = (): void => {
  optionSetting.proxyPacScript = null
  hasProxyPacScriptInput.value = false
}

const onProxyFixedServersInput = (event: Event): void => {
  hasProxyFixedServersInput.value = (event.target as HTMLInputElement).value !== ''
}

const clearProxyFixedServersInput = (): void => {
  optionSetting.proxyFixedServers = null
  hasProxyFixedServersInput.value = false
}

</script>

<template>
  <div class="option-window">
    <OptionTitleBar />

    <div v-if="props.isError" class="option-error-overlay" role="alertdialog" aria-modal="true">
      <div class="option-error-dialog">
        <div class="option-error-title">{{ t('設定を読み込めませんでした') }}</div>
        <div class="option-error-message">{{ t(' 設定情報の取得中にエラーが発生しました。設定画面を閉じてから、もう一度開いてください。 ') }}</div>
        <button class="option-error-close-button" type="button" @click="close">{{ t(' 閉じる ') }}</button>
      </div>
    </div>

    <main class="option-shell" :class="{ 'is-error': props.isError }">
      <aside class="option-sidebar" :aria-label="t('設定カテゴリ')">
        <div class="option-brand">
          <div class="option-title">{{ t('甲ブラウザ 設定') }}</div>
        </div>
        <nav class="option-categories">
          <button
            v-for="category in categories"
            :key="category.key"
            class="option-category"
            :class="{ 'is-active': selectedCategoryKey === category.key }"
            type="button"
            @click="selectedCategoryKey = category.key"
          >
            {{ category.title }}
            <span
              v-if="category.key === 'quest' && optionViewInfo.questSchemaError"
              class="quest-schema-error-dot"
              role="img"
              :aria-label="t('任務データにエラーがあります')"
              :title="optionViewInfo.questSchemaError"
            />
          </button>
        </nav>
      </aside>

      <section class="option-content">
        <header class="option-content-header">
          <div>
            <span class="header-text">{{ currentCategory.title }}</span>
            <span class="header-desc-text">{{ currentCategory.description }}</span>
          </div>
        </header>

        <div class="option-panel">
          
          <!-- 一般 -->
          <section v-if="isCurrentCategory('general')" class="option-section">
            <div class="section-title">{{ t('保存パス') }}</div>
            <div class="option-row option-row-vertical">
              <span>
                <span class="option-row-title">{{ t('スクリーンショット・録画保存フォルダ') }}</span>
                <span class="option-row-description">{{ t('スクリーンショットと録画の保存先フォルダを指定します。') }}</span>
                <span class="option-row-subdescription">{{ t(' 既定値: ') }}<span class="selectable">{{ optionViewInfo.defaultCaptureSavePath }}</span>
                </span>
              </span>
              <div class="option-path-control">
                <input
                  class="option-path-input"
                  type="text"
                  :value="optionSetting.captureSavePath ?? ''"
                  readonly
                  :aria-label="t('スクリーンショットと録画の保存先フォルダ')"
                  :placeholder="t('保存先フォルダを選択')"
                />
                <button class="option-path-button" type="button" @click="selectCaptureSavePath">{{ t(' 参照 ') }}</button>
                <button 
                  class="option-path-button secondary" 
                  type="button" 
                  :disabled="isCaptureSavePathDefault"
                  @click="resetCaptureSavePath">{{ t(' 既定値に戻す ') }}</button>
              </div>
            </div>

            <div class="section-title">{{ t('大破進撃防止') }}</div>
            <div class="option-row option-row-vertical">
              <label class="option-checkbox option-checkbox-with-description">
                <input v-model="optionSetting.taihaSingekiBlockEnable" type="checkbox" />

                <span class="option-checkbox-body">
                  <span class="option-checkbox-title">{{ t('大破進撃防止機能を有効にする') }}</span>
                  <span class="option-checkbox-description">{{ t(' 大破艦を検知すると、轟沈防止のため進撃操作をボタン上シールドで制限します。') }}<br>{{ t(' Ctrl+クリック、またはシールド表示OFFで操作できます。 ') }}</span>
                </span>
              </label>

              <label class="option-checkbox option-checkbox-with-description option-sub-checkbox">
                <input
                  v-model="optionSetting.taihaSingekiBlockSkipSafeCell"
                  type="checkbox"
                  :disabled="!optionSetting.taihaSingekiBlockEnable"
                />

                <span class="option-checkbox-body">
                  <span class="option-checkbox-title">{{ t('一部の安全マスではチェックしない') }}</span>
                  <span class="option-checkbox-description">{{ t(' 大破進撃扱いにならないことが確認できているマスでは、警告とシールドを表示しません。') }}<br>{{ t(' 対象は以下です。') }}<br>
                    <br>{{ t(' ・1-6.鎮守府近海航路 Bマス') }}<br>{{ t(' ・2-2.バシー海峡 Bマス') }}<br>{{ t(' ・3-1.モーレイ海 Bマス') }}<br>{{ t(' ・3-2.キス島沖 Aマス') }}<br>{{ t(' ・7-2.タウイタウイ泊地沖 Jマス') }}<br>{{ t(' ・5-6.ラバウル方面海域 Hマス ') }}</span>
                </span>
              </label>
            </div>

            <div class="section-title">{{ t('言語') }}</div>
            <div class="option-row option-row-vertical">
              <label class="option-row-title" for="interface-language">{{ t('表示言語') }}</label>
              <select id="interface-language" v-model="optionSetting.language" class="option-text-input">
                <option value="ja">{{ t('日本語') }}</option>
                <option value="ko">한국어</option>
              </select>
              <span class="option-row-description">{{ t('変更は甲ブラウザ再起動後に反映されます。') }}</span>
            </div>
          </section>

          <!-- 任務データ -->
          <QuestSchemaInfo
            v-if="isCurrentCategory('quest')"
            v-model:check-interval-hours="optionSetting.questSchemaCheckIntervalHours"
            v-model:check-notify-only="optionSetting.questSchemaCheckNotifyOnly"
            :meta="optionViewInfo.questSchemaMeta"
            :error-message="optionViewInfo.questSchemaError"
            :check-status="optionViewInfo.questSchemaCheckStatus"
            :last-checked-at="optionViewInfo.questSchemaLastCheckedAt"
            :check-pending="questCheckPending"
            :pending-meta="optionViewInfo.questSchemaPendingMeta"
            @check="checkQuestSchemaNow()"
            @apply="checkQuestSchemaNow(true)"
          />

          <!-- 通信設定 -->
          <section v-if="isCurrentCategory('network')" class="option-section">
            <div class="section-title">{{ t('プロキシ設定') }}</div>

            <div class="option-row option-row-vertical">
              <div>
                <div class="option-row-title">{{ t('プロキシの使用方法') }}</div>
                <div class="option-row-description">{{ t(' アプリ内通信に使用するプロキシ設定を指定します。変更は甲ブラウザ再起動後に反映されます。 ') }}</div>
              </div>

              <div class="option-radio-group">
                <label class="option-radio">
                  <input v-model="optionSetting.proxyMode" type="radio" value="system" />
                  <span>{{ t('システム設定を使用 (規定値)') }}</span>
                </label>

                <label class="option-radio">
                  <input v-model="optionSetting.proxyMode" type="radio" value="direct" />
                  <span>{{ t('プロキシを使用しない') }}</span>
                </label>

                <label class="option-radio">
                  <input v-model="optionSetting.proxyMode" type="radio" value="auto_detect" />
                  <span>{{ t('自動検出') }}</span>
                </label>

                <label class="option-radio option-radio-with-description">
                  <input v-model="optionSetting.proxyMode" type="radio" value="pac_script" />

                  <span class="option-radio-body">
                    <span class="option-radio-title">{{ t('PAC スクリプトを使用') }}</span>
                    <span class="option-radio-description">
                      <span>{{ t('サポートプロトコル: http, https, data 未サポートプロトコル: file') }}</span>
                    </span>
                    <span class="option-radio-description">{{ t(' 設定例(http): ') }}<span class="selectable">http://localhost:8080/proxy.pac</span>
                    </span>
                    <span class="option-radio-description">{{ t(' 設定例(data): ') }}<span class="selectable">data:application/x-ns-proxy-autoconfig,xxxxx</span>
                    </span>
                  </span>

                </label>

                <div class="option-input-clearable">
                  <input
                    ref="proxyPacScriptInputRef"
                    v-model.lazy="proxyPacScriptInput"
                    class="option-text-input"
                    type="url"
                    :placeholder="t('例: http://localhost:8080/proxy.pac')"
                    :aria-label="t('PAC スクリプト URL')"
                    :disabled="optionSetting.proxyMode !== 'pac_script'"
                    @input="onProxyPacScriptInput"
                  />
                  <button
                    v-if="hasProxyPacScriptInput"
                    class="option-input-clear-button"
                    type="button"
                    :aria-label="t('PAC スクリプト URL をクリア')"
                    @click="clearProxyPacScriptInput"
                  >&#10005;</button>
                </div>

                <label class="option-radio option-radio-with-description">
                  <input v-model="optionSetting.proxyMode" type="radio" value="fixed_servers" />

                  <span class="option-radio-body">
                    <span class="option-radio-title">{{ t('固定プロキシサーバーを使用') }}</span>
                    <span class="option-radio-description">{{ t(' 設定例: ') }}<span class="selectable">http=localhost:40620;https=localhost:40620</span>
                    </span>
                  </span>
                </label>

                <div class="option-input-clearable">
                  <input
                    ref="proxyFixedServersInputRef"
                    v-model.lazy="proxyFixedServersInput"
                    class="option-text-input"
                    type="text"
                    :placeholder="t('例: http=localhost:40620;https=localhost:40620')"
                    :aria-label="t('固定プロキシサーバー')"
                    :disabled="optionSetting.proxyMode !== 'fixed_servers'"
                    @input="onProxyFixedServersInput"
                  />
                  <button
                    v-if="hasProxyFixedServersInput"
                    class="option-input-clear-button"
                    type="button"
                    :aria-label="t('固定プロキシサーバーをクリア')"
                    @click="clearProxyFixedServersInput"
                  >&#10005;</button>
                </div>
              </div>
            </div>
          </section>

          <!-- 拡張機能 -->
          <section v-if="isCurrentCategory('extension')" class="option-section">
            <div class="section-title">{{ t('読み込み設定') }}</div>
            <div class="option-row option-row-vertical">
              <span>
                <span class="option-row-title">{{ t('拡張機能フォルダ') }}</span>
                <span class="option-row-description">{{ t(' 読み込むパッケージ化されていない拡張機能のフォルダを指定します。変更は甲ブラウザ再起動後に反映されます。 ') }}</span>
                <span class="option-row-description">{{ t(' 信頼できる拡張機能のみを指定してください。拡張機能によってはWeb表示や通信内容を監視・変更できる可能性があるため、ゲーム通信へ影響する拡張機能は使用しないでください。 ') }}</span>
              </span>
              <div class="option-path-control">
                <input
                  class="option-path-input"
                  type="text"
                  :value="extensionPath"
                  readonly
                  :aria-label="t('読み込む拡張機能フォルダ')"
                  :placeholder="t('拡張機能フォルダを選択')"
                />
                <button class="option-path-button" type="button" @click="selectExtensionPath">{{ t(' 参照 ') }}</button>
                <button 
                  class="option-path-button secondary"
                  type="button"
                  :disabled="isExtensionPathDefault"
                  @click="resetExtensionPath">{{ t(' クリア ', [], 'input') }}</button>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.quest-schema-error-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-left: 8px;
  border-radius: 50%;
  background-color: #ef4444;
  vertical-align: middle;
}
</style>
