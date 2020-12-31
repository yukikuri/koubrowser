<template>
  <section class="ndock-content">
    <div class="ndock-title">入渠ドック</div>
    <div class="ndock-list">
      <div v-for="(info, index) in ndocks" :key="index" class="ndock">
        <div v-if="info.isIn">
          <span class="ndock-img-wrapper">
            <img class="ndock-banner" :src="info.shipBanner">
            <span class="ndock-img-help"><dock-state-timer :complete_time="info.ndock.api_complete_time" :progress_text="'修復'" :completed_text="'完了'"/></span>
          </span>
          <span class="ndock-info">
            <span class="ndock-info-item">Lv {{info.info.api.api_lv}} {{info.info.mst.api_name}} {{info.info.api.api_nowhp}}/{{info.info.api.api_maxhp}}</span>
            <span class="ndock-info-item">残り: <dock-timer :complete_time="info.ndock.api_complete_time"/> {{info.completedTimeText}}</span>
          </span>
        </div>
        <div v-else-if="info.locked"><span class="ndock-locked"><LockImage/></span></div>
        <div v-else><span class="ndock-empty">Empty</span></div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { ApiMission, ApiNDock, ShipInfo, ApiNDockState } from '@/lib/kcs';
import { svdata } from '@/renderer/store/svdata';
import LockImage from '@/renderer/assets/lock.svg';
import { RUtil } from '@/renderer/util';
import DockTimer from '@/renderer/components/DockTimer.vue';
import DockStateTimer from '@/renderer/components/DockStateTimer.vue';
import { Component, Vue } from 'vue-property-decorator';
import moment from 'moment';

interface NDockInfo {
  isIn: boolean;
  locked: boolean;
  ndock: ApiNDock;
  shipBanner: string;
  info: ShipInfo | undefined;
  completedTimeText: string;
}

@Component({
  components: {
    LockImage,
    DockTimer,
    DockStateTimer,
  },
})
export default class extends Vue {

  private mounted(): void {
    console.log('ndock mounted');
  }

  private get ndocks(): NDockInfo[] {
    const ndocks = svdata.ndocks;

    const ret = ndocks.map<NDockInfo>((ndock) => {
      let isIn: boolean = false;
      const locked = ndock.api_state === ApiNDockState.locked;
      let info;
      let shipBanner = '';
      let completedTimeText = '';
      if (ndock.api_state === ApiNDockState.in) {
        isIn = true;
        info = svdata.shipInfo(ndock.api_ship_id);
        if (info) {
          shipBanner = RUtil.shipBannerImg(info.mst.api_id, false);
          const date = moment(ndock.api_complete_time);
          completedTimeText = '('+date.format('MM/DD HH:mm:ss')+')';
        }
      }
      return {
        isIn, locked, ndock, shipBanner, info, completedTimeText
      };
    });
    return ret;
  }
}
</script>
