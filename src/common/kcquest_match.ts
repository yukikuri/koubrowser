import type {
  ComparisonOperator, 
  QuestDeckShipCount, 
  QuestDefinitionByType, 
  QuestSchema, 
  QuestShipCount,
  QuestShipCountSum,
  QuestShipTypeCount,
  QuestShipCategoryCount,
} from '@common/kcquest_definition';
import { 
  deckShipCount, 
  shipCount, 
  type SvData,
  type ShipMst,
  shipTypeCount,
  shipCategoryCount,
  toShipMsts
} from '@common/kcs';

/**
 * 基準値比較
 * 
 * @param actual 
 * @param operator 
 * @param expected 
 * @returns 
 */
function compare<T>(
  actual: T,
  operator: ComparisonOperator<T>,
  expected: T
): boolean {
  switch (operator) {
    case 'eq':
      return actual === expected
    case 'gte':
      return actual >= expected
    case 'lte':
      return actual <= expected
    default:
      throw new Error(`unknown operator: ${operator}`)
  }
}

/**
 * クエスト判定コンテキスト
 */
type QuestMatchContext = {
  svdata: SvData
  ship_ids: number[]
}

/**
 * true判定
 * 
 * @param _context 
 * @param _definition 
 * @returns 
 */
const isMatchTrue = (
  _context: QuestMatchContext, _definition: QuestDefinitionByType[keyof QuestDefinitionByType]
): boolean => {
  return true
}

/**
 * 艦隊隻数判定
 * 
 * @param context 
 * @param definition 
 * @returns 
 */
const isDeckShipCountMatch = (context: QuestMatchContext, definition: QuestDeckShipCount): boolean => {
  return compare(deckShipCount(context.ship_ids), definition.operator, definition.value)
}

/**
 * 特定艦艦数判定
 * 
 * @param context 
 * @param definition 
 * @returns 
 */
const isShipCountMatch = (context: QuestMatchContext, definition: QuestShipCount): boolean => {
  const svdata = context.svdata
    const msts = selectShips(context, definition)
    const shipIds = definition.shipIds.map(id => svdata.shipMstIds(id)).flat()
  return compare(shipCount(msts, shipIds), definition.operator, definition.value)
}

const isShipCountSumMatch = (context: QuestMatchContext, definition: QuestShipCountSum): boolean => {
  const msts = toShipMsts(context.svdata, context.ship_ids)
  const shipIds = definition.shipIds.flatMap(id => context.svdata.shipMstIds(id))
  const count = shipCount(msts, shipIds) + shipCategoryCount(msts, definition.shipCategories)
  return compare(count, definition.operator, definition.value)
}

function selectShips(
  context: QuestMatchContext,
  definition: QuestShipCount | QuestShipTypeCount | QuestShipCategoryCount
): ShipMst[] {
  const ids = definition.scope === 'flagship' ? context.ship_ids.slice(0, 1)
    : definition.scope === 'escort' ? context.ship_ids.slice(1) : context.ship_ids
  return toShipMsts(context.svdata, ids).filter(ship =>
    definition.minLevel === undefined || ship.api.api_lv >= definition.minLevel
  )
}

const isShipTypeCountMatch = (context: QuestMatchContext, definition: QuestShipTypeCount): boolean =>
  compare(shipTypeCount(selectShips(context, definition), definition.shipTypes), definition.operator, definition.value)

const isShipCategoryCountMatch = (context: QuestMatchContext, definition: QuestShipCategoryCount): boolean =>
  compare(shipCategoryCount(selectShips(context, definition), definition.shipCategories), definition.operator, definition.value)

/**
 * 条件判定関数マップ
 */
type QuestMatchers = {
  [K in keyof QuestDefinitionByType]: (
    context: QuestMatchContext,
    definition: QuestDefinitionByType[K]
  ) => boolean
}
const questMatchers: QuestMatchers = {
  deckShipCount: isDeckShipCountMatch,
  shipCount: isShipCountMatch,
  shipCountSum: isShipCountSumMatch,
  shipTypeCount: isShipTypeCountMatch,
  shipCategoryCount: isShipCategoryCountMatch,
  enemyShipType: isMatchTrue,
}

/**
 * 条件判定関数呼び出し
 */
type DefinitionFor<
  K extends keyof QuestDefinitionByType = keyof QuestDefinitionByType
> = {
  [P in K]: QuestDefinitionByType[P] & { readonly type: P }
}[K]
function isDefinitionMatch<K extends keyof QuestDefinitionByType>(
  context: QuestMatchContext,
  definition: DefinitionFor<K>
): boolean {
  const matcher = questMatchers[definition.type]

  if (!matcher) {
    throw new Error(`unknown quest type: ${definition.type}`)
  }

  return matcher(context, definition)
}

/**
 * クエストスキーマ判定
 * 
 * @param svdata 
 * @param ship_ids 
 * @param questSchema 
 * @returns 
 */
export function isQuestSchemaMatch(
  svdata: SvData,
  ship_ids: number[],
  questSchema: QuestSchema
): boolean {
  const context: QuestMatchContext = { svdata, ship_ids }

  return questSchema.definitions.length === 0 || questSchema.definitions.some(
    group => group.every(definition => isDefinitionMatch(context, definition))
  )
}
