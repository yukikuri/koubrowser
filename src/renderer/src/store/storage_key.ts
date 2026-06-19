import { EnvRenderer } from "@renderer/common/env-renderer"

export const LocalStorageKeyName = {

  prefix : {
    
    // ui state
    uiStatePrefix: 'uiState:',

    // renderer state
    rendererStatePrefix: 'rendererState:',
  }

} as const
export type LocalStorageKeyPrefix = (typeof LocalStorageKeyName.prefix)[keyof typeof LocalStorageKeyName.prefix]

export  function getLocalStoragePrefixKey(prefix: LocalStorageKeyPrefix): string {
  const subkey = EnvRenderer.isAssist ? 'assist' : 'main'
  return prefix + subkey 
}

export const SessionStorageKeyName = {

  // battle score
  BattleScoreIsForecast: 'battle-score-is-forecast',
  BattleScoreForecastableClears: 'battle-score-forecastable-clears',

  // battle history
  BattleHistoryFilter: 'battle-history-filter-start-date',
  BattleHistoryShowReports: 'battle-history-show-reports',

} as const
export type SessionStorageKeyName = (typeof SessionStorageKeyName)[keyof typeof SessionStorageKeyName]
