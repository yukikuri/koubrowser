import { describe, expect, it } from 'vitest'
import { defaultOptionSetting } from '@common/option'
import { normalizeLanguage, translate, translateTerm } from '../index'
import korean from '../ko.json'
import terminology from '../terminology.json'

const keys = (text: string): string[] => [...text.matchAll(/\{(\d+)\}/g)].map((m) => m[1]).sort()

describe('interface translation safety', () => {
  it('defaults old, missing, and unsupported settings to Japanese', () => {
    expect(defaultOptionSetting().language).toBe('ja')
    for (const value of [undefined, null, '', 'en', 'KO', 1, {}, []]) {
      expect(normalizeLanguage(value)).toBe('ja')
    }
    expect(normalizeLanguage('ko')).toBe('ko')
  })

  it('preserves every original Japanese message and every interpolation exactly', () => {
    for (const source of Object.keys(korean)) expect(translate('ja', source)).toBe(source)
    expect(translate('ja', '値 {0}/{1}', [undefined, null])).toBe('値 undefined/null')
    expect(translate('ja', '{0}', ['<server value>'])).toBe('<server value>')
  })

  it('preserves parameter sets in the entire Korean catalog', () => {
    for (const [source, koreanText] of Object.entries(korean)) {
      expect(keys(koreanText), source).toEqual(keys(source))
    }
  })

  it('translates UI without reinterpreting user values as terms or messages', () => {
    expect(translate('ko', '閉じる')).toBe('닫기')
    expect(translate('ko', 'クリア', [], 'input')).toBe('지우기')
    expect(translate('ko', 'クリア')).toBe('완료')
    expect(translate('ko', '未知の装備')).toBe('未知の装備')
    expect(translate('ko', '更新をダウンロード中... {0}%', [37])).toBe('업데이트 다운로드 중... 37%')
    expect(translate('ko', '更新チェックエラー({0})', ['{term:遠征}'])).toBe('업데이트 확인 오류({term:遠征})')
    expect(translate('ko', '更新チェックエラー({0})', ['閉じる'])).toBe('업데이트 확인 오류(閉じる)')
  })

  it('uses only confirmed exact terminology, keeping all pending names intact', () => {
    for (const term of terminology) {
      if (term.kind === 'suffix') continue
      expect(translateTerm('ja', term.source)).toBe(term.source)
      expect(translateTerm('ko', term.source)).toBe(
        term.status === 'confirmed' && term.korean ? term.korean : term.source
      )
    }
    // Game names must not pass through the ordinary interface dictionary.
    expect(translateTerm('ko', '閉じる')).toBe('閉じる')
    expect(translateTerm('ko', '__proto__')).toBe('__proto__')
    expect(translate('ko', 'constructor')).toBe('constructor')
  })
})
