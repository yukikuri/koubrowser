import { describe, expect, it, vi } from 'vitest'
import * as kcs from '@common/kcs'
import * as kcdate from '@common/kcdate'
import * as qs from '@common/kcquest'
import { Quest } from '@common/record'
import { generateDateKey, QuestUpdater } from '@main/kcquest'

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

describe('QuestUpdater tests', () => {
  it('isValidNotSupportQuest method', () => {
    const record = createDummyQuest(999999)
    expect(QuestUpdater.isValidNotSupportQuest(record)).toBe(false)
  })
})

describe('Quest key tests', () => {
  it('questDateKey test', () => {
    const stuff: qs.QuestCommon = {
      max: [],
      key: qs.QuestKey.quarterly,
    }
    const r = createDummyQuest(1)

    const checks: {
      keyType: qs.QuestKey,
      dateParam: Date,
      expectKey: string
    }[] = [
      {
        keyType: qs.QuestKey.quarterly,
        dateParam: new Date(2026, 0, 10),
        expectKey: 'quarterly-2025-4',
      },
      {
        keyType: qs.QuestKey.quarterly,
        dateParam: new Date(2026, 1, 10),
        expectKey: 'quarterly-2025-4',
      },
      {
        keyType: qs.QuestKey.quarterly,
        dateParam: new Date(2026, 2, 10),
        expectKey: 'quarterly-2026-1',
      },
      {
        keyType: qs.QuestKey.quarterly,
        dateParam: new Date(2026, 3, 10),
        expectKey: 'quarterly-2026-1',
      },
      {
        keyType: qs.QuestKey.quarterly,
        dateParam: new Date(2026, 4, 10),
        expectKey: 'quarterly-2026-1',
      },
      {
        keyType: qs.QuestKey.quarterly,
        dateParam: new Date(2026, 5, 10),
        expectKey: 'quarterly-2026-2',
      },
      {
        keyType: qs.QuestKey.quarterly,
        dateParam: new Date(2026, 6, 10),
        expectKey: 'quarterly-2026-2',
      },
      {
        keyType: qs.QuestKey.quarterly,
        dateParam: new Date(2026, 7, 10),
        expectKey: 'quarterly-2026-2',
      },
      {
        keyType: qs.QuestKey.quarterly,
        dateParam: new Date(2026, 8, 10),
        expectKey: 'quarterly-2026-3',
      },
      {
        keyType: qs.QuestKey.quarterly,
        dateParam: new Date(2026, 9, 10),
        expectKey: 'quarterly-2026-3',
      },
      {
        keyType: qs.QuestKey.quarterly,
        dateParam: new Date(2026, 10, 10),
        expectKey: 'quarterly-2026-3',
      },
      {
        keyType: qs.QuestKey.quarterly,
        dateParam: new Date(2026, 11, 10),
        expectKey: 'quarterly-2026-4',
      },
    ];

    checks.forEach((check) => {
      vi.spyOn(kcdate, 'currentServerDate').mockReturnValueOnce(check.dateParam)
      stuff.key = check.keyType
      const key = generateDateKey(stuff, r.quest)
      //console.log('Generated key:', key, 'expect:', check.expectKey, 'date:', check.dateParam.toLocaleDateString())
      expect(key).toBe(check.expectKey)
    })
  })
})