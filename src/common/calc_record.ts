import { DropRecord, isIgnoreDropRecord, recordMapIdToIdNo } from "@common/record";
import { CellInfo, CellInfoUtil } from "@common/map";
import { 
  ApiShipType, 
  ApiShipTypeHojoClasses, 
  ApiShipTypeJyujyunClasses, 
  ApiShipTypeKaiboukanClasses, 
  ApiShipTypeKeijyunClasses, 
  ApiShipTypeKuboClasses, 
  ApiShipTypeKutikukanClasses, 
  ApiShipTypeSenkanClasses, 
  ApiShipTypeSensuikanClasses, 
  MapLv, 
  MstShip, 
  SvData, 
} from "@common/kcs";

/**
 * セルごとのドロップ集計データ
 */
export type CellRankCounts = [number, number, number, number, number, number];
export const CellRankCountIndex = {
  S: 0,
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
} as const;
export type CellRankCountIndex = typeof CellRankCountIndex[keyof typeof CellRankCountIndex];
export interface AggregatedCellRank {
  cell_no: number
  counts: CellRankCounts
}
// export interface AggregatedCellDrop {
//   cell_no: number
//   counts: CellDropCounts
// }


/**
 * 艦船ごとのドロップ集計データ
 */
export const RankDropCountIndex = {
  S: 0,
  A: 1,
  B: 2,
} as const;
type RankDropCountIndex = typeof RankDropCountIndex[keyof typeof RankDropCountIndex];
export type RankDropCounts = [number, number, number];
export interface AggregatedShipDrop {
  shipId: number; // -1:ドロップ無し
  counts: RankDropCounts;
}

/**
 * セルでの艦船ごとのドロップ集計データ
 */
export interface AggregatedCellShipDrop {
  areaId: number;
  areaNo: number;
  mapLv: MapLv;
  cellNo: number;
  cellLabel?: string;
  isBoss: boolean;
  counts: RankDropCounts;
  totalCount: number
}

/**
 * 
 */
export const AggregateShipType = {
  nodrop: -1, // ドロップなし
  unknown: 0, // 不明
  senkan: 1, // 戦艦級
  kubo: 2, // 空母級
  jyujyun: 3, // 重巡級
  keijyun: 4, // 軽巡級
  kutikukan: 5, // 駆逐艦
  kaiboukan: 6, // 海防艦
  sensuikan: 7, // 潜水艦
  hojo: 8, // 補助
} as const;
export type AggregateShipType = (typeof AggregateShipType)[keyof typeof AggregateShipType]

/**
 * 
 */
export const AggregateShipTypes: { type: AggregateShipType, apiTypes: ApiShipType[] }[] = [
  {
    type: AggregateShipType.senkan,
    apiTypes: ApiShipTypeSenkanClasses
  },
  {
    type: AggregateShipType.kubo,
    apiTypes: ApiShipTypeKuboClasses
  },
  {
    type: AggregateShipType.jyujyun,
    apiTypes: ApiShipTypeJyujyunClasses
  },
  {
    type: AggregateShipType.keijyun,
    apiTypes: ApiShipTypeKeijyunClasses
  },
  {
    type: AggregateShipType.kutikukan,
    apiTypes: ApiShipTypeKutikukanClasses
  },
  {
    type: AggregateShipType.kaiboukan,
    apiTypes: ApiShipTypeKaiboukanClasses
  },
  {
    type: AggregateShipType.sensuikan,
    apiTypes: ApiShipTypeSensuikanClasses
  },
  {
    type: AggregateShipType.hojo,
    apiTypes: ApiShipTypeHojoClasses
  }
] as const

/**
 * 艦種ごとのドロップ集計データ
 */
export interface AggregatedShipTypeDrop {
  type: AggregateShipType;
  counts: RankDropCounts;
}


/**
 * 月に対する日付配列を取得
 * 
 * @param year 
 * @param month 1〜12
 * @returns 
 */
export function localDatesInMonth(year: number, month: number): Date[] {
  // 指定した月の末日を取得 (monthは0起算、3個目の引数に0を入れると前月の末日)
  const endDate = new Date(year, month, 0);
  const daysCount = endDate.getDate();

  // 日数分ループして配列を作成
  return Array.from({ length: daysCount }, (_, i) => {
    return new Date(year, month - 1, i + 1);
  });
}

/**
 * レコード集計クラス
 */
export class RecordCalculator {

