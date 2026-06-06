import { Const } from '@common/const'
const isAssist = !!process.argv.find((a) => a.startsWith(Const.ArgIsAssist))
const isTestMode = !!process.argv.find((a) => a.startsWith(Const.ArgIsTestMode))

export class EnvRenderer {
  static get isAssist(): boolean {
    return isAssist
  }
  static get isTestMode(): boolean {
    return isTestMode
  }
}
