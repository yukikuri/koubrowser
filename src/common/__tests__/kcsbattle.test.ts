import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { calcEnemyHps, calcFleetHps } from '@common/kcsbattle'
import type {
  ApiCombinedVsCombinedBattle,
  ApiCombinedVsNormalBattle,
  ApiMidnightBattleType,
  ApiSortieBattle,
  PrvBattleInfo
} from '@common/kcs'

type CombinedFleetBattle = ApiCombinedVsNormalBattle | ApiCombinedVsCombinedBattle
type TestBattle = ApiSortieBattle | CombinedFleetBattle

const loadApiData = <T>(fileName: string): T => {
  const response = JSON.parse(
    readFileSync(new URL(`./testdata/battle/${fileName}`, import.meta.url), 'utf-8')
  ) as { api_data: T }

  return response.api_data
}

const loadBattleInfo = (middayFileName: string, midnightFileName?: string): PrvBattleInfo => {
  return {
    midday: loadApiData<TestBattle>(middayFileName),
    midnight: midnightFileName ? loadApiData<ApiMidnightBattleType>(midnightFileName) : null
  } as PrvBattleInfo
}

const loadMidnightBattleInfo = (midnightFileName: string): PrvBattleInfo => {
  return {
    midday: null,
    midnight: midnightFileName ? loadApiData<ApiMidnightBattleType>(midnightFileName) : null
  } as PrvBattleInfo
}

