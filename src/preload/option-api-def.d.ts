export interface OptionApi {
  getCurrentSetting(): Promise<OptionData>
  readyToShow(): Promise<void>
  selectCaptureSavePath(): Promise<string | null>
  selectExtensionPath(): Promise<string | null>
  minimize(): Promise<void>
  close(): Promise<void>
  saveSetting(setting: OptionSetting): Promise<void>
}

declare global {
  interface Window {
    optionApi: OptionApi
  }
}
