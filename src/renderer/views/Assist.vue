<template>
  <div class="assist-root">
    <b-tabs type="is-toggle" size="is-small" class="assist-tabs" expanded v-model="index">
      <b-tab-item label="編成">
        <component v-if="index===0 && isDataOk" :is="'DeckPort'" />
        <component v-else-if="index===0" :is="'Invalid'" />
      </b-tab-item>
      <b-tab-item label="海域">
        <component v-if="index===1 && isDataOk" :is="'WorldTab'" />
        <component v-else-if="index===1" :is="'Invalid'" />
      </b-tab-item>
      <b-tab-item label="艦隊/装備/アイテム">
        <component v-if="index===2 && isDataOk" :is="'ShipItems'" />
        <component v-else-if="index===2" :is="'Invalid'" />
      </b-tab-item>
      <b-tab-item label="任務/ドック">
        <div v-if="index===3 && isDataOk">
          <div class="assist-dock">
            <div><NDockList/></div>
            <div><KDockList/></div>
          </div>
          <div><QuestList/></div>
        </div>
        <component v-else-if="index===3" :is="'Invalid'" />
      </b-tab-item>
      <b-tab-item label="記録"><router-link to="/record"></router-link>
        <component v-if="index===4" :is="'Invalid'" :message="'資材グラフ表示など：未実装です'"/>
      </b-tab-item>
      <b-tab-item label="情報">
        <div class="assist-about" v-if="index===5">
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
