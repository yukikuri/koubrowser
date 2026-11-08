import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiCallback, ApiShipType as Type, type ApiQuest, type ApiShip, type ApiPowerUpWothParam, type MstShip } from '@common/kcs'
import { Api } from '@common/kcsapi'
import type { Quest } from '@common/record'
import { QuestUpdater } from '@main/kcquest'
import { svdata } from '@main/svdata'

let updater: QuestUpdater | undefined
afterEach(() => {
  updater?.unsetCallback()
  updater = undefined
  vi.restoreAllMocks()
})

function start(no: number): QuestUpdater {
  const api = { api_no: no, api_type: 1, api_progress_flag: 0 } as ApiQuest
  const record: Quest = { no, dateKey: '', date: '', quest: api, state: null }
  const created = QuestUpdater.create(api, vi.fn(), record)
  if (!created) throw new Error(`Missing updater ${no}`)
  updater = created
  // Keep the real event/counter logic, but do not persist test data or alter active quest metadata.
  vi.spyOn(created, 'update').mockImplementation(() => undefined)
  vi.spyOn(QuestUpdater, 'popNo').mockImplementation(() => undefined)
  return created
}

function powerup(target: Type, materials: Type[], succeeded = true): void {
  vi.spyOn(svdata, 'mstShip').mockReturnValue({ api_id: 1, api_stype: target } as MstShip)
  const arg: ApiPowerUpWothParam = {
    api_data: { api_powerup_flag: succeeded ? 1 : 0, api_ship: { api_ship_id: 1 } as ApiShip },
    use_ships: materials.map((type, i) => ({ api_id: i + 2, api_stype: type }) as MstShip),
  }
  ApiCallback.call(Api.REQ_KAISOU_POWERUP, arg)
}

describe('quest 704 powerup progress', () => {
  it('counts successes only, completes at four and removes its callback', () => {
    const q = start(704)
    expect(q.record?.state.countMax).toEqual([4])
    powerup(Type.kutikukan, [], false)
    expect(q.record?.state.count).toEqual([0])
    for (let i = 1; i <= 4; i++) {
      powerup(Type.kutikukan, [])
      expect(q.record?.state.count).toEqual([i])
    }
    powerup(Type.kutikukan, [])
    expect(q.record?.state.count).toEqual([4])
    expect(q.update).toHaveBeenCalledTimes(4)
  })
})

describe('quest 705 powerup progress', () => {
  const fiveCarriers = [Type.seiki_kuubo, Type.soukou_kuubo, Type.kei_kuubo, Type.kei_kuubo, Type.seiki_kuubo]
  it.each([Type.seiki_kuubo, Type.soukou_kuubo])('accepts target type %i and mixed carrier materials', (type) => {
    const q = start(705)
    expect(q.record?.state.countMax).toEqual([2])
    powerup(type, fiveCarriers)
    expect(q.record?.state.count).toEqual([1])
    powerup(type, fiveCarriers)
    expect(q.record?.state.count).toEqual([2])
    powerup(type, fiveCarriers)
    expect(q.record?.state.count).toEqual([2])
    expect(q.update).toHaveBeenCalledTimes(2)
  })
  it.each([Type.kei_kuubo, Type.suibo, Type.kutikukan])('rejects target type %i', (type) => {
    const q = start(705)
    powerup(type, fiveCarriers)
    expect(q.record?.state.count).toEqual([0])
    expect(q.update).not.toHaveBeenCalled()
  })
  it.each([
    fiveCarriers.slice(0, 4),
    [...fiveCarriers.slice(0, 4), Type.suibo],
    [...fiveCarriers.slice(0, 4), Type.kutikukan],
  ])('rejects insufficient or non-carrier materials: %j', (...materials) => {
    const q = start(705)
    powerup(Type.seiki_kuubo, materials)
    expect(q.record?.state.count).toEqual([0])
    expect(q.update).not.toHaveBeenCalled()
  })
  it('does not count failed powerups', () => {
    const q = start(705)
    powerup(Type.seiki_kuubo, fiveCarriers, false)
    expect(q.record?.state.count).toEqual([0])
  })
})
