import type { OptionApi } from './option'

declare global {
  interface Window {
    optionApi: OptionApi
  }
}
