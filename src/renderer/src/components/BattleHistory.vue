<script setup lang="ts">
import type { AreaItemGetInfo, BattleRecord, BattleRecordQuery, ShipInfoRecord, SlotitemInfo } from '@common/record'
import { DbName, isBattleRecordItemGet, recordMapIdToIdNo, toRecordDate, toRecordMapId } from '@common/record'
import { areaNames, getAreaName, getEventPeriodName } from '@common/area_name'
import { ApiEventId, ApiItemId, KcsUtil } from '@common/kcs'
import { getAirSearchResultText, MapLvText } from '@common/locale'
import BattleHistoryArea from '@renderer/components/BattleHistoryArea.vue'
import { svdata } from '@renderer/store/svdata'
import { computed, nextTick, onMounted, onUnmounted, ref, toRaw, watch } from 'vue'
import { BattleAreaInfo } from '@renderer/common/battle-area'
import { CellInfo, CommonMap } from '@common/map'
import { mapInfoCache } from '@renderer/common/mapinfo'
import * as sesStorage from '@renderer/store/ses-storage'
import ShipBanner from '@renderer/components/ShipBanner.vue'
import SlotItemForRecord from './SlotItemForRecord.vue'
import ReportsImage from '@assets/img/reports.svg'
import { SessionStorageKeyName } from '@renderer/store/storage_key'
const abortController = new AbortController();
const ROW_ID_PREFIX = 'row-'
const DETAIL_ROW_ID_PREFIX = 'detailRow-'
let _selectionObserver: MutationObserver | null = null;
const tableEl = ref<HTMLElement | null>(null);
let _tableHeaderHeight = 0;
const isSearching = ref(true);
const isInitial = ref(true);

/////////////////////////////////////////////////////////////////////////////////////
// 
function scrollSelectedIntoView(): void {
  const wrapper = tableEl.value?.querySelector('.b-table .table-wrapper') as HTMLElement | null;
  if (!wrapper) {
    console.log('table wrapper not found for scrollSelectedIntoView');
    return;
  }
  const selected = wrapper.querySelector('tr.is-selected') as HTMLElement | null;
  if (!selected) {
    console.log('no selected row for scrollSelectedIntoView');
    return;
  }

  const wrapperRect = wrapper.getBoundingClientRect();
  const elemRect = selected.getBoundingClientRect();

  // sticky header の高さを取得
  if (! _tableHeaderHeight) {
    const tableRoot = wrapper.closest('.b-table') as HTMLElement | null;
    if (tableRoot) {
      const thead = tableRoot.querySelector('thead') as HTMLElement | null;
      if (thead) {
        const theadRect = thead.getBoundingClientRect();
        _tableHeaderHeight = Math.max(0, theadRect.bottom - wrapperRect.top);
      }
    }
  }

  // 選択要素が上部に表示しきれていない場合
  const detailHeight = 24.48 + 21.66
  const checkTop = wrapperRect.top + _tableHeaderHeight;
  if (elemRect.top < checkTop) {
    // 選択要素の上端が見えるようにスクロール位置を調整
    // 以下は行わない、画面全体がスクロールされてしまう
    // scrollIntoViewの仕様による
    //   selected.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'auto' });
    const targetScrollTop = wrapper.scrollTop + (elemRect.top - wrapperRect.top) - _tableHeaderHeight;
    wrapper.scrollTo({ top: targetScrollTop, behavior: 'auto' });
    

  } else if ((elemRect.bottom + detailHeight) > wrapperRect.bottom) {
    //selected.scrollIntoView({ block: 'end', inline: 'nearest', behavior: 'auto' });
    selected.nextElementSibling?.scrollIntoView({ block: 'end', inline: 'nearest', behavior: 'auto' });
  }
}

interface AreaItemInfo extends AreaItemGetInfo {
  showAirSearchResult: boolean;
  bossLose?: boolean;
  airsearchResult?: number;
}

interface Used {
  fuel: number;
  bull: number;
  buxite?: number;
}

interface BattleTableData {
  detailKey: string;
  header: BattleRecord;
  records: BattleRecord[];
  used: Used;
  areaGetItems: AreaItemInfo[];
  isGetSucceeded: boolean;
  isAccent?: boolean;
}

const datas = ref<BattleTableData[]>([])
const selected = ref<BattleTableData | null>(null)
const battleAreaInfo = ref<BattleAreaInfo | null>(null);
const showReports = ref(
  sesStorage.getBoolean(SessionStorageKeyName.BattleHistoryShowReports) ?? true
);
const openDetailedDatas = computed(() => {
  return datas.value.map((data => data.header.uuid))
});

const filterMapId = ref<number | null>(null);
const filterLimit = ref<number>(40);
const filterStartMinDate = ref<Date | null>(null);
const filterStartDate = ref<Date | null>(null);
const filterEndDate = ref<Date | null>(null);

