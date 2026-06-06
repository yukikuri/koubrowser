<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from 'vue'
import type { MaterialChartData } from '@common/record'
import ChartImage from '@assets/img/chart.svg'
import moment from 'moment'
import Highcharts from 'highcharts'
import noDataToDisplay from 'highcharts/modules/no-data-to-display'
import * as chartStuff from '@renderer/components/chart/stuff'

noDataToDisplay(Highcharts)

// loadingはchart描画後に要素が削除されることから false に設定不要
const isLoading = ref<boolean>(true);

const SeriesTypes = {
  fuel: 'fuel',
  bull: 'bull',
  steel: 'steel',
  buxite: 'buxite',
} as const;
type SeriesType = (typeof SeriesTypes)[keyof typeof SeriesTypes]

interface SeriesSet {
  visible: boolean;
  first: number;
  last: number;
}
type SeriesStates = { [key in SeriesType]: SeriesSet };

type XAxisDateFormatType = 'day' | 'hour' | 'millisecond' | 'minute' | 'month' | 'second' | 'week' | 'year';
type XAxisLabelContext = any

const formaXAxisDateLabel = (type: XAxisDateFormatType, value: number): string => {
  const date = moment(value);
  if (type === 'second') {
    return date.format('HH:mm:ss');
  }
  if (type === 'minute') {
    return date.format('HH:mm');
  }
  if (type === 'hour') {
    return date.format('HH:mm');
  }
  if (type === 'day') {
    return date.format('YYYY.MM.DD');
  }
  if (type === 'week') {
    return date.format('YYYY.MM.DD');
  }
  if (type === 'month') {
    return date.format('YYYY.MM');
  }
  if (type === 'year') {
    return date.format('YYYY');
  }
  return date.format('YYYY.MM.DD');
};

interface MaterialDiffClass {
  'is-visible': boolean;
  'is-minus'?: boolean;
  'is-plus'?: boolean;
}

let chart: Highcharts.Chart | undefined = undefined;

const series_state: SeriesStates = {
    'fuel': {
      visible: true,
      first: 0,
      last: 0,
    },
    'bull': {
      visible: true,
      first: 0,
      last: 0,
    },
    'steel': {
      visible: true,
      first: 0,
      last: 0,
    },
    'buxite': {
      visible: true,
      first: 0,
      last: 0,
    },
}
let date_from = 0
let date_to = 0

