import type {
  ComparisonOperator,
  QuestDeckShipCount,
  QuestDefinition,
  QuestDefinitionByType,
  QuestEnemyShipType,
  QuestSchema,
  QuestShipCount, 
  QuestShipCountSum,
  QuestConditionSchema,
  QuestShipTypeCount,
  QuestShipCategoryCount,
} from '@common/kcquest_definition';
import { QuestKey, QuestType } from './kcquest_types';
import { ApiItemId, ApiShipType, ApiShipCategory, SlotitemType } from './kcs'

/** 
 * object型判定
 */
const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 0以上整数判定
 */
const isNonNegativeInteger = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

/** 
 * 整数配列判定
 */
const isIdArray = (value: unknown): value is number[] => {
  return Array.isArray(value) && value.every(
    (item: unknown) => isNonNegativeInteger(item) && item > 0
  )
}

const isPositiveInteger = (value: unknown): value is number =>
  isNonNegativeInteger(value) && value > 0

const isNonEmptyIds = (value: unknown): value is number[] =>
  isIdArray(value) && value.length > 0

const isShipType = (value: unknown): value is ApiShipType =>
  isPositiveInteger(value) && Object.values(ApiShipType).some(type => type === value)

const isShipCategory = (value: unknown): value is ApiShipCategory =>
  isPositiveInteger(value) && Object.values(ApiShipCategory).some(type => type === value)

const isShipTypes = (value: unknown): value is ApiShipType[] =>
  Array.isArray(value) && value.length > 0 && value.every(isShipType)

const isShipCategories = (value: unknown): value is ApiShipCategory[] =>
  Array.isArray(value) && value.length > 0 && value.every(isShipCategory)

function hasValidShipScope(value: Record<string, unknown>): boolean {
  return (
    (value.scope === undefined || value.scope === 'all' || value.scope === 'flagship' || value.scope === 'escort') &&
    (value.minLevel === undefined || isPositiveInteger(value.minLevel))
  )
}

/**
 * 比較演算子判定
 */
const isNumberComparisonOperator = (
  value: unknown
): value is ComparisonOperator<number> => {
  return value === 'eq' || value === 'gte' || value === 'lte'
}

/**
 * 艦隊隻数
 */
const isQuestDeckShipCount = (value: unknown): value is QuestDeckShipCount => {
  if (!isObject(value)) return false

  return (
    value.type === 'deckShipCount' &&
    isNumberComparisonOperator(value.operator) &&
    isNonNegativeInteger(value.value)
  )
}

/** 
 * 特定艦隻数
 */
const isQuestShipCount = (value: unknown): value is QuestShipCount => {
  if (!isObject(value)) return false

  return (
    value.type === 'shipCount' &&
    isNumberComparisonOperator(value.operator) &&
    isNonNegativeInteger(value.value) &&
    isNonEmptyIds(value.shipIds) &&
    hasValidShipScope(value)
  )
}

/**
 * 特定艦と艦型の隻数合計
 */
const isQuestShipCountSum = (value: unknown): value is QuestShipCountSum => {
  if (!isObject(value)) return false
  return value.type === 'shipCountSum' &&
    isNumberComparisonOperator(value.operator) && isNonNegativeInteger(value.value) &&
    isNonEmptyIds(value.shipIds) && isShipCategories(value.shipCategories)
}

/**
 * 艦型隻数
 */
const isQuestShipTypeCount = (value: unknown): value is QuestShipTypeCount => {
  if (!isObject(value)) return false
  return value.type === 'shipTypeCount' &&
    isNumberComparisonOperator(value.operator) && isNonNegativeInteger(value.value) &&
    isShipTypes(value.shipTypes) && hasValidShipScope(value)
}

/**
 * 艦カテゴリ隻数
 */
const isQuestShipCategoryCount = (value: unknown): value is QuestShipCategoryCount => {
  if (!isObject(value)) return false
  return value.type === 'shipCategoryCount' &&
    isNumberComparisonOperator(value.operator) && isNonNegativeInteger(value.value) &&
    isShipCategories(value.shipCategories) && hasValidShipScope(value)
}

/**
 * 敵艦種撃破
 */
const isQuestEnemyShipType = (value: unknown): value is QuestEnemyShipType => {
  if (!isObject(value)) return false

  return (
    value.type === 'enemyShipType' &&
    isShipTypes(value.enemyType)
  )
}

/**
 * 検証型検証マップ
 */
type QuestDefinitionValidators = {
  [K in keyof QuestDefinitionByType]: (
    value: unknown
  ) => value is QuestDefinitionByType[K]
}
const questDefinitionValidators: QuestDefinitionValidators = {
  deckShipCount: isQuestDeckShipCount,
  shipCount: isQuestShipCount,
  shipCountSum: isQuestShipCountSum,
  shipTypeCount: isQuestShipTypeCount,
  shipCategoryCount: isQuestShipCategoryCount,
  enemyShipType: isQuestEnemyShipType,
}

function isQuestDefinitionType(
  value: unknown
): value is keyof QuestDefinitionByType {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(questDefinitionValidators, value)
  )
}

