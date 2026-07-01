export interface OptionApi {
  getCurrentSetting(): Promise<OptionSetting>
  readyToShow(): void
  selectCaptureSavePath(): Promise<string | null>
  minimize(): void
  close(): void
}

declare global {
  interface Window {
    optionApi: OptionApi
  }
}
