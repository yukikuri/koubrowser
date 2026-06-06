<script setup lang="ts">
import { computed, ref } from 'vue'
import { svdata } from '@renderer/store/svdata'
import { RUtil, DeckInfo } from '@renderer/util'
import Deck from '@renderer/components/Deck.vue'
import ShipTooltip from '@renderer/components/ShipTooltip.vue'
import World from '@renderer/components/World.vue'
import MissionBadge from '@renderer/components/MissionBadge.vue'
import LockImage from '@renderer/assets/img/lock.svg'
import { ApiGaugeType } from '@common/kcs'
import { mapInfo as storeMapInfo } from '@renderer/store/mapinfo'

type Props = { show_rate?: boolean }
withDefaults(defineProps<Props>(), { show_rate: true })

const index = ref(0)
const tooltip_ship_id = ref(0)
const tooltip_ship_show = ref(false)

const isDeckOk = computed(() => svdata.isShipDataOk)
const decks = computed<DeckInfo[]>(() => {
  const ret = RUtil.deckInfos()
  //console.log('DeckPort: update decks decks called', ret[0])
  return ret;
});

const tooltipShipId = computed(() => tooltip_ship_id.value)
const isShowShipTooltip = computed(() => tooltip_ship_show.value)

// 輸送ゲージマップがある場合、輸送値を表示する
// 輸送値は常には表示しない
// 常に表示しないのは、表示が煩雑になることを避けるため
const isShowYusou = computed(() => {
  const svdataMapInfos = svdata.mapinfos;
  if (svdataMapInfos.length) {
    return !!svdata.mapinfos.some(mi => mi.api_gauge_type === ApiGaugeType.yusou)
  }
  return storeMapInfo.api_map_info.some(mi => mi.api_gauge_type === ApiGaugeType.yusou)
})

// todo
// decksの値が更新されても<template #header>でのマスタッシュ構文部分の表示が更新されない
// 以下のように更新したい値をheaderClassで参照すると更新される
// :headerClass="`for-update-${deck.deck.api_id}_${deck.isLock}_${deck.seiku}_${deck.inMission}`"
// b-tab-item更新バグの可能性がある
// または直にメソッドで値取得でも対応できる

// function getSeiku(deckId: number): string {
//   const localDecks = decks.value
//   const deck = localDecks.find(d => d.deck.api_id === deckId)
//   console.log('getSeiku called with deckId:', deckId, deck)
//   return deck ? deck.seiku.toString() : ''
// }

</script>
<template>
  <div v-if="isDeckOk">
    <b-tooltip
      :square="true"
      :animated="false"
      :always="true"
      :active="isShowShipTooltip"
      position="is-bottom"
      type="is-dark"
      class="ship-tool-tip"
    >
      <template #content>
        <ShipTooltip v-if="isShowShipTooltip" :ship_id="tooltipShipId" />
      </template>
      <b-tabs size="is-small" expanded class="deck-tabs" v-model="index">
        <b-tab-item v-for="(deck, deck_index) in decks" :key="deck.deck.api_id"
          :disabled="deck.isLock" :headerClass="`for-update-${deck.deck.api_id}_${deck.isLock}_${deck.seiku}_${deck.inMission}`">
          <template #header>
            <LockImage v-if="deck.isLock" class="is-lock"/>
            {{ deck.name }}
            <MissionBadge v-if="deck.inMission" :deck="deck.deck" />
            <template v-else>
              <div v-if="deck.seiku > 0" title="制空値" class="seiku-wrapper ml-1">
                <div class="seiku">
                  <span class="s-icon seiku"></span>
                  <div class="txt">{{deck.seiku}}</div>
                </div>
              </div>
              <div v-if="isShowYusou && (deck.yusou > 0)" title="輸送値" class="seiku-wrapper ml-1">
                <div class="seiku">
                  <span class="yusou-value">輸送</span>
                  <div class="txt">{{ deck.yusou }}/{{ Math.floor(deck.yusou * 0.7) }}</div>
                </div>
              </div>
            </template>
          </template>
          <div class="deckport">
            <Deck
              v-if="index === deck_index"
              :show_rate="show_rate"
              :deck="deck.deck"
              v-model:tooltip_ship_id="tooltip_ship_id"
              v-model:tooltip_ship_show="tooltip_ship_show"
            />
          </div>
        </b-tab-item>
      </b-tabs>
      <section class="deck-world">
        <World :deck_index="index" />
      </section>
    </b-tooltip>
  </div>
</template>