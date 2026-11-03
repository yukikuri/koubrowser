import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ApiCallback, ApiEventId, ApiShipCategory as Category, SvData, createSvDataRaw,
  type ApiDeckPort, type ApiMapStart, type ApiQuest, type ApiShip, type MstShip,
  type PrvBattleInfo, type PrvPracticeBattleInfo, type WinRank,
} from '@common/kcs'
import { Api } from '@common/kcsapi'
import * as dates from '@common/kcdate'
import * as records from '@common/record'
import { getQuestStuff, type QuestSpecific317 } from '@common/kcquest'
import { QuestType } from '@common/kcquest_types'
import { QuestUpdater } from '@main/kcquest'
import { svdata } from '@main/svdata'

const beforeBoundary = '2026-11-03T04:59:59+09:00'
const afterBoundary = '2026-11-03T05:00:00+09:00'
let now: string
let updater: QuestUpdater | undefined

function definition(): QuestSpecific317 {
  const stuff = getQuestStuff(317)
  if (stuff?.questType !== QuestType.quest317) throw new Error('Missing quest 317')
  return stuff
}

beforeEach(() => {
  now = beforeBoundary
  // Fix server time independently of the host timezone. Persistence itself is mocked below.
  vi.spyOn(dates, 'currentServerDate').mockImplementation(() => new Date(now))
  vi.spyOn(records, 'currentRecordDate').mockImplementation(() => now)
})

afterEach(() => {
  updater?.unsetCallback()
  updater = undefined
  vi.restoreAllMocks()
})

function start(count = [2, 1, 0, 1, 0], date = beforeBoundary): {
  q: QuestUpdater
  record: records.Quest<records.QuestCounter>
} {
  const api = { api_no: 317, api_type: 1, api_progress_flag: 0 } as ApiQuest
  const record: records.Quest<records.QuestCounter> = {
    no: 317, dateKey: '', date, quest: api,
    state: { count: [...count], countMax: [3, 1, 1, 1, 1] },
  }
  const q = QuestUpdater.create(api, vi.fn(), record)
  if (!q) throw new Error('Missing updater 317')
  updater = q
  vi.spyOn(q, 'update').mockImplementation(() => undefined)
  vi.spyOn(QuestUpdater, 'popNo').mockImplementation(() => undefined)
  // Fleet matching is tested separately with real SvData below.
  vi.spyOn(definition(), 'isDeckMatch').mockReturnValue(true)
  const deck = { api_ship: [1, 2, -1, -1, -1, -1] } as ApiDeckPort
  vi.spyOn(svdata, 'deckPort').mockReturnValue(deck)
  vi.spyOn(svdata, 'battleDeck', 'get').mockReturnValue(deck)
  return { q, record }
}

function practice(rank: WinRank = 'B'): void {
  ApiCallback.call(Api.REQ_PRACTICE_BATTLE_RESULT, {
    deck_id: 1, result: { api_win_rank: rank },
  } as PrvPracticeBattleInfo)
}

function battle(map: number, rank: WinRank = 'A', boss = true): void {
  vi.spyOn(svdata, 'mapStart', 'get').mockReturnValue({ api_maparea_id: 2, api_mapinfo_no: map } as ApiMapStart)
  ApiCallback.call(Api.REQ_SORTIE_BATTLERESULT, {
    map: { api_event_id: boss ? ApiEventId.bossBattle : 0, api_no: 1 },
    result: { api_win_rank: rank },
  } as PrvBattleInfo)
}

describe('quest 317 definition', () => {
  it('has one practice counter followed by four map counters', () => {
    const stuff = definition()
    expect(stuff.max).toEqual([3, 1, 1, 1, 1])
    expect(stuff.maps).toEqual([[2, 2, 'A'], [2, 3, 'A'], [2, 4, 'A'], [2, 5, 'A']])
    expect(stuff.max).toHaveLength(stuff.maps.length + 1)
  })

  it.each([
    { categories: [], expected: false },
    { categories: [Category.kagerou], expected: false },
    { categories: [Category.kagerou, Category.none], expected: false },
    { categories: [Category.kagerou, Category.yuugumo], expected: true },
    { categories: [Category.kagerou, Category.kagerou], expected: true },
    { categories: [Category.yuugumo, Category.yuugumo], expected: true },
    { categories: [Category.none, Category.yuugumo, Category.kagerou], expected: true },
  ])('matches ship categories $categories: $expected', ({ categories, expected }) => {
    const raw = createSvDataRaw()
    raw.apiData.api_mst_ship.push(...categories.map((category, i) => ({ api_id: i + 100, api_ctype: category }) as MstShip))
    raw.apiData.api_ship.push(...categories.map((_, i) => ({ api_id: i + 1, api_ship_id: i + 100 }) as ApiShip))
    const ids = [...categories.map((_, i) => i + 1), ...Array<number>(6 - categories.length).fill(-1)]
    expect(definition().isDeckMatch(new SvData(raw), ids)).toBe(expected)
  })
})

