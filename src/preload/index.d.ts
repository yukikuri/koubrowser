import { ElectronAPI } from '@electron-toolkit/preload'
import type { Api } from './api'

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
