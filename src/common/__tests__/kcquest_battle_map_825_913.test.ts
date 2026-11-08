import { afterEach, describe, expect, it, vi } from 'vitest'
import { getQuestStuff, type QuestBattleMap, type QuestBattleMapDeck } from '@common/kcquest'
import { QuestKey, QuestType } from '@common/kcquest_types'
import type { QuestMapOrCell } from '@common/kcquest_definition'
import {
  ApiShipCategory as Category,
  ApiShipType as Type,
  SvData,
  createSvDataRaw,
  type ApiShip,
  type MstShip,
} from '@common/kcs'

interface ShipFixture {
  id: number
  type: Type
  category: Category
  lv: number
}

function ship(id: number, type: Type = Type.kutikukan, category: Category = Category.none, lv = 99): ShipFixture {
  return { id, type, category, lv }
}

const dd = ship(90001)
const dd2 = ship(90002)
const dd3 = ship(90003)
const dd4 = ship(90004)
const cl = ship(90005, Type.keijyun)
const clt = ship(90006, Type.raijyun)
const ct = ship(90007, Type.renjyun)
const ca = ship(90008, Type.jyuujyun)
const cav = ship(90009, Type.koujyun)
const cv = ship(90010, Type.seiki_kuubo)
const cvl = ship(90011, Type.kei_kuubo)
const av = ship(90012, Type.suibo)
const bb = ship(90013, Type.teisoku_senkan)
const bb2 = ship(90014, Type.teisoku_senkan)
const bbv = ship(90015, Type.koukuu_senkan)
const bbv2 = ship(90016, Type.koukuu_senkan)
const fbb = ship(90017, Type.kousoku_senkan)
const de = ship(90018, Type.kaiboukan)
const ss = ship(90019, Type.sensuikan)
const ssv = ship(90020, Type.sensui_kuubo)
const ss2 = ship(90021, Type.sensuikan)
const ssv2 = ship(90022, Type.sensui_kuubo)
const other = ship(90023, Type.kousakusen)

// Remodel lookup is stubbed at the data boundary; fleet counting and level checks run unchanged.
const remodels: Readonly<Record<number, readonly number[]>> = {
  65: [65, 194],
  82: [82, 553],
  88: [88, 554],
  95: [95, 463, 468],
  96: [96, 199],
  97: [97, 489],
  98: [98, 490],
  214: [214, 478],
  276: [276, 573],
  503: [503, 508],
  504: [504, 509],
  545: [545, 550],
  622: [622, 623, 624],
}

afterEach(() => vi.restoreAllMocks())

function quest(id: number): QuestBattleMap | QuestBattleMapDeck {
  const stuff = getQuestStuff(id)
  if (!stuff || (stuff.questType !== QuestType.battleMap && stuff.questType !== QuestType.battleMapDeck)) {
    throw new Error(`Missing map quest: ${id}`)
  }
  return stuff
}

function matches(id: number, fleet: ShipFixture[]): boolean {
  const stuff = quest(id)
  if (stuff.questType !== QuestType.battleMapDeck) throw new Error(`No fleet condition: ${id}`)
  const raw = createSvDataRaw()
  // Only the fields consumed by the fleet helpers are required in these API fixtures.
  raw.apiData.api_mst_ship.push(...fleet.map((item) => ({
    api_id: item.id, api_stype: item.type, api_ctype: item.category, api_aftershipid: '0',
  }) as MstShip))
  raw.apiData.api_ship.push(...fleet.map((item, index) => ({
    api_id: index + 1, api_ship_id: item.id, api_lv: item.lv,
  }) as ApiShip))
  const svdata = new SvData(raw)
  vi.spyOn(svdata, 'shipMstIds').mockImplementation((id) => [...(remodels[id] ?? [id])])
  const ids = fleet.map((_item, index) => index + 1)
  return stuff.isDeckMatch(svdata, [...ids, ...Array<number>(6 - ids.length).fill(-1)])
}