const yearHolder = () => {
  const year = ref(new Date().getFullYear());
  const isYearMin = computed((): boolean => {
    if (! filterStartMinDate.value) {
      return false;
    }
    return year.value === filterStartMinDate.value.getFullYear()
  })
  const isYearMax = computed((): boolean => {
    return year.value === new Date().getFullYear();
  })
  return { year, isYearMin, isYearMax };
}
const { year: filterStartYear, isYearMin: isStartYearMin, isYearMax: isStartYearMax } =
  yearHolder();
const { year: filterEndYear, isYearMin: isEndYearMin, isYearMax: isEndYearMax } =
  yearHolder();

const filterMapIdPlaceholder = '海域を選択'

interface AreaOption {
  value: number;
  label: string;
}

const mapAreaOptions = ref<AreaOption[]>(getAreaOptions());
const countOptions = [1, 10, 20, 40, 80, 100, 200, 400, 800, 1000, 2000, 3000, 4000];

function onFilterSearch(): void {
  search();
}

function onFilterClear(): void {
  filterMapId.value = null;
  filterLimit.value = 40;
  filterStartDate.value = null;
  filterEndDate.value = null;
}

function setAccent(row: BattleTableData | null, rowOld: BattleTableData | null): void {
  if (row === rowOld) {
    return;
  }

  const findRow = (el: HTMLElement | null): HTMLElement | null => {
    if (!el) {
      return null;
    }
    if (el.tagName === 'TR') {
      return el;
    }
    return findRow(el.parentElement);
  };

  const findDetailRow = (el: HTMLElement | null): HTMLElement | null => {
    if (!el) {
      return null;
    }
    if (el.classList.contains('detail')) {
      return el;
    }
    return findDetailRow(el.parentElement);
  };

  const setRowAccent = (row: BattleTableData, set: boolean) => {
    const el = findRow(document.querySelector('span#'+ROW_ID_PREFIX+row.detailKey))
    if (el) {
      const cls = 'is-accent';
      if (set) {
        el.classList.add(cls);
      } else {
        el.classList.remove(cls);
      }
    }
  };

  const setDetailRowAccent = (row: BattleTableData, set: boolean) => {
    const el = findDetailRow(document.querySelector('div#'+DETAIL_ROW_ID_PREFIX+row.detailKey))
    if (el) {
      const cls = 'is-accent';
      if (set) {
        el.classList.add(cls);
      } else {
        el.classList.remove(cls);
      }
    }
  };

  if (rowOld) {
    setRowAccent(rowOld, false);
    setDetailRowAccent(rowOld, false);
  }
  if (row) {
    setRowAccent(row, true);
    setDetailRowAccent(row, true);
  }
}

function onSelect(row: BattleTableData | null, _rowOld: BattleTableData | null): void {
  console.log('onSelect called', toRaw(row), toRaw(selected.value));
  //setAccent(row, _rowOld);
}

function onDetailClick(row: BattleTableData): void {
  console.log('BattleHistory onDetailClick called', toRaw(row));
  selected.value = datas.value.find((data) => data.detailKey === row.detailKey) || null;
}

/////////////////////////////////////////////////////////////////////////////////////
// 消費計算
class UsedCalculator {

  static calcLvRatio(lv: number, used: Used) : Used {
    const lvRate = lv >= 100 ? 0.85 : 1.0;
    let fuel = Math.floor(used.fuel * lvRate);
    let bull = Math.floor(used.bull * lvRate);
    if (fuel < 1) {
      fuel = 1;
    }
    if (bull < 1) {
      bull = 1;
    }
    return { fuel, bull, buxite: used.buxite };
  }

  // 以降レコードから計算することで不要に

  // // 20%消費基準での割合
  // static getFualRate(record: BattleRecord): number {
  //   if (! record.middayJson && record.midnightJson) {
  //     // 開幕夜戦
  //     return 0.5;
  //   }
  //   if (record.middayJson && record.midnightJson) {
  //     // 昼夜戦
  //     return 1.0;
  //   }
  //   // 昼戦
  //   return 1.0;
  // }

  // // 20%消費基準での割合
  // static getBullRate(record: BattleRecord): number {
  //   if (! record.middayJson && record.midnightJson) {
  //     // 開幕夜戦
  //     return 0.5;
  //   }
  //   if (record.middayJson && record.midnightJson) {
  //     // 昼夜戦
  //     return 1.5;
  //   }
  //   // 昼戦
  //   return 1.0;
  // }

  // static calcShipUse(ship: ShipInfoRecord): { useFual: number; useBull: number } {
  //   const mstId = ship.shipId;
  //   const mst = svdata.mstShip(mstId);
  //   if (mst) {
  //     return UseCalculator.calcUse(ship, { fual: ship.fuel, bull: ship.bull });
  //   }
  //   return { useFual: Number.NaN, useBull: Number.NaN };
  // }

