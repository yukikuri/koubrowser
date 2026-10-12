import { beforeEach, describe, expect, it } from 'vitest'
import type { QuestSchemaMetaV1 } from '@common/kcquest_schema_file'
import { QuestSchemaHolder } from '@common/kcquest_schema_holder'

const meta: QuestSchemaMetaV1 = {
  schemaVersion: 1,
  revision: 2,
  updatedAt: '2026-10-12T00:00:00Z'
}

describe('QuestSchemaHolder', () => {
  beforeEach(() => QuestSchemaHolder.clear())

  it('requires application when no metadata is stored, including revision zero', () => {
    expect(QuestSchemaHolder.getMeta()).toBeNull()
    expect(QuestSchemaHolder.needsUpdate({ ...meta, revision: 0 })).toBe(true)
    expect(QuestSchemaHolder.getMeta()).toBeNull()
  })

  it('stores metadata independently of the input object', () => {
    const input = { ...meta }
    QuestSchemaHolder.setMeta(input)
    input.revision = 100
    expect(QuestSchemaHolder.getMeta()).toEqual(meta)
  })

  it('returns a separate copy on each read', () => {
    QuestSchemaHolder.setMeta(meta)
    const result = QuestSchemaHolder.getMeta()
    expect(result).toEqual(meta)
    expect(result).not.toBe(QuestSchemaHolder.getMeta())
    if (result) Object.assign(result, { revision: 100 })
    expect(QuestSchemaHolder.getMeta()).toEqual(meta)
  })

  it.each([
    [1, false],
    [2, false],
    [3, true]
  ])('checks revision %i without changing stored metadata', (revision, expected) => {
    QuestSchemaHolder.setMeta(meta)
    expect(QuestSchemaHolder.needsUpdate({ ...meta, revision })).toBe(expected)
    expect(QuestSchemaHolder.getMeta()).toEqual(meta)
  })

  it('does not treat an updatedAt change alone as a new revision', () => {
    QuestSchemaHolder.setMeta(meta)
    expect(QuestSchemaHolder.needsUpdate({
      ...meta,
      updatedAt: '2026-10-13T00:00:00Z'
    })).toBe(false)
  })

  it('replaces the stored metadata after application', () => {
    QuestSchemaHolder.setMeta(meta)
    const next = { ...meta, revision: 3 }
    QuestSchemaHolder.setMeta(next)
    expect(QuestSchemaHolder.getMeta()).toEqual(next)
    expect(QuestSchemaHolder.needsUpdate(next)).toBe(false)
  })

  it('clears metadata and allows application again', () => {
    QuestSchemaHolder.setMeta(meta)
    QuestSchemaHolder.clear()
    expect(QuestSchemaHolder.getMeta()).toBeNull()
    expect(QuestSchemaHolder.needsUpdate(meta)).toBe(true)
  })
})
