import { Env } from "@common/env";
import { KcApp } from "@main/kcbrowser";
import * as  kcsapi from '@common/kcsapi'
import { svdata } from "@main/svdata";
import path from "node:path";
import * as fs from 'node:fs'
import { getMainDir } from "@main/path";

type DebugDataCall = {
  type: 'api'
  api: kcsapi.Api
  absFilePath: string
  isReq: boolean
}

type SleepData = {
  type: 'sleep'
  durationMs: number
}

type DebugCallInfo = DebugDataCall | SleepData

const apiByDebugFilename = new Map<string, kcsapi.Api>(
  Object.values(kcsapi.Api).map((api) => {
    const apiName = api.replace(/^\/?(?:kcsapi\/)?/, '')
    const apiSeparatorIndex = apiName.indexOf('/')
    const filenameApiName =
      apiSeparatorIndex < 0
        ? apiName
        : `${apiName.slice(0, apiSeparatorIndex)}-${apiName.slice(apiSeparatorIndex + 1)}`
    return [filenameApiName, api] as const
  })
)

const getApiByFilename = (filename: string): kcsapi.Api => {
  const parsedFilename = path.parse(filename)
  const filenameApiName = parsedFilename.name.replace(/^\d+-/, '').replace(/_req$/, '')
  const api = apiByDebugFilename.get(filenameApiName)
  if (api === undefined) {
    throw new Error(`Unknown debug data api: ${filename}`)
  }
  return api
}

function parseSleepMs(filename: string): number {
  const m = filename.match(/^\d+-api_sleep-(\d+)(ms|s)\.(json|txt)$/i)
  if (!m) {
    throw new Error(`Invalid sleep filename: ${filename}`)
  }

  const value = Number(m[1])
  const unit = m[2].toLowerCase()
  return unit === 's' ? value * 1000 : value
}

const toDebugDataCall = (absFilePath: string): DebugDataCall | SleepData => {
  const filename = path.basename(absFilePath)
  if (filename.match(/^\d+-api_sleep-(\d+).*\.(json|txt)$/i)) {
    const durationMs = parseSleepMs(filename);
    return { type: 'sleep', durationMs }
  }

  const api = getApiByFilename(filename)
  const ext = path.extname(absFilePath).toLowerCase()
  return { type: 'api', api, absFilePath, isReq: ext === '.txt' }
}

export function listFilesSortedByName(
  targetDir: string
): string[] {
  const locale = 'ja'

  function walk(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    const results: string[] = []

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        continue
      }

      if (
        entry.isFile() && 
        entry.name.includes('api_') &&
        entry.name.match(/^\d+-.*\.(json|txt)$/i)) {
        results.push(fullPath)
      }
    }

    return results
  }

  const absDir = path.join(getMainDir(), '../..', targetDir)
  const files = walk(absDir)

  files.sort((a, b) =>
    path.basename(a).localeCompare(path.basename(b), locale, {
      numeric: true,
      sensitivity: "base",
    })
  )

  return files
}

function listDebugDataCalls(targetDir: string): DebugCallInfo[] {
  const files = listFilesSortedByName(targetDir)
  return files.map((file) => toDebugDataCall(file))
}

const setReqData = (app: KcApp, call: DebugDataCall): void => {
  const content = fs.readFileSync(call.absFilePath, 'utf8')
  svdata.setReq(call.api, content)
  app.postReqToRenderer(call.api, content)
}

const setResData = (app: KcApp, call: DebugDataCall): void => {
  const content = fs.readFileSync(call.absFilePath, 'utf8')
  svdata.update(call.api, content)
  app.postResToRenderer(call.api, content)
}

function callApi(app: KcApp, call: DebugDataCall): void {
  if (call.isReq) {
    setReqData(app, call)
  } else {
    setResData(app, call)
  }
}

function callsApi(app: KcApp, calls: DebugCallInfo[]): void {
  for (let i = 0; i < calls.length; i++) {
    const call = calls[i]
    if (call.type === 'sleep') {
      setTimeout(() => {
        callsApi(app, calls.slice(i + 1))
      }, call.durationMs)
      break
    }
    callApi(app, call)
  }
}

/**
 * テストデータをセットする
 * 
 * @param app 
 * @returns 
 */
export function setTestData(app: KcApp): void {
  // テストモード以外は何もしない
  // テストモードの設定方法：環境変数test_modeに"1"をセットする
  //  - Windowsの設定方法例: PowerShellで $env:test_mode="1" を実行
  if (! Env.isTestMode) {
    return ;
  }

  // sample
  // 開発用にテストデータを使用したい場合の例
  // debug-data.tsは任意のテストデータに関わることからgit管理から外しデフォルトは空実装である
  
  // サーバの設定例
  //const serverId: kcsapi.ApiServerId = kcsapi.ApiServerId.world17;
  //svdata.setServerId(serverId);

  // test-data-1フォルダ配下に
  //   1-api_start2-getData.json
  //   2-api_get_member-require_info.json
  //   2-api_sleep-3s.json
  //   3-api_port-port.json
  // ファイルがある場合、順番にAPI呼び出しとport呼び出し前に3秒の待機が行われる例
  // api要求内容(txt)やapi応答(json)は開発モードで動作させるとsavedフォルダ配下に保存される
  // 開発モード：NODE_ENVが'development'

  // // test-data-1
  // function testData1() {
  //   const dir = 'test-data-1'
  //   const calls = listDebugDataCalls(dir)
  //   console.log('debug data calls: ', calls)
  //   callsApi(app, calls)
  // }
  // testData1()
}
