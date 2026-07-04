
// electron default 'system'
export type ProxyMode = 'direct' | 'auto_detect' | 'pac_script' | 'fixed_servers' | 'system';

/**
 * オプション画面で設定可能な項目
 */
export interface OptionSetting {

  // capture save path (default: null). When null, use the app's default capture path.
  captureSavePath: string | null

  // proxy mode, default 'system'
  proxyMode: ProxyMode

  // pac script, default null
  proxyPacScript: string | null

  // proxy fixed servers, default null
  proxyFixedServers: string | null
}

/**
 * オプション画面で設定可能ではなく表示のみの値
 */
export interface OptionViewInfo {

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
    captureSavePath: null,
    proxyMode: 'system',
    proxyPacScript: null,
    proxyFixedServers: null
  }
}

export const NullableStringOptionKeys = [
  'proxyPacScript',
  'proxyFixedServers'
] as const satisfies readonly (keyof OptionSetting)[]

export type NullableStringOptionKey = (typeof NullableStringOptionKeys)[number]
