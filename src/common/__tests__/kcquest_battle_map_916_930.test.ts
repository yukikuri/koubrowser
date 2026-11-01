import { describe, expect, it } from 'vitest'
import { getQuestStuff, type QuestBattleMapDeck } from '@common/kcquest'
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

type ShipFixture = Pick<MstShip, 'api_id' | 'api_stype' | 'api_ctype' | 'api_aftershipid'>

function ship(id: number, type: Type, category: Category = Category.none, after = 0): ShipFixture {
  return { api_id: id, api_stype: type, api_ctype: category, api_aftershipid: String(after) }
}

const fixtures = {
  hiei: ship(592, Type.kousoku_senkan, Category.kongou),
  oldHiei: ship(150, Type.kousoku_senkan, Category.kongou, 592),
  kongou: ship(149, Type.kousoku_senkan, Category.kongou),
  gotland: ship(630, Type.keijyun),
  oldGotland: ship(579, Type.keijyun, Category.none, 630),
  mod2: ship(628, Type.kutikukan, Category.fletcher, 629),
  mk2: ship(629, Type.kutikukan, Category.fletcher, 628),
  johnston: ship(562, Type.kutikukan, Category.fletcher),
  nelson: ship(571, Type.teisoku_senkan, Category.nelson),
  perth: ship(615, Type.keijyun, Category.perth),
  deRuyter: ship(614, Type.keijyun, Category.deRuyter),
  saratoga: ship(433, Type.seiki_kuubo, Category.lexington),
  gambierBay: ship(544, Type.kei_kuubo, Category.gambierBay),
  arkRoyal: ship(515, Type.seiki_kuubo, Category.arkRoyal),
  akagi: ship(594, Type.seiki_kuubo, Category.akagi, 599),
  akagiBo: ship(599, Type.seiki_kuubo, Category.akagi, 594),
  oldAkagi: ship(277, Type.seiki_kuubo, Category.akagi, 594),
  kaga: ship(698, Type.seiki_kuubo, Category.kaga, 646),
  kagaBo: ship(646, Type.seiki_kuubo, Category.kaga, 647),
  kagaGo: ship(647, Type.seiki_kuubo, Category.kaga, 698),
  oldKaga: ship(278, Type.seiki_kuubo, Category.kaga, 698),
  haguro: ship(65, Type.jyuujyun, Category.myoukou, 194),
  haguroKai2: ship(194, Type.jyuujyun, Category.myoukou),
  taigei: ship(184, Type.sensuibokan, Category.taigei),
  jingei: ship(634, Type.sensuibokan, Category.jingei),
  akigumo: ship(648, Type.kutikukan, Category.yuugumo),
  yuugumo: ship(542, Type.kutikukan, Category.yuugumo),
  makigumo: ship(563, Type.kutikukan, Category.yuugumo),
  kazagumo: ship(564, Type.kutikukan, Category.yuugumo),
  oldAkigumo: ship(132, Type.kutikukan, Category.yuugumo, 648),
  destroyer: ship(90001, Type.kutikukan),
  cruiser: ship(90002, Type.keijyun),
  torpedoCruiser: ship(90003, Type.raijyun),
  trainingCruiser: ship(90004, Type.renjyun),
  battleship: ship(90005, Type.teisoku_senkan),
  carrier: ship(90006, Type.seiki_kuubo),
  armoredCarrier: ship(90007, Type.soukou_kuubo),
  lightCarrier: ship(90008, Type.kei_kuubo),
  submarine: ship(90009, Type.sensuikan),
  submarineCarrier: ship(90010, Type.sensui_kuubo),
} satisfies Record<string, ShipFixture>

function quest(id: number): QuestBattleMapDeck {
  const result = getQuestStuff(id)
  if (!result || result.questType !== QuestType.battleMapDeck) {
    throw new Error(`Missing battleMapDeck quest: ${id}`)
  }
  return result
}

function matches(id: number, fleet: ShipFixture[]): boolean {
  const raw = createSvDataRaw()
  // Only fields read by the quest helpers are needed in these API fixtures.
  raw.apiData.api_mst_ship.push(...Object.values(fixtures).map((mst) => mst as MstShip))
  raw.apiData.api_ship.push(...fleet.map((mst, index) => ({
    api_id: index + 1,
    api_ship_id: mst.api_id,
    api_lv: 99,
  }) as ApiShip))
  const ids = fleet.map((_mst, index) => index + 1)
  return quest(id).isDeckMatch(new SvData(raw), [...ids, ...Array<number>(6 - ids.length).fill(-1)])
}

interface DefinitionCase {
  id: number
  maps: QuestMapOrCell[]
  max: number[]
}