  /**
   * 
   * @param rank 
   * @returns 
   */
  static toCellRankCountIndex(rank: string): CellRankCountIndex | undefined {
    if (rank === 'S') return CellRankCountIndex.S;
    if (rank === 'A') return CellRankCountIndex.A;
    if (rank === 'B') return CellRankCountIndex.B;
    if (rank === 'C') return CellRankCountIndex.C;
    if (rank === 'D') return CellRankCountIndex.D;
    if (rank === 'E') return CellRankCountIndex.E;
    return
  }

  /**
   * 
   * @param rank 
   * @returns 
   */
  static toRankDropCountIndex(rank: string): RankDropCountIndex | undefined {
    if (rank === 'S') return RankDropCountIndex.S;
    if (rank === 'A') return RankDropCountIndex.A;
    if (rank === 'B') return RankDropCountIndex.B;
    return
  }

  /**
   * 1つのセルについてのドロップ集計
   * 
   * @param records 
   * @returns 
   */
  static aggregateShipDrop(records: DropRecord[]): AggregatedShipDrop[] {
    // map shipId => counts
    const calced = new Map<number, RankDropCounts>()
    records.forEach((record) => {

      // 以下は集計対象としない
      // 例：母港max、装備max
      if (isIgnoreDropRecord(record)) {
        return
      }

      const rankIndex = RecordCalculator.toRankDropCountIndex(record.rank)
      if (rankIndex === undefined) {
        return
      }
      const finded = calced.get(record.shipId)
      if (finded) {
        finded[rankIndex] += 1
      } else {
        const counts: RankDropCounts = [0,0,0]
        counts[rankIndex] = 1        
        calced.set(record.shipId, counts)
      }
    })

    // to array
    const ret: AggregatedShipDrop[] = []
    calced.forEach((counts, shipId) => {
      ret.push({ shipId, counts})
    })
    return ret;
  }

  /**
   * 
   * @param records 
   * @returns 
   */
  static aggregateCellRank(records: DropRecord[]): AggregatedCellRank[] {  
    // map cell_no => counts
    const calced: Map<number, Pick<AggregatedCellRank, 'counts'>> = new Map();

    // set rank count stuff
    const setRankCount = (rec: DropRecord, counts: CellRankCounts) => {
      const rankIndex = RecordCalculator.toCellRankCountIndex(rec.rank);
      if (rankIndex !== undefined) {
        counts[rankIndex] += 1;
      }
    };

    // aggregate
    records.forEach((record) => {

      // 以下は集計対象としない
      // 例：母港max、装備max
      if (isIgnoreDropRecord(record)) {
        return
      }

      const data = calced.get(record.cellId);
      if (data) {
        setRankCount(record, data.counts);
      } else {
        const counts: CellRankCounts = [0, 0, 0, 0, 0, 0];
        setRankCount(record, counts);
        calced.set(record.cellId, { counts })
      }
    });

    // to array
    const datas: AggregatedCellRank[] = [];
    calced.forEach((value, cell_no) => {
      if (value.counts.some((c) => c > 0)) {
        datas.push({ cell_no, counts: value.counts });
      }
    })
    datas.sort((a, b) => a.cell_no - b.cell_no);
    return datas;
  }
  
  /**
   * 
   * @param calced 
   * @param cellInfo 
   * @returns 
   */
  static aggregateCellRankMerge(drops: AggregatedCellRank[], cellInfo: CellInfo): AggregatedCellRank[] {  

    if (drops.length === 0) {
      return [];
    }

    // get same spot map
    const sameSpots = CellInfoUtil.getSameSpotMap(cellInfo);

    // find same spot no
    const findSpotNo = (cellNo: number): number | undefined => {
      for (const [key, value] of sameSpots) {
        if (value.includes(cellNo)) {
          return key;
        }
      }
      return ;
    }

    // merge
    // map cell_no => counts
    const merged: Map<number, Pick<AggregatedCellRank, 'counts'>> = new Map();
    drops.forEach((drop) => {
      const spotNo = findSpotNo(drop.cell_no);
      if (! spotNo) {
        console.warn('No cell info spot found for cell_no:', drop.cell_no);
        return ;
      }
      const found = merged.get(spotNo);
      if (! found) {
        merged.set(spotNo, { counts: [...drop.counts] });
      } else {
        for (let i = 0; i < drop.counts.length; i++) {
          found.counts[i] += drop.counts[i];
        }
      }
    })

    // return merged
    const datas: AggregatedCellRank[] = [];
    merged.forEach((value, cell_no) => {
      datas.push({ cell_no, counts: value.counts });
    })
    datas.sort((a, b) => a.cell_no - b.cell_no);
    return datas;
  }

