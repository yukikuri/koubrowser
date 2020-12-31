<template>
  <section class="kdock-content">
    <div class="kdock-title">建造ドック</div>
    <div class="kdock-list">
      <div v-for="(info, index) in kdocks" :key="index"  class="kdock">
        <div v-if="info.isUse">
          <span class="kdock-img-wrapper">
            <img class="kdock-banner" :src="info.shipBanner">
            <span class="kdock-img-help"><dock-state-timer :complete_time="info.kdock.api_complete_time" :progress_text="'建造'" :completed_text="'完成'"/></span>
          </span>
          <span class="kdock-info">
            <span class="kdock-info-item"><span v-if="info.isLargeFlag">大型建造: </span>{{info.mst.api_name}}</span>
            <span class="kdock-info-item">残り: <dock-timer :complete_time="info.kdock.api_complete_time"/> {{info.completedTimeText}}</span>
          </span>
        </div>
        <div v-else-if="info.locked"><span class="kdock-locked"><LockImage/></span></div>
        <div v-else><span class="kdock-empty">Empty</span></div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { ApiKDock, ApiKDockState, MstShip } from '@/lib/kcs';
import { svdata } from '@/renderer/store/svdata';
import LockImage from '@/renderer/assets/lock.svg';
import { RUtil } from '@/renderer/util';
import DockTimer from '@/renderer/components/DockTimer.vue';
import DockStateTimer from '@/renderer/components/DockStateTimer.vue';
import { Component, Vue } from 'vue-property-decorator';
import moment from 'moment';

interface KDockInfo {
  isUse: boolean;
  locked: boolean;
  kdock: ApiKDock;
  shipBanner: string;
  isLargeFlag: boolean;
  mst: MstShip | undefined;
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
    console.log('kdock mounted');
  }

  private get kdocks(): KDockInfo[] {
    const kdocks = svdata.kdocks;

    const ret = kdocks.map<KDockInfo>((kdock) => {
      let isUse: boolean = false;
      const locked = kdock.api_state === ApiKDockState.locked;
      let mst;
      let shipBanner = '';
      let completedTimeText = '';
      const isLargeFlag = kdock.api_item1 >= 1000;
      if (kdock.api_state === ApiKDockState.inProgress || kdock.api_state === ApiKDockState.completed) {
        isUse = true;
        mst = svdata.mstShip(kdock.api_created_ship_id);
        if (mst) {
          shipBanner = RUtil.shipBannerImg(mst.api_id, false);
          if (kdock.api_state === ApiKDockState.inProgress) {
            const date = moment(kdock.api_complete_time);
            completedTimeText = '('+date.format('MM/DD HH:mm:ss')+')';
          }
        }
      }
      return {
        isUse, locked, kdock, shipBanner, isLargeFlag, mst, completedTimeText
      };
    });
    return ret;
  }
}
</script>
