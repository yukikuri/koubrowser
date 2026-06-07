<script setup lang="ts">
import { computed, ref, toRaw } from 'vue'
import { onMounted, onUnmounted } from 'vue'
import Highcharts, { AxisLabelsFormatterContextObject, SeriesFlagsOptions, SeriesOptionsType, Tooltip, XAxisOptions, YAxisOptions } from 'highcharts/highstock'
import noDataToDisplay from 'highcharts/modules/no-data-to-display'
import { 
  BattleRecord, 
  ClearItemGetRecord, 
  DbName, 
  PortRecord, 
  PortRecordQueryProjection, 
  Quest, 
  recordMapIdToIdNo, 
  toRecordDate } from '@common/record'
import { localDatesInMonth } from '@common/calc_record'
import { ApiCallback, ApiGaugeType, ApiItemBonusType, ApiItemId, KcsUtil } from '@common/kcs'
import { svdata } from '@renderer/store/svdata'
import { questProgressDetailFormat } from '@common/kcquest'
import { Api } from '@common/kcsapi'
import { InheritScoreList, MonthScores } from '@common/store'
import { replaceArray } from '@common/ts'
import * as sesStorage from '@renderer/store/ses-storage'
import { questList } from '@renderer/store/questList'
import * as bs from '@renderer/common/battle-score'
import ForecastChartImage from '@assets/img/forecast-chart.svg'
import CheckImage from '@assets/img/check-only.svg'

noDataToDisplay(Highcharts)

type DateRange = {
  start: Date;
  end: Date;
}

type DateRangeStr = {
  start: string;
  end: string;
}

/////////////////////////////////////////////////////////////////////////////////////
// デバッグログ
const DEBUG = 0;

const debug = (...args: any[]) => {
  if (DEBUG) console.debug("[BattleScore]", ...args);
};

/////////////////////////////////////////////////////////////////////////////////////
// 
const abortController = new AbortController();
const chartEl = ref<HTMLElement | null>(null);
const isLoading = ref(true);
let cbPort = 0
let cbClearItemGet = 0
const inheritScoreList: InheritScoreList = { inheritScores: [] };

/////////////////////////////////////////////////////////////////////////////////////
// タスク進行中表示用
const taskContentsOk = ref(false)
const taskContentsVisible = ref(false)

/////////////////////////////////////////////////////////////////////////////////////
// 期間選択関連
const yearMonthList = ref<string[]>([])
const yearMonthListOk = ref(false)
const indexYearMonth = ref<number>(-1);
const isPeriodCurrentMonth = computed((): boolean => {
  if (! yearMonthListOk.value) {
    return false;
  }
  return indexYearMonth.value === yearMonthList.value.length - 1;
})
const isCurrentMonthDataAvailable = ref(false)

/////////////////////////////////////////////////////////////////////////////////////
// 戦果予測関連
const isForecastScore = ref(
  sesStorage.getBoolean(sesStorage.StorageKeyName.BattleScoreIsForecast) ?? false
);

function toggleForecastScore() {
  isForecastScore.value = ! isForecastScore.value
  sesStorage.setBoolean(
    sesStorage.StorageKeyName.BattleScoreIsForecast,
    isForecastScore.value
  );

  applyPeriod(false)
}

interface ForecastableTask {
  setTempCleared: boolean;
  taskKey: number
}

interface ForecastableSesValue {
  tempClears: { [key: number]: boolean };
}

/**
 * 各タスクを「本日以降」の月内日付に対して
 * 月末から順に重複が無いよう割り当て（タスク数 > 日数 の場合は均等に分配）
 *
 * @param tasks タスク配列（任意のオブジェクト）
 * @param startDate 割当開始日
 * @param lastDate 割当最終日
 * @returns 日付キーにした割当配列
 */
function distributeTasks<T>(
  tasks: T[],
  startDate: number,
  lastDate: number
): Map<number, T[]> {

  const dates: number[] = [];
  for (let d = startDate; d <= lastDate; d++) dates.push(d);

  const result: Map<number, T[]> = new Map();
  const nDays = dates.length;
  if (nDays === 0) return result;

  // 月末から順に割り当て、タスクが日数を超える場合は循環して均等割り当てになる
  // i=0 -> 最終日, i=1 -> 最終日-1, ... i=nDays -> 最終日 (2回目のサイクル)
  for (let i = 0; i < tasks.length; i++) {
    const cycleIndex = i % nDays;
    const dayIndexFromEnd = nDays - 1 - cycleIndex;
    const day = dates[dayIndexFromEnd];
    if (! result.has(day)) {
      result.set(day, []);
    }
    result.get(day)!.push(tasks[i]);
  }

  return result;
}

/////////////////////////////////////////////////////////////////////////////////////
// quest clear state
interface QuestClearState extends bs.QuestInfo, ForecastableTask {
  isCleared: boolean;
  rate: number;
  clearDate?: string;
  clearDateDisplay?: string;
  progressDetail?: string;
}

// todo not all data, gen by fetched data
// todo del task content visible variable, use transition tag
const DEF_TEMP_CLEAR_STATE = true
const questClearStateList = () : QuestClearState[] => {
  const ret: QuestClearState[] = []
  const sesValue = sesStorage.getValue<ForecastableSesValue>(
    sesStorage.StorageKeyName.BattleScoreForecastableClears
  );

  bs.quarterlyQuests.reduce((acc, q) => {
    ret.push({
      no: q.no,
      name: q.name,
      isCleared: false,
      rate: KcsUtil.questSenka(q.no),
      setTempCleared: sesValue?.tempClears?.[q.no] ?? DEF_TEMP_CLEAR_STATE,
      taskKey: q.no,
    })
    return acc;
  }, ret);

  bs.yearlyQuests.reduce((acc, q) => {
    ret.push({
      no: q.no,
      name: q.name,
      isCleared: false,
      rate: KcsUtil.questSenka(q.no),
      setTempCleared: sesValue?.tempClears?.[q.no] ?? DEF_TEMP_CLEAR_STATE,
      taskKey: q.no,
    })
    return acc;
  }, ret);

  // イベント任務も追加
  // クエスト一覧で該当する戦果任務があれば追加する
  bs.eventQuests.forEach((q) => {
    // API応答からチェック
    let exist = svdata.questlist?.api_list.find((e) => e.api_no === q.no);
    if (! exist) {
      // 保存した最後のAPI応答チェック
      exist = questList.api_list.find((e) => e.api_no === q.no);
    }

    if (! exist) {
      // 該当戦果任務なし
      return;
    }

    // 戦果任務として追加
    ret.push({
      no: q.no,
      name: q.name,
      isCleared: false,
      rate: KcsUtil.questSenka(q.no),
      setTempCleared: sesValue?.tempClears?.[q.no] ?? DEF_TEMP_CLEAR_STATE,
      taskKey: q.no,
    })
  });

  return ret;
}
const questClearStates = ref<QuestClearState[]>(questClearStateList());

function updateQuestClearState(clears: QuestClears, states: { quarterly: Quest[], yearly: Quest[] }) {
  const quests = states.quarterly.concat(states.yearly);
  questClearStates.value.forEach((q) => {
    let rec = clears.alreadyCompleted.find((e) => e.no === q.no);
    if (! rec) {
      rec = clears.thisMonth.find((e) => e.no === q.no);
    }

    if (rec) {
      q.isCleared = true;
      q.clearDate = rec.date;
      q.clearDateDisplay = rec.date.slice(0,10).replace(/-/g,'/')+' 済'
      q.progressDetail = undefined;
      if (rec.questName) {
        q.name = rec.questName;
      }
    } else {
      q.isCleared = false;
      q.clearDate = undefined;
      q.clearDateDisplay = '未達成'
      q.progressDetail = undefined;
      const quest = quests.find((e) => e.no === q.no);
      if (quest) {
        q.progressDetail = questProgressDetailFormat(quest)
        q.progressDetail = q.progressDetail.replace('7-2S(第1)', '7-2-1S');
        q.progressDetail = q.progressDetail.replace('7-2S(第2)', '7-2-2S');
      }
    }
  });
}



/////////////////////////////////////////////////////////////////////////////////////
// eo clear state
interface EoClearState extends bs.EoInfo, ForecastableTask {
  isCleared: boolean;
  clearDate?: string;
  clearDateDisplay?: string;
}

const eoClearStateList = () : EoClearState[] => {
  const ret: EoClearState[] = []
  const sesValue = sesStorage.getValue<ForecastableSesValue>(
    sesStorage.StorageKeyName.BattleScoreForecastableClears
  );

  bs.eoRates.reduce((acc, er) => {
    ret.push({
      mapId: er.mapId,
      name: er.name,
      rate: er.rate,
      isCleared: false,
      setTempCleared: sesValue?.tempClears?.[er.mapId] ?? DEF_TEMP_CLEAR_STATE,
      taskKey: er.mapId,
    })
    return acc;
  }, ret);
  return ret;
}
const eoClearStates = ref<EoClearState[]>(eoClearStateList());

function getGuageInfo(mapId: number): {count: number, countMax: number} | undefined {
  const { areaId, areaNo } = recordMapIdToIdNo(mapId);
  const mi = svdata.mapinfoFrom(areaId, areaNo);
  debug('getGuageInfo mapId:', mapId, ' areaId:', areaId, ' areaNo:', areaNo, ' mi:', mi);
  if (! mi) {
    return undefined;
  }
  if (! mi.api_gauge_type || undefined === mi.api_defeat_count || undefined === mi.api_required_defeat_count) {
    return undefined;
  }
  if (mi.api_gauge_type === ApiGaugeType.counter) {
    return { count: mi.api_defeat_count, countMax: mi.api_required_defeat_count }
  }
  return undefined;
}

