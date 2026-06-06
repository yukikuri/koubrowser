<script setup lang="ts">
import {
  isShipRare,
  isShipUnique,
  KcsUtil,
} from '@common/kcs'
import { svdata } from '@renderer/store/svdata'
import MapImg from '@renderer/components/MapImg.vue'
import { computed, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { mapInfoCache } from '@renderer/common/mapinfo'
import { DbName, DropRecord, DropRecordQuery, toRecordMapId } from '@common/record'
import { DropShipMapInfo } from '@renderer/common/drop-ship'
import { getAreaName, getEventPeriodName } from '@common/area_name'
import { AggregatedShipDrop, RankDropCountIndex, RankDropCounts, RecordCalculator } from '@common/calc_record'
import { Spot } from '@common/map'
import { MapLvText } from '@common/locale'
import LocationImage from '@assets/img/location.svg'
const isLocatonVisible = ref(false)

// -----------------------------------------------------------------
// ref elem
const elSpotTable = ref<HTMLElement | null>(null);

// -----------------------------------------------------------------
// props
const props = defineProps<{ 
  info: DropShipMapInfo;
}>()

// -----------------------------------------------------------------
// 
const MAP_RATIO = 0.5
const ratio = (v: number): number => {
  return v * MAP_RATIO
}
const MAP_WIDTH = 1200 * MAP_RATIO;
const MAP_HIGHT = 720 * MAP_RATIO;
const SPOT_PIE_SIZE = 30;

const spot_info = ref<Spot | null>(null)
let unmounted = false;
const recordFetching = ref(false);
const isSpotOk = computed<boolean>(() => {
  return spot_info.value !== null
})
const isTableOk = ref<boolean>(false);
const spotTableVisibility = ref<string>('hidden');
const listWidth = ref<number>(185);
const listHeight = ref<number>(205);
const listHeightRendered = ref<number>(205);
const isListHasVScroll = ref<boolean>(true);

// -----------------------------------------------------------------
// table data
interface CellDropTableData {
  shipId: number; // -1:ドロップ無し
  counts: RankDropCounts;
  shipName: string;
  count: number;
  rate: number;
  backs: number;
  isHilight: boolean
}
const datas = ref<CellDropTableData[]>([])
const totalRowId = -3;

const getRankText = (counts: RankDropCounts): string => {
  const ret: string[] = []
  if (counts[RankDropCountIndex.S]) {
    ret.push('S');
  }
  if (counts[RankDropCountIndex.A]) {
    ret.push('A');
  }
  if (counts[RankDropCountIndex.B]) {
    ret.push('B');
  }
  return ret.length > 0 ? ret.join(' ') : '-'
}

const calcPercent = (data: CellDropTableData, total: number): number => {
  const percent = (data.count / total) * 100;
  return Math.round(percent * 100) / 100;
}

function scrollSelectedIntoView(): void {
  const wrapper = elSpotTable.value?.querySelector('.b-table .table-wrapper') as HTMLElement | null;
  if (!wrapper) {
    console.log('table wrapper not found for scrollSelectedIntoView');
    return;
  }
  const hilight = wrapper.querySelector('tr:has(.is-hilight)') as HTMLElement | null;
  if (!hilight) {
    console.log('no hilight row for scrollSelectedIntoView');
    return;
  }

  // 親要素の上端からの相対位置を計算して、親のスクロール位置を書き換える
  wrapper.scrollTo({
    top: hilight.offsetTop - wrapper.offsetTop - listHeight.value / 2,
    behavior: 'instant'
  });
}

function updateTableDatas(drops: AggregatedShipDrop[]) {
  type DataType = (typeof datas.value)[number];
  const newList: DataType[]= [];
  const totalCounts: RankDropCounts = [0, 0, 0];
  drops.forEach((drop) => {
    const mst = drop.shipId > 0 ? svdata.mstShip(drop.shipId) : null;
    const shipName = drop.shipId > 0 ? (mst ? mst.api_name : '????') : 'ドロップ無し';    
    const count = drop.counts.reduce((acc, cur) => acc + cur, 0);
    drop.counts.forEach((c, idx) => {
      totalCounts[idx] += c;
    });

    // add table data
    const v: DataType = {
      shipId: drop.shipId,
      counts: drop.counts,
      shipName,
      backs: mst ? mst.api_backs : 0,
      rate: 0,
      count,
      isHilight: props.info.hilight_ship_id === drop.shipId,
    }
    newList.push(v)
  })

  // calc percent
  const totalCount = totalCounts.reduce((acc, cur) => acc + cur, 0);
  if (totalCount > 0) {
    newList.forEach((data) => {
      data.rate = calcPercent(data, totalCount);
    });
  }
  newList.sort((a, b) => b.count - a.count);

  // total row
  const totalRow: DataType = {
    shipId: totalRowId,
    shipName: '合計',
    counts: totalCounts,
    rate: -1,
    count: totalCount,
    backs: 0,
    isHilight: false,
  }
  newList.push(totalRow);
  datas.value = newList;
  isTableOk.value = true
  isLocatonVisible.value = true;

  nextTick(() => {
    if (elSpotTable.value) {
      const elTable = elSpotTable.value.querySelector('table');
      if (elTable) {
        const hasVScroll = elTable.scrollHeight > elSpotTable.value.clientHeight;
        isListHasVScroll.value = hasVScroll;
        listHeightRendered.value = elTable.clientHeight;
        if (! hasVScroll) {
          elSpotTable.value.classList.add('no-vscroll');
        }
        console.log('spot table scroll check. hasVScroll:', hasVScroll,
          'clientHeight:', elSpotTable.value.clientHeight,
          'scrollHeight:', elTable.scrollHeight);
          if (hasVScroll) {
            scrollSelectedIntoView();
          }
          spotTableVisibility.value = 'visible';
      }
    }
  })
}

function fetchRecord(): void {
  const area_id = props.info.area_id;
  const area_no = props.info.area_no;
  const cell_no = props.info.cell_no
  const mapId = toRecordMapId(area_id, area_no);
  const query: DropRecordQuery = {
    dbName: DbName.drop,
    find: {
      mapId,
      cellId: { $in: mapInfoCache.findCellNos(area_id, area_no, cell_no) },
      rank: { $in: ['S', 'A', 'B'] }
    },
    projection: {
      shipId: 1,
      mapId: 1,
      cellId: 1,
      rank: 1,
      count: 1,
      isBoss: 1,
    }
  };

  recordFetching.value = true;
  //console.time('drop record for cellno query time');
  window.api.queryDb(query).then((queryReturn) => {
    //console.timeEnd('drop record for cellno query time');
    const records = queryReturn as DropRecord[];
    if (unmounted) {
      console.log('drop record fetched but unmounted. ignore the result for mapId:', mapId);
      return;
    }
    recordFetching.value = false;
    console.log('drop record queried. record count:', records.length, 'for mapId:', mapId);

    // calc total drop count
    const drops = RecordCalculator.aggregateShipDrop(records);
    updateTableDatas(drops);
  })
}

onMounted(() => {
  console.log('drop by ship area mounted. info:', props.info)
})

onUnmounted(() => {
  console.log('drop by ship area destroyed')
  unmounted = true;
})

const getMapTitle = (): string => {
  const noOrLabel = props.info.cell_label ?? 'cell'+props.info.cell_no;
  const isEvent = KcsUtil.isEventAreaId(props.info.area_id)
  const mapLvText = isEvent ? (MapLvText[props.info.map_lv] ?? '') : ''
  const areaName = getAreaName(props.info.area_id, props.info.area_no) || 'Unknown Area';
  const namePrefix = isEvent ? getEventPeriodName(props.info.area_id) +
    'E'+props.info.area_no : props.info.area_id + '-' + props.info.area_no
  const bossText = props.info.is_boss ? '(Boss)' : '';
  return `${namePrefix}${mapLvText} ${areaName} ${noOrLabel}${bossText}`;
}

const spotXY = computed<string>(() => {
  if (! spot_info.value) {
    return ''
  }
  const spot = spot_info.value
  let x = ratio(spot.x)
  let y = ratio(spot.y)
  return `--size: ${SPOT_PIE_SIZE}px; left: ${x - SPOT_PIE_SIZE/2}px; top: ${y -SPOT_PIE_SIZE/2}px`
});

const spotTableStyle = computed<string>(() => {
  if (! spot_info.value) {
    return ''
  }
  const spot = spot_info.value
  let spotX = ratio(spot.x)
  let spotY = ratio(spot.y)
  const mapTitleHeight = 24
  const topOffset = 25;
  const offsetX = 20;
  const offsetY = 0;
  const clientHeight = isListHasVScroll.value ? listHeight.value : listHeightRendered.value;
  let left = spotX - listWidth.value - SPOT_PIE_SIZE - offsetX;
  let top = spotY - (clientHeight/2) - offsetY;

  if (! isListHasVScroll.value) {
    left += 15;
  }

  if ((left + listWidth.value) > MAP_WIDTH) {
    left = spotX - offsetX - listWidth.value;
  }
  if ((top + clientHeight) > MAP_HIGHT) {
    top = MAP_HIGHT - clientHeight - topOffset; 
  }

  if (left < 0) {
    left = spotX + SPOT_PIE_SIZE
  }

  if (top <= (mapTitleHeight+4)) {
    top = topOffset+mapTitleHeight+4;
  }
  return `visibility: ${spotTableVisibility.value}; top: ${top}px; left: ${left}px;`
});

/////////////////////////////////////////////////////////////////////////////////////
// location image
const locationStyle = computed<string>(() => {
  const spot = spot_info.value
  if (! spot) {
    return 'display: none;'
  }
  const left = ratio(spot.x)
  const top = ratio(spot.y)
  return `left: ${left - 21}px; top:${top - 36}px;`
});

// -----------------------------------------------------------------
// initialize
(() => {
  const info = props.info;
  mapInfoCache.get(info.area_id, info.area_no)
  .then((cellInfo) => {
    console.log('cell info async returned', cellInfo)

    const spot = cellInfo.spots.find((s) => s.no === info.cell_no)
    if (spot) {
      console.log('spot found for cell_no:', info.cell_no, spot)
      spot_info.value = spot
    }

    fetchRecord();
  })
  .catch((err) => console.log(err))
})()

</script>
<template>
  <div class="drop-by-ship-area-root">
    <div class="map-container">
      <MapImg :area_id="props.info.area_id" :area_no="props.info.area_no" />
      <div class="map-title"><span>{{ getMapTitle() }}</span></div>
      <div
          v-if="isSpotOk"
          class="spot"
          :style="spotXY"
      ></div>
      <transition name="scale-effect" appear>
        <div class="location-image" v-if="isLocatonVisible" :style="locationStyle">
          <LocationImage />
        </div>  
      </transition>
      <div 
        ref="elSpotTable"
        v-if="isTableOk"
        class="spot-table"
        :style="spotTableStyle"
        >
          <b-table
            :data="datas"
            :paginated="false"
            :show-detail-icon="false"
            :bordered="false"
            :striped="true"
            :narrowed="false"
            :hoverable="false"
            :mobile-cards="false"
            :sticky-header="true"
            :height="listHeight"
          >

          <b-table-column centered header-class="ship-name" cell-class="ship-name">
            <template #header>
              <span>艦名</span>
            </template>
            <template #default="props">
              <span :class="{
                'is-rare': isShipRare(props.row.backs), 
                'is-unique': isShipUnique(props.row.backs),
                'is-hilight': props.row.isHilight
              }"
              >{{ props.row.shipName }}</span>
            </template>
          </b-table-column>

          <b-table-column centered header-class="drop-rate" cell-class="drop-rate">
            <template #header>
              <span>確率</span>
            </template>
            <template #default="props">
              <span v-if="props.row.rate >= 0">{{ props.row.rate }}%</span>
            </template>
          </b-table-column>

          <b-table-column centered header-class="drop-count" cell-class="drop-count">
            <template #header>
              <span>ドロップ数</span>
            </template>
            <template #default="props">
              <span>S:{{ props.row.counts[RankDropCountIndex.S] }} A:{{ props.row.counts[RankDropCountIndex.A] }} B:{{ props.row.counts[RankDropCountIndex.B] }}</span>
            </template>
          </b-table-column>

        </b-table>
      </div>
    </div>
  </div>
</template>