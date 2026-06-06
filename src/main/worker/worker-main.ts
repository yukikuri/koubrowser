import { parentPort, threadId, workerData } from 'node:worker_threads'
import { 
  type Type, 
  type ResTypes, 
  type ReqDbInit, 
  type ReqDbInsert, 
  type ReqShutdown, 
  type ReqDbQuery, 
  type ReqDbQueryOne,
  type ReqDbUpdate,
  type ReqDbRemove,
  type ResError,
  type ReqMsg, 
  type ResMsg,
  ReqDbOperation,
  ReqCalcPortChartData,
  ReqAggregateRankByArea,
  ReqAggregateShipDrop
} from '@main/worker/msg'
import { createDbStuff, DbStuff } from '@main/stuff/db'
import { findOne } from '@common/debug'
import { DbName, DropRecord, DropRecordQuery, PortChartData, PortRecord, PortRecordQuery, PortRecordQueryProjection, recordMapIdToIdNo, toRecordMapId } from '@common/record'
import { ApiItemId } from '@common/kcs'
import moment from 'moment'
import { MapStuff } from '@main/map'
import { getMainDir, setMainDir } from '@main/path'
import { AggregatedCellShipDrop, RecordCalculator } from '@common/calc_record'

if (!parentPort) {
  throw new Error('Must be run as a worker thread')
}
console.log('worker thread started, threadId:', threadId, 'workerData:', workerData)
setMainDir(workerData.appDir);

// -----------------------------------------------------------------
// for aggregateShipDrop proc cancel
let processingAggregateShipDropId = 0;

/**
 * 
 * @param res 
 */
function reply<T extends Type>(id: number, res: ResTypes<T>): void {
  const msg: ResMsg = { id, res }
  parentPort!.postMessage(msg)
}

/**
 * 
 * @param req 
 * @param e 
 */
function replyError(req: ReqMsg, e: any): void {
  const res: ResError = { ok: false, type: 'error', error: e?.message ?? String(e) }
  reply(req.id, res);
}

let dbStuff: DbStuff | null = null

/**
 * 
 * @param value 
 */
function checkDbStuff(value: DbStuff | null): asserts value is DbStuff {
  if (! dbStuff) {
    throw new Error('DB not initialized')
  }
}

/**
 * 
 * @param req 
 */
function shutdown(id: number, req: ReqShutdown) {
  //setTimeout(() => { 
    //console.log('worker thread shutting down2')
    reply(id, { ok: true, type: req.type })
    process.exit(0)
  //}, 10000)
}

/**
 * 
 * @param req 
 */
function dbInit(id: number, req: ReqDbInit) {
  if (! dbStuff) {
    dbStuff = createDbStuff()
    dbStuff.load(req.userDir, req.dbs, (results) => {
      console.log('worker dbInit loaded:', JSON.stringify(results))
      reply(id, { ok: true, type: req.type })
    });
    return
  }
  reply(id, { ok: true, type: req.type })
}

/**
 * 
 * @param req 
 * @returns 
 */
function dbInsert(id: number, req: ReqDbInsert) {
  checkDbStuff(dbStuff)
  dbStuff.insert(req.doc).then((doc) => {
    reply(id, { ok: true, type: req.type, inserted: doc })
  }).catch((e) => {
    replyError({ id, req }, e)
  })
}

/**
 * 
 * @param req 
 * @returns 
 */
function dbQuery(id: number, req: ReqDbQuery) {
  checkDbStuff(dbStuff)
  dbStuff.query(req.query).then((docs) => {
    reply(id, { ok: true, type: req.type, docs })
  }).catch((e) => {
    replyError({ id, req }, e)
  })
}

/**
 * 
 * @param req 
 * @returns 
 */
function dbQueryOne(id: number, req: ReqDbQueryOne) {
  checkDbStuff(dbStuff)
  dbStuff.queryOne(req.query).then((doc) => {
    reply(id, { ok: true, type: req.type, doc })
  }).catch((e) => {
    replyError({ id, req }, e)
  })
}

/**
 * 
 * @param id 
 * @param req 
 */
