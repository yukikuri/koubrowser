import { afterEach, describe, expect, it, vi } from 'vitest'
import { tryParseQuestSchemas } from '@common/kcquest_parser'
import { convertToQuest } from '@common/kcquest_converter'
import * as kcs from '@common/kcs'

const condition = {
  type: 'shipCountSum', operator: 'gte', value: 4,
  shipIds: [439, 78, 515, 571], shipCategories: [kcs.ApiShipCategory.jervis],
}

function parseCondition(definition: unknown): ReturnType<typeof tryParseQuestSchemas> {
  return tryParseQuestSchemas(JSON.stringify({
    no: 345, questType: 'practiceDeck', max: [4], key: 'daily',
    need_win_rank: 'A', formatter: ['演習A勝利以上：'],
    definitions: [[{ type: 'deckShipCount', operator: 'gte', value: 4 }, definition]],
  }))
}

afterEach(() => vi.restoreAllMocks())

describe('shipCountSum', () => {
  it.each([
    ['gte', 4, true], ['gte', 5, false],
    ['eq', 4, true], ['eq', 3, false],
    ['lte', 4, true], ['lte', 3, false],
  ])('compares combined counts with %s %s', (operator, value, expected) => {
    const parsed = parseCondition({ ...condition, operator, value })
    if (!parsed.success) throw parsed.error
    const result = convertToQuest(parsed.schemas[0])
    if (!result.success) throw result.error
    if (result.stuff.questType !== 'practiceDeck') throw new Error('Unexpected quest type')
    const svdata = new kcs.SvData(kcs.createSvDataRaw())
    const ships = [
      { mst: { api_id: 1439, api_ctype: 1 } },
      { mst: { api_id: 1078, api_ctype: 1 } },
      { mst: { api_id: 9991, api_ctype: kcs.ApiShipCategory.jervis } },
      { mst: { api_id: 9992, api_ctype: kcs.ApiShipCategory.jervis } },
    ] as kcs.ShipMst[]
    vi.spyOn(kcs, 'toShipMsts').mockReturnValue(ships)
    vi.spyOn(svdata, 'shipMstIds').mockImplementation(id => [id, id + 1000])
    expect(result.stuff.isDeckMatch(svdata, [1, 2, 3, 4])).toBe(expected)
    expect(result.stuff.isDeckMatch(svdata, [1, 2, 3])).toBe(false)
  })

  it('counts overlapping targets twice without deduplication', () => {
    const parsed = parseCondition({ ...condition, operator: 'eq', value: 2 })
    if (!parsed.success) throw parsed.error
    const result = convertToQuest(parsed.schemas[0])
    if (!result.success) throw result.error
    if (result.stuff.questType !== 'practiceDeck') throw new Error('Unexpected quest type')
    const svdata = new kcs.SvData(kcs.createSvDataRaw())
    vi.spyOn(kcs, 'toShipMsts').mockReturnValue([
      { mst: { api_id: 439, api_ctype: kcs.ApiShipCategory.jervis } },
    ] as kcs.ShipMst[])
    vi.spyOn(svdata, 'shipMstIds').mockImplementation(id => [id])
    expect(result.stuff.isDeckMatch(svdata, [1, 2, 3, 4])).toBe(true)
  })

  it.each([
    { shipIds: undefined }, { shipIds: [] }, { shipIds: ['439'] }, { shipIds: [0] },
    { shipCategories: undefined }, { shipCategories: [] }, { shipCategories: [999999] },
    { shipCategories: ['1'] }, { operator: 'gt' }, { value: -1 }, { value: 1.5 },
  ])('rejects malformed condition %#', override => {
    expect(parseCondition({ ...condition, ...override }).success).toBe(false)
  })
})
