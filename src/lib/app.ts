import { Const } from '@/lib/const'
import { Unpacked } from '@/lib/ts'
import { ApiQuest } from '@/lib/kcs';
import { BattleRecord, Quest } from '@/lib/record';
import path, { join } from 'path';

export class AppStuff {

  public static get isProduction(): boolean {
    //return true;
    return process.env.NODE_ENV === 'development';
  }

  public static calcGameZoomFactor(width: number) {
    return width / Const.GameWidth;
  }

  public static calcFrameRatio(width: number, height: number): number {
    return width / (height - Const.TitleBarHeight);
  }

  public static calcFrameHeight(ratio: number, width: number): number {
    return Math.floor(width / ratio) + Const.TitleBarHeight;
  }

  public static resolveResourcePath(path_parts: string): string {
    if (this.isProduction) {
      return path.resolve(path.join('public', path_parts));
    }
    return path.join(__dirname, path_parts);
  }
 
}

export const MainChannel = {
  main_ready: 'main_ready',
  assist_ready: 'assist_ready', 
  assist_destroyed: 'assist_destroyed', 
  show_assist: 'show_assist',
  hide_assist: 'hide_assist',
  minimize: 'minimize',
  close: 'close',
  new_window: 'new_window',
  devtool: 'devtool',
  reload: 'reload',
  open_capture_folder: 'open_capture_folder',
  save_capture: 'save_capture',
  openAssist: 'openAssist',
  topmost: 'topmost',
  refresh_assist: 'refresh_assist',
  save_rec: 'save-rec',
  get_sv_data: 'get_sv_data',
  ship_csv: 'ship_csv',
  timeline: 'timeline',
  get_airbase_spots: 'get_airbase_spots',
  set_airbase_spots: 'set_airbase_spots',
  open_url_by_external: 'open_url_by_external',
  get_version: 'get_version',
} as const;
export type MainChannel = Unpacked<typeof MainChannel>;

export const GameChannel = {
  set_app_state: 'set_app_state',
  set_game_setting: 'set_game_setting',
  set_zoom_factor: 'set-zoom-factor',
  resume: 'resume',
} as const;
export type GameChannel = Unpacked<typeof GameChannel>;

export const AssistChannel = {
  api_req: 'api_req',
  api_res: 'api_res', 
  api_data: 'api_data',
  quest_data: 'quest_data',
} as const;
export type AssistChannel = Unpacked<typeof AssistChannel>;

export interface IpcSvData {
  readonly json_sv_data: string;
  readonly quests: Quest[];
}

export type AirbaseTargetSpots = [[string, string], [string, string], [string, string]];
export interface AirbaseSpot {
  area_id: number;
  area_no: number;
  spots: AirbaseTargetSpots;
}

export interface QuestContext {
  readonly quest_max: number;
  readonly quests: ApiQuest[] | null;
}
export const InvalidQuestContext = (): QuestContext => ({
  quest_max: 0,
  quests: null,
});

export type TimelineResult = [QuestContext, BattleRecord[]];
