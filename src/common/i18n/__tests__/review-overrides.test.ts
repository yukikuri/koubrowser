import { expect, it, vi } from 'vitest'

vi.mock('../terms.json', async (importOriginal) => {
  const original = await importOriginal<{ default: Record<string, string> }>()
  return { default: {
    ...original.default,
    '金剛': '검수된 함명',
    '戦艦級': '검수된 함종',
    'クリア': '검수된 게임 표기'
  } }
})

import { translate, translateShipName } from '../index'

it('applies reviewed terms to labels and derived ship names while retaining explicit UI contexts', () => {
  expect(translate('ko', '戦艦級')).toBe('검수된 함종')
  expect(translateShipName('ko', '金剛改二')).toBe('검수된 함명 개2')
  expect(translate('ko', 'クリア', [], 'input')).toBe('지우기')
  expect(translate('ja', '戦艦級')).toBe('戦艦級')
})
