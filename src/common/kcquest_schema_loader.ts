import type { QuestStuffClass } from '@common/kcquest'
import type { QuestType } from '@common/kcquest_types'
import type { QuestSchemaMetaInfo, QuestSchemaMetaV1 } from '@common/kcquest_schema_file'
import { isQuestSchema } from '@common/kcquest_parser'
import { convertToQuest } from '@common/kcquest_converter'

export interface LoadedQuestSchema {
  no: number
  stuff: QuestStuffClass<QuestType>
}

export interface SkippedQuestSchema {
  /** quests配列内の0始まりの位置。 */
  index: number
  no?: number
  error: Error
}

export type LoadQuestSchemaResult =
  | { success: true; meta: QuestSchemaMetaV1; quests: LoadedQuestSchema[]; skipped: SkippedQuestSchema[] }
  | { success: false; error: Error }

type ParseAndConvertResult =
  | { success: true; quest: LoadedQuestSchema }
  | { success: false; error: Error }

interface QuestSchemaHandler {
  parseAndConvert(value: unknown): ParseAndConvertResult
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function errorResult(error: unknown): { success: false; error: Error } {
  return { success: false, error: error instanceof Error ? error : new Error(String(error)) }
}

function parseAndConvertV1(value: unknown): ParseAndConvertResult {
  if (!isQuestSchema(value)) return errorResult('Invalid or unsupported v1 quest schema')
  const result = convertToQuest(value)
  return result.success ? { success: true, quest: { no: value.no, stuff: result.stuff } } : result
}

// Version dispatch is independent of the converter's questType dispatch.
const handlers: ReadonlyMap<number, QuestSchemaHandler> = new Map([
  [1, { parseAndConvert: parseAndConvertV1 }],
])

function isMetaInfo(value: unknown): value is QuestSchemaMetaInfo {
  return isObject(value) && questNumber(value) !== undefined && typeof value.info === 'string'
}

function isMetaV1(value: Record<string, unknown>): value is Record<string, unknown> & QuestSchemaMetaV1 {
  return value.schemaVersion === 1 &&
    typeof value.revision === 'number' && Number.isSafeInteger(value.revision) && value.revision >= 0 &&
    typeof value.updatedAt === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value.updatedAt) &&
    Number.isFinite(Date.parse(value.updatedAt)) &&
    (value.questInfos === undefined || (Array.isArray(value.questInfos) && value.questInfos.every(isMetaInfo)))
}

function questNumber(value: unknown): number | undefined {
  return isObject(value) && typeof value.no === 'number' && Number.isSafeInteger(value.no) && value.no > 0
    ? value.no : undefined
}

/**
 * 配信JSONを検証・変換する。通信や既存任務の登録・置き換えは行わない。
 * successはファイル形式の受理を示し、任務ごとの失敗はskippedに返す。
 * 重複した任務番号は全出現をスキップし、配列順による上書きを防ぐ。
 */
export function loadQuestSchemaJson(jsonText: string): LoadQuestSchemaResult {
  let data: unknown
  try {
    data = JSON.parse(jsonText)
  } catch (error: unknown) {
    return errorResult(error)
  }
  if (!isObject(data) || !isObject(data.meta) || !Array.isArray(data.quests)) {
    return errorResult('Invalid quest schema file: meta and quests are required')
  }
  const version = data.meta.schemaVersion
  if (typeof version !== 'number' || !Number.isSafeInteger(version) || version < 1) {
    return errorResult('Invalid schemaVersion')
  }
  const handler = handlers.get(version)
  if (!handler) return errorResult(`Unsupported schemaVersion: ${version}`)
  if (!isMetaV1(data.meta)) return errorResult('Invalid v1 quest schema metadata')

  const counts = new Map<number, number>()
  for (const item of data.quests) {
    const no = questNumber(item)
    if (no !== undefined) counts.set(no, (counts.get(no) ?? 0) + 1)
  }
  const quests: LoadedQuestSchema[] = []
  const skipped: SkippedQuestSchema[] = []
  for (const [index, item] of data.quests.entries()) {
    const no = questNumber(item)
    if (no !== undefined && (counts.get(no) ?? 0) > 1) {
      skipped.push({ index, no, error: new Error(`Duplicate quest number: ${no}`) })
      continue
    }
    try {
      const result = handler.parseAndConvert(item)
      if (result.success) quests.push(result.quest)
      else skipped.push({ index, no, error: result.error })
    } catch (error: unknown) {
      skipped.push({ index, no, error: errorResult(error).error })
    }
  }
  const { schemaVersion, revision, updatedAt } = data.meta
  const meta: QuestSchemaMetaV1 = { schemaVersion, revision, updatedAt,
    ...(data.meta.questInfos === undefined ? {} : {
      questInfos: data.meta.questInfos.map(({ no, info }) => ({ no, info }))
    })
  }
  return { success: true, meta, quests, skipped }
}
