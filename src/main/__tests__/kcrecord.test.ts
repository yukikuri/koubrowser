import { describe, it, expect, vi } from 'vitest'

// electron.app をダミーに置き換え
const dmyVerison = '0.0.0.0-test' 
vi.mock('electron', () => ({
  app: {
    getVersion: vi.fn(() => dmyVerison),
    // 必要なら他のメソッドも追加
    // getPath: vi.fn((name: string) => '/tmp'),
  }
}))

import { RecordUtil } from '@main/kcrecord'
import fs from 'fs'
import path from 'path'
import * as kcs from '@common/kcs'
import type { DropRecord } from '@common/record'

function readApiReqMapNext(): kcs.ApiMapNext {
  const p = path.resolve(__dirname, 'testdata', 'api_req_map-next.json')
  const raw = fs.readFileSync(p, 'utf8')
  const parsed = JSON.parse(raw) as kcs.ApiDataRoot
  return parsed.api_data as kcs.ApiMapNext
}

function readDropTestData<T>(file: string): T {
  const p = path.resolve(__dirname, 'testdata', 'drop', file)
  const raw = fs.readFileSync(p, 'utf8')
  return JSON.parse(raw) as T
}

function readDropApiData<T>(file: string): T {
  return readDropTestData<kcs.ApiDataRoot>(file).api_data as T
}

export function createDummySvdata(): kcs.SvData {
  return new kcs.SvData(kcs.createSvDataRaw())
}

