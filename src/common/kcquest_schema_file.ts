import type { QuestSchema } from '@common/kcquest_definition'

/** 現アプリが読み込み可能なバージョン */
export const SupportedQuestSchemaVersions = [1] as const

/** 現アプリが読み込み可能なバージョン一覧 */
type SupportedQuestSchemaVersion =
  (typeof SupportedQuestSchemaVersions)[number]

/** CDNから取得するバージョン */
export const PreferredQuestSchemaVersion = 1 satisfies SupportedQuestSchemaVersion

/** スキーマに含まれる任務1件分の説明情報 */
export interface QuestSchemaMetaInfo {
  readonly no: number
  readonly info: string
}

/** 配信する任務定義ファイルのメタ情報 */
export interface QuestSchemaMetaV1 {
  /** JSON形式のバージョン */
  schemaVersion: 1
  /** 同じ形式内での任務定義の更新番号。配信時はYYYYMMDDXX（XXは01からの連番）を使用する。 */
  revision: number
  /** ISO 8601形式の更新日時 */
  updatedAt: string
  /** 含まれる任務データの説明。任務判定には使用しない。 */
  readonly questInfos?: readonly QuestSchemaMetaInfo[]
}

/** 検証済みの任務定義ファイル。読み込み直後の任務データは個別に検証する */
export interface QuestSchemaFileV1 {
  meta: QuestSchemaMetaV1
  quests: QuestSchema[]
}
