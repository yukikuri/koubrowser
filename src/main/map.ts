import fs from 'fs'
import { AppStuff } from '@main/app'
import type { CellInfo } from '@common/map'

/**
 *
 * @param area_id
 * @param area_no
 * @returns
 */
const cellInfoKey = (area_id: number, area_no: number): string => {
  return `00${area_id}`.slice(-3) + '_' + `0${area_no}`.slice(-2)
}

/**
 *
 */
class MapStuffImpl {
  private cell_infos: Map<string, CellInfo> = new Map()

  /**
   *
   * @param area_id
   * @param area_no
   */
  public clearCellInfo(area_id: number, area_no: number): void {
    const key = cellInfoKey(area_id, area_no)
    this.cell_infos.delete(key)
    console.log('clear cell info:', key)
  }

  /**
   *
   * @param area_id
   * @param area_no
   */
  public cellInfo(area_id: number, area_no: number): CellInfo {
    const key = cellInfoKey(area_id, area_no)
    const info = this.cell_infos.get(key)
    if (info) {
      console.debug('cache return', key)
      return info
    }

    try {
      // read public map info
      const json = '/map/' + key + '_map.json'
      const path = AppStuff.resolveResourcePath(json)
      console.log('read public cellInfo path:', path)
      const cell_info = JSON.parse(fs.readFileSync(path, 'utf8')) as CellInfo
      if (!cell_info.checks) {
        cell_info.checks = []
      }
      this.cell_infos.set(key, cell_info)
      return cell_info
    } catch (e) {
      console.log('read public cellInfo failed. area_id:', area_id, 'area_no:', area_no, e)
      //console.error(e);
    }

    const ret = {
      spots: [],
      checks: []
    }
    return ret
  }

  /**
   *
   * @param area_id
   * @param area_no
   */
  public async cellInfoAsync(area_id: number, area_no: number): Promise<CellInfo> {
    console.log('cellInfoAsync called.', area_id, area_no)
    return new Promise<CellInfo>((resolve) => {
      const key = cellInfoKey(area_id, area_no)
      const info = this.cell_infos.get(key)
      if (info && info.spots.length > 0) {
        console.debug('cache return', key)
        return resolve(info)
      }

      try {
        // read public map info
        const json = '/map/' + key + '_map.json'
        const path = AppStuff.resolveResourcePath(json)
        console.log('read public cellInfo async path:', path)
        const info = JSON.parse(fs.readFileSync(path, 'utf8')) as CellInfo
        if (!info.checks) {
          info.checks = []
        }
        this.cell_infos.set(key, info)
        return resolve(info)
      } catch (e) {
        // return empty info
        console.log('read public cellInfo failed. area_id:', area_id, 'area_no:', area_no, e)
        return resolve({
          spots: [],
          checks: []
        })
        //return reject(e)
      }

      // // read app cache map info
      // const mapinfo_url = Schemas.buildMapInfoUrl(area_id, area_no)
      // fetch(mapinfo_url)
      //   .then((res: Response) => {
      //     res
      //       .json()
      //       .then((value) => {
      //         if (!res.ok) {
      //           return reject('res error' + res.statusText)
      //         }
      //         console.log('app file res', value)
      //         value.checks = []
      //         this.cell_infos.set(key, value)
      //         return resolve(value)
      //       })
      //       .catch((err) => {
      //         return reject(err)
      //       })
      //   })
      //   .catch((err) => {
      //     return reject(err)
      //   })
    })
  }
}

export const MapStuff = new MapStuffImpl()
