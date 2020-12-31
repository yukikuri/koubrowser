<template>
  <div>
    <div>遠征一覧</div>
    <div v-if="isDataOk">
      遠征数: {{missions.length}}
      <div v-for="(mission, index) in missions" :key="index" :mst="mst=mstMission(mission)">
        <span>{{mst.api_name}}&nbsp;</span>
        <span>api_mission_id: {{mission.api_mission_id}}&nbsp;</span>
        <span>api_state: {{mission.api_state}}&nbsp;</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { SvData, ApiMission } from '@/lib/kcs';
import { svdata } from '@/renderer/store/svdata';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class extends Vue {

  private get isDataOk() {
    //console.log(svdata.missions.length);
    return svdata.missions.length > 0;
  }

  private get missions() {
    return svdata.missions;
  }

  private mission(mission_id: number) {
    return svdata.mission(mission_id);
  }
  
  private mstMission(mission: ApiMission) {
    if (mission) {
      return svdata.mstMission(mission.api_mission_id);
    }
  }

}

</script>

<style lang="scss" scoped>
</style>
