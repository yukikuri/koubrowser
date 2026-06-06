import {
  MapLv,
  SvData,
  ApiItemId,
  ApiMap,
  ApiMissionClearResult,
  BattleType,
  ApiQuest,
  ApiQuestState,
  WinRank,
  ApiItemBonus,
  ApiEventId
} from '@common/kcs'
import moment from 'moment'
import { isAlwaysDropCellNo } from '@common/map'
import { currentServerDate, toServerDate } from '@common/kcdate'

/**
 * DB names
 */
export const DbName = {
  port: 'port',
  drop: 'drop',
  battle: 'battle',
  item: 'item',
  ship: 'ship',
  remodel: 'remodel',
  mission: 'mission',
  quest: 'quest',
  clearitemget: 'clearitemget'
} as const
export type DbName = (typeof DbName)[keyof typeof DbName]

interface InsertDocT<DbName, Record> {
  readonly dbName: DbName
  record: Record
}

export interface Update {
  readonly dbName: DbName
  query: any
  updateQuery: any
  options?: any
}

export interface UpdateRes<T = any> {
  num: number 
  affectedDocs: T[]
  upsert: boolean
}

export type Insert =
  InsertDocT<typeof DbName.item, ItemRecord[]> |
  InsertDocT<typeof DbName.ship, ShipRecord> |
  InsertDocT<typeof DbName.remodel, RemodelRecord> |
  InsertDocT<typeof DbName.mission, MissionRecord> |
  InsertDocT<typeof DbName.port, PortRecord> |
  InsertDocT<typeof DbName.mission, MissionRecord> |
  InsertDocT<typeof DbName.drop, DropRecord> |
  InsertDocT<typeof DbName.battle, BattleRecord> |
  InsertDocT<typeof DbName.clearitemget, ClearItemGetRecord>
;

export type Query = 
  PortRecordQuery | 
  MissionRecordQuery | 
  BattleRecordQuery | 
  QuestRecordQuery |
  DropRecordQuery |
  ClearItemGetRecordQuery
;

export type QueryReturn = 
  PortRecord[] | 
  MissionRecord[] | 
  BattleRecord[] |
  Quest[] |
  DropRecord[] |
  ClearItemGetRecord[]
;


export type Remove = QuestRecordRemove

interface RecordQuery<P, F> {
  limit?: number
  find?: F | any
  projection?: P
  sort?: any | null
}

interface RecordRemove<F> {
  remove_param: F
}

// port
export interface PortRecord {
  date: string
  [id: number]: number | undefined
}

export interface PortRecordQueryProjection {
  date?: 0 | 1
  [id: number]: 0 | 1
}

export interface PortRecordQuery
  extends RecordQuery<PortRecordQueryProjection, Partial<PortRecord>> {
  readonly dbName: typeof DbName.port
}

export type ChartData = [number, number] // [timestamp, data value][]
export type MaterialChartData = [ChartData[], ChartData[], ChartData[], ChartData[]] // [fuel, ammo, steel, bauxite]
export type KitChartData = [ChartData[], ChartData[], ChartData[], ChartData[]] // [fast_repair, fast_build, build_kit, remodel_kit]
export interface PortChartData {
  materials: MaterialChartData 
  kits: KitChartData
}

export interface BattleRecordQuery
  extends RecordQuery<{}, Partial<BattleRecord>> {
  readonly dbName: typeof DbName.battle
}

export interface BattleRecordQueryFind
  extends RecordQuery<{}, any> {
  readonly dbName: typeof DbName.battle
}

export interface QuestRecordQuery<T = any>
  extends RecordQuery<any, Partial<T>> {
  readonly dbName: typeof DbName.quest
}

export interface QuestRecordRemove
  extends RecordRemove<Pick<Quest, 'no'>> {
  readonly dbName: typeof DbName.quest
}

export interface DropRecordQuery<T = any>
  extends RecordQuery<any, Partial<T>> {
  readonly dbName: typeof DbName.drop
}

export interface ClearItemGetRecordQuery<T = any>
  extends RecordQuery<any, Partial<T>> {
  readonly dbName: typeof DbName.clearitemget
}

/**
 * 
 */
export interface Operation {
  readonly dbName: DbName
  autocompactionInterval?: number // if -1 stop
}

/**
 * 格納時点レコード日付取得
 * 
 * @param upload 
 * @returns 
 */
export function currentRecordDate(upload: boolean): string {
  const date = currentServerDate()
  if (upload) {
    date.setMinutes(0)
    date.setSeconds(0)
    date.setMilliseconds(0)
  }
  return moment(date).format()
}

/**
 * レコード日付取得
 * 
 * @returns 
 */
export function toRecordDate(localTime: Date): string {
  const date = toServerDate(localTime)
  return moment(date).format()
}

// drop ship and item
export interface DropRecord {
  mapId: number
  cellId: number
  isBoss: boolean
  enemyFormation: number
  mapLv: MapLv
  shipId: number // -1: nodrop, -2: ship full, or slotitem full
  shipName: string
  shipCounts: number[]
  rank: string
  questName: string
  enemyDeckName: string
  exp: number
  baseExp: number
  teitokuLv: number
  firstClear: boolean
  enemyShips1: number[]
  enemyShips2?: number[]
  origin: string
  itemId: number
  itemCount: number
  date: string
}

