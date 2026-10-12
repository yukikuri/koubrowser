import { describe, expect, it } from 'vitest'
import { tryParseQuestSchemas } from '@common/kcquest_parser'
import { convertToQuest } from '@common/kcquest_converter'
import { SvData, createSvDataRaw } from '@common/kcs'

const minimum = { type: 'deckShipCount', operator: 'gte', value: 2 }
const maximum = { type: 'deckShipCount', operator: 'lte', value: 3 }
const six = { type: 'deckShipCount', operator: 'eq', value: 6 }

function parse(definitions: unknown, questType = 'hensei'): ReturnType<typeof tryParseQuestSchemas> {
  return tryParseQuestSchemas(JSON.stringify({
    no: 101, questType, max: [1], key: 'infer', formatter: [], definitions,
  }))
}

describe('definition groups', () => {
  it.each([[1, false], [2, true], [3, true], [4, false], [6, true]])(
    'evaluates (2 <= count <= 3) OR count == 6 for %s ships', (count, expected) => {
      const parsed = parse([[minimum, maximum], [six]])
      if (!parsed.success) throw parsed.error
      const result = convertToQuest(parsed.schemas[0])
      if (!result.success) throw result.error
      if (result.stuff.questType !== 'hensei') throw new Error('Unexpected quest type')
      const ids = Array.from({ length: count }, (_, index) => index + 1)
      expect(result.stuff.isDeckMatch(new SvData(createSvDataRaw()), ids)).toBe(expected)
    }
  )

  it('treats an empty outer array as no extra conditions', () => {
    const parsed = parse([])
    if (!parsed.success) throw parsed.error
    const result = convertToQuest(parsed.schemas[0])
    if (!result.success) throw result.error
    if (result.stuff.questType !== 'hensei') throw new Error('Unexpected quest type')
    expect(result.stuff.isDeckMatch(new SvData(createSvDataRaw()), [])).toBe(true)
  })

  it.each([
    [[]], [[minimum], []], [minimum], [[minimum], six], null,
    [[{ type: 'unknown' }]], [[[minimum]]],
  ].map(definitions => ({ definitions })))('rejects malformed groups %#', ({ definitions }) => {
    expect(parse(definitions).success).toBe(false)
  })

  it('converts enemy target intersections and unions without duplicates', () => {
    const parsed = parse([
      [{ type: 'enemyShipType', enemyType: [13, 14] }, { type: 'enemyShipType', enemyType: [13] }],
      [{ type: 'enemyShipType', enemyType: [13, 2] }],
    ], 'battleEnemy')
    if (!parsed.success) throw parsed.error
    const result = convertToQuest(parsed.schemas[0])
    if (!result.success) throw result.error
    if (result.stuff.questType !== 'battleEnemy') throw new Error('Unexpected quest type')
    expect(result.stuff.type).toEqual([13, 2])
  })

  it('preserves an impossible enemy intersection as no matching targets', () => {
    const parsed = parse([[
      { type: 'enemyShipType', enemyType: [13] },
      { type: 'enemyShipType', enemyType: [2] },
    ]], 'battleEnemy')
    if (!parsed.success) throw parsed.error
    const result = convertToQuest(parsed.schemas[0])
    if (!result.success) throw result.error
    if (result.stuff.questType !== 'battleEnemy') throw new Error('Unexpected quest type')
    expect(result.stuff.type).toEqual([])
  })
})
