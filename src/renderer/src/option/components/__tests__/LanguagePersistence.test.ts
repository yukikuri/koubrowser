import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { defaultOptionSetting, defaultQuestSchemaCheckState } from '@common/option'
import { i18n, initializeLanguage, language } from '@renderer/i18n'
import { optionSetting, setOptionSettingWithPreventSave } from '@option/store/optionSetting'
import OptionApp from '../OptionApp.vue'

const original = Object.getOwnPropertyDescriptor(window, 'optionApi')
afterEach(async () => {
  initializeLanguage('ja')
  setOptionSettingWithPreventSave({
    setting: defaultOptionSetting(),
    viewInfo: { defaultCaptureSavePath: '', ...defaultQuestSchemaCheckState() }
  })
  await nextTick()
  if (original) Object.defineProperty(window, 'optionApi', original)
  else Reflect.deleteProperty(window, 'optionApi')
})

it('saves the selected language and synchronizes Vue I18n when initialized', async () => {
  const saveSetting = vi.fn()
  Object.defineProperty(window, 'optionApi', { configurable: true, value: {
    saveSetting,
    onQuestSchemaStateChanged: () => (): void => {},
    getQuestSchemaState: async () => defaultQuestSchemaCheckState()
  } })
  const setting = { ...defaultOptionSetting(), captureSavePath: '/unchanged/captures', proxyMode: 'direct' as const }
  setOptionSettingWithPreventSave({
    setting,
    viewInfo: { defaultCaptureSavePath: '', ...defaultQuestSchemaCheckState() }
  })
  await nextTick()
  const japanese = mount(OptionApp)
  await flushPromises()
  expect(japanese.get('.option-title').text()).toBe('甲ブラウザ 設定')
  expect(japanese.get<HTMLSelectElement>('#interface-language').element.value).toBe('ja')
  expect(saveSetting).not.toHaveBeenCalled()
  await japanese.get('#interface-language').setValue('ko')
  expect(saveSetting).toHaveBeenCalledWith({ ...setting, language: 'ko' })
  expect(language.value).toBe('ja')
  expect(japanese.text()).not.toContain('変更は甲ブラウザ再起動後に反映されます。')
  const checkboxCount = japanese.findAll('input[type="checkbox"]').length
  japanese.unmount()

  initializeLanguage(optionSetting.language)
  const korean = mount(OptionApp)
  await flushPromises()
  expect(document.documentElement.lang).toBe('ko')
  expect(korean.get('.option-title').text()).toBe('갑브라우저 설정')
  expect(korean.get<HTMLSelectElement>('#interface-language').element.value).toBe('ko')
  expect(i18n.global.locale.value).toBe('ko')
  // The safety feature and controls must survive translation.
  expect(korean.findAll('input[type="checkbox"]')).toHaveLength(checkboxCount)
  korean.unmount()
})
