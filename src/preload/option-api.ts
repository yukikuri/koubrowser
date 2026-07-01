import { contextBridge, ipcRenderer } from 'electron'
import { OptionChannel } from '@common/channel'
import { OptionSetting } from '@common/option'
import { type OptionApi } from './option-api-def'

const optionApi: OptionApi = {
  getCurrentSetting(): Promise<OptionSetting> {
    return ipcRenderer.invoke(OptionChannel.getCurrentSetting)
  },
  readyToShow(): void {
    ipcRenderer.invoke(OptionChannel.readyToShow)
  },
  selectCaptureSavePath(): Promise<string | null> {
    return ipcRenderer.invoke(OptionChannel.selectCaptureSavePath)
  },
  minimize(): void {
    ipcRenderer.invoke(OptionChannel.minimize)
  },
  close(): void {
    ipcRenderer.invoke(OptionChannel.close)
  }
}

contextBridge.exposeInMainWorld('optionApi', optionApi)
