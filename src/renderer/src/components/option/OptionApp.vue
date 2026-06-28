<script setup lang="ts">
import { computed, ref } from 'vue'

interface CategoryInfo {
  readonly key: string
  readonly title: string
  readonly description: string
}

const categories: CategoryInfo[] = [
  {
    key: 'general',
    title: '一般',
    description: '基本的な動作に関する設定です。'
  },
  {
    key: 'window',
    title: 'ウインドウ',
    description: 'メインウインドウと別ウインドウの表示に関する設定です。'
  },
  {
    key: 'assist',
    title: 'アシスト',
    description: 'ゲーム内アシスト表示とアシストウインドウに関する設定です。'
  },
  {
    key: 'record',
    title: '記録',
    description: 'スクリーンショット、録画、ローカル記録に関する設定です。'
  }
]

const selectedCategoryKey = ref('general')
const callMainResult = ref('未実行')
const currentCategory = computed(
  () => categories.find((category) => category.key === selectedCategoryKey.value) ?? categories[0]
)

const callMain = async (): Promise<void> => {
  callMainResult.value = '実行中...'
  try {
    callMainResult.value = await window.optionApi.callMain()
  } catch {
    callMainResult.value = '呼び出しに失敗しました。'
  }
}
</script>

<template>
  <main class="option-shell">
    <aside class="option-sidebar" aria-label="設定カテゴリ">
      <div class="option-brand">
        <div class="option-title">設定</div>
        <div class="option-subtitle">甲ブラウザ</div>
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
          <h1>{{ currentCategory.title }}</h1>
          <p>{{ currentCategory.description }}</p>
        </div>
        <button class="option-save-button" type="button" disabled>保存</button>
      </header>

      <div class="option-panel">
        <section class="option-section">
          <h2>表示</h2>
          <label class="option-row">
            <span>
              <span class="option-row-title">起動時の表示状態</span>
              <span class="option-row-description">前回終了時の状態を復元します。</span>
            </span>
            <select disabled>
              <option>前回の状態</option>
            </select>
          </label>
          <label class="option-row">
            <span>
              <span class="option-row-title">常に最前面</span>
              <span class="option-row-description">
                メインウインドウを他のウインドウより前に表示します。
              </span>
            </span>
            <input type="checkbox" disabled />
          </label>
        </section>

        <section class="option-section">
          <h2>通知</h2>
          <label class="option-row">
            <span>
              <span class="option-row-title">更新通知</span>
              <span class="option-row-description">利用可能な更新を起動時に確認します。</span>
            </span>
            <input type="checkbox" checked disabled />
          </label>
        </section>

        <section class="option-section">
          <h2>接続テスト</h2>
          <div class="option-row">
            <span>
              <span class="option-row-title">main process 呼び出し</span>
              <span class="option-row-description">{{ callMainResult }}</span>
            </span>
            <button class="option-test-button" type="button" @click="callMain">
              実行
            </button>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>