  /**
   * 
   * @param records 
   * @param shipId 
   * @returns 
   */
  static aggregateShipDropByMapId(records: DropRecord[], shipId: number): AggregatedCellShipDrop[] {  

    // no records
    if (records.length === 0) {
      return [];
    }

    // cell counts
    type CellCounts = { 
      counts: RankDropCounts, 
      total: number, 
      isBoss: boolean
    };

    // map: cell_no => shipId counts
    const cellIdMap: Map<number, CellCounts> = new Map();

    // 
    const addDropCount = (rec: DropRecord, counts: RankDropCounts) => {
      const index = RecordCalculator.toRankDropCountIndex(rec.rank);
      if (index !== undefined) {
        counts[index] += 1;
      }
    };

    //
    const addCellCount = (record: DropRecord, shipId: number, cellCounts: CellCounts) => {
      cellCounts.total += 1;
      if (record.shipId === shipId) {
        addDropCount(record, cellCounts.counts);
      }
    }

    // aggregate
    records.forEach((record) => {

      // 以下は集計対象としない
      // 例：母港max、装備max
      if (isIgnoreDropRecord(record)) {
        return
      }

      const data  = cellIdMap.get(record.cellId);
      if (data) {
        addCellCount(record, shipId, data);
      } else {
        const counts: RankDropCounts = [0, 0, 0];
        const isBoss = record.isBoss;
        const cellCounts: CellCounts = { counts, total: 0, isBoss };
        addCellCount(record, shipId, cellCounts);
        cellIdMap.set(record.cellId, cellCounts);
      }
    });

    const { areaId, areaNo } = recordMapIdToIdNo(records[0].mapId);
    const datas: AggregatedCellShipDrop[] = [];
    cellIdMap.forEach((cellCounts, cellNo) => {
      if (cellCounts.total > 0) {
        datas.push({
          areaId,
          areaNo,
          mapLv: records[0].mapLv,
          cellNo,
          isBoss: cellCounts.isBoss,
          counts: cellCounts.counts,
          totalCount: cellCounts.total
        });
      }
    })
    datas.sort((a, b) => a.cellNo - b.cellNo);
    return datas;
  }

  /**
   * 
   * @param drops 
   * @param cellInfo 
   */
  static aggregateShipDropByMapIdMerge(
    drops: AggregatedCellShipDrop[], cellInfo: CellInfo): AggregatedCellShipDrop[] {

    if (drops.length === 0) {
      return [];
    }

    // get same spot map
    const sameSpots = CellInfoUtil.getSameSpotMap(cellInfo);

    // find same spot no
    const findSpotNo = (cellNo: number): number | undefined => {
      for (const [key, value] of sameSpots) {
        if (value.includes(cellNo)) {
          return key;
        }
      }
      return ;
    }

    // merge
    // map cell_no => counts
    const merged: Map<number, AggregatedCellShipDrop> = new Map();
    drops.forEach((drop) => {
      const spotNo = findSpotNo(drop.cellNo);
      if (! spotNo) {
        console.warn('No cell info spot found for cell_no:', drop.cellNo);
        return ;
      }
      const found = merged.get(spotNo);
      if (! found) {
        merged.set(spotNo, { ...drop } );
      } else {
        for (let i = 0; i < drop.counts.length; i++) {
          found.counts[i] += drop.counts[i];
        }
        found.totalCount += drop.totalCount;
        //console.log('Merging drop for spotNo:', spotNo, 'new totalCount:', found.totalCount, drop);
      }
    })

    const findSpotLabel = (cellNo: number): string | undefined => {
      const spot = cellInfo.spots.find((s) => s.no === cellNo);
      if (spot && spot.label) {
        return spot.label;
      }
      for (const [key, value] of sameSpots) {
        if (value.includes(cellNo)) {
          const spot = cellInfo.spots.find((s) => s.no === key);
          if (spot && spot.label) {
            return spot.label;
          }
        }
      }
      return 
    }

    // return merged
    const datas: AggregatedCellShipDrop[] = [];
    merged.forEach((value) => {
      if (value.counts.some((c) => c > 0)) {
        const cellLabel = findSpotLabel(value.cellNo);
        datas.push({...value, cellLabel});
      }
    })
    datas.sort((a, b) => a.cellNo - b.cellNo);
    return datas;
  }

