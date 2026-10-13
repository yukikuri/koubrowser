import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { tryParseQuestSchemas } from '@common/kcquest_parser'
import { convertToQuest, convertToQuestBattleEnemy, convertToQuestBattleMapDeck } from '@common/kcquest_converter'
import type { ConvertQuestResult } from '@common/kcquest_converter'
import type { QuestSchema, QuestSchemaByType } from '@common/kcquest_definition'
import { QuestType } from '@common/kcquest_types'
import * as kcs from '@common/kcs'
import type { Quest } from '@common/record'

const base = { no: 230, max: [6], key: 'infer', formatter: [], definitions: [] }
const deck = [[{ type: 'deckShipCount', operator: 'gte', value: 2 }]]
const maps = [[1, 1, 'S']]
const fixtures: [string, Record<string, unknown>][] = [
  ['practice', { need_win_rank: 'B' }],
  ['practiceDeck', { need_win_rank: 'S', definitions: deck }],
  ['nyukyo', {}],
  ['collectItem', { item_id: kcs.ApiItemId.fast_repair }],
  ['collectItemCondition', { item_id: kcs.ApiItemId.fast_repair }],
  ['destroyItemIdOrType', { id_or_types: [{ type: kcs.SlotitemType.Fighter }] }],
  ['mapStart', { area_id: 0, area_no: 0 }],
  ['mapStartDeck', { area_id: 1, area_no: 1, definitions: deck }],
  ['battle', { need_win: true }],
  ['battleEnemy', { definitions: [[{ type: 'enemyShipType', enemyType: [13] }]] }],
  ['battleMap', { maps }],
  ['battleMapDeck', { maps, definitions: deck }],
  ['mapGoal', { maps: [[1, 6, '']], definitions: deck }],
  ['gaugeClear', { maps, definitions: deck }],
  ['missionStart', {}],
  ['mission', {}],
  ['missionSpecific', { names: [['mission-a', 'mission-b']] }],
  ['kaisou', { need_succeeded: true }],
  ['kaisouUseType', { powerup_ship_type: null, use_ship_type: [2, 2] }],
  ['kaisouUseId', { powerup_ship_type: 2, use_ship_ids: [1], use_ship_count: 1 }],
  ['kaisouUseIdToId', { powerup_ship_ids: [1], use_ship_ids: [2], use_ship_count: 1 }],
  ['kaisouUseTypeToId', { powerup_ship_ids: [1], use_ship_type: [2], use_ship_count: 1 }],
  ['kaisouUseCategoryToCategory', { powerup_ship_cats: [1], use_ship_cats: [2], use_ship_count: 1 }],
  ['kaisouUseCategoryToType', { powerup_ship_cats: [1], use_ship_types: [2], use_ship_count: 1 }],
  ['hokyu', {}],
  ['remodel', {}],
  ['createItem', {}],
  ['destroyItem', {}],
  ['createShip', {}],
  ['destroyShip', {}],
  ['hensei', { definitions: deck }],
  ['slotitemCondition', { slotitem_ids: [1] }],
]

function parse(value: unknown): QuestSchema {
  const result = tryParseQuestSchemas(JSON.stringify(value))
  if (!result.success) throw result.error
  return result.schemas[0]
}

afterEach(() => vi.restoreAllMocks())

