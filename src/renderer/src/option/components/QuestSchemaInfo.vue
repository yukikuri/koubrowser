<script setup lang="ts">
import { t } from '../../i18n'

import { computed } from 'vue'
import type { QuestSchemaMetaV1 } from '@common/kcquest_schema_file'
import { defaultOptionSetting, type QuestSchemaCheckIntervalHours, type QuestSchemaCheckStatus } from '@common/option'

const checkIntervalHours = defineModel<QuestSchemaCheckIntervalHours>('checkIntervalHours', {
  default: defaultOptionSetting().questSchemaCheckIntervalHours
})
const checkNotifyOnly = defineModel<boolean>('checkNotifyOnly', { default: false })

const props = defineProps<{
  meta: Readonly<QuestSchemaMetaV1> | null
  errorMessage?: string | null
  checkStatus?: QuestSchemaCheckStatus
  lastCheckedAt?: string | null
  checkPending?: boolean
  pendingMeta?: Readonly<QuestSchemaMetaV1> | null
}>()

const emit = defineEmits<{ check: []; apply: [] }>()
const checking = computed(() => props.checkPending || props.checkStatus === 'checking')
const statusText = computed(() => {
  if (checking.value) return t('確認中…')
  switch (props.checkStatus) {
    case 'latest': return t('最新です')
    case 'available': return t('更新があります')
    case 'partial': return t('一部未適用')
    case 'older': return t('配信版が古い状態です')
    case 'error': return t('確認・更新失敗')
    default: return ''
  }
})

function formatDate(value: string): string {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return value

  // JST等は出さない
  const timeZoneName = undefined; // 'short'
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    timeZoneName
  }).format(date)
}
const updatedAtText = computed(() => props.meta ? formatDate(props.meta.updatedAt) : '')
</script>

<template>
  <section class="option-section" :aria-label="t('任務データ')">
    <div class="section-title">{{ t('任務データ') }}</div>
    <div class="option-row-description">{{ t(' 任務の達成条件判定に使用するデータの情報や更新データがあるか確認できます。 ') }}</div>
    <p v-if="errorMessage" class="quest-schema-error" role="alert">{{ errorMessage }}</p>
    <dl class="quest-schema-info">
        <dt class="option-row-description" :title="meta ? t('スキーマ形式: v{0}', [meta.schemaVersion]) : undefined">{{ t('リビジョン') }}</dt>
        <dd class="option-row-title quest-schema-revision">
          <span>{{ meta?.revision ?? t('未取得') }}</span>
          <span
            v-if="statusText" class="quest-schema-check-status" :class="{ 'is-latest': checkStatus === 'latest' && !checking }" role="status"
            :title="checkStatus === 'latest' ? t('最終確認時点で、アプリが対応する配信版と一致しています。') : undefined"
          >{{ statusText }}</span>
        </dd>
        <dt class="option-row-description">{{ t('データ更新日時') }}</dt>
        <dd class="option-row-title">
          <time v-if="meta" :datetime="meta.updatedAt">{{ updatedAtText }}</time>
          <span v-else>{{ t('未取得') }}</span>
        </dd>
        <dt class="option-row-description">{{ t('最終確認日時') }}</dt>
        <dd class="option-row-title">
          <time v-if="lastCheckedAt" :datetime="lastCheckedAt">{{ formatDate(lastCheckedAt) }}</time>
          <span v-else>{{ t('未確認') }}</span>
        </dd>
    </dl>
    <div v-if="meta?.questInfos?.length" class="quest-schema-contents">
      <div class="option-row-title">{{ t('含まれる任務') }}</div>
      <ul :aria-label="t('含まれる任務データ')">
        <li v-for="(questInfo, index) in meta.questInfos" :key="`${questInfo.no}-${index}`">
          <span class="option-row-description quest-schema-description">{{ questInfo.info }}</span>
        </li>
      </ul>
    </div>
    <div class="quest-schema-check-action">
      <button class="option-path-button" type="button" :disabled="checking" @click="emit('check')">
        {{ checking ? t('確認中…') : t('今すぐ確認') }}
      </button>
      <button v-if="pendingMeta" class="option-path-button" type="button" :disabled="checking" @click="emit('apply')">{{ t(' 更新を適用 ') }}</button>
    </div>
    <p v-if="pendingMeta" class="option-row-description">{{ t('更新待ちリビジョン：') }}{{ pendingMeta.revision }}</p>
  </section>
  <section class="option-section" :aria-label="t('更新確認の間隔')">
    <div class="section-title">{{ t('更新確認の間隔') }}</div>
    <label class="option-row option-row-vertical">
      <span>
        <span class="option-row-description">{{ t(' 設定した間隔で更新を確認します。なお、任務データはアプリ起動時に最新の状態か確認が行われます。') }}</span>
      </span>
      <select v-model.number="checkIntervalHours" :aria-label="t('任務データの定期的な更新確認')" class="quest-schema-control">
        <option :value="0">{{ t('確認しない（起動時のみ）') }}</option>
        <option :value="1">{{ t('1時間ごと') }}</option>
        <option :value="3">{{ t('3時間ごと') }}</option>
        <option :value="6">{{ t('6時間ごと') }}</option>
        <option :value="12">{{ t('12時間ごと') }}</option>
      </select>
    </label>
    <label class="option-checkbox">
      <input v-model="checkNotifyOnly" type="checkbox" />
      <span class="option-checkbox-body">
        <span class="option-checkbox-title">{{ t('更新を自動適用せず、タイトルバーに通知する') }}</span>
        <span class="option-checkbox-description">{{ t('定期確認で更新が見つかった場合にタイトルバーに「任務データ更新あり」表示を行います。') }}</span>
      </span>
    </label>
  </section>
</template>
