import { MissionId } from "@common/mission"
import { WinRankDrop } from "@common/kcs";

/**
 * app setting
 */
export interface AppSetting {
  mission: MissionStore
  shipDropMap: ShipDropStore
}

export function defaultAppSetting(): AppSetting {
  return {
    mission: defaultMissionStore(),
    shipDropMap: defaultShipDropStore(),
  }
}

/**
 * mission
 */
export interface MissionStore {
  keepMissionIds: MissionId[]
  filterClearedMonthlyUnDisplay: boolean
}

/**
 * default keep mission ids
 */
const defaultKeepMissionIds: MissionId[] = [
  MissionId.Id02,
  MissionId.Id05,
  MissionId.Id06,
  MissionId.IdA2,
  MissionId.IdA3,
  MissionId.Id21,
  MissionId.Id37,
  MissionId.Id38,
  MissionId.Id41,
] as const;

/**
 * 
 */
function defaultMissionStore(): MissionStore {
  return {
    keepMissionIds: [...defaultKeepMissionIds],
    filterClearedMonthlyUnDisplay: true,
  }
}

export type ShipDropRareType = 'common' | 'rare' | 'unique';

/**
 * 
 */
export interface ShipDropStore {
  filterRare: ShipDropRareType[]
  filterWinRank: WinRankDrop[]
}

/**
 * 
 * @returns 
 */
function defaultShipDropStore(): ShipDropStore {
  return {
    filterRare: ['unique', 'rare', 'common'],
    filterWinRank: ['S', 'A', 'B'],
  }
}

/**
 * 引継ぎ戦果
 */
export type MonthScores = [number, number, number, number, number, number, number, number, number, number, number, number];
export interface InheritScore {
  year: number;
  scores: MonthScores;
}

/**
 * 引継ぎ戦果リスト
 */
export interface InheritScoreList {
  inheritScores: InheritScore[];
}

/**
 * 
 * @returns 
 */
export function defaultInheritScoreList(): InheritScoreList { 
  return {
    inheritScores: [],
  }
}
