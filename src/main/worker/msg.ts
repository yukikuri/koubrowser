import { AggregatedCellRank, AggregatedCellShipDrop } from "@common/calc_record";
import type { DbName, Insert, Query, Update, Remove, UpdateRes, Operation, PortChartData } from "@common/record";

/**
 * Message types
 */
export const Types = {
  // for worker
  shutdown: 'shutdown',

  // for database operations
  dbInit: 'db:init',
  dbInsert: 'db:insert',
  dbUpdate: 'db:update',
  dbQuery: 'db:query',
  dbQueryOne: 'db:queryOne',
  dbRemove: 'db:remove',
  dbOperation: 'db:operation',

  // for process
  calcPortChartData: 'calc:portChartData',
  aggregateRankByArea: 'aggregate:rankByArea',
  aggregateShipDrop: 'aggregate:shipDrop',

  // for error
  error: 'error'

} as const
export type Type = (typeof Types)[keyof typeof Types]

/**
 * 
 */
export interface ReqShutdown {
  readonly type: 'shutdown'
}

/**
 * 
 */
export interface ReqDbInit {
  readonly type: typeof Types.dbInit
  userDir: string
  dbs: DbName[]
}

/**
 * 
 */
export interface ReqDbInsert {
  readonly type: typeof Types.dbInsert
  doc: Insert
}

/**
 * 
 */
export interface ReqDbUpdate {
  readonly type: typeof Types.dbUpdate
  update: Update
}

/**
 * 
 */
export interface ReqDbQuery {
  readonly type: typeof Types.dbQuery
  query: Query
}

/**
 * 
 */
export interface ReqDbQueryOne {
  readonly type: typeof Types.dbQueryOne
  query: Query
}

/**
 * 
 */
export interface ReqDbRemove {
  readonly type: typeof Types.dbRemove
  remove: Remove
}

/**
 * 
 */
export interface ReqDbOperation {
  readonly type: typeof Types.dbOperation
  operation: Operation
}

/**
 * 
 */
export interface ReqCalcPortChartData {
  readonly type: typeof Types.calcPortChartData
}

/**
 * 
 */
export interface ReqAggregateRankByArea {
  readonly type: typeof Types.aggregateRankByArea
  area_id: number
  area_no: number
}

/**
 * 
 */
export interface ReqAggregateShipDrop {
  readonly type: typeof Types.aggregateShipDrop
  ship_id: number
}

/**
 * 
 */
export interface ResShutdown {
  ok: true
  readonly type: typeof Types.shutdown
}

/**
 * 
 */
export interface ResDbInit {
  ok: true
  readonly type: typeof Types.dbInit
}

/**
 * 
 */
export interface ResDbInsert<T = any> {
  ok: true
  readonly type: typeof Types.dbInsert
  inserted: T
}

/**
 * 
 */
export interface ResDbQuery<T = any> {
  ok: true
  readonly type: typeof Types.dbQuery
  docs: T[]
}

/**
 * 
 */
export interface ResDbQueryOne<T = any> {
  ok: true
  readonly type: typeof Types.dbQueryOne
  doc: T
}

/**
 * 
 */
export interface ResDbUpdate<T = any> {
  ok: true
  readonly type: typeof Types.dbUpdate
  res: UpdateRes<T>
}

/**
 * 
 */
export interface ResDbRemove {
  ok: true
  readonly type: typeof Types.dbRemove
  num: number // number of removed records
}

/**
 * 
 */
export interface ResDbOperation {
  ok: true
  readonly type: typeof Types.dbOperation
}

/**
 * 
 */
export interface ResCalcPortChartData {
  ok: true
  readonly type: typeof Types.calcPortChartData
  data: PortChartData
}

/**
 * 
 */
export interface ResAggregateRankByArea {
  ok: true
  readonly type: typeof Types.aggregateRankByArea
  datas: AggregatedCellRank[]
}

/**
 * 
 */
export interface ResAggregateShipDrop {
  ok: true
  readonly type: typeof Types.aggregateShipDrop
  datas: AggregatedCellShipDrop[]
}

/**
 * 
 */
export interface ResError {
  ok: false
  readonly type: string
  error: string
}

/**
 * 
 */
export type Req = ReqByType[keyof ReqByType]
export type Res = ResByType[keyof ResByType]

/**
 * 
 */
export interface ReqMsg {
  id: number
  req: Req
}

/**
 * 
 */
export interface ResMsg {
  id: number
  res: Res
}

/**
 * 
 */
export type PairByType = {
  'shutdown': [ReqShutdown, ResShutdown],
  'db:init': [ReqDbInit, ResDbInit],
  'db:insert': [ReqDbInsert, ResDbInsert],
  'db:query': [ReqDbQuery, ResDbQuery],
  'db:queryOne': [ReqDbQueryOne, ResDbQueryOne],
  'db:update': [ReqDbUpdate, ResDbUpdate],
  'db:remove': [ReqDbRemove, ResDbRemove],
  'db:operation': [ReqDbOperation, ResDbOperation],
  'calc:portChartData': [ReqCalcPortChartData, ResCalcPortChartData],
  'aggregate:rankByArea': [ReqAggregateRankByArea, ResAggregateRankByArea],
  'aggregate:shipDrop': [ReqAggregateShipDrop, ResAggregateShipDrop],
  'error': [never, ResError],
}

export type ReqByType = { [K in keyof PairByType]: PairByType[K][0] }
export type ResByType = { [K in keyof PairByType]: PairByType[K][1] }

export type ReqTypes<T extends Type> = ReqByType[T]
export type ResTypes<T extends Type> = ResByType[T]

// ジェネリックなレス型を適用するヘルパー型（レス型ごとにパターンを列挙）
export type ResOf<K extends keyof PairByType, T> =
  PairByType[K] extends [any, infer R] ?
    R extends ResDbQuery<any> ? ResDbQuery<T> :
    R extends ResDbQueryOne<any> ? ResDbQueryOne<T> :
    R extends ResDbInsert<any> ? ResDbInsert<T> :
    R extends ResDbUpdate<any> ? ResDbUpdate<T> :
    R
  : never