describe('quest schema conversion', () => {
  it('infers the result type from a concrete schema', () => {
    const schema: QuestSchemaByType['battleEnemy'] = {
      no: 230, questType: 'battleEnemy', max: [6], key: 'infer', formatter: [],
      definitions: [[{ type: 'enemyShipType', enemyType: [13] }]],
    }
    const result = convertToQuest(schema)
    expectTypeOf(result).toEqualTypeOf<ConvertQuestResult<'battleEnemy'>>()
    if (!result.success) throw result.error
    expect(result.stuff.type).toEqual([13])
  })

  it('accepts a schema union while preserving the result union', () => {
    function convertUnion(schema: QuestSchemaByType['battleEnemy' | 'battleMapDeck']): void {
      const result = convertToQuest(schema)
      expectTypeOf(result).toEqualTypeOf<ConvertQuestResult<'battleEnemy' | 'battleMapDeck'>>()
      expect(result.success).toBe(true)
    }
    convertUnion({ no: 230, questType: 'battleEnemy', max: [6], key: 'infer', formatter: [],
      definitions: [[{ type: 'enemyShipType', enemyType: [13] }]] })
    convertUnion({ no: 999, questType: 'battleMapDeck', max: [1], key: 'infer', formatter: [],
      definitions: [], maps: [[1, 1, 'S']] })
  })

  it('accounts for every QuestType, including explicit unsupported types', () => {
    expect([...fixtures.map(([type]) => type), 'battle214'].sort())
      .toEqual(Object.values(QuestType).sort())
  })

  it.each(fixtures)('parses and converts %s without losing updater fields', (questType, fields) => {
    const schema = parse({ ...base, questType, ...fields })
    const result = convertToQuest(schema)
    expect(result.success).toBe(true)
    if (!result.success) throw result.error
    expect(typeof result.stuff).toBe('function')
    expect(result.stuff.questType).toBe(questType)
    expect(result.stuff.max).toEqual(schema.max)
    expect(result.stuff.key).toBe(schema.key)
    for (const [key, value] of Object.entries(fields)) {
      if (key !== 'definitions') expect(result.stuff).toHaveProperty(key, value)
    }
    expect(result.stuff.formatter({} as Quest)).toBe('')
    if (fields.definitions === deck) {
      if (!('isDeckMatch' in result.stuff)) throw new Error('Missing deck matcher')
      const svdata = new kcs.SvData(kcs.createSvDataRaw())
      expect(result.stuff.isDeckMatch(svdata, [1, -1])).toBe(false)
      expect(result.stuff.isDeckMatch(svdata, [1, 2, -1])).toBe(true)
    }
    if (questType === 'battleEnemy') expect(result.stuff).toHaveProperty('type', [13])
  })

  it('preserves maps, ignores formatter text and isolates the converted definition', () => {
    const schema = parse({ ...base, questType: 'battleMapDeck', maps: [[7, 2, 'S', [7]]],
      formatter: ['<img>&'], definitions: deck, notFixState: true })
    const result = convertToQuestBattleMapDeck(schema)
    if (!result.success) throw result.error
    expect(result.stuff.notFixState).toBe(true)
    schema.max[0] = 99
    schema.formatter[0] = 'changed'
    schema.definitions.length = 0
    if (schema.questType === 'battleMapDeck') schema.maps[0][0] = 99
    expect(result.stuff.max).toEqual([6])
    expect(result.stuff.maps).toEqual([[7, 2, 'S', [7]]])
    const record = { state: { count: [2], countMax: [6] } } as Quest
    expect(result.stuff.formatter(record)).toBe('<span>7-2S(第1)：2/6</span>')
    expect(result.stuff.isDeckMatch(new kcs.SvData(kcs.createSvDataRaw()), [1])).toBe(false)
  })

  it.each(['battleMap', 'battleMapDeck', 'mapGoal', 'gaugeClear'])('formats %s from maps', (questType) => {
    const schema = parse({ ...base, questType, max: [3], maps: [[1, 5, 'A']],
      formatter: ['ignored', 'also ignored'] })
    const result = convertToQuest(schema)
    if (!result.success) throw result.error
    expect(result.stuff.formatter({ state: { count: [2], countMax: [3] } } as Quest))
      .toBe('<span>1-5A：2/3</span>')
    expect(result.stuff.formatter({ state: { count: [3], countMax: [3] } } as Quest))
      .toBe('<span class="cleared">1-5A：3/3</span>')
  })

  it('uses completed/pending labels for single-count map quests with empty formatter', () => {
    const result = convertToQuest(parse({ ...base, questType: 'battleMap', max: [1], maps }))
    if (!result.success) throw result.error
    expect(result.stuff.formatter({ state: { count: [0], countMax: [1] } } as Quest))
      .toBe('<span>1-1S：未</span>')
    expect(result.stuff.formatter({ state: { count: [1], countMax: [1] } } as Quest))
      .toBe('<span class="cleared">1-1S：済</span>')
  })

  it('still escapes formatter text for non-map quests', () => {
    const result = convertToQuest(parse({ ...base, questType: 'nyukyo', formatter: ['<img>&'] }))
    if (!result.success) throw result.error
    expect(result.stuff.formatter({ state: { count: [2], countMax: [6] } } as Quest))
      .toBe('<span>&lt;img&gt;&amp;2/6</span>')
  })

  it('retains the quest 230 converter and rejects the wrong quest type', () => {
    const enemy = parse({ ...base, questType: 'battleEnemy',
      definitions: [[{ type: 'enemyShipType', enemyType: [13] }]] })
    expect(convertToQuestBattleEnemy(enemy).success).toBe(true)
    expect(convertToQuestBattleMapDeck(enemy).success).toBe(false)
    expect(convertToQuestBattleEnemy(parse({ ...base, questType: 'nyukyo' })).success).toBe(false)
  })

  it.each(['battle214'])('rejects unsupported %s', questType => {
    const data = { ...base, questType, max: questType === 'battle214' ? [36, 6, 24, 12] : [6] }
    expect(tryParseQuestSchemas(JSON.stringify(data)).success).toBe(false)
    expect(convertToQuest(data as QuestSchema).success).toBe(false)
  })

  it('does not silently accept kaisouUseType with the legacy no-op null condition', () => {
    const schema = parse({ ...base, questType: 'kaisouUseType', powerup_ship_type: null, use_ship_type: null })
    expect(convertToQuest(schema).success).toBe(false)
  })
})

