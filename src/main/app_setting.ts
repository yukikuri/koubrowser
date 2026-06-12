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

function getAllDisplayBounds(): Rectangle | undefined {
  const displays = screen.getAllDisplays()
  if (displays.length === 0) {
    return undefined
  }

  const minX = Math.min(...displays.map((display) => display.bounds.x))
  const minY = Math.min(...displays.map((display) => display.bounds.y))
  const maxX = Math.max(...displays.map((display) => display.bounds.x + display.bounds.width))
  const maxY = Math.max(...displays.map((display) => display.bounds.y + display.bounds.height))
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  }
}

export function restoreMainWindowPosition(): { x: number; y: number } | undefined {
  const savedBounds = readAppJsonSetting().window?.main
  if (!isStoredMainWindowBounds(savedBounds)) {
    return undefined
  }

  const displayBounds = getAllDisplayBounds()
  //console.log('Saved main window bounds:', savedBounds, 'all Display bounds:', displayBounds)
  if (!displayBounds || !isPositionInBounds(savedBounds, displayBounds)) {
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
