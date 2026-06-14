import { Const } from '@common/const'
const isAssist = !!process.argv.find((a) => a.startsWith(Const.ArgIsAssist))
const isInitMuted = !!process.argv.find((a) => a.startsWith(Const.ArgIsInitMuted))
const isTestMode = !!process.argv.find((a) => a.startsWith(Const.ArgIsTestMode))

export class EnvRenderer {
  static get isAssist(): boolean {
    return isAssist
  }
  static get isInitMuted(): boolean {
    return isInitMuted
  }
  static get isTestMode(): boolean {
    return isTestMode
  }
}
