<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Highcharts from 'highcharts/highstock'
import type { TimelineResult } from '@common/channel'
import {
  type ClearItemGetRecord,
  DbName,
  recordMapIdToIdNo,
  toRecordDate,
  type BattleRecord,
  type PortRecord,
  type PortRecordQueryProjection
} from '@common/record'
import {
  DispSeikuText,
  getAirSearchResultText,
  QuestCategoryText,
  QuestTypeText,
  QuestTypeTextYear,
  TacticsText
} from '@common/locale'
import {
  ApiEventId,
  ApiEventKind,
  ApiItemBonusType,
  ApiItemId,
  ApiProgressFlag,
  type ApiQuest,
  ApiQuestState,
  ApiQuestType,
  KcsUtil
} from '@common/kcs'
import InfoImg from '@assets/img/titlebar/info.svg'
import * as kcs_stuff from '@renderer/stuff/kcs_stuff'
import { mapInfoCache } from '@renderer/common/mapinfo'
import { CommonMap } from '@common/map'
import { svdata } from '@renderer/store/svdata'
import type { InheritScoreList } from '@common/store'
import * as bs from '@renderer/common/battle-score'
import { gameSetting } from '@renderer/store/gamesetting'
import { ShipImg } from '@renderer/stuff/imgs/ship'
import { RUtil } from '@renderer/util'

const props = defineProps<{
  show: boolean
  data: TimelineResult
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
}>()

const isShowQuestList = computed(() => {
  return !gameSetting.assistInGame
})

onMounted(() => {
  console.log('timeline mounted', props.data, props.show, 'assist in game:', gameSetting.assistInGame)
  if (props.show) {
    fetchAndDrawDailyScoreChart()
  }
})

interface TimelineBattleRecord extends BattleRecord {
  dropShipImgSrc: string | undefined
  isItemGet: boolean
  showAirSearchResult: boolean
}

const isItemGet = (record: BattleRecord): boolean => {
  return record.items != null && record.items.length > 0
}

const itemSrc = (record: BattleRecord): string => {
  return RUtil.itemImg(record.items![0].itemId);
}

const isQuestsValid = computed(() => props.data[0].quests != null)
const isBattleRecordsValid = computed(() => props.data[1].length > 0)

const quests = computed<ApiQuest[]>(() => props.data[0].quests ?? [])
const battleRecords = computed<TimelineBattleRecord[]>(() => {
  return props.data[1].map((record) => {
    const dropShipImgSrc = record.drop && record.drop.shipId > 0 ? ShipImg.getSrc(record.drop.shipId, false) : undefined
    const showAirSearchResult = record.eventId === ApiEventId.airBattleOrAirSsearch   
    return { ...record, dropShipImgSrc, isItemGet: isItemGet(record), showAirSearchResult }
  })
})

const questCountText = computed(
  () => ` 遂行中: ${quests.value.length} 受託可能: ${props.data[0].quest_max}`
)

function questCategoryText(quest: ApiQuest): string {
  return QuestCategoryText[quest.api_category] ?? '?'
}

function questCategoryClass(quest: ApiQuest): object {
  // Basic class mapping by category
  return { [`quest-cat-${quest.api_category}`]: true }
}

function questTypeText(quest: ApiQuest): string {
  const t = QuestTypeText[quest.api_type] ?? ''
  // Quarterly sometimes labeled with year
  if (quest.api_type === ApiQuestType.quarterly) {
    return `${t}${QuestTypeTextYear}`
  }
  return t
}

function questTypeClass(quest: ApiQuest): object {
  return { [`quest-type-${quest.api_type}`]: true }
}

function isQuestStateVisible(quest: ApiQuest): boolean {
  return (
    quest.api_state === ApiQuestState.completed || quest.api_progress_flag !== ApiProgressFlag.zero
  )
}

function questStateText(quest: ApiQuest): string {
  if (quest.api_state === ApiQuestState.completed) {
    return '達成'
  }
  const text = ['', '50%', '80%'] as const
  return text[quest.api_progress_flag] ?? ''
}

function questStateClass(quest: ApiQuest): object {
  return { 'is-completed': quest.api_state === ApiQuestState.completed }
}

