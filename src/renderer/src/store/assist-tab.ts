import { ref } from 'vue'

export type AssistTabName =
  | 'deckport'
  | 'missioncheck'
  | 'battletab'
  | 'shipitems'
  | 'dropbymap'
  | 'dropbyship'
  | 'dockquestlist'
  | 'chart'
  | 'about'

export const assistTabIndex = ref(0)
export const assistTabRequest = ref<AssistTabName | null>(null)

export function requestAssistTab(tabName: AssistTabName): void {
  assistTabRequest.value = tabName
}
