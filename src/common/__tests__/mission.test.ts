import { expect, describe, it } from 'vitest'
import { MissionId, MissionStuff } from '@common/mission'
import {
  ApiDeckPortId,
  ApiRange,
  ApiShipType,
  createSvDataRaw,
  MissionState,
  SlotitemImgType,
  SlotitemType,
  SvData
} from '@common/kcs'
import type { ApiDeckPort, ApiShip, ApiSlotitem, MstShip, MstSlotitem } from '@common/kcs'

// type guard to convince TypeScript a value is non-null/non-undefined
function assertDefined<T>(v: T): asserts v is NonNullable<T> {
  if (v === undefined || v === null) throw new Error('Value is undefined or null')
}

function createMstShip(apiId: number): MstShip {
  return {
    api_id: apiId,
    api_sortno: apiId,
    api_sort_id: apiId,
    api_name: '',
    api_yomi: '',
    api_stype: ApiShipType.kutikukan,
    api_ctype: 0,
    api_afterlv: 0,
    api_aftershipid: '',
    api_taik: [0, 0],
    api_souk: [0, 0],
    api_houg: [0, 0],
    api_raig: [0, 0],
    api_tyku: [0, 0],
    api_luck: [0, 0],
    api_soku: 0,
    api_leng: ApiRange.invalid,
    api_slot_num: 0,
    api_maxeq: [],
    api_buildtime: 0,
    api_broken: [0, 0, 0, 0],
    api_powup: [0, 0, 0, 0],
    api_backs: 0,
    api_getmes: '',
    api_afterfuel: 0,
    api_afterbull: 0,
    api_fuel_max: 0,
    api_bull_max: 0,
    api_voicef: 0
  }
}

function createApiShip(slotIds: number[], mstShipId = 1): ApiShip {
  return {
    api_id: 1,
    api_sortno: 1,
    api_ship_id: mstShipId,
    api_lv: 1,
    api_exp: [0, 0, 0],
    api_nowhp: 1,
    api_maxhp: 1,
    api_soku: 0,
    api_leng: ApiRange.invalid,
    api_slot: slotIds,
    api_onslot: slotIds.map(() => 0),
    api_slot_ex: 0,
    api_kyouka: [0, 0, 0, 0, 0, 0, 0],
    api_backs: 0,
    api_fuel: 0,
    api_bull: 0,
    api_slotnum: slotIds.length,
    api_ndock_time: 0,
    api_ndock_item: [],
    api_srate: 0,
    api_cond: 49,
    api_karyoku: [0, 0],
    api_raisou: [0, 0],
    api_taiku: [0, 0],
    api_soukou: [0, 0],
    api_kaihi: [0, 0],
    api_taisen: [0, 0],
    api_sakuteki: [0, 0],
    api_lucky: [0, 0],
    api_locked: 0,
    api_locked_equip: 0
  }
}

function createMstSlotitem(
  apiId: number,
  type: SlotitemType = SlotitemType.LandingCraft
): MstSlotitem {
  return {
    api_id: apiId,
    api_sortno: apiId,
    api_name: '',
    api_type: [0, 0, type, SlotitemImgType.daihatu, 0],
    api_taik: 0,
    api_souk: 0,
    api_houg: 0,
    api_raig: 0,
    api_soku: 0,
    api_baku: 0,
    api_tyku: 0,
    api_tais: 0,
    api_atap: 0,
    api_houm: 0,
    api_raim: 0,
    api_houk: 0,
    api_raik: 0,
    api_bakk: 0,
    api_saku: 0,
    api_sakb: 0,
    api_luck: 0,
    api_leng: ApiRange.invalid,
    api_rare: 0,
    api_broken: [0, 0, 0, 0],
    api_usebull: '',
    api_version: 1
  }
}

function createApiSlotitem(apiId: number, mstId: number, level = 0): ApiSlotitem {
  return {
    api_id: apiId,
    api_slotitem_id: mstId,
    api_locked: 0,
    api_level: level,
    api_alv: 0
  }
}

function createDeck(shipIds: number[]): ApiDeckPort {
  return {
    api_member_id: 1,
    api_id: ApiDeckPortId.deck1st,
    api_name: '',
    api_name_id: '',
    api_mission: [MissionState.no, 0, 0, 0],
    api_flagship: '',
    api_ship: shipIds
  }
}