function dbUpdate(id: number, req: ReqDbUpdate) {
  checkDbStuff(dbStuff)
  dbStuff.update(req.update).then(({ num, affectedDocs, upsert }) => {
    reply(id, { ok: true, type: req.type, res: { num, affectedDocs, upsert } })
  }).catch((e) => {
    replyError({ id, req }, e)
  })
}

/**
 * 
 * @param req 
 * @returns 
 */
function dbRemove(id: number, req: ReqDbRemove) {
  checkDbStuff(dbStuff)
  dbStuff.remove(req.remove).then((num) => {
    reply(id, { ok: true, type: req.type, num })
  }).catch((e) => {
    replyError({ id, req }, e)
  })
}

/**
 * 
 * @param req 
 * @returns 
 */
function dbOperation(id: number, req: ReqDbOperation) {
  checkDbStuff(dbStuff)
  try {
    dbStuff.operation(req.operation);
    reply(id, { ok: true, type: req.type })
  } catch (e) {
    replyError({ id, req }, e) 
  }
}

function calcPortChartData(id: number, req: ReqCalcPortChartData) {
  checkDbStuff(dbStuff)

  // query port record 
  const projection: PortRecordQueryProjection = {}

  // common projection
  projection.date = 1

  // material projection
  projection[ApiItemId.fual] = 1
  projection[ApiItemId.ammo] = 1
  projection[ApiItemId.steel] = 1
  projection[ApiItemId.buxite] = 1
  // kit projection
  projection[ApiItemId.fast_repair] = 1
  projection[ApiItemId.fast_build] = 1
  projection[ApiItemId.build_kit] = 1
  projection[ApiItemId.remodel_kit] = 1

  // do query
  const query: PortRecordQuery = { dbName: DbName.port, projection }
  dbStuff.query(query).then((docs) => {

    // calc cahrt data
    const records = docs as  PortRecord[]
    const data: PortChartData = {
      materials: [[],[],[],[]],
      kits: [[],[],[],[]]
    }
    console.time('calc chart data(sort)');
    records.sort((a, b) => (a.date < b.date ? -1 : 1))
    console.timeEnd('calc chart data(sort)');
    const toNum = (v: number | undefined): number => {
      return v ?? NaN
    }
    console.time('calc chart data(to array)');
    records.reduce<PortChartData>((acc, rec) => {
      const date = moment(rec.date).valueOf()
      acc.materials[0].push([date, toNum(rec[ApiItemId.fual])]);
      acc.materials[1].push([date, toNum(rec[ApiItemId.ammo])]);
      acc.materials[2].push([date, toNum(rec[ApiItemId.steel])]);
      acc.materials[3].push([date, toNum(rec[ApiItemId.buxite])])
      acc.kits[0].push([date, toNum(rec[ApiItemId.fast_repair])])
      acc.kits[1].push([date, toNum(rec[ApiItemId.fast_build])])
      acc.kits[2].push([date, toNum(rec[ApiItemId.build_kit])])
      acc.kits[3].push([date, toNum(rec[ApiItemId.remodel_kit])])
      return acc
    }, data)
    console.timeEnd('calc chart data(to array)');
    reply(id, { ok: true, type: req.type, data })
  }).catch((e) => {
    replyError({ id, req }, e)
  })
}

function aggregateRankByArea(id: number, req: ReqAggregateRankByArea) {
  checkDbStuff(dbStuff)

  console.log('agg threadId:', threadId, 'dirname:', getMainDir())

  // read map info
  const cellInfo = MapStuff.cellInfo(req.area_id, req.area_no);
  if (! cellInfo.spots.length) {
    replyError({ id, req }, new Error('No spots info found for area_id:' + req.area_id + ' area_no:' + req.area_no));
    return ;
  }

  const query: DropRecordQuery = {
    dbName: DbName.drop,
    find: {
      mapId: toRecordMapId(req.area_id, req.area_no),
    },
    projection: {
      mapId: 1,
      cellId: 1,
      shipId: 1,
      rank: 1,
      isBoss: 1,
    }
  };

  dbStuff.query(query).then((records: DropRecord[]) => {
    const calced = RecordCalculator.aggregateCellRank(records);
    const datas = RecordCalculator.aggregateCellRankMerge(calced, cellInfo);
    reply(id, { ok: true, type: req.type, datas });
  }).catch((e) => {
    replyError({ id, req }, e)
  })
}

