import { SvData } from '@common/kcs'
import type { LoadStart, LoadEnd, UnknownLoadStart, UnknownLoadEnd } from '@common/kcsapi_hook'
import { Env } from '@common/env'
import moment from 'moment'
import fs from 'node:fs'

// 全体的なコンソールログにタイムスタンプを付けたい場合にコメントアウトを外す
// const _log = console.log.bind(console);
// console.log = (...args) => {
//   const ts = new Date().toISOString();        // ISO 形式タイムスタンプ
//   _log(`[${ts}]`, ...args);
// };
 
/**
 * unique count for saved files
 */
let saved_count = 0

/**
 * 
 * @returns 
 */
const getDtString = (): string => {
  // YYYYMMDD-HHmmss
  const date = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}` +
    `${pad(date.getMonth() + 1)}` +
    `${pad(date.getDate())}-` +
    `${pad(date.getHours())}` +
    `${pad(date.getMinutes())}` +
    `${pad(date.getSeconds())}`
  )
}

/**
 * 通信内容保存先ディレクトリ
 * 
 * @returns
 */
const saved_dir = 'saved/' + getDtString()

/**
 * 
 * @param data 
 * @returns 
 */
export function logRequest(data: LoadStart): void {
    if (! Env.isDevelopment) {
      return 
    }

    fs.mkdirSync(saved_dir, { recursive: true })

    const fname = saved_dir + '/' + saved_count + data.api.replace(/\//g, '-') + '_req.txt'
    saved_count++
    fs.writeFile(fname, data.body ?? '<body is empty>', 'utf8', (err: Error | null) => {
      if (err) console.log('req write file error', err)
    })
}

/**
 * 
 * @param data 
 * @returns 
 */
export function logUnknownRequest(data: UnknownLoadStart): void {
  if (! Env.isDevelopment) {
    return 
  }

  fs.mkdirSync(saved_dir, { recursive: true })

  const fname = saved_dir + '/' + saved_count + '_unk_req.txt'
  saved_count++
  const body = data.url + '\n' + (data.body ?? '<body is empty>')
  fs.writeFile(fname, body, 'utf8', (err: Error | null) => {
    if (err) console.log('unk req write file error', err)
  })
  console.log('unknown request')
  console.log(data)
}

/**
 * 
 * @param data 
 * @returns 
 */
export function logResponse(data: LoadEnd): void {
  if (! Env.isDevelopment) {
    return 
  }

  fs.mkdirSync(saved_dir, { recursive: true })

  let fname = saved_dir + '/' + saved_count + data.api.replace(/\//g, '-') + '.json'
  saved_count++

  //
  let body;
  try {
    if (data.response?.startsWith(SvData.header)) {
      body = data.response.substring(SvData.header.length)
    }
    const parsed = JSON.parse(body)
    body = JSON.stringify(parsed, undefined, ' ')
  } catch (e) {
    console.log(e)
    fname = fname + 'ng'
    body = data.response ?? '<response is empty>'
  }
  fs.writeFile(fname, body, 'utf8', (err: Error | null) => {
    if (err) console.log('res write file error', err)
  })
}

/**
 * 
 * @param data 
 * @returns 
 */
export function logUnknownResponse(data: UnknownLoadEnd): void {
  if (! Env.isDevelopment) {
    return 
  } 

  fs.mkdirSync(saved_dir, { recursive: true })

  let fname = saved_dir + '/' + saved_count + '_unk_res.txt'
  saved_count++

  //
  let body
  try {
    if (data.response?.startsWith(SvData.header)) {
      body = data.response.substring(SvData.header.length)
    }
    const parsed = JSON.parse(body)
    body = JSON.stringify(parsed, undefined, ' ')
  } catch (e) {
    console.log(e)
    fname = fname + 'ng.txt'
    body = data.response ?? '<response is empty>'
  }
  fs.writeFile(fname, data.url + '\n' + body, 'utf8', (err: Error | null) => {
    if (err) console.log('unk res write file error', err)
  })
}
