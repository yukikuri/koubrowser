import type { Quest } from '@common/record'
import type { ApiMapInfoList, ApiMissionList, ApiQuestList, SvDataRaw } from '@common/kcs'
import type { Api } from '@common/kcsapi'
import { AppSetting } from '@common/store'
import { GlobalSetting } from '@common/global_setting'

/**
 * message type
 */
export const MessageType = {
  required: 'required',
  api_req: 'api_req',
  api_res: 'api_res',
  quests: 'quests',
  app_setting: 'app_setting',
  global_setting: 'global_setting',
} as const
export type MessageType = (typeof MessageType)[keyof typeof MessageType]

/**
 * requrired data message
 */
export interface RequiredMessage{
  readonly type: 'required'
  readonly svdata: SvDataRaw | null;
  readonly quests: Quest[];
  readonly globalSetting: GlobalSetting;
  readonly appSetting: AppSetting;
  readonly mapInfo: ApiMapInfoList;
  readonly missionList: ApiMissionList;
  readonly questList: ApiQuestList;
}

/**
 * api req message
 */
export interface ApiReqMessage{
  readonly type: 'api_req'
  readonly api: Api
  readonly data: string
}

/**
 * api res message
 */
export interface ApiResMessage{
  readonly type: 'api_res'
  readonly api: Api
  readonly data: string
  readonly uuid?: string // map start uuid
}

/**
 * quests message
 */
export interface QuestsMessage{
  readonly type: 'quests'
  readonly quests: Quest[];
}

/**
 * app setting save message
 */
export interface AppSettingMessage{
  readonly type: 'app_setting'
  readonly setting: AppSetting;
}

/**
 * app setting save message
 */
export interface GlobalSettingMessage{
  readonly type: 'global_setting'
  readonly setting: GlobalSetting;
}


/**
 * メッセージ別の型
 */
export type MessageByType = {
  required: RequiredMessage
  api_req: ApiReqMessage
  api_res: ApiResMessage
  quests: QuestsMessage
  app_setting: AppSettingMessage
  global_setting: GlobalSettingMessage
}

/**
 * メッセージ型
 */
export type Message<T extends MessageType> = MessageByType[T]
