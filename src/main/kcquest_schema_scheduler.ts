import { Env } from '@common/env'
import { defaultOptionSetting, type QuestSchemaCheckIntervalHours } from '@common/option'

/** 間隔変更時のみタイマーを更新する。取得処理の重複はupdater側で防ぐ。 */
export class QuestSchemaScheduler {
  private timer: ReturnType<typeof setInterval> | undefined
  private interval: QuestSchemaCheckIntervalHours | undefined
  private disposed = false

  constructor(private readonly check: () => void) {}

  configure(hours: QuestSchemaCheckIntervalHours): void {
    if (this.disposed) return
    // 設定ファイルを直接編集した場合も、不正値による短周期の通信を避ける。
    const interval = [0, 1, 3, 6, 12].includes(hours)
      ? hours : defaultOptionSetting().questSchemaCheckIntervalHours
    if (this.interval === interval) return
    this.interval = interval
    clearInterval(this.timer)
    this.timer = undefined
    if (interval > 0) {
      // 開発時は、設定上の1時間を30秒として動作確認する
      const intervalUnitMs = Env.isDevelopment
        ? 30 * 1000
        : 60 * 60 * 1000
      this.timer = setInterval(this.check, interval * intervalUnitMs)
    }
  }

  dispose(): void {
    this.disposed = true
    clearInterval(this.timer)
    this.timer = undefined
  }
}
