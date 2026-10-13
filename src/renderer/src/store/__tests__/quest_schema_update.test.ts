import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { defaultQuestSchemaCheckState, type QuestSchemaCheckState } from '@common/option'
import { applyQuestSchemaUpdate, questSchemaApplying, questSchemaApplyError, questSchemaUpdateAvailable } from '../quest_schema_update'

const apply = vi.fn<() => Promise<QuestSchemaCheckState>>()
const openOption = vi.fn()
let original: PropertyDescriptor | undefined

beforeEach(() => {
  original = Object.getOwnPropertyDescriptor(window, 'api')
  apply.mockReset()
  openOption.mockClear()
  Object.defineProperty(window, 'api', { configurable: true, value: { applyQuestSchema: apply, openOption } })
  questSchemaUpdateAvailable.value = true
  questSchemaApplying.value = false
  questSchemaApplyError.value = null
})
afterEach(() => {
  if (original) Object.defineProperty(window, 'api', original)
  else Reflect.deleteProperty(window, 'api')
})

it('applies directly without opening options and prevents duplicate requests', async () => {
  let resolve!: (state: QuestSchemaCheckState) => void
  apply.mockReturnValue(new Promise(done => { resolve = done }))
  const task = applyQuestSchemaUpdate()
  expect(questSchemaApplying.value).toBe(true)
  await applyQuestSchemaUpdate()
  expect(apply).toHaveBeenCalledTimes(1)
  resolve({ ...defaultQuestSchemaCheckState(), questSchemaCheckStatus: 'latest' })
  await task
  expect(openOption).not.toHaveBeenCalled()
  expect(questSchemaApplying.value).toBe(false)
  expect(questSchemaApplyError.value).toBeNull()
})

it('preserves the notification after failure and permits retry', async () => {
  apply.mockResolvedValueOnce({ ...defaultQuestSchemaCheckState(), questSchemaCheckStatus: 'error', questSchemaError: 'save failed' })
  await applyQuestSchemaUpdate()
  expect(questSchemaApplyError.value).toBe('save failed')
  expect(questSchemaUpdateAvailable.value).toBe(true)
  apply.mockResolvedValueOnce({ ...defaultQuestSchemaCheckState(), questSchemaCheckStatus: 'latest' })
  await applyQuestSchemaUpdate()
  expect(apply).toHaveBeenCalledTimes(2)
  expect(questSchemaApplyError.value).toBeNull()
})

it('handles IPC failure and ignores clicks when no update is available', async () => {
  apply.mockRejectedValueOnce(new Error('IPC failed'))
  await applyQuestSchemaUpdate()
  expect(questSchemaApplyError.value).toContain('再試行')
  expect(questSchemaApplying.value).toBe(false)
  questSchemaUpdateAvailable.value = false
  await applyQuestSchemaUpdate()
  expect(apply).toHaveBeenCalledTimes(1)
})
