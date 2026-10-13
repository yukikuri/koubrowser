import type { QuestStuffByType, QuestStuffClass, DestroyItemCondition, QuestCondition } from '@common/kcquest'
import type { QuestSchema, QuestSchemaByType, QuestConditionSchema } from '@common/kcquest_definition'
import type { QuestType } from '@common/kcquest_types'
import type { SvData, ApiShipType } from '@common/kcs'
import { ApiDeckPortId } from '@common/kcs'
import type { Quest } from '@common/record'
import { detailFormat, detailFormatMaps } from '@common/kcquest_formatter'
import { isQuestSchemaMatch } from '@common/kcquest_match'
import { isQuestSchema } from '@common/kcquest_parser'

export type ConvertQuestResult<T extends QuestType = QuestType> =
  | { success: true; stuff: QuestStuffClass<T> }
  | { success: false; error: Error }

function invalid(message: string): { success: false; error: Error } {
  return { success: false, error: new Error(message) }
}

function converted<T extends QuestStuffByType[QuestType]>(
  stuff: T
): {
  success: true
  stuff: (new () => object) & T
} {
  // Preserve the registry's static-class contract without importing its runtime.
  return { success: true, stuff: Object.assign(class {}, stuff) }
}

type SupportedQuestType = QuestSchema['questType']

// Keep the discriminant correlated with each schema during generic dispatch.
type SchemaFor<K extends SupportedQuestType = SupportedQuestType> = {
  [P in K]: QuestSchemaByType[P] & { questType: P }
}[K]

type QuestConverters = {
  [K in SupportedQuestType]: (schema: SchemaFor<K>) => ConvertQuestResult<K>
}

function createCommonStuff(
  data: QuestSchema
): Pick<QuestStuffByType['hensei'], 'max' | 'key' | 'notFixState' | 'formatter'> {
  const prefixes = 'maps' in data ? [] : data.formatter.map((text) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  )
  return {
    max: data.max,
    key: data.key,
    notFixState: data.notFixState,
    formatter: (quest: Quest): string =>
      'maps' in data
        ? detailFormatMaps(quest, data.maps)
        : (prefixes.length ? detailFormat(prefixes, quest) : '')
  }
}

function createDeckMatcher(data: QuestSchema): Pick<QuestStuffByType['hensei'], 'isDeckMatch'> {
  return {
    isDeckMatch: (svdata: SvData, ship_ids: number[]): boolean =>
      isQuestSchemaMatch(svdata, ship_ids, data)
  }
}

function resolveCondition(svdata: SvData, condition?: QuestConditionSchema): DestroyItemCondition | undefined {
  if (!condition) return undefined
  const { flagship, ...fields } = structuredClone(condition)
  if (!flagship) return fields
  const ids = flagship.mode === 'exact' ? flagship.ids
    : [...new Set(flagship.ids.flatMap(id => svdata.shipMstIds(id)))]
  // An unresolved selector must not become an unrestricted flagship condition.
  return { ...fields, flagship_ids: ids, ...(ids.length === 0 ? { deck_checked: false } : {}) }
}

function createConditionGetter(
  schema: QuestSchemaByType['collectItemCondition' | 'destroyItemIdOrType']
): QuestCondition {
  return {
    getCondition: (svdata: SvData): DestroyItemCondition | undefined => {
      const condition = resolveCondition(svdata, schema.condition)
      if (schema.definitions.length === 0) return condition

      const deck = svdata.deckPort(ApiDeckPortId.deck1st)
      const deckChecked = deck != null && isQuestSchemaMatch(svdata, deck.api_ship, schema)
      // Reevaluate the current fleet; retain failures from flagship resolution.
      return {
        flagship_slotitem_ids: [],
        flagship_slotitem_lvl: [],
        ...condition,
        deck_checked: (condition?.deck_checked ?? true) && deckChecked,
      }
    }
  }
}