  // static calcShipBattleUse(record: BattleRecord, ship: ShipInfoRecord): { useFual: number; useBull: number } {
  //   const mstId = ship.shipId;
  //   const mst = svdata.mstShip(mstId);
  //   if (mst) {
  //     const unitFual = mst.api_fuel_max / 5;
  //     const unitBull = mst.api_bull_max / 5 ;
  //     const lastFual = ship.fuel - Math.round(unitFual * UseCalculator.getFualRate(record))
  //     const lastBull = ship.bull - Math.round(unitBull * UseCalculator.getBullRate(record))
  //     return UseCalculator.calcUse(ship, { fual: lastFual, bull: lastBull });
  //   }
  //   return { useFual: Number.NaN, useBull: Number.NaN };
  // }
}

/////////////////////////////////////////////////////////////////////////////////////
// 
function calcUsed(records: BattleRecord[]): Used {

  if (records.length < 2) {
    return { fuel: NaN, bull: NaN };
  }
  // 母校戻り時のレコードから計算する
  const recordPort = records.find((rec) => rec.portReturn)
  if (! recordPort) {
    return { fuel: NaN, bull: NaN };
  }
  const recordBegin = records[0];
  return recordBegin.ships1.reduce<Used>((acc, ship) => {
    const shipPort = recordPort.ships1.find((s) => s.shipId === ship.shipId);
    if (! shipPort) {
      acc.fuel = NaN;
      acc.bull = NaN;
      return acc;
    }

    const used: Used = UsedCalculator.calcLvRatio(ship.lv, {
      fuel: ship.fuel - shipPort.fuel,
      bull: ship.bull - shipPort.bull,
    });
    acc.fuel += used.fuel
    acc.bull += used.bull

    // buxite
    if (ship.onslot.some(onslot => onslot > 0)) {
      
      ship.onslot.forEach((onslot, index) => {
        const onslotPort = shipPort.onslot[index];
        if (onslotPort !== undefined) {
          // check onslot
          const mst = svdata.mstSlotitem(ship.slotitem[index]?.slotitem_id ?? -1);
          if (mst && KcsUtil.hasOnSlot(KcsUtil.slotitemType(mst))) {
            const buxite = (onslot - onslotPort) * 5
            if (acc.buxite === undefined) {
              acc.buxite = 0;
            }
            acc.buxite += buxite;
          }
        }
      })
    }
    return acc;
  }, { fuel: 0, bull: 0 });
}

function toTableData(records: BattleRecord[]): BattleTableData[] {
  const grouped = new Map<string, BattleRecord[]>()
  records.forEach((record) => {
    const key = record.uuid
    const arr = grouped.get(key)
    if (arr) arr.push(record)
    else grouped.set(key, [record])
  })

  const localDatas: BattleTableData[] = []
  grouped.forEach((records) => {
    records.sort((a, b) => a.index - b.index)
    const areaGetItems = getAreaItemGetInfos(records);
    const header = records[0]

    // 6-3: ボス勝利以外アイテム取得はカウントしない
    let isGetSucceeded = true;
    if (header.mapId === toRecordMapId(6, 3)) {
      const bossRecord = records.find((rec) => rec.isBoss);
      if (! bossRecord) {
        isGetSucceeded = false;
      } else if (! KcsUtil.isVictory(bossRecord.rank)) {
        isGetSucceeded = false;
      }
    }
    if (! isGetSucceeded) {
      areaGetItems.forEach((item) => {
        item.bossLose = true;
      })
    }

    localDatas.push({
      detailKey: header.uuid,
      header,
      records: records,
      used: calcUsed(records),
      areaGetItems,
      isGetSucceeded,
    })
  })
  localDatas.sort((a, b) => a.header.date < b.header.date ? 1 : -1)
  return localDatas;
}

async function fetchRecentRecords(): Promise<BattleRecord[]> {
  return new Promise<BattleRecord[]>((resolve, reject) => {
    let mapId: number | undefined
    let minDate: string | undefined
    let maxDate: string | undefined

    if (filterMapId.value !== null) {
      mapId = filterMapId.value
    }
    if (filterStartDate.value) {
      const date = filterStartDate.value
      const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      minDate = toRecordDate(startDate)
    }
    if (filterEndDate.value) {
      const date = filterEndDate.value
      const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
      maxDate = toRecordDate(endDate)
    }    

    const query = {
      dbName: DbName.battle,
      sort: { date: -1 },
      limit: filterLimit.value*10,
      find: { }
    }
    if (mapId !== undefined) {
      (query.find as any).mapId = mapId;
    }
    if (minDate !== undefined || maxDate !== undefined) {
      (query.find as any).date = {};
      if (minDate !== undefined) {
        (query.find as any).date.$gte = minDate;
      }
      if (maxDate !== undefined) {
        (query.find as any).date.$lte = maxDate;
      }
    }

    window.api.queryDb(query).then((queryReturn) => {
      const records = queryReturn as BattleRecord[]
      resolve(records);
    }).catch((err) => {
      reject(err);
    })
  });
}

