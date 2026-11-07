import { afterEach, describe, expect, it, vi } from 'vitest'
import { getQuestStuff } from '@common/kcquest'
import { QuestKey, QuestType } from '@common/kcquest_types'
import { SvData, createSvDataRaw, ApiShipType as Type, SlotitemType, type ApiShip, type MstShip } from '@common/kcs'
import type { QuestMap } from '@common/kcquest_definition'
import type { Quest } from '@common/record'

interface ShipFixture { id: number; type: Type }
const ship = (id: number, type: Type = Type.kutikukan): ShipFixture => ({ id, type })
const dd = ship(90001)
const dd2 = ship(90002)
const dd3 = ship(90003)
const dd4 = ship(90004)
const cl = ship(90005, Type.keijyun)
const ca = ship(90006, Type.jyuujyun)

afterEach(() => vi.restoreAllMocks())

function quest(id: number): NonNullable<ReturnType<typeof getQuestStuff>> {
  const result = getQuestStuff(id)
  if (!result) throw new Error(`Missing quest ${id}`)
  return result
}

function matches(id: number, fleet: ShipFixture[]): boolean {
  const stuff = quest(id)
  if (stuff.questType !== QuestType.battleMapDeck && stuff.questType !== QuestType.hensei) {
    throw new Error(`No fleet condition: ${id}`)
  }
  const raw = createSvDataRaw()
  // Minimal API fixtures; counting and fleet predicates use the production helpers.
  raw.apiData.api_mst_ship.push(...fleet.map((s) => ({
    api_id: s.id, api_stype: s.type, api_aftershipid: '0',
  }) as MstShip))
  raw.apiData.api_ship.push(...fleet.map((s, i) => ({ api_id: i + 1, api_ship_id: s.id }) as ApiShip))
  const data = new SvData(raw)
  const remodels: Record<number, number[]> = { 464: [464, 470], 463: [463, 468], 96: [96, 199] }
  vi.spyOn(data, 'shipMstIds').mockImplementation((id) => remodels[id] ?? [id])
  return stuff.isDeckMatch(data, [...fleet.map((_, i) => i + 1), ...Array<number>(6 - fleet.length).fill(-1)])
}

interface MapCase {
  id: number
  maps: QuestMap[]
  max: number[]
  fleet?: ShipFixture[]
  flagship?: boolean
}

const maps: MapCase[] = [
  { id: 805, maps: [[3, 1, 'B']], max: [1], fleet: [ship(464), dd, dd2, dd3], flagship: true },
  { id: 806, maps: [[2, 5, 'S']], max: [1], fleet: [ship(464), dd, dd2], flagship: true },
  { id: 807, maps: [[1, 6, '']], max: [1], fleet: [ship(141, Type.keijyun), ship(418), ship(309)], flagship: true },
  { id: 808, maps: [[2, 3, 'S']], max: [1], fleet: [ship(242), ship(43), ship(405), ship(46)], flagship: true },
  { id: 809, maps: [[6, 3, 'B']], max: [1] },
  { id: 810, maps: [[1, 3, 'S']], max: [3], fleet: [cl, dd] },
  { id: 811, maps: [[1, 4, 'S']], max: [5] },
  { id: 812, maps: [[2, 3, 'S']], max: [6], fleet: [ship(96)], flagship: true },
  { id: 813, maps: [[3, 5, 'S']], max: [1], fleet: [ship(199)], flagship: true },
  { id: 814, maps: [[4, 1, 'A']], max: [1], fleet: [ship(158, Type.keijyun), ship(469), ship(145), dd, dd2] },
  { id: 815, maps: [[4, 5, 'S']], max: [1], fleet: [ship(83, Type.seiki_kuubo), ship(84, Type.seiki_kuubo)], flagship: true },
  { id: 816, maps: [[2, 2, 'S'], [2, 3, 'S']], max: [1, 1] },
  { id: 818, maps: [[1, 6, '']], max: [1], fleet: [cl, dd, dd2, dd3, dd4], flagship: true },
  { id: 819, maps: [[1, 6, '']], max: [2], fleet: [ship(141, Type.keijyun), ship(418), ship(309)], flagship: true },
  { id: 820, maps: [[1, 6, '']], max: [1], fleet: [ship(463), ship(97), ship(96), ship(98)], flagship: true },
  { id: 821, maps: [[1, 5, 'S']], max: [2], fleet: [ship(468), ship(199)] },
  { id: 823, maps: [[1, 4, 'A']], max: [2], fleet: [cl, dd, dd2, dd3, dd4], flagship: true },
]

