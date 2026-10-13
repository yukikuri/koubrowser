import { ref } from 'vue'

export const questSchemaUpdateAvailable = ref(false)
export const questSchemaApplying = ref(false)
export const questSchemaApplyError = ref<string | null>(null)

export async function applyQuestSchemaUpdate(): Promise<void> {
  if (questSchemaApplying.value || !questSchemaUpdateAvailable.value) return
  questSchemaApplying.value = true
  questSchemaApplyError.value = null
  try {
    const result = await window.api.applyQuestSchema()
    if (result.questSchemaCheckStatus === 'error') {
      questSchemaApplyError.value = result.questSchemaError ?? '任務データの更新を適用できませんでした。'
    }
    // 更新通知の表示・解除はmainからの状態通知に従う。
  } catch {
    questSchemaApplyError.value = '任務データの更新を適用できませんでした。クリックして再試行してください。'
  } finally {
    questSchemaApplying.value = false
  }
}
