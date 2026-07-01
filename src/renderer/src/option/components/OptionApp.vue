<script setup lang="ts">
import { computed, ref } from 'vue'
import OptionTitleBar from './OptionTitleBar.vue'
import { optionSetting } from '@option/store/optionSetting'

// 何らかの要因で設定が読み取れないときはエラー状態とし閉じるのみ可能とする
const props = withDefaults(
  defineProps<{
    isError?: boolean
  }>(),
  {
    isError: false
  }
)

type CategoryKey = 'general' | 'network';
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
const captureSavePath = ref(optionSetting.captureSavePath)
const defaultCaptureSavePath = ref(optionSetting.captureSavePath)
const selectCaptureSavePath = (): void => {
  window.optionApi.selectCaptureSavePath().then((path => {
    if (path) {
      captureSavePath.value = path
    }
  }))
}

const resetCaptureSavePath = (): void => {
  captureSavePath.value = defaultCaptureSavePath.value
}

///////////////////////////////////////////////////////////////
// option - proxy
const proxyMode = ref(optionSetting.proxyMode)
const proxyPacScript = ref(optionSetting.proxyPacScript ?? '')
const proxyFixedServers = ref(optionSetting.proxyFixedServers ?? '')

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
                  既定値: <span class="selectable">{{ defaultCaptureSavePath }}</span>
                </span>
              </span>
              <div class="option-path-control">
                <input
                  class="option-path-input"
                  type="text"
                  :value="captureSavePath"
                  readonly
                  aria-label="スクリーンショットと録画の保存先フォルダ"
                  placeholder="保存先フォルダを選択"
                />
                <button class="option-path-button" type="button" @click="selectCaptureSavePath">
                  参照
                </button>
                <button class="option-path-button secondary" type="button" @click="resetCaptureSavePath">
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
                  アプリ内通信に使用するプロキシ設定を指定します。
                </div>
              </div>

              <div class="option-radio-group">
                <label class="option-radio">
                  <input v-model="proxyMode" type="radio" value="system" />
                  <span>システム設定を使用 (規定値)</span>
                </label>

                <label class="option-radio">
                  <input v-model="proxyMode" type="radio" value="direct" />
                  <span>プロキシを使用しない</span>
                </label>

                <label class="option-radio">
                  <input v-model="proxyMode" type="radio" value="auto_detect" />
                  <span>自動検出</span>
                </label>

                <label class="option-radio">
                  <input v-model="proxyMode" type="radio" value="pac_script" />
                  <span>PAC スクリプトを使用</span>
                </label>

                <div class="option-sub-control">
                  <input
                    v-model="proxyPacScript"
                    class="option-text-input"
                    type="url"
                    placeholder="例: http://localhost:8191/proxy.pac"
                    aria-label="PAC スクリプト URL"
                  />
                </div>

                <label class="option-radio">
                  <input v-model="proxyMode" type="radio" value="fixed_servers" />
                  <span>固定プロキシサーバーを使用</span>
                </label>

                <div class="option-sub-control">
                  <input
                    v-model="proxyFixedServers"
                    class="option-text-input"
                    type="text"
                    placeholder="例: http=host:8080;https=host:8080"
                    aria-label="固定プロキシサーバー"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  </div>
</template>
