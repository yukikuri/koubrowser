<template>
  <div>
    <div v-if="isDeckOk">
      <b-tabs size="is-small" expanded class="deck-tabs" v-model="index" destroy-on-hide>
        <b-tab-item v-for="(deck, idx) in decks" :key="idx">
          <template slot="header">
            {{deck.name}}<MissionBadge v-if="deck.inMission" :deck="deck.deck" />
          </template>
          <div class="deckport">
            <component :is="'Deck'" :show_rate="show_rate" :deck="deck.deck"/>
          </div>
        </b-tab-item>
      </b-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { SvData, ApiDeck, ApiDeckPort } from '@/lib/kcs';
import { svdata } from '@/renderer/store/svdata';
import { RUtil, DeckInfo } from '@/renderer/util';
import { DeckNames } from '@/lib/locale';
import Deck from '@/renderer/components/Deck.vue';
import MissionBadge from '@/renderer/components/MissionBadge.vue';
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({
  components: {
    Deck,
    MissionBadge,
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
}
</script>