interface QuestCase {
  id: number
  maps: QuestMapOrCell[]
  max: number[]
  fleet?: ShipFixture[]
  flagship?: boolean
  required?: number[]
  ordered?: boolean
}

// Expected definitions are intentionally independent of the registered quest objects.
const cases: QuestCase[] = [
  { id: 825, maps: [[2, 2, 'S'], [2, 3, 'S']], max: [1, 1], fleet: [cl, dd, dd2, dd3, dd4], flagship: true },
  { id: 826, maps: [[1, 5, 'A']], max: [1], fleet: [ship(12), ship(486), ship(13), ship(14)] },
  { id: 827, maps: [[2, 5, 'A']], max: [1], fleet: [ship(12), ship(486), ship(13), ship(14)] },
  { id: 828, maps: [[6, 3, 'S']], max: [1] },
  { id: 829, maps: [[5, 3, 'A']], max: [1] },
  { id: 830, maps: [[2, 1, 'S']], max: [1] },
  { id: 834, maps: [[1, 4, 'S']], max: [1], fleet: [av], flagship: true },
  { id: 835, maps: [[2, 4, 'A']], max: [1], fleet: [ship(113, Type.keijyun), ship(61, Type.jyuujyun), ship(25, Type.keijyun), ship(24, Type.keijyun)] },
  { id: 836, maps: [[2, 5, 'S']], max: [1], fleet: [ship(487, Type.keijyun), ship(119, Type.raijyun), ship(118, Type.raijyun), ship(215, Type.keijyun), ship(264, Type.jyuujyun), ship(368)], flagship: true },
  { id: 837, maps: [[2, 2, 'S']], max: [1], fleet: [ship(487, Type.keijyun), ship(368), dd, dd2, dd3], flagship: true },
  { id: 838, maps: [[2, 3, 'S']], max: [1], fleet: [ca, cav, ship(90024, Type.jyuujyun), ship(90025, Type.koujyun)], flagship: true },
  { id: 839, maps: [[3, 3, 'S']], max: [1], fleet: [fbb, bbv], flagship: true },
  { id: 842, maps: [[2, 4, 'S']], max: [1], fleet: [bb, bb2] },
  { id: 844, maps: [[5, 5, 'A']], max: [2], fleet: [ship(490), ship(97)], flagship: true },
  { id: 846, maps: [[6, 1, 'B']], max: [1], fleet: [ss, ssv, ss2, ssv2], flagship: true },
  { id: 848, maps: [[5, 3, 'A']], max: [1], fleet: [ship(496, Type.jyuujyun)], flagship: true },
  { id: 849, maps: [[1, 4, 'A'], [2, 2, 'A'], [2, 3, 'A']], max: [1, 1, 1], fleet: [cl], flagship: true },
  { id: 850, maps: [[3, 5, 'S'], [4, 4, 'S'], [6, 2, 'S']], max: [1, 1, 1], fleet: [cv], flagship: true },
  { id: 851, maps: [[5, 1, 'A'], [5, 3, 'A']], max: [1, 1], fleet: [ship(503, Type.koujyun)], flagship: true },
  { id: 852, maps: [[6, 2, 'S'], [6, 5, 'S']], max: [1, 1], fleet: [ship(508, Type.kei_kuubo)], flagship: true },
  { id: 853, maps: [[1, 2, 'A'], [1, 3, 'A'], [1, 4, 'A'], [1, 5, 'A']], max: [1, 1, 1, 1], fleet: [ca, dd, dd2], flagship: true },
  { id: 855, maps: [[1, 3, 'S'], [1, 4, 'S'], [1, 5, 'S'], [1, 6, '']], max: [1, 1, 1, 1], fleet: [dd, de, dd2] },
  { id: 856, maps: [[4, 5, 'S'], [5, 5, 'S']], max: [1, 1], fleet: [ship(541, Type.teisoku_senkan), ship(276, Type.teisoku_senkan)], flagship: true },
  { id: 857, maps: [[2, 2, 'A'], [2, 3, 'A'], [2, 4, 'A'], [2, 5, 'A']], max: [1, 1, 1, 1], fleet: [cl, dd, de, cav] },
  { id: 858, maps: [[4, 5, 'S'], [6, 2, 'S']], max: [1, 1], fleet: [ship(504, Type.koujyun), ship(503, Type.koujyun), ship(73, Type.koujyun), ship(121, Type.koujyun)], flagship: true },
  { id: 859, maps: [[2, 5, 'A'], [3, 5, 'A']], max: [1, 1], fleet: [ship(82, Type.koukuu_senkan, Category.ise, 50), ship(88, Type.koukuu_senkan, Category.ise, 50), cl, dd, dd2], ordered: true },
  { id: 860, maps: [[2, 3, 'S'], [5, 1, 'S']], max: [1, 1], fleet: [ship(488, Type.keijyun), ship(44), ship(45)], flagship: true },
  { id: 863, maps: [[3, 2, 'S']], max: [1], fleet: [ship(548), ship(418), ship(258), ship(366)] },
  { id: 864, maps: [[5, 5, 'S'], [6, 2, 'S']], max: [1, 1], fleet: [ship(545, Type.seiki_kuubo), cl, dd, dd2], flagship: true },
  { id: 865, maps: [[6, 5, 'S']], max: [1], fleet: [ship(545, Type.seiki_kuubo)], flagship: true },
  { id: 870, maps: [[1, 2, 'S'], [2, 2, 'S']], max: [1, 1], fleet: [ship(95), ship(96), ship(98), ship(97)] },
  { id: 871, maps: [[3, 2, 'S'], [5, 4, 'S']], max: [1, 1], fleet: [ship(463), ship(199), ship(490), ship(489)] },
  { id: 874, maps: [[3, 5, 'S']], max: [2], fleet: [cvl, av, cl] },
  { id: 876, maps: [[1, 4, 'A'], [1, 6, '']], max: [2, 2], fleet: [ship(214, Type.keijyun), dd, de, dd2], flagship: true },
  { id: 877, maps: [[5, 1, 'A'], [5, 3, 'A'], [5, 4, 'A']], max: [1, 1, 1], fleet: [ship(498), ship(488, Type.keijyun), ship(144), ship(323)], flagship: true },
  { id: 878, maps: [[1, 4, 'A'], [1, 6, '']], max: [3, 3], fleet: [cl, dd, de, dd2], flagship: true },
  { id: 879, maps: [[1, 6, ''], [2, 5, 'A'], [3, 5, 'A'], [4, 5, 'A']], max: [1, 1, 1, 1], fleet: [ship(82, Type.koukuu_senkan), ship(88, Type.koukuu_senkan), ship(321, Type.keijyun), dd] },
  { id: 880, maps: [[1, 6, ''], [2, 3, 'A'], [3, 2, 'A'], [4, 2, 'A']], max: [1, 1, 1, 1], fleet: [dd, dd2, dd3, dd4] },
  { id: 881, maps: [[3, 2, 'S']], max: [2], fleet: [ship(198), ship(464), ship(225), ship(226)] },
  { id: 884, maps: [[4, 2, 'S'], [3, 2, 'S'], [5, 3, 'S']], max: [2, 2, 2], fleet: [ship(566, Type.kutikukan, Category.kagerou), ship(90026, Type.kutikukan, Category.kagerou, 75), ship(90027, Type.kutikukan, Category.yuugumo, 75), cl, cv, bb], flagship: true, required: [0, 1, 2] },
  { id: 885, maps: [[3, 5, 'S'], [4, 5, 'S'], [6, 4, 'S']], max: [1, 1, 1], fleet: [ship(553, Type.koukuu_senkan)], flagship: true },
  { id: 886, maps: [[6, 5, 'S']], max: [3], fleet: [ship(553, Type.koukuu_senkan), dd, dd2], flagship: true },
  { id: 887, maps: [[1, 2, 'S'], [1, 4, 'S'], [1, 5, 'S'], [1, 6, '']], max: [1, 1, 1, 1], fleet: [ship(477, Type.keijyun), ship(478, Type.keijyun), dd, dd2] },
  { id: 889, maps: [[2, 3, 'S'], [4, 1, 'S'], [5, 5, 'S'], [6, 5, 'S']], max: [1, 1, 1, 1], fleet: [ship(497), ship(145)] },
  { id: 890, maps: [[1, 4, 'S'], [2, 3, 'S'], [3, 3, 'S'], [4, 5, 'S']], max: [1, 1, 1, 1], fleet: [ship(428, Type.jyuujyun), ship(427, Type.jyuujyun)] },
  { id: 891, maps: [[1, 5, 'A'], [3, 2, 'A'], [7, 1, 'A'], [5, 1, 'A']], max: [1, 1, 1, 1], fleet: [ship(557), ship(558), ship(556), ship(559)] },
  { id: 892, maps: [[5, 3, 'S'], [5, 4, 'S'], [5, 5, 'S']], max: [1, 1, 1], fleet: [ship(542), ship(563)] },
  { id: 895, maps: [[3, 1, 'S'], [3, 3, 'S'], [3, 4, 'S'], [3, 5, 'S']], max: [2, 2, 2, 2], fleet: [cl], flagship: true },
  { id: 896, maps: [[1, 4, 'S'], [1, 5, 'S'], [2, 3, 'S'], [7, 2, 'S', [15]]], max: [1, 1, 1, 1], fleet: [bbv, bbv2] },
  { id: 897, maps: [[1, 6, ''], [4, 5, 'S'], [5, 5, 'S'], [6, 5, 'S']], max: [2, 1, 1, 1], fleet: [ship(554, Type.koukuu_senkan), ship(553, Type.koukuu_senkan)] },
  { id: 901, maps: [[2, 5, 'S'], [3, 3, 'S'], [5, 3, 'S'], [6, 3, 'S']], max: [1, 1, 1, 1], fleet: [ship(622, Type.keijyun)], flagship: true },
  { id: 902, maps: [[1, 5, 'S'], [2, 2, 'S'], [3, 2, 'S'], [7, 1, 'S'], [1, 6, '']], max: [1, 1, 1, 1, 1], fleet: [ship(622, Type.keijyun), ship(1), ship(2), ship(164)], flagship: true },
  { id: 911, maps: [[1, 3, 'A'], [1, 4, 'A'], [1, 5, 'A'], [2, 2, 'A'], [2, 3, 'A']], max: [1, 1, 1, 1, 1], fleet: [ship(569), ship(135), ship(527), ship(425)] },
  { id: 913, maps: [[3, 5, 'S'], [5, 2, 'S'], [7, 2, 'S', [15]], [6, 5, 'S']], max: [1, 1, 1, 1], fleet: [ship(110, Type.seiki_kuubo), ship(111, Type.seiki_kuubo), ship(93), ship(132)] },
]