function updateEoClearState(clears: EoClearRecord[]) {

  eoClearStates.value.forEach((q) => {
    const rec = clears.find((e) => e.mapId === q.mapId);
    if (rec) {
      q.isCleared = true;
      q.clearDate = rec.date;
      q.clearDateDisplay = rec.date.slice(0,10).replace(/-/g,'/')+' 済'
    } else {
      q.isCleared = false;
      q.clearDate = undefined;
      const gi = getGuageInfo(q.mapId);
      debug('eo guage info mapId:', q.mapId, gi);
      if (gi) {
        q.clearDateDisplay = `ゲージ ${gi.count}/${gi.countMax}`
      } else {
        q.clearDateDisplay = '未攻略'
      }
    }
  });
}

/////////////////////////////////////////////////////////////////////////////////////
// Highcharts Battle Score Chart
const SeriesTypes = {
  total: 'total',
  daily: 'daily',
  eo: 'eo',
  quest: 'quest',
  flags: 'flags',
  forecastTotal: 'forecastTotal',
  forecastDaily: 'forecastDaily',
  forecastEo: 'forecastEo',
  forecastQuest: 'forecastQuest',
} as const;
type SeriesTypes = (typeof SeriesTypes)[keyof typeof SeriesTypes]

let chart: Highcharts.Chart | undefined

interface ExpRecord {
  date: string;
  exp: number;
}

interface EoClearRecord {
  mapId: number;
  date: string;
  rate: number;
}

interface QuestClearRecord {
  no: number;
  questName?: string;
  date: string;
  rate: number;
}

interface QuestClears {
  thisMonth: QuestClearRecord[];
  alreadyCompleted: QuestClearRecord[];
}

type nullableNumber = number | null;
interface ChartInfo {
  year: number;  // 年
  month: number; // 月
  scorePerDateColumn: nullableNumber[]; // 日別戦果値（チャート用）
  eoClearRatesColumn: nullableNumber[]; // 日別EO戦果値（チャート用）
  questClearRatesColumn: nullableNumber[]; // 日別任務戦果値（チャート用）

  flags: FlagsData[]; // チャートflags用データ
  cumulativeSumScore: number[]; // 日別累計戦果値（全データ）

  categories: number[]; // チャートx軸日付カテゴリ
  cumulativeSumScoreLine: nullableNumber[]; // 日別累計戦果値 nullはチャート表示されない
  forecastScoreLine?: nullableNumber[]; // 日別戦果予測値 nullはチャート表示されない
  forecastScorePerDateColumn?: nullableNumber[]; // 日別戦果予測値（チャート用）
  forecastEoClearRatesColumn?: nullableNumber[]; // 日別EO予測戦果値（チャート用）
  forecastQuestClearRatesColumn?: nullableNumber[]; // 日別任務予測戦果値（チャート用）

  eoClears: EoClearRecord[]; // EO攻略記録
  questClears: QuestClearRecord[]; // 該当月での任務クリア記録

  isForecastScore: boolean; // 戦果予測情報がある場合、true
}

interface FlagsData {
  x: number;
  title: string;
  id: typeof SeriesTypes.flags
}

function toChartInfo(
  isForecastScore: boolean,
  year: number,
  month: number,
  dailyExpMap: Map<number, number>,
  eoClears: EoClearRecord[],
  questClears: QuestClears,
): ChartInfo {

  // レコードを処理しやすい形式に変換
  const dailyExp: { date: number; exp: number }[] = [];
  dailyExpMap.forEach((exp, date) => {
    dailyExp.push({ date, exp });
  });
  dailyExp.sort((a, b) => a.date - b.date);

  const eoClearRates: { date: number; rate: number }[] = eoClears.map((ec) => {
    const day = Number(ec.date.slice(8, 10));
    return { date: day, rate: ec.rate };
  });
  eoClearRates.sort((a, b) => a.date - b.date);

  const questClearRates: { date: number; rate: number }[] = questClears.thisMonth.map((ec) => {
    const day = Number(ec.date.slice(8, 10));
    return { date: day, rate: ec.rate };
  });
  questClearRates.sort((a, b) => a.date - b.date);

  // x軸カテゴリ
  // 戦果予測を行う場合、当月最終日まで表示
  let categories: number[] = [];
  const availableDates = dailyExp.map((d) => d.date);
  if (isForecastScore) {
    const monthDates = localDatesInMonth(year, month);
    categories = monthDates.map((d) => d.getDate());
  } else {
    categories = availableDates;
  }

  debug('chart info categories:', categories);

  // 日付単位の戦果計算
  const expPerDate = categories.map((day) => dailyExp.find((d) => d.date === day)?.exp ?? 0);
  const scorePerDate = expPerDate.map((exp) => Math.floor(exp * 7.0 / 10000));

  // 該当月の引継ぎ戦果値
  const inheritScore = inheritScoreList.inheritScores.find(s => s.year === year);
  let initialScore = 0;
  if (inheritScore) {
    initialScore = inheritScore.scores[month -1];
  }

  // 戦果予測値計算
  let forcastPerDateScores: number[] | undefined;
  let forecastDateStart: number | undefined;
  if (isForecastScore) {
    const now = new Date();
    forecastDateStart = now.getHours() < 2 ? now.getDate() : now.getDate()+1

    // 予測開始日が当月最終日を超える場合、予測しない
    const lastDate = categories[categories.length -1];
    if (forecastDateStart <= lastDate) {
      // 本日を除き過去3日間の平均値を使用
      const avgStartIndex = forecastDateStart-1-4
      const pastRecs = scorePerDate.slice(avgStartIndex, avgStartIndex+3);
      debug('toChartInfo pastRecs slice:', scorePerDate, '=>', pastRecs, { avgStartIndex, forecastDateStart, lastDate, });
      let avgScore = 0;
      if (pastRecs.length > 0) {
        avgScore = pastRecs.reduce((acc, cur) => acc + cur, 0) / pastRecs.length;
      } else {
        // 3日間データが無い場合は、当日までの値で計算
        const availableScores = scorePerDate.slice(0, Math.max(forecastDateStart-2, 1));
        avgScore = availableScores.reduce((acc, cur) => acc + cur, 0) / availableScores.length;
        debug('toChartInfo availableScores2:', { availableScores, forecastDateStart, avgScore });
      }

      // 日々の戦果予測値設定
      forcastPerDateScores = categories.map((date) => {
        if (date < forecastDateStart!) {
          return 0;
        }
        return avgScore;
      });

      debug('toChartInfo pastRecs:', pastRecs, 'avg:', avgScore, 
        'for date start:', forecastDateStart, 'forcastPerDateScores:', forcastPerDateScores, scorePerDate);
    }
  }

  // EO/任務戦果計算
  const eoClearRatesColumn = categories.map((day) => {
    const rate = eoClearRates.reduce((acc, el) => {
      if (el.date === day) {
        return acc+el.rate
      }
      return acc;
    }, 0);
    return rate ? rate : null;
  });
  const questClearRatesColumn = categories.map((day) => {
    const rate = questClearRates.reduce((acc, el) => {
      if (el.date === day) {
        return acc+el.rate
      }
      return acc;
    }, 0);
    return rate ? rate : null;
  });

  // EO/任務戦果予測計算
  let forecastEoClearRatesColumn: nullableNumber[] | undefined;
  let forecastQuestClearRatesColumn: nullableNumber[] | undefined;
  if (isForecastScore) {
    const lastDate = categories[categories.length -1];
    const startDate = Math.min(forecastDateStart!, lastDate)

    forecastEoClearRatesColumn = categories.map((_v, i) => (i+1) >= startDate ? 0 : null);
    forecastQuestClearRatesColumn = categories.map((_v, i) => (i+1) >= startDate ? 0 : null);

    const forecastEoClears: ForecastableTask[] = eoClearStates.value.filter((e) => !e.isCleared && e.setTempCleared);
    const forecastQuestClears = questClearStates.value.filter((e) => ! e.isCleared && e.setTempCleared);
    const tasks = forecastEoClears.concat(forecastQuestClears).reverse();
    if (tasks.length > 0) {

      // タスクを日別で振り分け
      const assignedTasks = distributeTasks<ForecastableTask>(
        tasks,
        startDate,
        lastDate
      );
      debug('forecast assigned tasks:', assignedTasks);

      for (const [date, tasks] of assignedTasks) {
        tasks.forEach((task) => {
          const questTask = questClearStates.value.find((t) => t.taskKey === task.taskKey);
          if (questTask) {
            forecastQuestClearRatesColumn![date-1]! += questTask.rate;
          } else {
            const eoTask = eoClearStates.value.find((t) => t.taskKey === task.taskKey);
            if (eoTask) {
              forecastEoClearRatesColumn![date-1]! += eoTask.rate;
            }
          }
        });
      }
      debug('forecast EO rates:', forecastEoClearRatesColumn, 
        'forecast Quest rates:', forecastQuestClearRatesColumn);
    }
  }

  // 累計戦果計算
  const cumulativeSumScore = scorePerDate.reduce((acc: number[], cur: number, index) => {
    // accの最後の要素（これまでの合計）に現在の値を足す
    // 配列が空の場合は「該当月の引き月戦果値」をベースにする
    const lastSum = acc.length > 0 ? acc[acc.length - 1] : initialScore;
    const eoRate = eoClearRatesColumn[index] ?? 0
    const questClearRate = questClearRatesColumn[index] ?? 0
    const forcastScore = forcastPerDateScores ? forcastPerDateScores[index] : 0;
    const forecastEoRate = forecastEoClearRatesColumn ? (forecastEoClearRatesColumn[index] ?? 0) : 0;
    const forecastQuestClearRate = forecastQuestClearRatesColumn ? (forecastQuestClearRatesColumn[index] ?? 0) : 0;
    acc.push(lastSum + cur + eoRate + questClearRate + forcastScore + forecastEoRate + forecastQuestClearRate);
    return acc;
  }, []);

  // チャート上のフラグ位置決定
  // EO/任務達成予測はフラグ表示しない
  const flags = categories.reduce<FlagsData[]>((acc, ec) => {
    const isEoClear = (eoClearRatesColumn[ec -1] ?? 0) > 0;
    const isQuestClear = (questClearRatesColumn[ec -1] ?? 0) > 0;
    if (isEoClear || isQuestClear) {
      let title = '';
      if (isEoClear && isQuestClear) {
        title = 'EO/任務';
      } else if (isEoClear) {
        title = 'EO';
      } else if (isQuestClear) {
        title = '任務';
      }
      acc.push({
        x: ec-1,
        title,
        id: SeriesTypes.flags,
      });
    }
    return acc
  }, []);

  // 予測する場合、チャート上に表示しない部分をnullに設定
  type nullableNumber = number | null;
  const cumulativeSumScoreLine: (nullableNumber)[] = isForecastScore ? 
    cumulativeSumScore.map((v, i) => {
      if ((i + 1) >= forecastDateStart!) {
        return null
      }
      return v;
    }) : cumulativeSumScore;
  const scorePerDateColumn : (nullableNumber)[] = isForecastScore ? 
    scorePerDate.map((v, i) => {
      if ((i + 1) >= forecastDateStart!) {
        return null
      }
      return v;
    }) : scorePerDate;
   let forecastScoreLine: (nullableNumber)[] | undefined;
   let forecastScorePerDateColumn: (nullableNumber)[] | undefined;
   if (isForecastScore && forecastDateStart !== undefined) {
     forecastScoreLine = cumulativeSumScore.map((v, i) => {
       if ((i + 2 ) >= forecastDateStart!) {
         return v;
       }
       return null;
     });
     forecastScorePerDateColumn = categories.map((date, i) => {
       if (date < forecastDateStart!) {
         return null;
       }
       return forcastPerDateScores ? forcastPerDateScores[i] : 0;
     });
   }

  return {
    year,
    month,
    scorePerDateColumn,
    eoClearRatesColumn,
    questClearRatesColumn,
    flags,
    cumulativeSumScore,
    categories,
    cumulativeSumScoreLine,
    forecastScoreLine,
    forecastScorePerDateColumn,
    forecastEoClearRatesColumn,
    forecastQuestClearRatesColumn,
    eoClears,
    questClears: questClears.thisMonth,
    isForecastScore,
  };
}