// slotitem info
export interface SlotitemInfo {
  slotitem_id: number
  level: number
  alv: number
}

// ship info
export interface ShipInfoRecord {
  shipId: number
  lv: number
  nowhp: number
  maxhp: number
  slotitem: SlotitemInfo[]
  onslot: number[]
  slotitemEx: undefined | null | SlotitemInfo
  fuel: number
  bull: number
  cond: number
  karyoku: number
  soukou: number
  raisou: number
  kaihi: number
  taiku: number
  soku: number
  taisen: number
  sakuteki: number
  lucky: number
}

export interface AreaItemGetInfo {
  itemId: ApiItemId
  itemCount: number
  eoRate?: number
}

// build item
export interface ItemRecord {
  items: number[]
  secretary: number
  itemId: number
  teitokuLv: number
  successful: boolean
  origin: string
  date: string
}

// build ship
export interface ShipRecord {
  kdockId: number
  secretary: number
  shipId: number
  highspeed: number
  teitokuLv: number
  largeFlag: boolean
  origin: string
  items: number[]
  date: string
}

// remodel item
export interface RemodelRecord {
  successful: boolean
  itemId: number
  itemLevel: number
  flagshipId: number
  flagshipLevel: number
  flagshipCond: number
  consortId: number
  consortLevel: number
  consortCond: number
  teitokuLv: number
  certain: boolean
  origin: string
  date: string
}

// mission result
export interface GetItemInfo {
  id: ApiItemId
  count: number
}

export interface MissionRecord {
  clearResult: ApiMissionClearResult
  mapareaName: string
  questName: string
  getMaterial: number[]
  ships: ShipInfoRecord[]
  getItem1?: GetItemInfo
  getItem2?: GetItemInfo
  origin: string
  date: string
  _id?: string
}

// clearitemget
export interface ClearItemGetRecord {
  questNo: number
  questName: string
  material?: number[]
  bonuses?: ApiItemBonus[]
  origin: string
  date: string
}

export function getItemOfMission(record: MissionRecord, id: ApiItemId): number {
  if (record.getItem1?.id === id) {
    return record.getItem1!.count
  }
  if (record.getItem2?.id === id) {
    return record.getItem2!.count
  }
  return -1
}

export interface MissionRecordQueryProjection {
  clearResult?: 0 | 1
  mapareaName?: 0 | 1
  questName?: 0 | 1
  getMaterial?: 0 | 1
  ships?: 0 | 1
  getItem1?: 0 | 1
  getItem2?: 0 | 1
  origin?: 0 | 1
  date?: 0 | 1
  _id?: 0 | 1
}

export type MissionRecordFind = Partial<MissionRecord>
export interface MissionRecordQuery
  extends RecordQuery<MissionRecordQueryProjection, MissionRecordFind> {
  readonly dbName: typeof DbName.mission
}

// type EParam = [
//   number | null,
//   number | null,
//   number | null,
//   number | null,
//   number | null,
//   number | null
// ] // 火力, 雷装, 対空, 装甲, maxhp, afterhp,
// interface EnemyParam {
//   slot: number[]
//   param: EParam
// }

export interface BattleRecord {
  uuid: string
  index: number
  mapId: number
  cellId: number
  fromCellId?: number
  portReturn?: boolean // 母校戻りでのデータ, ship関連だけを参照する想定
  isBoss: boolean
  type: BattleType
  eventId: ApiEventId
  eventKind: number
  mapLv: MapLv
  airsearchResult: number // api_airsearch -> api_result
  ships1: ShipInfoRecord[]
  ships2?: ShipInfoRecord[]
  rank: string
  exp: number
  baseExp: number
  teitokuLv: number
  questName: string
  enemyDeckName: string
  firstClear: boolean
  formations: number[]
  seiku: number
  middayJson: string | null
  midnightJson: string | null
  drop: DropRecord | null
  items: AreaItemGetInfo[] | null
  happeningJson?: string | null
  origin: string
  date: string
}

export const ApiItemIdsAdd: ApiItemId[] = Object.entries(ApiItemId)
  .map((ids) => ids[1])
  .filter(
    (id) =>
      id !== ApiItemId.fast_repair &&
      id !== ApiItemId.fast_build &&
      id !== ApiItemId.build_kit &&
      id !== ApiItemId.remodel_kit &&
      id !== ApiItemId.fual &&
      id !== ApiItemId.ammo &&
      id !== ApiItemId.steel &&
      id !== ApiItemId.buxite &&
      id !== ApiItemId.kagu_coin &&
      id !== ApiItemId.emergency_repair &&
      id !== ApiItemId.emergency_repair_god &&
      id !== ApiItemId.rice_ball &&
      id !== ApiItemId.offshore_supply &&
      id !== ApiItemId.special_rice_ball
  )

export function isBattleRecordItemGet(record: BattleRecord): boolean {
  if (record.items && record.items.length > 0) {
    return true
  }
  return false
}

