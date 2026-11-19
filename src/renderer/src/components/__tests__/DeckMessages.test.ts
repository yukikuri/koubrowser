import { afterEach, expect, it } from 'vitest'
import { computed } from 'vue'
import { i18n, setLanguage, t } from '@renderer/i18n'
import jaMessages from '@common/i18n/locales/ja/messages.json'
import koMessages from '@common/i18n/locales/ko/messages.json'

afterEach(() => setLanguage('ja'))

it('compiles every deck message in both languages, including HTML and list placeholders', () => {
  expect(Object.keys(koMessages.deck).sort()).toEqual(Object.keys(jaMessages.deck).sort())
  for (const locale of ['ja', 'ko'] as const) {
    const messages = locale === 'ja' ? jaMessages.deck : koMessages.deck
    for (const [key, message] of Object.entries(messages)) {
      const values = ['ship', 'banner.png', 'cutin', 50, 7, 1.5]
      const translated = i18n.global.t(`deck.${key}`, values, { locale })
      expect(translated).toBe(message.replace(/\{(\d+)\}/g, (_, index: string) => String(values[Number(index)])))
    }
  }
})

it('updates deck labels and interpolated tooltip HTML when the language changes', () => {
  setLanguage('ja')
  const label = computed(() => t('deck.noAntiAirCutin'))
  const tooltip = computed(() => t('deck.antiAirCutinTooltip', ['ship', 'banner.png', 'CI', 50, 7, 1.5]))
  expect(label.value).toBe('対空CIなし')
  expect(tooltip.value).toContain('<div>固定:7 変動:1.5</div>')

  setLanguage('ko')
  expect(label.value).toBe('대공 CI 없음')
  expect(t('deck.cutinType', [42])).toBe('42종: ')
  expect(tooltip.value).toContain('<div>고정:7 변동:1.5</div>')
  expect(tooltip.value).toContain('<img class="img" src="banner.png">')
})
