import { app, BrowserWindow, Rectangle, screen } from 'electron'
import * as fs from 'fs'
import path from 'node:path'

interface StoredMainWindowBounds {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

interface StoredAssistWindowState {
  readonly visible?: true
  readonly x: number
  readonly y: number
}

export interface RestoredAssistWindowState {
  readonly position?: {
    readonly x: number
    readonly y: number
  }
}

interface AppJsonSetting {
  window?: {
    assist_in_game?: boolean
    topmost?: boolean
    muted?: boolean
    game_only_width?: number
    game_only_height?: number
    main?: StoredMainWindowBounds
    gameOnly?: StoredMainWindowBounds
    assistWindow?: StoredAssistWindowState
  }
}

const appJsonPath = (): string => path.join(app.getPath('userData'), 'koubrowser.json')
let appJsonSetting: AppJsonSetting | null = null

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function readAppJsonSetting(): AppJsonSetting {
  const filepath = appJsonPath()
  if (!fs.existsSync(filepath)) {
    return {}
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(filepath, 'utf8'))
    return isPlainObject(parsed) ? parsed : {}
  } catch (err: unknown) {
    console.error(err)
    return {}
  }
}

export function loadAppJsonSetting(): void {
  if (appJsonSetting !== null) {
    return
  }

  appJsonSetting = readAppJsonSetting()
}

function getAppJsonSetting(): AppJsonSetting {
  loadAppJsonSetting()
  return appJsonSetting ?? {}
}

function writeAppJsonSetting(setting: AppJsonSetting): void {
  appJsonSetting = setting
  try {
    fs.writeFileSync(appJsonPath(), JSON.stringify(setting, undefined, ' '), 'utf8')
  } catch (err: unknown) {
    console.error(err)
  }
}

function isStoredMainWindowBounds(value: unknown): value is StoredMainWindowBounds {
  if (!isPlainObject(value)) {
    return false
  }

  return (
    isFiniteNumber(value.x) &&
    isFiniteNumber(value.y) &&
    isFiniteNumber(value.width) &&
    isFiniteNumber(value.height) &&
    value.width > 0 &&
    value.height > 0
  )
}

function isPositionInBounds(position: { x: number; y: number }, bounds: Rectangle): boolean {
  return (
    position.x >= bounds.x &&
    position.y >= bounds.y &&
    position.x < bounds.x + bounds.width &&
    position.y < bounds.y + bounds.height
  )
}

function isPositionInAnyDisplay(position: { x: number; y: number }): boolean {
  return screen.getAllDisplays().some((display) => isPositionInBounds(position, display.bounds))
}

function restoreWindowBounds(savedBounds: unknown): StoredMainWindowBounds | undefined {
  if (!isStoredMainWindowBounds(savedBounds)) {
    return undefined
  }

  if (!isPositionInAnyDisplay(savedBounds)) {
    //console.warn('Saved main window position is out of display bounds. Using default position.')
    return undefined
  }

  return savedBounds
}

function getAssistWindowState(
  window: BrowserWindow,
  isClosed: boolean
): StoredAssistWindowState | undefined {
  if (!window.isDestroyed()) {
    const normalBounds = window.getNormalBounds()
    return {
      visible: isClosed ? undefined : (window.isVisible() ? true : undefined),
      x: normalBounds.x,
      y: normalBounds.y
    }
  }
  return undefined
}

export function restoreAssistInGame(): boolean | undefined {
  const assistInGame = getAppJsonSetting().window?.assist_in_game
  return typeof assistInGame === 'boolean' ? assistInGame : undefined
}

export function restoreTopmost(): boolean | undefined {
  const topmost = getAppJsonSetting().window?.topmost
  return typeof topmost === 'boolean' ? topmost : undefined
}

export function restoreMuted(): boolean | undefined {
  const muted = getAppJsonSetting().window?.muted
  return typeof muted === 'boolean' ? muted : undefined
}

export function restoreMainWindowBounds(assistInGame: boolean): StoredMainWindowBounds | undefined {
  const windowSetting = getAppJsonSetting().window
  const savedBounds = assistInGame ? windowSetting?.main : windowSetting?.gameOnly
  return restoreWindowBounds(savedBounds)
}

export function restoreGameOnlySize(): { width: number; height: number } | undefined {
  const windowSetting = getAppJsonSetting().window
  const width = windowSetting?.game_only_width
  const height = windowSetting?.game_only_height
  if (!isFiniteNumber(width) || !isFiniteNumber(height) || width <= 0 || height <= 0) {
    return undefined
  }

  return { width, height }
}

export function restoreAssistWindowState(visibleOnly: boolean): RestoredAssistWindowState | undefined {
  const assistWindow = getAppJsonSetting().window?.assistWindow
  if (!isPlainObject(assistWindow)) {
    return undefined
  }

  if (visibleOnly && assistWindow.visible !== true) {
    return undefined
  }

  if (!isFiniteNumber(assistWindow.x) || !isFiniteNumber(assistWindow.y)) {
    return {}
  }

  const position = { x: assistWindow.x, y: assistWindow.y }
  return isPositionInAnyDisplay(position) ? { position } : {}
}

export function updateAssistWindowState(
  assistWindow: BrowserWindow,
  isClosed: boolean
): void {
  const assistWindowState = getAssistWindowState(assistWindow, isClosed)
  if (!assistWindowState) {
    return
  }
  const setting = getAppJsonSetting()
  const windowSetting = isPlainObject(setting.window) ? setting.window : {}
  setting.window = {
    ...windowSetting,
    assistWindow: assistWindowState
  }
}

export function saveAppState(
  window: BrowserWindow,
  assistInGame: boolean,
  gameOnlySize: { width: number; height: number },
  topmost: boolean,
  muted: boolean
): void {
  if (window.isDestroyed()) {
    return
  }

  const bounds = window.getBounds()
  const setting = getAppJsonSetting()
  const windowSetting = isPlainObject(setting.window) ? setting.window : {}
  setting.window = {
    ...windowSetting,
    assist_in_game: assistInGame,
    topmost,
    muted,
    game_only_width: gameOnlySize.width,
    game_only_height: gameOnlySize.height,
    [assistInGame ? 'main' : 'gameOnly']: {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height
    }
  }

  writeAppJsonSetting(setting)
}
