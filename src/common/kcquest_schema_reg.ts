import { loadQuestSchemaJson } from "@common/kcquest_schema_loader"
import { QuestSchemaHolder } from "@common/kcquest_schema_holder"
import * as qs from '@common/kcquest'

export type regQuestSchemaResult = 'error' | 'reged' | 'noop'
export function regQuestSchemaFromJson(json: string): regQuestSchemaResult {

  // スキーマ解析
  const schemas = loadQuestSchemaJson(json)
  if (! schemas.success) {
    QuestSchemaHolder.setError('任務データの形式を確認できませんでした。')
    return 'error'
  }

  // 更新する必要が無い場合は、スキーマ登録を行わない
  if (! QuestSchemaHolder.needsUpdate(schemas.meta)) {
    return 'noop'
  }

  // スキーマ登録
  for (const schema of schemas.quests) {
    qs.questRegisterReplace(schema.no, schema.stuff)
  }

  // 登録したスキーマmeta設定
  QuestSchemaHolder.setMeta(schemas.meta)
  QuestSchemaHolder.setError(schemas.skipped.length > 0
    ? `${schemas.skipped.length}件の任務データを読み込めませんでした。対応できた任務のみ適用しています。`
    : null)

  return 'reged'
}
