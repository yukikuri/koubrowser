export interface OptionApi {
  getCurrentSetting(): Promise<OptionSetting>
  readyToShow(): Promise<void>
  selectCaptureSavePath(): Promise<string | null>
  minimize(): Promise<void>
  close(): Promise<void>
}

declare global {
  interface Window {
    optionApi: OptionApi
  }
}
