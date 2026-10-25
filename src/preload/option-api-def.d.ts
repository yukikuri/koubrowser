import type { Language } from '@common/i18n'
import type { OptionData, OptionSetting, QuestSchemaCheckState } from '@common/option'

export interface OptionApi {
  onLanguageChanged(callback: (language: Language) => void): () => void
  checkQuestSchema(): Promise<QuestSchemaCheckState>
  applyQuestSchema(): Promise<QuestSchemaCheckState>
  getQuestSchemaState(): Promise<QuestSchemaCheckState>
  onQuestSchemaStateChanged(callback: (state: QuestSchemaCheckState) => void): () => void
  getCurrentSetting(): Promise<OptionData>
  readyToShow(): Promise<void>
  selectCaptureSavePath(): Promise<string | null>
  selectExtensionPath(): Promise<string | null>
  minimize(): Promise<void>
  close(): Promise<void>
  saveSetting(setting: OptionSetting): Promise<void>
}

declare global {
  interface Window {
    optionApi: OptionApi
  }
}