function battleMapText(record: BattleRecord): string {
  const { areaId, areaNo } = recordMapIdToIdNo(record.mapId);
  const map_txt = areaId > 10 ? 'E' : areaId.toString()
  return `${map_txt}-${areaNo}`
}

function cellText(record: BattleRecord): string {
  const { areaId, areaNo } = recordMapIdToIdNo(record.mapId);
  const cellInfo = mapInfoCache.getOnlyCache(areaId, areaNo);
  let label = 'Cell:'+record.cellId.toString();
  if (cellInfo) {
    const spot = CommonMap.findSpotForLabel(cellInfo.spots, record.cellId);
    if (spot && spot.label) {
      label = spot.label;
    }
  }
  return label;
}

function dateText(date: string): string {
  const month = Number(date.substring(5, 7))
  const day = Number(date.substring(8, 10))
  return month + '/' + day
}

function timeText(date: string): string {
  return date.substring(11, 16)  
}

function toLocalDateText(date: string): string {
  return dateText(date) + ' ' + timeText(date)
}

function battleFormationText(record: BattleRecord): string {
  return TacticsText[record.formations?.[2] ?? 0] ?? ''
}

function airSearchResultText(record: TimelineBattleRecord): string {
  if (! record.showAirSearchResult) {
    return ''
  }
  const ret = getAirSearchResultText(record.airsearchResult)
  if (! ret) {
    return ''
  }
  return `航空偵察：${ret}`
}

function getNoBattleText(record: TimelineBattleRecord): string {
  const isNobattle = KcsUtil.isNobattleCellValue(record.eventKind as ApiEventKind, record.eventId)
  if (! isNobattle) {
    return ''
  }
  return '戦闘なし'
}

function getInfoText(record: TimelineBattleRecord): string {
  const airSearchText = airSearchResultText(record)
  if (airSearchText) {
    return airSearchText
  }
  return getNoBattleText(record)
}


function battleSeikuText(record: BattleRecord): string {
  return DispSeikuText[record?.seiku ?? 0] ?? ''
}

const isShow = computed(() => {
  console.log('timeline is show:', props.show)
  return props.show
})

function onBeforeInput(event: Event): void {
  // prevent content change.
  event.preventDefault()
}

function onBlur(event: Event): void {
  console.log('timeline blur', event)
  emit('update:show', false)
}

const lastBattleInfo = computed<string>(() => {
  const record: BattleRecord = props.data[1][0]
  return `${ record.rank }: ${battleMapText(record) } Cell:${ record.cellId } ${ record.enemyDeckName }`
})

const { computed: isGimmickFlagDetected  } = kcs_stuff.isGimmickFlagDetected()
const { computed: isMapChangeDetected  } = kcs_stuff.isMapChangeDetected()

interface ExpRecord {
  date: string
  exp: number
}
interface EoClearRecord {
  mapId: number
  date: string
  rate: number
}
interface QuestClearRecord {
  no: number
  date: string
  rate: number
}

const dailyScoreChartEl = ref<HTMLElement | null>(null)
const hasDailyScore = ref(false)
let dailyScoreChart: Highcharts.Chart | undefined

function toExpRecord(r: PortRecord): ExpRecord | null {
  if (!r?.date || r[ApiItemId.teitoku_exp] === undefined) {
    return null
  }
  const exp = r[ApiItemId.teitoku_exp]!
  if (exp < 0) {
    return null
  }
  return { date: r.date, exp }
}

function toExpDailyRecord(records: PortRecord[]): Map<number, ExpRecord> {
  const dailyMap = new Map<number, ExpRecord>()
  for (const r of records) {
    const exp = toExpRecord(r)
    if (!exp) {
      continue
    }
    const date = exp.date
    let day = Number(date.slice(8, 10))
    const hour = Number(date.slice(11, 13))
    if (Number.isNaN(day) || day < 1 || Number.isNaN(hour) || hour >= 24) {
      continue
    }
    if (hour < 2) {
      day -= 1
    }
    if (day < 1 || dailyMap.has(day)) {
      continue
    }
    dailyMap.set(day, exp)
  }
  return dailyMap
}

