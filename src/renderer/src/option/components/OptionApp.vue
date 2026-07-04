<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import OptionTitleBar from './OptionTitleBar.vue'
import { optionSetting, optionViewInfo } from '@option/store/optionSetting'
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

type CategoryKey = 'general' | 'network' | 'extension';
interface CategoryInfo {
  readonly key: CategoryKey
  readonly title: string
  readonly description: string
}

const categories: CategoryInfo[] = [
  {
    key: 'general',
    title: '一般',
    description: '基本的な動作に関する設定'
  },
  {
    key: 'network',
    title: '通信設定',
    description: 'プロキシや通信動作に関する設定'
  },
  {
    key: 'extension',
    title: '拡張機能',
    description: '拡張機能に関する設定'
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
function nullableStringInput(key: NullableStringOptionKey) {
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
        <div class="option-error-title">設定を読み込めませんでした</div>
        <div class="option-error-message">
          設定情報の取得中にエラーが発生しました。設定画面を閉じてから、もう一度開いてください。
        </div>
        <button class="option-error-close-button" type="button" @click="close">
          閉じる
        </button>
      </div>
    </div>

    <main class="option-shell" :class="{ 'is-error': props.isError }">
      <aside class="option-sidebar" aria-label="設定カテゴリ">
        <div class="option-brand">
          <div class="option-title">甲ブラウザ 設定</div>
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
            <div class="section-title">保存パス</div>
            <div class="option-row option-row-vertical">
              <span>
                <span class="option-row-title">スクリーンショット・録画保存フォルダ</span>
                <span class="option-row-description">スクリーンショットと録画の保存先フォルダを指定します。</span>
                <span class="option-row-subdescription">
                  既定値: <span class="selectable">{{ optionViewInfo.defaultCaptureSavePath }}</span>
                </span>
              </span>
              <div class="option-path-control">
                <input
                  class="option-path-input"
                  type="text"
                  :value="optionSetting.captureSavePath ?? ''"
                  readonly
                  aria-label="スクリーンショットと録画の保存先フォルダ"
                  placeholder="保存先フォルダを選択"
                />
                <button class="option-path-button" type="button" @click="selectCaptureSavePath">
                  参照
                </button>
                <button class="option-path-button secondary" 
                  type="button" 
                  :disabled="isCaptureSavePathDefault"
                  @click="resetCaptureSavePath">
                  既定値に戻す
                </button>
              </div>
            </div>
          </section>

          <!-- 通信設定 -->
          <section v-if="isCurrentCategory('network')" class="option-section">
            <div class="section-title">プロキシ設定</div>

            <div class="option-row option-row-vertical">
              <div>
                <div class="option-row-title">プロキシの使用方法</div>
                <div class="option-row-description">
                  アプリ内通信に使用するプロキシ設定を指定します。変更は甲ブラウザ再起動後に反映されます。
                </div>
              </div>

              <div class="option-radio-group">
                <label class="option-radio">
                  <input v-model="optionSetting.proxyMode" type="radio" value="system" />
                  <span>システム設定を使用 (規定値)</span>
                </label>

                <label class="option-radio">
                  <input v-model="optionSetting.proxyMode" type="radio" value="direct" />
                  <span>プロキシを使用しない</span>
                </label>

                <label class="option-radio">
                  <input v-model="optionSetting.proxyMode" type="radio" value="auto_detect" />
                  <span>自動検出</span>
                </label>

                <label class="option-radio option-radio-with-description">
                  <input v-model="optionSetting.proxyMode" type="radio" value="pac_script" />

                  <span class="option-radio-body">
                    <span class="option-radio-title">PAC スクリプトを使用</span>
                    <span class="option-radio-description">
                      <span>サポートプロトコル: http, https, data 未サポートプロトコル: file</span>
                    </span>
                    <span class="option-radio-description">
                      設定例(http): <span class="selectable">http://localhost:8080/proxy.pac</span>
                    </span>
                    <span class="option-radio-description">
                      設定例(data): <span class="selectable">data:application/x-ns-proxy-autoconfig,xxxxx</span>
                    </span>
                  </span>

                </label>

                <div class="option-input-clearable">
                  <input
                    ref="proxyPacScriptInputRef"
                    v-model.lazy="proxyPacScriptInput"
                    class="option-text-input"
                    type="url"
                    placeholder="例: http://localhost:8080/proxy.pac"
                    aria-label="PAC スクリプト URL"
                    :disabled="optionSetting.proxyMode !== 'pac_script'"
                    @input="onProxyPacScriptInput"
                  />
                  <button
                    v-if="hasProxyPacScriptInput"
                    class="option-input-clear-button"
                    type="button"
                    aria-label="PAC スクリプト URL をクリア"
                    @click="clearProxyPacScriptInput"
                  >&#10005;</button>
                </div>

                <label class="option-radio option-radio-with-description">
                  <input v-model="optionSetting.proxyMode" type="radio" value="fixed_servers" />

                  <span class="option-radio-body">
                    <span class="option-radio-title">固定プロキシサーバーを使用</span>
                    <span class="option-radio-description">
                      設定例: <span class="selectable">http=localhost:40620;https=localhost:40620</span>
                    </span>
                  </span>
                </label>

                <div class="option-input-clearable">
                  <input
                    ref="proxyFixedServersInputRef"
                    v-model.lazy="proxyFixedServersInput"
                    class="option-text-input"
                    type="text"
                    placeholder="例: http=localhost:40620;https=localhost:40620"
                    aria-label="固定プロキシサーバー"
                    :disabled="optionSetting.proxyMode !== 'fixed_servers'"
                    @input="onProxyFixedServersInput"
                  />
                  <button
                    v-if="hasProxyFixedServersInput"
                    class="option-input-clear-button"
                    type="button"
                    aria-label="固定プロキシサーバーをクリア"
                    @click="clearProxyFixedServersInput"
                  >&#10005;</button>
                </div>
              </div>
            </div>
          </section>

          <!-- 拡張機能 -->
          <section v-if="isCurrentCategory('extension')" class="option-section">
            <div class="section-title">読み込み設定</div>
            <div class="option-row option-row-vertical">
              <span>
                <span class="option-row-title">拡張機能フォルダ</span>
                <span class="option-row-description">
                  読み込むパッケージ化されていない拡張機能のフォルダを指定します。変更は甲ブラウザ再起動後に反映されます。
                </span>
                <span class="option-row-description">
                  信頼できる拡張機能のみを指定してください。拡張機能によってはWeb表示や通信内容を監視・変更できる可能性があるため、ゲーム通信へ影響する拡張機能は使用しないでください。
                </span>
              </span>
              <div class="option-path-control">
                <input
                  class="option-path-input"
                  type="text"
                  :value="extensionPath"
                  readonly
                  aria-label="読み込む拡張機能フォルダ"
                  placeholder="拡張機能フォルダを選択"
                />
                <button class="option-path-button" type="button" @click="selectExtensionPath">
                  参照
                </button>
                <button class="option-path-button secondary"
                  type="button"
                  :disabled="isExtensionPathDefault"
                  @click="resetExtensionPath">
                  クリア
                </button>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  </div>
</template>