describe.each(maps)('quest $id', ({ id, maps: expectedMaps, max, fleet, flagship }) => {
  it('has the expected maps, ranks and one counter per map', () => {
    const stuff = quest(id)
    expect(stuff.questType).toBe(fleet ? QuestType.battleMapDeck : QuestType.battleMap)
    if (stuff.questType !== QuestType.battleMapDeck && stuff.questType !== QuestType.battleMap) throw new Error('Unexpected type')
    expect(stuff.maps).toEqual(expectedMaps)
    expect(stuff.max).toEqual(max)
    expect(stuff.maps).toHaveLength(stuff.max.length)
    expect(stuff.key).toBe(QuestKey.infer)
  })
  if (!fleet) return
  it('accepts the required fleet', () => expect(matches(id, fleet)).toBe(true))
  it('rejects an empty fleet', () => expect(matches(id, [])).toBe(false))
  fleet.forEach((_, index) => {
    it(`rejects replacing required ship ${index + 1}`, () => {
      expect(matches(id, fleet.map((s, i) => i === index ? ca : s))).toBe(false)
    })
  })
  if (flagship) {
    it('rejects placing the required flagship in the escort', () => {
      expect(matches(id, [ca, ...fleet])).toBe(false)
    })
  } else {
    it('accepts the same fleet in reverse order', () => expect(matches(id, [...fleet].reverse())).toBe(true))
  }
})

describe('fleet boundary conditions', () => {
  it.each([805, 806])('accepts Kasumi Kai Ni Otsu for %i', (id) => {
    expect(matches(id, [ship(470), dd, dd2, dd3])).toBe(true)
  })
  it('accepts Asashio Kai Ni D for 820', () => {
    expect(matches(820, [ship(468), ship(97), ship(96), ship(98)])).toBe(true)
  })
  it('rejects two light cruisers for 810', () => {
    expect(matches(810, [cl, ship(90007, Type.keijyun), dd])).toBe(false)
  })
  it('rejects Asashio Kai Ni without D for 821', () => {
    expect(matches(821, [ship(463), ship(199)])).toBe(false)
  })
  it('accepts a torpedo cruiser flagship for 823', () => {
    expect(matches(823, [ship(90008, Type.raijyun), dd, dd2, dd3, dd4])).toBe(true)
  })
})

describe('quest 154', () => {
  const fleet = [ship(86), ship(85), ship(21, Type.keijyun), ship(34), ship(36), ship(37)]
  it('requires all six named ships without a flagship restriction', () => {
    expect(quest(154).max).toEqual([1])
    expect(matches(154, fleet)).toBe(true)
    expect(matches(154, [...fleet].reverse())).toBe(true)
  })
  fleet.forEach((_, index) => {
    it(`rejects missing named ship ${index + 1}`, () => {
      expect(matches(154, fleet.filter((_, i) => i !== index))).toBe(false)
      expect(matches(154, fleet.map((s, i) => i === index ? dd : s))).toBe(false)
    })
  })
})

describe.each([
  { id: 669, max: [2, 2], items: [{ id: 27 }, { id: 28 }], condition: { flagship_slotitem_ids: [205], flagship_slotitem_lvl: [10], flagship_slotitem_alv_max: true } },
  { id: 670, max: [2, 2], items: [{ id: 27 }, { id: 28 }], condition: { flagship_slotitem_ids: [206], flagship_slotitem_lvl: [10], flagship_slotitem_alv_max: true } },
  { id: 671, max: [2, 2], items: [{ id: 27 }, { id: 28 }], condition: { flagship_slotitem_ids: [256], flagship_slotitem_lvl: [] } },
  { id: 672, max: [3], items: [{ types: [SlotitemType.SmallRadar, SlotitemType.LargeRadar] }], condition: { flagship_slotitem_ids: [107], flagship_slotitem_lvl: [] } },
  { id: 682, max: [4, 4], items: [{ type: SlotitemType.MediumMainGun }, { type: SlotitemType.LargeMainGun }], condition: undefined },
  { id: 683, max: [3, 2], items: [{ id: 8 }, { id: 28 }], condition: { flagship_ids: [553], flagship_slotitem_ids: [105], flagship_slotitem_lvl: [10] } },
  { id: 684, max: [3, 3], items: [{ id: 23 }, { id: 24 }], condition: { flagship_ids: [553], flagship_slotitem_ids: [0, 0, 291], flagship_slotitem_lvl: [] } },
])('scrap quest $id', ({ id, max, items, condition }) => {
  it('has the expected counters, equipment and prerequisite', () => {
    const stuff = quest(id)
    if (stuff.questType !== QuestType.destroyItemIdOrType) throw new Error('Unexpected type')
    const data = new SvData(createSvDataRaw())
    vi.spyOn(data, 'shipMstIds').mockImplementation((id) => [id])
    expect(stuff.key).toBe(QuestKey.infer)
    expect(stuff.max).toEqual(max)
    expect(stuff.id_or_types).toEqual(items)
    expect(stuff.id_or_types).toHaveLength(stuff.max.length)
    expect(stuff.getCondition(data)).toEqual(condition)
  })
})

it('formats quest 672 as one combined radar counter', () => {
  const stuff = quest(672)
  if (stuff.questType !== QuestType.destroyItemIdOrType) throw new Error('Unexpected type')
  const record = { state: { count: [1], countMax: [3] } } as Quest
  expect(stuff.formatter(record)).toBe('<span>破棄 電探：1/3</span>')
})