function drawChart(datas: MaterialChartData): void {
  console.log('material record len', datas[0].length);

  function yAxisFormatter(this: any): string {
    return this.value.toString();
  }

  function xAxisFormatter(this: any): string {
    const ctx = this as any
    setMinMaxData(ctx)
    return formaXAxisDateLabel(ctx.dateTimeLabelFormat, ctx.value as number);
  }

  const yAxis: Highcharts.YAxisOptions = {
    labels: {
      formatter: yAxisFormatter,
    },
  };
  const xAxis: Highcharts.XAxisOptions = {
    dateTimeLabelFormats: {
      day: 'day',
      hour: 'hour',
      millisecond: 'millisecond',
      minute: 'minute',
      month: 'month',
      second: 'second',
      week: 'week',
      year: 'year'
    },
    labels: {
      formatter: xAxisFormatter,
    }
  };
  const zoom_buttons: Highcharts.RangeSelectorButtonsOptions[] = [
    { type: 'hour', count: 6, text: '6H' },
    { type: 'hour', count: 12, text: '12H' },
    { type: 'day', count: 1, text: '日' },
    { type: 'week', count: 1, text: '週' },
    { type: 'month', count: 1, text: '月' }, 
    { type: 'month', count: 3, text: '3ヶ月' }, 
    { type: 'month', count: 6, text: '半年' }, 
    { type: 'ytd', text: '今年' }, 
    { type: 'year', count: 1, text: '1年' }, 
    { type: 'all', text: '全て' }
  ];
  
  function TooltipFormatter(this: Highcharts.TooltipFormatterContextObject,
    _tooltip: Highcharts.Tooltip): (false|string|Array<(string|null|undefined)>|null|undefined) {

    //console.log('tooltip', this, tooltip);

    const date = moment(this.x);
    const date_str = '<div class="tip-text date">' + date.format('YYYY.MM.DD') + ' ' + date.format('HH:mm') + '</div>';

    const findPrevPoint = (point: any, points: any[]): any | null => {
      if (! points.length) {
        return null;
      }
      const offset = (points[0].index > 0 ? points[0].index : 0);
      const index = point.index - 1 - offset;
      return points[index] ?? null;
    };

    const formatDiffValue = (v: string | number): string => {
      if (v === '') {
        return '';
      }

      if (v === 0) {
        return '(±0)';
      }

      if ((v as number)> 0) {
        return `<span class="plus">(+${v})</span>`;
      }
      return `<span class="minus">(${v})</span>`;
    };

    const htmls = this.points?.reduce((acc: string[], el: any) => {
      const series_type: SeriesType = el.point.series.userOptions.id! as SeriesType;
      const prev_point = findPrevPoint(el.point, el.point.series.points);
      const value = Math.floor(el.point.y!);
      const prev_value = prev_point ? value - Math.floor(prev_point.y!) : '';
      const html = `<div class="s-icon titlebar-${series_type} tip-text ${series_type}"> ${value} ${formatDiffValue(prev_value)}</div>`;
      acc.push(html);
      return acc;
    }, []);
    
    return date_str + (htmls?.join('') ?? '');
  }

  const options: Highcharts.Options = {
    chart: {
      renderTo: 'chart-material',
      backgroundColor: 'transparent',
      //height: 400,
      //marginTop: 100,
      spacingTop: 61,
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
    title: {
    },
    rangeSelector: {
      selected: 4,
      inputEnabled: false,
      buttonPosition: {
        //align: 'center',
        align: 'left',
      },
      buttons: zoom_buttons,
      labelStyle: {
        display: 'none',
      },
      floating: true,
      x: 0,
      y: -50,
    },
    credits: { enabled: false },
    xAxis,
    yAxis,
    plotOptions: {
      series: {
        //compare: 'value',
        showInNavigator: true,
      },
    },
    tooltip: {
      valueDecimals: 0,
      split: true,
      useHTML: true,
      formatter: TooltipFormatter,
      borderColor: '#000',
      padding: 6,
      borderRadius: 0,
    },
    series: [
      { id: SeriesTypes.fuel, type: 'line', name: SeriesTypes.fuel, data: datas[0], lineWidth: 1, color: '#7BD66F', },
      { id: SeriesTypes.bull, type: 'line', name: SeriesTypes.bull, data: datas[1], lineWidth: 1, color: '#B79249', },
      { id: SeriesTypes.steel, type: 'line', name: SeriesTypes.steel, data: datas[2], lineWidth: 1, color: '#B7B7B7', },
      { id: SeriesTypes.buxite, type: 'line', name: SeriesTypes.buxite, data: datas[3], lineWidth: 1, color: '#f7a35c' },
    ]
  };

  chart = Highcharts.stockChart(options);
}

function toggleSeries(id: SeriesType): void {
    const series = chart?.get(id) as any;
    if (series) {
        series.setVisible(!series.visible);
        series_state[id].visible = series.visible;
    }
}

const dateFrom = computed<string>(() => {
  if (!isValidDateRange.value) return ''
  const from = moment(date_from)
  return from.format('YYYY.MM.DD')
})

const dateTo = computed<string>(() => {
  if (!isValidDateRange.value) return ''
  const to = moment(date_to)
  return to.format('YYYY.MM.DD')
})

function setMinMaxData(ctx: any): void {
  const findProcessedYData = (ctx: any, type: string): Array<number> | undefined => {
    const datas = (ctx.axis.series.find((el) => el.name === type) as any)?.processedYData
    if (Array.isArray(datas)) return datas as Array<number>
    return undefined
  }
  if (ctx.isFirst) {
    Object.keys(SeriesTypes).forEach((el) => {
      const ydatas = findProcessedYData(ctx, el)
      if (ydatas && ydatas.length) {
        series_state[el as SeriesType].first = Math.floor(ydatas[0])
        series_state[el as SeriesType].last = Math.floor(ydatas[ydatas.length - 1])
      }
    })
    date_from = ctx.axis.min!
    date_to = ctx.axis.max!
  }
}

function getDiff(id: SeriesType): number {
  const state = series_state[id]
  return state.last - state.first
}

function getDiffText(id: SeriesType): string {
  const diff = getDiff(id)
  if (diff === 0) return '±0'
  if (diff > 0) return '+' + diff
  return diff.toString()
}

const isValidDateRange = computed<boolean>(() => date_from > 0 && date_to > 0)

function isSeriesVisible(id: SeriesType): boolean {
  return series_state[id].visible
}

const isSeriesFuelVisible = computed<boolean>(() => isSeriesVisible(SeriesTypes.fuel))
const isSeriesBullVisible = computed<boolean>(() => isSeriesVisible(SeriesTypes.bull))
const isSeriesSteelVisible = computed<boolean>(() => isSeriesVisible(SeriesTypes.steel))
const isSeriesBuxiteVisible = computed<boolean>(() => isSeriesVisible(SeriesTypes.buxite))

const isAnySeriesVisible = computed<boolean>(
  () => isSeriesFuelVisible.value || isSeriesBullVisible.value || isSeriesSteelVisible.value || isSeriesBuxiteVisible.value
)

function diffClass(id: SeriesType): MaterialDiffClass {
  const diff = getDiff(id)
  return {
    'is-visible': isSeriesVisible(id),
    'is-minus': diff < 0,
    'is-plus': diff > 0,
  }
}
const diffFuelClass = computed<MaterialDiffClass>(() => diffClass(SeriesTypes.fuel))
const diffBullClass = computed<MaterialDiffClass>(() => diffClass(SeriesTypes.bull))
const diffSteelClass = computed<MaterialDiffClass>(() => diffClass(SeriesTypes.steel))
const diffBuxiteClass = computed<MaterialDiffClass>(() => diffClass(SeriesTypes.buxite))

const fuelDiff = computed<string>(() => getDiffText(SeriesTypes.fuel))
const bullDiff = computed<string>(() => getDiffText(SeriesTypes.bull))
const steelDiff = computed<string>(() => getDiffText(SeriesTypes.steel))
const buxiteDiff = computed<string>(() => getDiffText(SeriesTypes.buxite))

onMounted(() => {
  console.log('chart material mounted');
});

onUnmounted(() => {
  console.log('chart material unmounted');
  if (chart) {
    chart.destroy();
    chart = undefined;
  }
});

// exports
defineExpose({
  drawChart
});

/////////////////////////////////////////////////////////////////////////////////////
// initialize
(() => {
  chartStuff.initialize();
})();

</script>

<template>
  <div class="material-chart">
    <div class="chart-container">
      <div class="chart-content" id="chart-material">
        <b-loading
          :is-full-page="false"
          v-model="isLoading"
          :can-cancel="false"
        ></b-loading>
      </div>
      <div class="chart-material-buttons">
        <button @click="toggleSeries('fuel')" class="fuel" :class="{ 'is-visible': isSeriesFuelVisible}"><span class="s-icon titlebar-fuel"><span class="line-word"></span></span></button>
        <button @click="toggleSeries('bull')" class="bull" :class="{ 'is-visible': isSeriesBullVisible}"><span class="s-icon titlebar-bull"><span class="line-word"></span></span></button>
        <button @click="toggleSeries('steel')" class="steel" :class="{ 'is-visible': isSeriesSteelVisible}"><span class="s-icon titlebar-steel"><span class="line-word"></span></span></button>
        <button @click="toggleSeries('buxite')" class="buxite" :class="{ 'is-visible': isSeriesBuxiteVisible}"><span class="s-icon titlebar-buxite"><span class="line-word"></span></span></button>
      </div>
      <div v-if="isValidDateRange" class="chart-material-detail">
        <ChartImage class="chart-image" /> 資源チャート: {{dateFrom}} ～ {{dateTo}}
        <span :class="{ 'is-visible': isAnySeriesVisible}">増減 </span>
        <span class="fuel mr-1" :class="diffFuelClass"><span class="s-icon titlebar-fuel">{{fuelDiff}}</span></span>
        <span class="bull mr-1" :class="diffBullClass"><span class="s-icon titlebar-bull">{{bullDiff}}</span></span>
        <span class="steel mr-1" :class="diffSteelClass"><span class="s-icon titlebar-steel">{{steelDiff}}</span></span>
        <span class="buxite" :class="diffBuxiteClass"><span class="s-icon titlebar-buxite">{{buxiteDiff}}</span></span>
      </div>
    </div>
  </div>
</template>