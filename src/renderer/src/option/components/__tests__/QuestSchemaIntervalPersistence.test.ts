import { expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { defaultOptionSetting, defaultQuestSchemaCheckState, type QuestSchemaCheckIntervalHours } from '@common/option'
import { optionSetting, setOptionSettingWithPreventSave } from '@option/store/optionSetting'
import QuestSchemaInfo from '../QuestSchemaInfo.vue'

it('displays the loaded interval and sends changes to the option save API', async () => {
  const original = Object.getOwnPropertyDescriptor(window, 'optionApi')
  const saveSetting = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(window, 'optionApi', {
    configurable: true,
    value: { saveSetting } satisfies Partial<Window['optionApi']>
  })
  const data = {
    setting: { ...defaultOptionSetting(), questSchemaCheckIntervalHours: 12 as const },
    viewInfo: { defaultCaptureSavePath: '', ...defaultQuestSchemaCheckState() }
  }
  setOptionSettingWithPreventSave(data)
  await nextTick()
  const wrapper = mount(QuestSchemaInfo, {
    props: {
      meta: null,
      checkIntervalHours: optionSetting.questSchemaCheckIntervalHours,
      checkNotifyOnly: optionSetting.questSchemaCheckNotifyOnly,
      'onUpdate:checkNotifyOnly': (value: boolean): void => {
        optionSetting.questSchemaCheckNotifyOnly = value
      },
      'onUpdate:checkIntervalHours': (value: QuestSchemaCheckIntervalHours): void => {
        optionSetting.questSchemaCheckIntervalHours = value
      }
    }
  })
  try {
    expect(wrapper.get('select').element.value).toBe('12')
    expect(saveSetting).not.toHaveBeenCalled()
    await wrapper.get('select').setValue('0')
    expect(saveSetting).toHaveBeenCalledTimes(1)
    expect(saveSetting).toHaveBeenCalledWith(expect.objectContaining({ questSchemaCheckIntervalHours: 0 }))
    await wrapper.get('input[type="checkbox"]').setValue(true)
    expect(saveSetting).toHaveBeenLastCalledWith(expect.objectContaining({ questSchemaCheckNotifyOnly: true }))
  } finally {
    wrapper.unmount()
    setOptionSettingWithPreventSave({ ...data, setting: defaultOptionSetting() })
    await nextTick()
    if (original) Object.defineProperty(window, 'optionApi', original)
    else Reflect.deleteProperty(window, 'optionApi')
  }
})
