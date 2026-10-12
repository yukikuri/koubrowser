import { afterEach, describe, expect, it, vi } from 'vitest'
import { tryParseQuestSchemas } from '@common/kcquest_parser'
import { convertToQuest } from '@common/kcquest_converter'
import { checkCondition } from '@common/kcquest'
import type { QuestConditionSchema } from '@common/kcquest_definition'
import { SvData, createSvDataRaw, SlotitemType, ApiItemId, ApiDeckPortId } from '@common/kcs'

const base = {
  no: 688, questType: 'destroyItemIdOrType', max: [3], key: 'infer',
  formatter: ['破棄：'], definitions: [], id_or_types: [{ type: SlotitemType.Fighter }],
}
const condition: QuestConditionSchema = {
  flagship: { mode: 'shipMstIds', ids: [594] },
  flagship_slotitem_ids: [342], flagship_slotitem_lvl: [], flagship_slotitem_alv_max: true,
}

function parse(data: unknown): ReturnType<typeof tryParseQuestSchemas> {
  return tryParseQuestSchemas(JSON.stringify(data))
}

function convert(data: unknown): ReturnType<typeof convertToQuest> {
  const parsed = parse(data)
  if (!parsed.success) throw parsed.error
  return convertToQuest(parsed.schemas[0])
}

afterEach(() => vi.restoreAllMocks())

describe('quest condition schema', () => {
  it.each(['collectItemCondition', 'destroyItemIdOrType'])('evaluates live fleet groups for %s without condition', questType => {
    const definitions = [
      [{ type: 'deckShipCount', operator: 'gte', value: 2 }, { type: 'deckShipCount', operator: 'lte', value: 3 }],
      [{ type: 'deckShipCount', operator: 'eq', value: 6 }],
    ]
    const result = convert({ ...base, questType, item_id: ApiItemId.fast_repair, definitions })
    if (!result.success) throw result.error
    if (!('getCondition' in result.stuff)) throw new Error('Missing getter')
    const svdata = new SvData(createSvDataRaw())
    const deck = vi.spyOn(svdata, 'deckPort').mockReturnValue(undefined)
    expect(result.stuff.getCondition(svdata)?.deck_checked).toBe(false)
    for (const [count, expected] of [[1, false], [2, true], [4, false], [6, true]] as const) {
      deck.mockReturnValue({ api_ship: Array.from({ length: count }, (_, i) => i + 1) } as ReturnType<SvData['deckPort']>)
      expect(result.stuff.getCondition(svdata)).toEqual({
        flagship_slotitem_ids: [], flagship_slotitem_lvl: [], deck_checked: expected,
      })
    }
    expect(deck).toHaveBeenLastCalledWith(ApiDeckPortId.deck1st)
    expect(parse({ ...base, questType, item_id: ApiItemId.fast_repair,
      definitions: [[{ type: 'enemyShipType', enemyType: [13] }]] }).success).toBe(false)
  })

  it('preserves condition fields and combines unresolved flagship failure with fleet results', () => {
    const result = convert({ ...base, condition, definitions: [[{ type: 'deckShipCount', operator: 'gte', value: 2 }]] })
    if (!result.success) throw result.error
    if (!('getCondition' in result.stuff)) throw new Error('Missing getter')
    const svdata = new SvData(createSvDataRaw())
    const deck = vi.spyOn(svdata, 'deckPort').mockReturnValue({ api_ship: [1, 2] } as ReturnType<SvData['deckPort']>)
    const ids = vi.spyOn(svdata, 'shipMstIds').mockReturnValue([])
    expect(result.stuff.getCondition(svdata)?.deck_checked).toBe(false)
    ids.mockReturnValue([594])
    expect(result.stuff.getCondition(svdata)).toMatchObject({
      flagship_ids: [594], flagship_slotitem_ids: [342], flagship_slotitem_alv_max: true, deck_checked: true,
    })
    deck.mockReturnValue({ api_ship: [1] } as ReturnType<SvData['deckPort']>)
    expect(result.stuff.getCondition(svdata)?.deck_checked).toBe(false)
  })

  it('resolves current ship IDs on every call and isolates mutable data', () => {
    const data = { ...base, condition: structuredClone(condition) }
    const result = convert(data)
    if (!result.success) throw result.error
    if (result.stuff.questType !== 'destroyItemIdOrType') throw new Error('Unexpected quest type')
    data.condition.flagship_slotitem_ids[0] = 999
    const svdata = new SvData(createSvDataRaw())
    const resolve = vi.spyOn(svdata, 'shipMstIds').mockReturnValue([594, 599])
    const first = result.stuff.getCondition(svdata)
    expect(first?.flagship_ids).toEqual([594, 599])
    expect(first?.flagship_slotitem_ids).toEqual([342])
    first?.flagship_slotitem_ids.push(999)
    resolve.mockReturnValue([594, 599, 600])
    const second = result.stuff.getCondition(svdata)
    expect(second?.flagship_ids).toEqual([594, 599, 600])
    expect(second?.flagship_slotitem_ids).toEqual([342])
    resolve.mockReturnValue([])
    expect(result.stuff.getCondition(svdata)?.deck_checked).toBe(false)
  })

  it('preserves exact IDs without expansion', () => {
    const result = convert({ ...base, condition: { ...condition, flagship: { mode: 'exact', ids: [594] } } })
    if (!result.success) throw result.error
    if (result.stuff.questType !== 'destroyItemIdOrType') throw new Error('Unexpected quest type')
    const svdata = new SvData(createSvDataRaw())
    const resolve = vi.spyOn(svdata, 'shipMstIds')
    expect(result.stuff.getCondition(svdata)?.flagship_ids).toEqual([594])
    expect(resolve).not.toHaveBeenCalled()
  })

  it.each([
    base,
    { no: 1, questType: 'collectItemCondition', max: [1], key: 'infer', formatter: [], definitions: [], item_id: ApiItemId.fast_repair },
  ])('supports optional conditions for $questType', data => {
    const result = convert(data)
    if (!result.success) throw result.error
    if (!('getCondition' in result.stuff)) throw new Error('Missing getter')
    expect(result.stuff.getCondition(new SvData(createSvDataRaw()))).toBeUndefined()
    expect(parse({ ...data, condition }).success).toBe(true)
  })

  it('supports all destruction selectors and quest 688 counters', () => {
    const selectors = [{ id: 17 }, { type: SlotitemType.Fighter },
      { types: [SlotitemType.DiveBomber, SlotitemType.TorpedoBomber] }, { id_with_alv: { id: 24, alv: 7 } }]
    const result = convert({ ...base, max: [3, 3, 3, 3], formatter: [], id_or_types: selectors })
    if (!result.success) throw result.error
    if (result.stuff.questType !== 'destroyItemIdOrType') throw new Error('Unexpected quest type')
    expect(result.stuff.id_or_types).toEqual(selectors)
    expect(parse({ ...base, id_or_types: [] }).success).toBe(true)
  })

  it.each([
    null, {}, { ...condition, flagship: { mode: 'unknown', ids: [594] } },
    { ...condition, flagship: { mode: 'exact', ids: [] } },
    { ...condition, flagship: { mode: 'exact', ids: ['594'] } },
    { ...condition, flagship_lv: -1 }, { ...condition, flagship_type_ids: [9999] },
    { ...condition, flagship_categories: [9999] },
    { ...condition, flagship_slotitem_ids: [-1] }, { ...condition, flagship_slotitem_lvl: [11] },
    { ...condition, flagship_slotitem_lvl: [0, 0] },
    { ...condition, flagship_slotitem_alv_max: 'true' },
    { ...condition, flagship_slotitem_only: 1 }, { ...condition, deck_checked: true },
    { ...condition, flagship_id_lvs: [] },
    { ...condition, flagship_slotitem_ids: [] },
  ].map(value => ({ value })))('rejects invalid or unsupported conditions %#', ({ value }) => {
    expect(parse({ ...base, condition: value }).success).toBe(false)
  })

  it.each([
    [{}], [{ id: 0 }], [{ type: 99999 }], [{ types: [] }],
    [{ id: 1, type: SlotitemType.Fighter }], [{ id_with_alv: { id: 1, alv: 8 } }],
  ].map(value => ({ value })))('rejects invalid destruction selectors %#', ({ value }) => {
    expect(parse({ ...base, id_or_types: value }).success).toBe(false)
  })

  it('rejects mismatched counters and conditions on unsupported quest types', () => {
    expect(parse({ ...base, max: [1, 1], formatter: [] }).success).toBe(false)
    expect(parse({ ...base, questType: 'nyukyo', condition }).success).toBe(false)
  })
})