function calcDailyExp(dailyRecord: Map<number, ExpRecord>): Map<number, number> {
  const ret = new Map<number, number>()
  dailyRecord.forEach((record, day) => {
    const next = dailyRecord.get(day + 1)
    if (next) {
      ret.set(day, next.exp - record.exp)
    }
  })
  return ret
}

async function fetchEoClearRecord(year: number, month: number): Promise<EoClearRecord[]> {
  const fromDate = new Date(year, month - 1)
  const fromStr = toRecordDate(fromDate)
  const endDate = new Date(year, month, 1)
  endDate.setHours(-2, 0, 0, 0)
  const toStr = toRecordDate(endDate)

  const fetchBattleEoClear = async (): Promise<EoClearRecord[]> => {
    const query = {
      dbName: DbName.battle,
      find: {
        mapId: {
          $in: bs.eoRates.map((er) => er.mapId)
        },
        isBoss: true,
        firstClear: true,
        date: { $gte: fromStr, $lt: toStr }
      },
      sort: { date: 1 },
      projection: {
        mapId: 1,
        date: 1
      }
    }
    const records = await window.api.queryDb(query) as BattleRecord[]
    return records.map((r) => (
      { mapId: r.mapId, date: r.date, rate: bs.getEoRateByMapId(r.mapId) }))
  }

  const fetchItemGetEoClear = async (): Promise<EoClearRecord[]> => {
    const query = {
      dbName: DbName.battle,
      find: {
        mapId: { $in: [16] },
        items: {
          $elemMatch: {
            eoRate: { $exists: true }
          }
        },
        date: { $gte: fromStr, $lt: toStr }
      },
      sort: { date: 1 },
      projection: {}
    }
    const records = await window.api.queryDb(query) as BattleRecord[]
    return records.reduce<EoClearRecord[]>((acc, r) => {
      r.items?.forEach((it) => {
        if (it.eoRate) {
          acc.push({ mapId: r.mapId, date: r.date, rate: it.eoRate })
        }
      })
      return acc
    }, [])
  }

  const [battleClears, itemClears] = await Promise.all([fetchBattleEoClear(), fetchItemGetEoClear()])
  return [...battleClears, ...itemClears].sort((a, b) => a.date.localeCompare(b.date))
}

async function fetchQuestClearRecord(year: number, month: number): Promise<QuestClearRecord[]> {
  const fromDate = new Date(year, month - 1, 0)
  fromDate.setHours(5, 0, 0, 0)
  const endDate = new Date(year, month, 0)
  endDate.setHours(14, 0, 0, 0)
  const quarterlyFromDate = new Date(year, month - 1)
  quarterlyFromDate.setHours(5, 0, 0, 0)
  const quarterlyFromStr = toRecordDate(quarterlyFromDate)

  const query = {
    dbName: DbName.clearitemget,
    find: {
      'bonuses.api_type': ApiItemBonusType.senka,
      date: {
        $gte: toRecordDate(fromDate),
        $lt: toRecordDate(endDate)
      }
    },
    sort: { date: 1 },
    projection: {
      questNo: 1,
      questName: 1,
      bonuses: 1,
      date: 1
    }
  }
  const records = await window.api.queryDb(query) as ClearItemGetRecord[]
  return records.map((r) => {
    const rate = (r.bonuses ?? []).reduce((acc, el) => {
      if (bs.isQuarterlyQuest(r.questNo) && r.date < quarterlyFromStr) {
        return acc
      }
      if (el.api_type === ApiItemBonusType.senka) {
        return acc + el.api_count
      }
      return acc
    }, 0)
    return {
      no: r.questNo,
      rate,
      date: r.date
    }
  })
}

