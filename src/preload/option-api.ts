import { contextBridge, ipcRenderer } from 'electron'
import { MainChannel } from '@common/channel'

export interface OptionApi {
  callMain(): Promise<string>
  minimize(): void
  close(): void
}

const optionApi: OptionApi = {
  callMain(): Promise<string> {
    return ipcRenderer.invoke(MainChannel.option_call_main)
  },
  minimize(): void {
    ipcRenderer.invoke(MainChannel.option_minimize)
  },
  close(): void {
    ipcRenderer.invoke(MainChannel.option_close)
  }
}

contextBridge.exposeInMainWorld('optionApi', optionApi)
