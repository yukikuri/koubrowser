import { contextBridge, ipcRenderer } from 'electron'
import { OptionChannel } from '@common/channel'

export interface OptionApi {
  callMain(): Promise<string>
  minimize(): void
  close(): void
}

const optionApi: OptionApi = {
  callMain(): Promise<string> {
    return ipcRenderer.invoke(OptionChannel.option_call_main)
  },
  minimize(): void {
    ipcRenderer.invoke(OptionChannel.option_minimize)
  },
  close(): void {
    ipcRenderer.invoke(OptionChannel.option_close)
  }
}

contextBridge.exposeInMainWorld('optionApi', optionApi)
