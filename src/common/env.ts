const isDev = process.env.NODE_ENV === 'development'
const isTestMode = process.env.test_mode !== undefined

export class Env {
  static get isProduction(): boolean {
    return !isDev
  }

  static get isDevelopment(): boolean {
    return isDev
  }

  static get isTestMode(): boolean {
    return isTestMode
  }
}
