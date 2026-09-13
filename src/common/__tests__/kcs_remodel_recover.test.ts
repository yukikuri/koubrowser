import { describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'
import { ApiItemId, ApiMaterialId, createSvDataRaw, SvData } from '@common/kcs'
import { Api } from '@common/kcsapi'

function readRemodelRecoverTestData(file: string): string {
  const p = path.resolve(__dirname, 'testdata', 'remodel-recover', file)
  return fs.readFileSync(p, 'utf8')
}

function createRemodelRecoverSvData(): SvData {
  const raw = createSvDataRaw()
  raw.apiData.api_material.push({
    api_member_id: 1,
    api_id: ApiMaterialId.BUILD_KIT,
    api_value: 100
  })
  raw.apiData.api_useitem.push({
    api_id: ApiItemId.arsenal_resources,
    api_count: 10
  })
  raw.apiData.api_slot_item.push(
    {
      api_id: 191730,
      api_slotitem_id: 2,
      api_locked: 0,
      api_level: 5,
      api_alv: 0
    },
    {
      api_id: 192473,
      api_slotitem_id: 2,
      api_locked: 0,
      api_level: 5,
      api_alv: 0
    }
  )
  return new SvData(raw)
}

describe('reqKousyouRemodelSlotRecover', () => {
  it('decrements arsenal resources when recover failed', () => {
    const svdata = createRemodelRecoverSvData()

    svdata.setReq(
      Api.REQ_KOUSYOU_REMODEL_SLOT_RECOVER,
      readRemodelRecoverTestData('0-api_req_kousyou-remodel_slot_recover_req.txt')
    )
    svdata.update(
      Api.REQ_KOUSYOU_REMODEL_SLOT_RECOVER,
      readRemodelRecoverTestData('0-api_req_kousyou-remodel_slot_recover.json')
    )

    expect(svdata.useitem(ApiItemId.arsenal_resources)?.api_count).toBe(9)
    expect(svdata.materialSafe(ApiMaterialId.BUILD_KIT)).toBe(100)
    expect(svdata.slotitem(191730)?.api_level).toBe(5)
  })

  it('decrements materials and updates slotitem when recover succeeded', () => {
    const svdata = createRemodelRecoverSvData()

    svdata.setReq(
      Api.REQ_KOUSYOU_REMODEL_SLOT_RECOVER,
      readRemodelRecoverTestData('1-api_req_kousyou-remodel_slot_recover_req.txt')
    )
    svdata.update(
      Api.REQ_KOUSYOU_REMODEL_SLOT_RECOVER,
      readRemodelRecoverTestData('1-api_req_kousyou-remodel_slot_recover.json')
    )

    expect(svdata.useitem(ApiItemId.arsenal_resources)?.api_count).toBe(9)
    expect(svdata.materialSafe(ApiMaterialId.BUILD_KIT)).toBe(99)
    expect(svdata.slotitem(192473)).toMatchObject({
      api_id: 192473,
      api_slotitem_id: 2,
      api_locked: 0,
      api_level: 0
    })
  })
})
