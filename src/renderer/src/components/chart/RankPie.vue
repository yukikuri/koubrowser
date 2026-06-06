<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import Highcharts from 'highcharts';
import * as chartStuff from '@renderer/components/chart/stuff'
import { PieData } from './types';

const props = defineProps<{
  seriesData: PieData[]
  isSmall: boolean
}>();

const pieHeight = 90;
const chartEl = ref<HTMLElement | null>(null);
let chart: Highcharts.Chart | null = null;

function createChart() {
  if (!chartEl.value) return;
  chart = Highcharts.chart({
    chart: {
      renderTo: chartEl.value,
      type: 'pie',
      height: pieHeight,
      backgroundColor: 'transparent',      // 追加: チャート背景を透明に
      plotBackgroundColor: 'transparent',  // 追加: プロット領域背景を透明に
    },
    title: { text: undefined },
    tooltip: { 
      headerFormat: '',
      formatter: function () {
        const p = this.point;
        const name = p.name === '-' ? 'なし' : p.name;
        return `<span>${name}: ${p.y}</span><br/><span>${Highcharts.numberFormat(p.percentage!,2)}%</span>`;
      },
      padding: 4,
    },
    accessibility: { point: { valueSuffix: '%' } },
    plotOptions: {
      pie: {
        size: props.isSmall ? 30 : 45,
        allowPointSelect: false,
        //cursor: 'pointer',
        showInLegend: false, // 凡例非表示
        dataLabels: {
          enabled: true,
          distance: props.isSmall ? -6 : -12, // 負の値で内側に配置。
          style: {
            //fontSize: '12px',
            //color: '#ffffff',
            //textOutline: '0px contrast',
            //fontWeight: 'normal'
          }
        },
      }
    },
    series: [{
      name: '割合',
      data: props.seriesData,
      type: 'pie'
    }],
    credits: { enabled: false }
  });
}

watch(() => props.seriesData, (newVal) => {
  if (chart && chart.series[0]) {
    // 型安全のため any にキャストして更新
    (chart.series[0] as Highcharts.Series).setData(newVal, true);
  } else {
    createChart();
  }
}, { deep: true, immediate: true });

onMounted(() => {
  chartStuff.initialize();
  createChart()
});

onUnmounted(() => {
  if (chart) {
    chart.destroy();
    chart = null;
  }
});
</script>

<template>
  <div ref="chartEl"></div>
</template>
