import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { QuestSchemaHolder } from '@common/kcquest_schema_holder'
import { QuestSchemaUpdater } from '../kcquest_schema_updater'
import type { FetchQuestSchemaResult } from '../kcquest_schema_fetcher'

const meta = { schemaVersion: 1 as const, revision: 2026101301, updatedAt: '2026-10-13T00:00:00Z' }
const quest = {
  no: 261, questType: 'battleMap', max: [3], key: 'infer',
  formatter: [], maps: [[1, 5, 'A']], definitions: []
}
const jsonText = JSON.stringify({ meta, quests: [quest] })

function setup(): {
  deps: {
    fetch: Mock<() => Promise<FetchQuestSchemaResult>>
    save: Mock; register: Mock; didApply: Mock; notify: Mock
  }
  updater: QuestSchemaUpdater
} {
  const deps = {
    fetch: vi.fn<() => Promise<FetchQuestSchemaResult>>().mockResolvedValue({ success: true, jsonText }),
    save: vi.fn(), register: vi.fn(), didApply: vi.fn(), notify: vi.fn()
  }
  return { deps, updater: new QuestSchemaUpdater(deps) }
}

describe('QuestSchemaUpdater', () => {
  beforeEach(() => QuestSchemaHolder.clear())

  it('keeps periodic updates pending until explicitly applied', async () => {
    const { deps, updater } = setup()
    const result = await updater.check(true)
    expect(result.questSchemaCheckStatus).toBe('available')
    expect(result.questSchemaPendingMeta).toEqual(meta)
    expect(result.questSchemaMeta).toBeNull()
    expect(deps.save).not.toHaveBeenCalled()
    expect(deps.register).not.toHaveBeenCalled()
    expect(deps.didApply).not.toHaveBeenCalled()
    const applied = await updater.applyPending()
    expect(applied.questSchemaCheckStatus).toBe('latest')
    expect(applied.questSchemaPendingMeta).toBeNull()
    expect(applied.questSchemaMeta).toEqual(meta)
    expect(deps.fetch).toHaveBeenCalledTimes(1)
    expect(deps.save).toHaveBeenCalledTimes(1)
    await updater.applyPending()
    expect(deps.save).toHaveBeenCalledTimes(1)
    expect(updater.getState().questSchemaCheckStatus).toBe('latest')
  })

  it('retains the pending update on a failed check or save and permits retry', async () => {
    const { deps, updater } = setup()
    await updater.check(true)
    deps.fetch.mockResolvedValueOnce({ success: false, error: new Error('offline') })
    expect((await updater.check(true)).questSchemaPendingMeta).toEqual(meta)
    deps.save.mockImplementationOnce(() => { throw new Error('disk') })
    expect((await updater.applyPending()).questSchemaPendingMeta).toEqual(meta)
    expect(QuestSchemaHolder.getMeta()).toBeNull()
    expect((await updater.applyPending()).questSchemaPendingMeta).toBeNull()
  })

  it('does not report unchanged data as an available update', async () => {
    QuestSchemaHolder.setMeta(meta)
    const { deps, updater } = setup()
    const result = await updater.check(true)
    expect(result.questSchemaCheckStatus).toBe('latest')
    expect(result.questSchemaPendingMeta).toBeNull()
    expect(deps.save).not.toHaveBeenCalled()
  })

  it('honors a manual apply request sharing an in-flight notification-only check', async () => {
    const { deps, updater } = setup()
    const periodic = updater.check(true)
    expect(updater.check()).toBe(periodic)
    expect((await periodic).questSchemaCheckStatus).toBe('latest')
    expect(deps.fetch).toHaveBeenCalledTimes(1)
    expect(deps.save).toHaveBeenCalledTimes(1)
  })

  it('saves before registering and applying, then reports latest', async () => {
    const { deps, updater } = setup()
    const result = await updater.check()
    expect(result.questSchemaCheckStatus).toBe('latest')
    expect(result.questSchemaMeta).toEqual(meta)
    expect(result.questSchemaLastCheckedAt).not.toBeNull()
    expect(deps.save.mock.invocationCallOrder[0]).toBeLessThan(deps.register.mock.invocationCallOrder[0])
    expect(deps.register.mock.invocationCallOrder[0]).toBeLessThan(deps.didApply.mock.invocationCallOrder[0])
    expect(deps.notify.mock.calls.map(([state]) => state.questSchemaCheckStatus)).toEqual(['checking', 'latest'])
  })

  it('does not apply unchanged revisions and clears previous errors', async () => {
    QuestSchemaHolder.setMeta(meta)
    QuestSchemaHolder.setError('previous failure')
    const { deps, updater } = setup()
    expect((await updater.check()).questSchemaCheckStatus).toBe('latest')
    expect(deps.save).not.toHaveBeenCalled()
    expect(deps.didApply).not.toHaveBeenCalled()
    expect(QuestSchemaHolder.getError()).toBeNull()
  })

  it('does not downgrade an applied revision', async () => {
    QuestSchemaHolder.setMeta({ ...meta, revision: meta.revision + 1 })
    const { deps, updater } = setup()
    expect((await updater.check()).questSchemaCheckStatus).toBe('older')
    expect(deps.save).not.toHaveBeenCalled()
  })

  it.each(['fetch', 'invalid', 'save', 'apply'] as const)('handles %s failure and allows retry', async (failure) => {
    const { deps, updater } = setup()
    if (failure === 'fetch') deps.fetch.mockRejectedValueOnce(new Error('offline'))
    if (failure === 'invalid') deps.fetch.mockResolvedValueOnce({ success: true, jsonText: '{}' })
    if (failure === 'save') deps.save.mockImplementationOnce(() => { throw new Error('disk') })
    if (failure === 'apply') deps.didApply.mockImplementationOnce(() => { throw new Error('apply') })
    expect((await updater.check()).questSchemaCheckStatus).toBe('error')
    expect(QuestSchemaHolder.getMeta()).toBeNull()
    if (failure !== 'apply') expect(deps.register).not.toHaveBeenCalled()
    expect((await updater.check()).questSchemaCheckStatus).toBe('latest')
  })

  it('distinguishes partially supported data from latest', async () => {
    const { deps, updater } = setup()
    deps.fetch.mockResolvedValue({ success: true, jsonText: JSON.stringify({ meta, quests: [quest, { no: 999, questType: 'unsupported' }] }) })
    const result = await updater.check()
    expect(result.questSchemaCheckStatus).toBe('partial')
    expect(result.questSchemaError).toContain('1件')
    expect(deps.register).toHaveBeenCalledTimes(1)
  })

  it('shares pending work and permits a new check after completion', async () => {
    const { deps, updater } = setup()
    let resolve!: (result: FetchQuestSchemaResult) => void
    deps.fetch.mockReturnValueOnce(new Promise<FetchQuestSchemaResult>(done => { resolve = done }))
    const first = updater.check()
    expect(updater.check()).toBe(first)
    await Promise.resolve()
    expect(deps.fetch).toHaveBeenCalledTimes(1)
    resolve({ success: true, jsonText })
    await first
    await updater.check()
    expect(deps.fetch).toHaveBeenCalledTimes(2)
  })
})
