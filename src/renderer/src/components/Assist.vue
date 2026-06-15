<script setup lang="ts">
import DeckPort from '@renderer/components/DeckPort.vue'
import MissionCheck from '@renderer/components/MissionCheck.vue';
import BattleTab from '@renderer/components/BattleTab.vue';
import ShipItems from '@renderer/components/ShipItems.vue';
import DropByMap from '@renderer/components/DropByMap.vue'
import DropByShip from '@renderer/components/DropByShip.vue'
import NDockList from '@renderer/components/NDockList.vue';
import KDockList from '@renderer/components/KDockList.vue';
import QuestList from '@renderer/components/QuestList.vue';
import About from '@renderer/components/About.vue'
import { onMounted, ref, computed } from 'vue'
import ChartMaterial from '@renderer/components/chart/Material.vue'
import ChartKit from '@renderer/components/chart/Kit.vue'
import Invalid from '@renderer/components/Invalid.vue'
import { EnvRenderer } from '@renderer/common/env-renderer';
import type { PortChartData } from '@common/record'
import { isAppReady } from '@renderer/stuff/app_ready';
import { AssistTabName, AssistUIState as us } from '@renderer/store/ui_state'
import { watch } from 'vue'

// Vue のテンプレートで v-model するため、namespace import から top-level ref として受け直す。
const assistTabIndex = us.assistTabIndex
const assistTabRequest = us.assistTabRequest
const chartMaterial = ref<InstanceType<typeof ChartMaterial> | null>(null)
const chartKit = ref<InstanceType<typeof ChartKit> | null>(null)
let chartRecordFetching = false;

onMounted(() => {
  console.log('assist root mounted href:', 
    window.location.href, 'EnvIsAssist:', EnvRenderer.isAssist, assistTabIndex.value)
})

const isDockQuestlistTabVisible = computed<boolean>(() => {
  console.log('isDockQuestlistShowTab:', EnvRenderer.isAssist)
  return EnvRenderer.isAssist
})

const isTabVisibleByName = (tabName: AssistTabName): boolean => {
  return us.isTabVisibleByName(tabName)
}

function onTabChange(valueNew: number): void {
  console.log('assist tab index updated:', 'old:', assistTabIndex.value, 'new:',valueNew);

  const tabName = us.getTabName(valueNew)
  if (tabName) {
    us.saveTabName(tabName)
  }

  // if chart tab is selected, get record
  if (us.isTabVisibleByName('chart')) {
    console.log('fetch port record for chart');
    fetchPortRecordForChart()
    return
  }
} 

watch(assistTabRequest, (tabName) => {
  if (!tabName) {
    return
  }
  const tabIndex = us.tabOrder.indexOf(tabName)
  if (tabIndex !== -1) {
    assistTabIndex.value = tabIndex
    onTabChange(tabIndex)
  }
  assistTabRequest.value = null
})

function fetchPortRecordForChart(): void {
  if (chartRecordFetching) {
    console.log('chart record fetching skipped. already fetching');
    return
  }
  chartRecordFetching = true;
  window.api.calcPortChartData().then((data: PortChartData) => {
    console.log('port record for chart fetched. chart tab visible:', us.isTabVisibleByName('chart'));
    chartRecordFetching = false;
    if (us.isTabVisibleByName('chart')) {
      chartMaterial.value?.drawChart(data.materials)
      chartKit.value?.drawChart(data.kits)
    }
  })  
}
</script>

<template>
  <div class="assist-root">
    <!-- todo: destroy-on-hideを指定するとアニメーションが効かない。 
     destroy-on-hideを指定せずv-ifでコンポーネントを有効とすることで回避可能 -->
    <b-tabs type="is-toggle" 
      size="is-small" class="assist-tabs" expanded 
      v-model="assistTabIndex"
      @update:modelValue="onTabChange" 
      >
      <b-tab-item>
        <template #header>
          <span>編成</span>
        </template>
        <DeckPort v-if="isAppReady && isTabVisibleByName('deckport')" />
        <Invalid v-if="!isAppReady && isTabVisibleByName('deckport')" />
      </b-tab-item>
      <b-tab-item headerClass="tab-with-title">
        <template #header>
          <div class="tab-content">
            <div class="main-title">遠征</div>
            <div class="main-title">チェック</div>
          </div>
        </template>
        <MissionCheck v-if="isAppReady && isTabVisibleByName('missioncheck')" />
        <Invalid v-if="!isAppReady && isTabVisibleByName('missioncheck')" />
      </b-tab-item>
      <b-tab-item headerClass="tab-with-title">
        <template #header>
          <div class="tab-content">
            <div class="main-title">戦果</div>
            <div class="main-title">戦闘履歴</div>
          </div>
        </template>
        <BattleTab v-if="isAppReady && isTabVisibleByName('battletab')" />
        <Invalid v-if="!isAppReady && isTabVisibleByName('battletab')" />
      </b-tab-item>
      <b-tab-item headerClass="tab-with-title">
        <template #header>
          <div class="tab-content">
            <div class="main-title">艦隊/装備</div>
            <div class="main-title">アイテム</div>
          </div>
        </template>
        <ShipItems v-if="isAppReady && isTabVisibleByName('shipitems')" />
        <Invalid v-if="!isAppReady && isTabVisibleByName('shipitems')" />
      </b-tab-item>
      <b-tab-item headerClass="tab-with-subtitle">
        <template #header>
          <div class="tab-content">
            <div class="main-title">ドロップ履歴</div>
            <div class="sub-title">（マップ別）</div>
          </div>
        </template>
        <DropByMap v-if="isAppReady && isTabVisibleByName('dropbymap')" />
        <Invalid v-if="!isAppReady && isTabVisibleByName('dropbymap')" />
      </b-tab-item>
      <b-tab-item headerClass="tab-with-subtitle" >
        <template #header>
          <div class="tab-content">
            <div class="main-title">ドロップ履歴</div>
            <div class="sub-title">（艦名別）</div>
          </div>
        </template>
        <DropByShip v-if="isAppReady && isTabVisibleByName('dropbyship')" />
        <Invalid v-if="!isAppReady && isTabVisibleByName('dropbyship')" />
      </b-tab-item>
      <b-tab-item headerClass="tab-with-title" v-if="isDockQuestlistTabVisible">
        <template #header>
          <div class="tab-content">
            <div class="main-title">任務</div>
            <div class="main-title">ドック</div>
          </div>
        </template>
        <div v-if="isAppReady && isTabVisibleByName('dockquestlist')">
          <div class="assist-dock">
            <div><NDockList/></div>
            <div><KDockList/></div>
          </div>
          <div><QuestList/></div>
        </div>
        <Invalid v-if="!isAppReady && isTabVisibleByName('dockquestlist')" />
      </b-tab-item>
      <b-tab-item headerClass="tab-with-title">
        <template #header>
          <div class="tab-content">
            <div class="main-title">資源</div>
            <div class="main-title">記録</div>
          </div>
        </template>
        <ChartMaterial v-if="isAppReady && isTabVisibleByName('chart')" ref="chartMaterial"/>
        <ChartKit v-if="isAppReady && isTabVisibleByName('chart')" ref="chartKit" />
        <Invalid v-if="!isAppReady && isTabVisibleByName('chart')" />
      </b-tab-item>
      <b-tab-item headerClass="tab-with-title">
        <template #header>
          <div class="tab-content">
            <div class="main-title">アプリ</div>
            <div class="main-title">情報</div>
          </div>
        </template>
        <div v-if="isTabVisibleByName('about')" class="assist-about">
          <About />
        </div>
      </b-tab-item>
    </b-tabs>
  </div>
</template>
