<script setup lang="ts">
import type { BattleRecord } from '@common/record'
import { isBattleRecordItemGet } from '@common/record'
import { ApiBattleBase, ApiEventId, isShipRare, isShipUnique, MstShip } from '@common/kcs'
import { getAirSearchResultText, getFormationShortText, getStateText, getTacticsText  } from '@common/locale'
import MapImg from '@renderer/components/MapImg.vue'
import PassedCellImage from '@renderer/assets/img/passed-cell.svg'
import Line from '@renderer/components/area/Line.vue'
import ShipBanner from '@renderer/components/ShipBanner.vue'
import { svdata } from '@renderer/store/svdata'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { BattleAreaInfo } from '@renderer/common/battle-area'
import { CellInfo, Spot } from '@common/map'
import { mapInfoCache } from '@renderer/common/mapinfo'
import * as place from '@renderer/stuff/place'
import { RUtil } from '@renderer/util'
const containerEl = ref<HTMLElement | null>(null)

// トランジションを開始する合図
const enter = ref(false)

// -----------------------------------------------------------------
// props
const props = defineProps<{ 
  info: BattleAreaInfo;
  showReports: boolean;
}>()
interface HomeSpot {
  spot: Spot;
  spotXY: string;
}
interface BattleSpot {
  id: string;
  spot: Spot;
  record: BattleRecord;
  spotXY: string;
  battleXY: string | null
  itemsXY: string | null
  direction: place.Direction | null
  api_battle: ApiBattleBase | null
  showFormations: boolean
  showAirSearchResult: boolean
  enemyIds: number[]
  enemyIds2: number[] | null
  dropShip?: MstShip
  boundingClientRect: DOMRect | null,
}

const homeSpot = ref<HomeSpot | null>(null);
const battleSpots = ref<BattleSpot[]>([])
const uuid = ref('')
const lineColor = '#00ffff';

const seikuClasses = ['kinkou', 'kakuho', 'yuusei', 'ressei', 'sousitu'] as const
const seikuClass = (bs: BattleSpot): string => {
  return seikuClasses[bs.record.seiku] || ''
}

// spot基準
enum HorizontalAlign {
  Left,
  Right
}

// spot基準
enum VerticalAlign {
  Top,
  Middle,
  Bottom
}

// from方向に基づく配置
const fromAlignMap: [place.Direction, HorizontalAlign, VerticalAlign][] = [
  [place.Direction.RightDown, HorizontalAlign.Right, VerticalAlign.Middle ], // pos right, middle
  [place.Direction.RightUp, HorizontalAlign.Right, VerticalAlign.Middle], // pos right, middle
  [place.Direction.LeftDown, HorizontalAlign.Left, VerticalAlign.Middle], // pos left,  middle
  [place.Direction.LeftUp, HorizontalAlign.Left, VerticalAlign.Middle], // pos left, middle
];

