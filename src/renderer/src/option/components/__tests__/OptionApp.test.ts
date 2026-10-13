import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defaultQuestSchemaCheckState, type QuestSchemaCheckState } from '@common/option'
import OptionApp from '../OptionApp.vue'
import { optionViewInfo } from '@option/store/optionSetting'

vi.mock('@option/store/optionSetting', async () => {
  const { defaultOptionSetting, defaultQuestSchemaCheckState } = await import('@common/option')
  const { reactive } = await import('vue')
  const info = reactive({ defaultCaptureSavePath: '', ...defaultQuestSchemaCheckState() })
  return {
    optionSetting: reactive(defaultOptionSetting()),
    optionViewInfo: info,
    setQuestSchemaCheckState: (state: QuestSchemaCheckState): void => { Object.assign(info, state) }
  }
})

let listener: (state: QuestSchemaCheckState) => void
const unsubscribe = vi.fn()
const check = vi.fn()

describe('OptionApp quest category', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(optionViewInfo, defaultQuestSchemaCheckState())
    Object.defineProperty(window, 'optionApi', { configurable: true, value: {
      getQuestSchemaState: async (): Promise<QuestSchemaCheckState> => ({ ...optionViewInfo }),
      checkQuestSchema: check,
      onQuestSchemaStateChanged: (callback: typeof listener): (() => void) => {
        listener = callback
        return unsubscribe
      }
    } })
  })

  it('requests a check and receives live results without reopening', async () => {
    const wrapper = mount(OptionApp)
    await flushPromises()
    await wrapper.findAll('.option-category').find(node => node.text() === '任務データ')!.trigger('click')
    await wrapper.get('.quest-schema-check-action button').trigger('click')
    expect(check).toHaveBeenCalledTimes(1)
    listener({ ...defaultQuestSchemaCheckState(), questSchemaCheckStatus: 'latest' })
    await flushPromises()
    expect(wrapper.get('[role="status"]').text()).toBe('最新です')
    wrapper.unmount()
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('does not overwrite a live result with an older initial snapshot', async () => {
    let resolve!: (state: QuestSchemaCheckState) => void
    window.optionApi.getQuestSchemaState = (): Promise<QuestSchemaCheckState> => new Promise(done => { resolve = done })
    const wrapper = mount(OptionApp)
    listener({ ...defaultQuestSchemaCheckState(), questSchemaCheckStatus: 'latest' })
    resolve(defaultQuestSchemaCheckState())
    await flushPromises()
    expect(optionViewInfo.questSchemaCheckStatus).toBe('latest')
    wrapper.unmount()
  })

  it('shows request failures and permits retry', async () => {
    check.mockRejectedValueOnce(new Error('IPC unavailable'))
    const wrapper = mount(OptionApp)
    await flushPromises()
    await wrapper.findAll('.option-category').find(node => node.text() === '任務データ')!.trigger('click')
    await wrapper.get('.quest-schema-check-action button').trigger('click')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('要求できませんでした')
    expect(wrapper.get<HTMLButtonElement>('.quest-schema-check-action button').element.disabled).toBe(false)
    wrapper.unmount()
  })

  it('places quest information in its own category, not general', async () => {
    const wrapper = mount(OptionApp)
    expect(wrapper.find('section[aria-label="任務データ"]').exists()).toBe(false)
    const button = wrapper.findAll('.option-category').find(node => node.text() === '任務データ')!
    expect(button.find('[role="img"]').exists()).toBe(false)
    await button.trigger('click')
    expect(wrapper.find('section[aria-label="任務データ"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('スクリーンショット・録画保存フォルダ')
    wrapper.unmount()
  })

  it('shows a category warning before navigating to quest details', async () => {
    optionViewInfo.questSchemaError = '任務データを保存できませんでした。'
    const wrapper = mount(OptionApp)
    const button = wrapper.findAll('.option-category').find(node => node.text() === '任務データ')!
    expect(button.get('[role="img"]').attributes('title')).toBe(optionViewInfo.questSchemaError)
    await button.trigger('click')
    expect(wrapper.get('[role="alert"]').text()).toBe(optionViewInfo.questSchemaError)
    wrapper.unmount()
  })
})
