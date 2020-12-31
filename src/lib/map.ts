import fs from 'fs';
import { MapLv } from '@/lib/kcs';
import { AppState } from './setting';
import { AppStuff } from './app';

export type CheckType = 
  'airsearch' | 
  'maplos';

export type SpotType = 'enemy' | 'start' | 'boss' | 'select' | 'airsearch' | 'safe';

export interface Spot {
  readonly no: number;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly enemy: number[][];
  readonly aa: number[];
  readonly type?: SpotType;
  readonly maplos?: number;
  readonly maplosmin?: number;
  readonly maplosmax?: number;
  readonly airsearch?: number;
  readonly distance?: number;
  readonly maxAa: number;
}

export interface Check {
  readonly no: number;
  readonly label: string;
  readonly type: CheckType;
  readonly x: number;
  readonly y: number;
  readonly info : MapLos | AirSearch;
}

export interface MapLos {
  readonly value: number;
  readonly min: number;
  readonly max: number;
}

export interface AirSearch {
  readonly value: number;
  readonly min: number;
  readonly max: number;
}

export interface CellInfo {
  spots: Spot[];
  checks: Check[];
  'spots_1'?: Spot[];
  'spots_2'?: Spot[];
  'spots_3'?: Spot[];
}

/**
 * 
 */
export class MapStuff {

  private static cell_infos: Map<string, CellInfo> = new Map();

  private static cellInfoKey(area_id: number, area_no: number): string {
    return `00${area_id}`.slice(-3)+'_'+`0${area_no}`.slice(-2);
  }

  /**
   * 
   * @param area_id 
   * @param area_no 
   */
  public static cellInfo(area_id: number, area_no: number): CellInfo {
    const key = this.cellInfoKey(area_id, area_no);
    const info = this.cell_infos.get(key);
    if (info) {
      console.debug('cache return', key);
      return info;
    }

    try {
      const json = '/resource/map/'+key+'_map.json';
      const cell_info = JSON.parse(fs.readFileSync(AppStuff.resolveResourcePath(json), 'utf8')) as CellInfo;
      if (! cell_info.checks) {
        cell_info.checks = [];
      }
      this.cell_infos.set(key, cell_info);
      return cell_info;
    } catch(e) {
      console.error(e);
    }

    return {
      spots: [], checks: []
    };
  }

  public static findSpotForLabel(spots: Spot[], no: number): Spot | undefined {
    const spot = spots.find((el) => el.no === no);
    if (spot && spot.label) {
      return spot;
    }

    // todo: all cell label data
    return spots.find((el) => el.x === spot!.x && el.y === spot!.y);
  }

  public static findBossSpot(cell_info: CellInfo): Spot | undefined {
    const spot = cell_info.spots.find((el) => el.type === 'boss');
    if ( spot) {
      if (spot.label) {
        return spot;
      } 
      // todo: all cell label data
      return cell_info.spots.find((el) => el.x === spot!.x && el.y === spot!.y);
    }
  }

  public static spotsFromLevel(cell_info: CellInfo, mapLv: MapLv): Spot[] {
    let spots: Spot[] | undefined;
    if (mapLv === MapLv.tyou) {
      spots = cell_info.spots_1;
    }
    if (mapLv === MapLv.hei) {
      spots = cell_info.spots_2;
    }
    if (mapLv === MapLv.otu) {
      spots = cell_info.spots_3;
    }

    if (!spots) {
      spots = cell_info.spots;
    }
    return spots;
  }
}