/**
 * 条件種別検証
 */
function isQuestDefinition(value: unknown): value is QuestDefinition {
  if (!isObject(value)) return false
  if (!isQuestDefinitionType(value.type)) return false

  return questDefinitionValidators[value.type](value)
}

function isQuestMap(value: unknown): boolean {
  if (!Array.isArray(value) || !isPositiveInteger(value[0]) || !isPositiveInteger(value[1])) {
    return false
  }
  if (value.length === 3) return ['', 'S', 'A', 'B', 'C'].includes(value[2])
  // A missing cell filter is represented by a 3-element tuple in JSON, not null.
  return value.length === 4 && ['S', 'A', 'B'].includes(value[2]) &&
    (value[3] === undefined || isNonEmptyIds(value[3]))
}

function isQuestCondition(value: unknown): value is QuestConditionSchema {
  if (!isObject(value)) return false
  const keys = ['flagship', 'flagship_lv', 'flagship_type_ids', 'flagship_categories',
    'flagship_slotitem_ids', 'flagship_slotitem_lvl', 'flagship_slotitem_alv_max', 'flagship_slotitem_only']
  if (!Object.keys(value).every(key => keys.includes(key))) return false
  if (value.flagship !== undefined) {
    const selector = value.flagship
    if (!isObject(selector) || (selector.mode !== 'exact' && selector.mode !== 'shipMstIds') ||
      !isNonEmptyIds(selector.ids) ||
      !Object.keys(selector).every(key => key === 'mode' || key === 'ids')) return false
  }
  return (value.flagship_lv === undefined || isPositiveInteger(value.flagship_lv)) &&
    (value.flagship_type_ids === undefined || isShipTypes(value.flagship_type_ids)) &&
    (value.flagship_categories === undefined || isShipCategories(value.flagship_categories)) &&
    Array.isArray(value.flagship_slotitem_ids) && value.flagship_slotitem_ids.every(isNonNegativeInteger) &&
    Array.isArray(value.flagship_slotitem_lvl) &&
    value.flagship_slotitem_lvl.length <= value.flagship_slotitem_ids.length &&
    value.flagship_slotitem_lvl.every(level => isNonNegativeInteger(level) && level <= 10) &&
    (value.flagship_slotitem_alv_max === undefined || typeof value.flagship_slotitem_alv_max === 'boolean') &&
    (value.flagship_slotitem_only === undefined || typeof value.flagship_slotitem_only === 'boolean') &&
    (!(value.flagship_slotitem_alv_max || value.flagship_slotitem_only) ||
      isPositiveInteger(value.flagship_slotitem_ids[0]))
}

function isQuestItemSelector(value: unknown): boolean {
  if (!isObject(value) || Object.keys(value).length !== 1) return false
  const isItemType = (type: unknown): boolean =>
    isPositiveInteger(type) && Object.values(SlotitemType).some(item => item === type)
  if ('id' in value) return isPositiveInteger(value.id)
  if ('type' in value) return isItemType(value.type)
  if ('types' in value) return Array.isArray(value.types) && value.types.length > 0 && value.types.every(isItemType)
  if ('id_with_alv' in value) {
    const item = value.id_with_alv
    return isObject(item) && Object.keys(item).every(key => key === 'id' || key === 'alv') &&
      isPositiveInteger(item.id) && isNonNegativeInteger(item.alv) && item.alv <= 7
  }
  return false
}

function hasQuestFields(value: Record<string, unknown>): boolean {
  const supportsCondition = value.questType === 'collectItemCondition' || value.questType === 'destroyItemIdOrType'
  if (value.condition !== undefined && (!supportsCondition || !isQuestCondition(value.condition))) return false
  switch (value.questType) {
    case 'practice':
    case 'practiceDeck':
      return typeof value.need_win_rank === 'string' && ['', 'B', 'A', 'S'].includes(value.need_win_rank)
    case 'collectItem':
    case 'collectItemCondition':
      return Object.values(ApiItemId).some(id => id === value.item_id)
    case 'destroyItemIdOrType':
      return Array.isArray(value.id_or_types) && value.id_or_types.every(isQuestItemSelector)
    case 'mapStart':
    case 'mapStartDeck':
      return isNonNegativeInteger(value.area_id) && isNonNegativeInteger(value.area_no)
    case 'battle':
      return typeof value.need_win === 'boolean'
    case 'battleMap':
    case 'battleMapDeck':
    case 'mapGoal':
    case 'gaugeClear':
      return Array.isArray(value.maps) && value.maps.length > 0 && value.maps.every(isQuestMap)
    case 'missionSpecific':
      return Array.isArray(value.names) && value.names.length > 0 && value.names.every(
        (names: unknown) => Array.isArray(names) && names.length > 0 &&
          names.every((name: unknown) => typeof name === 'string' && name.length > 0)
      )
    case 'kaisou':
      return typeof value.need_succeeded === 'boolean'
    case 'kaisouUseType':
      return (value.powerup_ship_type === null || isShipType(value.powerup_ship_type)) &&
        (value.use_ship_type === null || (Array.isArray(value.use_ship_type) &&
          value.use_ship_type.length === 2 && isShipType(value.use_ship_type[0]) &&
          isPositiveInteger(value.use_ship_type[1])))
    case 'kaisouUseId':
      return (value.powerup_ship_type === null || isShipType(value.powerup_ship_type)) &&
        isNonEmptyIds(value.use_ship_ids) && isPositiveInteger(value.use_ship_count)
    case 'kaisouUseIdToId':
      return isNonEmptyIds(value.powerup_ship_ids) && isNonEmptyIds(value.use_ship_ids) &&
        isPositiveInteger(value.use_ship_count)
    case 'kaisouUseTypeToId':
      return isNonEmptyIds(value.powerup_ship_ids) && isShipTypes(value.use_ship_type) &&
        isPositiveInteger(value.use_ship_count)
    case 'kaisouUseCategoryToCategory':
      return isShipCategories(value.powerup_ship_cats) && isShipCategories(value.use_ship_cats) &&
        isPositiveInteger(value.use_ship_count)
    case 'kaisouUseCategoryToType':
      return isShipCategories(value.powerup_ship_cats) && isShipTypes(value.use_ship_types) &&
        isPositiveInteger(value.use_ship_count)
    case 'slotitemCondition':
      return isNonEmptyIds(value.slotitem_ids)
    case 'nyukyo': case 'battleEnemy': case 'missionStart': case 'mission':
    case 'hokyu': case 'remodel': case 'createItem': case 'destroyItem': case 'createShip':
    case 'destroyShip': case 'hensei':
      return true
    // Quest 214 is still handled by its legacy class.
    default:
      return false
  }
}