/////////////////////////////////////////////////////////////////////////////////////
// Highcharts module拡張
declare module 'highcharts' {
  interface Chart {
    __chartInfo?: ChartInfo
  }
}

const seriasColors = [
  '#4bb8fa', // 累計戦果
  '#60fa4b', // 当日戦果
  '#fae54b', // EO戦果
  '#dc5856', // 任務戦果
  '#fa4fed' // 予測値
]

const colorFromSeriesType = (type: SeriesTypes, isValue: boolean): string => {
  if (type === SeriesTypes.total) {
    return seriasColors[0];
  }
  if (type === SeriesTypes.forecastTotal) {
    if (isValue) {
      return seriasColors[4];
    }
    return seriasColors[0];
  }
  if (type === SeriesTypes.daily) {
    return seriasColors[1];
  }
  if (type === SeriesTypes.forecastDaily) {
    if (isValue) {
      return seriasColors[4];
    }
    return seriasColors[1];
  }
  if (type === SeriesTypes.eo) {
    return seriasColors[2];
  }
  if (type === SeriesTypes.forecastEo) {
    if (isValue) {
      return seriasColors[4];
    }
    return seriasColors[2];
  }
  if (type === SeriesTypes.quest) {
    return seriasColors[3];
  }
  if (type === SeriesTypes.forecastQuest) {
    if (isValue) {
      return seriasColors[4];
    }
    return seriasColors[3];
  }
  return '#ffffff';
}