const converters: QuestConverters = {
  collectItemCondition: data => converted({
    ...createCommonStuff(data), ...createConditionGetter(data),
    questType: data.questType, item_id: data.item_id,
  }),
  destroyItemIdOrType: data => converted({
    ...createCommonStuff(data), ...createConditionGetter(data),
    questType: data.questType, id_or_types: data.id_or_types,
  }),
  practice: (data) =>
    converted({
      ...createCommonStuff(data),
      questType: data.questType,
      need_win_rank: data.need_win_rank
    }),
  practiceDeck: (data) =>
    converted({
      ...createCommonStuff(data),
      ...createDeckMatcher(data),
      questType: data.questType,
      need_win_rank: data.need_win_rank
    }),
  collectItem: (data) =>
    converted({ ...createCommonStuff(data), questType: data.questType, item_id: data.item_id }),
  mapStart: (data) =>
    converted({
      ...createCommonStuff(data),
      questType: data.questType,
      area_id: data.area_id,
      area_no: data.area_no
    }),
  mapStartDeck: (data) =>
    converted({
      ...createCommonStuff(data),
      ...createDeckMatcher(data),
      questType: data.questType,
      area_id: data.area_id,
      area_no: data.area_no
    }),
  battle: (data) =>
    converted({ ...createCommonStuff(data), questType: data.questType, need_win: data.need_win }),
  battleEnemy: (data) => {
    // AND is the intersection of targets; OR is their union. Count each target only once.
    const targets = data.definitions.flatMap(group => {
      const conditions = group.filter(definition => definition.type === 'enemyShipType')
      return conditions[0].enemyType.filter(type =>
        conditions.every(condition => condition.enemyType.includes(type)))
    })
    // The parser has checked enum membership and nonempty enemy-only groups.
    const types = [...new Set(targets)] as ApiShipType[]
    return converted({ ...createCommonStuff(data), questType: data.questType, type: types })
  },
  battleMap: (data) =>
    converted({ ...createCommonStuff(data), questType: data.questType, maps: data.maps }),
  battleMapDeck: (data) =>
    converted({
      ...createCommonStuff(data),
      ...createDeckMatcher(data),
      questType: data.questType,
      maps: data.maps
    }),
  mapGoal: (data) =>
    converted({
      ...createCommonStuff(data),
      ...createDeckMatcher(data),
      questType: data.questType,
      maps: data.maps
    }),
  gaugeClear: (data) =>
    converted({
      ...createCommonStuff(data),
      ...createDeckMatcher(data),
      questType: data.questType,
      maps: data.maps
    }),
  missionSpecific: (data) =>
    converted({ ...createCommonStuff(data), questType: data.questType, names: data.names }),
  kaisou: (data) =>
    converted({
      ...createCommonStuff(data),
      questType: data.questType,
      need_succeeded: data.need_succeeded
    }),
  kaisouUseType: (data) => {
    // The legacy updater never increments when use_ship_type is null.
    if (data.use_ship_type === null)
      return invalid('use_ship_type: null is not supported by the updater')
    return converted({
      ...createCommonStuff(data),
      questType: data.questType,
      powerup_ship_type: data.powerup_ship_type,
      use_ship_type: data.use_ship_type
    })
  },
  kaisouUseId: (data) =>
    converted({
      ...createCommonStuff(data),
      questType: data.questType,
      powerup_ship_type: data.powerup_ship_type,
      use_ship_ids: data.use_ship_ids,
      use_ship_count: data.use_ship_count
    }),
  kaisouUseIdToId: (data) =>
    converted({
      ...createCommonStuff(data),
      questType: data.questType,
      powerup_ship_ids: data.powerup_ship_ids,
      use_ship_ids: data.use_ship_ids,
      use_ship_count: data.use_ship_count
    }),
  kaisouUseTypeToId: (data) =>
    converted({
      ...createCommonStuff(data),
      questType: data.questType,
      powerup_ship_ids: data.powerup_ship_ids,
      use_ship_type: data.use_ship_type,
      use_ship_count: data.use_ship_count
    }),
  kaisouUseCategoryToCategory: (data) =>
    converted({
      ...createCommonStuff(data),
      questType: data.questType,
      powerup_ship_cats: data.powerup_ship_cats,
      use_ship_cats: data.use_ship_cats,
      use_ship_count: data.use_ship_count
    }),
  kaisouUseCategoryToType: (data) =>
    converted({
      ...createCommonStuff(data),
      questType: data.questType,
      powerup_ship_cats: data.powerup_ship_cats,
      use_ship_types: data.use_ship_types,
      use_ship_count: data.use_ship_count
    }),
  slotitemCondition: (data) =>
    converted({
      ...createCommonStuff(data),
      questType: data.questType,
      slotitem_ids: data.slotitem_ids
    }),
  hensei: (data) =>
    converted({
      ...createCommonStuff(data),
      ...createDeckMatcher(data),
      questType: data.questType
    }),
  nyukyo: (data) => converted({ ...createCommonStuff(data), questType: data.questType }),
  missionStart: (data) => converted({ ...createCommonStuff(data), questType: data.questType }),
  mission: (data) => converted({ ...createCommonStuff(data), questType: data.questType }),
  hokyu: (data) => converted({ ...createCommonStuff(data), questType: data.questType }),
  remodel: (data) => converted({ ...createCommonStuff(data), questType: data.questType }),
  createItem: (data) => converted({ ...createCommonStuff(data), questType: data.questType }),
  destroyItem: (data) => converted({ ...createCommonStuff(data), questType: data.questType }),
  createShip: (data) => converted({ ...createCommonStuff(data), questType: data.questType }),
  destroyShip: (data) => converted({ ...createCommonStuff(data), questType: data.questType })
}

/** Converts validated JSON data; never registers or updates a live quest. */
export function convertToQuest<K extends SupportedQuestType>(
  schema: SchemaFor<K>
): ConvertQuestResult<K> {
  // Also protect callers that bypass the JSON parser or use a type assertion.
  if (!isQuestSchema(schema)) return invalid('Invalid or unsupported quest schema')

  // Methods must not observe subsequent edits to the supplied JSON object.
  const data = structuredClone(schema)
  return converters[data.questType](data)
}

/** Retained for existing quest 230 callers. */
export function convertToQuestBattleEnemy(schema: QuestSchema): ConvertQuestResult<'battleEnemy'> {
  const result = convertToQuest(schema)
  if (!result.success) return result
  if (result.stuff.questType !== 'battleEnemy') return invalid('invalid battleEnemy quest type')
  return { success: true, stuff: result.stuff }
}

export function convertToQuestBattleMapDeck(
  schema: QuestSchema
): ConvertQuestResult<'battleMapDeck'> {
  const result = convertToQuest(schema)
  if (!result.success) return result
  if (result.stuff.questType !== 'battleMapDeck') return invalid('invalid battleMapDeck quest type')
  return { success: true, stuff: result.stuff }
}