describe.each(cases)('quest $id', ({ id, maps, max, fleet, flagship, required, ordered }) => {
  it('registers the expected type, maps, victory ranks, counters and reset key', () => {
    const stuff = quest(id)
    expect(stuff.questType).toBe(fleet ? QuestType.battleMapDeck : QuestType.battleMap)
    expect(stuff.maps).toEqual(maps)
    expect(stuff.max).toEqual(max)
    expect(stuff.key).toBe(QuestKey.infer)
  })

  if (fleet) {
    it('accepts the required fleet, including unused slots padded with -1', () => {
      expect(matches(id, fleet)).toBe(true)
    })

    it.each(required ?? fleet.map((_ship, index) => index))('rejects replacing required position %i with an unrelated ship', (index) => {
      const changed = [...fleet]
      changed[index] = other
      expect(matches(id, changed)).toBe(false)
    })

    if (flagship) {
      it('rejects moving the required flagship to an escort slot', () => {
        const changed = fleet.length < 6 ? [other, ...fleet] : [fleet[1], fleet[0], ...fleet.slice(2)]
        expect(matches(id, changed)).toBe(false)
      })
    } else if (!ordered) {
      it('does not require a particular flagship', () => {
        expect(matches(id, [...fleet.slice(1), fleet[0]])).toBe(true)
      })
    }
  }
})

