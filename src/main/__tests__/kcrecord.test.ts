import { describe, it, expect, vi } from 'vitest'

// electron.app をダミーに置き換え
const dmyVerison = '0.0.0.0-test' 
vi.mock('electron', () => ({
  app: {
    getVersion: vi.fn(() => dmyVerison),
    // 必要なら他のメソッドも追加
    // getPath: vi.fn((name: string) => '/tmp'),
  }
}))

import { RecordUtil } from '@main/kcrecord'
import fs from 'fs'
import path from 'path'
import * as kcs from '@common/kcs'

function readApiReqMapNext(): kcs.ApiMapNext {
  const p = path.resolve(__dirname, 'testdata', 'api_req_map-next.json')
  const raw = fs.readFileSync(p, 'utf8')
  const parsed = JSON.parse(raw) as kcs.ApiDataRoot
  return parsed.api_data as kcs.ApiMapNext
}

export function createDummySvdata(): kcs.SvData {
  return new kcs.SvData(kcs.createSvDataRaw())
}

describe('toAreaItemGetInfos', () => {

  it('returns a record-like object for sample input', () => {

    // const svdata = createDummySvdata();

    // // prototype の getter をスパイして返り値を固定
    // const deckMock = {
    //   api_member_id: 1,
    //   api_id: 1,
    //   api_name: 'mock-deck',
    //   api_name_id: '',
    //   api_mission: [0, 0, 0, 0],
    //   api_flagship: '',
    //   api_ship: [1, 2, 3]
    // }
    // const spy = vi.spyOn(kcs.SvData.prototype, 'battleDeck', 'get').mockReturnValue(deckMock as any)
    // vi.spyOn(record, 'toShipsInfo').mockReturnValueOnce([])
        
    const map = readApiReqMapNext()
    const ret = RecordUtil.toAreaItemGetInfos(map)
    expect(ret).toBeDefined()
    expect(ret?.length).toBe(2)
    const record0 = ret?.[0]
    expect(record0).toBeDefined()
    expect(record0?.itemId).toBe(map.api_itemget_eo_result?.api_id)
    expect(record0?.itemCount).toBe(1)
    expect(record0?.eoRate).toBe(map.api_get_eo_rate)
    const record1 = ret?.[1]
    expect(record1).toBeDefined()
    expect(record1?.itemId).toBe(kcs.ApiItemId.fual)
    expect(record1?.itemCount).toBe(map.api_itemget_eo_comment?.api_getcount)
    expect(record1?.eoRate).toBeUndefined()
  })
})
