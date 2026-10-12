import { describe, expect, it } from 'vitest'
import { tryParseQuestSchemas } from '@common/kcquest_parser'

describe('tryParseQuestSchemas', () => {
  const schema = {
    no: 230,
    questType: 'battleEnemy',
    max: [6],
    key: 'infer',
    formatter: ['\u6f5c\u6c34\u8266\u6483\u6c88\uff1a'],
    definitions: [[{ type: 'enemyShipType', enemyType: [13] }]],
  }

  it('parses the enemy ship type quest from a JSON array', () => {
    const result = tryParseQuestSchemas(JSON.stringify([schema]))

    expect(result.success).toBe(true)
    if (!result.success) throw result.error

    expect(result.schemas).toEqual([schema])
  })

  it('normalizes a single quest to an array', () => {
    const result = tryParseQuestSchemas(JSON.stringify(schema))

    expect(result.success).toBe(true)
    if (!result.success) throw result.error

    expect(result.schemas).toEqual([schema])
  })

  it('parses multiple quests in order', () => {
    const otherSchema = {
      no: 101,
      questType: 'hensei',
      max: [1],
      key: 'infer',
      formatter: [],
      definitions: [[{ type: 'deckShipCount', operator: 'gte', value: 2 }]],
    }
    const result = tryParseQuestSchemas(JSON.stringify([schema, otherSchema]))

    expect(result.success).toBe(true)
    if (!result.success) throw result.error

    expect(result.schemas).toEqual([schema, otherSchema])
  })

  it('rejects the supplied ememyType spelling instead of enemyType', () => {
    const invalidSchema = {
      ...schema,
      definitions: [[{ type: 'enemyShipType', ememyType: [13] }]],
    }
    const result = tryParseQuestSchemas(JSON.stringify([invalidSchema]))

    expect(result.success).toBe(false)
    if (result.success) throw new Error('Expected parsing to fail')

    expect(result.error).toBeInstanceOf(Error)
    expect(result.error.message).toContain('index: 0')
  })

  it('rejects the entire array when the second quest is invalid', () => {
    const invalidSchema = {
      ...schema,
      definitions: [[{ type: 'enemyShipType', enemyType: ['13'] }]],
    }
    const result = tryParseQuestSchemas(JSON.stringify([schema, invalidSchema]))

    expect(result.success).toBe(false)
    if (result.success) throw new Error('Expected parsing to fail')

    expect(result.error.message).toContain('index: 1')
    expect(result).not.toHaveProperty('schemas')
  })

  it('returns a failure without throwing for malformed JSON', () => {
    const result = tryParseQuestSchemas('[{')

    expect(result.success).toBe(false)
    if (result.success) throw new Error('Expected parsing to fail')

    expect(result.error).toBeInstanceOf(SyntaxError)
  })
})