// from/to方向に基づく配置
const fromToAlignMap: [place.Direction, place.Direction, HorizontalAlign, VerticalAlign][] = [
  [place.Direction.RightDown, place.Direction.RightDown, HorizontalAlign.Right, VerticalAlign.Bottom ], // pos right, bottom
  [place.Direction.RightDown, place.Direction.RightUp, HorizontalAlign.Left, VerticalAlign.Top],  // pos left, middle
  [place.Direction.RightDown, place.Direction.LeftDown, HorizontalAlign.Right, VerticalAlign.Middle],  // pos right, middle
  [place.Direction.RightDown, place.Direction.LeftUp, HorizontalAlign.Right, VerticalAlign.Middle],  // pos right, middle

  [place.Direction.RightUp, place.Direction.RightDown, HorizontalAlign.Left, VerticalAlign.Bottom], // pos left, bottom
  [place.Direction.RightUp, place.Direction.RightUp, HorizontalAlign.Right, VerticalAlign.Top],  // pos right, top
  [place.Direction.RightUp, place.Direction.LeftDown, HorizontalAlign.Right, VerticalAlign.Middle],  // pos right, middle
  [place.Direction.RightUp, place.Direction.LeftUp, HorizontalAlign.Right, VerticalAlign.Middle],  // pos right, middle

  [place.Direction.LeftDown, place.Direction.RightDown, HorizontalAlign.Left, VerticalAlign.Middle], // pos left,  middle
  [place.Direction.LeftDown, place.Direction.RightUp, HorizontalAlign.Left, VerticalAlign.Top],  // pos left, top
  [place.Direction.LeftDown, place.Direction.LeftDown, HorizontalAlign.Right, VerticalAlign.Top],  // pos right, top
  [place.Direction.LeftDown, place.Direction.LeftUp, HorizontalAlign.Right, VerticalAlign.Top],  // pos right, middle

  [place.Direction.LeftUp, place.Direction.RightDown, HorizontalAlign.Left, VerticalAlign.Bottom], // pos left, bottom
  [place.Direction.LeftUp, place.Direction.RightUp, HorizontalAlign.Left, VerticalAlign.Middle],  // pos left, middle
  [place.Direction.LeftUp, place.Direction.LeftDown, HorizontalAlign.Right, VerticalAlign.Bottom ],  // pos right, bottom
  [place.Direction.LeftUp, place.Direction.LeftUp, HorizontalAlign.Right, VerticalAlign.Top],  // pos right, top
];

const getFromAlign = (
  directionFrom: place.Direction
): { hor: HorizontalAlign, ver: VerticalAlign } | undefined  => {
  for (const [from, hor, ver] of fromAlignMap) {
    if (from === directionFrom) {
      return { hor, ver }
    }
  }
  return 
}

const getFromToAlign = (
  directionFrom: place.Direction,
  directionTo: place.Direction
): { hor: HorizontalAlign, ver: VerticalAlign } | undefined  => {
  for (const [from, to, hor, ver] of fromToAlignMap) {
    if (from === directionFrom && to === directionTo) {
      return { hor, ver }
    }
  }
  return 
}

// -----------------------------------------------------------------
// 
const MAP_RATIO = 0.5
const ratio = (v: number): number => {
  return v * MAP_RATIO
}

const spotXY = (spot: Spot): string => {
  const diff = 14;
  return `--left: ${ratio(spot.x) - diff}px; --top:${ratio(spot.y) - diff}px;`
}

const battleXY = (
  bs: BattleSpot, from: place.Direction | null, to: place.Direction | null): string => {

  const spot = bs.spot
  if (null === from) {
    console.log(spot.no, 'null from direction:', from);
    return spotXY(spot);
  }
  const align = to === null ? getFromAlign(from) : getFromToAlign(from, to);
  if (! align ) {
    console.log(spot.no, 'unknown align:', from, to);
    return spotXY(spot);
  }

  const diff = (bs.record.isBoss ? 20 : 14); 
  //console.log(spot.no, 'directionFrom:', from, 'directionTo:',to, 'align:', align);
  const elHeight = bs.boundingClientRect!.height
  const elWidth = bs.boundingClientRect!.width
  const leftDiff = align.hor === HorizontalAlign.Left ? -(elWidth+diff) : diff;
  let topDiff = 0;
  if (align.ver === VerticalAlign.Top) {
    topDiff = +diff/2
  } else if (align.ver === VerticalAlign.Middle) {
    topDiff = -((elHeight)/2);
  } else {
    topDiff = -(elHeight - diff/2);
  }

  return `--left: ${ratio(spot.x) + leftDiff}px; --top:${ratio(spot.y) + topDiff}px;`
}

