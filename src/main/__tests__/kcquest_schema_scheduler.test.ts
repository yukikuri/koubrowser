import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { QuestSchemaScheduler } from '../kcquest_schema_scheduler'
import type { QuestSchemaCheckIntervalHours } from '@common/option'

const hour = 60 * 60 * 1000
beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

it('checks repeatedly without resetting for unrelated setting changes', () => {
  const check = vi.fn()
  const scheduler = new QuestSchemaScheduler(check)
  scheduler.configure(3)
  vi.advanceTimersByTime(2 * hour)
  expect(check).not.toHaveBeenCalled()
  scheduler.configure(3)
  vi.advanceTimersByTime(hour)
  expect(check).toHaveBeenCalledTimes(1)
  vi.advanceTimersByTime(3 * hour)
  expect(check).toHaveBeenCalledTimes(2)
  scheduler.dispose()
})

it('restarts for a changed interval, disables at zero and stops permanently on disposal', () => {
  const check = vi.fn()
  const scheduler = new QuestSchemaScheduler(check)
  scheduler.configure(1)
  vi.advanceTimersByTime(hour / 2)
  scheduler.configure(3)
  vi.advanceTimersByTime(3 * hour - 1)
  expect(check).not.toHaveBeenCalled()
  vi.advanceTimersByTime(1)
  expect(check).toHaveBeenCalledTimes(1)
  scheduler.configure(0)
  vi.advanceTimersByTime(12 * hour)
  expect(check).toHaveBeenCalledTimes(1)
  scheduler.configure(1)
  scheduler.dispose()
  scheduler.configure(1)
  vi.advanceTimersByTime(12 * hour)
  expect(check).toHaveBeenCalledTimes(1)
  expect(vi.getTimerCount()).toBe(0)
})

it('falls back to six hours for invalid stored values', () => {
  const check = vi.fn()
  const scheduler = new QuestSchemaScheduler(check)
  scheduler.configure(-1 as QuestSchemaCheckIntervalHours)
  vi.advanceTimersByTime(hour)
  expect(check).not.toHaveBeenCalled()
  vi.advanceTimersByTime(5 * hour)
  expect(check).toHaveBeenCalledTimes(1)
  scheduler.dispose()
})
