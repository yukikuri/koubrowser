import { app, BrowserWindow, Rectangle, screen } from 'electron'
import * as fs from 'fs'
import path from 'node:path'

interface StoredMainWindowBounds {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

interface AppJsonSetting {
  window?: {
    main?: StoredMainWindowBounds
  }
}

const appJsonPath = (): string => path.join(app.getPath('userData'), 'koubrowser.json')

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

function writeAppJsonSetting(setting: AppJsonSetting): void {
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

export function restoreMainWindowPosition(): { x: number; y: number } | undefined {
  const savedBounds = readAppJsonSetting().window?.main
  if (!isStoredMainWindowBounds(savedBounds)) {
    return undefined
  }

  if (!isPositionInAnyDisplay(savedBounds)) {
    //console.warn('Saved main window position is out of display bounds. Using default position.')
    return undefined
  }

  return { x: savedBounds.x, y: savedBounds.y }
}

export function saveMainWindowPosition(window: BrowserWindow): void {
  if (window.isDestroyed()) {
    return
  }

  const bounds = window.getBounds()
  const setting = readAppJsonSetting()
  const windowSetting = isPlainObject(setting.window) ? setting.window : {}
  setting.window = {
    ...windowSetting,
    main: {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height
    }
  }

  writeAppJsonSetting(setting)
}