const itemsXY = (
  bs: BattleSpot, from: place.Direction | null, to: place.Direction | null): string | null => {

  // 資源取得なしは表示しない
  if (! bs.record.items || bs.record.items.length === 0) {
    return null
  }

  const spot = bs.spot
  if (null === from) {
    console.log(spot.no, 'null from direction:', from);
    return spotXY(spot);
  }
  const align = to === null ? getFromAlign(from) : getFromToAlign(from, to);
  if (! align ) {
    console.log(spot.no, 'unknown align:', from, to);
    return spotXY(spot);
  }

  const diff = 14;
  //console.log(spot.no, 'directionFrom:', from, 'directionTo:',to, 'align:', align);
  let elHeight = bs.boundingClientRect!.height
  const elWidth = bs.boundingClientRect!.width

  // itemは中央表示に寄せる
  const leftDiff = -(elWidth)/2
  let topDiff = 0;
  if (align.ver === VerticalAlign.Top) {
    topDiff = diff*1.5;
  } else if (align.ver === VerticalAlign.Middle) {
    topDiff = -(elHeight+diff*1.5)
  } else {
    topDiff = -(elHeight+diff*1.5)
  }

  return `--left: ${ratio(spot.x) + leftDiff}px; --top:${ratio(spot.y) + topDiff}px;`
}

// -----------------------------------------------------------------
// 
const getApiBattle = (record: BattleRecord): ApiBattleBase | null => {

  try {
    if (record.middayJson) {
      const battleJson = JSON.parse(record.middayJson);
      if (battleJson && battleJson.api_data) {
        return battleJson.api_data as ApiBattleBase;
      }
    }

    if (record.midnightJson) {
      const battleJson = JSON.parse(record.midnightJson);
      if (battleJson && battleJson.api_data) {
        return battleJson.api_data as ApiBattleBase;
      }
    }
  } catch (err) {
    console.log('error parsing battleJson:', err);
  }
  return null;
}

function initializeSpots(info: CellInfo): void {
  const records = props.info.records;
  if (records.length === 0) {
    battleSpots.value = [];
    return;
  }

  // set home spot
  const from_no = records[0].fromCellId ?? 0;
  const spot = info.spots.find((spot) => spot.no === from_no);
  if (spot) {
    homeSpot.value = {
      spot,
      spotXY: spotXY(spot),
    };
  }

  if (records.length > 0 ) {
    uuid.value = records[0].uuid;
  }

  const localSpots = records.reduce<BattleSpot[]>((acc, record) => {
    const spot = info.spots.find((el) => el.no === record.cellId)
    if (spot) {

      // direction
      let direction: place.Direction | null = null;
      let prevSpot: Spot | null = null;
      if (acc.length === 0) {
        prevSpot = homeSpot.value ? homeSpot.value.spot : null;
      } else {
        prevSpot = acc[acc.length - 1].spot;
      }        
      if (prevSpot) {
        direction = place.getDirection(prevSpot.x, prevSpot.y, spot.x, spot.y);
      }

      const api_battle = getApiBattle(record);
      function getEnemyIds(): number[] {
        if (! api_battle) {
          return [];
        }
        return api_battle.api_ship_ke
      }
      function getEnemyIds2(): number[] | null {
        if (! api_battle) {
          return null;
        }
        return api_battle['api_ship_ke_combined'] ?? null;
      }
      const id = `battle-spot-${spot.no}-${uuid.value}`;
      const enemyIds = getEnemyIds();
      const enemyIds2 = getEnemyIds2();
      const dropShip = svdata.mstShip(record.drop?.shipId ?? -1);
      const showFormations = record.formations.length >= 2;
      const showAirSearchResult = record.eventId === ApiEventId.airBattleOrAirSsearch   

      // battleXY
      let battleXY: string | null = null;
      if (enemyIds.length > 0) {
        battleXY = spotXY(spot);
      }

      // itemsXY
      let itemsXY: string | null = null;
      if (isBattleRecordItemGet(record)) {
        itemsXY = spotXY(spot);
      }

      acc.push({
        id,
        spot,
        record,
        spotXY: spotXY(spot),
        battleXY,
        itemsXY,
        showFormations,
        showAirSearchResult,
        direction,
        api_battle,
        enemyIds,
        enemyIds2,
        dropShip,
        boundingClientRect: null,
      });
    }
    return acc
  }, [])

  // set xy
  const getDirectionTo = (bses: BattleSpot[], bsFrom: BattleSpot, indexTo: number): place.Direction | null => {
    let ret: place.Direction | null = null;
    if (indexTo < bses.length - 1) {
      const nextSpot = bses[indexTo + 1].spot;
      ret = place.getDirection(bsFrom.spot.x, bsFrom.spot.y, nextSpot.x, nextSpot.y);
    }
    return ret;
  };

  battleSpots.value = localSpots

  // 配置調整
  nextTick(() => {

    battleSpots.value.forEach((bs, index) => {

      // 要素サイズ取得
      const el = containerEl.value!.querySelector('#'+bs.id);
      if (el) {
        bs.boundingClientRect = el.getBoundingClientRect();

        // battleXY
        if (bs.battleXY) {
          const directionFrom = bs.direction;
          const directionTo = getDirectionTo(battleSpots.value, bs, index);
          bs.battleXY = battleXY(bs, directionFrom, directionTo);
        }

        // itemsXY
        if (bs.itemsXY) {
          const directionFrom = bs.direction;
          const directionTo = getDirectionTo(battleSpots.value, bs, index);
          bs.itemsXY = itemsXY(bs, directionFrom, directionTo);
        }
      }
    });

    nextTick(() => {
      const reports = containerEl.value!.querySelectorAll<HTMLElement>('.reports');
      place.ensureWithinContainer(
        containerEl.value!,
        reports,
        { top: '--top', left: '--left' },
        { top: 15, bottom: 15, left: 5, right: 5 }
      );

      // delete hidden
      reports.forEach((el) => {
        el.style.visibility = 'unset';
      });

      // begin animation
      nextTick(() => {
        enter.value = true;
      });
    });

  });
}

