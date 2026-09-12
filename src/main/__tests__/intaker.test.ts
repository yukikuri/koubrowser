import { describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'
import { toDropData } from '@main/stuff/intaker'
import { svdata } from '@main/svdata'
import type { DropRecord } from '@common/record'
import type { DropData } from '@main/orval/generated/kc-intake'

function readDropTestData<T>(file: string): T {
  const p = path.resolve(__dirname, 'testdata', 'drop', file)
  const raw = fs.readFileSync(p, 'utf8')
  return JSON.parse(raw) as T
}

describe('toDropData', () => {
  it.each(['1', '2', '3', '4'])('converts drop record case %s', (prefix) => {
    svdata.setServerId(17)

    const record = readDropTestData<DropRecord>(`${prefix}-record.json`)
    const expected = readDropTestData<DropData[]>(`${prefix}-drop.json`)

    expect([toDropData(record)]).toEqual(expected)
  })
})