async function fetchCurrentMonthDailyScores(): Promise<{
  categories: string[]
  tooltipCategories: string[]
  scores: number[]
  cumulativeScores: number[]
}> {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const fromDate = new Date(year, month - 1)
  fromDate.setHours(2, 0, 0, 0)
  const endDate = new Date(year, month, 1)
  endDate.setHours(2, 0, 0, 0)

  const projection: PortRecordQueryProjection = { date: 1 }
  projection[ApiItemId.teitoku_exp] = 1

  const query = {
    dbName: DbName.port,
    find: {
      date: {
        $gte: toRecordDate(fromDate),
        $lt: toRecordDate(endDate)
      }
    },
    sort: { date: 1 },
    projection
  }
  const records = await window.api.queryDb(query) as PortRecord[]
  if (records.length === 0) {
    return { categories: [], tooltipCategories: [], scores: [], cumulativeScores: [] }
  }

  const dailyMap = toExpDailyRecord(records)
  if (dailyMap.size === 0) {
    return { categories: [], tooltipCategories: [], scores: [], cumulativeScores: [] }
  }

  const lastDay = Math.max(...dailyMap.keys())
  dailyMap.set(lastDay + 1, {
    date: toRecordDate(now),
    exp: svdata.basic.api_experience
  })

  const dailyExpMap = calcDailyExp(dailyMap)
  const inheritScoreList = await window.api.getInheritScoreList() as InheritScoreList
  const [eoClears, questClears] = await Promise.all([
    fetchEoClearRecord(year, month),
    fetchQuestClearRecord(year, month)
  ])
  const eoRateByDate = eoClears.reduce<Map<number, number>>((acc, rec) => {
    const day = Number(rec.date.slice(8, 10))
    if (!Number.isNaN(day)) {
      acc.set(day, (acc.get(day) ?? 0) + rec.rate)
    }
    return acc
  }, new Map<number, number>())
  const questRateByDate = questClears.reduce<Map<number, number>>((acc, rec) => {
    const day = Number(rec.date.slice(8, 10))
    if (!Number.isNaN(day)) {
      acc.set(day, (acc.get(day) ?? 0) + rec.rate)
    }
    return acc
  }, new Map<number, number>())

  const inheritScore = inheritScoreList.inheritScores.find((s) => s.year === year)
  const initialScore = inheritScore ? inheritScore.scores[month - 1] : 0

  const maxDay = now.getHours() < 2 ? now.getDate() -1 : now.getDate()
  const categories: string[] = []
  const tooltipCategories: string[] = []
  const scores: number[] = []
  const cumulativeScores: number[] = []
  let cumulative = initialScore
  for (let day = 1; day <= maxDay; day++) {
    const date = new Date(year, month - 1, day)
    const dayTxt = `${date.getMonth() + 1}/${date.getDate()}`
    categories.push(dayTxt)
    tooltipCategories.push(dayTxt+'('+date.toLocaleString(undefined, { weekday: 'short' })+')')
    const exp = dailyExpMap.get(day) ?? 0
    const score = Math.floor(Math.round((exp * 7 / 10000) * 100) / 100)
    scores.push(score)
    cumulative += score + (eoRateByDate.get(day) ?? 0) + (questRateByDate.get(day) ?? 0)
    cumulativeScores.push(Math.round(cumulative * 100) / 100)
  }

  // カテゴリ数が少ないと視認性が悪く空データで埋める
  const FIX_MIN_CATEGORY_COUNT = 9;
  if (categories.length < FIX_MIN_CATEGORY_COUNT) {
    categories.push(...Array(FIX_MIN_CATEGORY_COUNT - categories.length).fill(''))
    scores.push(...Array(FIX_MIN_CATEGORY_COUNT - scores.length).fill(null))
  }
  return { categories, tooltipCategories, scores, cumulativeScores }
}

