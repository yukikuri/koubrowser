import path from 'path'
import fs from 'fs'
import { svdata } from '@main/svdata'

const app_dirname = 'koubrowser'
const store_dirname = 'store'
const capture_dirname = 'capture'

let _mainDir: string | undefined
let _userDataDir: string | undefined

export function setMainDir(appDir: string) {
  _mainDir = appDir
}

export function getMainDir(): string {
  if (! _mainDir) {
    throw new Error('MainDir not set')
  }
  return _mainDir
}

export function setUserDataDir(userData: string) {
  _userDataDir = path.join(userData, app_dirname)
  if (!fs.existsSync(_userDataDir)) {
    fs.mkdirSync(_userDataDir, { recursive: true })
  }
}

export function getUserDataDir(): string {
  if (! _userDataDir) {
    throw new Error('UserDataDir not set')
  }
  return _userDataDir
}

export const AppMapImgDrawState = {
  nodraw: 0,
  drawed: 1
} as const
export type AppMapImgDrawState = (typeof AppMapImgDrawState)[keyof typeof AppMapImgDrawState]

export interface AppMapImgDraw {
  no: number
  drawed: AppMapImgDrawState
}

export interface AppMapDrawed {
  cells: AppMapImgDraw[]
}

/**
 *
 */
class PathStuffImpl {
  /**
   *
   */
  createStoreDir(): void {
    const dirs = [
      this.storeApp,
      this.storeUser,
    ]
    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    })
  }

  /**
   *
   */
  get storeApp(): string {
    return path.join(getUserDataDir(), store_dirname)
  }

  /**
   *
   */
  get storeGlobal(): string {
    return getUserDataDir()
  }

  /**
   *
   */
  get defaultCpturePath(): string {
    return path.join(getUserDataDir(), capture_dirname)
  }

  /**
   *
   */
  capturePath(createIf: boolean): string {
    const ret = path.join(getUserDataDir(), capture_dirname)
    if (createIf && !fs.existsSync(ret)) {
      fs.mkdirSync(ret)
    }

    return ret
  }

  /**
   *
   */
  get storeUser(): string {
    return path.join(this.storeApp, svdata.serverId + '_' + svdata.basic.api_member_id)
  }
}

export const PathStuff = new PathStuffImpl()
