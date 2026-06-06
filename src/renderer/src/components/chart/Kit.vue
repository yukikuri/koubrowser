<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from 'vue'
import type { KitChartData } from '@common/record'
import ChartImage from '@assets/img/chart.svg'
import moment from 'moment'
import Highcharts from 'highcharts'
import noDataToDisplay from 'highcharts/modules/no-data-to-display'
import * as chartStuff from '@renderer/components/chart/stuff'

noDataToDisplay(Highcharts)

// loadingはchart描画後に要素が削除されることから false に設定不要
const isLoading = ref<boolean>(true);

const SeriesTypes = {
  fast_repair: 'fast-repair',
  fast_build: 'fast-build',
  build_kit: 'build-kit',
  remodel_kit: 'remodel-kit',
} as const
type SeriesType = (typeof SeriesTypes)[keyof typeof SeriesTypes]

interface SeriesSet { visible: boolean; first: number; last: number }
type SeriesStates = { [key in SeriesType]: SeriesSet }

type XAxisDateFormatType = 'day' | 'hour' | 'millisecond' | 'minute' | 'month' | 'second' | 'week' | 'year'
type XAxisLabelContext = any
const formaXAxisDateLabel = (type: XAxisDateFormatType, value: number): string => {
  const date = moment(value)
  if (type === 'second') return date.format('HH:mm:ss')
  if (type === 'minute') return date.format('HH:mm')
  if (type === 'hour') return date.format('HH:mm')
  if (type === 'day') return date.format('YYYY.MM.DD')
  if (type === 'week') return date.format('YYYY.MM.DD')
  if (type === 'month') return date.format('YYYY.MM')
  if (type === 'year') return date.format('YYYY')
  return date.format('YYYY.MM.DD')
}

interface MaterialDiffClass { 'is-visible': boolean; 'is-minus'?: boolean; 'is-plus'?: boolean }

let chart: Highcharts.Chart | undefined = undefined;

const series_state: SeriesStates = {
  'fast-repair': { visible: true, first: 0, last: 0 },
  'fast-build': { visible: true, first: 0, last: 0 },
  'build-kit': { visible: true, first: 0, last: 0 },
  'remodel-kit': { visible: true, first: 0, last: 0 },
}
let date_from = 0
let date_to = 0

