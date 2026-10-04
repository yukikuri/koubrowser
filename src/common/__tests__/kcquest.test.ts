import { afterEach, describe, expect, it, vi } from 'vitest'
import * as kcs from '@common/kcs'
import * as kcquest from '@common/kcquest'

describe('quest 345: 演習ティータイム！', () => {
  const questNo = 345

  function getQuestStuff(): kcquest.QuestPracticeDeck {
    return kcquest.getQuestStuff(questNo) as kcquest.QuestPracticeDeck
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('演習艦隊条件付きクエストとして登録されている', () => {
    const stuff = getQuestStuff()

    expect(stuff).toBeDefined()
    expect(stuff.questType).toBe(kcquest.QuestType.practiceDeck)
    expect(stuff.max).toEqual([4])
    expect(stuff.need_win_rank).toBe('A')
  })

  it('編成が4隻未満の場合は対象外になる', () => {
    const stuff = getQuestStuff()
    const svdata = new kcs.SvData(kcs.createSvDataRaw())
    const shipCount = vi.spyOn(kcs, 'shipCount')

    expect(stuff.isDeckMatch(svdata, [1, 2, 3, -1, -1, -1])).toBe(false)
    expect(shipCount).not.toHaveBeenCalled()
  })

  it('対象艦が3隻の場合は対象外になる', () => {
    const stuff = getQuestStuff()
    const svdata = new kcs.SvData(kcs.createSvDataRaw())
    vi.spyOn(kcs, 'shipCount').mockReturnValue(3)

    expect(stuff.isDeckMatch(svdata, [1, 2, 3, 4, -1, -1])).toBe(false)
  })

  it('対象艦が4隻以上の場合は対象になる', () => {
    const stuff = getQuestStuff()
    const svdata = new kcs.SvData(kcs.createSvDataRaw())
    const shipCount = vi.spyOn(kcs, 'shipCount').mockReturnValue(4)

    expect(stuff.isDeckMatch(svdata, [1, 2, 3, 4, -1, -1])).toBe(true)
    expect(shipCount).toHaveBeenCalledWith([], [439, 78, 515, 571, 519, 520, 901])

    shipCount.mockReturnValue(5)
    expect(stuff.isDeckMatch(svdata, [1, 2, 3, 4, 5, -1])).toBe(true)
  })
})
