import { expect, describe, it, vi } from 'vitest'
import * as kcs from '@common/kcs'
import * as qs from '@common/kcquest'
import { Quest } from '@common/record'

function createDummyApiQuest(api_no): kcs.ApiQuest {
  return {
    api_no,
    api_category: kcs.ApiQuestCategory.ensei,
    api_type: kcs.ApiQuestType.daily,
    api_label_type: 0,
    api_state: kcs.ApiQuestState.not_started,
    api_title: '',
    api_detail: '',
    api_voice_id: 0,
    api_get_material: [0, 0, 0, 0],
    api_bonus_flag: 0,
    api_progress_flag: 0,
    api_invalid_flag: 0,
  }
}

function createDummyQuest(api_no: number): Quest<null> {
  return {
    no: api_no,
    dateKey: '',
    date: '',
    quest: createDummyApiQuest(api_no),
    state: null
  }
}

describe('quest stuff(106) class test', () => {
  const quest_no = 106
  function getStuff<T = qs.QuestHensei>() {
    return qs.getQuestStuff(quest_no) as T
  }

  it('check stuff', () => {
    const stuff = getStuff()
    expect(stuff).toBeDefined()
    expect(stuff?.questType).toBe(qs.QuestType.hensei)
  })

  it('check method', () => {
    const stuff = getStuff()
    const svdata = new kcs.SvData(kcs.createSvDataRaw())
    vi.spyOn(kcs, 'shipTypeCount').mockReturnValueOnce(2)
    expect(stuff.isDeckMatch(svdata, [])).toBe(true)
    vi.spyOn(kcs, 'shipTypeCount').mockReturnValueOnce(1)
    expect(stuff.isDeckMatch(svdata, [])).toBe(false)
  });

  it('check formatter', () => {
    const stuff = getStuff()
    expect(stuff.formatter(createDummyQuest(quest_no))).toBe('')
  })
})

describe('quest stuff(107) class test', () => {
  const quest_no = 107
  function getStuff<T = qs.QuestHensei>() {
    return qs.getQuestStuff(quest_no) as T
  }

  it('check stuff', () => {
    const stuff = getStuff()
    expect(stuff).toBeDefined()
    expect(stuff?.questType).toBe(qs.QuestType.hensei)
  })

  it('check method', () => {
    const stuff = getStuff()
    const svdata = new kcs.SvData(kcs.createSvDataRaw())
    vi.spyOn(kcs, 'shipTypeCount').mockReturnValueOnce(0)
    expect(stuff.isDeckMatch(svdata, [])).toBe(false)
    const spy1 = vi.spyOn(kcs, 'shipTypeCount')
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(2)
    expect(stuff.isDeckMatch(svdata, [])).toBe(false)
    spy1.mockRestore()

    const spy2 = vi.spyOn(kcs, 'shipTypeCount')
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(3)
    vi.spyOn(kcs, 'deckShipCount').mockReturnValueOnce(5)
    expect(stuff.isDeckMatch(svdata, [])).toBe(false)
    spy2.mockRestore()

    const spy3 = vi.spyOn(kcs, 'shipTypeCount')
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(3)
    vi.spyOn(kcs, 'deckShipCount').mockReturnValueOnce(6)
    expect(stuff.isDeckMatch(svdata, [])).toBe(true)
    spy3.mockRestore()
  })

  it('check formatter', () => {
    const stuff = getStuff()
    expect(stuff.formatter(createDummyQuest(quest_no))).toBe('')
  })
})
