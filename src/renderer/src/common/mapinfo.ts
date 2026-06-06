import { CellInfo } from "@common/map";

const DEBUG = 0;

const debug = (...args: any[]) => {
  if (DEBUG) console.debug("[MapInfo]", ...args);
};

/**
 *
 * @param area_id
 * @param area_no
 * @returns
 */
const cellInfoKey = (area_id: number, area_no: number): string => {
  return `00${area_id}`.slice(-3) + '_' + `0${area_no}`.slice(-2)
}

class MapInfoCache {
  private cell_infos: Map<string, CellInfo> = new Map()

  /**
   *
   * @param area_id
   * @param area_no
   */
  getOnlyCache(area_id: number, area_no: number): CellInfo | undefined {
    const key = cellInfoKey(area_id, area_no)
    const info = this.cell_infos.get(key)
    if (info) {
      debug('cache return', key)
      return info
    }
    return ;
  }

  /**
   *
   * @param area_id
   * @param area_no
   */
  async get(area_id: number, area_no: number): Promise<CellInfo> {
    debug('cellInfoAsync called.', area_id, area_no)
    return new Promise<CellInfo>((resolve, reject) => {
      const key = cellInfoKey(area_id, area_no)
      const info = this.cell_infos.get(key)
      if (info) {
        debug('cache return', key)
        return resolve(info)
      }

      window.api.cellInfoAsync(area_id, area_no).then((info) => {
        this.cell_infos.set(key, info)
        return resolve(info)
      }).catch((err) => {
        return reject(err)
      })
    })
  }

  /**
   * 
   * @param area_id 
   * @param area_no 
   * @param cell_no 
   * @returns 
   */
  findCellNos(area_id: number, area_no: number, cell_no: number): number[] {
    const info = this.getOnlyCache(area_id, area_no);
    if (!info) {
      return [cell_no];
    }

    const spot = info.spots.find((spot) => spot.no === cell_no);
    if (!spot) {
      return [cell_no];
    }

    const sameSpots = info.spots.filter((s) => s.x === spot.x && s.y === spot.y);
    if (sameSpots.length === 0) {
      return [cell_no];
    }
    return sameSpots.map((s) => s.no);
  }

}

export const mapInfoCache = new MapInfoCache()
