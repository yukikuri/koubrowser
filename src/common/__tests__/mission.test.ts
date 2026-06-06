import { expect, describe, it } from 'vitest'
import { MissionId, MissionStuff } from '@common/mission'

// type guard to convince TypeScript a value is non-null/non-undefined
function assertDefined<T>(v: T): asserts v is NonNullable<T> {
  if (v === undefined || v === null) throw new Error('Value is undefined or null')
}

describe('MissionDetail tests', () => {
  it('check isCombat true/false', () => {
    const combatIds: MissionId[] = [
      MissionId.IdA5,
      MissionId.IdA6,
      MissionId.IdB4,
      MissionId.IdB5,
      MissionId.IdB6,
      MissionId.Id43,
      MissionId.Id46,
      MissionId.IdD2, 
      MissionId.IdD3, 
      MissionId.IdE1, 
      MissionId.IdE2, 
    ]
    const notCombatIds: MissionId[] = Object.entries(MissionId).
      filter(([_, id]) => !combatIds.includes(id)).map(([_, id]) => id)
    combatIds.forEach((id) => {
      try {
        const detail = MissionStuff.getDetailById(id)
        assertDefined(detail);
        expect(detail.isCombat).toBe(true)
      } catch (e) {
        console.log(`MissionId ${id} check failed`)
        throw e
      }
    })
    notCombatIds.forEach((id) => {
      try {
        const detail = MissionStuff.getDetailById(id)
        assertDefined(detail);
        expect(detail.isCombat).toBe(false)
      } catch (e) {
        console.log(`MissionId ${id} check failed`)
        throw e
      }
    })
  })
})