function hasSupportedConditions(schema: QuestSchema): boolean {
  const deckTypes: QuestType[] = [
    'hensei', 'practiceDeck', 'mapStartDeck', 'battleMapDeck', 'mapGoal', 'gaugeClear',
    'collectItemCondition', 'destroyItemIdOrType',
  ]
  if (deckTypes.includes(schema.questType)) {
    return schema.definitions.every(group =>
      group.every(definition => definition.type !== 'enemyShipType'))
  }
  if (schema.questType === 'battleEnemy') {
    return schema.definitions.length > 0 && schema.definitions.every(group =>
      group.every(definition => definition.type === 'enemyShipType'))
  }
  return schema.definitions.length === 0
}

function hasValidCounters(schema: QuestSchema): boolean {
  // Map quests generate labels from maps instead of formatter prefixes.
  if (!('maps' in schema) && schema.formatter.length !== 0 && schema.formatter.length !== schema.max.length) return false
  switch (schema.questType) {
    case 'battleMap': case 'battleMapDeck': case 'mapGoal': case 'gaugeClear':
      return schema.max.length === 1 || schema.max.length === schema.maps.length
    case 'missionSpecific': return schema.max.length === schema.names.length
    case 'slotitemCondition': return schema.max.length === schema.slotitem_ids.length
    case 'destroyItemIdOrType': return schema.max.length === Math.max(1, schema.id_or_types.length)
    default: return schema.max.length === 1
  }
}

/** Validates shape first, then the constraints required by the existing updaters. */
export function isQuestSchema(value: unknown): value is QuestSchema {
  if (!isQuestSchemaShape(value)) return false
  return hasSupportedConditions(value) && hasValidCounters(value)
}

function isQuestSchemaShape(value: unknown): value is QuestSchema {
  if (!isObject(value)) return false

  return (
    isPositiveInteger(value.no) &&
    typeof value.questType === 'string' &&
    Object.values(QuestType).some(type => type === value.questType) &&
    Array.isArray(value.max) && value.max.length > 0 &&
    value.max.every(
      item => isPositiveInteger(item)
    ) &&
    typeof value.key === 'string' &&
    Object.values(QuestKey).some(key => key === value.key) &&
    Array.isArray(value.formatter) &&
    value.formatter.every(item => typeof item === 'string') &&
    Array.isArray(value.definitions) &&
    value.definitions.every(group =>
      Array.isArray(group) && group.length > 0 && group.every(isQuestDefinition)) &&
    (value.notFixState === undefined || typeof value.notFixState === 'boolean') &&
    hasQuestFields(value)
  )
}

export function parseQuestSchema(jsonText: string): QuestSchema {
  const data: unknown = JSON.parse(jsonText)

  if (!isQuestSchema(data)) {
    throw new Error('invalid quest schema format')
  }

  return data
}

type ParseQuestSchemasResult =
  | { success: true; schemas: QuestSchema[] }
  | { success: false; error: Error }

export function tryParseQuestSchemas(
  jsonText: string
): ParseQuestSchemasResult {
  try {
    const data: unknown = JSON.parse(jsonText)
    const items: unknown[] = Array.isArray(data) ? data : [data]
    const schemas: QuestSchema[] = []

    for (const [index, item] of items.entries()) {
      if (!isQuestSchema(item)) {
        return {
          success: false,
          error: new Error(`invalid quest schema. index: ${index}`),
        }
      }

      schemas.push(item)
    }

    return { success: true, schemas }
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

