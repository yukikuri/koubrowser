import { ElectronAPI } from '@electron-toolkit/preload'
import type { Api, GameApi } from './api'

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
    gameApi: GameApi
  }
}
