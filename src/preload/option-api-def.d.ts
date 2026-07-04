export interface OptionApi {
  getCurrentSetting(): Promise<OptionInitialData>
  readyToShow(): Promise<void>
  selectCaptureSavePath(): Promise<string | null>
  minimize(): Promise<void>
  close(): Promise<void>
  saveSetting(setting: OptionSetting): Promise<void>
}

declare global {
  interface Window {
    optionApi: OptionApi
  }
}
