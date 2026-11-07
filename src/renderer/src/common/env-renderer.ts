import { Const } from '@common/const'
const isAssist = !!process.argv.find((a) => a.startsWith(Const.ArgIsAssist))
const isInitMuted = !!process.argv.find((a) => a.startsWith(Const.ArgIsInitMuted))
const isTestMode = !!process.argv.find((a) => a.startsWith(Const.ArgIsTestMode))
const getArgValue = (argName: string): string | undefined => {
  const name = `${argName}=`
  return process.argv.find((a) => a.startsWith(name))?.slice(name.length)
}
const appLaunchId = getArgValue(Const.ArgAppLaunchId)
const language = getArgValue(Const.ArgLanguage)

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
  static get appLaunchId(): string | undefined {
    return appLaunchId
  }
  static get language(): string | undefined {
    return language
  }
}
