import type { QuestSchemaMetaV1 } from '@common/kcquest_schema_file'

let appliedMeta: QuestSchemaMetaV1 | null = null

/**
 * 適用済みの任務スキーマmetaを保持する。mainとrendererでは個別の状態になる。
 * 通信・ファイル保存・JSON検証・任務登録は行わない。
 */
export const QuestSchemaHolder = {
  /** 未適用ならnull。保持中の値を外部から変更されないようコピーを返す。 */
  getMeta(): Readonly<QuestSchemaMetaV1> | null {
    return appliedMeta === null ? null : { ...appliedMeta }
  },

  /** 任務登録に成功した後、検証済みmetaを保管する。保存成功とは別に管理する。 */
  setMeta(meta: Readonly<QuestSchemaMetaV1>): void {
    appliedMeta = { ...meta }
  },

  /**
   * 検証済みmetaの適用が必要か判定する。この判定だけでは保持状態を変更しない。
   * 未適用または形式変更時は適用する。同じ形式ではrevisionが増えた場合のみ適用する。
   * 内容を切り戻す場合も、配信側でrevisionを増やすこと。
   */
  needsUpdate(meta: Readonly<QuestSchemaMetaV1>): boolean {
    return appliedMeta === null ||
      meta.schemaVersion !== appliedMeta.schemaVersion ||
      meta.revision > appliedMeta.revision
  },

  /** 適用済みmetaのみをクリアする。登録済みの任務定義は変更しない。 */
  clear(): void {
    appliedMeta = null
  }
}