function fleetFor(id: number): ShipFixture[] {
  const fleet = cases.find((item) => item.id === id)?.fleet
  if (!fleet) throw new Error(`Missing fleet fixture: ${id}`)
  return [...fleet]
}

describe('alternative ship and category conditions', () => {
  it.each([cl, clt, ct])('825 accepts light cruiser class $type as flagship', (flagship) => {
    expect(matches(825, [flagship, dd, dd2, dd3, dd4])).toBe(true)
  })

  it('834 accepts an aviation cruiser, but not an ordinary heavy cruiser', () => {
    expect(matches(834, [cav])).toBe(true)
    expect(matches(834, [ca])).toBe(false)
  })

  it('836 accepts Shikinami as one of the five eligible escorts', () => {
    const fleet = fleetFor(836)
    fleet[1] = ship(208)
    expect(matches(836, fleet)).toBe(true)
    expect(matches(836, fleet.slice(0, 5))).toBe(false)
  })

  it('842 requires two ships of the same eligible battleship type, not a mixed pair', () => {
    // Product requirement: do not sum battleships and aviation battleships for this quest.
    expect(matches(842, [bb, bb2])).toBe(true)
    expect(matches(842, [bbv, bbv2])).toBe(true)
    expect(matches(842, [bb, bbv])).toBe(false)
    expect(matches(842, [fbb, bb])).toBe(false)
    expect(matches(842, [bb])).toBe(false)
  })

  it.each([95, 96, 97, 489])('844 accepts escort %i, including Michishio and its remodel', (id) => {
    expect(matches(844, [ship(490), ship(id)])).toBe(true)
  })

  it('849 excludes torpedo and training cruisers', () => {
    expect(matches(849, [clt])).toBe(false)
    expect(matches(849, [ct])).toBe(false)
  })

  it.each([cv, cvl, ship(90028, Type.soukou_kuubo), av])('850 accepts carrier or seaplane tender $type', (flagship) => {
    expect(matches(850, [flagship])).toBe(true)
  })

  it('851 and 852 distinguish Suzuya cruiser and carrier forms', () => {
    expect(matches(851, [ship(508, Type.kei_kuubo)])).toBe(false)
    expect(matches(852, [ship(503, Type.koujyun)])).toBe(false)
  })

  it.each([ca, cav, cl, clt, ct])('853 accepts cruiser class $type as flagship', (flagship) => {
    expect(matches(853, [flagship, dd, dd2])).toBe(true)
  })

  it('856 requires Mutsu in the second slot and accepts Mutsu kai ni', () => {
    expect(matches(856, [ship(541, Type.teisoku_senkan), ship(573, Type.teisoku_senkan)])).toBe(true)
    expect(matches(856, [ship(541, Type.teisoku_senkan), dd, ship(276, Type.teisoku_senkan)])).toBe(false)
  })

  it('857 accepts a light carrier instead of an aviation cruiser, but not a standard carrier', () => {
    expect(matches(857, [cl, dd, de, cvl])).toBe(true)
    expect(matches(857, [cl, dd, de, cv])).toBe(false)
    expect(matches(857, [clt, dd, de, cav])).toBe(false)
  })

  it('858 requires Suzuya second and accepts the carrier remodels', () => {
    expect(matches(858, [ship(509, Type.kei_kuubo), ship(508, Type.kei_kuubo), ship(73, Type.koujyun), ship(121, Type.koujyun)])).toBe(true)
    const fleet = fleetFor(858)
    expect(matches(858, [fleet[0], fleet[2], fleet[1], fleet[3]])).toBe(false)
  })

  it.each([405, 46, 421])('860 accepts alternative escort %i', (id) => {
    expect(matches(860, [ship(488, Type.keijyun), ship(44), ship(id)])).toBe(true)
  })

  it('864 accepts Saratoga Mk.II Mod.2 while 865 requires Mk.II exactly', () => {
    expect(matches(864, [ship(550, Type.soukou_kuubo), cl, dd, dd2])).toBe(true)
    expect(matches(865, [ship(550, Type.soukou_kuubo)])).toBe(false)
  })

  it('870 accepts later remodels while 871 rejects unremodeled ships', () => {
    const upgraded = [ship(463), ship(199), ship(490), ship(489)]
    expect(matches(870, upgraded)).toBe(true)
    expect(matches(871, [ship(95), ship(96), ship(98), ship(97)])).toBe(false)
  })

  it('876 accepts Tatsuta kai ni and mixed destroyer/escort ships', () => {
    expect(matches(876, [ship(478, Type.keijyun), dd, dd2, de])).toBe(true)
  })

  it('877 does not require Yura if three other eligible escorts are present', () => {
    expect(matches(877, [ship(498), ship(144), ship(246), ship(330)])).toBe(true)
  })

  it.each([dd, clt, ct])('878 accepts flagship type $type', (flagship) => {
    expect(matches(878, [flagship, dd2, dd3, de])).toBe(true)
  })

  it.each([clt, ct])('895 accepts light cruiser class $type', (flagship) => {
    expect(matches(895, [flagship])).toBe(true)
  })

  it('896 does not count ordinary battleships as aviation battleships', () => {
    expect(matches(896, [bbv, bb])).toBe(false)
  })

  it.each([623, 624])('901 and 902 accept Yubari remodel %i', (id) => {
    expect(matches(901, [ship(id, Type.keijyun)])).toBe(true)
    expect(matches(902, [ship(id, Type.keijyun), ship(165), ship(30), ship(31)])).toBe(true)
  })
})

