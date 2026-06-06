<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import Highcharts from 'highcharts';
import * as chartStuff from '@renderer/components/chart/stuff'
import { ShipTypePieData } from './types';
import { AggregateShipType } from '@common/calc_record';
import CheckOnlyImage from '@assets/img/check-only.svg'

// -----------------------------------------------------------------
// 親へ通知するための emit 定義
const emit = defineEmits<{
  (e: 'ship-type-select-change', type: AggregateShipType, visible: boolean): void
}>();

// -----------------------------------------------------------------
// legends
interface LegendInfo {
  pt: Highcharts.Point;
  selected: boolean;
}

const legends = ref<LegendInfo[]>([]);

const props = defineProps<{
  seriesData: ShipTypePieData[]
}>();

const chartEl = ref<HTMLElement | null>(null);
console.log('ShipTypePie chartEl:', !!chartEl.value, props);
let chart: Highcharts.Chart | null = null;

function handlePointSelect(pt: Highcharts.Point, selected: boolean) {
  console.log('handlePointSelect:', pt, selected);
  const type = (pt as any).type as AggregateShipType;

  // 対応する legend を探して selected を更新
  const legend = legends.value.find((el) => (el.pt as any).type === type);
  if (legend) {
    console.log('found legend for type:', type, legend);
    legend.selected = selected;
    // 親に通知
    emit('ship-type-select-change', type, selected);
  }
}

function createChart() {
  if (!chartEl.value) return;
  chart = Highcharts.chart({
    chart: {
      renderTo: chartEl.value,
      type: 'pie',
      backgroundColor: 'transparent',      // 追加: チャート背景を透明に
      plotBackgroundColor: 'transparent',  // 追加: プロット領域背景を透明に
      width: 228,
      height: 228,
      marginLeft: 0,
      marginRight: 0,
    },
    title: { text: undefined },
    tooltip: { 
      outside: true, // ツールチップとラベルが重なる場合、ツールチップを前面に表示するために設定
      headerFormat: '',
      formatter: function () {
        const p = this.point;
        const name = p.name === '-' ? 'なし' : p.name;
        return `<span>${name}: ${p.y}</span><br/><span>${Highcharts.numberFormat(p.percentage!,1)}%</span>`;
      },
      padding: 4,
    },

    accessibility: { point: { valueSuffix: '%' } },

    // 凡例カスタマイズ：ラベルに「件数,%」を表示
    legend: {
      enabled: false,
    },

    plotOptions: {
      pie: {
        animation: { duration: 500 },
        size: 200,
        allowPointSelect: true,
        cursor: 'pointer',
        point: {
          events: {
            click: function (e: any) {
              console.log('point clicked1:', this, e);
              // 第二引数を true にすると既存選択に追加される
              this.select(undefined, true);
              console.log('point clicked2:', this, e);
              return false;
              //return true;
            },
            select: function (_e: any) {
              console.log('point selected:', this, _e);
              handlePointSelect(this as Highcharts.Point, true);
            },
            unselect: function (_e: any) {
              console.log('point unselected:', this, _e);
              handlePointSelect(this as Highcharts.Point, false);
            }
          }
        },
        showInLegend: false,
        dataLabels: {
          enabled: true,
          useHTML: true,  // HTML にして折返しを可能にする
          crop: false,    // 表示領域で切らない
          overflow: 'allow',  // はみ出しを許可
          distance: -33,
          formatter: function() {
            return `<div class="ship-type-pie-label"><b>${this.point.name}</b><br/>${Highcharts.numberFormat(this.percentage,1)}%</div>`;
          },
          style: {
            fontSize: '12px',
            textOverflow: 'clip',    // ellipsis を防ぐ
            whiteSpace: 'nowarp',
          }
        },
      }
    },
    series: [{
      name: '割合',
      data: props.seriesData ?? [],
      type: 'pie',
    }],
    credits: { enabled: false }
  });
}

function updateChartLegends() {
  if (!chart) return;

  const serices = chart.series[0];
  if (!serices) return;

  const localLegends: LegendInfo[] = [];
  serices.points.forEach((pt) => {
    console.log('adding legend for point:', pt);
    localLegends.push({ pt, selected: pt.selected });
  });
  legends.value = localLegends;
}

onMounted(() => {
  console.log('ShipTypePie mounted. chartEl:', !!chartEl.value);
  chartStuff.initialize();
  createChart();
  updateChartLegends();
});

onUnmounted(() => {
  if (chart) {
    chart.destroy();
    chart = null;
  }
});

function getPercentage(pt: Highcharts.Point): string {
  if (! pt.percentage) {
    return '';
  }
  return Highcharts.numberFormat(pt.percentage,1) + '%'
}

function getLegendStyle(legend: LegendInfo): string {
  return `--pie-point-color: ${legend.pt.color};`;
}

function getLegendColorboxStyle(legend: LegendInfo): string {
  return `--background-color: ${legend.pt.color};`;
}

function getLegendText(legend: LegendInfo): string {
  const pt = legend.pt;
  const name = pt.name === '-' ? 'なし' : pt.name;
  const percentage = getPercentage(pt);
  const percentageText = percentage ? ' (' + percentage + ')' : ''
  return `${name} ${pt.y}${percentageText}`;
}

function onLegendClick(legend: LegendInfo, index: number): void {
  console.log('legend clicked:', legend, index);
  const pt = legend.pt;
  if (pt) {
    // Highcharts のポイントの選択状態を反転
    (pt as any).select(undefined, true); 
  }
}

// 追加: props.seriesData が変わったらチャートと凡例を更新する
watch(
  () => props.seriesData,
  () => {
    if (!chart) {
      return;
    }
    console.log('ShipTypePie watch seriesData changed');
    chart.update({ series: [{
      data: props.seriesData ?? [],
      type: 'pie',
    }]}, true);
    updateChartLegends();
  },
  { deep: true }
);

</script>

<template>
  <div class="ship-type-pie-root">
    <div class="chart">
      <div ref="chartEl"></div>
    </div>
    <div class="legends-content fixed-grid has-1-cols">
      <div class="grid">
        <b-field class="inputs" position="is-centered">
          <div class="cell" v-for="(legend, index) in legends" :key="index" >
            <b-checkbox-button
              expanded
              :style="getLegendStyle(legend)"
              :class="{ 'is-selected': legend.selected }"
              size="is-small" 
              @click.native="onLegendClick(legend, index)"
              ><span class="legend-content"><span 
                class="legend-label"><span 
                  class="colorbox" 
                  :style="getLegendColorboxStyle(legend)"><CheckOnlyImage 
                    v-if="legend.selected"/></span>{{ getLegendText(legend) }}</span></span>
            </b-checkbox-button>
          </div>
        </b-field>
      </div>
    </div>
  </div>
</template>
