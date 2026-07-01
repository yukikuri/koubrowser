
// electron default 'system'
export type ProxyMode = 'direct' | 'auto_detect' | 'pac_script' | 'fixed_servers' | 'system';

export interface OptionSetting {

  // capture save path
  captureSavePath: string

  // default capture save path
  defaultCaptureSavePath: string

  // proxy mode, default 'system'
  proxyMode: ProxyMode

  // pac script, default null
  proxyPacScript: string | null

  // proxy fixed servers, default null
  proxyFixedServers: string | null
}

// def or init value
export function defaultOptionSetting(): OptionSetting {
  return {
    captureSavePath: '',
    defaultCaptureSavePath: '',
    proxyMode: 'system',
    proxyPacScript: null,
    proxyFixedServers: null
  }
}