describe('level and fleet-size boundaries', () => {
  it.each([0, 1])('859 requires level 50 for position %i', (index) => {
    const fleet = fleetFor(859)
    expect(matches(859, fleet)).toBe(true)
    fleet[index] = { ...fleet[index], lv: 49 }
    expect(matches(859, fleet)).toBe(false)
  })

  it('859 allows Ise and Hyuga to exchange the first two slots, but not to move behind a cruiser', () => {
    const fleet = fleetFor(859)
    expect(matches(859, [fleet[1], fleet[0], ...fleet.slice(2)])).toBe(true)
    expect(matches(859, [fleet[0], cl, fleet[1], dd, dd2])).toBe(false)
    expect(matches(859, fleet.slice(0, 4))).toBe(false)
  })

  it.each([1, 2])('884 requires level 75 for eligible escort at position %i', (index) => {
    const fleet = fleetFor(884)
    expect(matches(884, fleet)).toBe(true)
    fleet[index] = { ...fleet[index], lv: 74 }
    expect(matches(884, fleet)).toBe(false)
  })

  it.each([566, 567, 568])('884 accepts flagship %i and requires six ships', (id) => {
    const fleet = fleetFor(884)
    fleet[0] = ship(id, Type.kutikukan, Category.kagerou)
    expect(matches(884, fleet)).toBe(true)
    expect(matches(884, fleet.slice(0, 5))).toBe(false)
  })

  it('884 does not count the flagship as one of the two eligible escorts', () => {
    const fleet = fleetFor(884)
    fleet[2] = dd
    expect(matches(884, fleet)).toBe(false)
  })
})
