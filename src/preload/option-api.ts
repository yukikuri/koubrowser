import { contextBridge, ipcRenderer } from 'electron'
import { OptionChannel } from '@common/channel'
import { type OptionSetting, type OptionData } from '@common/option'
import { type OptionApi } from './option-api-def'

const optionApi: OptionApi = {
  getCurrentSetting(): Promise<OptionData> {
    return ipcRenderer.invoke(OptionChannel.getCurrentSetting)
  },
  readyToShow(): Promise<void> {
    return ipcRenderer.invoke(OptionChannel.readyToShow)
  },
  selectCaptureSavePath(): Promise<string | null> {
    return ipcRenderer.invoke(OptionChannel.selectCaptureSavePath)
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