const definitions: DefinitionCase[] = [
  { id: 916, maps: [[5, 1, 'S'], [5, 2, 'S'], [5, 3, 'S'], [5, 4, 'S'], [5, 5, 'S']], max: [1, 1, 1, 1, 1] },
  { id: 917, maps: [[2, 4, 'S'], [4, 2, 'S'], [4, 4, 'S'], [4, 5, 'S']], max: [1, 1, 1, 1] },
  { id: 918, maps: [[2, 5, 'S'], [6, 3, 'S'], [6, 4, 'S'], [6, 5, 'S']], max: [1, 1, 1, 1] },
  { id: 919, maps: [[2, 2, 'S'], [2, 3, 'S'], [2, 4, 'S']], max: [1, 1, 1] },
  { id: 920, maps: [[1, 4, 'S'], [2, 5, 'S'], [3, 5, 'S']], max: [1, 1, 1] },
  { id: 921, maps: [[1, 5, 'S'], [7, 1, 'S'], [6, 2, 'S'], [6, 5, 'S']], max: [2, 2, 2, 2] },
  { id: 922, maps: [[4, 5, 'S'], [5, 5, 'S'], [6, 4, 'S']], max: [2, 2, 2] },
  { id: 923, maps: [[4, 3, 'S'], [3, 4, 'S'], [5, 2, 'S'], [7, 2, 'S', [15]]], max: [1, 1, 1, 1] },
  { id: 924, maps: [[2, 4, 'S'], [2, 5, 'S'], [4, 3, 'S']], max: [1, 1, 1] },
  { id: 925, maps: [[3, 4, 'S'], [4, 4, 'S'], [4, 5, 'S'], [5, 2, 'S']], max: [1, 1, 1, 1] },
  { id: 926, maps: [[5, 5, 'S'], [7, 2, 'S', [15]], [6, 2, 'S'], [6, 5, 'S']], max: [1, 1, 1, 1] },
  { id: 927, maps: [[7, 3, 'A', [5, 8]]], max: [4] },
  { id: 929, maps: [[1, 2, 'S'], [1, 3, 'S'], [2, 1, 'S'], [2, 3, 'S']], max: [1, 1, 1, 1] },
  { id: 930, maps: [[1, 4, 'S'], [2, 2, 'S'], [3, 2, 'S'], [4, 1, 'S'], [7, 3, 'S', [18, 23, 24, 25]]], max: [1, 1, 1, 1, 1] },
]

describe.each(definitions)('quest $id definition', ({ id, maps, max }) => {
  it('registers the expected maps, ranks, counters and reset key', () => {
    const stuff = quest(id)
    expect(stuff.maps).toEqual(maps)
    expect(stuff.max).toEqual(max)
    expect(stuff.key).toBe(QuestKey.infer)
  })

  it('rejects an empty fleet', () => {
    expect(matches(id, [])).toBe(false)
  })
})

const f = fixtures

describe('quest 916 fleet', () => {
  it.each([f.cruiser, f.torpedoCruiser, f.trainingCruiser])('accepts light cruiser class $api_stype', (cruiser) => {
    expect(matches(916, [f.kongou, f.hiei, cruiser, f.destroyer])).toBe(true)
  })

  it.each([0, 1, 2, 3])('rejects a missing required ship at position %i', (index) => {
    const fleet = [f.hiei, f.kongou, f.cruiser, f.destroyer]
    fleet[index] = f.carrier
    expect(matches(916, fleet)).toBe(false)
  })

  it('rejects Hiei before kai ni C', () => {
    expect(matches(916, [f.oldHiei, f.kongou, f.cruiser, f.destroyer])).toBe(false)
  })
})

describe.each([917, 918])('quest %i fleet', (id) => {
  it('requires Gotland andra as flagship and a destroyer', () => {
    expect(matches(id, [f.gotland, f.destroyer])).toBe(true)
    expect(matches(id, [f.destroyer, f.gotland])).toBe(false)
    expect(matches(id, [f.oldGotland, f.destroyer])).toBe(false)
    expect(matches(id, [f.gotland, f.cruiser])).toBe(false)
    expect(matches(id, [f.gotland])).toBe(false)
  })
})

it('quest 919 requires two US ships, regardless of flagship', () => {
  expect(matches(919, [f.destroyer, f.johnston, f.saratoga])).toBe(true)
  expect(matches(919, [f.johnston, f.nelson])).toBe(false)
  expect(matches(919, [f.nelson, f.arkRoyal])).toBe(false)
  expect(matches(919, [f.johnston])).toBe(false)
})

describe.each([{ id: 920, flagship: f.mod2 }, { id: 921, flagship: f.mk2 }])('quest $id fleet', ({ id, flagship }) => {
  it.each([f.johnston, f.nelson, f.perth, f.deRuyter])('accepts allied escort category $api_ctype', (escort) => {
    expect(matches(id, [flagship, f.saratoga, escort])).toBe(true)
  })

  it('requires the flagship and two additional allied ships', () => {
    expect(matches(id, [f.nelson, flagship, f.perth])).toBe(false)
    expect(matches(id, [flagship, f.nelson, f.destroyer])).toBe(false)
    expect(matches(id, [flagship, f.nelson])).toBe(false)
  })
})

it('quest 920 excludes Fletcher Mk.II even though it is a later remodel', () => {
  expect(matches(920, [f.mk2, f.nelson, f.perth])).toBe(false)
})

