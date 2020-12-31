<template>
  <div v-if="isDeckOk">
    <b-tooltip 
      :square="true" 
      :animated="false" 
      always="true" 
      :active="isTooltipShipShow" 
      position="is-bottom" 
      type="is-dark"
      class="ship-tool-tip">
      <template slot="content">
        <component v-if="isTooltipShipShow" :is="'ShipTooltip'" :ship_id="tooltipShipId" />
      </template>
      <b-tabs size="is-small" expanded class="deck-tabs" v-model="index">
        <b-tab-item v-for="(deck, idx) in decks" :key="idx">
          <template slot="header">
            {{deck.name}}<MissionBadge v-if="deck.inMission" :deck="deck.deck" />
          </template>
          <div class="deckport">
            <deck v-if="idx===index" :show_rate="show_rate" :deck="deck.deck" 
              :tooltip_ship_id.sync="tooltip_ship_id" :tooltip_ship_show.sync="tooltip_ship_show" />
          </div>
        </b-tab-item>
      </b-tabs>
      <section class="deck-world">
        <World :deck_index="index"/>
      </section>
    </b-tooltip>
  </div>
</template>

<script lang="ts">
import { SvData, ApiDeck, ApiDeckPort } from '@/lib/kcs';
import { svdata } from '@/renderer/store/svdata';
import { RUtil, DeckInfo } from '@/renderer/util';
import { DeckNames } from '@/lib/locale';
import Deck from '@/renderer/components/Deck.vue';
import ShipTooltip from '@/renderer/components/ShipTooltip.vue';
import World from '@/renderer/components/World.vue';
import MissionBadge from '@/renderer/components/MissionBadge.vue';
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({
  components: {
    Deck,
    MissionBadge,
    World,
    ShipTooltip,
  },
})
export default class extends Vue {

  @Prop({default: true})
  public show_rate!: boolean;

  private index: number = 0;
  
  private get isDeckOk() {
    return svdata.isShipDataOk;
  }

  private get decks(): DeckInfo[] {
    return RUtil.deckInfos();
  }

  private updated() {
    console.debug('deck updated', this.tooltip_ship_id, this.tooltip_ship_show);
  }

  private tooltip_ship_id: number = 0;
  private tooltip_ship_show: boolean = false;
  private get tooltipShipId(): number {
    //return 100;
    return this.tooltip_ship_id;
  }

  private get isTooltipShipShow(): boolean {
    //return true;
    return this.tooltip_ship_show;
  }

}
</script>
