import type { ApiQuest } from '@common/kcs'
import type { BattleRecord } from '@common/record'

export const MainChannel = {
  renderer_ready: 'renderer_ready',
  show_assist: 'show_assist',
  hide_assist: 'hide_assist',
  minimize: 'minimize',
  close: 'close',
  devtool: 'devtool',
  reload: 'reload',
  open_capture_folder: 'open_capture_folder',
  save_capture: 'save_capture',
  openOption: 'openOption',
  openAssist: 'openAssist',
  topmost: 'topmost',
  notify_mute_state: 'notify_mute_state',
  refresh_assist: 'refresh_assist',
  store_rec: 'store-rec',
  request_required_data: 'request_required_data',
  ship_csv: 'ship_csv',
  timeline: 'timeline',
  get_airbase_spots: 'get_airbase_spots',
  set_airbase_spots: 'set_airbase_spots',
  open_external_url: 'open_external_url',
  get_version: 'get_version',
  query_db: 'query_db',
  clear_session_cache: 'clear_session_cache',
  find_spot_for_label: 'find_spot_for_label',
  cell_info_async: 'cell_info_async',
  calc_port_chart_data: 'calc_port_chart_data',
  save_app_setting: 'save_app_setting',
  save_global_setting: 'save_global_setting',
  aggregate_cell_rank: 'aggregate_cell_rank',
  aggregate_ship_drop: 'aggregate_ship_drop',
  get_inherit_score_list: 'get_inherit_score_list',
  save_inherit_score_list: 'save_inherit_score_list',
  get_update_state: 'get_update_state',
  check_for_updates: 'check_for_updates',
  download_update: 'download_update',
  restart_and_install_update: 'restart_and_install_update',
} as const
export type MainChannel = (typeof MainChannel)[keyof typeof MainChannel]

/**
 * from main to renderer
 */
export const MainMessage = {
  stream_port: 'stream_port',
  update_state_changed: 'update_state_changed',
  update_download_progress: 'update_download_progress',
  startup_update_checked: 'startup_update_checked',
} as const
export type MainMessage = (typeof MainMessage)[keyof typeof MainMessage]

/**
 * from renderer to main
 */
export const AssistMessage = {
  get_sv_data: 'get_sv_data',
} as const
export type AssistMessage = (typeof AssistMessage)[keyof typeof AssistMessage]

export const GameChannel = {
  set_app_state: 'set_app_state',
  set_game_setting: 'set_game_setting',
  set_zoom_factor: 'set-zoom-factor',
  resume: 'resume'
} as const
export type GameChannel = (typeof GameChannel)[keyof typeof GameChannel]

export type AirbaseTargetSpots = [[string, string], [string, string], [string, string]]

export interface AirbaseSpot {
  area_id: number
  area_no: number
  spots: AirbaseTargetSpots
}

export interface QuestContext {
  readonly quest_max: number
  readonly quests: ApiQuest[] | null
}

export const InvalidQuestContext = (): QuestContext => ({
  quest_max: 0,
  quests: null
})

export type TimelineResult = [QuestContext, BattleRecord[]]

/**
 * from option to main
 */
export const OptionChannel = {
  getCurrentSetting: 'option:get-current-setting',
  readyToShow: 'option:ready-to-show',
  selectCaptureSavePath: 'option:select-capture-save-path', 
  minimize: 'option:minimize',
  close: 'option:close',
}