it('quest 922 accepts Fletcher Mk.II as escort and counts all four allied ships', () => {
  expect(matches(922, [f.nelson, f.mk2, f.perth, f.deRuyter])).toBe(true)
  expect(matches(922, [f.mk2, f.nelson, f.perth, f.deRuyter])).toBe(true)
  expect(matches(922, [f.destroyer, f.mk2, f.nelson, f.perth, f.deRuyter])).toBe(true)
  expect(matches(922, [f.nelson, f.mk2, f.perth, f.destroyer])).toBe(false)
  expect(matches(922, [f.nelson, f.johnston, f.perth, f.deRuyter])).toBe(false)
  expect(matches(922, [f.mk2, f.nelson, f.perth])).toBe(false)
})

describe('quest 923 fleet', () => {
  it.each([f.saratoga, f.gambierBay, f.arkRoyal])('accepts US or UK carrier $api_id as escort', (carrier) => {
    expect(matches(923, [f.destroyer, carrier])).toBe(true)
  })

  it('rejects non-carrier allied ships and Japanese carriers', () => {
    expect(matches(923, [f.nelson, f.johnston, f.kaga])).toBe(false)
  })
})

it('quest 924 counts standard and armored carriers, but not light carriers', () => {
  expect(matches(924, [f.carrier, f.armoredCarrier])).toBe(true)
  expect(matches(924, [f.carrier, f.lightCarrier])).toBe(false)
  expect(matches(924, [f.carrier])).toBe(false)
})

describe('quest 925 fleet', () => {
  it.each([f.kaga, f.kagaBo, f.kagaGo])('accepts Kaga remodel $api_id as flagship', (kaga) => {
    expect(matches(925, [kaga, f.armoredCarrier])).toBe(true)
  })

  it('requires Kaga as flagship and a separate standard or armored carrier', () => {
    expect(matches(925, [f.destroyer, f.kaga])).toBe(false)
    expect(matches(925, [f.carrier, f.kaga])).toBe(false)
    expect(matches(925, [f.oldKaga, f.carrier])).toBe(false)
    expect(matches(925, [f.kaga, f.lightCarrier])).toBe(false)
    expect(matches(925, [f.kaga])).toBe(false)
  })
})

describe('quest 926 fleet', () => {
  it.each([f.kaga, f.kagaBo, f.kagaGo])('accepts Kaga remodel $api_id with Akagi kai ni variants', (kaga) => {
    expect(matches(926, [f.destroyer, kaga, f.akagi])).toBe(true)
    expect(matches(926, [f.akagiBo, kaga])).toBe(true)
  })

  it('rejects unrelated carriers and earlier remodels', () => {
    expect(matches(926, [f.carrier, f.armoredCarrier])).toBe(false)
    expect(matches(926, [f.kaga, f.carrier])).toBe(false)
    expect(matches(926, [f.akagi, f.carrier])).toBe(false)
    expect(matches(926, [f.oldAkagi, f.kaga])).toBe(false)
    expect(matches(926, [f.akagi, f.oldKaga])).toBe(false)
  })
})

describe('quest 927 registration and fleet', () => {
  it.each([f.haguro, f.haguroKai2])('accepts Haguro remodel $api_id as flagship with five ships', (haguro) => {
    expect(matches(927, [haguro, f.destroyer, f.cruiser, f.carrier, f.battleship])).toBe(true)
  })

  it('rejects six ships and Haguro as escort', () => {
    expect(matches(927, [f.haguro, f.destroyer, f.cruiser, f.carrier, f.battleship, f.submarine])).toBe(false)
    expect(matches(927, [f.destroyer, f.haguro])).toBe(false)
  })

  it('does not replace the existing Yamato quest 976', () => {
    expect(quest(976)).not.toBe(quest(927))
    expect(quest(976).maps).toEqual([[1, 4, 'S'], [2, 5, 'S'], [5, 1, 'S'], [4, 4, 'S']])
    expect(quest(976).max).toEqual([1, 1, 1, 1])
  })
})

describe('quest 929 fleet', () => {
  it.each([f.taigei, f.jingei])('accepts submarine tender $api_id and two submarine types', (tender) => {
    expect(matches(929, [tender, f.submarine, f.submarineCarrier])).toBe(true)
  })

  it('requires a tender flagship and two submarines', () => {
    expect(matches(929, [f.submarine, f.taigei, f.submarineCarrier])).toBe(false)
    expect(matches(929, [f.taigei, f.submarine, f.destroyer])).toBe(false)
    expect(matches(929, [f.taigei, f.submarine])).toBe(false)
  })
})

describe('quest 930 fleet', () => {
  const fleet = [f.akigumo, f.yuugumo, f.makigumo, f.kazagumo]

  it('accepts all four required remodels, regardless of flagship', () => {
    expect(matches(930, fleet)).toBe(true)
    expect(matches(930, [f.cruiser, ...fleet])).toBe(true)
  })

  it.each([0, 1, 2, 3])('rejects a missing required destroyer at position %i', (index) => {
    const missing = [...fleet]
    missing[index] = f.destroyer
    expect(matches(930, missing)).toBe(false)
  })

  it('rejects Akigumo before kai ni', () => {
    expect(matches(930, [f.oldAkigumo, ...fleet.slice(1)])).toBe(false)
  })
})
