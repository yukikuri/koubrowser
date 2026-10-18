import type { Language } from '@common/i18n'
import type { QuestSchemaMetaV1 } from '@common/kcquest_schema_file'
// electron default 'system'
export type ProxyMode = 'direct' | 'auto_detect' | 'pac_script' | 'fixed_servers' | 'system';

export type QuestSchemaCheckIntervalHours = 0 | 1 | 3 | 6 | 12

/**
 * オプション画面で設定可能な項目
 */
export interface OptionSetting {

  /** Interface language. Applies after restarting; Japanese for older settings. */
  language: Language

  /** 任務データの定期確認間隔（時間）。0は起動時のみ。既定値は6。 */
  questSchemaCheckIntervalHours: QuestSchemaCheckIntervalHours

  /** 定期確認で更新があった際、適用せずタイトルバーに通知する。起動時・手動確認は適用する。既定値：false */
  questSchemaCheckNotifyOnly: boolean

  // capture save path (default: null). When null, use the app's default capture path.
  captureSavePath: string | null

  // proxy mode, default 'system'
  proxyMode: ProxyMode

  // pac script, default null
  proxyPacScript: string | null

  // proxy fixed servers, default null
  proxyFixedServers: string | null

  // unpacked extension information, default empty
  extensions: ExtensionInfo[]

  // taiha singeki block display requirement, default true
  taihaSingekiBlockEnable: boolean

  // taiha singeki block check skip for safe cell, default true
  taihaSingekiBlockSkipSafeCell: boolean
}

/**
 * パッケージ化されていない拡張機能の情報
 */
export interface ExtensionInfo {
  path: string
}

/**
 * オプション画面で設定可能ではなく表示のみの値
 */
export type QuestSchemaCheckStatus = 'idle' | 'checking' | 'latest' | 'partial' | 'older' | 'error' | 'available'

export interface QuestSchemaCheckState {
  questSchemaPendingMeta: Readonly<QuestSchemaMetaV1> | null
  questSchemaMeta: Readonly<QuestSchemaMetaV1> | null
  questSchemaError: string | null
  questSchemaCheckStatus: QuestSchemaCheckStatus
  /** 配信データの解析・比較に成功した日時。取得失敗時は更新しない。 */
  questSchemaLastCheckedAt: string | null
}

export function defaultQuestSchemaCheckState(): QuestSchemaCheckState {
  return {
    questSchemaPendingMeta: null,
    questSchemaMeta: null,
    questSchemaError: null,
    questSchemaCheckStatus: 'idle',
    questSchemaLastCheckedAt: null
  }
}

export interface OptionViewInfo extends QuestSchemaCheckState {

  // default capture save path
  defaultCaptureSavePath: string

}

/**
 * オプション画面に渡す情報
 */
export interface OptionData {
  setting: OptionSetting
  viewInfo: OptionViewInfo
}

// def or init value
export function defaultOptionSetting(): OptionSetting {
  return {
    language: 'ja',
    questSchemaCheckIntervalHours: 6,
    questSchemaCheckNotifyOnly: false,
    captureSavePath: null,
    proxyMode: 'system',
    proxyPacScript: null,
    proxyFixedServers: null,
    extensions: [],
    taihaSingekiBlockEnable: true,
    taihaSingekiBlockSkipSafeCell: true
  }
}

export const NullableStringOptionKeys = [
  'proxyPacScript',
  'proxyFixedServers'
] as const satisfies readonly (keyof OptionSetting)[]

export type NullableStringOptionKey = (typeof NullableStringOptionKeys)[number]