function hexToRgba(hex: string, alpha = 1) {
  let h = hex.replace('#','');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = parseInt(h.slice(0,2), 16);
  const g = parseInt(h.slice(2,4), 16);
  const b = parseInt(h.slice(4,6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const getWeekDayText = (year: number, month: number, date: number): string => {
  const dowNames = ['日','月','火','水','木','金','土'];
  const dt = new Date(year, month - 1, date);
  return dowNames[dt.getDay()];
}

function shareTooltipFormatter(
  ctx: Highcharts.TooltipFormatterContextObject, 
  tooltip: Tooltip) {

  const info = tooltip.chart.__chartInfo;
  if (!info || ! ctx.points || !ctx.points.length ) {
    return ''
  }

  const date = (typeof ctx.x === 'string' ? Number(ctx.x) : ctx.x)+1
  //debug('tooltip formatter this.points.', 'date:', date, 'points:', ctx.points, 'ctx:', ctx, 'tooltip:', tooltip);

  // 前日からの変化量計算
  let diffStr = ''
  if (date > 1) {
    const scoreCumulativeSum = info.cumulativeSumScore;
    const prev = scoreCumulativeSum[date - 2];
    const current = scoreCumulativeSum[date-1];
    const diff = Math.floor(current - prev);
    if (! Number.isNaN(diff)) {
      if (diff === 0) {
        diffStr = '±0';
      } else {
        diffStr = `+${diff}`
      }
    }
  }

  let headerValColor = colorFromSeriesType(SeriesTypes.daily, true);
  if (info.forecastScorePerDateColumn &&
    info.forecastScorePerDateColumn[date -1] !== null) {
    headerValColor = colorFromSeriesType(SeriesTypes.forecastDaily, true);
  }

  // header
  const dow = getWeekDayText(info.year, info.month, date);
  let header = `<table><tr style="color:#ffffff;font-size:12.5px"><td style="margin-bottom:0px;>">`+
    `${info.year}/${info.month}/${date} ${dow}</td>`;
  header += `<td style="text-align:right;padding-left:8px;color:${headerValColor};vertical-align:middle;">`;
  if (diffStr) {
    header += diffStr;
  }
  header += `</td></tr>`;
  let totalFetched = false;
  const rows = ctx.points.map((p, index) => {
    const userOptions = p.series.userOptions
    if (userOptions.id === SeriesTypes.total) {
      totalFetched = true;
    }

    // 累計と予測の両方がある場合、予測は表示しない
    if (userOptions.id === SeriesTypes.forecastTotal && totalFetched) {
      return '';
    }

    let val: number | string = Math.floor(p.y) ?? '';

    // EO/任務戦果予測で値0は表示しない
    if ((userOptions.id === SeriesTypes.forecastEo || userOptions.id === SeriesTypes.forecastQuest) && ! val) {
      return '';
    }

    // カラム名色
    const color = colorFromSeriesType(userOptions.id as SeriesTypes, false);
    if (val) {
      if (index !== 0) {
        val = '+'+val;
      } else {
        val = ' '+val;
      }
    }

    // カラム値色
    // 予測値の場合、値色を変える
    const isForecast = (userOptions.id as SeriesTypes).startsWith('forecast');
    const valColor = isForecast ? 'color:'+colorFromSeriesType(SeriesTypes.forecastTotal, true)+';' : '';

    return `<tr>
      <td style="color:${color};padding-right:6px;padding-top:6px;">● ${p.series.name}</td>
      <td style="text-align:right;padding-top:6px;${valColor}">${val}</td>
    </tr>`;
  }).join('');
  return header + rows + '</table>';
}

function flagTooltipFormatter(
  ctx: Highcharts.TooltipFormatterContextObject, 
  tooltip: Tooltip) {

  const info = tooltip.chart.__chartInfo;
  if (!info || ctx.point.options.id !== SeriesTypes.flags) {
    return ''
  }

  const date = (typeof ctx.x === 'string' ? Number(ctx.x) : ctx.x)+1
  const eoRecords = info.eoClears.reduce<EoClearRecord[]>((acc, e) => {
    const day = Number(e.date.slice(8, 10));
    if (day === date) {
      acc.push(e);
    }
    return acc
  }, []);
  const questRecords = info.questClears.reduce<QuestClearRecord[]>((acc, e) => {
    const day = Number(e.date.slice(8, 10));
    if (day === date) {
      acc.push(e);
    }
    return acc
  }, []);
  debug('flag tooltip formatter eoRecords:', eoRecords, ' questRecords:', questRecords);

  const tags: string[] = [];
  tags.push('<table>');

  // header
  const dow = getWeekDayText(info.year, info.month, date);
  tags.push(`<table><tr style="font-size:12.5px"><td colspan="2" style="padding-bottom:4px;>">`+
    `${info.year}/${info.month}/${date} ${dow}</td></tr>`)

  // EO records
  if (eoRecords.length > 0) {
    tags.push('<tr><td colspan="2" style="color:#fae54b;font-size:12.5px;padding-bottom:4px;">EO攻略報酬</td></tr>');
    eoRecords.sort((a, b) => a.mapId - b.mapId);
    eoRecords.forEach((rec) => {
      const name = bs.eoRates.find((er) => er.mapId === rec.mapId)?.name ?? `EO Map.${rec.mapId}`;
      tags.push(`<tr>
        <td style="padding-right:6px;">・${name}</td>
        <td style="text-align:right;">+${rec.rate}</td>
      </tr>`);
    });
  }

  // Quest records
  if (questRecords.length > 0) {

    function formatQuestTags(records: QuestClearRecord[], isQuarterly: boolean) {
      const prefix = isQuarterly ? 'クオータリー' : 'イヤーリー'
      tags.push(`<tr><td colspan="2" style="color:#e54bfa;font-size:12.5px;padding-top:8px;padding-bottom:4px;">`+
      `${prefix}任務達成報酬</td></tr>`);
      records.forEach((rec) => {
        if (bs.isQuarterlyQuest(rec.no) !== isQuarterly) {
          return;
        }
        if (bs.isYearlyQuest(rec.no) !== !isQuarterly) {
          return;
        }

        const questInfo = bs.quarterlyQuests.find((q) => q.no === rec.no);
        const questName = questInfo ? questInfo.name : `任務No.${rec.no}`;
        tags.push(`<tr>
          <td style="padding-right:6px;">・${questName}</td>
          <td style="text-align:right;">+${rec.rate}</td>
        </tr>`);
      });
    }
    function formatEtcQuestTags(records: QuestClearRecord[]) {
      const color = '#60fa4b';
      tags.push(`<tr><td colspan="2" style="color:${color};font-size:12.5px;padding-top:8px;padding-bottom:4px;">`+
      `戦果任務達成報酬</td></tr>`);
      records.forEach((rec) => {
        const questName = rec.questName ? rec.questName : `任務No.${rec.no}`;
        tags.push(`<tr>
          <td style="padding-right:6px;">・${questName}</td>
          <td style="text-align:right;">+${rec.rate}</td>
        </tr>`);
      });
    }

    const quarterlyExist = questRecords.some((rec) => bs.isQuarterlyQuest(rec.no));
    const yearlyExist = questRecords.some((rec) => bs.isYearlyQuest(rec.no));
    const dailyExist = questRecords.some((rec) => {
      return !bs.isQuarterlyQuest(rec.no) && !bs.isYearlyQuest(rec.no);
    });
    questRecords.sort((a, b) => a.rate - b.rate);
    if (dailyExist) {
      formatEtcQuestTags(questRecords);
    }
    if (quarterlyExist) {
      formatQuestTags(questRecords, true);
    }
    if (yearlyExist) {
      formatQuestTags(questRecords, false);
    }
  }

  // return builded html
  tags.push('</table>');
  return tags.join('');
}

function drawChart(info: ChartInfo, isNew: boolean) {

  const stops: Array<Highcharts.GradientColorStopObject> = [
    [0, '#fa4fed'],
    [1, '#5897ff']
  ]
  const grad = {
    //linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 }, // 横方向のグラデ
    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, // 縦方向のグラデ
    stops
  }

  const axisFontColor = '#cccccc';
  const xAxisFontSize = '10px';
  const yAxisFontSize = '11px';
  const chartBackgroundColor = hexToRgba('#344d90', 0.2);
  const gridLineColor = hexToRgba('#cccccc', 0.3);
  const gridLineDashStyle = 'ShortDot';
  const legendFontColor = '#cccccc';
  const legendHoverColor = '#ffffff';
  const legendHiddenColor = '#666666';
  const legendFontSize = '12px';
  const tooltipFontfamily = "'Segoe UI', 'Inter', sans-serif";
  const tooltipFontColor = '#ffffff';
  const tooltipBkColor = hexToRgba('#333333',0.9);

  const options: Highcharts.Options = {
    chart: { 
      renderTo: chartEl.value!,
      type: 'column', 
      backgroundColor: 'transparent',
    },
    lang: {
      noData: '表示するデータがありません。',
    },
    noData: {
      style: {
        color: '#cccccc',
        fontSize: '14px',
        fontWeight: 'normal',
      },
      position: {
        align: 'center',
        verticalAlign: 'middle',
      },
    },
    title: { text: undefined },
    legend: {
      itemStyle: {
        color: legendFontColor,
        fontSize: legendFontSize,
        fontWeight: 'normal',
      },
      itemHoverStyle: {
        color: legendHoverColor
      },
      itemHiddenStyle: {
        color: legendHiddenColor
      },
      margin: 10,
      padding: 0,         // legend 内側の余白
    },
    tooltip: { 
      shared: true,
      useHTML: true,
      followPointer: true,
      positioner: function (_labelWidth, _labelHeight) {
        // plot左上に固定
        const chart = this.chart;
        return {
          x: chart.plotLeft + 10,
          y: chart.plotTop + 10
        };
      },
      padding: 6,
      borderRadius: 1,
      borderColor: '#000',
      backgroundColor: tooltipBkColor,
      style: {
        color: tooltipFontColor,
        fontFamily: tooltipFontfamily,
      },
      formatter: function(this: Highcharts.TooltipFormatterContextObject, tooltip: Tooltip) {
        //debug('tooltip formatter this:', this, tooltip);
        if (this.points && this.points.length > 0) {
          return shareTooltipFormatter(this, tooltip);
        } else {
          return flagTooltipFormatter(this, tooltip);
        }
      },
      shadow: {
          color: hexToRgba('#ffffff', 0.8),
          offsetX: 0,
          offsetY: 0,
          opacity: 0.6,
          width: 4
      },
    },
    plotOptions: {
      column: { 
        stacking: 'normal', // スタック表示
        dataLabels: {
          enabled: true,         // 棒の上に数値表示
          inside: true,         // 棒の外側に表示（true で棒内）
          style: { 
            fontSize: '10px',
            color: '#00000',
            textShadow: '0 0 6px #bbb',
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
      series: {
        events: {
          // legendクリック無効化
          legendItemClick: function (e) {
            e.preventDefault(); // 明示的に止める
            return false;       // 旧来互換でも確実に止まる
          }
        },
      },
    },
    credits: { enabled: false }
  }

  // カテゴリ数が少ないと視認性が悪く空データで埋める
  const FIX_MIN_CATEGORY_COUNT = 9;
  const xAxisCategories = info.categories.map((d) => String(d-1));
  if (!info.isForecastScore && xAxisCategories.length < FIX_MIN_CATEGORY_COUNT) {
    const count = FIX_MIN_CATEGORY_COUNT - xAxisCategories.length;
    for (let i = 0; i < count; i++) {
      xAxisCategories.push(String(xAxisCategories.length+1))
    }
  }

  const xAxis: XAxisOptions = {
    // チャート更新時にxaxis値が文字列と数値の混合となった
    // -1は0起算とすると回避できたことによる
    //categories: info.categories.map((d) => String(d-1)),
    categories: xAxisCategories, 
    labels: {
      style: {
        color: axisFontColor,
        fontSize: xAxisFontSize,
      },
      //rotation: 0,               // 明示的に回転を 0 に
      //autoRotation: false,       // 自動回転を無効化
      //autoRotationLimit: 0,      // しきい値を 0 にして回転判定されないように
      formatter : function (this: AxisLabelsFormatterContextObject, _ctx: AxisLabelsFormatterContextObject) {
        const date = Number(this.value)+1
        const now = new Date();
        const isToday = now.getFullYear() === info.year && (now.getMonth() + 1) === info.month && (
            ((now.getDate() === date) && (now.getHours() >= 2)) || ((now.getHours() <= 2) && (now.getDate() == date+1)))
        const label = `${info.month}/${date}`;
        if (isToday) {
          return label + '<br>本日'
        }
        return label;
      },
    },
    crosshair: true,
  }

  const yAxis : Array<YAxisOptions> = [
    {
      title: undefined,
      labels: { 
        style: { 
          color: axisFontColor, 
          fontSize: yAxisFontSize, 
        },
        formatter: function () {
          //debug('axis formtter:', this.axis.min, this.axis.max, this.value, this);
          // title指定だと位置調整が難しいことから
          // 最大値ラベルにタイトル追加
          // chartにタイトルがはみ出ないよう領域確保用ダミー文字を改行で表示
          if (this.value === this.axis.max) {
            return '<span class="title-top-space">a</span><br>累計<br>'+this.value;
          }
          // 下チャートとのタイトル被り解消
          if (this.value === this.axis.min) {
            return this.value+'<br>&nbsp;';
          }
          return String(this.value);
        },
      },
      top: '0%',     // チャート全体上部基準で上部表示開始位置
      height: '70%',  // チャート全体上部基準で上部表示割合
      gridLineWidth: 1, 
      gridLineColor,
      gridLineDashStyle,
      plotBands: [{
        from: 0,
        to: 50000, // 値を更新してもplotされない。仮に大きな値を設定
        color: chartBackgroundColor,
        zIndex: 3
      }],
    }, 
    {
      title: { text: undefined },
      labels: { 
        style: { 
          color: axisFontColor, 
          fontSize: yAxisFontSize,
        },
        formatter: function () {
          // title指定だと位置調整が難しいことから
          // 最大値ラベルにタイトル追加
          if (this.value === this.axis.max) {
            return '当日<br>'+this.value;
          }
          return String(this.value);
        },
      },
      top: '74%',    // チャート全体上部基準で下部表示開始位置
      height: '26%', // チャート全体上部基準で下部表示割合
      offset: 0, // yの値表示位置調整
      gridLineWidth: 1, 
      gridLineColor,
      gridLineDashStyle,
      plotBands: [{
        from: 0,
        to: Math.floor(Math.max(...info.scorePerDateColumn.filter(v => v !==null))*2),
        color: chartBackgroundColor,
        zIndex: 3
      }],
    }
  ];

  // カテゴリ数が少ないと視認性が悪く空データで埋める
  const spliceScore = [...info.cumulativeSumScoreLine]
  if (spliceScore.length < FIX_MIN_CATEGORY_COUNT) {
    spliceScore.push(...Array(FIX_MIN_CATEGORY_COUNT - spliceScore.length).fill(null))
  }

  const series: Array<SeriesOptionsType> = [
    {
      type: 'spline',
      id: SeriesTypes.total,
      name: '累計戦果',
      //data: info.cumulativeSumScoreLine,
      data: spliceScore,
      marker: {
          lineWidth: 2,
          lineColor: '#4840d6',
          fillColor: '#fff'
      },
      color: grad,
      yAxis: 0,
    },
    {
      type: 'spline',
      id: SeriesTypes.forecastTotal,
      name: '累計戦果(予測)',
      data: info.isForecastScore ? info.forecastScoreLine : [],
      dashStyle: 'Dash',
      marker: { 
        enabled: true, 
        symbol: 'arc',
      },
      yAxis: 0,
      color: grad,
      showInLegend: false,
    },
    { 
      type: 'column', 
      id: SeriesTypes.daily,
      name: '当日戦果', 
      data: info.scorePerDateColumn,
      color: seriasColors[1],
      yAxis: 1,
    },
    { 
      type: 'column', 
      id: SeriesTypes.forecastDaily,
      name: '当日戦果(予測)', 
      data: info.isForecastScore ? info.forecastScorePerDateColumn : [],
      color: hexToRgba(seriasColors[1], 0.50),
      //borderColor: hexToRgba(seriasColors[1], 0.9),
      borderColor: seriasColors[1],
      borderWidth: 1,
      dashStyle: 'Dot',
      yAxis: 1,
      showInLegend: false,
    },
    { 
      type: 'column', 
      id: SeriesTypes.eo,
      name: 'EO戦果', 
      data: info.eoClearRatesColumn,
      color: seriasColors[2],
      yAxis: 0,
    },
    { 
      type: 'column', 
      id: SeriesTypes.forecastEo,
      name: 'EO戦果(予測)', 
      data: info.isForecastScore ? info.forecastEoClearRatesColumn : [],
      //color: seriasColors[2],
      color: hexToRgba(seriasColors[2], 0.50),
      borderColor: seriasColors[2],
      borderWidth: 1,
      dashStyle: 'Dot',
      yAxis: 0,
      showInLegend: false,
    },
    { 
      type: 'column', 
      id: SeriesTypes.quest,
      name: '戦果任務', 
      data: info.questClearRatesColumn,
      color: seriasColors[3],
      yAxis: 0,
    },
    { 
      type: 'column', 
      id: SeriesTypes.forecastQuest,
      name: '戦果任務(予測)', 
      data: info.isForecastScore ? info.forecastQuestClearRatesColumn : [],
      //color: seriasColors[3],
      color: hexToRgba(seriasColors[3], 0.50),
      borderColor: seriasColors[3],
      borderWidth: 1,
      dashStyle: 'Dot',
      yAxis: 0,
      showInLegend: false,
    },
    {
      type: 'flags',
      data: info.flags, 
      onSeries: SeriesTypes.eo,
      shape: 'flag',
      shadow: true,
      textAlign: 'center',
      yAxis: 0,
      fillColor: hexToRgba('#000000', 0.7), // フラグ本体の背景色
      color: axisFontColor,          // フラグ枠線の色
      style: {
        color: axisFontColor,    // タイトル文字色
        fontSize: '9px',
      },
      showInLegend: false,
      states: {
        inactive: {
          opacity: 1  // チャートホバー時に暗く（薄く）しない
        },
        hover: {
          fillColor: '#000000', // ホバー時 背景
          lineColor: '#ffffff', 
          // colorは設定しても効果が無かった
        }
      }
    },
  ];

  isCurrentMonthDataAvailable.value = 
    isPeriodCurrentMonth.value && info.scorePerDateColumn.some(v => v !== null);
  if (isNew) {
    options.xAxis = xAxis;
    options.yAxis = yAxis;
    options.series = series;
    chart = Highcharts.chart(options)
    chart.__chartInfo = info;
  } else {
    if (chart) {

      // チャート更新時、x labelに変更なしでも回転が発生する問題への対策
      // options.xAxis.labels.rotation/autoRotationを明示的に設定し直す
      if (chart.__chartInfo?.categories.length === info.categories.length) {
        chart.xAxis[0].options.labels!.rotation = chart.xAxis[0]['labelRotation']
      } else {
        // categories長が変わる場合、rotationを初期値に戻す
        chart.xAxis[0].options.labels!.rotation = undefined;
      }

      // update chart info
      chart.__chartInfo = info;

      // update xaxis options
      chart.options.xAxis = xAxis;

      // update yaxis options
      chart.options.yAxis = yAxis;

      // flagsをupdateすると消えることから更新しない
      // flagsは追加があればdataに追加する
      for (let i = 0; i < series.length; i++) {
        const chartSeries = chart.series[i];
        debug('type:', chartSeries.type, i); 
        if (chartSeries.type && chartSeries.type === 'flags') {
          const flags = series[i] as SeriesFlagsOptions;
          if (chartSeries.data.length !== flags.data!.length) { 
            for (let j = chartSeries.data.length; j < flags.data!.length; j++) {
              chartSeries.addPoint(flags.data![j], false);
            }
          }
        } else {
          chartSeries.update(series[i], false);
        }
      }
      chart.redraw();
    }
  }
}

/**
 * 
 * @param records dateの昇順ソート済みであること
 */
function toExpDaliyRecord(records: PortRecord[]): Map<number, ExpRecord> {
  const dailyMap = new Map<number, ExpRecord>()

  for (const r of records) {
    const exp = toExpRecord(r)
    if (!exp) {
      continue
    }

    const date = exp.date;
    let dd = Number(date.slice(8, 10)); // YYYY-MM-DD, get DD
    const hh = Number(date.slice(11, 13)); // YYYY-MM-DDThh, get hh
    if (isNaN(dd) || dd < 1) {
      console.warn('unexpected date in record:', date);
      continue;
    }
    if (isNaN(hh) || hh >= 24) {
      console.warn('unexpected hour in record:', date);
      continue;
    }

    if (hh < 2) {
      dd -= 1;
    }
    if (dd < 1) {
      // 月初めで1日未満になる場合はスキップ
      continue;
    }

    if (! dailyMap.has(dd)) {
      dailyMap.set(dd, exp);
    }
  }

  return dailyMap;
}

/**
 * 
 * @param daliyRecord toExpDaliyRecordの結果
 */
function calcDaliyExp(daliyRecord: Map<number, ExpRecord>): Map<number, number> {
  const ret = new Map<number, number>()
  daliyRecord.forEach((record, day) => {
    const expStart = record.exp
    let expEnd = 0;
    const dayEnd = daliyRecord.get(day + 1)
    if (dayEnd) {
      expEnd = dayEnd.exp
      ret.set(day, expEnd - expStart);
    }
  });
  return ret;
}

function toExpRecord(r: PortRecord): ExpRecord | null {
  if (!r?.date || ! r[ApiItemId.teitoku_exp]) {
    return null
  }

  const exp = r[ApiItemId.teitoku_exp]!
  if (exp < 0) {
    return null
  }

  return {
    date: r.date,
    exp
  }
}

async function fetchExpRecord(year: number, month: number): Promise<Map<number, number>> {

  // date format is
  // "2026-01-01T11:22:33+09:00"
  const fromDate = new Date(year, month - 1);
  fromDate.setHours(2, 0, 0, 0);
  const endDate = new Date(year, month, 1);
  endDate.setHours(2, 0, 0, 0);

  debug('fetchRecord from:', toRecordDate(fromDate), ' to:', toRecordDate(endDate));

  const projection: PortRecordQueryProjection = {};
  projection.date = 1
  projection[ApiItemId.teitoku_exp] = 1

  const query = { 
    dbName: DbName.port, 
    find: { 
      date: { 
        $gte: toRecordDate(fromDate),
        $lt: toRecordDate(endDate),
      } 
    },
    sort: { date: 1 },
    projection
   }

   return new Promise((resolve, reject) => {
    window.api.queryDb(query).then((queryReturn) => {
      const records = queryReturn as PortRecord[]
      debug('fetched port records:', records.length);
      debug(records);
      if (records.length === 0) {
        debug('no records found');
        resolve(new Map<number, number>());
        return;
      }

      const dailyMap = toExpDaliyRecord(records);
      debug('dailyMap calced:', dailyMap);

      // 末尾レコード設定
      // 算出対象に現在日が含まれるとき、現在のexpを設定
      // 含まれないとき、最後のレコードを設定
      const now = new Date();
      const lastDate = Math.max(...dailyMap.keys());
      let lastExp: ExpRecord | null = null;
      if (now.getFullYear() === Number(year) && (now.getMonth() + 1) === Number(month)) {
        lastExp = {
          date: toRecordDate(now),
          exp: svdata.basic.api_experience
        };
        debug('currentExp from svdata:', lastExp);
      } else {
        lastExp = toExpRecord(records[records.length-1]);
        debug('lastExp from records:', lastExp);
      }
      if (lastExp) {
        dailyMap.set(lastDate+1, lastExp);
      }

      const dailyExpMap = calcDaliyExp(dailyMap);
      debug('dailyExpMap calced:', dailyExpMap);
      resolve(dailyExpMap);
    }).catch((err) => {
      console.error('fetchRecord error:', err);
      reject(err);
    });
  })
}

async function fetchEoClearRecord(year: number, month: number):Promise<EoClearRecord[]> {

  // date format is
  // "2026-01-01T11:22:33+09:00"
  const fromDate = new Date(year, month - 1);
  const fromStr = toRecordDate(fromDate);
  const endDate = new Date(year, month, 1);
  endDate.setHours(-2, 0, 0, 0);
  const toStr = toRecordDate(endDate)

  debug('fetchEoClearRecord from:', fromStr, ' to:', toStr);

  async function fetchBattleEoClear() : Promise<EoClearRecord[]> {
    return new Promise((resolve, reject) => {
      const query = { 
        dbName: DbName.battle, 
        find: { 
          mapId: {
            $in: bs.eoRates.map((er) => er.mapId)
          },
          isBoss: true,
          firstClear: true,
          date: { 
            $gte: fromStr,
            $lt: toStr,
          } 
        },
        sort: { date: 1 },
        projection: {
          mapId: 1,
          date: 1,
        }
      }
      window.api.queryDb(query).then((queryReturn) => {
        const records = queryReturn as BattleRecord[]
        debug('fetched eo clear records:', records.length);
        debug(records);
        if (records.length === 0) {
          resolve([]);
          return;
        }
        const eoClears: EoClearRecord[] = records.map((r) => {
          return {
            mapId: r.mapId,
            date: r.date,
            rate: bs.getEoRateByMapId(r.mapId)
          }
        });
        resolve(eoClears);
      }).catch((err) => {
        console.error('fetchBattleEoClear error:', err);
        reject(err);
      });
    });
  }

  async function fetchItemGetEoClear(): Promise<EoClearRecord[]> {
    return new Promise((resolve, reject) => {
      const query = { 
        dbName: DbName.battle, 
        find: { 
          mapId: {
            $in: [16]
          },
          items: {
            $elemMatch: {
              eoRate: { $exists: true }
            }
          },
          date: { 
            $gte: fromStr,
            $lt: toStr,
          } 
        },
        sort: { date: 1 },
        projection: {
          //date: 1,
        }
      }
      debug('fetchEoClearRecord query:', query);
      window.api.queryDb(query).then((queryReturn) => {
        const records = queryReturn as BattleRecord[]
        debug('fetched eo clear(itemget) records:', records.length);
        debug(records);
        if (records.length === 0) {
          resolve([]);
          return;
        }
        const ret = records.reduce<EoClearRecord[]>((acc, r) => {
          r.items!.forEach((it) => {
            if (it.eoRate) {
              acc.push({
                mapId: r.mapId,
                date: r.date,
                rate: it.eoRate!
              });
            }
          });
          return acc
        }, []);
        resolve(ret);
      }).catch((err) => {
        console.error('fetchItemGetEoClear error:', err);
        reject(err);
      });
    });
  }
  const tasks: Promise<EoClearRecord[]>[] = [];
  tasks.push(fetchBattleEoClear());
  tasks.push(fetchItemGetEoClear());

  return Promise.all(tasks).then((results) => {
    const allEoClears: EoClearRecord[] = [];
    results.forEach((eoClears) => {
      allEoClears.push(...eoClears);
    });
    allEoClears.sort((a, b) => a.date.localeCompare(b.date));
    debug('allEoClears calced:', allEoClears);
    return allEoClears;
  });
}

function dateInRange(dateStr: string, range: DateRange): boolean {
  const date = new Date(dateStr);
  return date >= range.start && date < range.end;
}

function calcQuestClearRate(r: ClearItemGetRecord, range: DateRange | undefined): number {
  const date = new Date(r.date);
  return r.bonuses!.reduce((acc, el) => {

    // 戦果任務で前月末14:00 ～ 当月13:59までを計上する
    if (range && !dateInRange(r.date, range)) {
      debug('skip quest clear by month-to-month:', r.questNo, r.date, range);
      return acc;
    }

    if (el.api_type === ApiItemBonusType.senka) {
      return acc + el.api_count;
    }
    return acc;
  }, 0);
}


function rangeToRecordDate(range: DateRange): DateRangeStr {
  return {
    start: toRecordDate(range.start),
    end: toRecordDate(range.end),
  }
}

async function fetchQuestClearRecord(year: number, month: number): Promise<QuestClears> {

  // date format is
  // "2026-01-01T11:22:33+09:00"

  // 戦果任務取得期間
  const thisMonthRange = {
    start: new Date(year, month - 1, 0, 5, 0, 0, 0), // 月初めの前日5:00
    end: new Date(year, month, 0, 14, 0, 0, 0), // 月末の当日14:00
  }

  // クォータリー任務期間
  const quarterDateRange = quarterRangeForDate(year, month)
  // イヤーリー任務期間
  const yearlyDateRange = yearlyRangeForDate(year, month)

  // 戦果任務で戦果として計上する機関
  const calcRateRange = {
    start: new Date(year, month - 1, 0, 5, 0, 0, 0), // 前月末14:00～
    end: new Date(year, month, 0, 14, 0, 0, 0), // 当月14:00
  }

  return new Promise((resolve, reject) => {
    const query = { 
      dbName: DbName.clearitemget, 
      find: { 
        'bonuses.api_type': ApiItemBonusType.senka,
        date: { 
          $gte: toRecordDate(yearlyDateRange.start),
          $lt: toRecordDate(yearlyDateRange.end),
        } 
      },
      sort: { date: 1 },
      projection: {
        questNo: 1,
        questName: 1,
        bonuses: 1,
        date: 1,
      }
    }
    window.api.queryDb(query).then((queryReturn) => {
      const records = queryReturn as ClearItemGetRecord[]
      debug('fetched clearitemget records:', records.length);
      debug(records);
      if (records.length === 0) {
        resolve({ thisMonth: [], alreadyCompleted: [] });
        return;
      }
      const ret = records.reduce<QuestClears>((acc, r) => {

        // 対象月でのクリアの場合、戦果を計算する
        if (dateInRange(r.date, thisMonthRange)) {
          acc.thisMonth.push({
            no: r.questNo,
            questName: r.questName,
            rate: calcQuestClearRate(r, calcRateRange),
            date: r.date,
          });
        } else {

          const clearRecord: QuestClearRecord = {
            no: r.questNo,
            questName: r.questName,
            rate: calcQuestClearRate(r, undefined),
            date: r.date,
          };

          // 対象月以外でのクリアの場合、すでに達成済みの任務として記録する
          if (bs.isQuarterlyQuest(r.questNo) && dateInRange(r.date, quarterDateRange)) {
            acc.alreadyCompleted.push(clearRecord);
          } else if (bs.isYearlyQuest(r.questNo) && dateInRange(r.date, yearlyDateRange)) {
            acc.alreadyCompleted.push(clearRecord);
          } else {
            debug('skip quest clear by month-to-month:', r.questNo, r.date);
          }
        }
        return acc;

      }, { thisMonth: [], alreadyCompleted: []});
      resolve(ret);
    }).catch((err) => {
      console.error('fetchQuestClearRecord error:', err);
      reject(err);
    });
  })
}

// クォータリー範囲を取得する
function quarterRangeForDate(year: number, month: number): DateRange {

  let startMonth: number, endMonth: number, startYear = year, endYear = year;

  if (month >= 3 && month <= 5) { // 3-5月
    startMonth = 3; endMonth = 5;
  } else if (month >= 6 && month <= 8) { // 6-8月
    startMonth = 6; endMonth = 8;
  } else if (month >= 9 && month <= 11) { // 9-11月
    startMonth = 9; endMonth = 11;
  } else { // 12-2月
    startMonth = 12; endMonth = 2;
    if (month === 12) { startYear = year; endYear = year + 1; }
    else { startYear = year - 1; endYear = year; } // m === 1 or 2
  }

  const start = new Date(startYear, startMonth - 1, 1, 5, 0, 0, 0);
  const end = new Date(endYear, endMonth, 1, 5, 0, 0, 0)

  return { start, end };
}

// イヤーリー範囲を取得する
function yearlyRangeForDate(year: number, month: number): DateRange {

  let startMonth: number, endMonth: number, startYear: number, endYear: number;
  
  if (month <= 5) { 
    // 前年6月～本年5月
    startYear = year - 1;
    startMonth = 6; 
    endYear = year;
    endMonth = 5;
  } else { 
    // 本年6月～来年5月
    startYear = year;
    startMonth = 6; 
    endYear = year+1;
    endMonth = 5;
  }

  const start = new Date(startYear, startMonth - 1, 1, 5, 0, 0, 0);
  const end = new Date(endYear, endMonth - 1, 0, 14, 0, 0, 0)

  return { start, end };
}

async function fetchQuestStateRecord(year: number, month: number, isQuarterly: boolean): Promise<Quest[]> {

  const projection = {
    no: 1,
    state: 1
  }

  return new Promise((resolve, reject) => {
    const {start , end} = isQuarterly ? quarterRangeForDate(year, month) : yearlyRangeForDate(year, month);
    const query = {
      dbName: DbName.quest, 
      find: { 
        no: { $in: isQuarterly ? bs.quarterlyQuests.map(q => q.no) : bs.yearlyQuests.map(q => q.no) },
        date: { 
          $gte: toRecordDate(start),
          $lt: toRecordDate(end),
        } 
      },
      projection
    }
    debug('fetchQuestStateRecord is quarterly:', isQuarterly, 'query:', query);

    window.api.queryDb(query).then((queryReturn) => {
      const records = queryReturn as Quest[]
      debug('fetched quest state records:', records.length);
      debug(records);
      resolve(records);
    }).catch((err) => {
      console.error('fetchQuestStateRecord error:', err);
      reject(err);
    });
  })
}

async function fetchFirstExpRecord(): Promise<PortRecord | null> {
  return new Promise((resolve, reject) => {
    const projection: PortRecordQueryProjection = {};
    projection.date = 1
    projection[ApiItemId.teitoku_exp] = 1

    const query = { 
      dbName: DbName.port, 
      find: { 
        "-2": { $exists: true  } // 任意の存在するフィールドでOK
      },
      sort: { date: 1 },
      limit: 1,
      projection
    }
    window.api.queryDb(query).then((queryReturn) => {
      const records = queryReturn as PortRecord[]
      debug('fetched last port records:', records.length);
      debug(records);
      if (records.length === 0) {
        resolve(null);
        return;
      }
      resolve(records[0]);
    }).catch((err) => {
      console.error('fetchLastPortRecord error:', err);
      reject(err);
    });
  })
}

function dataFor(year: number, month: number, isNew: boolean) {
  const expTask = fetchExpRecord(year, month);
  const eoClearTask = fetchEoClearRecord(year, month);
  const questClearTask = fetchQuestClearRecord(year, month);
  const quarterQuestStateTask = fetchQuestStateRecord(year, month, true);
  const yearlyQuestStateTask = fetchQuestStateRecord(year, month, false);
  const inheritScoreLoadTask = window.api.getInheritScoreList();
  if (isNew) {
    taskContentsOk.value = false;
    taskContentsVisible.value = false;
  }

  Promise.all([
    expTask, 
    eoClearTask, 
    questClearTask, 
    quarterQuestStateTask, 
    yearlyQuestStateTask,
    inheritScoreLoadTask
  ]).then((results) => {
    debug('all fetches completed. is aborted:', abortController.signal.aborted);
    if (abortController.signal.aborted) {
      debug('aborted, skipping processing');
      return;
    }
    const dailyExpMap = results[0];
    const eoClears = results[1];
    const questClears = results[2];
    const quarterlyQuestStates = results[3];
    const yearlyQuestStates = results[4];
    const loadedInheritScores = results[5];
    debug('loadedInheritScores:', loadedInheritScores);
    if (loadedInheritScores.inheritScores.length > 0) {
      replaceArray(inheritScoreList.inheritScores, loadedInheritScores.inheritScores);
    }
    debug('inheritScoreList:', inheritScoreList);

    const isForecast = isForecastScore.value && isPeriodCurrentMonth.value;
    const chartInfo = toChartInfo(
      isForecast,
      year, month, dailyExpMap, eoClears, questClears);
    debug('chart info:', chartInfo);
    debug('quest clears:', questClears)
    debug('quarterly quest states:', quarterlyQuestStates)
    debug('yearly quest states:', yearlyQuestStates)
    drawChart(chartInfo, isNew);
    updateEoClearState(eoClears);
    updateQuestClearState(questClears, { quarterly: quarterlyQuestStates, yearly: yearlyQuestStates} );
    
    if (isNew) {
      taskContentsOk.value = true;
    }
    isLoading.value = false;

    // レンダリングが完了してから表示を戻す（ちらつき防止）
    // requestAnimationFrame(() => {
    //   requestAnimationFrame(() => {
    //     //taskContentsVisible.value = true;
    //     //isLoading.value = false;
    //   });
    // });
    if (isNew) {
      setTimeout(() => {
        taskContentsVisible.value = true;
      }, 50);
    }
  });
}


function updateContent() {
  debug('updateContent. isloading', 
    isLoading.value, indexYearMonth.value, yearMonthList.value.length-1);

  if (isLoading.value) {
    return;
  }

  // 現在月を表示しているとき、最新データを再取得
  if (isPeriodCurrentMonth.value) {
    debug('onPort: re-apply current month period'); 
    applyPeriod(false);
  }
}

onMounted(() => {
  debug('mounting, starting fetches');

  // 期間アイテム構築
  const firstExpTask = fetchFirstExpRecord();
  firstExpTask.then((firstExpRecord) => {
    if (abortController.signal.aborted) {
      debug('aborted, skipping building yearMonthList');
      return;
    }
    buildYearMonthList(firstExpRecord);

    // 最新月表示
    applyPeriod(true);

    // 以下のAPIで表示更新
    // ・ポートに戻った際
    // ・クエスト報酬入手
    cbPort = ApiCallback.set([Api.PORT_PORT, ()=> updateContent() ]);
    cbClearItemGet = ApiCallback.set([Api.REQ_QUEST_CLEARITEMGET, () => updateContent() ]);    
  });
})

onUnmounted(() => {
  debug('unmounting, aborting fetches and destroying chart');
  abortController.abort();
  if (cbPort) {
    ApiCallback.unset(cbPort);
    cbPort = 0;
  }
  if (cbClearItemGet) {
    ApiCallback.unset(cbClearItemGet);
    cbClearItemGet = 0;
  }
  if (chart) { 
    chart.destroy(); 
    chart = undefined 
  }
});

const eoCleared = computed(() => eoClearStates.value.filter(e => e.isCleared));
const eoProgress  = computed(() => eoClearStates.value.filter(e => !e.isCleared));
const questsCleared = computed(() => questClearStates.value.filter(q => q.isCleared));
const questsProgress  = computed(() => questClearStates.value.filter(q => !q.isCleared));

/////////////////////////////////////////////////////////////////////////////////////
// 期間選択関連
const selectedMonth = ref<Date>(new Date());
const currentYear = ref(0);
const dropdownActive = ref(false);

function dropdownActiveChange(isActive: boolean) {
  debug('dropdownActiveChange:', isActive);
  dropdownActive.value = isActive;
  if (isActive) {
    // 開いたときに現在選択されている月をセット
    const period = yearMonthList.value[indexYearMonth.value]
    const [yStr, mStr] = period.split('/')
    const y = Number(yStr)
    const m = Number(mStr)
    selectedMonth.value = new Date(y, m -1, 1);
    currentYear.value = selectedMonth.value.getFullYear();
  }
}

function buildYearMonthList(firstExpRecord: PortRecord | null) {
  let startYear: number, startMonth: number;

  const now = new Date();

  if (firstExpRecord && firstExpRecord.date) {
    const dateStr = firstExpRecord.date;
    startYear = Number(dateStr.slice(0,4));
    startMonth = Number(dateStr.slice(5,7));
  } else {
    // データが無い場合は当月のみ
    startYear = now.getFullYear();
    startMonth = now.getMonth() + 1;
  }

  const endYear = now.getFullYear();
  const endMonth = now.getMonth() + 1;

  let y = startYear;
  let m = startMonth;

  const yearMonthListTemp: string[] = [];
  while (y < endYear || (y === endYear && m <= endMonth)) {
    const ymStr = `${y}/${String(m).padStart(2,'0')}`;
    yearMonthListTemp.push(ymStr);

    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  yearMonthList.value = yearMonthListTemp;
  debug('built yearMonthList:', yearMonthList.value);
  indexYearMonth.value = yearMonthList.value.length -1; // 最新月選択
  yearMonthListOk.value = true;
}

const selectedPeriod = computed(() => {
  return yearMonthList.value[indexYearMonth.value];
});

function applyPeriod(isNewChart: boolean) {
  debug('applyPeriod:', indexYearMonth.value)

  const period = yearMonthList.value[indexYearMonth.value]
  const [yStr, mStr] = period.split('/')
  const y = Number(yStr)
  const m = Number(mStr)
  dataFor(y, m, isNewChart);
}

const selectableMonths = computed((): Array<Date> => {  
  const dates: Array<Date> = [];
  for (const ymStr of yearMonthList.value) {
    const [yStr, mStr] = ymStr.split('/');
    const y = Number(yStr);
    const m = Number(mStr);
    dates.push(new Date(y, m -1, 1));
  }
  return dates;
})

function monthSelected(value: Date) {
  debug('periodSelected:', value);

  const index = yearMonthList.value.findIndex(ymStr => {
    const [yStr, mStr] = ymStr.split('/');
    const y = Number(yStr);
    const m = Number(mStr);
    return (y === value.getFullYear() && m === (value.getMonth() + 1));
  });
  if (index === -1) {
    console.warn('yearMonthList index not found for selected date:', value);
    return;
  }
  if (index === indexYearMonth.value) {
    debug('selected month is same as current, no change.');
    return;
  }
  indexYearMonth.value = index;
  applyPeriod(true);
}

function changeYear(year: number) {
  debug('changeYear:', year);
  currentYear.value = year;
}

const isYearMin = computed(() => {
  if (selectableMonths.value.length === 0) {
    return false;
  }
  const minDate = selectableMonths.value[0];
  return (currentYear.value === minDate.getFullYear());
});

const isYearMax = computed(() => {
  if (selectableMonths.value.length === 0) {
    return false;
  }
  const maxDate = selectableMonths.value[selectableMonths.value.length -1];
  return (currentYear.value === maxDate.getFullYear());
});

function monthSelectSetToday() {
  debug('monthSelectSetToday');
  const now = new Date();
  selectedMonth.value = now;
  monthSelected(now);
}

/////////////////////////////////////////////////////////////////////////////////////
// 引継ぎ戦果関連
const inheritScores = ref<MonthScores>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
const inheritScoreForRestore: MonthScores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
const inheritYear = ref(0)
const isCurrentYear = computed((): boolean => {
  if (! yearMonthListOk.value) {
    return false;
  }
  const yearMonth = yearMonthList.value[indexYearMonth.value];
  const [yStr, _mStr] = yearMonth.split('/');
  const year = Number(yStr);

  const now = new Date();
  if (year === now.getFullYear()) {
    inheritYear.value = year;
    return true;
  }
  return false;
});

const isShowInheritScoreInput = ref(false);
function showInheritScoreInput() {
  debug('showInheritScoreInput', inheritYear.value);
  const scores = inheritScoreList.inheritScores.find(s => s.year === inheritYear.value);
  if (scores) {
    debug('found existing inherit scores:', scores);
    inheritScores.value = toRaw(scores.scores)
  } else {
    debug('no existing inherit scores for year, initializing to zero');
    inheritScores.value = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  }
  replaceArray(inheritScoreForRestore, toRaw(inheritScores.value))
  debug('showInheritScoreInput2', toRaw(inheritScores.value), inheritScoreForRestore);
  isShowInheritScoreInput.value = true;
}

function restoreInheritScores() {
  debug('restoreInheritScores', toRaw(inheritScores.value), inheritScoreForRestore);
  inheritScoreForRestore.forEach((v, i) => {
    inheritScores.value[i] = v;
  });
}

function applyInheritScores() {
  debug('applyInheritScores:', inheritYear.value, inheritScores.value);
  const existing = inheritScoreList.inheritScores.find(s => s.year === inheritYear.value);
  if (existing) {
    // 既存データがあれば上書き
    existing.scores = toRaw(inheritScores.value)
  } else {
    // 新規追加
    inheritScoreList.inheritScores.push({
      year: inheritYear.value,
      scores: toRaw(inheritScores.value)
    });
  }
  window.api.saveInheritScoreList(inheritScoreList);
  isShowInheritScoreInput.value = false;

  // チャート再描画
  applyPeriod(false);
}

/////////////////////////////////////////////////////////////////////////////////////
// 入力ブロッカー関連
const isInputBlockerActive = computed((): boolean => {
  return dropdownActive.value || isShowInheritScoreInput.value;
});

/////////////////////////////////////////////////////////////////////////////////////
// ボタン押下状態管理
function pressStateHolder() {
  const pressed = ref(false);
  const presseStart = () => { pressed.value = true; }
  const pressEmd = () => { pressed.value = false; }
  return { pressed, presseStart, pressEmd  };
}

const { 
  pressed: isInheritButtonPressed, 
  presseStart: inheritButtonPressStart, 
  pressEmd: inheritButtonPressEnd } = pressStateHolder()

/////////////////////////////////////////////////////////////////////////////////////
// 仮達成関連
function tempClearChanged() {
  debug('tempClearChanged');

  // save session storage
  const value: ForecastableSesValue = { tempClears: {} }
  eoProgress.value.forEach(e => {
    if (e.setTempCleared) {
      value.tempClears[e.mapId] = true;
    }
  });
  questsProgress.value.forEach(q => {
    if (q.setTempCleared) { 
      value.tempClears[q.no] = true;
    }
  });
  sesStorage.setValue(sesStorage.StorageKeyName.BattleScoreForecastableClears, value);

  // update view
  applyPeriod(false);
}

function toggleTempClear(ev: Event, task: ForecastableTask) {
  debug('toggleTempClear is forecast:', isForecastScore.value, ev);

  if (! isForecastScore.value) {
    return;
  }

  if (! ev.target) {
    return;
  }

  const target = ev.target as HTMLElement;
  if (target.closest('.temp-cleared-checkbox')) {
    debug('clicked on checkbox itself, no action.');
    return;
  }

  const eoFound = eoProgress.value.find(e => e.mapId === task.taskKey);
  if (eoFound) {
    eoFound.setTempCleared = !eoFound.setTempCleared;
  }
  const questFound = questsProgress.value.find(q => q.no === task.taskKey);
  if (questFound) {
    questFound.setTempCleared = !questFound.setTempCleared;
  }
  tempClearChanged();
}

function setAllTempCleared() {
  debug('setAllTempCleared');
  eoProgress.value.forEach(e => {
    e.setTempCleared = true;
  });
  questsProgress.value.forEach(q => {
    q.setTempCleared = true;
  });
  tempClearChanged();
}

function unsetAllTempCleared() {
  debug('unsetAllTempCleared');
  eoProgress.value.forEach(e => {
    e.setTempCleared = false;
  });
  questsProgress.value.forEach(q => {
    q.setTempCleared = false;
  });
  tempClearChanged();
}

</script>


<style scoped lang="scss">
.highcharts-tooltip {
  font-variant-numeric: tabular-nums;  // 等幅数字
  font-feature-settings: "tnum" 1, "lnum" 1;
}
</style>

<template>
  <div v-if="isLoading" class="battlescore-root is-loading">
    <img class="blur-img" src="../assets/img/app/battlescore.png"/>
    <div class="overlay-help"><span>戦果情報を読み込み中...</span></div>
  </div>
  <section else class="battlescore-root">

    <!-- 
      オーバーレイ:
        ・ドロップダウンが開いている間、背面要素へのマウスイベントを防ぐ 
        ・引継ぎ戦果入力時に背面要素へのマウスイベントを防ぐ 
        例：チャートホバー時ツールチップ表示抑止
     -->
    <transition name="fade-effect" appear>
    <div
      v-if="isInputBlockerActive"
      class="input-blocker"
    ><div class="parts1"></div><div class="parts2"></div></div>
    </transition>

    <!--
      期間選択部分
    -->
    <div class="period-select-control">
      <div class="controls">
        <b-carousel
          v-if="yearMonthListOk"
          v-model="indexYearMonth"
          @change="applyPeriod"
          :animated="'fade'"
          :autoplay="false"
          :has-drag="false"
          :arrow-hover="false"
          :repeat="false"
          :icon-pack="'fa'"
          :ison-size="'is-small'"
          :indicator="false"
        >
          <b-carousel-item v-for="(_item, i) in yearMonthList" :key="i" class="period-item">
          </b-carousel-item>
        </b-carousel>
        <div class="period-select-dropdown" :class="{ 'is-selected': false}">
          <!-- todo fix warning dropdown item selected
          https://w3c.github.io/aria/#aria-hidden -->
          <b-dropdown
            @active-change="dropdownActiveChange">
              <template #trigger="{ active }">
                <div class="trigger" :class="{ 'active' : active }">
                  <span class="name-parts">
                    {{ selectedPeriod }}
                  </span>
                  <span class="chevron-parts">
                    <b-icon pack="fa" icon="chevron-down"/>
                  </span>
                </div>
              </template>
              <b-dropdown-item 
                :focusabe="true"
                custom
                paddingless
              >
                <span class="dropdown-title">表示年月の選択</span>
                <b-datepicker
                    type="month"
                    size="is-small"
                    icon-pack="fa"
                    icon="calendar-today"
                    trap-focus
                    inline
                    :class="{ 'is-year-min': isYearMin, 'is-year-max': isYearMax }"
                    :selectable-dates="selectableMonths"
                    :min-date="selectableMonths[0]"
                    :max-date="selectableMonths[selectableMonths.length -1]"
                    v-model="selectedMonth"
                    @update:modelValue="monthSelected"
                    @change-year="changeYear"
                >
                <div class="container">
                  <b-button label="今月" @click="monthSelectSetToday"/>
                </div>
                </b-datepicker>
              </b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
    </div>

    <!--
      戦果チャート表示部分
    -->
    <div class="battlescore-chart">
      <div class="chart-content" ref="chartEl"></div>
    </div>

    <!-- 現在月では進行中任務を表示する -->
    <div class="tasks-content" v-if="taskContentsOk" :class="{ 'is-visible': taskContentsVisible }">
      <div v-if="isPeriodCurrentMonth" class="task-content is-progress">
        <div class="task-header"><span 
          class="header-title">未達成 EO: {{ eoProgress.length }} 戦果任務: {{ questsProgress.length }}
          <transition name="fade-effect" appear>
            <span 
              class="temp-compted-ctl-buttons" 
              v-if="isForecastScore"><b-button 
                @click="setAllTempCleared">すべて仮達成</b-button><b-button 
                @click="unsetAllTempCleared">仮達成クリア</b-button></span>
          </transition></span></div>

        <div class="task-grid">
          <template v-for="e in eoProgress" :key="`eo-p-${e.mapId}`">
            <div class="task-item eo" :title="e.name"
              @click="(ev) => toggleTempClear(ev, e)"
            >
              <div class="task-title">{{ e.name }}</div>
              <div class="task-meta">
                <span class="badge rate">+{{ e.rate }}</span>
                <span class="badge date">{{ e.clearDateDisplay }}</span>
              </div>
              <transition name="fade-effect" appear>
                <div class="temp-cleared-checkbox" v-if="isForecastScore">
                  <b-checkbox
                    size="is-small" 
                    v-model="e.setTempCleared"
                    @update:modelValue="tempClearChanged"
                  ><span class="button-text">仮達成</span></b-checkbox>
                </div>
              </transition>
            </div>
          </template>

          <template v-for="e in questsProgress" :key="`quest-p-${e.no}`">
            <div 
              class="task-item quest" :title="e.name" :class="'quest-'+e.no"
              @click="(ev) => toggleTempClear(ev, e)"
            >
              <div class="task-title">{{ e.name }}</div>
              <div class="task-meta">
                <span class="badge rate">+{{ e.rate }}</span>
                <span v-if="e.progressDetail" class="badge state" v-html="e.progressDetail"></span>
                <span v-else class="badge date">{{ e.clearDateDisplay }}</span>
              </div>
              <transition name="fade-effect" appear>
                <div class="temp-cleared-checkbox" v-if="isForecastScore">
                  <b-checkbox
                    size="is-small" 
                    v-model="e.setTempCleared"
                    @update:modelValue="tempClearChanged"
                  ><span class="button-text">仮達成</span></b-checkbox>
                </div>
              </transition>
            </div>
          </template>
        </div>
      </div>

      <div class="task-content is-cleared">
        <div class="task-header">達成済 EO: {{ eoCleared.length }} 戦果任務: {{ questsCleared.length }}</div>

        <div class="task-grid">
          <template v-for="e in eoCleared" :key="`eo-c-${e.mapId}`">
            <div class="task-item is-cleared" :title="e.name">
              <div class="task-title"><CheckImage/>{{ e.name }}</div>
              <div class="task-meta">
                <span class="badge rate">+{{ e.rate }}</span>
                <span class="badge date">{{ e.clearDateDisplay }}</span>
              </div>
            </div>
          </template>

          <template v-for="e in questsCleared" :key="`quest-c-${e.no}`">
            <div class="task-item is-cleared" :title="e.name">
              <div class="task-title"><CheckImage/>{{ e.name }}</div>
              <div class="task-meta">
                <span class="badge rate">+{{ e.rate }}</span>
                <span class="badge date">{{ e.clearDateDisplay }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!--
      引継ぎ戦果入力ボタン
    -->
    <transition name="fade-effect" appear>
      <div class="control-button input-inherit-score-button" v-if="isCurrentYear">
        <b-button 
          size="is-small" 
          outlined 
          @click="showInheritScoreInput"
          :class="{ 'is-pressed': isInheritButtonPressed }"
          @mousedown="inheritButtonPressStart"
          @mouseup="inheritButtonPressEnd"
          @mouseleave="inheritButtonPressEnd">
          <b-icon pack="fa" icon="plus"/><span>引継ぎ戦果</span></b-button>
      </div>
    </transition>

    <!--
      戦果予測表示ボタン
    -->
    <transition name="fade-effect" appear>
      <div class="control-button forecast-score-button" v-if="isPeriodCurrentMonth">
        <b-button 
          size="is-small" 
          outlined 
          @click="toggleForecastScore" 
          :disabled="!isCurrentMonthDataAvailable"
          :class="{ 'is-active': isForecastScore }">
          <ForecastChartImage /><span class="button-text">戦果予測</span></b-button>
      </div>
    </transition>

    <!--
      引継ぎ戦果入力モーダル
    -->
    <transition name="fade-effect" appear>
      <div class="input-inherit-score-content" v-if="isShowInheritScoreInput">
        <b-message
          :title="'引継ぎ戦果'"
          :type="'is-info'"
          :size="'is-small'"
          @close="isShowInheritScoreInput = false"
          ><span class="help-text">入力した引継ぎ戦果値を該当月の累計戦果に加算します。<br>
            ゲーム上戦果値と一致させたいなどで入力してください。<br>
            入力例：<br>
            当月が4月、
            ゲーム上戦果値：350、累積戦果が320、当日戦果が0の場合、4月引継ぎ戦果に30を入力</span>
          <!-- 年 1〜12 月入力 -->
          <div class="inherit-input-wrap">
            <div class="inherit-grid">
              <template v-for="i in 12" :key="i">
                <div class="inherit-item">
                  <label class="month-label">{{ i }}月</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="9999" 
                    class="input is-small month-input" 
                    v-model.number="inheritScores[i-1]" 
                    @keydown.enter.prevent="applyInheritScores"
                    />
                </div>
              </template>
            </div>
            <div class="inherit-actions">
              <b-button size="is-small" type="is-primary" @click="applyInheritScores">保存</b-button>
              <b-button size="is-small" @click="restoreInheritScores">復元</b-button>
              <b-button size="is-small" @click="() => inheritScores = [0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0]">クリア</b-button>
              <div class="inherit-year-label">年度: {{ inheritYear }}</div>
            </div>
          </div>
        </b-message>
      </div>
    </transition>
    
  </section>
</template>
