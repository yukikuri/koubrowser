import type { Language } from '@common/i18n'
import type { Quest } from '@common/record'
import type { ApiMapInfoList, ApiMissionList, ApiQuestList, SvDataRaw } from '@common/kcs'
import type { Api } from '@common/kcsapi'
import { AppSetting } from '@common/store'
import { GlobalSetting } from '@common/global_setting'
import type { AfterBattleFleetHps } from '@common/kcsbattle'

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
  quest_schema: 'quest_schema',
  quest_schema_update: 'quest_schema_update',
} as const
export type MessageType = (typeof MessageType)[keyof typeof MessageType]

/**
 * requrired data message
 */
export interface RequiredMessage{
  readonly type: 'required'
  readonly language: Language
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
  readonly additional?: ApiResMessageAdditional
}

export interface ApiResMessageAdditional {
  readonly mapStartUuid?: string // map start uuid
  readonly afterBattleFleetHps?: AfterBattleFleetHpsInfo  // after battle fleet hps 
}

export interface AfterBattleFleetHpsInfo extends AfterBattleFleetHps {
  readonly deckId: number
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
 * quest schema message
 */
export interface QuestSchemaMessage{
  readonly type: 'quest_schema'
  readonly quest_schema_json: string;
}

/**
 * メッセージ別の型
 */
export type MessageByType = {
  quest_schema_update: { readonly type: 'quest_schema_update'; readonly available: boolean }
  required: RequiredMessage
  api_req: ApiReqMessage
  api_res: ApiResMessage
  quests: QuestsMessage
  app_setting: AppSettingMessage
  global_setting: GlobalSettingMessage
  quest_schema: QuestSchemaMessage
}

/**
 * メッセージ型
 */
export type Message<T extends MessageType> = MessageByType[T]
