import type { OptionApi } from './option-api'

declare global {
  interface Window {
    optionApi: OptionApi
  }
}
