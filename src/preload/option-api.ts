import type { Language } from '@common/i18n'
import { contextBridge, ipcRenderer } from 'electron'
import { MainMessage, OptionChannel } from '@common/channel'
import { type OptionSetting, type OptionData, type QuestSchemaCheckState } from '@common/option'
import { type OptionApi } from './option-api-def'

const optionApi: OptionApi = {
  onLanguageChanged(callback): () => void {
    const listener = (_event: Electron.IpcRendererEvent, language: Language): void => callback(language)
    ipcRenderer.on(MainMessage.language_changed, listener)
    return (): void => { ipcRenderer.removeListener(MainMessage.language_changed, listener) }
  },
  applyQuestSchema(): Promise<QuestSchemaCheckState> {
    return ipcRenderer.invoke(OptionChannel.applyQuestSchema)
  },
  checkQuestSchema(): Promise<QuestSchemaCheckState> {
    return ipcRenderer.invoke(OptionChannel.checkQuestSchema)
  },
  getQuestSchemaState(): Promise<QuestSchemaCheckState> {
    return ipcRenderer.invoke(OptionChannel.getQuestSchemaState)
  },
  onQuestSchemaStateChanged(callback): () => void {
    const listener = (_event: Electron.IpcRendererEvent, state: QuestSchemaCheckState): void => callback(state)
    ipcRenderer.on(OptionChannel.questSchemaStateChanged, listener)
    return (): void => { ipcRenderer.removeListener(OptionChannel.questSchemaStateChanged, listener) }
  },
  getCurrentSetting(): Promise<OptionData> {
    return ipcRenderer.invoke(OptionChannel.getCurrentSetting)
  },
  readyToShow(): Promise<void> {
    return ipcRenderer.invoke(OptionChannel.readyToShow)
  },
  selectCaptureSavePath(): Promise<string | null> {
    return ipcRenderer.invoke(OptionChannel.selectCaptureSavePath)
  },
  selectExtensionPath(): Promise<string | null> {
    return ipcRenderer.invoke(OptionChannel.selectExtensionPath)
  },
  minimize(): Promise<void> {
    return ipcRenderer.invoke(OptionChannel.minimize)
  },
  close(): Promise<void> {
    return ipcRenderer.invoke(OptionChannel.close)
  },
  saveSetting(setting: OptionSetting): Promise<void> {
    return ipcRenderer.invoke(OptionChannel.saveSetting, setting)
  }
}

contextBridge.exposeInMainWorld('optionApi', optionApi)
