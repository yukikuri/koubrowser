import { afterEach, describe, expect, it, vi } from 'vitest'
import * as kcs from '@common/kcs'
import * as kcquest from '@common/kcquest'
import * as kcquest_types from '@common/kcquest_types'
import { tryParseQuestSchemas } from '@common/kcquest_parser'
import { convertToQuest } from '@common/kcquest_converter'

function createQuest345FromSchema(): kcquest.QuestPracticeDeck {
  const jsonText = JSON.stringify({
    no: 345,
    questType: 'practiceDeck',
    max: [4],
    key: 'daily',
    need_win_rank: 'A',
    formatter: ['演習A勝利以上：'],
    definitions: [[
      { type: 'deckShipCount', operator: 'gte', value: 4 },
      {
        type: 'shipCountSum', operator: 'gte', value: 4,
        shipIds: [439, 78, 515, 571], shipCategories: [kcs.ApiShipCategory.jervis],
      },
    ]],
  })
  const parsed = tryParseQuestSchemas(jsonText)
  if (!parsed.success) throw parsed.error
  expect(parsed.schemas).toHaveLength(1)
  const schema = parsed.schemas[0]
  expect(schema.no).toBe(345)
  if (schema.questType !== 'practiceDeck') throw new Error('Unexpected quest type')
  const converted = convertToQuest(schema)
  if (!converted.success) throw converted.error
  return converted.stuff
}

describe.each([
  { name: '既存クラス版', getQuestStuff: (): kcquest.QuestPracticeDeck =>
    kcquest.getQuestStuff(345) as kcquest.QuestPracticeDeck },
  { name: 'QuestSchema版', getQuestStuff: createQuest345FromSchema },
])('quest 345: 演習ティータイム！ ($name)', ({ getQuestStuff }) => {

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('演習艦隊条件付きクエストの設定を持つ', () => {
    const stuff = getQuestStuff()

    expect(stuff).toBeDefined()
    expect(stuff.questType).toBe(kcquest_types.QuestType.practiceDeck)
    expect(stuff.max).toEqual([4])
    expect(stuff.key).toBe(kcquest_types.QuestKey.daily)
    expect(stuff.need_win_rank).toBe('A')
  })

  it('編成が4隻未満の場合は対象外になる', () => {
    const stuff = getQuestStuff()
    const svdata = new kcs.SvData(kcs.createSvDataRaw())
    const shipCount = vi.spyOn(kcs, 'shipCount')

    expect(stuff.isDeckMatch(svdata, [1, 2, 3, -1, -1, -1])).toBe(false)
    expect(shipCount).not.toHaveBeenCalled()
  })

  it('対象艦とJervis型が合計3隻の場合は対象外になる', () => {
    const stuff = getQuestStuff()
    const svdata = new kcs.SvData(kcs.createSvDataRaw())
    vi.spyOn(kcs, 'shipCount').mockReturnValue(2)
    vi.spyOn(kcs, 'shipCategoryCount').mockReturnValue(1)

    expect(stuff.isDeckMatch(svdata, [1, 2, 3, 4, -1, -1])).toBe(false)
  })

  it('対象艦とJervis型が合計4隻以上の場合は対象になる', () => {
    const stuff = getQuestStuff()
    const svdata = new kcs.SvData(kcs.createSvDataRaw())
    const shipCount = vi.spyOn(kcs, 'shipCount').mockReturnValue(3)
    const shipCategoryCount = vi.spyOn(kcs, 'shipCategoryCount').mockReturnValue(1)

    expect(stuff.isDeckMatch(svdata, [1, 2, 3, 4, -1, -1])).toBe(true)
    expect(shipCount).toHaveBeenCalledWith([], [439, 78, 515, 571])
    expect(shipCategoryCount).toHaveBeenCalledWith([], [kcs.ApiShipCategory.jervis])

    shipCount.mockReturnValue(4)
    shipCategoryCount.mockReturnValue(0)
    expect(stuff.isDeckMatch(svdata, [1, 2, 3, 4, 5, -1])).toBe(true)
  })
})
