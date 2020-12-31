<template>
  <div>
    <div>プリセット</div>
    <div v-if="isDataOk">
      <span>プリセット数: {{presetDecks.length}}&nbsp;</span>
      <div v-for="(preset, index) in presetDecks" :key="index">
        <hr />
        <div>api_preset_no:{{preset.api_preset_no}}&nbsp;</div>
        <div>api_name:{{preset.api_name}}&nbsp;</div>
        <div>api_name_id:{{preset.api_name_id}}&nbsp;</div>
        <div>api_ship:{{preset.api_ship}}&nbsp;</div>
        <div
          v-for="(ship_id, index) in preset.api_ship"
          :key="index"
          :ship="ship=shipFromId(ship_id)"
          :mst="mst=mstShip(ship)"
        >
          <span v-if="ship">
            <span>lv:{{ship.api_lv}}&nbsp;</span>
            <span>name:{{mst.api_name}}&nbsp;</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { SvData, ApiShip, MstShip, ApiPresetDeckInfo } from '@/lib/kcs';
import { svdata } from '@/renderer/store/svdata';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class extends Vue {

  private get isDataOk() {
    return svdata.isPresetDeckOk;
  }

  private get presetDecks(): ApiPresetDeckInfo[] {
    let ret: ApiPresetDeckInfo[] = [];
    const preset = svdata.presetDeck;
    if (preset.api_max_num > 0) {
      for (let i = 1; i <= preset.api_max_num; ++i) {
        if (preset.api_deck[i.toString()]) {
          ret.push(preset.api_deck[i.toString()]);
        }
      }
    }
    return ret;
  }

  private shipFromId(ship_id: number): ApiShip | undefined {
    return svdata.ship(ship_id);
  }

  private mstShip(ship: ApiShip): MstShip | undefined {
    if (ship) {
      return svdata.mstShipSafe(ship.api_ship_id);
    }
  }
  
}
</script>

<style lang="scss" scoped>
</style>