async function fetchCellInfo(datas: BattleTableData[]): Promise<CellInfo[]> {
  const tasks: Promise<CellInfo>[] = [];
  const queries = new Set<number>();
  datas.forEach((data) => {
    data.records.forEach((record) => {
      if (queries.has(record.mapId)) {
        return;
      }
      const { areaId, areaNo } = recordMapIdToIdNo(record.mapId);
      tasks.push(mapInfoCache.get(areaId, areaNo));
      queries.add(record.mapId);
    })
  });
  return Promise.all(tasks);
}

async function fetchFirstBattleDate(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const startDate = sesStorage.getString(SessionStorageKeyName.BattleHistoryFilter);
    if (startDate) {
      resolve(startDate);
      return ;
    }

    const projection = { date: 1 }
    const query: BattleRecordQuery = { 
      dbName: DbName.battle, 
      sort: { date: 1 },
      limit: 1,
      projection,
    }
    window.api.queryDb(query).then((queryReturn) => {
      const records = queryReturn as  BattleRecord[]
      console.log('fetched last battle records:', records.length);
      console.log(records);
      if (records.length === 0) {
        resolve(null);
        return;
      }
      sesStorage.setString(SessionStorageKeyName.BattleHistoryFilter, records[0].date);
      resolve(records[0].date);
    }).catch((err) => {
      console.error('fetchLastPortRecord error:', err);
      reject(err);
    });
  })
}

function search(): void {
  const task1 = fetchFirstBattleDate();
  const task2 = fetchRecentRecords();

  isSearching.value = true;
  Promise.all([task1, task2]).then(([firstDate, records]) => {
    if (abortController.signal.aborted) {
      console.log('aborted, skipping processing');
      return;
    }
    // set min date
    if (!firstDate) {
      filterStartMinDate.value = new Date();
    } else {
      filterStartMinDate.value = firstDate ? new Date(firstDate) : null;
    }

    const tableData = toTableData(records).slice(0, filterLimit.value);
    fetchCellInfo(tableData).then((_cellInfos) => {
      if (abortController.signal.aborted) {
        console.log('aborted, skipping processing');
        return;
      }
      // clear accsent
      setAccent(null, selected.value);

      // update table data
      datas.value = tableData;
      selected.value = datas.value.length > 0 ? datas.value[0] : null
      console.log('processed battle table data:', toRaw(selected.value));

    }).catch((err) => {
      console.error('fetchCellInfo error:', err);
    }).finally(() => {
      isSearching.value = false;
      isInitial.value = false;
    });
  }).catch((err) => {
    console.error('promise all error:', err);
  });
}

/////////////////////////////////////////////////////////////////////////////////////
// vue component logic
watch(selected, (newVal, oldVal) => {
  console.log('BattleHistory selected changed:', toRaw(newVal), toRaw(oldVal));
  nextTick().then(() => {
    setAccent(newVal, oldVal === undefined ? null : oldVal);

    if (oldVal) {
      oldVal.isAccent = false;
    }

    if (newVal) {
      newVal.isAccent = true;
      const info = battleAreaInfo.value || {
        areaId: 0,
        areaNo: 0,
        records: [],
        showReports: false,
      }
      info.areaId = recordMapIdToIdNo(newVal.header.mapId).areaId;
      info.areaNo = recordMapIdToIdNo(newVal.header.mapId).areaNo;
      info.records = newVal.records.filter((rec) => !rec.portReturn);
      battleAreaInfo.value = info;
    } else {
      battleAreaInfo.value = null;
    }
  });

}, { immediate: true });

