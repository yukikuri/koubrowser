<template>
  <div class="assist-root">
    <b-tabs type="is-toggle" size="is-small" class="assist-tabs" expanded v-model="index" destroy-on-hide>
      <b-tab-item label="編成">
        <component v-if="isDataOk" :is="'DeckPort'" />
        <component v-else :is="'Invalid'" />
      </b-tab-item>
      <b-tab-item label="海域">
        <component v-if="isDataOk" :is="'WorldTab'" />
        <component v-else :is="'Invalid'" />
      </b-tab-item>
      <b-tab-item label="艦隊/装備/アイテム">
        <component v-if="isDataOk" :is="'ShipItems'" />
        <component v-else :is="'Invalid'" />
      </b-tab-item>
      <b-tab-item label="任務/ドック">
        <div v-if="isDataOk">
          <div class="assist-dock">
            <div><NDockList/></div>
            <div><KDockList/></div>
          </div>
          <div><QuestList/></div>
        </div>
        <component v-else :is="'Invalid'" />
      </b-tab-item>
      <b-tab-item label="資源記録">
        <component v-if="isDataOk" :is="'chart-material'" />
        <component v-if="isDataOk" :is="'chart-kit'" />
        <component v-if="!isDataOk" :is="'Invalid'" />
      </b-tab-item>
      <b-tab-item label="情報">
        <div class="assist-about">
          <about/>
        </div>
      </b-tab-item>
    </b-tabs>
  </div>
</template>
<script lang="ts">
import { ipcRenderer } from 'electron';
import { replaceArray } from '@/lib/ts';
import { MainChannel, IpcSvData } from '@/lib/app';
import { svdata } from '@/renderer/store/svdata';
import { quests } from '@/renderer/store/quests';
import DeckPort from '@/renderer/components/DeckPort.vue';
import WorldTab from '@/renderer/components/WorldTab.vue';
import ShipItems from '@/renderer/components/ShipItems.vue';
import NDockList from '@/renderer/components/NDockList.vue';
import KDockList from '@/renderer/components/KDockList.vue';
import QuestList from '@/renderer/components/QuestList.vue';
import About from '@/renderer/components/About.vue';
import Invalid from '@/renderer/components/Invalid.vue';
import ChartMaterial from '@/renderer/components/chart/material.vue';
import ChartKit from '@/renderer/components/chart/kit.vue';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: {
    DeckPort,
    WorldTab,
    ShipItems,
    NDockList,
    KDockList,
    QuestList,
    About,
    Invalid,
    ChartMaterial,
    ChartKit,
  },
})
export default class extends Vue {
  private index: number = 0;

  private mounted(): void {
    console.log('assist root mounted href:', window.location.href);
    ipcRenderer.invoke(MainChannel.get_sv_data).then((data: IpcSvData) => {
      svdata.setFromJson(data.json_sv_data);
      replaceArray(quests.list, data.quests);
    });
  }

  private get isDataOk(): boolean {
    return svdata.isMstDataOk;
  }
}
</script>
