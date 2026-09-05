import path from 'path'
import fs from 'fs'
import { svdata } from '@main/svdata'

const app_dirname = 'koubrowser'
const store_dirname = 'store'
const capture_dirname = 'capture'

let _mainDir: string | undefined
let _userDataDir: string | undefined

export function setMainDir(appDir: string): void {
  _mainDir = appDir
}

export function getMainDir(): string {
  if (! _mainDir) {
    throw new Error('MainDir not set')
  }
  return _mainDir
}

export function setUserDataDir(userData: string): void {
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

/**
 *
 */
class PathStuffImpl {

  /**
   * ユーザ指定キャプチャパス
   * 設定なしの時null
   */
  private capturePath_: string | null = null

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
  get defaultCapturePath(): string {
    return path.join(getUserDataDir(), capture_dirname)
  }

  /**
   * 
   */
  private getCapturePath(): string {
    if (this.capturePath_) {
      return this.capturePath_
    } else {
      return this.defaultCapturePath
    }
  }

  /**
   *
   */
  capturePath(createIf: boolean): string {
    const ret = this.getCapturePath()
    if (createIf && !fs.existsSync(ret)) {
      fs.mkdirSync(ret, { recursive: true })
    }

    return ret
  }

  public setCapturePath(path: string | null): void {
    this.capturePath_ = path
  }

  /**
   *
   */
  get storeUser(): string {
    return path.join(this.storeApp, svdata.serverId + '_' + svdata.basic.api_member_id)
  }
}

export const PathStuff = new PathStuffImpl()
