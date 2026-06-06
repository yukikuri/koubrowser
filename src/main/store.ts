import { MapStuff } from '@main/map'
import path from 'node:path'
import fs from 'node:fs'
import { PathStuff } from '@main/path'
import { CommonMap } from '@common/map'
import { AppSetting, defaultAppSetting, InheritScoreList } from '@common/store'
import { GlobalSetting } from '@common/global_setting'
import { ApiMapInfoList, ApiMissionList, ApiQuestList } from '@common/kcs'

/**
 *
 */
interface AirbaseSpot {
  readonly area_id: number
  readonly area_no: number
  spots: [[string, string], [string, string], [string, string]]
}

/**
 * 
 */
class AirbaseSpotStore {
  spots: AirbaseSpot[] = []
  loaded: boolean = false

  private get storePath(): string {
    return path.join(PathStuff.storeUser, 'airbase_spots.json')
  }

  private load_(): void {
    if (!this.loaded) {
      this.loaded = true
      const filepath = this.storePath
      if (fs.existsSync(filepath)) {
        try {
          const spots = JSON.parse(fs.readFileSync(filepath, 'utf8'))
          this.spots = spots
        } catch (err: any) {
          console.error(err)
        }
      }
    }
  }

  private save_(): void {
    fs.writeFile(
      this.storePath,
      JSON.stringify(this.spots, undefined, ' '),
      'utf8',
      (err: Error | null) => {
        if (err) {
          console.error(err)
        }
      }
    )
  }

  public getSpots(
    area_id: number,
    area_no: number
  ): [[string, string], [string, string], [string, string]] {
    this.load_()

    const finded = this.spots.find((el) => el.area_id === area_id && el.area_no === area_no)
    if (finded) {
      return finded.spots
    }

    const cell_info = MapStuff.cellInfo(area_id, area_no)
    const boss = CommonMap.findBossSpot(cell_info)
    if (boss) {
      const spot: [string, string] = [boss.label, boss.label]
      return [spot, spot, spot]
    }

    const spot: [string, string] = ['-', '-']
    return [spot, spot, spot]
  }

  public setSpots(
    area_id: number,
    area_no: number,
    spots: [[string, string], [string, string], [string, string]]
  ): void {
    this.load_()

    const finded = this.spots.find((el) => el.area_id === area_id && el.area_no === area_no)
    if (finded) {
      finded.spots = spots
    } else {
      this.spots.push({ area_id, area_no, spots })
    }

    this.save_()
  }
}

export const airbaseSpotStore = new AirbaseSpotStore()

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function mergeStoredData<T>(defaults: T, loaded: unknown): T {
  if (!isPlainObject(defaults) || !isPlainObject(loaded)) {
    return (loaded ?? defaults) as T
  }

  const merged: Record<string, unknown> = { ...defaults }
  for (const [key, value] of Object.entries(loaded)) {
    if (value === undefined) {
      continue
    }

    const defaultValue = merged[key]
    merged[key] = isPlainObject(defaultValue) && isPlainObject(value)
      ? mergeStoredData(defaultValue, value)
      : value
  }
  return merged as T
}

/**
 * json store loader
 */
class JsonStoreLoader<T extends Object> {
  private storeFileName: string
  private storeDirGetter: () => string

  constructor(fileName: string, storeDirGetter: () => string = () => PathStuff.storeUser) {
    this.storeFileName = fileName
    this.storeDirGetter = storeDirGetter
  }

  private get storePath(): string {
    return path.join(this.storeDirGetter(), this.storeFileName)
  }

  load(def: T,  cb: (data: T) => void, errCb: (err: any) => void): void {

    const filepath = this.storePath
    if (fs.existsSync(filepath)) {
        fs.readFile(filepath, 'utf8', (err: Error | null, fileContents: string) => {
          if (err) {
            console.error(err)
            errCb(err)
            return
          }
          
          try {
            const loaded = mergeStoredData(def, JSON.parse(fileContents))

            // call loaded callback
            cb(loaded)
          } catch(err: any) {
            console.error(err)
            errCb(err)
            return
          }
        }
      )
    } else {
      // call loaded callback with def value
      cb(def)
    }
  }

  save(data: T): void {

    fs.writeFile(
      this.storePath,
      JSON.stringify(data, undefined, ' '), 'utf8',
      (err: Error | null) => {
        if (err) {
          console.error(err)
        }
      }
    )
  }
}

/**
 * json store
 */
class JsonStore<T extends Object> {
  private data: T;
  private storeFileName: string
  private loaded: boolean = false
  private storeDirGetter: () => string

  constructor(fileName: string, defaultData: T, storeDirGetter: () => string = () => PathStuff.storeUser) {
    this.data = defaultData
    this.storeFileName = fileName
    this.storeDirGetter = storeDirGetter
  }

  private get storePath(): string {
    return path.join(this.storeDirGetter(), this.storeFileName)
  }

  load(cb: (data: T) => void, errCb: (err: any) => void ): void {
    if (this.loaded) {
      cb(this.data)
      return
    }
    this.loaded = true

    const filepath = this.storePath
    if (fs.existsSync(filepath)) {
        fs.readFile(filepath, 'utf8', (err: Error | null, fileContents: string) => {
          if (err) {
            console.error(err)
            errCb(err)
            return
          }
          
          try {
            const loaded = mergeStoredData(this.data, JSON.parse(fileContents))
            Object.assign(this.data, loaded)
             
            // call loaded callback
            cb(this.data)
          } catch(err: any) {
            console.error(err)
            errCb(err)
            return
          }
        }
      )
    } else {
      // call loaded callback
      // defaul data already assigned
      cb(this.data)
    }
  }

  save(data: T): void {
    if (!this.loaded) {
      return
    }
    Object.assign(this.data, data)
    fs.writeFile(
      this.storePath,
      JSON.stringify(this.data, undefined, ' '), 'utf8',
      (err: Error | null) => {
        if (err) {
          console.error(err)
        }
      }
    )
  }

  get(): T {
    if (! this.loaded) {
      throw new Error('app setting not loaded yet')
    }
    return this.data
  }

  isLoaded(): boolean {
    return this.loaded
  }
}

export const appSettingStore = new JsonStore<AppSetting>(
  'app.json', defaultAppSetting());

export const globalSettingStore = new JsonStoreLoader<GlobalSetting>(
  'global.json', () => PathStuff.storeGlobal);

export const inheritScoreStoreLoader = new JsonStoreLoader<InheritScoreList>(
  'inherit_score.json');

export const mapInfoStoreLoader = new JsonStoreLoader<ApiMapInfoList>(
  'mapinfo.json');

export const missionListStoreLoader = new JsonStoreLoader<ApiMissionList>(
  'missionlist.json');

export const questListStoreLoader = new JsonStoreLoader<ApiQuestList>(
  'questlist.json');
