import type { Api, ApiServerId } from "./kcsapi"

/**
 * フックされた通信タイプ
 */
export const HookedType = {
  serverid: 'serverid',
  loadstart: 'loadstart',
  loadend: 'loadend',

  // for debug
  unk_loadstart: 'unk_loadstart',
  unk_loadend: 'unk_loadend',

} as const
export type HookedType = (typeof HookedType)[keyof typeof HookedType]

/**
 * server id データ
 */
export interface ServerId {
  api_server_id: ApiServerId;
}

/**
 * loadstart イベントデータ
 */
export interface LoadStart {
  api: Api
  method: string
  body?: string
}

/**
 * loadend イベントデータ
 */
export interface LoadEnd {
  api: Api
  method: string
  response?: string
}

/**
 * unknown loadend event data
 */
export interface UnknownLoadStart {
  url: string
  method: string
  body?: string
}

/**
 * unknown loadend event data
 */
export interface UnknownLoadEnd {
  url: string
  method: string
  response?: string
}

/**
 * build server id data
 * @param serverId 
 * @returns 
 */
export function toServerId(api_server_id: ApiServerId): ServerId {
  return { api_server_id }
}

/**
 * build loadstart data
 * @param api 
 * @param method 
 * @param body 
 * @returns 
 */
export function toLoadStart(api: Api, method: string, body?: string): LoadStart {
  return { api, method, body }
}

/**
 * build loadend data
 * @param api
 * @param method 
 * @param response 
 * @returns 
 */
export function toLoadEnd(api: Api, method: string, response?: string): LoadEnd {
  return { api, method, response }
}

/**
 * build unknown loadstart data
 * @param url 
 * @param method 
 * @param body 
 * @returns 
 */
export function toUnknownLoadStart(url: string, method: string, body?: string): UnknownLoadStart {
  return { url, method, body }
}

/**
 * build unknown loadend data
 * @param url 
 * @param method 
 * @param response 
 * @returns 
 */
export function toUnknownLoadEnd(url: string, method: string, response?: string): UnknownLoadEnd {
  return { url, method, response }
}
