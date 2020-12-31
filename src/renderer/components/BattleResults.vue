<template>
  <div>
    <div>海域戦闘リポート：</div>  
    <div v-if="isBattleMapInfoOk">
      <span>海域名：{{battleMapText}}&nbsp;</span>
    </div>
    <div v-if="isBattleResultOk">
      <span>ランク: {{battleResultRankText}}</span> <span>{{battleResultGetShipText}}</span>
    </div>
    <!--
    <hr>
    <div>演習結果：</div>
    <div v-if="isPracticeBattleResultOk">
      <span>ランク： {{practiceBattleResult.api_win_rank}}&nbsp;</span>
    </div>
    -->
  </div>
</template>

<script lang="ts">
import { SvData, MstMapinfo, ApiBattleGetShip, ApiPracticeBattleResult } from "@/lib/kcs";
import { svdata } from "@/renderer/store/svdata";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {},
})
export default class extends Vue {

  get isBattleMapInfoOk() {
    return svdata.mapStartOk;
  }

  get battleMapText(): string {
    /*
    const mapinfo = svdata.battleMapinfo;
    if (mapinfo) {
      return mapinfo.api_maparea_id+'-'+mapinfo.api_no+' '+mapinfo.api_name+' '+mapinfo.api_opetext;
    }
    */
    return '';
  }

  get isBattleResultOk(): boolean {
    return false;//svdata.isSortieBattleResultOk || svdata.isCombinedBattleResultOk;
  }

  get battleResultGetShipText(): string {
    /*
    let shipData: ApiBattleGetShip | undefined;
    if (svdata.isSortieBattleResultOk) {
      shipData = svdata.sortieBattleresult.api_get_ship;
    }
    if (svdata.isCombinedBattleResultOk) {
      shipData = svdata.combinedBattleResult.api_get_ship;
    }
    if (! shipData || ! shipData.api_ship_id) {
      return '';
    }
    return shipData.api_ship_type+ ' '+shipData.api_ship_name;
    */
   return '';
  }

  get battleResultRankText(): string {
    /*
    if (svdata.isSortieBattleResultOk) {
      return svdata.sortieBattleresult.api_win_rank;
    }
    if (svdata.isCombinedBattleResultOk) {
      return svdata.combinedBattleResult.api_win_rank;
    }
    */
    return '';
  }

  get isPracticeBattleResultOk(): boolean {
    return false;//svdata.isPracticeBattleResultOk;
  }

  /*
  get practiceBattleResult(): ApiPracticeBattleResult {
    return svdata.practiceBattleResult;
  }
  */

}
</script>