interface LineInfo {
  x1: number
  y1: number
  x2: number
  y2: number
}
const passedLines = computed<LineInfo[]>(() => {
  let startPos: Spot | null = null;
  const ret = battleSpots.value.reduce<LineInfo[]>((acc, battleSpot, index) => {

    if (index === 0) {
      // home spot
      startPos = homeSpot.value ? homeSpot.value.spot : null;
    } else {
      startPos = battleSpots.value[index - 1].spot
    }
    const endSpot = battleSpot.spot;
    if (startPos) {
      const line: LineInfo = {
        x1: ratio(startPos.x),
        y1: ratio(startPos.y),
        x2: ratio(endSpot.x),
        y2: ratio(endSpot.y)
      }
      acc.push(line);
      startPos = endSpot;
    }
    return acc;
  }, [])
  return ret;
})

/////////////////////////////////////////////////////////////////////////////////////
// vue component logic
watch(() => props.info, (info) => {
  enter.value = false;
  if (!info) {
    battleSpots.value = [];
    return;
  }
  mapInfoCache.get(info.areaId, info.areaNo)
    .then((cellInfo) => {
      initializeSpots(cellInfo)
    }).catch((err) => console.log(err));
}, { immediate: true, deep: true });

onMounted(() => {
  console.log('battle history area mounted');
})

onUnmounted(() => {
  console.log('battle history area unmounted');
});

/////////////////////////////////////////////////////////////////////////////////////
// 
function itemSrc(bs: BattleSpot): string {
  if (! bs.record.items || bs.record.items.length === 0) {
    return '';
  }
  return RUtil.itemImg(bs.record.items[0].itemId);
}

/////////////////////////////////////////////////////////////////////////////////////
// 
function getFormationsText(bs: BattleSpot): string {
  const formations = bs.record.formations
  if (formations.length < 3) {
    return '? - ?';
  }
  const ff = getFormationShortText(formations[0]);
  const ef = getFormationShortText(formations[1]);
  return `${ff} / ${ef}`;
}

function battleSpotTitle(bs: BattleSpot): string {
  const header = `Cell No: ${bs.spot.no} ${getTacticsText(bs.record.formations[2])}\n■${bs.record.enemyDeckName}`
  const enemies: string[] = [];
  const enemies2: string[] = [];
  bs.enemyIds.forEach((eid) => {
    const mst = svdata.mstShip(eid);
    if (mst) {
      enemies.push(mst.api_name);
    }
  })
  if (bs.enemyIds2) {
    enemies2.push('\n');    
    bs.enemyIds2.forEach((eid) => {
      const mst = svdata.mstShip(eid);
      if (mst) {
        enemies2.push(mst.api_name);
      }
    })
  }
  return `${header}\n` + enemies.join('\n') + enemies2.join('\n');
}

