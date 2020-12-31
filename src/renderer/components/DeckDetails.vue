<template>
  <div v-if="isDeckOk">
    <b-tabs size="is-small" expanded class="deck-tabs" v-model="index">
      <b-tab-item v-for="(deck, idx) in decks" :key="idx">
        <template slot="header">
          {{deck.name}}<MissionBadge v-if="deck.inMission" :deck="deck.deck" />
        </template>
        <div class="deck-detail">
          <component v-if="idx===index" :is="'DeckDetail'" :deck="deck.deck"/>
        </div>
      </b-tab-item>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import { SvData, ApiDeck, ApiDeckPort, MissionState } from '@/lib/kcs';
import { svdata } from '@/renderer/store/svdata';
import { DeckNames } from '@/lib/locale';
import DeckDetail from '@/renderer/components/DeckDetail.vue';
import MissionBadge from '@/renderer/components/MissionBadge.vue';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { RUtil, DeckInfo  } from '@/renderer/util';

@Component({
  components: {
    DeckDetail,
    MissionBadge,
  },
})
export default class extends Vue {

  private index: number = 0;
  
  private get isDeckOk() {
    return svdata.isShipDataOk;
  }

  private get decks(): DeckInfo[] {
    return RUtil.deckInfos();
  }
}
</script>
