<template>
  <div class="chart top-line">
    <div class="chart-container">
     <div class="chart-content" id="chart-kit"></div>
     <div class="chart-material-buttons">
       <button @click="toggleSeries('fast-repair')" class="fuel" :class="{ 'is-visible': isSeriesFastRepairVisible}"><span class="s-icon titlebar-fast-repair"><span class="line-word"></span></span></button>
       <button @click="toggleSeries('fast-build')" class="bull" :class="{ 'is-visible': isSeriesFastBuildVisible}"><span class="s-icon titlebar-fast-build"><span class="line-word"></span></span></button>
       <button @click="toggleSeries('build-kit')" class="steel" :class="{ 'is-visible': isSeriesBuildKitVisible}"><span class="s-icon titlebar-build-kit"><span class="line-word"></span></span></button>
       <button @click="toggleSeries('remodel-kit')" class="buxite" :class="{ 'is-visible': isSeriesRemodelKitVisible}"><span class="s-icon titlebar-remodel-kit"><span class="line-word"></span></span></button>
     </div>
     <div v-if="isValidDateRange" class="chart-material-detail">
       <chart-image class="chart-image" />  資材チャート: {{dateFrom}} ～ {{dateTo}}
       <span :class="{ 'is-visible': isAnySeriesVisible}">増減 </span>
       <span class="mr-1" :class="diffFastRepairClass"><span class="s-icon titlebar-fast-repair">{{fastRepairDiff}}</span></span>
       <span class="mr-1" :class="diffFastBuildClass"><span class="s-icon titlebar-fast-build">{{fastBuildDiff}}</span></span>
       <span class="mr-1" :class="diffBuildKitClass"><span class="s-icon titlebar-build-kit">{{buildKitDiff}}</span></span>
       <span class="" :class="diffRemodelKitClass"><span class="s-icon titlebar-remodel-kit">{{remodelKitDiff}}</span></span>
     </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ipcRenderer } from 'electron';
import { MainChannel } from '@/lib/app';
import { PortRecord, PortRecordQuery, PortRecordQueryProjection } from '@/lib/record';
import { ApiItemId } from '@/lib/kcs';
import { Unpacked } from '@/lib/ts';
import ChartImage from '@/renderer/assets/chart.svg';
import moment from 'moment';
import * as Highcharts from 'highcharts';

const SeriesTypes = {
  fast_repair: 'fast-repair',
  fast_build: 'fast-build',
  build_kit: 'build-kit',
  remodel_kit: 'remodel-kit',
} as const;
type SeriesType = Unpacked<typeof SeriesTypes>;

interface SeriesSet {
  visible: boolean;
  first: number;
  last: number;
}
type SeriesStates = { [key in SeriesType]: SeriesSet };

type XAxisDateFormatType = 'day' | 'hour' | 'millisecond' | 'minute' | 'month' | 'second' | 'week' | 'year';
interface XAxisLabelContext extends Highcharts.AxisLabelsFormatterContextObject<number> {
  readonly dateTimeLabelFormat: XAxisDateFormatType;
}

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

@Component({
  components: {
    ChartImage,
  },
})
export default class extends Vue {

  private chart?: Highcharts.Chart = undefined;
  private series_state: SeriesStates = {
    'fast-repair': {
      visible: true,
      first: 0,
      last: 0,
    },
    'fast-build': {
      visible: true,
      first: 0,
      last: 0,
    },
    'build-kit': {
      visible: true,
      first: 0,
      last: 0,
    },
    'remodel-kit': {
      visible: true,
      first: 0,
      last: 0,
    },
  };
  private date_from: number = 0;
  private date_to: number = 0;

  private mounted(): void {
    console.log('chart kit mounted');

    const projection: PortRecordQueryProjection = {};
    projection[ApiItemId.fast_repair] = 1;
    projection[ApiItemId.fast_build] = 1;
    projection[ApiItemId.build_kit] = 1;
    projection[ApiItemId.remodel_kit] = 1;
    projection.date = 1;
    const query: PortRecordQuery = {
      projection,
    };
    ipcRenderer.invoke(MainChannel.query_material, query).then((records: PortRecord[]) => {
      this.drawLineChart(records);
    });
  }

  private destroyed(): void {
    console.log('chart kit destroyed');
  }