describe('quest schema validation', () => {
  it.each([
    { questType: 'practice' },
    { questType: 'practiceDeck', need_win_rank: 'C' },
    { questType: 'collectItem', item_id: 999999 },
    { questType: 'mapStart', area_id: -1, area_no: 1 },
    { questType: 'battle', need_win: 'true' },
    { questType: 'battleMapDeck' },
    { questType: 'battleMapDeck', maps: [] },
    { questType: 'battleMapDeck', maps: [[1, 1, 'X']] },
    { questType: 'battleMapDeck', maps: [[1, 1, 'S', ['7']]] },
    { questType: 'battleMapDeck', maps: [[1, 1, 'S', null]] },
    { questType: 'battleMapDeck', maps, max: [1, 2] },
    { questType: 'battleMapDeck', maps, definitions: [[{ type: 'enemyShipType', enemyType: [13] }]] },
    { questType: 'battleEnemy', definitions: [] },
    { questType: 'battleEnemy', definitions: [[{ type: 'enemyShipType', enemyType: [999] }]] },
    { questType: 'battleEnemy', definitions: [...deck, [{ type: 'enemyShipType', enemyType: [13] }]] },
    { questType: 'battle214', max: [1] },
    { questType: 'missionSpecific', names: [['a'], ['b']] },
    { questType: 'missionSpecific', names: [[]] },
    { questType: 'kaisou', need_succeeded: 1 },
    { questType: 'kaisouUseType', powerup_ship_type: null, use_ship_type: [2] },
    { questType: 'kaisouUseId', powerup_ship_type: 999, use_ship_ids: [1], use_ship_count: 1 },
    { questType: 'kaisouUseIdToId', powerup_ship_ids: [], use_ship_ids: [1], use_ship_count: 1 },
    { questType: 'kaisouUseTypeToId', powerup_ship_ids: [1], use_ship_type: [999], use_ship_count: 1 },
    { questType: 'kaisouUseCategoryToCategory', powerup_ship_cats: [9999], use_ship_cats: [1], use_ship_count: 1 },
    { questType: 'kaisouUseCategoryToType', powerup_ship_cats: [1], use_ship_types: [2], use_ship_count: 0 },
    { questType: 'slotitemCondition', slotitem_ids: [1, 2] },
    { questType: 'nyukyo', definitions: deck },
    { questType: 'nyukyo', max: [] },
    { questType: 'nyukyo', max: [0] },
    { questType: 'nyukyo', no: 0 },
    { questType: 'nyukyo', notFixState: 'true' },
    { questType: 'nyukyo', formatter: ['one', 'two'] },
    { questType: 'hensei', definitions: [[{ type: 'shipTypeCount', shipTypes: [999], operator: 'gte', value: 1 }]] },
    { questType: 'hensei', definitions: [[{ type: 'shipCount', shipIds: [1], scope: ['flagship'], operator: 'gte', value: 1 }]] },
    { questType: 'hensei', definitions: [[{ type: 'constructor' }]] },
  ])('rejects invalid schema %#', fields => {
    const data = { ...base, ...fields }
    expect(tryParseQuestSchemas(JSON.stringify(data)).success).toBe(false)
    expect(convertToQuest(data as QuestSchema).success).toBe(false)
  })
})

describe('converted deck conditions', () => {
  it('checks ship ids, ship types, categories, position and minimum level', () => {
    const ships = [
      { api: { api_lv: 50 }, mst: { api_id: 100, api_stype: 3, api_ctype: 1 } },
      { api: { api_lv: 30 }, mst: { api_id: 200, api_stype: 2, api_ctype: 2 } },
      { api: { api_lv: 10 }, mst: { api_id: 201, api_stype: 2, api_ctype: 2 } },
    ] as kcs.ShipMst[]
    const svdata = new kcs.SvData(kcs.createSvDataRaw())
    vi.spyOn(kcs, 'toShipMsts').mockImplementation((_svdata, ids) => ids.map(id => ships[id - 1]))
    vi.spyOn(svdata, 'shipMstIds').mockReturnValue([100])
    const schema = parse({ ...base, questType: 'battleMapDeck', maps, definitions: [[
      { type: 'shipCount', shipIds: [83], scope: 'flagship', operator: 'eq', value: 1 },
      { type: 'shipTypeCount', shipTypes: [2], scope: 'escort', minLevel: 20, operator: 'gte', value: 1 },
      { type: 'shipCategoryCount', shipCategories: [2], scope: 'all', operator: 'lte', value: 2 },
    ]] })
    const result = convertToQuestBattleMapDeck(schema)
    if (!result.success) throw result.error
    expect(result.stuff.isDeckMatch(svdata, [1, 2, 3])).toBe(true)
    expect(result.stuff.isDeckMatch(svdata, [2, 1, 3])).toBe(false)
    expect(result.stuff.isDeckMatch(svdata, [1, 3])).toBe(false)
  })
})