  /**
   * 
   * @param records 
   * @param svdata 
   * @returns 
   */
  static aggregateShipTypeDropOld(records: DropRecord[], svdata: SvData): AggregatedShipTypeDrop[]{
    const totals = new Map<AggregateShipType, RankDropCounts>();
    const types = Object.entries(AggregateShipType)
    types.forEach(([_, type]) => {
      totals.set(type, [0, 0, 0]);
    })

    // 
    const addCount = (type: AggregateShipType, rank: string) => {
      const counts = totals.get(type);
      if (counts) {
        const index = RecordCalculator.toRankDropCountIndex(rank);
        if (index !== undefined) {
          counts[index] += 1;
        }
      }
    };

    records.forEach(record => {

      // 以下は集計対象としない
      // 例：母港max、装備max
      if (isIgnoreDropRecord(record)) {
        return
      }

      if (record.shipId === -1) {
        const el = totals.get(AggregateShipType.nodrop);
        if (el) {
          addCount(AggregateShipType.nodrop, record.rank);
        }
        return;
      }

      const mst = svdata.mstShip(record.shipId);
      const stype = mst?.api_stype;
      if (stype === undefined) {
        addCount(AggregateShipType.unknown, record.rank);
        return;
      }

      const finded = AggregateShipTypes.find(({ apiTypes }) => apiTypes.includes(stype));
      if (finded) {
        addCount(finded.type, record.rank);
      } else {
        addCount(AggregateShipType.unknown, record.rank);
      }
    });

    
    const results: AggregatedShipTypeDrop[] = [];
    totals.forEach((counts, type) => {
      const sum = counts.reduce((a, b) => a + b, 0);
      if (sum) {
        results.push({ type, counts });
      }
    });
    results.sort((el1, el2) => {
      const sum1 = el1.counts.reduce((a, b) => a + b, 0);
      const sum2 = el2.counts.reduce((a, b) => a + b, 0);
      return (sum2 - sum1);
    });
    return results;
  }

  /**
   * 
   * @param records 
   * @param svdata 
   * @returns 
   */
  static aggregateShipTypeDrop(shipDrops: AggregatedShipDrop[], svdata: SvData): AggregatedShipTypeDrop[]{
    const totals = new Map<AggregateShipType, RankDropCounts>();
    const types = Object.entries(AggregateShipType)
    types.forEach(([_, type]) => {
      totals.set(type, [0, 0, 0]);
    })

    // 
    const addCount = (type: AggregateShipType, addCounts: RankDropCounts) => {
      const counts = totals.get(type);
      if (counts) {
        for (let rank = 0; rank < addCounts.length; rank++) {
          counts[rank] += addCounts[rank];
        }
      }
    };

    shipDrops.forEach(drop => {

      if (drop.shipId === -1) {
        const el = totals.get(AggregateShipType.nodrop);
        if (el) {
          addCount(AggregateShipType.nodrop, drop.counts);
        }
        return;
      }

      const mst = svdata.mstShip(drop.shipId);
      const stype = mst?.api_stype;
      if (stype === undefined) {
        addCount(AggregateShipType.unknown, drop.counts);
        return;
      }

      const finded = AggregateShipTypes.find(({ apiTypes }) => apiTypes.includes(stype));
      if (finded) {
        addCount(finded.type, drop.counts);
      } else {
        addCount(AggregateShipType.unknown, drop.counts);
      }
    });

    
    const results: AggregatedShipTypeDrop[] = [];
    totals.forEach((counts, type) => {
      const sum = counts.reduce((a, b) => a + b, 0);
      if (sum) {
        results.push({ type, counts });
      }
    });
    results.sort((el1, el2) => {
      const sum1 = el1.counts.reduce((a, b) => a + b, 0);
      const sum2 = el2.counts.reduce((a, b) => a + b, 0);
      return (sum2 - sum1);
    });
    return results;
  }

  /**
   * 
   * @param mst 
   * @param type 
   * @returns 
   */
  static isType(mst: MstShip, type: AggregateShipType): boolean {
    const types = AggregateShipTypes.find(({ type: t }) => t === type);
    return !!types && types.apiTypes.includes(mst.api_stype);
  }

  /**
   * 
   * @param mst 
   * @returns 
   */
  static getAggregateShipType(mst: MstShip): AggregateShipType | undefined{
    for (const entry of AggregateShipTypes) {
      if (entry.apiTypes.includes(mst.api_stype)) {
        return entry.type;
      }
    }
    return ;
  }
}