  private drawLineChart(records: PortRecord[]): void {
    const instance = this;

    console.log('record len', records.length);
    console.time('record');
    records.sort((a, b) => a.date < b.date ? -1 : 1);
    const datas: any[][] = records.reduce<any[][]>((acc, rec) => {
      const date = moment(rec.date).valueOf();
      acc[0].push([date, rec[ApiItemId.fast_repair]]);
      acc[1].push([date, rec[ApiItemId.fast_build]]);
      acc[2].push([date, rec[ApiItemId.build_kit]]);
      acc[3].push([date, rec[ApiItemId.remodel_kit]]);
      return acc;
    }, [[], [], [], []]);
    console.timeEnd('record');

    function yAxisFormatter(
      this: Highcharts.AxisLabelsFormatterContextObject<number>,
      _: Highcharts.AxisLabelsFormatterContextObject<string>): string {
      return this.value.toString();
    }

    function xAxisFormatter(
      this: Highcharts.AxisLabelsFormatterContextObject<number>,
      _: Highcharts.AxisLabelsFormatterContextObject<string>): string {
      const ctx = this as XAxisLabelContext;
      instance.setMinMaxData(ctx);
      return formaXAxisDateLabel(ctx.dateTimeLabelFormat, ctx.value);
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
    
    function TooltipFormatter(
      this: Highcharts.TooltipFormatterContextObject, 
      tooltip: Highcharts.Tooltip): (false|string|Array<(string|null|undefined)>|null|undefined) {

      //console.log('tooltip', this, tooltip);

      const date = moment(this.x);
      const date_str = '<div class="tip-text date">' + date.format('YYYY.MM.DD') + ' ' + date.format('HH:mm') + '</div>';

      const findPrevPoint = (point: Highcharts.Point, points: Highcharts.Point[]): Highcharts.Point | null => {
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

        if (v > 0) {
          return `<span class="plus">(+${v})</span>`;
        }
        return `<span class="minus">(${v})</span>`;
      };

      const htmls = this.points?.reduce<string[]>((acc, el) => {
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
        renderTo: 'chart-kit',
        backgroundColor: 'transparent',
        height: 400,
        //marginTop: 100,
        spacingTop: 61,
      },
      title: {
        //text: 'chart title'
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
        { id: SeriesTypes.fast_repair, type: 'line', name: SeriesTypes.fast_repair, data: datas[0], lineWidth: 1, color: '#7BD66F', },
        { id: SeriesTypes.fast_build, type: 'line', name: SeriesTypes.fast_build, data: datas[1], lineWidth: 1, color: '#B79249', },
        { id: SeriesTypes.build_kit, type: 'line', name: SeriesTypes.build_kit, data: datas[2], lineWidth: 1, color: '#B7B7B7', },
        { id: SeriesTypes.remodel_kit, type: 'line', name: SeriesTypes.remodel_kit, data: datas[3], lineWidth: 1, color: '#f7a35c' },
      ]
    };

    this.chart = Highcharts.stockChart(options);
  }


  private toggleSeries(id: SeriesType): void {
    const series = this.chart?.get(id) as Highcharts.Series;
    if (series) {
        series.setVisible(!series.visible);
        this.series_state[id].visible = series.visible;
    }
  }

  private get dateFrom(): string {
    if (! this.isValidDateRange) {
      return '';
    }
    const from = moment(this.date_from);
    return from.format('YYYY.MM.DD');
  }

  private get dateTo(): string {
    if (! this.isValidDateRange) {
      return '';
    }
    const to = moment(this.date_to);
    return to.format('YYYY.MM.DD');
  }

  private setMinMaxData(ctx: XAxisLabelContext): void {

    const findProcessedYData = (ctx: XAxisLabelContext, type: string): Array<number> | undefined => {
      const datas = (ctx.axis.series.find(el => el.name === type) as any)?.processedYData;
      if (Array.isArray(datas)) {
        return datas as Array<number>;
      }
    };

    if (ctx.isFirst) {
      console.log('is first', ctx.value, ctx.axis.min, ctx.axis.max,ctx);
      Object.values(SeriesTypes).forEach(el => {
        console.log('key is', el);
        const ydatas = findProcessedYData(ctx, el);
        console.log('find ydatas', el, ydatas?.length)
        if (ydatas && ydatas.length) {
          this.series_state[el as SeriesType].first = Math.floor(ydatas[0]);
          this.series_state[el as SeriesType].last = Math.floor(ydatas[ydatas.length-1]);
        }
      });
      this.date_from = ctx.axis.min!;
      this.date_to = ctx.axis.max!;
    }

    if (ctx.isLast) {
      console.log('last', ctx);
    }
  }


  private getDiff(id: SeriesType): number {
    const state = this.series_state[id];
    return state.last - state.first;
  }

  private getDiffText(id: SeriesType): string {
    const diff = this.getDiff(id);
    if (diff === 0) {
      return '±0';
    }
    if (diff > 0) {
      return '+'+diff;
    }
    return diff.toString();
  }

  private get fastRepairDiff(): string {
    return this.getDiffText(SeriesTypes.fast_repair);
  }

  private get fastBuildDiff(): string {
    return this.getDiffText(SeriesTypes.fast_build);
  }

  private get buildKitDiff(): string {
    return this.getDiffText(SeriesTypes.build_kit);
  }

  private get remodelKitDiff(): string {
    return this.getDiffText(SeriesTypes.remodel_kit);
  }

  private get isValidDateRange(): boolean {
    return this.date_from > 0 && this.date_to > 0;
  }

  private isSeriesVisible(id: SeriesType): boolean {
    return this.series_state[id].visible;
  }

  private get isAnySeriesVisible(): boolean {
    return this.isSeriesFastRepairVisible || this.isSeriesFastBuildVisible || this.isSeriesBuildKitVisible || this.isSeriesRemodelKitVisible;
  }

  private diffClass(id: SeriesType): MaterialDiffClass {
    const diff = this.getDiff(id);
    return {
      'is-visible': this.isSeriesVisible(id),
      'is-minus': diff < 0,
      'is-plus': diff > 0,
    };
  }

  private get diffFastRepairClass(): MaterialDiffClass {
    return this.diffClass(SeriesTypes.fast_repair);
  }

  private get diffFastBuildClass(): MaterialDiffClass {
    return this.diffClass(SeriesTypes.fast_build);
  }

  private get diffBuildKitClass(): MaterialDiffClass {
    return this.diffClass(SeriesTypes.build_kit);
  }

  private get diffRemodelKitClass(): MaterialDiffClass {
    return this.diffClass(SeriesTypes.remodel_kit);
  }

  private get isSeriesFastRepairVisible(): boolean {
    return this.isSeriesVisible(SeriesTypes.fast_repair);
  }

  private get isSeriesFastBuildVisible(): boolean {
    return this.isSeriesVisible(SeriesTypes.fast_build);
  }

  private get isSeriesBuildKitVisible(): boolean {
    return this.isSeriesVisible(SeriesTypes.build_kit);
  }

  private get isSeriesRemodelKitVisible(): boolean {
    return this.isSeriesVisible(SeriesTypes.remodel_kit);
  }
}
</script>
