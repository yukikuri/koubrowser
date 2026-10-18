import { expect, it } from 'vitest'
import { translateShipName, translateTerm } from '../index'

it('composes ship names only from confirmed base names and fully recognized suffixes', () => {
  expect(translateShipName('ko', '金剛')).toBe('콩고')
  expect(translateShipName('ko', '金剛改二')).toBe('콩고 개2')
  expect(translateShipName('ko', '金剛改二丙')).toBe('콩고 개2 병')
  expect(translateShipName('ko', '時雨改三')).toBe('시구레 개3')
  expect(translateShipName('ko', '雪風改')).toBe('유키카제 개')
  expect(translateShipName('ja', '金剛改二')).toBe('金剛改二')
  expect(translateShipName('ko', '金剛未確認')).toBe('金剛未確認')
  expect(translateShipName('ko', '未登録艦改二')).toBe('未登録艦改二')
})

it('keeps exact equipment names distinct from ship suffix processing', () => {
  expect(translateTerm('ko', '三式弾')).toBe('삼식탄')
  expect(translateTerm('ja', '三式弾')).toBe('三式弾')
  expect(translateTerm('ko', '未知の装備改二')).toBe('未知の装備改二')
})
