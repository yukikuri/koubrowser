interface OptionApi {
  callMain(): Promise<string>
  minimize(): void
  close(): void
}

declare global {
  interface Window {
    optionApi: OptionApi
  }
}

export {}
