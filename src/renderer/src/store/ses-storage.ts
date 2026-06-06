export const StorageKeyName = {

  // battle score
  BattleScoreIsForecast: 'battle-score-is-forecast',
  BattleScoreForecastableClears: 'battle-score-forecastable-clears',

  // battle history
  BattleHistoryFilter: 'battle-history-filter-start-date',
  BattleHistoryShowReports: 'battle-history-show-reports',
} as const
export type StorageKeyName = (typeof StorageKeyName)[keyof typeof StorageKeyName]

export function setString(key: StorageKeyName, value: string): void {
  sessionStorage.setItem(key, value)
}

export function getString(key: StorageKeyName): string | null {
  return sessionStorage.getItem(key)
}

// 汎用 JSON 保存／取得
export function setValue(key: StorageKeyName, value: unknown): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function getValue<T = unknown>(key: StorageKeyName): T | null {
  const v = sessionStorage.getItem(key)
  if (v === null) return null
  try {
    return JSON.parse(v) as T
  } catch {
    return null
  }
}

// 便利ラッパー：数値・真偽値
export function setNumber(key: StorageKeyName, value: number): void {
  setValue(key, value)
}

export function getNumber(key: StorageKeyName, fallback?: number): number | null {
  const v = getValue<number>(key)
  if (v === null) return fallback ?? null
  return Number(v)
}

export function setBoolean(key: StorageKeyName, value: boolean): void {
  setValue(key, value)
}

export function getBoolean(key: StorageKeyName, fallback?: boolean): boolean | null {
  const v = getValue<boolean>(key)
  if (v === null) return fallback ?? null
  return Boolean(v)
}