function drawChart(datas: KitChartData): void {
  console.log('kit record len', datas[0].length);
  
  function yAxisFormatter(
    this: Highcharts.AxisLabelsFormatterContextObject,
    _: Highcharts.AxisLabelsFormatterContextObject): string {
    return this.value.toString()
  }

  function xAxisFormatter(
    this: Highcharts.AxisLabelsFormatterContextObject,
    ctx: Highcharts.AxisLabelsFormatterContextObject): string {
    const lavel_ctx = this as XAxisLabelContext;
    setMinMaxData(lavel_ctx);
    return formaXAxisDateLabel(lavel_ctx.dateTimeLabelFormat, ctx.value as number)
  }

  const yAxis: Highcharts.YAxisOptions = { labels: { formatter: yAxisFormatter } }
  const xAxis: Highcharts.XAxisOptions = {
    dateTimeLabelFormats: 
    { day: 'day', 
      hour: 'hour', 
      millisecond: 'millisecond', 
      minute: 'minute', 
      month: 'month', 
      second: 'second', 
      week: 'week', 
      year: 'year' },
    labels: { formatter: xAxisFormatter },
  }
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
    { type: 'all', text: '全て' },
  ]

  function TooltipFormatter(
    this: Highcharts.TooltipFormatterContextObject, 
    tooltip: Highcharts.Tooltip): (false|string|Array<(string|null|undefined)>|null|undefined) {
    const date = moment(this.x)
    const date_str = '<div class="tip-text date">' + date.format('YYYY.MM.DD') + ' ' + date.format('HH:mm') + '</div>'

    const findPrevPoint = (point: any, points: any[]): any | null => {
      if (!points.length) return null
      const offset = points[0].index > 0 ? points[0].index : 0
      const index = point.index - 1 - offset
      return points[index] ?? null
    }

    const formatDiffValue = (v: string | number): string => {
      if (v === '') return ''
      if (v === 0) return '(±0)'
      if ((v as number) > 0) return `<span class="plus">(+${v})</span>`
      return `<span class="minus">(${v})</span>`
    }

    const htmls = this.points?.reduce((acc: string[], el: any) => {
      const series_type: SeriesType = el.point.series.userOptions.id! as SeriesType
      const prev_point = findPrevPoint(el.point, el.point.series.points)
      const value = Math.floor(el.point.y!)
      const prev_value = prev_point ? value - Math.floor(prev_point.y!) : ''
      const html = `<div class="s-icon titlebar-${series_type} tip-text ${series_type}"> ${value} ${formatDiffValue(prev_value)}</div>`
      acc.push(html)
      return acc
    }, [])

    return date_str + (htmls?.join('') ?? '')
  }

  const options: Highcharts.Options = {
    chart: { renderTo: 'chart-kit', backgroundColor: 'transparent', height: 400, spacingTop: 61 },
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
    title: {},
    rangeSelector: { selected: 4, inputEnabled: false, buttonPosition: { align: 'left' }, buttons: zoom_buttons, labelStyle: { display: 'none' }, floating: true, x: 0, y: -50 },
    credits: { enabled: false },
    xAxis,
    yAxis,
    plotOptions: { series: { showInNavigator: true } },
    tooltip: { valueDecimals: 0, split: true, useHTML: true, formatter: TooltipFormatter, borderColor: '#000', padding: 6, borderRadius: 0 },
    series: [
      { id: SeriesTypes.fast_repair, type: 'line', name: SeriesTypes.fast_repair, data: datas[0], lineWidth: 1, color: '#7BD66F' },
      { id: SeriesTypes.fast_build, type: 'line', name: SeriesTypes.fast_build, data: datas[1], lineWidth: 1, color: '#B79249' },
      { id: SeriesTypes.build_kit, type: 'line', name: SeriesTypes.build_kit, data: datas[2], lineWidth: 1, color: '#B7B7B7' },
      { id: SeriesTypes.remodel_kit, type: 'line', name: SeriesTypes.remodel_kit, data: datas[3], lineWidth: 1, color: '#f7a35c' },
    ],
  }

  chart = Highcharts.stockChart(options);
}

