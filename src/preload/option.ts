import { contextBridge, ipcRenderer } from 'electron'
import { MainChannel } from '@common/channel'

export interface OptionApi {
  callMain(): Promise<string>
}

const optionApi: OptionApi = {
  callMain(): Promise<string> {
    return ipcRenderer.invoke(MainChannel.option_call_main)
  }
}

contextBridge.exposeInMainWorld('optionApi', optionApi)
