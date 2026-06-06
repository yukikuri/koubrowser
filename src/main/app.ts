import { Const } from '@common/const'
import path from 'path'
import { getMainDir } from '@main/path'

export class AppStuff {

  static calcGameZoomFactor(width: number) {
    return width / Const.GameWidth
  }

  static calcFrameRatio(width: number, height: number): number {
    return width / (height - Const.TitleBarHeight)
  }

  static calcFrameHeight(ratio: number, width: number): number {
    return Math.floor(width / ratio) + Const.TitleBarHeight
  }

  static resolveResourcePath(pathParts: string): string {
    return path.join(getMainDir(), '../../resources', pathParts)
  }
}