function calcDaihatuBonusForTest(
  slots: { mstId: number; level?: number; type?: SlotitemType }[],
  mstShipId = 1
): number {
  const raw = createSvDataRaw()
  const svdata = new SvData(raw)
  const slotIds = slots.map((_, index) => index + 1)
  const mstSlotitemIds = new Set<number>()

  raw.apiData.api_mst_ship.push(createMstShip(mstShipId))
  raw.apiData.api_ship.push(createApiShip(slotIds, mstShipId))

  slots.forEach((slot, index) => {
    const apiId = slotIds[index]
    raw.apiData.api_slot_item.push(createApiSlotitem(apiId, slot.mstId, slot.level))

    if (!mstSlotitemIds.has(slot.mstId)) {
      raw.apiData.api_mst_slotitem.push(createMstSlotitem(slot.mstId, slot.type))
      mstSlotitemIds.add(slot.mstId)
    }
  })

  return MissionStuff.toDeckInfo(svdata, createDeck([1])).daihatuBonus
}

describe('MissionDetail tests', () => {
  it('check isCombat true/false', () => {
    const combatIds: MissionId[] = [
      MissionId.IdA5,
      MissionId.IdA6,
      MissionId.IdB4,
      MissionId.IdB5,
      MissionId.IdB6,
      MissionId.Id43,
      MissionId.Id46,
      MissionId.IdD2, 
      MissionId.IdD3, 
      MissionId.IdE1, 
      MissionId.IdE2, 
    ]
    const notCombatIds: MissionId[] = Object.entries(MissionId).
      filter(([_, id]) => !combatIds.includes(id)).map(([_, id]) => id)
    combatIds.forEach((id) => {
      try {
        const detail = MissionStuff.getDetailById(id)
        assertDefined(detail);
        expect(detail.isCombat).toBe(true)
      } catch (e) {
        console.log(`MissionId ${id} check failed`)
        throw e
      }
    })
    notCombatIds.forEach((id) => {
      try {
        const detail = MissionStuff.getDetailById(id)
        assertDefined(detail);
        expect(detail.isCombat).toBe(false)
      } catch (e) {
        console.log(`MissionId ${id} check failed`)
        throw e
      }
    })
  })

  it('calculates daihatu base bonus by item id', () => {
    expect(calcDaihatuBonusForTest([
      { mstId: 68 },
      { mstId: 166 },
      { mstId: 167, type: SlotitemType.SpecialATank },
      { mstId: 408, type: SlotitemType.SpecialATank }
    ])).toBe(10)
  })

  it('caps daihatu base bonus at 20 percent', () => {
    expect(calcDaihatuBonusForTest([
      { mstId: 68 },
      { mstId: 68 },
      { mstId: 68 },
      { mstId: 68 }
    ], 487)).toBe(20)
  })

  it('adds daihatu remodel bonus from average stars', () => {
    expect(calcDaihatuBonusForTest([
      { mstId: 68, level: 10 },
      { mstId: 68, level: 10 }
    ])).toBeCloseTo(11)
  })

  it('adds tokudaihatu bonus based on tokudaihatu and daihatu counts', () => {
    const cases: { tokuCount: number; daihatuCount: number; expected: number }[] = [
      { tokuCount: 1, daihatuCount: 0, expected: 7 },
      { tokuCount: 1, daihatuCount: 1, expected: 12 },
      { tokuCount: 1, daihatuCount: 2, expected: 17 },
      { tokuCount: 1, daihatuCount: 3, expected: 22 },
      { tokuCount: 1, daihatuCount: 4, expected: 22 },
      { tokuCount: 2, daihatuCount: 0, expected: 14 },
      { tokuCount: 2, daihatuCount: 1, expected: 19 },
      { tokuCount: 2, daihatuCount: 2, expected: 24 },
      { tokuCount: 2, daihatuCount: 3, expected: 24 },
      { tokuCount: 2, daihatuCount: 4, expected: 24 },
      { tokuCount: 3, daihatuCount: 0, expected: 20 },
      { tokuCount: 3, daihatuCount: 1, expected: 25 },
      { tokuCount: 3, daihatuCount: 2, expected: 25.2 },
      { tokuCount: 3, daihatuCount: 3, expected: 25.4 },
      { tokuCount: 3, daihatuCount: 4, expected: 25.4 },
      { tokuCount: 4, daihatuCount: 0, expected: 25.4 },
      { tokuCount: 4, daihatuCount: 1, expected: 25.6 },
      { tokuCount: 4, daihatuCount: 2, expected: 25.8 },
      { tokuCount: 4, daihatuCount: 3, expected: 25.9 },
      { tokuCount: 4, daihatuCount: 4, expected: 26.0 }
    ]

    cases.forEach(({ tokuCount, daihatuCount, expected }) => {
      const tokuSlots = Array.from({ length: tokuCount }, () => ({ mstId: 193 }))
      const daihatuSlots = Array.from({ length: daihatuCount }, () => ({ mstId: 68 }))

      expect(
        calcDaihatuBonusForTest([...tokuSlots, ...daihatuSlots]),
        `特大発${tokuCount}つ、大発${daihatuCount}つ`
      ).toBeCloseTo(expected)
    })
  })
})