function setMinMaxData(ctx: XAxisLabelContext): void {
  const findProcessedYData = (ctx: any, type: string): Array<number> | undefined => {
    const datas = (ctx.axis.series.find((el) => el.name === type) as any)?.processedYData
    if (Array.isArray(datas)) return datas as Array<number>
    return undefined
  }
  if (ctx.isFirst) {
    Object.values(SeriesTypes).forEach((el) => {
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

function toggleSeries(id: SeriesType): void {
  const series = chart?.get(id) as any
  if (series) {
    series.setVisible(!series.visible)
    series_state[id].visible = series.visible
  }
}

const dateFrom = computed<string>(() => (date_from > 0 ? moment(date_from).format('YYYY.MM.DD') : ''))
const dateTo = computed<string>(() => (date_to > 0 ? moment(date_to).format('YYYY.MM.DD') : ''))
const isValidDateRange = computed<boolean>(() => date_from > 0 && date_to > 0)

function getDiff(id: SeriesType): number { const state = series_state[id]; return state.last - state.first }
function getDiffText(id: SeriesType): string { const diff = getDiff(id); if (diff === 0) return '±0'; if (diff > 0) return '+' + diff; return diff.toString() }

const fastRepairDiff = computed<string>(() => getDiffText(SeriesTypes.fast_repair))
const fastBuildDiff = computed<string>(() => getDiffText(SeriesTypes.fast_build))
const buildKitDiff = computed<string>(() => getDiffText(SeriesTypes.build_kit))
const remodelKitDiff = computed<string>(() => getDiffText(SeriesTypes.remodel_kit))

function isSeriesVisible(id: SeriesType): boolean { return series_state[id].visible }
const isSeriesFastRepairVisible = computed<boolean>(() => isSeriesVisible(SeriesTypes.fast_repair))
const isSeriesFastBuildVisible = computed<boolean>(() => isSeriesVisible(SeriesTypes.fast_build))
const isSeriesBuildKitVisible = computed<boolean>(() => isSeriesVisible(SeriesTypes.build_kit))
const isSeriesRemodelKitVisible = computed<boolean>(() => isSeriesVisible(SeriesTypes.remodel_kit))
const isAnySeriesVisible = computed<boolean>(() => isSeriesFastRepairVisible.value || isSeriesFastBuildVisible.value || isSeriesBuildKitVisible.value || isSeriesRemodelKitVisible.value)

const diffFastRepairClass = computed<MaterialDiffClass>(() => ({ 'is-visible': isSeriesFastRepairVisible.value, 'is-minus': getDiff(SeriesTypes.fast_repair) < 0, 'is-plus': getDiff(SeriesTypes.fast_repair) > 0 }))
const diffFastBuildClass = computed<MaterialDiffClass>(() => ({ 'is-visible': isSeriesFastBuildVisible.value, 'is-minus': getDiff(SeriesTypes.fast_build) < 0, 'is-plus': getDiff(SeriesTypes.fast_build) > 0 }))
const diffBuildKitClass = computed<MaterialDiffClass>(() => ({ 'is-visible': isSeriesBuildKitVisible.value, 'is-minus': getDiff(SeriesTypes.build_kit) < 0, 'is-plus': getDiff(SeriesTypes.build_kit) > 0 }))
const diffRemodelKitClass = computed<MaterialDiffClass>(() => ({ 'is-visible': isSeriesRemodelKitVisible.value, 'is-minus': getDiff(SeriesTypes.remodel_kit) < 0, 'is-plus': getDiff(SeriesTypes.remodel_kit) > 0 }))

// exports
defineExpose({
  drawChart
});

onMounted(() => {
  console.log('chart kit mounted');
});

onUnmounted(() => {
  console.log('chart kit unmounted');
  if (chart) {
    chart.destroy();
    chart = undefined;
  }
});

/////////////////////////////////////////////////////////////////////////////////////
// initialize
(() => {
  chartStuff.initialize();
})();

</script>

<template>
  <div class="kit-chart top-line">
    <div class="chart-container">
      <div class="chart-content" id="chart-kit">
        <b-loading
          :is-full-page="false"
          v-model="isLoading"
          :can-cancel="false"
        ></b-loading>
      </div>
      <div class="chart-material-buttons">
        <button @click="toggleSeries('fast-repair')" class="fuel" :class="{ 'is-visible': isSeriesFastRepairVisible }"><span class="s-icon titlebar-fast-repair"><span class="line-word"></span></span></button>
        <button @click="toggleSeries('fast-build')" class="bull" :class="{ 'is-visible': isSeriesFastBuildVisible }"><span class="s-icon titlebar-fast-build"><span class="line-word"></span></span></button>
        <button @click="toggleSeries('build-kit')" class="steel" :class="{ 'is-visible': isSeriesBuildKitVisible }"><span class="s-icon titlebar-build-kit"><span class="line-word"></span></span></button>
        <button @click="toggleSeries('remodel-kit')" class="buxite" :class="{ 'is-visible': isSeriesRemodelKitVisible }"><span class="s-icon titlebar-remodel-kit"><span class="line-word"></span></span></button>
      </div>
      <div v-if="isValidDateRange" class="chart-material-detail">
        <ChartImage class="chart-image" /> 資材チャート: {{ dateFrom }} ～ {{ dateTo }}
        <span :class="{ 'is-visible': isAnySeriesVisible }">増減 </span>
        <span class="mr-1" :class="diffFastRepairClass"><span class="s-icon titlebar-fast-repair">{{ fastRepairDiff }}</span></span>
        <span class="mr-1" :class="diffFastBuildClass"><span class="s-icon titlebar-fast-build">{{ fastBuildDiff }}</span></span>
        <span class="mr-1" :class="diffBuildKitClass"><span class="s-icon titlebar-build-kit">{{ buildKitDiff }}</span></span>
        <span :class="diffRemodelKitClass"><span class="s-icon titlebar-remodel-kit">{{ remodelKitDiff }}</span></span>
      </div>
    </div>
  </div>
</template>