export function toRecordMapIdFromApi(map: ApiMap): number {
  return map.api_maparea_id * 10 + map.api_mapinfo_no
}

export function toRecordMapId(maparea_id: number, mapinfo_no: number): number {
  return maparea_id * 10 + mapinfo_no
}

export function recordMapIdToIdNo(record_map_id: number) {
  return { areaId: Math.floor(record_map_id / 10), areaNo: record_map_id % 10 }
}

const isLose = (rank: WinRank): boolean => {
  return (rank === 'C' || rank === 'D' || rank === 'E')
};

export function isIgnoreDropRecord(record: DropRecord): boolean {

  if (isLose(record.rank as WinRank)) {
    return false
  }

  if (record.shipId === -2) {
    //console.log('ignore drop record: ship full', 'mapId:', record.mapId, 'cellId:', record.cellId);
    return true;
  }

  if (record.shipId === -1) {
    if (isAlwaysDropCellNo(record.mapId, record.cellId)) {
      //console.log('ignore drop record: nodrop at boss cell', 'mapId:', record.mapId, 'cellId:', record.cellId);
      // invalid record
      return true;
    }
  }
  return false
}

export const toSlotitemInfo = (svdata: SvData, slotitem_id: number): SlotitemInfo | undefined => {
  const slotitem = svdata.slotitem(slotitem_id)
  if (!slotitem) {
    return
  }
  return {
    slotitem_id: slotitem.api_slotitem_id,
    level: slotitem?.api_level ?? 0,
    alv: slotitem?.api_alv ?? 0
  }
}

export const toShipInfo = (svdata: SvData, ship_id: number): ShipInfoRecord | undefined => {
  const ship = svdata.ship(ship_id)
  if (!ship) {
    return
  }

  const slotitems: SlotitemInfo[] = []
  for (let i = 0; i < ship.api_slot.length; ++i) {
    const slotitem_id = ship.api_slot[i]
    if (slotitem_id > 0) {
      const slotiteminfo = toSlotitemInfo(svdata, slotitem_id)
      if (!slotiteminfo) {
        return
      }
      slotitems.push(slotiteminfo)
    } else {
      break
    }
  }

  let exslotinfo
  if (ship.api_slot_ex == -1) {
    exslotinfo = null
  }
  if (ship.api_slot_ex > 0) {
    exslotinfo = toSlotitemInfo(svdata, ship.api_slot_ex)
    if (!exslotinfo) {
      return
    }
  }
  return {
    shipId: ship.api_ship_id,
    lv: ship.api_lv,
    nowhp: ship.api_nowhp,
    maxhp: ship.api_maxhp,
    slotitem: slotitems,
    onslot: ship.api_onslot,
    slotitemEx: exslotinfo,
    fuel: ship.api_fuel,
    bull: ship.api_bull,
    cond: ship.api_cond,
    karyoku: ship.api_karyoku[0],
    soukou: ship.api_soukou[0],
    raisou: ship.api_raisou[0],
    kaihi: ship.api_kaihi[0],
    taiku: ship.api_taiku[0],
    soku: ship.api_soku,
    taisen: ship.api_taisen[0],
    sakuteki: ship.api_sakuteki[0],
    lucky: ship.api_lucky[0]
  }
}

export const toShipsInfo = (svdata: SvData, ships: number[]): ShipInfoRecord[] | undefined => {
  const ret: ShipInfoRecord[] = []
  for (let i = 0; i < ships.length; ++i) {
    const id = ships[i]
    if (-1 !== id) {
      const shipinfo = toShipInfo(svdata, id)
      if (!shipinfo) {
        return
      }
      ret.push(shipinfo)
    }
  }
  return ret
}

export interface Quest<T extends any = any> {
  no: number
  dateKey: string
  date: string
  quest: ApiQuest
  state: T
}

export interface QuestCounter {
  count: number[]
  countMax: number[]
}

export const isQuestCounter = (state: any): boolean => {
  if (Array.isArray(state.count) && Array.isArray(state.countMax)) {
    return (state.count as number[]).length === (state.countMax as number[]).length
  }
  return false
}

export const questCounter = (count: number[], countMax: number[]): QuestCounter => ({
  count: count.slice(),
  countMax: countMax.slice()
})

export type QuestState = QuestCounter | object

// -1: error, 0, 100: valid
export const questProgress = (quest: Quest): number => {
  if (quest.quest.api_state === ApiQuestState.completed) {
    return 100
  }

  if (quest.state) {
    if (isQuestCounter(quest.state)) {
      const state = quest.state as QuestCounter
      const total = state.count.reduce((acc, el, index) => {
        // 家具コイン
        if (state.countMax[index] >= 6000) {
          return acc + (el >= state.countMax[index] ? 1 : 0)
        }
        return acc + el
      }, 0)
      const totalMax = state.countMax.reduce((acc, el) => {
        // 家具コイン
        if (el >= 6000) {
          return acc + 1
        }
        return acc + el
      }, 0)
      return Math.floor((total / totalMax) * 100)
    }
  }

  return [0, 50, 80]?.[quest.quest.api_progress_flag] ?? 0
}

