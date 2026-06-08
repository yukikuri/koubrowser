import { MapLv } from '@common/kcs'
export type CheckType = 'airsearch' | 'maplos'

export type SpotType = 'enemy' | 'start' | 'boss' | 'select' | 'airsearch' | 'safe'

export interface Spot {
  readonly no: number
  readonly label: string
  readonly x: number
  readonly y: number
  readonly enemy: number[][]
  readonly aa: number[]
  readonly type?: SpotType
  readonly maplos?: number
  readonly maplosmin?: number
  readonly maplosmax?: number
  readonly airsearch?: number
  readonly distance?: number
  readonly maxAa: number
}

export interface Check {
  readonly no: number
  readonly label: string
  readonly type: CheckType
  readonly x: number
  readonly y: number
  readonly info: MapLos | AirSearch
}

export interface MapLos {
  readonly value: number
  readonly min: number
  readonly max: number
}

export interface AirSearch {
  readonly value: number
  readonly min: number
  readonly max: number
}

export interface CellInfo {
  spots: Spot[]
  checks: Check[]
  spots_1?: Spot[]
  spots_2?: Spot[]
  spots_3?: Spot[]
}

/**
 *
 */
class CommonMapImpl {

  findSpotForLabel(spots: Spot[], no: number): Spot | undefined {
    const spot = spots.find((el) => el.no === no)
    if (spot && spot.label) {
      return spot
    }

    // todo: all cell label data
    return spots.find((el) => {
      //console.log('find spot for label', el, spot, no)
      return el.x === spot?.x && el.y === spot?.y
    })
  }

  findBossSpot(cell_info: CellInfo): Spot | undefined {
    const spot = cell_info.spots.find((el) => el.type === 'boss')
    if (spot) {
      if (spot.label) {
        return spot
      }
      // todo: all cell label data
      return cell_info.spots.find((el) => {
        //console.log('find boss spot', el, spot)
        return el.x === spot?.x && el.y === spot?.y
      })
    }

    return
  }

  spotsFromLevel(cell_info: CellInfo, mapLv: MapLv): Spot[] {
    let spots: Spot[] | undefined
    if (mapLv === MapLv.tyou) {
      spots = cell_info.spots_1
    }
    if (mapLv === MapLv.hei) {
      spots = cell_info.spots_2
    }
    if (mapLv === MapLv.otu) {
      spots = cell_info.spots_3
    }

    if (!spots) {
      spots = cell_info.spots
    }
    return spots
  }
}

/**
 * 
 */
export class CellInfoUtil {

  /**
   * 
   * @param cellInfo 
   * @returns 
   */
  static getSameSpotMap(cellInfo: CellInfo): Map<number, number[]> {

    // merge same spot
    const spots = cellInfo.spots;
    const sameSpots: Map<number, number[]> = new Map();
    spots.forEach((spot) => {
      let found;
      for (const [key, value] of sameSpots) {
        if (value.includes(spot.no)) {
          found = key;
          break;
        }
      }
      if (found) {
        return ; // already
      }
      const sames = cellInfo.spots.filter((s) => s.x === spot.x && s.y === spot.y);
      const nos = sames.map((s) => s.no);
      sameSpots.set(spot.no, nos);
    });
    return sameSpots;
  }
}

export const CommonMap = new CommonMapImpl()

// todo update real time(etc. event)
interface AlwaysDropCellNo {
  mapId: number
  cellNos: number[]   
}
const AlwaysDropCellNos: AlwaysDropCellNo[] = [
  { mapId: 11, cellNos: [3] },
  { mapId: 12, cellNos: [5,6] },
  { mapId: 13, cellNos: [10, 13] },
  { mapId: 14, cellNos: [12, 16, 17] },
  { mapId: 15, cellNos: [10, 11, 12] },
  { mapId: 21, cellNos: [8, 10, 11] },
  { mapId: 22, cellNos: [11, 13, 14] },
  { mapId: 23, cellNos: [14, 20] },
  { mapId: 24, cellNos: [16, 21] },
  { mapId: 25, cellNos: [15, 19, 20] },
  { mapId: 31, cellNos: [7, 9] },
  { mapId: 32, cellNos: [12] },
  { mapId: 33, cellNos: [13, 16, 17] },
  { mapId: 34, cellNos: [16, 23, 24] },
  { mapId: 35, cellNos: [11, 15] },
  { mapId: 71, cellNos: [11] },
  { mapId: 72, cellNos: [15] },
  { mapId: 73, cellNos: [5, 8, 18, 23, 24, 25] },
  { mapId: 74, cellNos: [16, 21, 22, 23] },
  { mapId: 75, cellNos: [24, 25] },
  { mapId: 41, cellNos: [10, 13] },
  { mapId: 42, cellNos: [12, 16] },
  { mapId: 43, cellNos: [14, 21, 22] },
  { mapId: 44, cellNos: [11] },
  { mapId: 45, cellNos: [20, 30, 31, 32] },
  { mapId: 51, cellNos: [10, 13] },
  { mapId: 52, cellNos: [15, 20, 21] },
  { mapId: 53, cellNos: [17] },
  { mapId: 54, cellNos: [16, 22] },
  { mapId: 55, cellNos: [19, 28] },
  { mapId: 56, cellNos: [43] },
  { mapId: 61, cellNos: [11] },
  { mapId: 62, cellNos: [11, 17, 18] },
  { mapId: 63, cellNos: [10] },
  { mapId: 64, cellNos: [14, 20, 21] },
  { mapId: 65, cellNos: [13, 18] },
];
export function isAlwaysDropCellNo(mapId: number, cellId: number): boolean {
  const cellNo = AlwaysDropCellNos.find((bc) => bc.mapId === mapId);
  return cellNo ? cellNo.cellNos.includes(cellId) : false;
}
