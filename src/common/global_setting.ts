export interface GlobalSetting {
  /**
   * 起動時にアプリ更新チェックを確認するか
   * デフォルトはtrue
   */
  checkUpdateOnStartup: boolean
  /**
   * Beta版(開発版)を更新チェック対象に含めるか
   * デフォルトはfalse
   */
  checkBetaUpdate: boolean
  /**
   * ドロップ情報を提供するか
   * デフォルトはtrue
   */
  enableIntake: boolean
}

export function defaultGlobalSetting(): GlobalSetting {
  return {
    checkUpdateOnStartup: true,
    checkBetaUpdate: false,
    enableIntake: true,
  }
}