function hexToRgba(hex: string, alpha = 1) {
  let h = hex.replace('#','');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = parseInt(h.slice(0,2), 16);
  const g = parseInt(h.slice(2,4), 16);
  const b = parseInt(h.slice(4,6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function drawDailyScoreChart(
  categories: string[],
  tooltipCategories: string[],
  scores: number[],
  cumulativeScores: number[]
): void {
  if (!dailyScoreChartEl.value) {
    return
  }

  const stops: Array<Highcharts.GradientColorStopObject> = [
    [0, '#fa4fed'],
    [1, '#5897ff']
  ]
  const grad = {
    //linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 }, // 横方向のグラデ
    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, // 縦方向のグラデ
    stops
  }

  const chartBackgroundColor = hexToRgba('#344d90', 0.2);

  const options: Highcharts.Options = {
    chart: {
      renderTo: dailyScoreChartEl.value,
      backgroundColor: 'transparent',
      height: 190,
      spacingTop: 16,
      spacingBottom: 4,
    },
    title: { text: undefined },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: {
      categories,
      labels: { style: { color: '#cfcfcf', fontSize: '11px' } },
      crosshair: true,
    },
    yAxis: [
      {
        title: { text: undefined },
        min: 0,
        labels: { style: { color: '#cfcfcf', fontSize: '11px' } },
        gridLineColor: 'rgba(255,255,255,0.15)'
      },
      {
        title: { text: undefined },
        min: 0,
        opposite: true,
        labels: { style: { color: '#8ec5ff', fontSize: '11px' } },
        gridLineWidth: 0,
        plotBands: [{
          from: 0,
          to: 50000,
          color: chartBackgroundColor,
          zIndex: 3
        }],
      }
    ],
    tooltip: {
      shared: true,
      useHTML: true,
      backgroundColor: '#000',
      style: { color: '#fff' },
      formatter: function (this: Highcharts.TooltipFormatterContextObject): string {
        const points = this.points ?? []
        const index = points.length > 0 ? points[0].point.index : 0
        const dateLabel = tooltipCategories[index] ?? `${this.x}`
        let html = `<span style="line-height:18px;">${dateLabel}</span><br/>`
        points.forEach((p) => {
          //console.log('tooltip point', p)
          const color = typeof p.color === 'string' ? p.color : '#5897ff'
          html += `<span style="color:${color}">\u25cf</span> ${p.series.name}: ${Math.trunc(p.y)}<br/>`
        })
        return html
      }
    },
    plotOptions: {
      column: { 
        dataLabels: {
          enabled: true,         // 棒の上に数値表示
          inside: false,         // 棒の外側に表示（true で棒内）
          style: { 
            fontSize: '10px',
            color: '#ffffff',
            textShadow: '0px 0px 6px #37bd5f',
          },
          formatter() {
            const val = Math.floor(this.y!)
            if (! val || val === 0) {
              return ''
            }
            return String(Math.floor(this.y!)) 
          }
        },
      }, 
      spline: {
        dataLabels: {
          enabled: true,         // 折れ線の各点に数値表示
          align: 'center',
          verticalAlign: 'bottom',
          y: -6,
          style:{
            fontSize: '11px',
            color: '#000000',
            textShadow: '0 0 6px #bbb',
          },
          formatter() { return String(Math.floor(this.y!)) }
        },
        lineWidth: 1,
        marker: { enabled: true },
      },
    },
    series: [
      {
        type: 'column',
        name: '当日戦果',
        data: scores,
        color: '#60fa4b'
      },
      {
        type: 'spline',
        name: '累積戦果',
        data: cumulativeScores,
        yAxis: 1,
        color: grad,
        lineWidth: 1,
        marker: {
            lineWidth: 2,
            lineColor: '#4840d6',
            fillColor: '#fff'
        },
      }
    ]
  }

  if (!dailyScoreChart) {
    dailyScoreChart = Highcharts.chart(options)
    return
  }

  dailyScoreChart.update(options, true, true)
}

const scoreChartStateText = ref(svdata.isShipDataOk ? '当月戦果データを取得中...' : 'GAME開始前により戦果チャートが表示できません');
async function fetchAndDrawDailyScoreChart(): Promise<void> {
  try {
    const { categories, tooltipCategories, scores, cumulativeScores } = await fetchCurrentMonthDailyScores()
    // クエリできればデータなしでも成功
    // データなしの場合はチャートに「NO DATA」テキストが出る
    hasDailyScore.value = categories.length > 0
    console.log('fetched daily score data', { categories, tooltipCategories, scores, cumulativeScores })
    await nextTick()
    drawDailyScoreChart(categories, tooltipCategories, scores, cumulativeScores)
  } catch (err) {
    console.error('timeline fetchCurrentMonthDailyScores error:', err)
    scoreChartStateText.value = '当月戦果データの取得に失敗しました。'
    hasDailyScore.value = false
  }
}

watch(
  () => props.show,
  (show) => {
    if (show) {
      fetchAndDrawDailyScoreChart()
    }
  }
)

onBeforeUnmount(() => {
  if (dailyScoreChart) {
    dailyScoreChart.destroy()
    dailyScoreChart = undefined
  }
})

const isNoAssist = computed(() => !gameSetting.assistInGame)

</script>

<template>
  <div
    class="timeline-root"
    contenteditable="true"
    @beforeinput="onBeforeInput"
    :class="{ 'is-block': isShow, 'is-no-assist': isNoAssist }"
    @blur="onBlur"
  >
    <section v-if="isShowQuestList">
      <div class="timeline-title px-1">
        <div>遂行中任務</div>
        <div v-if="isQuestsValid">{{ questCountText }}</div>
      </div>
      <div class="px-2 py-1">
        <div class="quest-content" v-if="isQuestsValid">
          <div class="mr-1" v-for="(quest, q_index) in quests" :key="q_index">
            <span class="quest-category" :class="questCategoryClass(quest)">{{
              questCategoryText(quest)
            }}</span>
            <span class="quest-type mr-1" :class="questTypeClass(quest)">{{
              questTypeText(quest)
            }}</span>
            <span>{{ quest.api_title }}</span>
            <span
              v-if="isQuestStateVisible(quest)"
              class="quest-state"
              :class="questStateClass(quest)"
              >{{ questStateText(quest) }}</span
            >
          </div>
        </div>
        <div v-else class="quest-content">
          <div class="quest-help help-text">
            <span class="img mr-2"><InfoImg /></span>クエスト情報が未取得です。任務(クエスト)画面を開いてください。
          </div>
        </div>
      </div>
    </section>
    <section v-if="isGimmickFlagDetected">
      <div class="timeline-title px-1">ギミック</div>
      <div>ギミック解除音を検知しました。</div>
      <div>直近戦闘 {{ lastBattleInfo }}</div>
    </section>
    <section v-if="isMapChangeDetected">
      <div class="timeline-title px-1">海域変化ギミック</div>
      <div>海域変化を検知しました。</div>
      <div>直近戦闘 {{ lastBattleInfo }}</div>
    </section>
    <section>
      <div class="timeline-title px-1">
        <span>当日戦果</span>
        <span class="is-right">累積戦果</span>
      </div>
      <div class="px-2 py-0 daily-score-chart-container">
        <div ref="dailyScoreChartEl" class="daily-score-chart"></div>
        <div v-if="!hasDailyScore" class="daily-score-help">
          {{ scoreChartStateText }}
        </div>
      </div>
    </section>
    <section>
      <div class="timeline-title px-1">出撃履歴</div>
      <div v-if="isBattleRecordsValid">
        <div class="card" v-for="(record, b_index) in battleRecords" :key="b_index">
          <div class="card-content">
            <div class="media">
              <div class="media-left">
                <div class="rank">
                  <span>{{ record.rank }}</span>
                </div>
              </div>
              <div class="media-content is-overflow-hidden">
                <p class="subtitle is-7">
                  {{ toLocalDateText(record.date) }}
                  <span v-if="record.drop && record.drop.shipId === -2">母港FULL</span>
                  <span v-if="record.drop && record.drop.shipId > 0"
                    >Drop: {{ record.drop.shipName }}</span
                  >
                </p>
                <p class="title is-6">
                  {{ battleMapText(record) }} {{ cellText(record) }}
                  <span class="tag is-radiusless is-danger is-normal" v-if="record.isBoss"
                    >BOSS</span
                  >
                  {{ record.enemyDeckName }} {{ battleSeikuText(record) }}
                  {{ battleFormationText(record) }}
                  <span class="info-text">{{ getInfoText(record) }}</span>
                </p>
              </div>
              <div class="media-right" v-if="record.dropShipImgSrc">
                <figure>
                  <img
                    class="ship-bunner"
                    :src="record.dropShipImgSrc"
                  />
                </figure>
              </div>
              <div class="media-right get-items" v-if="record.isItemGet">
                <div class="item-info"><img 
                  class="item-img" :src="itemSrc(record)" /><span 
                  class="count">+{{ record.items![0].itemCount }}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="mx-2 my-2 timeline-battle help-text">
          <span class="img mr-2"><InfoImg /></span>出撃履歴がありません。
        </div>
      </div>
    </section>
  </div>
</template>
