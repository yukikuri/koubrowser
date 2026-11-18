import { describe, it, expect, beforeAll, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { setLanguage } from '@renderer/i18n'
import About from '../About.vue'

// 
beforeAll(() => {

  const apiMock = {
    getVersion: vi.fn().mockResolvedValue('1.2.3'),
    saveGlobalSetting: vi.fn(),
      clearSessionCache: vi.fn().mockResolvedValue(undefined),
      getUpdateState: vi.fn().mockResolvedValue({
        status: 'idle',
        availableVersion: '',
        errorMessage: '',
        downloadPercent: null,
      }),
      checkForUpdates: vi.fn().mockResolvedValue({ status: 'not-available' }),
      downloadUpdate: vi.fn().mockResolvedValue(undefined),
      restartAndInstallUpdate: vi.fn().mockResolvedValue(undefined),
      onUpdateStateChanged: vi.fn().mockReturnValue(() => undefined),
      onUpdateDownloadProgress: vi.fn().mockReturnValue(() => undefined),
      onStartupUpdateChecked: vi.fn().mockReturnValue(() => undefined),
      openExternalUrl: vi.fn(),
      devtool: vi.fn(),
      saveAppSetting: vi.fn(),
  } satisfies Partial<Window['api']>

  Object.defineProperty(window, 'api', {
    configurable: true,
    writable: true,
    value: apiMock
  })
})

describe('About.vue', () => {
  it('updates keyed messages and license labels when the language changes', async () => {
    setLanguage('ja')
    const wrapper = mount(About)
    try {
      expect(wrapper.get('.subtitle').text()).toBe('艦隊運用支援')
      setLanguage('ko')
      await nextTick()
      expect(wrapper.get('.subtitle').text()).toBe('함대 운용 지원')
      expect(wrapper.get('.app-img').attributes('alt')).toBe('갑브라우저 로고')
      expect(wrapper.text()).toContain('드랍 정보 제공')
      const licenseButton = wrapper.findAll('button').find(button => button.text().includes('라이선스...'))
      expect(licenseButton).toBeDefined()
      await licenseButton!.trigger('click')
      expect(wrapper.get('#license-title').text()).toBe('사용 구성 요소 및 라이선스')
      expect(wrapper.findAll('th').map(cell => cell.text())).toEqual(['라이브러리', '버전', '라이선스'])
      const cacheButton = wrapper.findAll('button').find(button => button.text().includes('브라우저 캐시 지우기'))
      expect(cacheButton).toBeDefined()
      await cacheButton!.trigger('click')
      await flushPromises()
      expect(wrapper.get('.about-note').text()).toBe('캐시를 삭제했습니다')
      expect(wrapper.text()).not.toContain('about.')
    } finally {
      wrapper.unmount()
      setLanguage('ja')
    }
  })

  it('renders component', () => {
    const wrapper = mount(About)
    expect(wrapper.exists()).toBe(true)
  })

  it('contains expected title', () => {
    const wrapper = mount(About)
    expect(wrapper.text()).contain('甲ブラウザ')
  })

  it('contains drop data setting', () => {
    const wrapper = mount(About)
    expect(wrapper.text()).contain('ドロップ情報を提供する')
  })

  it('contains koubrowser devtool button', () => {
    const wrapper = mount(About)
    expect(wrapper.text()).contain('甲ブラウザ側開発者ツール表示')
  })

  // スナップショットの確認
  // 以前テスト実行時の見た目スクリーンショットとの比較
  // 更新する必要がある場合、
  // vitest -u
  // で実行
  //
  // 例えば、文言を変えた場合など差分があれば検出される
  // その場合は、-uで更新する
  // 
  // スナップショットは変更多により現時点で行わない
  // it('matches snapshot', () => {
  //   const wrapper = mount(About)
  //   expect(wrapper.html()).toMatchSnapshot()
  // })

  // it('has expected class', () => {
  //   const wrapper = mount(About)
  //   expect(wrapper.classes()).toContain('甲ブラウザ')
  // })
})