onMounted(() => {
  // 既存のマウント処理の後にテーブルラッパーを監視して選択変化でスクロール
  nextTick(() => {
    const wrapper = document.querySelector('.battle-history-table .b-table .table-wrapper') as HTMLElement | null;
    if (wrapper) {
      console.log('setting up selection observer for drop ship history table');
      _selectionObserver = new MutationObserver(() => {
        // DOM/クラス変化があれば選択行を可視化
        nextTick(scrollSelectedIntoView);
      });
      _selectionObserver.observe(wrapper, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
      console.log('selection observer set up completed');
    } else {
      console.log('table wrapper not found. selection observer not set up');
    }
  })
})

onUnmounted(() => {
  abortController.abort();
});

/////////////////////////////////////////////////////////////////////////////////////
// initialize
(() => {
  search();
})();

/////////////////////////////////////////////////////////////////////////////////////
// row class
function rowClass(_row: BattleTableData, index: number): string {
  return index % 2 === 0 ? '' : 'is-striped';
}

/////////////////////////////////////////////////////////////////////////////////////
// area options
function getAreaOptions(): AreaOption[] {
  const ret = areaNames.filter((area) => !KcsUtil.isEventAreaId(area.areaId).valueOf()).map((area) => ({
    value:  toRecordMapId(area.areaId, area.areaNo),
    label: `${area.areaId} - ${area.areaNo} ${area.areaName}`,
  }))
  const event61Name = getEventPeriodName(61);
  ret.push(...areaNames.filter((area) => area.areaId === 61).map((area) => ({
    value:  toRecordMapId(area.areaId, area.areaNo),
    label: `${event61Name} E${area.areaNo} ${area.areaName}`,
  })))
  return ret
}

function onChangeFilterMapId(event: Event): void {
  console.log('filterMapId changed:', filterMapId.value, event);
  if (filterMapId.value === null) {
    const select = event.target as HTMLSelectElement;
    select.value = filterMapIdPlaceholder
  }
}

/////////////////////////////////////////////////////////////////////////////////////
// start/end date
function onChangeStartDateYear(year: number): void {
  console.log('onChangeStartDateYear called:', year);
  filterStartYear.value = year;
}

function onChangeEndDateYear(year: number): void {
  console.log('onChangeEndDateYear called:', year);
  filterEndYear.value = year;
}

/////////////////////////////////////////////////////////////////////////////////////
// total get item
const totalGetItems = computed((): AreaItemGetInfo[] => {
  const itemMap = new Map<ApiItemId, number>();
  datas.value.forEach((data) => {

    // アイテム取得カウント無しはskip
    if (! data.isGetSucceeded) {
     return;
    }

    data.areaGetItems.forEach((item) => {
      const countOld = itemMap.get(item.itemId) ?? 0;
      itemMap.set(item.itemId, countOld + item.itemCount);
    });
  });
  const ret: AreaItemGetInfo[] = [];
  itemMap.forEach((count, itemId) => {
    ret.push({ itemId, itemCount: count });
  });
  ret.sort((a, b) => {
    // 資材以外は後ろにずらす
    let itemIdA = a.itemId as number
    let itemIdB = b.itemId as number
    if (itemIdA < ApiItemId.fual) {
      itemIdA += 100;
    }
    if (itemIdB < ApiItemId.fual) {
      itemIdB += 100;
    }
    return itemIdA - itemIdB;
  });

  return ret;
});

/////////////////////////////////////////////////////////////////////////////////////
// total used
const totalUsed = computed((): Used => {
  console.log('uuid:', svdata.prvBattleMapInfo?.uuid)
  return datas.value.reduce<Used>((acc, data) => {

    if (isNaN(data.used.fuel)) {
      // 出撃中は除外
      // 情報が無い場合、除外
      return acc;
    }

    acc.fuel += data.used.fuel;
    acc.bull += data.used.bull;
    if (data.used.buxite !== undefined) {
      if (acc.buxite === undefined) {
        acc.buxite = 0;
      }
      acc.buxite += data.used.buxite;
    }
    return acc;
  }, { fuel: 0, bull: 0 });
});

/////////////////////////////////////////////////////////////////////////////////////
// total boss count
const totalBossCount = computed((): number => {
  return datas.value.reduce<number>((acc, data) => {
    if (data.records.some((record) => record.isBoss)) {
      acc += 1;
    }
    return acc;
  }, 0);
});

/////////////////////////////////////////////////////////////////////////////////////
// helper functions
function shipNameFromId(shipId: number): string {
  const mst = shipId > 0 ? svdata.mstShip(shipId) : null
  return mst?.api_name ?? `id:${shipId}`
}

function areaNoText(data: BattleTableData): string {
  const record = data.header
  const { areaId, areaNo } = recordMapIdToIdNo(record.mapId)
  const isEvent = KcsUtil.isEventAreaId(areaId)
  const mapLvText = isEvent ? (MapLvText[record.mapLv] ?? '') : ''
  const prefix = isEvent ? `${getEventPeriodName(areaId)}E${areaNo}` : `${areaId}-${areaNo}`
  return `${prefix}${mapLvText}`
}

function isEvent(data: BattleTableData): boolean {
  return KcsUtil.isEventAreaId(recordMapIdToIdNo(data.header.mapId).areaId);
}

function getAreaNameFromMst(areaId: number, areaNo: number): string | undefined {
  const mst = svdata.mstMapInfo(areaId, areaNo);
  if (mst) {
    return mst.api_name
  }
  return undefined;
}

function areaNameText(data: BattleTableData): string {
  const record = data.header
  const { areaId, areaNo } = recordMapIdToIdNo(record.mapId)
  const areaName = getAreaName(areaId, areaNo) || getAreaNameFromMst(areaId, areaNo) || 'Unknown Area';
  return areaName
}

function dateText(data: BattleTableData): string {
  const dt = data.header.date
  const month = Number(dt.substring(5, 7))
  const date = Number(dt.substring(8, 10))
  return month + '/' + date
}

function timeText(data: BattleTableData): string {
  const record = data.header
  return record.date.substring(11, 16)  
}

function routeText(data: BattleTableData): string {
  const routes = data.records.reduce<string[]>((acc, record) => {
    if (record.portReturn) {
      return acc;
    }
    const { areaId, areaNo } = recordMapIdToIdNo(record.mapId);
    const cellInfo = mapInfoCache.getOnlyCache(areaId, areaNo);
    let label = record.cellId.toString();
    if (cellInfo) {
      const spot = CommonMap.findSpotForLabel(cellInfo.spots, record.cellId);
      if (spot && spot.label) {
        label = spot.label;
      }
    }
    let rank = ''
    if (record.rank) {
      rank = `(${record.rank})`;
    }
    acc.push(`${label}${rank}`);
    return acc;
  }, []);
  return routes.join('-')
}

function getAreaItemGetInfos(records: BattleRecord[]): AreaItemInfo[] {
  return records.filter((rec) => isBattleRecordItemGet(rec)).reduce<AreaItemInfo[]>((acc, rec) => {
    if (rec.items) {
      rec.items.forEach((item) => {
        // プレゼント箱は表示しない
        if (item.itemId === ApiItemId.present_box) {
          return;
        }

        const showAirSearchResult = rec.eventId === ApiEventId.airBattleOrAirSsearch
        acc.push({
          showAirSearchResult,
          airsearchResult: rec.airsearchResult,
          ...item
        });
      });
    }
    return acc;
  }, []);  
}

const selectedMapTitle = computed(() => {
  if (!selected.value) {
    return ''
  }
  return areaNoText(selected.value) + ' '+ areaNameText(selected.value)
})


function getAllSlots(sr: ShipInfoRecord): (SlotitemInfo | null)[] {
  const mst = svdata.mstShip(sr.shipId);
  if (!mst) {
    return [];
  }
  const slotCount = mst.api_slot_num + (sr.slotitemEx !== undefined ? 1 : 0);
  const ret: (SlotitemInfo | null)[] = Array(slotCount).fill(null);
  sr.slotitem.forEach((slot, index) => {
    if (index < ret.length) {
      ret[index] = slot;
    }
  });
  if (sr.slotitemEx !== undefined) {
    ret[ret.length - 1] = sr.slotitemEx;
  }
  return ret
}

function getSlots(sr: ShipInfoRecord): (SlotitemInfo | null)[] {
  return getAllSlots(sr).slice(0,5);
}

function hasMoreSlots(sr: ShipInfoRecord): boolean {
  return getAllSlots(sr).length > 5;
}

function getMoreSlots(sr: ShipInfoRecord): (SlotitemInfo | null)[] {
  return getAllSlots(sr).slice(5);
}

function toNumber(num: number): string {
  if (Number.isNaN(num)) {
    return '?';
  }
  return num.toString();
}

const listHeight = ref<number>(480-76);

/////////////////////////////////////////////////////////////////////////////////////
// 
const isOverlayHelpVisible = computed<boolean>(() => {
  return isSearching.value
});

const helpText = computed<string>(() => {
  //if (!isInitial.value) {
  //  return '出撃履歴がありません。';
  //}
  return '戦闘履歴検索中...';
});

</script>

<template>
  <div class="battle-history-root">

    <!--
      オーバーレイ
    -->
    <div v-if="isInitial" class="is-initial">
      <img src="../assets/img/app/battlehistory.png"/>
    </div>
    <div v-if="isOverlayHelpVisible" class="overlay-background"></div>
    <div v-if="isOverlayHelpVisible" class="overlay-help">{{ helpText }}</div>

    <!--
      マップタイトル、状況表示ボタン
    -->
    <div class="map-title">
      <span :title="selectedMapTitle">{{ selectedMapTitle }}</span>
      <div class="control-button show-reports-button">
        <b-button 
          size="is-small" 
          outlined 
          @click="() => {
            showReports = !showReports; 
            sesStorage.setBoolean(SessionStorageKeyName.BattleHistoryShowReports, showReports)
          }" 
          :class="{ 'is-active': showReports }">
          <ReportsImage /><span class="button-text">セル状況表示</span></b-button>
      </div>
    </div>

    <!--
      出撃履歴マップ表示
    -->
    <div class="map-content">
      <BattleHistoryArea v-if="battleAreaInfo" :info="battleAreaInfo" :show-reports="showReports"/>
    </div>

    <!--
      履歴検索コントロール
    -->
    <div class="battle-history-control">
      <b-field class="inputs" grouped multiline>
        <label class="input-area">
          <div class="filter-label">海域</div>
          <b-select v-model="filterMapId" size="is-small" :placeholder="filterMapIdPlaceholder"
            @change="onChangeFilterMapId"
            >
            <option :value="null" selected>未選択</option>
            <option
              v-for="area in mapAreaOptions"
              :key="area.value"
              :value="area.value"
            >{{ area.label }}</option>
          </b-select>
        </label>

        <label class="input-count">
          <div class="filter-label">検索件数</div>
          <b-select v-model.number="filterLimit" size="is-small">
            <option
              v-for="value in countOptions"
              :key="value"
              :value="value"
            >{{ value }}</option>
          </b-select>
        </label>

        <div class="input-date-range">
          <div class="filter-label">検索対象日</div>
          <div class="date-range">
            <b-datepicker
              v-model="filterStartDate"
              class="filter-date start"
              size="is-small"
              :clearable="true"
              :min-date="filterStartMinDate"
              :max-date="new Date()"
              placeholder="開始日"
              position="is-bottom-left"
              icon-pack="fa"
              :class="{ 'is-year-min': isStartYearMin, 'is-year-max': isStartYearMax }"
              @change-year="onChangeStartDateYear"
            />
            <span class="range-sep">〜</span>
            <b-datepicker
              v-model="filterEndDate"
              class="filter-date end"
              size="is-small"
              :clearable="true"
              :min-date="filterStartMinDate"
              :max-date="new Date()"
              placeholder="終了日"
              position="is-bottom-left"
              icon-pack="fa"
              :class="{ 'is-year-min': isEndYearMin, 'is-year-max': isEndYearMax }"
              @change-year="onChangeEndDateYear"
            />
          </div>
        </div>

        <label class="input-button search">
          <div class="filter-label is-invisible">empty</div>
          <b-button size="is-small" @click="onFilterSearch">検索</b-button>
        </label>
        <label class="input-button clear">
          <div class="filter-label is-invisible">empty</div>
          <b-button size="is-small" @click="onFilterClear">条件<br>クリア</b-button>
        </label>
      </b-field>
      <div class="results">
        <span class="result-count">
          <div><span class="char4">出撃件数:</span> {{ datas.length }}件</div>
          <div class="boss-count"><span class="char4">ボス到達:</span> {{ totalBossCount }}件</div>
        </span>
        <span class="total-detail">
          <span class="total-used">消費合計: 
            <span class="used-unit">
              <span class="s-icon fuel"></span><span class="value">{{ toNumber(totalUsed.fuel) }}</span>
            </span>
            <span class="used-unit">
              <span class="s-icon bull"></span><span class="value">{{ toNumber(totalUsed.bull) }}</span>
            </span>
            <span class="used-unit" v-if="totalUsed.buxite != undefined">
              <span class="s-icon buxite"></span><span class="value">{{ toNumber(totalUsed.buxite) }}</span>
            </span>
          </span>
          <span class="total-get-items" v-if="totalGetItems.length > 0">獲得合計: 
            <template 
              v-for="(item, item_index) in totalGetItems" 
              :key="`totalgetitem-${item_index}`"><span :class="['s-icon', { 
                  fuel: item.itemId === ApiItemId.fual,
                  bull: item.itemId === ApiItemId.ammo,
                  steel: item.itemId === ApiItemId.steel,
                  buxite: item.itemId === ApiItemId.buxite,
                  'fast-repair': item.itemId === ApiItemId.fast_repair,
                  'fast-build': item.itemId === ApiItemId.fast_build,
                  'build-kit': item.itemId === ApiItemId.build_kit,
                  'kagu-small': item.itemId === ApiItemId.kagu_small,
                  'kagu-medium': item.itemId === ApiItemId.kagu_middle,
                  'kagu-large': item.itemId === ApiItemId.kagu_large,
                }]">+{{ item.itemCount }}</span></template></span>
        </span>
      </div>
    </div>

    <!--
      出撃履歴
    -->
    <div class="battle-history-table" ref="tableEl">
      <b-table
        :data="datas"
        :paginated="false"
        :show-detail-icon="false"
        :bordered="false"
        :narrowed="false"
        focusable
        :mobile-cards="false"
        sticky-header
        detailed
        detail-key="detailKey"
        :opened-detailed="openDetailedDatas"
        v-model:selected="selected"
        @select="onSelect"
        :height="listHeight"
        icon-pack="fa"
        :row-class="rowClass"
      >
        <b-table-column centered header-class="battle-area" cell-class="battle-area">
          <template #header>
            <span>出撃エリア</span>
          </template>
          <template #default="props">
            <span :id="ROW_ID_PREFIX+props.row.detailKey">{{ areaNoText(props.row) }}<span
              v-if="!isEvent(props.row)">&nbsp;{{ areaNameText(props.row) }}</span></span>
          </template>
        </b-table-column>

        <b-table-column centered header-class="battle-date" cell-class="battle-date">
          <template #header>
            <span>出撃日時</span>
          </template>
          <template #default="props">
            <span>{{ dateText(props.row) }} {{ timeText(props.row) }}</span>
          </template>
        </b-table-column>

        <b-table-column centered header-class="battle-date" cell-class="battle-route">
          <template #header>
            <span>ルート詳細</span>
          </template>
          <template #default="props">
            <span>{{ routeText(props.row) }} </span><span 
              v-if="props.row.areaGetItems.length > 0" class="area-get-items"><template 
                v-for="(item, item_index) in props.row.areaGetItems" 
                :key="`areagetitem-${item_index}`"><span :class="['s-icon', { 
                  fuel: item.itemId === ApiItemId.fual,
                  bull: item.itemId === ApiItemId.ammo,
                  steel: item.itemId === ApiItemId.steel,
                  buxite: item.itemId === ApiItemId.buxite,
                  'fast-repair': item.itemId === ApiItemId.fast_repair,
                  'fast-build': item.itemId === ApiItemId.fast_build,
                  'build-kit': item.itemId === ApiItemId.build_kit,
                  'kagu-small': item.itemId === ApiItemId.kagu_small,
                  'kagu-medium': item.itemId === ApiItemId.kagu_middle,
                  'kagu-large': item.itemId === ApiItemId.kagu_large,
                }]">+{{ item.itemCount }}<span 
                  v-if="item.showAirSearchResult"
                  :class="{
                    'is-failed': item.airsearchResult === 0,
                    'is-success': item.airsearchResult === 1,
                    'is-great-success': item.airsearchResult === 2,
                    'is-boss-lose': item.bossLose,
                  }">({{ getAirSearchResultText(item.airsearchResult) }})
                  </span></span></template></span>
          </template>
        </b-table-column>

        <b-table-column centered header-class="battle-used" cell-class="battle-used">
          <template #header>
            <span>資源消費量</span>
          </template>
          <template #default="props">
            <div class="used-units">
              <span class="used-unit">
                <span class="s-icon fuel"></span><span class="value">{{ toNumber(props.row.used.fuel) }}</span>
              </span>
              <span class="used-unit">
                <span class="s-icon bull"></span><span class="value">{{ toNumber(props.row.used.bull) }}</span>
              </span>
              <span class="used-unit" v-if="props.row.used.buxite != undefined">
                <span class="s-icon buxite"></span><span class="value">{{ toNumber(props.row.used.buxite) }}</span>
              </span>
            </div>
          </template>
        </b-table-column>

        <template #detail="props">
          <div class="detail-content" 
            :id="DETAIL_ROW_ID_PREFIX+props.row.detailKey"
            :onClick="() => onDetailClick(props.row)"
          >
          <template v-for="(sr, index) in props.row.header.ships1" :key="`detail-${index}`">
          <div class="ship-detail">
              <div class="ship-header">Lv{{ sr.lv }} {{ shipNameFromId(sr.shipId) }}</div>
              <div class="ship-img-slots" v-if="props.row.isAccent">
                <div class="moreslot-container">
                  <ShipBanner :mst_id="sr.shipId" />
                  <div v-if="hasMoreSlots(sr)" class="ship-slots more">
                    <SlotItemForRecord v-for="(moreslot, moreslot_index) in getMoreSlots(sr)" :slotitem="moreslot"
                      :key="`moreslot-${moreslot_index}`" />
                  </div>
                </div>
                <div class="ship-slots" v-if="getSlots(sr).length > 0">
                  <SlotItemForRecord v-for="(slot, slot_index) in getSlots(sr)" :slotitem="slot"
                    :key="`slot-${slot_index}`" />
                </div><div v-else class="ship-slots no-slot"><SlotItemForRecord :slotitem="null"/></div>
              </div>
            </div>
            </template>
            <template 
              v-if="props.row.header.ships2 && props.row.header.ships2.length > 0"
              v-for="(sr, index) in props.row.header.ships2" :key="`detail2-${index}`">
            <div class="ship-detail">
              <div class="ship-header">Lv{{ sr.lv }} {{ shipNameFromId(sr.shipId) }}</div>
              <div class="ship-img-slots" v-if="props.row.isAccent">
                <div class="moreslot-container">
                  <ShipBanner :mst_id="sr.shipId" />
                  <div v-if="hasMoreSlots(sr)" class="ship-slots more">
                    <SlotItemForRecord v-for="(moreslot, moreslot_index) in getMoreSlots(sr)" :slotitem="moreslot"
                      :key="`moreslot-${moreslot_index}`" />
                  </div>
                </div>
                <div class="ship-slots">
                  <SlotItemForRecord v-for="(slot, slot_index) in getSlots(sr)" :slotitem="slot"
                    :key="`slot-${slot_index}`" />
                </div>
              </div>
            </div>
            </template>
          </div>
        </template>

        <template #empty>
          <div class="has-text-centered">出撃履歴がありません。</div>
        </template>
      </b-table>
    </div>
  </div>
</template>