function aggregateShipDrop(id: number, req: ReqAggregateShipDrop) {
  checkDbStuff(dbStuff)
  console.log('aggregateShipDrop threadId:', threadId, 'id:', id, 
    'currentProcessingId:', processingAggregateShipDropId, 'req:', req)
  processingAggregateShipDropId = id;

  async function fetchByMapId(shipId: number, mapId: number): Promise<AggregatedCellShipDrop[]> {

    return new Promise<AggregatedCellShipDrop[]>((resolve, reject) => {
      checkDbStuff(dbStuff)

      const query: DropRecordQuery = {
        dbName: DbName.drop,
        find: {
          mapId: mapId,
          rank: { $in: ['S', 'A', 'B'] }
        },
        projection: {
          shipId: 1,
          mapId: 1,
          cellId: 1,
          mapLv: 1,
          rank: 1,
          count: 1,
          isBoss: 1,
        }
      };
      dbStuff.query(query).then((records: DropRecord[]) => {

        if (processingAggregateShipDropId !== id) {
          console.log('aggregateShipDrop cancelled(by mapid). threadId:', threadId, 'id:', id, 
            'currentProcessingId:', processingAggregateShipDropId);
          resolve([]);
          return;
        }

        if (records.length === 0) {
          resolve([]);
          return;
        }
        const { areaId, areaNo } = recordMapIdToIdNo(mapId);
        const cellInfo = MapStuff.cellInfo(areaId, areaNo);
        if (! cellInfo.spots.length) {
          reject(new Error('No spots info found for map_id:' + mapId + ' area_no:' + areaNo));
        }

        const cellDrops = RecordCalculator.aggregateShipDropByMapId(records, shipId);
        resolve(RecordCalculator.aggregateShipDropByMapIdMerge(cellDrops, cellInfo))
      }).catch((err) => {
        console.error('error fetching drop records for mapId:', mapId, err)
        reject(err);
      });
    })
  }

  async function fetchByMapIds(shipId: number, mapIds: number[]): Promise<AggregatedCellShipDrop[]> {

    // 以下は処理負荷の観点から使用しないこと
    // 全マップでqueryが走ってしまい、途中キャンセルが効かないため
    //
    // 各マップごとにqueryする形に変更している

    // const tasks: Promise<AggregatedCellShipDrop[]>[] = [];
    // mapIds.forEach((mapId) => {
    //   // 各マップごとに集計する
    //   // 全マップ集計ではドロップ数によりメモリ使用量が膨れ上がる恐れがあるため
    //   tasks.push(fetchByMapId(shipId, mapId))
    // });
    // return new Promise<AggregatedCellShipDrop[]>((resolve, reject) => {
    //   Promise.all(tasks).then((results) => {

    //     if (processingAggregateShipDropId !== id) {
    //       console.log('aggregateShipDrop cancelled(by mapids). threadId:', threadId, 'id:', id, 
    //         'currentProcessingId:', processingAggregateShipDropId);
    //       resolve([]);
    //       return;
    //     }

    //     let ret: AggregatedCellShipDrop[] = [];
    //     results.forEach((datas) => {
    //       ret = ret.concat(datas);
    //     });
    //     resolve(ret);
    //   }).catch((err) => {
    //     console.error('error fetching drop records for ship id:', shipId, err);
    //     reject(err);
    //   });
    // })

    return new Promise<AggregatedCellShipDrop[]>(async (resolve, reject) => {
      try {
        let ret: AggregatedCellShipDrop[] = [];
        // 各マップごとに集計する
        // 全マップ集計ではドロップ数によりメモリ使用量が膨れ上がる恐れがあるため
        let index = 0;
        while(index < mapIds.length) {
          console.log('>> aggregateShipDrop processing map index:', index, 'of', mapIds.length, 'shipId:', shipId);
          const datas =  await fetchByMapId(shipId, mapIds[index++]);
          console.log('<< aggregateShipDrop processing map index:', index, 'of', mapIds.length, 'shipId:', shipId);
          if (processingAggregateShipDropId !== id) {
            console.log('aggregateShipDrop cancelled(by mapids). threadId:', threadId, 'id:', id, 
              'currentProcessingId:', processingAggregateShipDropId);
            resolve([]);
            return;
          }
          ret = ret.concat(datas);
        }
        resolve(ret);
      } catch (err) {
        console.error('error fetching drop records for ship id:', shipId, err);
        reject(err);
      }
    });
  }

  async function fetchDropMapIds(shipId: number): Promise<number[]> {
    return new Promise<number[]>((resolve, reject) => {
      checkDbStuff(dbStuff)

      const query: DropRecordQuery = {
        dbName: DbName.drop,
        find: {
          shipId: shipId,
          rank: { $in: ['S', 'A', 'B'] }
        },
        projection: {
          mapId: 1,
          cellId: 1,
        },
        sort: {
          mapId: 1,
          cellId: 1,
        }
      };

      console.time('drop record shipid for mapid query time:'+shipId);
      dbStuff.query(query).then((records: DropRecord[]) => {
        console.timeEnd('drop record shipid for mapid query time:'+shipId);
        const mapIds = [...new Set(records.map((rec) => rec.mapId))];
        console.log('drop mapid record queried. record count:', mapIds, 'for ship id:', shipId);
        resolve(mapIds);
      }).catch((err) => {
        console.error('error querying drop mapid for ship id:', shipId, err);
        reject(err);
      });
    })
  }

  // query drop map id
  fetchDropMapIds(req.ship_id).then((mapIds) => {
    console.log('drop ship map ids fetched for ship id:', req.ship_id, 'mapIds:', mapIds);

    if (processingAggregateShipDropId !== id) {
      console.log('aggregateShipDrop cancelled(mapids return). threadId:', threadId, 'id:', id, 
        'currentProcessingId:', processingAggregateShipDropId);
      reply(id, { ok: true, type: req.type, datas: [] });
      return;
    }

    // fetch drop records for each map id
    fetchByMapIds(req.ship_id, mapIds).then((datas) => {
      console.log('drop ship records fetched. count:', datas.length, 'for ship id:', req.ship_id);

      if (processingAggregateShipDropId !== id) {
        console.log('aggregateShipDrop cancelled(drops return). threadId:', threadId, 'id:', id, 
          'currentProcessingId:', processingAggregateShipDropId);
        reply(id, { ok: true, type: req.type, datas: [] });
        return;
      }

      reply(id, { ok: true, type: req.type, datas });
    }).catch((err) => {
      replyError({ id, req }, err)
    });
  }).catch((err) => {
    replyError({ id, req }, err)
  });
}

// イベント駆動処理
parentPort.on('message', async (msg: ReqMsg) => {
  const req = msg.req
  const type = req.type
  console.log('worker received(tid:'+threadId+'): type:', req.type, 'msgId:', msg.id, 
    'dbName:', findOne(req, ['dbs', 'dbName']))
  try {
    switch (type) {
      case 'shutdown': shutdown(msg.id, req); break
      case 'db:init': dbInit(msg.id, req); break
      case 'db:insert': dbInsert(msg.id, req); break        
      case 'db:query': dbQuery(msg.id, req); break
      case 'db:queryOne': dbQueryOne(msg.id, req); break
      case 'db:update': dbUpdate(msg.id, req); break      
      case 'db:remove': dbRemove(msg.id, req); break
      case 'db:operation': dbOperation(msg.id, req); break
      case 'calc:portChartData': calcPortChartData(msg.id, req); break
      case 'aggregate:rankByArea': aggregateRankByArea(msg.id, req); break
      case 'aggregate:shipDrop': aggregateShipDrop(msg.id, req); break
      default:
        throw new Error(`Unknown request type: ${type}`)
    }
  } catch (e: any) {
    replyError(msg, e)
  }
})