describe('condition evaluation', () => {
  it('checks ship type, proficiency without level constraints, and single equipment', () => {
    const svdata = new SvData(createSvDataRaw())
    vi.spyOn(svdata, 'deckPort').mockReturnValue({ api_ship: [1] } as ReturnType<SvData['deckPort']>)
    vi.spyOn(svdata, 'ship').mockReturnValue({ api_ship_id: 594, api_lv: 80, api_slot: [10, 11] } as ReturnType<SvData['ship']>)
    vi.spyOn(svdata, 'mstShip').mockReturnValue({ api_id: 594, api_stype: 11 } as ReturnType<SvData['mstShip']>)
    let proficiency = 6
    let secondEquipped = false
    vi.spyOn(svdata, 'slot').mockImplementation(id => {
      if (id === 10 || (id === 11 && secondEquipped)) {
        return { api: { api_alv: proficiency, api_level: 0 }, mst: { api_id: 342 } } as ReturnType<SvData['slot']>
      }
      return undefined
    })
    const fields = { flagship_slotitem_ids: [342], flagship_slotitem_lvl: [], flagship_slotitem_alv_max: true }
    expect(checkCondition(svdata, fields)).toBe(false)
    proficiency = 7
    expect(checkCondition(svdata, fields)).toBe(true)
    expect(checkCondition(svdata, { ...fields, flagship_type_ids: [2] })).toBe(false)
    expect(checkCondition(svdata, { ...fields, flagship_type_ids: [11] })).toBe(true)
    proficiency = 0
    expect(checkCondition(svdata, { ...fields, flagship_slotitem_alv_max: false })).toBe(true)
    const only = { flagship_slotitem_ids: [342], flagship_slotitem_lvl: [], flagship_slotitem_only: true }
    expect(checkCondition(svdata, only)).toBe(true)
    secondEquipped = true
    expect(checkCondition(svdata, only)).toBe(false)
  })
})