describe('kcsbattle test', () => {
  it('case1: calculates fleet hps for combined battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case1: 水上部隊 vs 連合艦隊(通常戦マス)
    // 基地航空隊1部隊目2部隊目、開幕、砲撃支援、先制雷撃、砲撃、特殊攻撃
    const battleInfo = loadBattleInfo('case1-api_req_combined_battle-each_battle.json')

    expect(calcFleetHps(battleInfo)).toEqual({
      deck: [93, 72, 66, 65, 18, 45], 
      combined: [17, 40, 39, 53, 24, 49]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 2128, hp: 920-79-117-49-286-200-301 },
      { id: 1766, hp: 118-0-87-33 },
      { id: 1766, hp: 118-14-18-108 },
      { id: 1543, hp: 90-52-23-50 },
      { id: 1543, hp: 90-85-58 },
      { id: 1527, hp: 76-7-97 },
      // --
      { id: 1555, hp: 57-90 },
      { id: 1592, hp: 66-120 },
      { id: 1622, hp: 43-124 },
      { id: 1576, hp: 37-107 },
      { id: 1576, hp: 37-106 },
      { id: 1576, hp: 37-164 }
    ])
  })

  it('case2: calculates fleet hps for combined battle with opening attack damage', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case2: 水上部隊 vs 通常艦隊(通常戦マス)
    // 先制対潜、先制雷撃、砲撃
    const battleInfo = loadBattleInfo('case2-api_req_combined_battle-battle.json')

    expect(calcFleetHps(battleInfo)).toEqual({
      deck: [99, 91, 66, 65, 47, 54],
      combined: [41, 40, 41, 53, 49, 11]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 1535, hp: 44-77 },
      { id: 1535, hp: 44-18-3-2-22 },
      { id: 1534, hp: 37-65 },
      { id: 1532, hp: 27-38 },
    ])
  })

  it('case3: calculates for sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case3: 通常艦隊 vs 通常艦隊(通常戦マス)
    // 開幕、先制雷撃、砲撃
    const battleInfo = loadBattleInfo('case3-api_req_sortie-battle.json')

    expect(calcFleetHps(battleInfo)).toEqual({
      deck: [44,48,81,43,17,13]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 1518, hp: -3 },
      { id: 1526, hp: -31 },
      { id: 1526, hp: -50 },
      { id: 1575, hp: -343 },
      { id: 1575, hp: -205 },
      { id: 1575, hp: -44 }
    ])
  })

  it('case4: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case4: 通常艦隊 vs 通常艦隊(通常戦マス)
    // 開幕、先制対潜、砲撃
    const battleInfo = loadBattleInfo('case4-api_req_sortie-battle.json')

    expect(calcFleetHps(battleInfo)).toEqual({
      deck: [78, 53, 56, 31, 34, 34]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 1533, hp: 34-38 },
      { id: 1530, hp: 19-33 },
      { id: 1530, hp: 19-35 },
      { id: 1520, hp: 55-280 },
      { id: 1575, hp: 35-43 },
      { id: 1575, hp: 35-141 }
    ])
  })

  it('case5: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case5: 通常艦隊 vs 通常艦隊(航空戦マス 航空戦2回)
    // 航空戦、航空戦
    const battleInfo = loadBattleInfo('case5-api_req_sortie-airbattle.json')

    expect(calcFleetHps(battleInfo)).toEqual({
      deck: [55, 32, 41-3, 37, 29, 37-3]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 1528, hp: 96 },
      { id: 1525, hp: 88 },
      { id: 1592, hp: 66 },
      { id: 1501, hp: 20 },
      { id: 1501, hp: 20 },
      { id: 1501, hp: 20 }
    ])
  })

  it('case6: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case6: 通常艦隊 vs 通常艦隊(航空戦マス 航空戦2回 夜戦あり)
    // 航空戦、航空戦、夜戦
    const battleInfo = loadBattleInfo(
      'case6-api_req_sortie-airbattle.json',
      'case6-api_req_battle_midnight-battle.json'
    )

    expect(calcFleetHps(battleInfo)).toEqual({
      deck: [55, 34, 34, 38-2-2, 29-9, 34]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 1528, hp: 96-52-70 },
      { id: 1525, hp: 88-119-221 },
      { id: 1592, hp: 66-91-102 },
      { id: 1501, hp: 20-152-153 },
      { id: 1501, hp: 20-197-199 },
      { id: 1501, hp: 20-140-139 }
    ])
  })

  it('case7: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case6: 通常艦隊 vs 通常艦隊(通常戦マス)
    // 開幕、砲撃、雷撃戦
    const battleInfo = loadBattleInfo('case7-api_req_sortie-battle.json')

    expect(calcFleetHps(battleInfo)).toEqual({
      deck: [55, 32-12, 38, 37-2-28, 29, 34]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 1555, hp: 57-109 },
      { id: 1523, hp: 70-44-201 },
      { id: 1575, hp: 35-78 },
      { id: 1575, hp: 35-74 },
      { id: 1501, hp: 20-95 },
      { id: 1501, hp: 20-57 }
    ])
  })

  it('case8: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case8: 通常艦隊 vs 通常艦隊(空襲戦マス)
    // 空襲戦マス
    const battleInfo = loadBattleInfo('case8-api_req_sortie-ld_airbattle.json')

    expect(calcFleetHps(battleInfo)).toEqual({
      deck: [9, 8, 17, 17, 17, 17-8]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 1579, hp: 96 },
      { id: 1528, hp: 96 },
      { id: 1527, hp: 76 },
      { id: 1555, hp: 57 },
      { id: 1576, hp: 37 },
      { id: 1576, hp: 37 }
    ])
  })

  it('case9: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case9: 通常艦隊 vs 通常艦隊(ボスマス、夜戦あり)
    // 先制雷撃、砲撃、雷撃戦、夜戦
    const battleInfo = loadBattleInfo(
      'case9-api_req_sortie-battle.json',
      'case9-api_req_battle_midnight-battle.json'
    )

    expect(calcFleetHps(battleInfo)).toEqual({ 
      deck:[15-10, 61, 55, 31-2-18, 45-4-20, 34-23-9]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 1543, hp: 90-7 },
      { id: 1527, hp: 76-6-23-5-24-215-370 },
      { id: 1527, hp: 76-15-6-7-6-151 },
      { id: 1597, hp: 150-16-25-6-5-133-22 },
      { id: 1577, hp: 38-69 },
      { id: 1577, hp: 38-9-112 }
    ])
  })

  it('case10: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case6: 通常艦隊(4隻) vs 通常艦隊(対潜空襲マス)
    // 開幕、先制対潜、先制雷撃、砲撃、雷撃戦
    const battleInfo = loadBattleInfo('case10-api_req_sortie-battle.json')

    expect(calcFleetHps(battleInfo)).toEqual({
      deck: [44-34, 8-4-2, 17-8-7, 6-3]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 1534, hp: 37-3-10 },
      { id: 1532, hp: 27-1-6-2 },
      { id: 1532, hp: 27-19 },
      { id: 2310, hp: NaN },
      { id: 1776, hp: NaN },
    ])
  })

  it('case11: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case6: 通常艦隊 vs 通常艦隊(夜戦マス)
    // 砲撃
    const battleInfo = loadMidnightBattleInfo('case11-api_req_battle_midnight-sp_midnight.json')

    expect(calcFleetHps(battleInfo)).toEqual({ 
      deck: [49, 53, 52-30, 54, 34, 33]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 1527, hp: 76 },
      { id: 1527, hp: 76-125-234 },
      { id: 1522, hp: 60-101-101 },
      { id: 1518, hp: 48-2-160 },
      { id: 1576, hp: 37-169-176 },
      { id: 1576, hp: 37-4-2-125 },
    ])
  })

  it('case12: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case12: 水上部隊(5隻+6隻) vs 通常艦隊(通常戦マス)
    // 先制対潜, 先制雷撃、砲撃
    const battleInfo = loadBattleInfo('case12-api_req_combined_battle-battle.json')

    expect(calcFleetHps(battleInfo)).toEqual({ 
      deck: [99,99,66,65,47],
      combined: [49-23,49,41,41,53,40]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 1535, hp: 44-26-4-46 },
      { id: 1534, hp: 37-4-12-11-22 },
      { id: 1532, hp: 27-37 },
      { id: 1532, hp: 27-57 },
    ])
  })

  it('case13: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case13: 水上部隊(5隻+6隻) vs 通常艦隊(通常戦マス)
    // 開幕、先制雷撃、砲撃
    const battleInfo = loadBattleInfo('case13-api_req_combined_battle-battle.json')

    expect(calcFleetHps(battleInfo)).toEqual({ 
      deck: [99,99-11,66-5,65,47],
      combined: [26,49,41,41,53,40]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 1640, hp: 18-1-37 },
      { id: 1640, hp: 18-54 },
      { id: 1640, hp: 18-5-1-12 },
      { id: 1640, hp: 18-255 },
      { id: 1639, hp: 15-302 },
      { id: 1639, hp: 15-306 },
    ])
  })

  it('case14: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case14: 水上部隊(5隻+5隻) vs 通常艦隊(対潜空襲マス)
    // 開幕、先制対潜、先制雷撃、砲撃
    const battleInfo = loadBattleInfo('case14-api_req_combined_battle-battle.json')

    expect(calcFleetHps(battleInfo)).toEqual({ 
      deck: [99,88,61,65,47],
      combined: [49,49,41,41,53-5]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 1534, hp: 37-51 },
      { id: 1532, hp: 27-63 },
      { id: 1532, hp: 27-21-5-21 },
      { id: 1762, hp: NaN },
    ])
  })

  it('case15: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case15: 水上部隊(5隻+5隻) vs 通常艦隊(通常戦マス)
    // 開幕、先制雷撃、砲撃
    const battleInfo = loadBattleInfo('case15-api_req_combined_battle-battle.json')

    expect(calcFleetHps(battleInfo)).toEqual({ 
      deck: [99,88,61,65,47],
      combined: [49,49-31,41,41,48]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 2274, hp: 490-40-125-51-304 },
      { id: 1622, hp: 43-265 },
      { id: 1575, hp: 35-112 },
      { id: 1575, hp: 35-337 },
      { id: 1575, hp: 35-104 },
    ])
  })

  it('case16: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case16: 水上部隊(5隻+5隻) vs 通常艦隊(通常戦マス)
    // 開幕、先制雷撃、砲撃
    const battleInfo = loadBattleInfo('case16-api_req_combined_battle-battle.json')

    expect(calcFleetHps(battleInfo)).toEqual({ 
      deck: [99,88,61-41,65-3-26,47],
      combined: [49,18,41,41,48]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 2104, hp: 133-32-153 },
      { id: 1527, hp: 76-4-194 },
      { id: 1527, hp: 76-303 },
      { id: 1592, hp: 66-461 },
      { id: 1622, hp: 43-165 },
      { id: 1622, hp: 43-228 },
    ])
  })

  it('case17: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case17: 水上部隊(5隻+5隻) vs 連合艦隊(通常戦マス)
    // 開幕、先制雷撃、砲撃、雷撃、夜戦
    const battleInfo = loadBattleInfo(
      'case17-api_req_combined_battle-each_battle.json',
      'case17-api_req_combined_battle-ec_midnight_battle.json'
    )

    expect(calcFleetHps(battleInfo)).toEqual({
      deck: [99,88,20,36-4-3-17,47-3],
      combined: [49-5,18-1-2,41-3-26,41-5,48-3]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 2128, hp: 920-118-89-398-42-293 },
      { id: 1766, hp: 118-104-66 },
      { id: 1766, hp: 118-87-26-443 },
      { id: 1543, hp: 90-7-468 },
      { id: 1543, hp: 90-255 },
      { id: 1527, hp: 76-6-70 },
      // --
      { id: 1555, hp: 57-33-63 },
      { id: 1592, hp: 66-5-5 },
      { id: 1622, hp: 43-131 },
      { id: 1576, hp: 37-49 },
      { id: 1576, hp: 37-3-110 },
      { id: 1576, hp: 37-38 }

    ])
  })

  it('case18: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case18: 遊撃部隊(7隻) vs 通常艦隊(通常戦マス)
    // 開幕、先制雷撃、砲撃、雷撃、夜戦
    const battleInfo = loadBattleInfo(
      'case18-api_req_sortie-battle.json',
    )

    expect(calcFleetHps(battleInfo)).toEqual({
      deck: [38, 27, 33, 33, 33, 38-5, 40],
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 1554, hp: 53-44-207 },
      { id: 1575, hp: 35-17-7-84 },
      { id: 1575, hp: 35-71 },
      { id: 1575, hp: 35-52 },
      { id: 1575, hp: 35-25-79 },
      { id: 1575, hp: 35-64 },
    ])
  })

  it('case19: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case19: 遊撃部隊(7隻) vs 通常艦隊(ボスマス、夜戦あり)
    // 基地航空隊1部隊目、先制雷撃、砲撃、雷撃戦、夜戦
    const battleInfo = loadBattleInfo(
      'case19-api_req_sortie-battle.json',
      'case19-api_req_battle_midnight-battle.json'
    )

    expect(calcFleetHps(battleInfo)).toEqual({ 
      deck: [38, 27-21, 33, 33, 33, 33-25, 40],
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 2299, hp: 660-75-76-49-36-41-29-37-119-42-19-10-50-5-87 },
      { id: 1526, hp: 80-277 },
      { id: 1575, hp: 35-398 },
      { id: 1575, hp: 35-328 },
    ])
  })

  it('case20: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case20: 遊撃部隊(7隻) vs 通常艦隊(通常戦マス)
    // 7隻目に被害
    const battleInfo = loadBattleInfo(
      'case20-api_req_sortie-battle.json',
    )

    expect(calcFleetHps(battleInfo)).toEqual({
      deck: [38, 27, 33, 33-3, 33, 38, 40-20],
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 1554, hp: 53-94 },
      { id: 1575, hp: 35-2-9-197 },
      { id: 1575, hp: 35-65 },
      { id: 1575, hp: 35-47 },
      { id: 1575, hp: 35-73 },
      { id: 1575, hp: 35-48 },
    ])
  })


  it('case21: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case20: 遊撃部隊(7隻) vs 通常艦隊(通常戦マス)
    // 7隻目退避済み
    const battleInfo = loadBattleInfo(
      'case21-api_req_sortie-battle.json',
    )

    expect(calcFleetHps(battleInfo)).toEqual({
      deck: [38, 27, 33, 30-4, 21, 38-4-2, 2],
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 1554, hp: 53 },
      { id: 1559, hp: 70-9-78 },
      { id: 1559, hp: 70-5-5 },
      { id: 1591, hp: 48-11-4 },
      { id: 1575, hp: 35-3 },
      { id: 1575, hp: 35-85 },
    ])
  })

  it('case22: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case22: 機動部隊 vs 通常艦隊(通常戦マス)
    // 開幕、先制雷撃、砲撃、雷撃、砲撃
    const battleInfo = loadBattleInfo(
      'case22-api_req_combined_battle-battle.json',
    )

    expect(calcFleetHps(battleInfo)).toEqual({
      deck: [99,88-16,66,86-11,87,44],
      combined: [44,41,45,36-19,40,49]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 2104, hp: 133-31-48-112 },
      { id: 2104, hp: 133-18-10-65-96 },
      { id: 1527, hp: 76-41-3-2-115 },
      { id: 1527, hp: 76-10-42-45 },
      { id: 1622, hp: 43-30-118 },
      { id: 1622, hp: 43-63 },
    ])
  })

  it('case23: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case23: 機動部隊 vs 通常艦隊(通常戦マス)
    // 先制対潜、先制雷撃、砲撃、雷撃、砲撃
    const battleInfo = loadBattleInfo(
      'case23-api_req_combined_battle-battle.json',
    )

    expect(calcFleetHps(battleInfo)).toEqual({
      deck: [99,72,66,75,87,44],
      combined: [44,41,45,17-5,40,49-3]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 1535, hp: 44-3 },
      { id: 1534, hp: 37-21-5-20 },
      { id: 1534, hp: 37-45 },
      { id: 1534, hp: 37-4-2-13-1-9 },
      { id: 1532, hp: 27-24-52 },
    ])
  })

  it('case24: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case24: 機動部隊 vs 連合艦隊(ボスマス)
    // 基地航空隊1部隊目2部隊目、開幕、砲撃支援、先制雷撃、砲撃(特殊有)、雷撃戦、砲撃、夜戦
    const battleInfo = loadBattleInfo(
      'case24-api_req_combined_battle-each_battle.json',
      'case24-api_req_combined_battle-ec_midnight_battle.json'
    )

    expect(calcFleetHps(battleInfo)).toEqual({ 
      deck: [99-11,72-39,66-39,75-43-19,87-75,44],
      combined: [44-3-3,41-23-1,45,12-6,40-24,46]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 2364, hp: 880-61-395 },
      { id: 2119, hp: 900-215-215-131-27-40-456 },
      { id: 2119, hp: 900-110-105-6-79 },
      { id: 2358, hp: 1100-193-55-545-48 },
      { id: 1956, hp: 470-37-56-34-70-92 },
      { id: 1527, hp: 76-30-5-76 },
      // --
      { id: 1555, hp: 57-104 },
      { id: 1527, hp: 76-41-50 },
      { id: 1592, hp: 66-5-118 },
      { id: 1622, hp: 43-161 },
      { id: 1576, hp: 37-105 },
      { id: 1576, hp: 37-71 }
    ])
  })

  it('case25: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case25: 機動部隊 vs 連合艦隊(ボスマス)
    // 墳式、基地航空隊1部隊目2部隊目、開幕、砲撃支援、先制雷撃、砲撃(特殊無し)、雷撃戦、砲撃、夜戦
    const battleInfo = loadBattleInfo(
      'case25-api_req_combined_battle-each_battle.json',
      'case25-api_req_combined_battle-ec_midnight_battle.json'
    )

    expect(calcFleetHps(battleInfo)).toEqual({ 
      deck: [99-88,64-35-20-6,66,87-62,86-52,47-26],
      combined: [49-33-11,41-31,20-2-12,41-20-15-3,40,49-36]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 2367, hp: 880-63 },
      { id: 2119, hp: 900-76-112-75-100-37-68-76-98-462 },
      { id: 2352, hp: 1110-66-137-126-92 },
      { id: 2361, hp: 1100-156-104-33-237 },
      { id: 1956, hp: 470-46-40-108-36-650 },
      { id: 1956, hp: 470-37-148-293 },
      // --
      { id: 1555, hp: 57-151 },
      { id: 1527, hp: 76-42-56 },
      { id: 1527, hp: 76-58-53 },
      { id: 1862, hp: 130-74-56 },
      { id: 1622, hp: 43-128 },
      { id: 1622, hp: 43-88 }
    ])
  })

  it('case26: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case26: 機動部隊 vs 通常艦隊(通常マス)
    // 墳式、開幕、砲撃、雷撃戦、
    const battleInfo = loadBattleInfo(
      'case26-api_req_combined_battle-battle.json',
    )

    expect(calcFleetHps(battleInfo)).toEqual({ 
      deck: [99,99,66,87,86,47],
      combined: [49,41-31,53,41,40,49]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 2104, hp: 133-6-52-164 },
      { id: 1527, hp: 76-5-151 },
      { id: 1527, hp: 76-7-530 },
      { id: 1862, hp: 130-11-106-1-38 },
      { id: 1622, hp: 43-336 },
      { id: 1622, hp: 43-30-181 },
    ])
  })

  it('case27: calculates sortie battle', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    // case27: 機動部隊 vs 連合艦隊(通常マス)
    // 基地航空隊1部隊目2部隊目、開幕、砲撃支援、先制雷撃、砲撃(特殊有り)、雷撃戦、砲撃、夜戦(敵第二)
    const battleInfo = loadBattleInfo(
      'case27-api_req_combined_battle-each_battle.json',
      'case27-api_req_combined_battle-ec_midnight_battle.json'
    )

    expect(calcFleetHps(battleInfo)).toEqual({ 
      deck: [91-13,88-6-42,71-11-43-11-3,33,26-13-9,51-27],
      combined: [31,19-11,17-14,47-4-3,14,38-28-6-2]
    })
    expect(calcEnemyHps(battleInfo)).toEqual([
      { id: 2391, hp: 1200 },
      { id: 2119, hp: 900-86-311-40 },
      { id: 2104, hp: 133-70-320 },
      { id: 2104, hp: 133-162 },
      { id: 2039, hp: 740-54-70-100-62 },
      { id: 2039, hp: 740-285-58-37 },
      // --
      { id: 2321, hp: 470-10-237-338-226 },
      { id: 1862, hp: 130-10-51-175 },
      { id: 2052, hp: 69-66-63 },
      { id: 2051, hp: 66-8-396-391 },
      { id: 2051, hp: 66-36-2-40 },
      { id: 1623, hp: 46-54 }
    ])
  })

})
