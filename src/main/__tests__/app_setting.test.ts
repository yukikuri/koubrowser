import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const mockState = vi.hoisted(() => ({
  userDataDir: '',
  displays: [
    {
      bounds: {
        x: 0,
        y: 0,
        width: 1920,
        height: 1080
      }
    }
  ]
}))

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => mockState.userDataDir)
  },
  screen: {
    getAllDisplays: vi.fn(() => mockState.displays)
  }
}))

const originalSetting = {
  window: {
    assist_in_game: true,
    main: {
      x: 17,
      y: 10,
      width: 1800,
      height: 1007
    },
    gameOnly: {
      x: 17,
      y: 10,
      width: 1541,
      height: 1007
    },
    game_only_width: 1541,
    game_only_height: 1007,
    topmost: true,
    muted: true,
    assistWindow: {
      visible: true,
      x: 100,
      y: 120
    },
    abc: 10,
    aaa: 0,
    anyobj: {
      key1: 100
    }
  },
  keykey: {
    val: 'text'
  }
}

describe('app_setting', () => {
  beforeEach(() => {
    mockState.userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'koubrowser-app-setting-'))
    mockState.displays = [
      {
        bounds: {
          x: 0,
          y: 0,
          width: 1920,
          height: 1080
        }
      }
    ]
    fs.writeFileSync(
      path.join(mockState.userDataDir, 'koubrowser.json'),
      JSON.stringify(originalSetting, undefined, ' '),
      'utf8'
    )
    vi.resetModules()
  })

  afterEach(() => {
    fs.rmSync(mockState.userDataDir, { recursive: true, force: true })
  })

  it('keeps unknown members when loading and saving app settings', async () => {
    const appSetting = await import('../app_setting')

    appSetting.loadAppJsonSetting()

    expect(appSetting.restoreAssistInGame()).toBe(true)
    expect(appSetting.restoreMainWindowBounds(true)).toEqual({
      x: 17,
      y: 10,
      width: 1800,
      height: 1007
    })
    expect(appSetting.restoreMainWindowBounds(false)).toEqual({
      x: 17,
      y: 10,
      width: 1541,
      height: 1007
    })
    expect(appSetting.restoreGameOnlySize()).toEqual({
      width: 1541,
      height: 1007
    })
    expect(appSetting.restoreTopmost()).toBe(true)
    expect(appSetting.restoreMuted()).toBe(true)
    expect(appSetting.restoreAssistWindowState(true)).toEqual({
      position: {
        x: 100,
        y: 120
      }
    })

    appSetting.saveAppState(
      {
        isDestroyed: () => false,
        getBounds: () => ({
          x: 20,
          y: 30,
          width: 1200,
          height: 900
        })
      } as Electron.BrowserWindow,
      false,
      {
        width: 1200,
        height: 900
      },
      false,
      false,
    )

    const saved = JSON.parse(
      fs.readFileSync(path.join(mockState.userDataDir, 'koubrowser.json'), 'utf8')
    )
    expect(saved.keykey).toEqual(originalSetting.keykey)
    expect(saved.window.abc).toBe(10)
    expect(saved.window.aaa).toBe(0)
    expect(saved.window.anyobj).toEqual({ key1: 100 })
    expect(saved.window.main).toEqual(originalSetting.window.main)
    expect(saved.window.assist_in_game).toBe(false)
    expect(saved.window.topmost).toBe(false)
    expect(saved.window.muted).toBe(false)
    expect(saved.window.assistWindow).toEqual({
      visible: true,
      x: 100,
      y: 120
    })
    expect(saved.window.game_only_width).toBe(1200)
    expect(saved.window.game_only_height).toBe(900)
    expect(saved.window.gameOnly).toEqual({
      x: 20,
      y: 30,
      width: 1200,
      height: 900
    })
  })

  it('saves visible assist window position', async () => {
    const appSetting = await import('../app_setting')

    appSetting.loadAppJsonSetting()

    appSetting.saveAppState(
      {
        isDestroyed: () => false,
        getBounds: () => ({
          x: 20,
          y: 30,
          width: 1200,
          height: 900
        })
      } as Electron.BrowserWindow,
      true,
      {
        width: 1541,
        height: 1007
      },
      true,
      true
    )

    const saved = JSON.parse(
      fs.readFileSync(path.join(mockState.userDataDir, 'koubrowser.json'), 'utf8')
    )
    expect(saved.window.assistWindow).toEqual({
      visible: true,
      x: 100,
      y: 120
    })
    expect(saved.window.assistWindow.width).toBeUndefined()
    expect(saved.window.assistWindow.height).toBeUndefined()
  })

  it('keeps assist window position without visible flag when it is hidden', async () => {
    const appSetting = await import('../app_setting')

    appSetting.loadAppJsonSetting()
    appSetting.updateAssistWindowState(
      {
        isDestroyed: () => false,
        isVisible: () => false,
        getNormalBounds: () => ({
          x: 300,
          y: 320,
          width: 1200,
          height: 900
        })
      } as Electron.BrowserWindow,
      false
    )
    appSetting.saveAppState(
      {
        isDestroyed: () => false,
        getBounds: () => ({
          x: 20,
          y: 30,
          width: 1200,
          height: 900
        })
      } as Electron.BrowserWindow,
      true,
      {
        width: 1541,
        height: 1007
      },
      true,
      true
    )

    const saved = JSON.parse(
      fs.readFileSync(path.join(mockState.userDataDir, 'koubrowser.json'), 'utf8')
    )
    expect(saved.window.assistWindow).toEqual({
      x: 300,
      y: 320
    })
    expect(appSetting.restoreAssistWindowState(false)).toEqual({
      position: {
        x: 300,
        y: 320
      }
    })
  })

  it('does not restore assist window position outside displays', async () => {
    mockState.displays = [
      {
        bounds: {
          x: 0,
          y: 0,
          width: 100,
          height: 100
        }
      }
    ]

    const appSetting = await import('../app_setting')

    appSetting.loadAppJsonSetting()

    expect(appSetting.restoreAssistWindowState(true)).toEqual({})
  })
})
