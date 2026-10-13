import { defaultQuestSchemaCheckState, type QuestSchemaCheckState } from '@common/option'
import { QuestSchemaHolder } from '@common/kcquest_schema_holder'
import { loadQuestSchemaJson, type LoadedQuestSchema } from '@common/kcquest_schema_loader'
import type { FetchQuestSchemaResult } from './kcquest_schema_fetcher'

interface QuestSchemaUpdaterDependencies {
  fetch(): Promise<FetchQuestSchemaResult>
  save(json: string): void
  register(quests: LoadedQuestSchema[]): void
  didApply(json: string): void
  notify(state: QuestSchemaCheckState): void
}

/** 起動時・手動確認を共用する。定期実行や保存先の決定は行わない。 */
export class QuestSchemaUpdater {
  private state = defaultQuestSchemaCheckState()
  private task: Promise<QuestSchemaCheckState> | null = null
  private pending: { jsonText: string; schemas: Extract<ReturnType<typeof loadQuestSchemaJson>, { success: true }> } | null = null
  private applyRequested = false

  constructor(private readonly dependencies: QuestSchemaUpdaterDependencies) {}

  getState(): QuestSchemaCheckState {
    return {
      ...this.state,
      questSchemaPendingMeta: this.pending ? structuredClone(this.pending.schemas.meta) : null,
      questSchemaMeta: QuestSchemaHolder.getMeta(),
      questSchemaError: QuestSchemaHolder.getError()
    }
  }

  check(notifyOnly = false): Promise<QuestSchemaCheckState> {
    // 手動確認が定期確認に重なった場合も、手動の適用要求を維持する。
    if (!notifyOnly) this.applyRequested = true
    if (this.task) return this.task
    this.applyRequested = !notifyOnly

    return this.execute(() => this.fetchAndApply())
  }

  applyPending(): Promise<QuestSchemaCheckState> {
    if (this.task) return this.task.then(() => this.applyPending())
    if (!this.pending) return Promise.resolve(this.getState())
    return this.execute(async () => {
      if (this.pending) this.apply(this.pending)
    })
  }

  private execute(operation: () => Promise<void>): Promise<QuestSchemaCheckState> {

    this.state.questSchemaCheckStatus = 'checking'
    // 取得から適用完了までを共有し、状態通知中の再入にも二重取得させない。
    this.task = Promise.resolve().then(() => this.run(operation)).finally(() => {
      this.task = null
      this.dependencies.notify(this.getState())
    })
    this.dependencies.notify(this.getState())
    return this.task
  }

  private fail(message: string): void {
    this.state.questSchemaCheckStatus = 'error'
    QuestSchemaHolder.setError(message)
  }

  private async run(operation: () => Promise<void>): Promise<QuestSchemaCheckState> {
    try {
      await operation()
    } catch {
      this.fail('任務データの更新処理に失敗しました。')
    }
    return this.getState()
  }

  private async fetchAndApply(): Promise<void> {
    const result = await this.dependencies.fetch()
    if (!result.success) {
      this.fail('任務データを取得できませんでした。現在の定義を使用します。')
      return
    }

    const schemas = loadQuestSchemaJson(result.jsonText)
    if (!schemas.success) {
      this.fail('取得した任務データの形式を確認できませんでした。')
      return
    }
    this.state.questSchemaLastCheckedAt = new Date().toISOString()
    const applied = QuestSchemaHolder.getMeta()
    if (applied?.schemaVersion === schemas.meta.schemaVersion && applied.revision > schemas.meta.revision) {
      this.state.questSchemaCheckStatus = 'older'
      QuestSchemaHolder.setError('配信データが適用済みより古いため、更新しませんでした。')
      return
    }

    if (QuestSchemaHolder.needsUpdate(schemas.meta)) {
      // 配信側が一時的に古い版を返しても、検出済みの新しい更新を保持する。
      if (!this.pending || this.pending.schemas.meta.revision <= schemas.meta.revision) {
        this.pending = { jsonText: result.jsonText, schemas }
      }
      if (!this.applyRequested) {
        this.state.questSchemaCheckStatus = 'available'
        QuestSchemaHolder.setError(this.pending.schemas.skipped.length > 0
          ? '更新データに未対応の任務が含まれています。適用時は対応できた任務のみ反映します。' : null)
        return
      }
      this.apply(this.pending)
      return
    }
    if (this.pending) {
      if (this.applyRequested) this.apply(this.pending)
      else this.state.questSchemaCheckStatus = 'available'
      return
    }
    this.complete(schemas.skipped.length)
  }

  private apply(pending: NonNullable<QuestSchemaUpdater['pending']>): void {
    const { jsonText, schemas } = pending
    if (QuestSchemaHolder.needsUpdate(schemas.meta)) {
      try {
        this.dependencies.save(jsonText)
      } catch {
        this.fail('任務データを保存できなかったため、更新を適用しませんでした。')
        return
      }
      this.dependencies.register(schemas.quests)
      this.dependencies.didApply(jsonText)
      QuestSchemaHolder.setMeta(schemas.meta)
    }

    this.pending = null
    this.complete(schemas.skipped.length)
  }

  private complete(skipped: number): void {
    const partial = skipped > 0
    this.state.questSchemaCheckStatus = partial ? 'partial' : 'latest'
    QuestSchemaHolder.setError(partial
      ? `${skipped}件の任務データを読み込めませんでした。対応できた任務のみ適用しています。`
      : null)
  }
}
