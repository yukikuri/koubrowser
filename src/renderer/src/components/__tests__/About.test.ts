import { describe, it, expect, beforeAll, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import About from '../About.vue'

// 
beforeAll(() => {
    ((global.window) as any).api = {
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
    }
  })

describe('About.vue', () => {
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