</script>

<template>
  <div class="battleshistory-area-root" ref="containerEl">
    <!--
      マップ画像
    -->
    <MapImg :area_id="props.info.areaId" :area_no="props.info.areaNo" />

    <!--
      開始地点
    -->
    <div
      v-if="homeSpot"
      class="passed-cell"
      :style="homeSpot.spotXY"
    ><PassedCellImage /></div>

    <template v-for="(bs, index) in battleSpots" :key="`battleSpot${index}-${uuid}`">

      <!--
        通過線分表示
      -->
      <Line v-for="(line, index) in passedLines" 
        :key="`passedLine${index}-${uuid}`"        
        :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2" :is-animate="false"
        :color="lineColor" :dashed="false"
      />

      <!--
        通過地点表示
      -->
      <div
        class="passed-cell"
        :style="bs.spotXY"
      ><PassedCellImage /></div>

      <!--
        戦闘・敵表示
      -->
      <div
        class="reports battle-spot"
        v-if="bs.battleXY"
        :class="['ready', { enter: enter && props.showReports }]"
        :style="bs.battleXY"
        :id="bs.id"
        :title="battleSpotTitle(bs)"
      >
        <div class="report">
          <span class="seiku" 
            v-if="bs.record.seiku >= 0"
            :class="seikuClass(bs)"
            >{{ getStateText(bs.record.seiku) }}</span><span class="rank" 
            :class="{
              rankS: bs.record.rank === 'S',
              rankA: bs.record.rank === 'A',
              rankB: bs.record.rank === 'B',
              rankC: bs.record.rank === 'C',
              rankD: bs.record.rank === 'D',
              rankE: bs.record.rank === 'E',              
            }"><span v-if="bs.record.midnightJson" class="nightbattle-label">夜</span>{{ bs.record.rank }}</span><span 
              v-if="bs.dropShip" 
              class="drop" 
              :class="{
                'is-rare': isShipRare(bs.dropShip.api_backs), 
                'is-unique': isShipUnique(bs.dropShip.api_backs)
              }"
              >{{ bs.dropShip.api_name }}</span><span v-else class="drop"></span>
        </div>
        <div class="report" v-if="bs.showFormations"><span class="formations">{{ getFormationsText(bs) }}</span></div>
        <div class="enemies">
          <div v-if="bs.enemyIds2">
            <template v-for="(eid, eindex2) in bs.enemyIds2" :key="`enemy2-${eindex2}-${uuid}`">
              <div class="ebanner"><ShipBanner :mst_id_enemy="eid" /></div>
            </template>
          </div>
          <div>
            <template v-for="(eid, eindex) in bs.enemyIds" :key="`enemy-${eindex}-${uuid}`">
              <div class="ebanner"><ShipBanner :mst_id_enemy="eid" /></div>
            </template>
          </div>
        </div>
      </div>

      <!--
        アイテム取得表示
      -->
      <div class="reports items" 
        v-if="bs.itemsXY"
        :class="[ 'ready', { enter : enter && props.showReports } ]"
        :style="bs.itemsXY"
        :id="bs.id"
        ><div class="air-search-result" 
          v-if="bs.showAirSearchResult"
          :class="{
            'is-failed': bs.record.airsearchResult === 0,
            'is-success': bs.record.airsearchResult === 1,
            'is-great-success': bs.record.airsearchResult === 2
          }"
          >{{ getAirSearchResultText(bs.record.airsearchResult) }}</div>
          <div class="item-info"><img 
            class="item-img" :src="itemSrc(bs)" /><span 
            class="count">+{{ bs.record.items![0].itemCount }}</span></div>
      </div>

    </template>
  </div>
</template>
