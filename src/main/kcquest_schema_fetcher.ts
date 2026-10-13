import { net } from 'electron'

export type FetchQuestSchemaResult =
  | { success: true; jsonText: string }
  | { success: false; error: Error }

/**
 * quest schemaを外部から取得
 * 
 * 注：
 *  1) 本メソッドはapp.whenReady()後に使用すること。Electron net APIはElectron初期化完了後に使用できるため
 *  2) 本メソッドはsession proxy設定完了後に使用すること。
 * 
 * @param url 
 * @param reload ブラウザ保存キャッシュ無視での取得の場合true、通常時はfalse指定でよい
 * @returns 
 * 
 */
export async function fetchQuestSchemaFile(url: string, reload: boolean): Promise<FetchQuestSchemaResult> {
  const controller = new AbortController()

  // todo : timeout option setting
  const timer = setTimeout(() => controller.abort(), 15_000)

  try {
    const response = await net.fetch(url, {
      signal: controller.signal,
      credentials: 'omit',
      cache: reload ? 'reload' : 'no-cache'
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch quest schema: HTTP ${response.status}`)
    }

    return { success: true, jsonText: await response.text() }
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error))
    }
  } finally {
    clearTimeout(timer)
  }
}
