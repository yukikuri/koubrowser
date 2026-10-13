import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import QuestSchemaInfo from '../QuestSchemaInfo.vue'

const meta = { schemaVersion: 1 as const, revision: 2026101201, updatedAt: '2026-10-12T09:00:00Z' }

describe('QuestSchemaInfo', () => {
  it('shows applied quest descriptions as text, not pending descriptions or HTML', async () => {
    const wrapper = mount(QuestSchemaInfo, { props: {
      meta: { ...meta, questInfos: [{ no: 345, info: 'condition\n<img src=x>' }, { no: 230, info: 'enemy condition' }] },
      pendingMeta: { ...meta, revision: 2026101202, questInfos: [{ no: 999, info: 'pending only' }] }
    } })
    const list = wrapper.get('ul[aria-label="含まれる任務データ"]')
    expect(list.findAll('li')).toHaveLength(2)
    expect(list.text()).not.toContain('No.')
    expect(list.text()).not.toContain('345')
    expect(list.text()).toContain('<img src=x>')
    expect(list.find('img').exists()).toBe(false)
    expect(list.text()).not.toContain('pending only')
    await wrapper.setProps({ meta: { ...meta, questInfos: [] } })
    expect(wrapper.find('.quest-schema-contents').exists()).toBe(false)
    await wrapper.setProps({ meta })
    expect(wrapper.find('.quest-schema-contents').exists()).toBe(false)
    wrapper.unmount()
  })
  it('emits notification preference and applies pending updates', async () => {
    const wrapper = mount(QuestSchemaInfo, { props: { meta: null, pendingMeta: meta, checkStatus: 'available' } })
    await wrapper.get('input[type="checkbox"]').setValue(true)
    expect(wrapper.emitted('update:checkNotifyOnly')?.[0]).toEqual([true])
    expect(wrapper.get('[role="status"]').text()).toBe('更新があります')
    await wrapper.findAll('button').find(button => button.text() === '更新を適用')!.trigger('click')
    expect(wrapper.emitted('apply')).toHaveLength(1)
    await wrapper.setProps({ pendingMeta: null, checkStatus: 'latest' })
    expect(wrapper.findAll('button').some(button => button.text() === '更新を適用')).toBe(false)
    wrapper.unmount()
  })
  it('emits manual checks and disables the button while checking', async () => {
    const wrapper = mount(QuestSchemaInfo, { props: { meta } })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('check')).toHaveLength(1)
    await wrapper.setProps({ checkStatus: 'checking' })
    expect(wrapper.get('button').element.disabled).toBe(true)
    expect(wrapper.get('[role="status"]').text()).toBe('確認中…')
    await wrapper.setProps({ checkStatus: 'latest', lastCheckedAt: meta.updatedAt })
    expect(wrapper.get('[role="status"]').text()).toBe('最新です')
    expect(wrapper.findAll('time')).toHaveLength(2)
    expect(wrapper.get('button').element.disabled).toBe(false)
    wrapper.unmount()
  })

  it('defaults to six hours and provides the supported intervals', () => {
    const wrapper = mount(QuestSchemaInfo, { props: { meta: null } })
    const intervalSection = wrapper.get('section[aria-label="更新確認の間隔"]')
    expect(intervalSection.get('.section-title').text()).toBe('更新確認の間隔')
    expect(intervalSection.find('select').exists()).toBe(true)
    expect(wrapper.get('section[aria-label="任務データ"]').find('select').exists()).toBe(false)
    expect(wrapper.get('select').element.value).toBe('6')
    expect(wrapper.findAll('option').map(option => option.element.value)).toEqual(['0', '1', '3', '6', '12'])
    wrapper.unmount()
  })

  it.each([0, 1, 3, 6, 12])('emits interval %i as a number', async (interval) => {
    const wrapper = mount(QuestSchemaInfo, {
      props: { meta: null, checkIntervalHours: interval === 12 ? 6 : 12 }
    })
    await wrapper.get('select').setValue(String(interval))
    expect(wrapper.emitted('update:checkIntervalHours')?.[0]).toEqual([interval])
    wrapper.unmount()
  })

  it('shows built-in data without external metadata when none is applied', () => {
    const wrapper = mount(QuestSchemaInfo, { props: { meta: null } })
    expect(wrapper.text()).not.toContain('適用状態')
    expect(wrapper.findAll('dd').map(node => node.text())).toEqual(['未取得', '未取得', '未確認'])
    expect(wrapper.find('time').exists()).toBe(false)
    wrapper.unmount()
  })

  it('shows the applied revision, schema version and data timestamp', () => {
    const wrapper = mount(QuestSchemaInfo, { props: { meta } })
    expect(wrapper.findAll('dd').map(node => node.text())).toEqual([
      '2026101201', expect.any(String), '未確認'
    ])
    expect(wrapper.findAll('dt')[0].text()).toBe('リビジョン')
    expect(wrapper.findAll('dt')[0].attributes('title')).toBe('スキーマ形式: v1')
    expect(wrapper.text()).not.toContain('スキーマ形式')
    expect(wrapper.text()).not.toContain('適用状態')
    expect(wrapper.get('time').attributes('datetime')).toBe(meta.updatedAt)
    expect(wrapper.get('time').text()).toContain('2026/10/12')
    wrapper.unmount()
  })

  it('accepts revision zero and renders invalid timestamps without throwing', () => {
    const wrapper = mount(QuestSchemaInfo, {
      props: { meta: { ...meta, revision: 0, updatedAt: 'invalid-date' } }
    })
    expect(wrapper.findAll('dd')[0].text()).toBe('0')
    expect(wrapper.get('time').text()).toBe('invalid-date')
    wrapper.unmount()
  })

  it('shows error details only when provided', async () => {
    const wrapper = mount(QuestSchemaInfo, { props: { meta } })
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    await wrapper.setProps({ errorMessage: '任務データを取得できませんでした。' })
    expect(wrapper.get('[role="alert"]').text()).toBe('任務データを取得できませんでした。')
    wrapper.unmount()
  })
})
