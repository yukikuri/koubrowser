import { SessionStorageKeyName } from '@renderer/store/storage_key';

export function setString(key: SessionStorageKeyName, value: string): void {
  sessionStorage.setItem(key, value)
}

export function getString(key: SessionStorageKeyName): string | null {
  return sessionStorage.getItem(key)
}

// 汎用 JSON 保存／取得
export function setValue(key: SessionStorageKeyName, value: unknown): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function getValue<T = unknown>(key: SessionStorageKeyName): T | null {
  const v = sessionStorage.getItem(key)
  if (v === null) return null
  try {
    return JSON.parse(v) as T
  } catch {
    return null
  }
}

// 便利ラッパー：数値・真偽値
export function setNumber(key: SessionStorageKeyName, value: number): void {
  setValue(key, value)
}

export function getNumber(key: SessionStorageKeyName, fallback?: number): number | null {
  const v = getValue<number>(key)
  if (v === null) return fallback ?? null
  return Number(v)
}

export function setBoolean(key: SessionStorageKeyName, value: boolean): void {
  setValue(key, value)
}

export function getBoolean(key: SessionStorageKeyName, fallback?: boolean): boolean | null {
  const v = getValue<boolean>(key)
  if (v === null) return fallback ?? null
  return Boolean(v)
}
