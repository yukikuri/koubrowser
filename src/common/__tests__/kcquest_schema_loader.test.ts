import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadQuestSchemaJson } from '@common/kcquest_schema_loader'
import * as converter from '@common/kcquest_converter'
import { getQuestStuff } from '@common/kcquest'

const meta = { schemaVersion: 1, revision: 1, updatedAt: '2026-10-11T00:00:00Z' }
const quest = { no: 261, questType: 'battleMap', max: [3], key: 'infer', formatter: [], maps: [[1, 5, 'A']], definitions: [] }

afterEach(() => vi.restoreAllMocks())

describe('loadQuestSchemaFile', () => {
  it.each([[], [{ no: 261, info: 'Map conditions', extra: 'ignored' }]].map(questInfos => ({ questInfos })))('accepts optional quest descriptions %#', ({ questInfos }) => {
    const result = loadQuestSchemaJson(JSON.stringify({ meta: { ...meta, questInfos }, quests: [quest] }))
    if (!result.success) throw result.error
    expect(result.meta.questInfos).toEqual(questInfos.map(({ no, info }) => ({ no, info })))
  })

  it.each([null, {}, [{ no: 0, info: 'text' }], [{ no: 1.5, info: 'text' }], [{ no: '261', info: 'text' }], [{ no: 261 }], [{ no: 261, info: 1 }]].map(questInfos => ({ questInfos })))(
    'rejects malformed quest descriptions %#', ({ questInfos }) => {
      expect(loadQuestSchemaJson(JSON.stringify({ meta: { ...meta, questInfos }, quests: [quest] })).success).toBe(false)
    }
  )
  it('converts v1 quests without modifying the registry', () => {
    const registered = getQuestStuff(261)
    const result = loadQuestSchemaJson(JSON.stringify({ meta, quests: [quest] }))
    if (!result.success) throw result.error
    expect(result.meta).toEqual(meta)
    expect(result.skipped).toEqual([])
    expect(result.quests).toHaveLength(1)
    expect(result.quests[0].no).toBe(261)
    expect(result.quests[0].stuff.questType).toBe('battleMap')
    expect(result.quests[0].stuff.max).toEqual([3])
    expect(typeof result.quests[0].stuff).toBe('function')
    expect(getQuestStuff(261)).toBe(registered)
  })

  it('keeps successful quests and reports invalid/unsupported quests individually', () => {
    const result = loadQuestSchemaJson(JSON.stringify({ meta, quests: [
      quest, { ...quest, no: 999, questType: 'future' }, null,
      { ...quest, no: 303, questType: 'practice', need_win_rank: '' },
      { ...quest, no: 9999, definitions: [[{ type: 'future' }]] },
      { ...quest, no: 123, questType: 'kaisouUseType', powerup_ship_type: null, use_ship_type: null },
    ] }))
    if (!result.success) throw result.error
    expect(result.quests.map(item => item.no)).toEqual([261, 303])
    expect(result.skipped.map(item => item.index)).toEqual([1, 2, 4, 5])
    expect(result.skipped.map(item => item.no)).toEqual([999, undefined, 9999, 123])
    expect(result.skipped.every(item => item.error instanceof Error)).toBe(true)
  })

  it('skips all entries with a duplicate number while processing other quests', () => {
    const result = loadQuestSchemaJson(JSON.stringify({ meta, quests: [quest, { ...quest, questType: 'future' }, { ...quest, no: 262 }] }))
    if (!result.success) throw result.error
    expect(result.quests.map(item => item.no)).toEqual([262])
    expect(result.skipped.map(item => item.index)).toEqual([0, 1])
    expect(result.skipped[0].error.message).toContain('Duplicate')
  })

  it('continues after an unexpected converter exception', () => {
    vi.spyOn(converter, 'convertToQuest').mockImplementationOnce(() => { throw new Error('conversion failed') })
    const result = loadQuestSchemaJson(JSON.stringify({ meta, quests: [quest, { ...quest, no: 262 }] }))
    if (!result.success) throw result.error
    expect(result.quests.map(item => item.no)).toEqual([262])
    expect(result.skipped[0].error.message).toBe('conversion failed')
  })

  it.each([[], [null, { no: 999, questType: 'future' }]].map(quests => ({ quests })))(
    'accepts a valid envelope even without convertible quests %#', ({ quests }) => {
      const result = loadQuestSchemaJson(JSON.stringify({ meta, quests }))
      if (!result.success) throw result.error
      expect(result.quests).toEqual([])
      expect(result.skipped).toHaveLength(quests.length)
    }
  )

  it.each([
    null, [], {}, { meta }, { meta, quests: {} }, { meta: null, quests: [] },
    ...[undefined, '1', 0, 1.5, 2].map(schemaVersion => ({ meta: { ...meta, schemaVersion }, quests: [quest] })),
    ...[undefined, -1, 1.5, '1'].map(revision => ({ meta: { ...meta, revision }, quests: [quest] })),
    ...[undefined, '', 'invalid', '2026-10-11', 123].map(updatedAt => ({ meta: { ...meta, updatedAt }, quests: [quest] })),
  ].map(value => ({ value })))('rejects invalid envelopes without calling the converter %#', ({ value }) => {
    const convert = vi.spyOn(converter, 'convertToQuest')
    expect(loadQuestSchemaJson(JSON.stringify(value)).success).toBe(false)
    expect(convert).not.toHaveBeenCalled()
  })

  it('returns a failure for malformed JSON', () => {
    const result = loadQuestSchemaJson('{')
    expect(result.success).toBe(false)
    if (result.success) throw new Error('Expected failure')
    expect(result.error).toBeInstanceOf(SyntaxError)
  })
})