describe('quest 317 date correction', () => {
  it.each([
    { date: '2026-11-02T23:59:59+09:00', expected: '20261102' },
    { date: '2026-11-03T00:00:00+09:00', expected: '20261102' },
    { date: beforeBoundary, expected: '20261102' },
    { date: afterBoundary, expected: '20261103' },
    { date: '2026-11-02T20:00:00Z', expected: '20261103' },
  ])('uses the JST 05:00 boundary for $date', ({ date, expected }) => {
    expect(dates.getQuestDateString(new Date(date))).toBe(expected)
  })

  it('does not reset within the same quest day', () => {
    const { q, record } = start(undefined, '2026-11-02T23:00:00+09:00')
    expect(q.fixState(record.quest, record.state, record)).toBe(false)
    expect(record.state.count).toEqual([2, 1, 0, 1, 0])
    expect(record.date).toBe('2026-11-02T23:00:00+09:00')
  })

  it('corrects a previous-day record when creating the updater', () => {
    now = afterBoundary
    const { record } = start()
    expect(record.state.count).toEqual([0, 1, 0, 1, 0])
    expect(record.date).toBe(afterBoundary)
  })

  it('resets only practice after callbacks are registered and is idempotent', () => {
    const { q, record } = start()
    now = afterBoundary
    expect(q.fixState(record.quest, record.state, record)).toBe(true)
    expect(record.state.count).toEqual([0, 1, 0, 1, 0])
    expect(record.state.countMax).toEqual([3, 1, 1, 1, 1])
    expect(record.date).toBe(afterBoundary)
    expect(q.fixState(record.quest, record.state, record)).toBe(false)
  })

  it('updates the date even when the practice counter is already zero', () => {
    const { q, record } = start([0, 1, 0, 1, 0])
    now = afterBoundary
    expect(q.fixState(record.quest, record.state, record)).toBe(true)
    expect(record.date).toBe(afterBoundary)
  })

  it('preserves three completed practice wins on subsequent days', () => {
    const { q, record } = start([3, 1, 0, 1, 0])
    now = '2026-11-05T05:00:00+09:00'
    expect(q.fixState(record.quest, record.state, record)).toBe(false)
    expect(record.state.count).toEqual([3, 1, 0, 1, 0])
  })
})

describe('quest 317 practice events', () => {
  it('resets before adding a win without a quest-list refresh and saves once', () => {
    const { q, record } = start()
    now = afterBoundary
    practice()
    expect(record.state.count).toEqual([1, 1, 0, 1, 0])
    expect(record.date).toBe(afterBoundary)
    expect(q.update).toHaveBeenCalledTimes(1)
  })

  it.each(['loss', 'wrong fleet', 'missing deck'] as const)('saves a reset even with %s', (reason) => {
    const { q, record } = start()
    now = afterBoundary
    if (reason === 'wrong fleet') vi.mocked(definition().isDeckMatch).mockReturnValue(false)
    if (reason === 'missing deck') vi.mocked(svdata.deckPort).mockReturnValue(undefined)
    practice(reason === 'loss' ? 'C' : 'B')
    expect(record.state.count).toEqual([0, 1, 0, 1, 0])
    expect(record.date).toBe(afterBoundary)
    expect(q.update).toHaveBeenCalledTimes(1)
  })

  it.each(['S', 'A', 'B', 'C', 'D', 'E'] as WinRank[])('handles practice rank %s', (rank) => {
    const { q, record } = start([0, 0, 0, 0, 0])
    practice(rank)
    const wins = ['S', 'A', 'B'].includes(rank) ? 1 : 0
    expect(record.state.count).toEqual([wins, 0, 0, 0, 0])
    expect(q.update).toHaveBeenCalledTimes(wins)
  })

  it('caps practice at three while keeping sortie callbacks active', () => {
    const { record } = start([2, 0, 0, 0, 0])
    practice()
    now = afterBoundary
    practice()
    battle(2)
    expect(record.state.count).toEqual([3, 1, 0, 0, 0])
  })
})

describe('quest 317 sortie events', () => {
  it('does not count sorties until all three practice wins are complete', () => {
    const { q, record } = start([2, 0, 0, 0, 0])
    battle(2)
    expect(record.state.count).toEqual([2, 0, 0, 0, 0])
    expect(q.update).not.toHaveBeenCalled()
  })

  it.each([2, 3, 4, 5])('counts map 2-%i in its own counter and caps it at one', (map) => {
    const { q, record } = start([3, 0, 0, 0, 0])
    battle(map)
    battle(map)
    const expected = [3, 0, 0, 0, 0]
    expected[map - 1] = 1
    expect(record.state.count).toEqual(expected)
    expect(q.update).toHaveBeenCalledTimes(1)
  })

  it.each(['wrong map', 'B rank', 'non-boss', 'wrong fleet', 'missing deck'] as const)('rejects %s', (reason) => {
    const { q, record } = start([3, 0, 0, 0, 0])
    if (reason === 'wrong fleet') vi.mocked(definition().isDeckMatch).mockReturnValue(false)
    if (reason === 'missing deck') vi.spyOn(svdata, 'battleDeck', 'get').mockReturnValue(undefined)
    battle(reason === 'wrong map' ? 1 : 2, reason === 'B rank' ? 'B' : 'A', reason !== 'non-boss')
    expect(record.state.count).toEqual([3, 0, 0, 0, 0])
    expect(q.update).not.toHaveBeenCalled()
  })

  it('completes all maps with S wins and unregisters both callbacks', () => {
    const { q, record } = start([3, 0, 0, 0, 0])
    for (const map of [2, 3, 4, 5]) battle(map, 'S')
    expect(record.state.count).toEqual([3, 1, 1, 1, 1])
    expect(QuestUpdater.popNo).toHaveBeenCalledWith(317)
    expect(q.update).toHaveBeenCalledTimes(4)
    const matcher = vi.mocked(definition().isDeckMatch)
    matcher.mockClear()
    practice()
    battle(2)
    expect(matcher).not.toHaveBeenCalled()
    expect(q.update).toHaveBeenCalledTimes(4)
  })
})
