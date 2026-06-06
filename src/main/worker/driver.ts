// src/main/worker-driver.ts
import { Worker } from 'node:worker_threads'
import { join } from 'node:path'
import { 
  Types,
  type Req, 
  type Res, 
  type ReqMsg, 
  type ResMsg, 
  type ReqDbInit, 
  type ReqDbInsert, 
  type ReqDbQuery, 
  type ReqDbUpdate,
  type ReqDbRemove,
  type ReqShutdown, 
  type ResByType,
  type ReqDbQueryOne,
  type ReqDbOperation,
  type ResOf,
  ReqCalcPortChartData
} from './msg'
import { DbName, Insert, Query, Update, Remove, Operation, UpdateRes, PortChartData } from '@common/record'
import { AggregatedCellRank, AggregatedCellShipDrop } from '@common/calc_record'
  
/**
 * 
 */
export class WorkerDriver {
  private worker: Worker
  private seq = 0
  private pending = new Map<number, (res: ResMsg) => void>()

  /**
   * 
   */
  constructor(appDir: string) {

    // worker.js: builded js filename
    // config: electron.vite.config.ts
    const workerPath = join(appDir, 'worker.js')
    console.log('worker driver workerPath:', workerPath)
    this.worker = new Worker(workerPath, {
      workerData: { appDir }
    })

    this.worker.on('message', (msg: ResMsg) => {
      const resolve = this.pending.get(msg.id)
      if (resolve) {
        this.pending.delete(msg.id)
        resolve(msg)
      }
    })
    this.worker.on('error', (e) => console.error('[worker error]', e))
    this.worker.on('exit', (code) => console.log('[worker exit]', code))
  }

  /**
   * 
   * @param req 
   * @returns 
   */
  private call<T extends Res, V>(req: Req, mapper: (res: T) => V): Promise<V> {
    const id = ++this.seq
    const msg: ReqMsg = { id, req }
    return new Promise((resolve, reject) => {
      this.pending.set(id, (msg: ResMsg) => {
        if (!msg.res.ok) {
          reject(new Error(msg.res.error));
        } else {
          resolve(mapper(msg.res as T))
        }
      })
      this.worker.postMessage(msg)
    })
  }

  /**
   * 
   */
  shutdown() {
    const req: ReqShutdown = { type: Types.shutdown }
    return this.call<ResByType[typeof req.type], boolean>(req, (res) => res.ok)
  }

  /**
   * 
   * @param userDir 
   * @returns 
   */
  dbInit(userDir: string, dbs: DbName[]) {
    const req: ReqDbInit = { type: Types.dbInit, userDir, dbs }
    return this.call<ResByType[typeof req.type], boolean>(req, (res) => res.ok)
  }

  /**
   * 
   * @param doc 
   * @returns 
   */
  dbInsert<T>(doc: Insert) {
    const req: ReqDbInsert = { type: Types.dbInsert, doc }
    return this.call<ResOf<typeof req.type, T>, T>(req, (res) => res.inserted)
  }

  /**
   * 
   * @param query 
   * @returns 
   */
  dbQuery<T>(query: Query) {
    const req: ReqDbQuery = { type: Types.dbQuery, query }
    return this.call<ResOf<typeof req.type, T>, T[]>(req, (res) => res.docs)
  }

  /**
   * 
   * @param query 
   * @returns 
   */
  dbQueryOne<T>(query: Query) {
    const req: ReqDbQueryOne = { type: Types.dbQueryOne, query }
    return this.call<ResOf<typeof req.type, T>, T>(req, (res) => res.doc)
  }

  /**
   * 
   * @param query 
   * @returns 
   */
  dbUpdate<T>(update: Update) {
    const req: ReqDbUpdate = { type: Types.dbUpdate, update }
    return this.call<ResOf<typeof req.type, T>, UpdateRes<T>>(req, (res) => res.res)
  }

  /**
   * 
   * @param remove
   * @returns 
   */
  dbRemove(remove: Remove) {
    const req: ReqDbRemove = { type: Types.dbRemove, remove }
    return this.call<ResByType[typeof req.type], number>(req, (res) => res.num)
  }

  /**
   * 
   * @param operation 
   * @returns 
   */
  dbOperation(operation: Operation) {
    const req: ReqDbOperation = { type: Types.dbOperation, operation }
    return this.call<ResByType[typeof req.type], boolean>(req, (res) => res.ok)
  }

  /**
   * 
   * @returns 
   */
  calcPortChartData() {
    const req: ReqCalcPortChartData = { type: Types.calcPortChartData }
    return this.call<ResByType[typeof req.type], PortChartData>(req, (res) => res.data)
  }

  /**
   * 
   * @param area_id 
   * @param area_no 
   * @returns 
   */
  aggregateRankByArea(area_id: number, area_no: number) {
    const req = { type: Types.aggregateRankByArea, area_id, area_no }
    return this.call<ResByType[typeof req.type], AggregatedCellRank[]>(req, (res) => res.datas)
  }

  /**
   * 
   * @param ship_id
   * @returns 
   */
  aggregateShipDrop(ship_id: number) {
    const req = { type: Types.aggregateShipDrop, ship_id }
    return this.call<ResByType[typeof req.type], AggregatedCellShipDrop[]>(req, (res) => res.datas)
  }

  /**
   * 
   * @returns 
   */
  terminate() {
    return this.worker.terminate()
  }
}