function createMstShip(apiId: number, name: string, aftershipid: string): kcs.MstShip {
  return {
    api_id: apiId,
    api_sortno: apiId,
    api_sort_id: apiId,
    api_name: name,
    api_yomi: '',
    api_stype: kcs.ApiShipType.jyuujyun,
    api_ctype: 0,
    api_afterlv: 0,
    api_aftershipid: aftershipid,
    api_taik: [0, 0],
    api_souk: [0, 0],
    api_houg: [0, 0],
    api_raig: [0, 0],
    api_tyku: [0, 0],
    api_luck: [0, 0],
    api_soku: 0,
    api_leng: kcs.ApiRange.invalid,
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

function createApiShip(apiId: number, mstShipId: number): kcs.ApiShip {
  return {
    api_id: apiId,
    api_sortno: apiId,
    api_ship_id: mstShipId,
    api_lv: 1,
    api_exp: [0, 0, 0],
    api_nowhp: 1,
    api_maxhp: 1,
    api_soku: 0,
    api_leng: kcs.ApiRange.invalid,
    api_slot: [],
    api_onslot: [],
    api_slot_ex: 0,
    api_kyouka: [0, 0, 0, 0, 0, 0, 0],
    api_backs: 0,
    api_fuel: 0,
    api_bull: 0,
    api_slotnum: 0,
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

function readDropMap(prefix: string, kind: 'start' | 'next'): kcs.ApiMap {
  const api = kind === 'start' ? 'map-start' : 'map-next'
  return readDropApiData<kcs.ApiMap>(`${prefix}-api_req_${api}.json`)
}

function createDropRecordSvdata(): kcs.SvData {
  const raw = kcs.createSvDataRaw()
  raw.apiData.api_mst_ship.push(
    createMstShip(68, '摩耶', '69'),
    createMstShip(69, '摩耶改', '428'),
    createMstShip(428, '摩耶改二', '0'),
    createMstShip(56, '那珂', '160'),
    createMstShip(160, '那珂改', '194'),
    createMstShip(194, '那珂改二', '0'),
    createMstShip(78, '金剛', '209'),
    createMstShip(209, '金剛改', '149'),
    createMstShip(149, '金剛改二', '591'),
    createMstShip(591, '金剛改二丙', '0')
  )
  raw.apiData.api_ship.push(
    createApiShip(1, 428),
    createApiShip(2, 428),
    createApiShip(3, 194),
    createApiShip(4, 149),
    createApiShip(5, 591)
  )
  return new kcs.SvData(raw)
}

describe('toAreaItemGetInfos', () => {

  it('returns a record-like object for sample input', () => {

    // const svdata = createDummySvdata();

    // // prototype の getter をスパイして返り値を固定
    // const deckMock = {
    //   api_member_id: 1,
    //   api_id: 1,
    //   api_name: 'mock-deck',
    //   api_name_id: '',
    //   api_mission: [0, 0, 0, 0],
    //   api_flagship: '',
    //   api_ship: [1, 2, 3]
    // }
    // const spy = vi.spyOn(kcs.SvData.prototype, 'battleDeck', 'get').mockReturnValue(deckMock as any)
    // vi.spyOn(record, 'toShipsInfo').mockReturnValueOnce([])
        
    const map = readApiReqMapNext()
    const ret = RecordUtil.toAreaItemGetInfos(map)
    expect(ret).toBeDefined()
    expect(ret?.length).toBe(2)
    const record0 = ret?.[0]
    expect(record0).toBeDefined()
    expect(record0?.itemId).toBe(map.api_itemget_eo_result?.api_id)
    expect(record0?.itemCount).toBe(1)
    expect(record0?.eoRate).toBe(map.api_get_eo_rate)
    const record1 = ret?.[1]
    expect(record1).toBeDefined()
    expect(record1?.itemId).toBe(kcs.ApiItemId.fual)
    expect(record1?.itemCount).toBe(map.api_itemget_eo_comment?.api_getcount)
    expect(record1?.eoRate).toBeUndefined()
  })
})

describe('toDropRecord', () => {
  it.each([
    {
      prefix: '1',
      mapKind: 'start' as const,
      battleType: kcs.BattleType.midday,
      eventKind: kcs.ApiEventKind.normalBattle,
      middayFile: 'api_req_sortie-battle',
      resultFile: 'api_req_sortie-battleresult'
    },
    {
      prefix: '2',
      mapKind: 'next' as const,
      battleType: kcs.BattleType.midnight,
      eventKind: kcs.ApiEventKind.nightMidnightBattle,
      middayFile: 'api_req_sortie-battle',
      midnightFile: 'api_req_battle_midnight-battle',
      resultFile: 'api_req_sortie-battleresult'
    },
    {
      prefix: '3',
      mapKind: 'next' as const,
      battleType: kcs.BattleType.midnight,
      eventKind: kcs.ApiEventKind.nightMidnightBattle,
      middayFile: 'api_req_combined_battle-battle',
      resultFile: 'api_req_combined_battle-battleresult'
    },
    {
      prefix: '4',
      mapKind: 'next' as const,
      battleType: kcs.BattleType.combined_ec_midnight,
      eventKind: kcs.ApiEventKind.combinedBattle,
      middayFile: 'api_req_combined_battle-each_battle',
      midnightFile: 'api_req_combined_battle-ec_midnight_battle',
      resultFile: 'api_req_combined_battle-battleresult'
    }
  ])('creates drop record from sortie battle result case $prefix', ({
    prefix,
    mapKind,
    battleType,
    eventKind,
    middayFile,
    midnightFile,
    resultFile
  }) => {
    const expected = readDropTestData<DropRecord>(`${prefix}-record.json`)
    const svdata = createDropRecordSvdata()
    const info: kcs.PrvBattleInfo = {
      uuid: 'drop-test',
      map: readDropMap(prefix, mapKind),
      mapLv: expected.mapLv,
      cell_no: expected.cellId,
      isBoss: expected.isBoss,
      battleType,
      eventId: expected.isBoss ? kcs.ApiEventId.bossBattle : kcs.ApiEventId.sortieBattle,
      eventKind,
      midday: readDropApiData<kcs.ApiMiddayBattleType>(`${prefix}-${middayFile}.json`),
      midnight: midnightFile
        ? readDropApiData<kcs.ApiMidnightBattleType>(`${prefix}-${midnightFile}.json`)
        : null,
      result: readDropApiData<kcs.ApiBattleResult>(`${prefix}-${resultFile}.json`),
      middayJson: null,
      midnightJson: null
    }

    const actual = RecordUtil.toDropRecord(svdata, info)

    expect(actual).toBeDefined()
    expect(actual).toEqual({
      ...expected,
      origin: `koubrowser/${dmyVerison}`,
      date: actual?.date
    })
  })
})
